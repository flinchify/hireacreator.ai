import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { designProfile } from "@/lib/ai-profile-designer";

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

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const sql = getDb();
    const socials = await sql`SELECT * FROM social_connections WHERE user_id = ${user.id}`;

    // Build a SocialProfile-like object from user data
    const profile = {
      platform: "instagram" as const,
      handle: user.slug || user.username || "",
      displayName: user.display_name || user.name || "",
      avatarUrl: user.avatar_url || null,
      bio: user.bio || null,
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
      isVerified: false,
      category: user.category || null,
      externalUrl: null,
      websites: [] as string[],
      otherSocials: socials.map((s: any) => ({
        platform: s.platform,
        url: s.profile_url || "",
        handle: s.platform_handle || "",
      })),
      profileUrl: "",
      isBusinessAccount: false,
    };

    const design = designProfile(profile);

    return NextResponse.json({
      template: design.template,
      bgType: design.bgType,
      bgValue: design.bgValue,
      textColor: design.textColor,
      buttonShape: design.buttonShape,
      font: design.font,
    });
  } catch (e: any) {
    console.error("[ai-design] Error:", e);
    return NextResponse.json({ error: "AI design failed" }, { status: 500 });
  }
}
