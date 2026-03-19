import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

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

export async function POST() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sql = getDb();
  const missing: string[] = [];

  // 1. Email verified
  if (!user.email_verified) {
    missing.push("Verify your email address");
  }

  // 2. At least 1 social with 100+ followers
  const socials = await sql`
    SELECT * FROM social_connections WHERE user_id = ${user.id} AND follower_count >= 100
  `;
  if (socials.length === 0) {
    missing.push("Connect at least 1 social account with 100+ followers");
  }

  // 3. Profile photo
  if (!user.avatar_url) {
    missing.push("Upload a profile photo");
  }

  // 4. Bio (min 50 chars)
  if (!user.bio || String(user.bio).length < 50) {
    missing.push("Write a bio (minimum 50 characters)");
  }

  // 5. At least 1 service
  const services = await sql`
    SELECT id FROM services WHERE user_id = ${user.id} AND is_active = TRUE LIMIT 1
  `;
  if (services.length === 0) {
    missing.push("Add at least 1 service");
  }

  if (missing.length > 0) {
    return NextResponse.json({ verified: false, missing });
  }

  // All requirements met — auto-verify
  await sql`
    UPDATE users SET
      verification_status = 'verified',
      is_verified = TRUE,
      verification_submitted_at = NOW(),
      updated_at = NOW()
    WHERE id = ${user.id}
  `;

  return NextResponse.json({ verified: true, missing: [] });
}
