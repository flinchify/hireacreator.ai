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

// POST — send verification email (or mark as verified for Google OAuth users)
export async function POST() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (user.email_verified) {
    return NextResponse.json({ error: "already_verified", message: "Email is already verified." }, { status: 400 });
  }

  const sql = getDb();

  // If user signed up via Google OAuth, auto-verify (Google already verified the email)
  // Check if they have any Google-based session
  const googleUser = user.avatar_url?.includes("googleusercontent.com");
  if (googleUser) {
    await sql`UPDATE users SET email_verified = true, email_verified_at = NOW(), updated_at = NOW() WHERE id = ${user.id}`;
    return NextResponse.json({ success: true, autoVerified: true });
  }

  // Generate verification token
  const token = crypto.randomBytes(32).toString("hex");
  await sql`
    INSERT INTO email_verifications (user_id, token)
    VALUES (${user.id}, ${token})
  `;

  // TODO: Send email via Resend when configured
  // For now, return the token (in production, this would be emailed)
  return NextResponse.json({
    success: true,
    message: "Verification email sent. Check your inbox.",
    // Remove this in production:
    _devToken: process.env.NODE_ENV !== "production" ? token : undefined,
  });
}

// PATCH — verify with token
export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { token } = body;

  if (!token) {
    return NextResponse.json({ error: "missing_token" }, { status: 400 });
  }

  const sql = getDb();
  const rows = await sql`
    SELECT * FROM email_verifications
    WHERE token = ${token} AND used = false AND expires_at > NOW()
    LIMIT 1
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "invalid_token", message: "Invalid or expired verification link." }, { status: 400 });
  }

  const verification = rows[0];
  await sql`UPDATE email_verifications SET used = true WHERE id = ${verification.id}`;
  await sql`UPDATE users SET email_verified = true, email_verified_at = NOW(), updated_at = NOW() WHERE id = ${verification.user_id}`;

  return NextResponse.json({ success: true });
}
