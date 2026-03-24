import { getDb } from "./db";
import { fetchSocialProfile, buildManualProfile, type SocialProfile } from "./social-scraper";
import { calculateCreatorScore, generateSlug, type ScoreResult } from "./claim-scoring";
import { designProfile, type AIProfileDesign } from "./ai-profile-designer";

// Auto-migrate: ensure design columns exist on claimed_profiles
let _migrated = false;
async function ensureDesignColumns(db: ReturnType<typeof getDb>) {
  if (_migrated) return;
  try {
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_template VARCHAR(50)`;
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_bg_type VARCHAR(20)`;
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_bg_value TEXT`;
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_text_color VARCHAR(20)`;
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_font VARCHAR(50)`;
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_button_shape VARCHAR(20)`;
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_headline TEXT`;
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS auto_socials JSONB DEFAULT '[]'`;
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS auto_bio_links JSONB DEFAULT '[]'`;
    _migrated = true;
  } catch { _migrated = true; }
}

export interface AutoProfileResult {
  profile: SocialProfile;
  score: ScoreResult;
  slug: string;
  profileUrl: string;
  isExisting: boolean;
  isClaimed: boolean;
  design: AIProfileDesign;
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
        const freshDesign = designProfile(freshProfile);
        await db`
          UPDATE claimed_profiles SET
            creator_score = ${score.score},
            score_breakdown = ${JSON.stringify(score.breakdown)},
            estimated_post_value = ${score.estimatedPostValue},
            link_bio_template = ${freshDesign.template},
            link_bio_bg_type = ${freshDesign.bgType},
            link_bio_bg_value = ${freshDesign.bgValue},
            link_bio_text_color = ${freshDesign.textColor},
            link_bio_font = ${freshDesign.font},
            link_bio_button_shape = ${freshDesign.buttonShape},
            link_bio_headline = ${freshDesign.suggestedHeadline}
          WHERE id = ${row.id}
        `.catch(() => {});

        return {
          profile: freshProfile,
          score,
          slug: row.auto_profile_slug as string,
          profileUrl: `https://hireacreator.ai/u/${row.auto_profile_slug}`,
          isExisting: true,
          isClaimed: !!row.claimed_by,
          design: designProfile(freshProfile),
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
      design: designProfile({
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
      }),
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

  const design = designProfile(profile);

  // Build auto_socials: primary platform + any other socials found in bio
  const autoSocials: { platform: string; handle: string; url: string }[] = [
    { platform, handle: cleanHandle, url: profileUrlFor(platform, cleanHandle) },
  ];
  for (const s of profile.otherSocials) {
    if (!autoSocials.some((a) => a.platform === s.platform && a.handle === s.handle)) {
      autoSocials.push({ platform: s.platform, handle: s.handle, url: s.url });
    }
  }

  // Build auto_bio_links from websites found in bio
  const autoBioLinks: { title: string; url: string }[] = profile.websites.map((url) => ({
    title: new URL(url).hostname.replace(/^www\./, ""),
    url,
  }));

  // Ensure design columns exist
  await ensureDesignColumns(db);

  // Insert into claimed_profiles (with AI design fields + auto socials)
  await db`
    INSERT INTO claimed_profiles (
      platform, platform_handle, platform_id, display_name, avatar_url, bio,
      follower_count, following_count, post_count, engagement_rate, niche,
      creator_score, score_breakdown, estimated_post_value, auto_profile_slug,
      referrer_handle, source_post_url,
      link_bio_template, link_bio_bg_type, link_bio_bg_value, link_bio_text_color,
      link_bio_font, link_bio_button_shape, link_bio_headline,
      auto_socials, auto_bio_links
    ) VALUES (
      ${platform}, ${cleanHandle}, ${profile.handle}, ${profile.displayName},
      ${profile.avatarUrl}, ${profile.bio}, ${profile.followerCount},
      ${profile.followingCount}, ${profile.postCount}, ${profile.followerCount > 0 ? score.breakdown.engagement : 0},
      ${score.detectedNiche}, ${score.score}, ${JSON.stringify(score.breakdown)},
      ${score.estimatedPostValue}, ${slug}, ${options?.referrerHandle || null},
      ${options?.sourcePostUrl || null},
      ${design.template}, ${design.bgType}, ${design.bgValue}, ${design.textColor},
      ${design.font}, ${design.buttonShape}, ${design.suggestedHeadline},
      ${JSON.stringify(autoSocials)}, ${JSON.stringify(autoBioLinks)}
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
      link_bio_template = EXCLUDED.link_bio_template,
      link_bio_bg_type = EXCLUDED.link_bio_bg_type,
      link_bio_bg_value = EXCLUDED.link_bio_bg_value,
      link_bio_text_color = EXCLUDED.link_bio_text_color,
      link_bio_font = EXCLUDED.link_bio_font,
      link_bio_button_shape = EXCLUDED.link_bio_button_shape,
      link_bio_headline = EXCLUDED.link_bio_headline,
      auto_socials = EXCLUDED.auto_socials,
      auto_bio_links = EXCLUDED.auto_bio_links,
      updated_at = NOW()
  `;

  return {
    profile,
    score,
    slug,
    profileUrl: `https://hireacreator.ai/u/${slug}`,
    isExisting: false,
    isClaimed: false,
    design,
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

  // 3. Generate AI design from the claimed profile data
  const profileForDesign: SocialProfile = {
    platform: cp.platform as string,
    handle: cp.platform_handle as string,
    displayName: (cp.display_name as string) || (cp.platform_handle as string),
    avatarUrl: cp.avatar_url as string | null,
    bio: cp.bio as string | null,
    followerCount: (cp.follower_count as number) || 0,
    followingCount: (cp.following_count as number) || 0,
    postCount: (cp.post_count as number) || 0,
    isVerified: false,
    category: cp.niche as string | null,
    externalUrl: null,
    websites: [],
    otherSocials: [],
    profileUrl: profileUrlFor(cp.platform as string, cp.platform_handle as string),
    isBusinessAccount: false,
  };
  const design = designProfile(profileForDesign);

  // 4. Copy data from claimed_profiles into users table with AI design
  await db`
    UPDATE users SET
      avatar_url = COALESCE(${cp.avatar_url as string | null}, users.avatar_url),
      bio = COALESCE(${cp.bio as string | null}, users.bio),
      category = COALESCE(${cp.niche as string | null}, users.category),
      headline = COALESCE(
        ${design.suggestedHeadline},
        users.headline
      ),
      link_bio_template = COALESCE(${design.template}, users.link_bio_template),
      link_bio_bg_type = COALESCE(${design.bgType}, users.link_bio_bg_type),
      link_bio_bg_value = COALESCE(${design.bgValue}, users.link_bio_bg_value),
      link_bio_text_color = COALESCE(${design.textColor}, users.link_bio_text_color),
      link_bio_font = COALESCE(${design.font}, users.link_bio_font),
      link_bio_button_shape = COALESCE(${design.buttonShape}, users.link_bio_button_shape),
      visible_in_marketplace = true,
      updated_at = NOW()
    WHERE id = ${userId}
  `;

  // 5. Create social_connections entry from the scraped platform
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
