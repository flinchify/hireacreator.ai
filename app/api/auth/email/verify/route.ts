import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, code } = body;

  if (!email || !code) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();
  const sql = getDb();

  // Find valid code
  const codes = await sql`
    SELECT * FROM auth_codes
    WHERE email = ${cleanEmail} AND code = ${code} AND used = false AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (codes.length === 0) {
    return NextResponse.json({ error: "invalid_code", message: "Invalid or expired code." }, { status: 400 });
  }

  const authCode = codes[0];

  // Mark code as used
  await sql`UPDATE auth_codes SET used = true WHERE id = ${authCode.id}`;

  // Find or create user
  let users = await sql`SELECT * FROM users WHERE email = ${cleanEmail}`;

  if (users.length === 0) {
    // Create new user
    const slug = cleanEmail.split("@")[0].replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 30)
      + "-" + crypto.randomBytes(4).toString("hex");
    const refCode = slug.split("-")[0] || crypto.randomBytes(4).toString("hex");

    users = await sql`
      INSERT INTO users (email, slug, role, email_verified, email_verified_at, referral_code)
      VALUES (${cleanEmail}, ${slug}, ${authCode.role || 'creator'}, true, NOW(), ${refCode})
      RETURNING *
    `;

    // Attribute referral if cookie exists
    const refCookie = cookies().get("hca_ref")?.value;
    if (refCookie) {
      const referrer = await sql`SELECT id FROM users WHERE referral_code = ${refCookie} AND id != ${users[0].id}`;
      if (referrer.length > 0) {
        await sql`UPDATE users SET referred_by = ${referrer[0].id} WHERE id = ${users[0].id}`;
        await sql`
          INSERT INTO referrals (referrer_id, referred_id, status, commission_percent, expires_at)
          VALUES (${referrer[0].id}, ${users[0].id}, 'signed_up', 20, NOW() + INTERVAL '12 months')
          ON CONFLICT DO NOTHING
        `;
      }
      cookies().delete("hca_ref");
    }
  } else {
    // Mark email as verified since they proved ownership
    await sql`
      UPDATE users SET email_verified = true, email_verified_at = COALESCE(email_verified_at, NOW()), updated_at = NOW()
      WHERE id = ${users[0].id}
    `;
  }

  const user = users[0];

  // Check if banned
  if (user.is_banned) {
    return NextResponse.json({ error: "banned", message: "Your account has been suspended." }, { status: 403 });
  }

  // Create session
  const sessionToken = crypto.randomBytes(32).toString("hex");
  await sql`
    INSERT INTO auth_sessions (user_id, token, expires_at)
    VALUES (${user.id}, ${sessionToken}, NOW() + INTERVAL '30 days')
  `;

  // Set cookie
  cookies().set("session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return NextResponse.json({
    success: true,
    isNewUser: !user.full_name,
    user: {
      id: user.id,
      email: user.email,
      name: user.full_name,
      slug: user.slug,
      role: user.role,
    },
  });
}
