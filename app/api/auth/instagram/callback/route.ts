import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

/**
 * GET /api/auth/instagram/callback — Handle Instagram OAuth callback
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/claim?error=instagram_denied", req.url));
  }

  const clientId = process.env.FACEBOOK_APP_ID;
  const clientSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = `https://hireacreator.ai/api/auth/instagram/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/claim?error=config", req.url));
  }

  try {
    // Exchange code for short-lived token
    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("[IG OAuth] Token exchange failed:", tokenData);
      return NextResponse.redirect(new URL("/claim?error=token_failed", req.url));
    }

    // Get user profile
    const profileRes = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=user_id,username,name,account_type,profile_picture_url,followers_count,biography&access_token=${tokenData.access_token}`
    );
    const profile = await profileRes.json();

    if (!profile.username) {
      return NextResponse.redirect(new URL("/claim?error=profile_failed", req.url));
    }

    const sql = getDb();

    // Check if this Instagram account is already linked to a user
    const existingLink = await sql`
      SELECT user_id FROM social_connections 
      WHERE platform = 'instagram' AND handle = ${profile.username.toLowerCase()}
      LIMIT 1
    `;

    // Get current session user
    const sessionToken = cookies().get("session_token")?.value;
    let userId: string | null = null;
    if (sessionToken) {
      const rows = await sql`
        SELECT u.id FROM users u JOIN auth_sessions s ON s.user_id = u.id
        WHERE s.token = ${sessionToken} AND s.expires_at > NOW()
      `;
      if (rows.length > 0) userId = rows[0].id as string;
    }

    if (userId) {
      // Update or create the social connection with verified = true
      await sql`
        INSERT INTO social_connections (user_id, platform, handle, follower_count, is_verified, metadata)
        VALUES (${userId}, 'instagram', ${profile.username.toLowerCase()}, ${profile.followers_count || 0}, true, ${JSON.stringify({ instagram_user_id: profile.user_id, access_token: tokenData.access_token })})
        ON CONFLICT (user_id, platform, handle) DO UPDATE SET
          follower_count = ${profile.followers_count || 0},
          is_verified = true,
          metadata = ${JSON.stringify({ instagram_user_id: profile.user_id, access_token: tokenData.access_token })}
      `.catch(() => {});

      // Update user avatar and name if not set
      await sql`
        UPDATE users SET
          avatar = COALESCE(NULLIF(avatar, ''), ${profile.profile_picture_url || null}),
          full_name = COALESCE(NULLIF(full_name, ''), ${profile.name || null})
        WHERE id = ${userId}
      `.catch(() => {});
    }

    // Redirect to dashboard with success
    return NextResponse.redirect(new URL("/dashboard?ig_connected=true", req.url));
  } catch (e) {
    console.error("[IG OAuth] Error:", e);
    return NextResponse.redirect(new URL("/claim?error=unknown", req.url));
  }
}
