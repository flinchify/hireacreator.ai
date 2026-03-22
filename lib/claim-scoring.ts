import type { SocialProfile } from "./social-scraper";

export interface ScoreBreakdown {
  profile: number;
  reach: number;
  engagement: number;
  nicheValue: number;
  consistency: number;
  platformBonus: number;
}

export interface ScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
  estimatedPostValue: number; // cents
  estimatedPostRange: [number, number]; // [low, high] in cents
  detectedNiche: string;
  matchingCampaigns: number;
}

const HIGH_VALUE_NICHES = ["fitness", "beauty", "tech", "fashion", "food", "travel", "finance", "health", "luxury", "automotive"];
const MEDIUM_VALUE_NICHES = ["gaming", "music", "art", "education", "sports", "comedy", "lifestyle", "photography", "parenting"];

const NICHE_KEYWORDS: Record<string, string[]> = {
  fitness: ["fitness", "gym", "workout", "training", "health", "athlete", "crossfit", "yoga", "personal trainer", "coach"],
  beauty: ["beauty", "makeup", "skincare", "cosmetics", "hair", "nails", "esthetician", "mua"],
  tech: ["tech", "developer", "coding", "software", "ai", "crypto", "blockchain", "web3", "startup", "saas", "engineer"],
  fashion: ["fashion", "style", "outfit", "designer", "model", "clothing", "streetwear", "vintage"],
  food: ["food", "chef", "cooking", "recipe", "restaurant", "foodie", "baking", "nutrition"],
  travel: ["travel", "adventure", "explore", "wanderlust", "digital nomad", "backpack", "destination"],
  finance: ["finance", "investing", "stocks", "trading", "money", "wealth", "crypto", "real estate", "entrepreneur"],
  gaming: ["gaming", "gamer", "twitch", "esports", "streamer", "xbox", "playstation", "nintendo"],
  music: ["music", "musician", "producer", "singer", "rapper", "dj", "songwriter", "artist"],
  art: ["art", "artist", "illustration", "design", "creative", "painter", "digital art", "graphic"],
  education: ["education", "teacher", "tutor", "learning", "course", "mentor", "professor"],
  lifestyle: ["lifestyle", "daily", "life", "vlog", "family", "home", "minimalist"],
  automotive: ["car", "auto", "4wd", "4x4", "offroad", "racing", "motorcycle", "vehicle"],
};

function detectNiche(bio: string | null, category: string | null): string {
  if (category) {
    const catLower = category.toLowerCase();
    for (const [niche, keywords] of Object.entries(NICHE_KEYWORDS)) {
      if (keywords.some((k) => catLower.includes(k))) return niche;
    }
  }
  if (bio) {
    const bioLower = bio.toLowerCase();
    let bestNiche = "lifestyle";
    let bestScore = 0;
    for (const [niche, keywords] of Object.entries(NICHE_KEYWORDS)) {
      const matches = keywords.filter((k) => bioLower.includes(k)).length;
      if (matches > bestScore) {
        bestScore = matches;
        bestNiche = niche;
      }
    }
    return bestNiche;
  }
  return "lifestyle";
}

function scoreProfile(profile: SocialProfile): number {
  let score = 0;
  if (profile.avatarUrl) score += 5;
  if (profile.bio && profile.bio.length > 10) score += 5;
  if (profile.externalUrl) score += 5;
  return score; // 0-15
}

function scoreReach(followers: number): number {
  if (followers >= 100_000) return 25;
  if (followers >= 50_000) return 20;
  if (followers >= 10_000) return 15;
  if (followers >= 1_000) return 10;
  return 5; // 0-25
}

function scoreEngagement(profile: SocialProfile): number {
  const { followerCount, followingCount, postCount } = profile;
  let score = 0;

  // Followers/following ratio (higher = more organic authority)
  if (followingCount > 0) {
    const ratio = followerCount / followingCount;
    if (ratio > 10) score += 12;
    else if (ratio > 5) score += 9;
    else if (ratio > 2) score += 6;
    else if (ratio > 1) score += 3;
    else score += 1;
  } else if (followerCount > 0) {
    score += 10; // follows nobody = probably high quality
  }

  // Post engagement proxy (posts per follower — active creator)
  if (followerCount > 0 && postCount > 0) {
    const postsPerK = (postCount / followerCount) * 1000;
    if (postsPerK > 50) score += 8; // very active
    else if (postsPerK > 20) score += 6;
    else if (postsPerK > 5) score += 4;
    else score += 2;
  }

  return Math.min(score, 20); // 0-20
}

function scoreNicheValue(niche: string): number {
  if (HIGH_VALUE_NICHES.includes(niche)) return 15;
  if (MEDIUM_VALUE_NICHES.includes(niche)) return 10;
  return 5; // 0-15
}

function scoreConsistency(postCount: number): number {
  if (postCount >= 1000) return 15;
  if (postCount >= 500) return 12;
  if (postCount >= 100) return 8;
  if (postCount >= 50) return 5;
  return 2; // 0-15
}

function scorePlatformBonus(platform: string): number {
  switch (platform) {
    case "instagram": return 10;
    case "youtube": return 10;
    case "tiktok": return 8;
    case "x": return 6;
    default: return 4;
  } // 0-10
}

function calculatePostValue(followers: number, niche: string): number {
  const nicheMultiplier = HIGH_VALUE_NICHES.includes(niche) ? 1.5 : MEDIUM_VALUE_NICHES.includes(niche) ? 1.0 : 0.7;
  // Base formula: ~$10 per 1K followers, adjusted by niche
  const base = Math.round(followers * 0.01 * nicheMultiplier);
  return Math.max(500, Math.min(base, 5_000_000)); // $5 min, $50K max
}

export function calculateCreatorScore(profile: SocialProfile): ScoreResult {
  const niche = detectNiche(profile.bio, profile.category);

  const breakdown: ScoreBreakdown = {
    profile: scoreProfile(profile),
    reach: scoreReach(profile.followerCount),
    engagement: scoreEngagement(profile),
    nicheValue: scoreNicheValue(niche),
    consistency: scoreConsistency(profile.postCount),
    platformBonus: scorePlatformBonus(profile.platform),
  };

  const score = Math.min(
    100,
    breakdown.profile + breakdown.reach + breakdown.engagement +
    breakdown.nicheValue + breakdown.consistency + breakdown.platformBonus
  );

  const postValue = calculatePostValue(profile.followerCount, niche);
  const lowRange = Math.round(postValue * 0.7);
  const highRange = Math.round(postValue * 1.4);

  return {
    score,
    breakdown,
    estimatedPostValue: postValue,
    estimatedPostRange: [lowRange, highRange],
    detectedNiche: niche,
    matchingCampaigns: 0, // filled in by API after DB query
  };
}

export function generateSlug(platform: string, handle: string): string {
  const clean = handle.replace(/^@/, "").trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
  // If handle alone is unique enough, use it. Otherwise prefix with platform.
  if (platform === "instagram") return clean;
  return `${platform === "x" ? "x" : platform}-${clean}`;
}
