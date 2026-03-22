import { getDb } from "./db";
import {
  fetchSocialProfile,
  crossReferenceSocials,
  type SocialProfile,
} from "./social-scraper";
import { generateSlug } from "./claim-scoring";

export interface IdentifiedCreator {
  name: string;
  bio: string;
  avatarUrl: string | null;
  platforms: {
    platform: string;
    handle: string;
    url: string;
    followers: number;
  }[];
  category: string;
  isVerified: boolean;
  profileUrl: string;
}

export async function identifyCreator(
  query: string
): Promise<IdentifiedCreator | null> {
  const clean = query.replace(/^@/, "").trim().toLowerCase();
  if (!clean) return null;

  const db = getDb();

  // 1. Check claimed_profiles for matching handle across all platforms
  const claimed = await db`
    SELECT * FROM claimed_profiles
    WHERE platform_handle = ${clean}
    ORDER BY creator_score DESC
  `;

  if (claimed.length > 0) {
    const primary = claimed[0];
    const platforms = claimed.map((row) => ({
      platform: row.platform as string,
      handle: row.platform_handle as string,
      url: profileUrlFor(row.platform as string, row.platform_handle as string),
      followers: (row.follower_count as number) || 0,
    }));
    const slug = primary.auto_profile_slug as string;
    return {
      name: (primary.display_name as string) || clean,
      bio: (primary.bio as string) || "",
      avatarUrl: primary.avatar_url as string | null,
      platforms,
      category: (primary.niche as string) || "lifestyle",
      isVerified: false,
      profileUrl: `https://hireacreator.ai/u/${slug}`,
    };
  }

  // 2. Check users table for matching slug/name
  const users = await db`
    SELECT * FROM users
    WHERE slug = ${clean} OR LOWER(full_name) = ${clean}
    LIMIT 1
  `;

  if (users.length > 0) {
    const user = users[0];
    const socials = await db`
      SELECT * FROM social_connections WHERE user_id = ${user.id}
    `;
    const platforms = socials.map((s) => ({
      platform: s.platform as string,
      handle: s.handle as string,
      url: (s.url as string) || profileUrlFor(s.platform as string, s.handle as string),
      followers: (s.follower_count as number) || 0,
    }));
    return {
      name: (user.full_name as string) || clean,
      bio: (user.bio as string) || "",
      avatarUrl: user.avatar_url as string | null,
      platforms,
      category: (user.category as string) || "lifestyle",
      isVerified: (user.is_verified as boolean) || false,
      profileUrl: `https://hireacreator.ai/u/${user.slug}`,
    };
  }

  // 3. Try fetching from each platform
  const platformOrder = ["instagram", "x", "tiktok", "youtube"];
  let primaryProfile: SocialProfile | null = null;

  for (const platform of platformOrder) {
    const profile = await fetchSocialProfile(platform, clean);
    if (profile && (profile.followerCount > 0 || profile.displayName !== clean)) {
      primaryProfile = profile;
      break;
    }
  }

  if (!primaryProfile) return null;

  // Cross-reference to find on other platforms
  const allProfiles = await crossReferenceSocials(primaryProfile);

  // Celebrity detection: verified or > 100K followers
  const isVerified = allProfiles.some(
    (p) => p.isVerified || p.followerCount > 100_000
  );

  const platforms = allProfiles.map((p) => ({
    platform: p.platform,
    handle: p.handle,
    url: p.profileUrl,
    followers: p.followerCount,
  }));

  const slug = generateSlug(primaryProfile.platform, primaryProfile.handle);

  // Upsert into claimed_profiles for each found platform
  for (const p of allProfiles) {
    const pSlug = generateSlug(p.platform, p.handle);
    await db`
      INSERT INTO claimed_profiles (
        platform, platform_handle, platform_id, display_name, avatar_url, bio,
        follower_count, following_count, post_count, niche,
        creator_score, score_breakdown, estimated_post_value, auto_profile_slug
      ) VALUES (
        ${p.platform}, ${p.handle}, ${p.handle}, ${p.displayName},
        ${p.avatarUrl}, ${p.bio}, ${p.followerCount},
        ${p.followingCount}, ${p.postCount}, ${p.category || "lifestyle"},
        0, '{}', 0, ${pSlug}
      )
      ON CONFLICT (platform, platform_handle) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        avatar_url = COALESCE(EXCLUDED.avatar_url, claimed_profiles.avatar_url),
        bio = COALESCE(EXCLUDED.bio, claimed_profiles.bio),
        follower_count = EXCLUDED.follower_count,
        updated_at = NOW()
    `;
  }

  return {
    name: primaryProfile.displayName,
    bio: primaryProfile.bio || "",
    avatarUrl: primaryProfile.avatarUrl,
    platforms,
    category: primaryProfile.category || "lifestyle",
    isVerified,
    profileUrl: `https://hireacreator.ai/u/${slug}`,
  };
}

function profileUrlFor(platform: string, handle: string): string {
  switch (platform) {
    case "instagram":
      return `https://www.instagram.com/${handle}/`;
    case "x":
      return `https://x.com/${handle}`;
    case "tiktok":
      return `https://www.tiktok.com/@${handle}`;
    case "youtube":
      return `https://www.youtube.com/@${handle}`;
    default:
      return `https://${platform}.com/${handle}`;
  }
}
