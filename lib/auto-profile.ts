import { getDb } from "./db";
import { fetchSocialProfile, buildManualProfile, type SocialProfile } from "./social-scraper";
import { calculateCreatorScore, generateSlug, type ScoreResult } from "./claim-scoring";

export interface AutoProfileResult {
  profile: SocialProfile;
  score: ScoreResult;
  slug: string;
  profileUrl: string;
  isExisting: boolean;
  isClaimed: boolean;
}

export async function generateAutoProfile(
  platform: string,
  handle: string,
  options?: {
    referrerHandle?: string;
    sourcePostUrl?: string;
    manualData?: { followerCount?: number; bio?: string; displayName?: string; niche?: string };
  }
): Promise<AutoProfileResult> {
  const db = getDb();
  const cleanHandle = handle.replace(/^@/, "").trim().toLowerCase();

  // Check if profile already exists
  const existing = await db`
    SELECT * FROM claimed_profiles WHERE platform = ${platform} AND platform_handle = ${cleanHandle} LIMIT 1
  `;

  if (existing.length > 0) {
    const row = existing[0];
    const cachedFollowers = (row.follower_count as number) || 0;
    const cachedAvatar = row.avatar_url as string | null;

    // If cached data is stale (0 followers or no avatar), re-fetch from platform
    if (cachedFollowers === 0 || !cachedAvatar) {
      const freshProfile = await fetchSocialProfile(platform, cleanHandle);
      if (freshProfile && (freshProfile.followerCount > 0 || freshProfile.avatarUrl)) {
        // Update the DB with fresh data
        await db`
          UPDATE claimed_profiles SET
            follower_count = ${freshProfile.followerCount},
            avatar_url = ${freshProfile.avatarUrl},
            bio = ${freshProfile.bio || row.bio},
            display_name = ${freshProfile.displayName || row.display_name},
            following_count = ${freshProfile.followingCount},
            post_count = ${freshProfile.postCount},
            niche = ${freshProfile.category || row.niche},
            updated_at = NOW()
          WHERE id = ${row.id}
        `.catch(() => {});

        const score = calculateCreatorScore(freshProfile);
        await db`
          UPDATE claimed_profiles SET
            creator_score = ${score.score},
            score_breakdown = ${JSON.stringify(score.breakdown)},
            estimated_post_value = ${score.estimatedPostValue}
          WHERE id = ${row.id}
        `.catch(() => {});

        return {
          profile: freshProfile,
          score,
          slug: row.auto_profile_slug as string,
          profileUrl: `https://hireacreator.ai/u/${row.auto_profile_slug}`,
          isExisting: true,
          isClaimed: !!row.claimed_by,
        };
      }
    }

    return {
      profile: {
        platform,
        handle: cleanHandle,
        displayName: (row.display_name as string) || cleanHandle,
        avatarUrl: cachedAvatar,
        bio: row.bio as string | null,
        followerCount: cachedFollowers,
        followingCount: (row.following_count as number) || 0,
        postCount: (row.post_count as number) || 0,
        isVerified: false,
        category: row.niche as string | null,
        externalUrl: null,
        websites: [],
        otherSocials: [],
        profileUrl: `https://www.instagram.com/${cleanHandle}/`,
        isBusinessAccount: false,
      },
      score: {
        score: (row.creator_score as number) || 0,
        breakdown: (row.score_breakdown as ScoreResult["breakdown"]) || { profile: 0, reach: 0, engagement: 0, nicheValue: 0, consistency: 0, platformBonus: 0 },
        estimatedPostValue: (row.estimated_post_value as number) || 0,
        estimatedPostRange: [Math.round(((row.estimated_post_value as number) || 0) * 0.7), Math.round(((row.estimated_post_value as number) || 0) * 1.4)],
        detectedNiche: (row.niche as string) || "lifestyle",
        matchingCampaigns: 0,
      },
      slug: row.auto_profile_slug as string,
      profileUrl: `https://hireacreator.ai/u/${row.auto_profile_slug}`,
      isExisting: true,
      isClaimed: !!row.claimed_by,
    };
  }

  // Fetch or build profile
  let profile: SocialProfile | null = await fetchSocialProfile(platform, cleanHandle);
  if (!profile && options?.manualData) {
    profile = buildManualProfile(platform, cleanHandle, options.manualData);
  }
  if (!profile) {
    profile = buildManualProfile(platform, cleanHandle, {});
  }

  // Score the profile
  const score = calculateCreatorScore(profile);

  // Count matching campaigns
  const campaigns = await db`
    SELECT COUNT(*) as cnt FROM brand_campaigns
    WHERE status = 'active'
    AND (niche = ${score.detectedNiche} OR niche IS NULL)
    AND min_followers <= ${profile.followerCount}
    AND (max_followers IS NULL OR max_followers >= ${profile.followerCount})
  `;
  score.matchingCampaigns = parseInt(String(campaigns[0]?.cnt || "0"));

  // Generate slug — check for conflicts with users.slug and other claimed profiles
  let slug = generateSlug(platform, cleanHandle);
  const slugCheck = await db`
    SELECT 1 FROM users WHERE slug = ${slug}
    UNION ALL
    SELECT 1 FROM claimed_profiles WHERE auto_profile_slug = ${slug}
  `;
  if (slugCheck.length > 0) {
    slug = `${slug}-${platform}`;
    // Double-check the suffixed slug
    const doubleCheck = await db`
      SELECT 1 FROM users WHERE slug = ${slug}
      UNION ALL
      SELECT 1 FROM claimed_profiles WHERE auto_profile_slug = ${slug}
    `;
    if (doubleCheck.length > 0) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
  }

  // Insert into claimed_profiles
  await db`
    INSERT INTO claimed_profiles (
      platform, platform_handle, platform_id, display_name, avatar_url, bio,
      follower_count, following_count, post_count, engagement_rate, niche,
      creator_score, score_breakdown, estimated_post_value, auto_profile_slug,
      referrer_handle, source_post_url
    ) VALUES (
      ${platform}, ${cleanHandle}, ${profile.handle}, ${profile.displayName},
      ${profile.avatarUrl}, ${profile.bio}, ${profile.followerCount},
      ${profile.followingCount}, ${profile.postCount}, ${profile.followerCount > 0 ? score.breakdown.engagement : 0},
      ${score.detectedNiche}, ${score.score}, ${JSON.stringify(score.breakdown)},
      ${score.estimatedPostValue}, ${slug}, ${options?.referrerHandle || null},
      ${options?.sourcePostUrl || null}
    )
    ON CONFLICT (platform, platform_handle) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      avatar_url = COALESCE(EXCLUDED.avatar_url, claimed_profiles.avatar_url),
      bio = COALESCE(EXCLUDED.bio, claimed_profiles.bio),
      follower_count = EXCLUDED.follower_count,
      following_count = EXCLUDED.following_count,
      post_count = EXCLUDED.post_count,
      creator_score = EXCLUDED.creator_score,
      score_breakdown = EXCLUDED.score_breakdown,
      estimated_post_value = EXCLUDED.estimated_post_value,
      niche = EXCLUDED.niche,
      updated_at = NOW()
  `;

  return {
    profile,
    score,
    slug,
    profileUrl: `https://hireacreator.ai/u/${slug}`,
    isExisting: false,
    isClaimed: false,
  };
}

export async function claimProfile(
  claimedProfileId: string,
  userId: string
): Promise<boolean> {
  const db = getDb();

  // 1. Get the claimed profile data
  const profiles = await db`
    SELECT * FROM claimed_profiles WHERE id = ${claimedProfileId} LIMIT 1
  `;
  if (profiles.length === 0) return false;

  const cp = profiles[0];

  // Already claimed by someone else
  if (cp.claimed_by && cp.claimed_by !== userId) return false;

  // 2. Update claimed_profiles: set claimed_by and claimed_at
  await db`
    UPDATE claimed_profiles
    SET claimed_by = ${userId}, claimed_at = NOW()
    WHERE id = ${claimedProfileId}
  `;

  // 3. Copy data from claimed_profiles into users table
  await db`
    UPDATE users SET
      avatar_url = COALESCE(${cp.avatar_url as string | null}, users.avatar_url),
      bio = COALESCE(${cp.bio as string | null}, users.bio),
      category = COALESCE(${cp.niche as string | null}, users.category),
      headline = COALESCE(
        ${cp.niche ? `${cp.niche} creator` : null},
        users.headline
      ),
      visible_in_marketplace = true,
      updated_at = NOW()
    WHERE id = ${userId}
  `;

  // 4. Create social_connections entry from the scraped platform
  const existingConn = await db`
    SELECT 1 FROM social_connections
    WHERE user_id = ${userId} AND platform = ${cp.platform as string} AND handle = ${cp.platform_handle as string}
    LIMIT 1
  `;
  if (existingConn.length === 0) {
    await db`
      INSERT INTO social_connections (user_id, platform, handle, url, follower_count, is_verified)
      VALUES (
        ${userId},
        ${cp.platform as string},
        ${cp.platform_handle as string},
        ${profileUrlFor(cp.platform as string, cp.platform_handle as string)},
        ${(cp.follower_count as number) || 0},
        false
      )
    `;
  }

  return true;
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
