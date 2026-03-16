import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import crypto from "crypto";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.* FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

// Generate TOTP secret (base32 encoded)
function generateSecret(): string {
  const bytes = crypto.randomBytes(20);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    result += alphabet[bytes[i] % 32];
  }
  return result;
}

// Generate TOTP code from secret at given time
function generateTOTP(secret: string, time?: number): string {
  const t = Math.floor((time || Date.now()) / 30000);
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(0, 0);
  buffer.writeUInt32BE(t, 4);

  // Decode base32 secret
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of secret.toUpperCase()) {
    const val = alphabet.indexOf(c);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const keyBytes = Buffer.alloc(Math.floor(bits.length / 8));
  for (let i = 0; i < keyBytes.length; i++) {
    keyBytes[i] = parseInt(bits.substr(i * 8, 8), 2);
  }

  const hmac = crypto.createHmac("sha1", keyBytes).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24 | hmac[offset + 1] << 16 | hmac[offset + 2] << 8 | hmac[offset + 3]) % 1000000;
  return code.toString().padStart(6, "0");
}

// Generate backup codes
function generateBackupCodes(): string[] {
  return Array.from({ length: 8 }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase().match(/.{4}/g)!.join("-")
  );
}

// POST — setup 2FA (generate secret + QR URL)
export async function POST() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (user.totp_enabled) {
    return NextResponse.json({ error: "already_enabled", message: "2FA is already enabled." }, { status: 400 });
  }

  const secret = generateSecret();
  const sql = getDb();

  // Store secret temporarily (not enabled yet until verified)
  await sql`UPDATE users SET totp_secret = ${secret} WHERE id = ${user.id}`;

  // OTPAuth URL for authenticator apps
  const otpUrl = `otpauth://totp/HireACreator:${encodeURIComponent(user.email)}?secret=${secret}&issuer=HireACreator&digits=6&period=30`;

  return NextResponse.json({
    secret,
    otpUrl,
    // QR code can be generated client-side from otpUrl
  });
}

// PATCH — verify and enable 2FA
export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { code } = body;

  if (!code || !user.totp_secret) {
    return NextResponse.json({ error: "invalid", message: "Set up 2FA first, then enter the code from your authenticator." }, { status: 400 });
  }

  // Check code with 30-second window (current + previous + next)
  const now = Date.now();
  const validCodes = [
    generateTOTP(user.totp_secret, now - 30000),
    generateTOTP(user.totp_secret, now),
    generateTOTP(user.totp_secret, now + 30000),
  ];

  if (!validCodes.includes(code)) {
    return NextResponse.json({ error: "wrong_code", message: "Invalid code. Make sure your authenticator is synced." }, { status: 400 });
  }

  const backupCodes = generateBackupCodes();
  const sql = getDb();
  await sql`
    UPDATE users SET
      totp_enabled = true,
      totp_backup_codes = ${backupCodes},
      updated_at = NOW()
    WHERE id = ${user.id}
  `;

  return NextResponse.json({ success: true, backupCodes });
}

// DELETE — disable 2FA
export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { code } = body;

  if (!user.totp_enabled || !user.totp_secret) {
    return NextResponse.json({ error: "not_enabled" }, { status: 400 });
  }

  // Verify code or backup code
  const now = Date.now();
  const validCodes = [
    generateTOTP(user.totp_secret, now - 30000),
    generateTOTP(user.totp_secret, now),
    generateTOTP(user.totp_secret, now + 30000),
  ];

  const backupCodes: string[] = user.totp_backup_codes || [];
  const isBackupCode = backupCodes.includes(code);

  if (!validCodes.includes(code) && !isBackupCode) {
    return NextResponse.json({ error: "wrong_code", message: "Invalid code." }, { status: 400 });
  }

  const sql = getDb();
  await sql`
    UPDATE users SET
      totp_enabled = false,
      totp_secret = NULL,
      totp_backup_codes = NULL,
      updated_at = NOW()
    WHERE id = ${user.id}
  `;

  return NextResponse.json({ success: true });
}
