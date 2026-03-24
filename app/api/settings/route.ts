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

// GET — full settings data
export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const sql = getDb();

    // Count active sessions
    const sessions = await sql`
      SELECT COUNT(*)::int AS count FROM auth_sessions
      WHERE user_id = ${user.id} AND expires_at > NOW()
    `;

    return NextResponse.json({
      email: user.email,
      emailVerified: user.email_verified || false,
      hasPassword: !!user.password_hash,
      totpEnabled: user.totp_enabled || false,
      subscriptionTier: user.subscription_tier || "free",
      role: user.role,
      activeSessions: sessions[0]?.count || 1,
      privacy: {
        profilePublic: user.privacy_profile_public !== false,
        showEmail: user.privacy_show_email || false,
        showEarnings: user.privacy_show_earnings || false,
        showLocation: user.privacy_show_location !== false,
        allowMessages: user.privacy_allow_messages !== false,
        searchable: user.privacy_searchable !== false,
        is18Plus: user.is_18_plus_content || false,
        socialOffersEnabled: user.social_offers_enabled !== false,
        socialOutreachEnabled: user.social_outreach_enabled !== false,
      },
      createdAt: user.created_at,
    });
  } catch (e) {
    console.error('[Settings]', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
