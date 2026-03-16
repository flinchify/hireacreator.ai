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

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, s, 100000, 64, "sha512").toString("hex");
  return { hash: `${s}:${hash}`, salt: s };
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const result = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(result, "hex"));
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { currentPassword, newPassword } = body;

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: "weak_password", message: "Password must be at least 8 characters." }, { status: 400 });
  }

  if (newPassword.length > 128) {
    return NextResponse.json({ error: "too_long", message: "Password too long." }, { status: 400 });
  }

  // Check password strength
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  if (!hasUpper || !hasLower || !hasNumber) {
    return NextResponse.json({ error: "weak_password", message: "Password must contain uppercase, lowercase, and a number." }, { status: 400 });
  }

  // If user already has a password, verify current
  if (user.password_hash) {
    if (!currentPassword) {
      return NextResponse.json({ error: "current_required", message: "Current password is required." }, { status: 400 });
    }
    const valid = verifyPassword(currentPassword, user.password_hash);
    if (!valid) {
      // Log failed attempt
      const sql = getDb();
      const ip = request.headers.get("x-forwarded-for") || "unknown";
      await sql`INSERT INTO login_attempts (email, ip_address, success) VALUES (${user.email}, ${ip}, false)`;
      return NextResponse.json({ error: "wrong_password", message: "Current password is incorrect." }, { status: 400 });
    }
  }

  const { hash } = hashPassword(newPassword);
  const sql = getDb();
  await sql`UPDATE users SET password_hash = ${hash}, updated_at = NOW() WHERE id = ${user.id}`;

  return NextResponse.json({ success: true });
}
