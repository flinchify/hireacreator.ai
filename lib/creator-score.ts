/**
 * Creator Score (0–100)
 *
 * Composite score based on:
 *   Profile Completeness  (0–20)  — avatar, bio, headline, location, category, cover
 *   Social Reach           (0–20)  — total followers across platforms
 *   Engagement             (0–15)  — profile views, link clicks
 *   Reputation             (0–20)  — rating + review count
 *   Experience             (0–15)  — completed projects + active services
 *   Trust                  (0–10)  — verification, pro subscription
 */

export type ScoreBreakdown = {
  profile: number;   // 0-20
  reach: number;     // 0-20
  engagement: number; // 0-15
  reputation: number; // 0-20
  experience: number; // 0-15
  trust: number;     // 0-10
  total: number;     // 0-100
};

type ScoreInput = {
  // Profile
  hasAvatar: boolean;
  hasBio: boolean;
  hasHeadline: boolean;
  hasLocation: boolean;
  hasCategory: boolean;
  hasCover: boolean;
  // Social
  totalFollowers: number;
  platformCount: number;
  // Engagement
  profileViews: number;
  totalLinkClicks: number;
  // Reputation
  rating: number;       // 0-5
  reviewCount: number;
  // Experience
  totalProjects: number;
  activeServiceCount: number;
  portfolioCount: number;
  // Trust
  isVerified: boolean;
  isPro: boolean;
};

export function calculateCreatorScore(input: ScoreInput): ScoreBreakdown {
  // ─── Profile Completeness (0-20) ───
  let profile = 0;
  if (input.hasAvatar) profile += 4;
  if (input.hasBio) profile += 4;
  if (input.hasHeadline) profile += 4;
  if (input.hasLocation) profile += 3;
  if (input.hasCategory) profile += 3;
  if (input.hasCover) profile += 2;

  // ─── Social Reach (0-20) ───
  let reach = 0;
  // Followers: logarithmic scale
  // 100 followers = ~3, 1K = ~6, 10K = ~10, 100K = ~14, 1M = ~18, 10M = 20
  if (input.totalFollowers > 0) {
    reach = Math.min(20, Math.round(Math.log10(input.totalFollowers) * 2.86));
  }
  // Bonus for multi-platform presence (up to +3, capped at 20)
  if (input.platformCount >= 3) reach = Math.min(20, reach + 2);
  else if (input.platformCount >= 2) reach = Math.min(20, reach + 1);

  // ─── Engagement (0-15) ───
  let engagement = 0;
  // Profile views: log scale — 10 = ~3, 100 = ~6, 1K = ~9, 10K = ~12, 100K = 15
  if (input.profileViews > 0) {
    engagement += Math.min(10, Math.round(Math.log10(input.profileViews) * 3));
  }
  // Link clicks
  if (input.totalLinkClicks > 0) {
    engagement += Math.min(5, Math.round(Math.log10(input.totalLinkClicks) * 1.67));
  }
  engagement = Math.min(15, engagement);

  // ─── Reputation (0-20) ───
  let reputation = 0;
  // Rating component: (rating / 5) * 12 — max 12 points
  if (input.rating > 0) {
    reputation += Math.round((input.rating / 5) * 12);
  }
  // Review volume: log scale — 1 = 2, 5 = 4, 10 = 6, 50 = 8
  if (input.reviewCount > 0) {
    reputation += Math.min(8, Math.round(Math.log10(input.reviewCount) * 4.7 + 2));
  }
  reputation = Math.min(20, reputation);

  // ─── Experience (0-15) ───
  let experience = 0;
  // Completed projects: 1 = 3, 5 = 6, 10 = 8, 50 = 11
  if (input.totalProjects > 0) {
    experience += Math.min(8, Math.round(Math.log10(input.totalProjects) * 4.7 + 3));
  }
  // Active services
  if (input.activeServiceCount > 0) {
    experience += Math.min(4, input.activeServiceCount);
  }
  // Portfolio items
  if (input.portfolioCount > 0) {
    experience += Math.min(3, Math.ceil(input.portfolioCount / 2));
  }
  experience = Math.min(15, experience);

  // ─── Trust (0-10) ───
  let trust = 0;
  if (input.isVerified) trust += 6;
  if (input.isPro) trust += 4;

  const total = profile + reach + engagement + reputation + experience + trust;

  return { profile, reach, engagement, reputation, experience, trust, total };
}

/**
 * Returns a tier label based on score
 */
export function getScoreTier(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Elite", color: "#f59e0b" };      // amber-500
  if (score >= 75) return { label: "Expert", color: "#8b5cf6" };     // violet-500
  if (score >= 60) return { label: "Pro", color: "#3b82f6" };        // blue-500
  if (score >= 40) return { label: "Rising", color: "#10b981" };     // emerald-500
  if (score >= 20) return { label: "Starter", color: "#6b7280" };    // gray-500
  return { label: "New", color: "#d1d5db" };                          // gray-300
}

/**
 * Returns a preview score for onboarding (before full data exists).
 * Shows the user what completing profile steps will earn them.
 */
/**
 * Query all user data and recalculate + persist their creator score.
 * Designed to be called fire-and-forget after profile mutations.
 */
export async function calculateAndSaveScore(userId: string): Promise<void> {
  const { getDb } = await import("@/lib/db");
  const sql = getDb();

  const rows = await sql`
    SELECT
      u.avatar_url, u.bio, u.headline, u.location, u.category, u.cover_url,
      u.rating, u.review_count, u.total_projects, u.profile_views,
      u.subscription_tier, u.verification_status, u.is_verified,
      COALESCE((SELECT SUM(sc.follower_count) FROM social_connections sc WHERE sc.user_id = u.id), 0) AS total_followers,
      COALESCE((SELECT COUNT(*) FROM social_connections sc WHERE sc.user_id = u.id), 0) AS platform_count,
      COALESCE((SELECT COUNT(*) FROM services s WHERE s.user_id = u.id AND s.is_active = TRUE), 0) AS active_service_count,
      COALESCE((SELECT COUNT(*) FROM portfolio_items p WHERE p.user_id = u.id), 0) AS portfolio_count,
      COALESCE((SELECT SUM(bl.click_count) FROM bio_links bl WHERE bl.user_id = u.id), 0) AS total_link_clicks
    FROM users u
    WHERE u.id = ${userId}
  `;

  if (rows.length === 0) return;
  const c = rows[0];

  const score = calculateCreatorScore({
    hasAvatar: !!c.avatar_url,
    hasBio: !!(c.bio && (c.bio as string).trim()),
    hasHeadline: !!(c.headline && (c.headline as string).trim()),
    hasLocation: !!(c.location && (c.location as string).trim()),
    hasCategory: !!(c.category && (c.category as string).trim()),
    hasCover: !!c.cover_url,
    totalFollowers: Number(c.total_followers) || 0,
    platformCount: Number(c.platform_count) || 0,
    profileViews: Number(c.profile_views) || 0,
    totalLinkClicks: Number(c.total_link_clicks) || 0,
    rating: Number(c.rating) || 0,
    reviewCount: Number(c.review_count) || 0,
    totalProjects: Number(c.total_projects) || 0,
    activeServiceCount: Number(c.active_service_count) || 0,
    portfolioCount: Number(c.portfolio_count) || 0,
    isVerified: c.verification_status === "verified" || c.is_verified === true,
    isPro: ((c.subscription_tier as string) || "free") !== "free",
  });

  await sql`
    UPDATE users
    SET creator_score = ${score.total},
        score_breakdown = ${JSON.stringify(score)}::jsonb,
        score_updated_at = NOW()
    WHERE id = ${userId}
  `;
}

export function calculateOnboardingPreview(steps: {
  hasAvatar: boolean;
  hasSocials: boolean;
  hasHeadline: boolean;
  hasBio: boolean;
  hasLocation: boolean;
  hasCategory: boolean;
}): { current: number; potential: number; tips: string[] } {
  let current = 0;
  const tips: string[] = [];

  if (steps.hasAvatar) current += 4; else tips.push("Add a profile photo (+4)");
  if (steps.hasBio) current += 4; else tips.push("Write a bio (+4)");
  if (steps.hasHeadline) current += 4; else tips.push("Add a headline (+4)");
  if (steps.hasLocation) current += 3; else tips.push("Set your location (+3)");
  if (steps.hasCategory) current += 3; else tips.push("Choose a category (+3)");
  if (steps.hasSocials) current += 3; else tips.push("Connect social accounts (+3)");

  // Potential = profile completeness + estimated reach + trust baseline
  const potential = 20 + 10 + 5; // full profile + moderate socials + some engagement

  return { current, potential, tips };
}
