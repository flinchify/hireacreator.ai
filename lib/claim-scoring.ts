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

// Profile completeness (15pts): avatar (+5), bio (+3), headline (+2), location (+2), website (+2), category (+1)
function scoreProfile(profile: SocialProfile): number {
  let score = 0;
  if (profile.avatarUrl) score += 5;
  if (profile.bio && profile.bio.length > 10) score += 3;
  if (profile.displayName && profile.displayName.length > 0) score += 2; // headline proxy
  if (profile.bio && /📍|located|based in|from /i.test(profile.bio)) score += 2; // location proxy
  if (profile.externalUrl || profile.websites.length > 0) score += 2;
  if (profile.category) score += 1;
  return Math.min(score, 15); // 0-15
}

// Social reach (25pts): logarithmic scale
function scoreReach(followers: number): number {
  if (followers >= 1_000_000) return 25;
  if (followers >= 500_000) return 21;
  if (followers >= 100_000) return 18;
  if (followers >= 50_000) return 15;
  if (followers >= 10_000) return 10;
  if (followers >= 1_000) return 5;
  // Below 1K: scale linearly 0-4
  return Math.min(4, Math.round((followers / 1_000) * 4));
}

// Engagement quality (20pts): follower/following ratio + post count relative to account activity
function scoreEngagement(profile: SocialProfile): number {
  const { followerCount, followingCount, postCount } = profile;
  let score = 0;

  // Follower/following ratio (>2 ratio = good) — up to 12pts
  if (followingCount > 0) {
    const ratio = followerCount / followingCount;
    if (ratio > 10) score += 12;
    else if (ratio > 5) score += 10;
    else if (ratio > 2) score += 8;
    else if (ratio > 1) score += 5;
    else if (ratio > 0.5) score += 2;
    else score += 1;
  } else if (followerCount > 0) {
    score += 10; // follows nobody = likely high quality
  }

  // Post count relative to follower count (activity proxy) — up to 8pts
  if (followerCount > 0 && postCount > 0) {
    const postsPerK = (postCount / followerCount) * 1000;
    if (postsPerK > 50) score += 8;
    else if (postsPerK > 20) score += 6;
    else if (postsPerK > 5) score += 4;
    else score += 2;
  }

  return Math.min(score, 20); // 0-20
}

// Platform diversity (10pts): based on otherSocials array
// 1 platform=3pts, 2=6pts, 3=8pts, 4+=10pts
function scorePlatformDiversity(profile: SocialProfile): number {
  // Count: the primary platform + unique platforms in otherSocials
  const platforms = new Set<string>([profile.platform]);
  if (profile.otherSocials) {
    for (const s of profile.otherSocials) {
      if (s.platform) platforms.add(s.platform.toLowerCase());
    }
  }
  const count = platforms.size;
  if (count >= 4) return 10;
  if (count === 3) return 8;
  if (count === 2) return 6;
  return 3; // 1 platform
}

// Content consistency (15pts): based on post count
function scoreConsistency(postCount: number): number {
  if (postCount > 100) return 15;
  if (postCount > 50) return 10;
  if (postCount > 20) return 7;
  if (postCount > 5) return 3;
  return 1;
}

// Verification bonus (15pts): isVerified=10pts, isBusinessAccount=5pts
function scoreVerificationBonus(profile: SocialProfile): number {
  let score = 0;
  if (profile.isVerified) score += 10;
  if (profile.isBusinessAccount) score += 5;
  return score; // 0-15
}

// Rates are only shown for creators with completed transactions on HireACreator
export function calculateCreatorScore(profile: SocialProfile): ScoreResult {
  const niche = detectNiche(profile.bio, profile.category);

  const profileScore = scoreProfile(profile);
  const reachScore = scoreReach(profile.followerCount);
  const engagementScore = scoreEngagement(profile);
  const platformDiversityScore = scorePlatformDiversity(profile);
  const consistencyScore = scoreConsistency(profile.postCount);
  const verificationScore = scoreVerificationBonus(profile);

  const breakdown: ScoreBreakdown = {
    profile: profileScore,
    reach: reachScore,
    engagement: engagementScore,
    nicheValue: platformDiversityScore,       // repurposed: platform diversity
    consistency: consistencyScore,
    platformBonus: verificationScore,          // repurposed: verification bonus
  };

  const score = Math.min(
    100,
    profileScore + reachScore + engagementScore +
    platformDiversityScore + consistencyScore + verificationScore
  );

  // Rates are only shown for creators with completed transactions on HireACreator
  // Set to 0 for all profiles — real rates come from transaction history
  return {
    score,
    breakdown,
    estimatedPostValue: 0,
    estimatedPostRange: [0, 0],
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
