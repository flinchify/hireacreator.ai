import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { designProfile } from "@/lib/ai-profile-designer";
import { fetchSocialProfile } from "@/lib/social-scraper";

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

    // Try to fetch real social data for better AI design
    let bestProfile = null;
    for (const social of socials) {
      try {
        const p = await fetchSocialProfile(social.platform as string, social.handle as string);
        if (p && (p.followerCount > 0 || p.bio)) {
          bestProfile = p;
          break;
        }
      } catch {}
    }

    // Build a SocialProfile-like object, preferring real scraped data
    const profile = {
      platform: (bestProfile?.platform || socials[0]?.platform || "instagram") as string,
      handle: bestProfile?.handle || user.slug || "",
      displayName: bestProfile?.displayName || user.full_name || user.slug || "",
      avatarUrl: bestProfile?.avatarUrl || user.avatar_url || null,
      bio: bestProfile?.bio || user.bio || null,
      followerCount: bestProfile?.followerCount || 0,
      followingCount: bestProfile?.followingCount || 0,
      postCount: bestProfile?.postCount || 0,
      isVerified: bestProfile?.isVerified || false,
      category: bestProfile?.category || user.category || null,
      externalUrl: bestProfile?.externalUrl || null,
      websites: bestProfile?.websites || [] as string[],
      otherSocials: bestProfile?.otherSocials || socials.map((s: any) => ({
        platform: s.platform,
        url: s.url || "",
        handle: s.handle || "",
      })),
      profileUrl: bestProfile?.profileUrl || "",
      isBusinessAccount: bestProfile?.isBusinessAccount || false,
    };

    const design = designProfile(profile);

    // Also update user's bio/category if we fetched fresh data and they're empty
    if (bestProfile) {
      const updates: string[] = [];
      if (!user.bio && bestProfile.bio) {
        await sql`UPDATE users SET bio = ${bestProfile.bio} WHERE id = ${user.id} AND (bio IS NULL OR bio = '')`;
      }
      if (!user.category && bestProfile.category) {
        await sql`UPDATE users SET category = ${bestProfile.category} WHERE id = ${user.id} AND (category IS NULL OR category = '')`;
      }
      if (!user.avatar_url && bestProfile.avatarUrl) {
        await sql`UPDATE users SET avatar_url = ${bestProfile.avatarUrl} WHERE id = ${user.id} AND avatar_url IS NULL`;
      }
    }

    return NextResponse.json({
      template: design.template,
      bgType: design.bgType,
      bgValue: design.bgValue,
      textColor: design.textColor,
      buttonShape: design.buttonShape,
      font: design.font,
      suggestedHeadline: design.suggestedHeadline,
      suggestedServices: design.suggestedServices,
      detectedNiche: profile.category,
    });
  } catch (e: any) {
    console.error("[ai-design] Error:", e);
    return NextResponse.json({ error: "AI design failed" }, { status: 500 });
  }
}
