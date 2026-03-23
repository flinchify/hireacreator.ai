import { NextResponse } from "next/server";

/**
 * GET /api/auth/instagram — Redirect to Instagram OAuth
 */
export async function GET() {
  const clientId = process.env.FACEBOOK_APP_ID;
  const redirectUri = `https://hireacreator.ai/api/auth/instagram/callback`;
  
  if (!clientId) {
    return NextResponse.json({ error: "Instagram app not configured" }, { status: 500 });
  }

  const scope = "instagram_business_basic,instagram_business_manage_comments";
  const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(authUrl);
}
