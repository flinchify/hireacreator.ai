import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens, getGoogleUser } from "@/lib/google-auth";
import { getDb } from "@/lib/db";
import { checkLoginRateLimit, checkIpRateLimit } from "@/lib/login-rate-limit";

export async function GET(request: Request) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  if (!checkIpRateLimit(ip)) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}?auth_error=rate_limited`);
  }
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Handle denied access
  if (error) {
    return NextResponse.redirect(`${appUrl}?auth_error=access_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}?auth_error=missing_params`);
  }

  // Validate state
  const storedState = cookies().get("oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}?auth_error=invalid_state`);
  }

  // Clean up state cookie
  cookies().delete("oauth_state");

  // Parse role from state
  let role = "creator";
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString());
    role = parsed.role || "creator";
  } catch {
    // default to creator
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);
    const googleUser = await getGoogleUser(tokens.access_token);

    if (!googleUser.email) {
      return NextResponse.redirect(`${appUrl}?auth_error=no_email`);
    }

    const sql = getDb();

    // Check if user exists
    const existing = await sql`
      SELECT id, email, full_name, slug, role FROM users WHERE email = ${googleUser.email}
    `;

    let userId: string;
    let isNewUser = false;

    if (existing.length > 0) {
      // Existing user — log them in
      userId = existing[0].id;

      // Update avatar if they don't have one
      if (googleUser.picture) {
        await sql`
          UPDATE users SET avatar_url = COALESCE(avatar_url, ${googleUser.picture}), updated_at = NOW()
          WHERE id = ${userId}
        `;
      }
    } else {
      // New user — create account
      isNewUser = true;
      const slug = googleUser.email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 50) + "-" + Date.now().toString(36);

      // Generate referral code
      const refCode = slug.split("-")[0] || Math.random().toString(36).slice(2, 8);

      const result = await sql`
        INSERT INTO users (email, full_name, slug, avatar_url, role, referral_code)
        VALUES (${googleUser.email}, ${googleUser.name || googleUser.email.split("@")[0]}, ${slug}, ${googleUser.picture || null}, ${role}, ${refCode})
        RETURNING id
      `;
      userId = result[0].id;

      // Attribute referral if cookie exists
      const refCookie = cookies().get("hca_ref")?.value;
      if (refCookie) {
        const referrer = await sql`SELECT id FROM users WHERE referral_code = ${refCookie} AND id != ${userId}`;
        if (referrer.length > 0) {
          await sql`UPDATE users SET referred_by = ${referrer[0].id} WHERE id = ${userId}`;
          await sql`
            INSERT INTO referrals (referrer_id, referred_id, status, commission_percent, expires_at)
            VALUES (${referrer[0].id}, ${userId}, 'signed_up', 20, NOW() + INTERVAL '12 months')
            ON CONFLICT DO NOTHING
          `;
        }
        cookies().delete("hca_ref");
      }
    }

    // Create session
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await sql`
      INSERT INTO auth_sessions (user_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
    `;

    // Set session cookie
    cookies().set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    // Redirect — new users to profile setup, existing to browse
    const redirectTo = isNewUser ? `${appUrl}?welcome=true` : appUrl;
    return NextResponse.redirect(redirectTo);

  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(`${appUrl}?auth_error=server_error`);
  }
}
