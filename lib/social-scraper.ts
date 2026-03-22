export interface SocialProfile {
  platform: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isVerified: boolean;
  category: string | null;
  externalUrl: string | null;
  websites: string[];
  otherSocials: { platform: string; url: string; handle: string }[];
  profileUrl: string;
  isBusinessAccount: boolean;
}

const SOCIAL_URL_PATTERNS: {
  platform: string;
  regex: RegExp;
  handleGroup: number;
}[] = [
  {
    platform: "youtube",
    regex: /(?:youtube\.com\/(?:@|channel\/|c\/|user\/))([\w.-]+)/i,
    handleGroup: 1,
  },
  {
    platform: "tiktok",
    regex: /tiktok\.com\/@?([\w.-]+)/i,
    handleGroup: 1,
  },
  {
    platform: "x",
    regex: /(?:twitter\.com|x\.com)\/([\w]+)/i,
    handleGroup: 1,
  },
  {
    platform: "instagram",
    regex: /instagram\.com\/([\w.]+)/i,
    handleGroup: 1,
  },
  {
    platform: "twitch",
    regex: /twitch\.tv\/([\w]+)/i,
    handleGroup: 1,
  },
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Fitness & Health": ["fitness", "gym", "workout", "trainer", "health", "yoga", "crossfit", "athlete"],
  "Beauty & Makeup": ["beauty", "makeup", "skincare", "mua", "cosmetics", "esthetician"],
  "Fashion & Style": ["fashion", "style", "model", "designer", "outfit", "streetwear"],
  "Food & Cooking": ["food", "chef", "cooking", "recipe", "foodie", "baking", "restaurant"],
  "Tech & Gaming": ["tech", "developer", "gaming", "gamer", "streamer", "coding", "software"],
  "Travel & Adventure": ["travel", "adventure", "wanderlust", "explore", "digital nomad"],
  "Music & Entertainment": ["music", "musician", "singer", "rapper", "dj", "producer", "artist"],
  "Education & Learning": ["teacher", "tutor", "education", "professor", "mentor", "coach"],
  "Finance & Business": ["finance", "investing", "entrepreneur", "business", "stocks", "trading"],
};

function detectCategoryFromBio(bio: string | null): string | null {
  if (!bio) return null;
  const lower = bio.toLowerCase();
  let bestCategory: string | null = null;
  let bestScore = 0;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter((k) => lower.includes(k)).length;
    if (matches > bestScore) {
      bestScore = matches;
      bestCategory = category;
    }
  }
  return bestScore > 0 ? bestCategory : null;
}

function extractSocialLinks(
  text: string | null,
  excludePlatform?: string
): { platform: string; url: string; handle: string }[] {
  if (!text) return [];
  const found: { platform: string; url: string; handle: string }[] = [];
  for (const pattern of SOCIAL_URL_PATTERNS) {
    if (pattern.platform === excludePlatform) continue;
    const match = text.match(pattern.regex);
    if (match) {
      const handle = match[pattern.handleGroup]?.replace(/[/?#].*$/, "") || "";
      if (handle && handle.length > 1) {
        found.push({
          platform: pattern.platform,
          url: match[0].startsWith("http")
            ? match[0]
            : `https://${match[0]}`,
          handle,
        });
      }
    }
  }
  return found;
}

function extractWebsites(
  externalUrl: string | null,
  bio: string | null
): string[] {
  const urls: string[] = [];
  if (externalUrl) urls.push(externalUrl);
  if (bio) {
    const urlMatches = bio.match(
      /https?:\/\/[^\s,)]+/gi
    );
    if (urlMatches) {
      for (const url of urlMatches) {
        const isSocial = SOCIAL_URL_PATTERNS.some((p) => p.regex.test(url));
        if (!isSocial && !urls.includes(url)) {
          urls.push(url);
        }
      }
    }
  }
  return urls;
}

/** Fetch a URL via ScrapingBee proxy (renders JS, uses residential IPs) */
async function fetchViaProxy(url: string): Promise<string | null> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) return null;
  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      url,
      render_js: "false",
      premium_proxy: "true",
    });
    const res = await fetch(`https://app.scrapingbee.com/api/v1/?${params}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.log(`[ScrapingBee] ${url} failed: ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (e) {
    console.log(`[ScrapingBee] ${url} error:`, e);
    return null;
  }
}

async function fetchInstagramProfile(
  handle: string
): Promise<SocialProfile | null> {
  const clean = handle.replace(/^@/, "").trim().toLowerCase();

  // Try Instagram Graph API first (if we have a token + business account ID)
  const igToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (igToken && igAccountId) {
    try {
      // Use IGAA token to look up own account
      console.log(`[IG Scraper] Trying Instagram Graph API for @${clean}`);
      const meRes = await fetch(
        `https://graph.instagram.com/v21.0/me?fields=user_id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website&access_token=${igToken}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (meRes.ok) {
        const meData = await meRes.json();
        // Only use if this is the connected account
        if (meData.username?.toLowerCase() === clean) {
          const bio = meData.biography || null;
          const otherSocials = extractSocialLinks([bio, meData.website].filter(Boolean).join(" "), "instagram");
          const websites = extractWebsites(meData.website, bio);
          const category = detectCategoryFromBio(bio) || null;
          return {
            platform: "instagram",
            handle: clean,
            displayName: meData.name || clean,
            avatarUrl: meData.profile_picture_url || null,
            bio,
            followerCount: meData.followers_count || 0,
            followingCount: meData.follows_count || 0,
            postCount: meData.media_count || 0,
            isVerified: false,
            category,
            externalUrl: meData.website || null,
            websites,
            otherSocials,
            profileUrl: `https://www.instagram.com/${clean}/`,
            isBusinessAccount: true,
          };
        }
      }
      
      // For OTHER accounts, try Facebook Graph API with a page token if available
      const fbPageToken = process.env.FACEBOOK_PAGE_TOKEN;
      if (fbPageToken && igAccountId) {
        const fields = "username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website";
        const bdUrl = `https://graph.facebook.com/v21.0/${igAccountId}?fields=business_discovery.fields(${fields}){username%3D${encodeURIComponent(clean)}}&access_token=${fbPageToken}`;
        const searchRes = await fetch(bdUrl, { signal: AbortSignal.timeout(8000) });
        if (searchRes.ok) {
          const data = await searchRes.json();
          const user = data?.business_discovery;
        if (user) {
          const bio = user.biography || null;
          const otherSocials = extractSocialLinks([bio, user.website].filter(Boolean).join(" "), "instagram");
          const websites = extractWebsites(user.website, bio);
          const category = detectCategoryFromBio(bio) || null;
          return {
            platform: "instagram",
            handle: clean,
            displayName: user.name || clean,
            avatarUrl: user.profile_picture_url || null,
            bio,
            followerCount: user.followers_count || 0,
            followingCount: user.follows_count || 0,
            postCount: user.media_count || 0,
            isVerified: false,
            category,
            externalUrl: user.website || null,
            websites,
            otherSocials,
            profileUrl: `https://www.instagram.com/${clean}/`,
            isBusinessAccount: true,
          };
        }
        }
      }
    } catch {
      // Fall through to scraping
    }
  }

  // Fallback: scrape from private API
  try {
    const res = await fetch(
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(clean)}`,
      {
        headers: {
          "User-Agent":
            "Instagram 278.0.0.19.115 Android (33/13; 420dpi; 1080x2340; samsung; SM-G991B; o1s; exynos2100; en_US; 437676152)",
          "X-IG-App-ID": "936619743392459",
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const user = data?.data?.user;
    if (!user) return null;

    const bio = user.biography || null;
    const extUrl = user.external_url || null;
    const otherSocials = extractSocialLinks(
      [bio, extUrl].filter(Boolean).join(" "),
      "instagram"
    );
    const websites = extractWebsites(extUrl, bio);
    const category =
      user.category_name || detectCategoryFromBio(bio) || null;

    return {
      platform: "instagram",
      handle: clean,
      displayName: user.full_name || clean,
      avatarUrl: user.profile_pic_url_hd || user.profile_pic_url || null,
      bio,
      followerCount: user.edge_followed_by?.count || 0,
      followingCount: user.edge_follow?.count || 0,
      postCount: user.edge_owner_to_timeline_media?.count || 0,
      isVerified: user.is_verified || false,
      category,
      externalUrl: extUrl,
      websites,
      otherSocials,
      profileUrl: `https://www.instagram.com/${clean}/`,
      isBusinessAccount: user.is_business_account || user.is_professional_account || false,
    };
  } catch {
    // Fall through to public page scraping
  }

  // Fallback 2: ScrapingBee proxy (residential IPs, works for ALL accounts)
  try {
    console.log(`[IG Scraper] Trying ScrapingBee proxy for @${clean}`);
    const html = await fetchViaProxy(`https://www.instagram.com/${clean}/`);
    if (html && html.includes("Followers")) {
      console.log(`[IG Scraper] ScrapingBee success for @${clean}`);

      let followerCount = 0;
      let followingCount = 0;
      let postCount = 0;
      const ogMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
      if (ogMatch) {
        const desc = ogMatch[1];
        const fMatch = desc.match(/([\d,.]+[KMB]?)\s*Followers/i);
        const flMatch = desc.match(/([\d,.]+[KMB]?)\s*Following/i);
        const pMatch = desc.match(/([\d,.]+[KMB]?)\s*Posts/i);
        if (fMatch) followerCount = parseIGCount(fMatch[1]);
        if (flMatch) followingCount = parseIGCount(flMatch[1]);
        if (pMatch) postCount = parseIGCount(pMatch[1]);
      }

      // Extract name — clean off " (@handle) • Instagram photos and videos"
      let displayName = clean;
      const ogDescName = ogMatch?.[1]?.match(/from\s+(.+?)\s*\(&#064;/);
      if (ogDescName) {
        displayName = ogDescName[1].trim();
      } else {
        const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
        if (titleMatch) {
          const n = titleMatch[1]
            .replace(/\s*\(@[^)]+\).*$/, "")
            .replace(/&#x2022;.*$/, "")
            .replace(/&#064;/g, "@")
            .trim();
          if (n && n !== clean) displayName = n;
        }
      }

      let avatarUrl: string | null = null;
      const imgMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
      if (imgMatch) avatarUrl = imgMatch[1].replace(/&amp;/g, "&");

      let bio: string | null = null;
      const bioMatch = html.match(/"biography"\s*:\s*"([^"]+)"/);
      if (bioMatch) bio = bioMatch[1].replace(/\\n/g, "\n").replace(/\\u[\da-fA-F]{4}/g, "");
      if (!bio && ogMatch) {
        const parts = ogMatch[1].split(" - ");
        if (parts.length > 1) bio = parts.slice(1).join(" - ").trim();
      }

      const category = detectCategoryFromBio(bio) || null;
      const otherSocials = extractSocialLinks(bio, "instagram");
      const websites = extractWebsites(null, bio);

      return {
        platform: "instagram",
        handle: clean,
        displayName,
        avatarUrl,
        bio,
        followerCount,
        followingCount,
        postCount,
        isVerified: html.includes('"is_verified":true'),
        category,
        externalUrl: null,
        websites,
        otherSocials,
        profileUrl: `https://www.instagram.com/${clean}/`,
        isBusinessAccount: html.includes('"is_business_account":true') || html.includes('"is_professional_account":true'),
      };
    } else {
      console.log(`[IG Scraper] ScrapingBee returned no follower data for @${clean}`);
    }
  } catch (e) {
    console.log(`[IG Scraper] ScrapingBee error for @${clean}:`, e);
  }

  return null;
}

/** Parse Instagram count strings like "600", "1,234", "12.5K", "1.2M" */
function parseIGCount(str: string): number {
  if (!str) return 0;
  const cleaned = str.replace(/,/g, "").trim();
  const match = cleaned.match(/^([\d.]+)([KMB])?$/i);
  if (!match) return parseInt(cleaned, 10) || 0;
  const num = parseFloat(match[1]);
  const mult: Record<string, number> = { K: 1000, M: 1000000, B: 1000000000 };
  return Math.round(num * (match[2] ? mult[match[2].toUpperCase()] || 1 : 1));
}

async function fetchXProfile(
  handle: string
): Promise<SocialProfile | null> {
  const clean = handle.replace(/^@/, "").trim().toLowerCase();

  // Try ScrapingBee proxy first
  try {
    console.log(`[X Scraper] Trying ScrapingBee proxy for @${clean}`);
    const html = await fetchViaProxy(`https://x.com/${clean}`);
    if (html && html.length > 1000) {
      const nameMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
      const descMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
      const imgMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
      
      // Parse followers from various patterns
      let followerCount = 0;
      let followingCount = 0;
      const followersPatterns = [
        /"followers_count"\s*:\s*(\d+)/,
        /"followersCount"\s*:\s*(\d+)/,
        /([\d,.]+[KMB]?)\s*Followers/i,
      ];
      for (const p of followersPatterns) {
        const m = html.match(p);
        if (m) { followerCount = parseIGCount(m[1]); break; }
      }
      const followingPatterns = [
        /"friends_count"\s*:\s*(\d+)/,
        /([\d,.]+[KMB]?)\s*Following/i,
      ];
      for (const p of followingPatterns) {
        const m = html.match(p);
        if (m) { followingCount = parseIGCount(m[1]); break; }
      }

      let displayName = clean;
      if (nameMatch) {
        const n = nameMatch[1].replace(/\s*\(@[^)]+\).*$/, "").replace(/ on X$/, "").replace(/ \/ X$/, "").trim();
        if (n) displayName = n;
      }

      let bio: string | null = null;
      if (descMatch) bio = descMatch[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
      // Strip the Twitter boilerplate from bio
      if (bio && bio.startsWith("Latest posts from")) bio = null;

      let avatarUrl: string | null = null;
      if (imgMatch) avatarUrl = imgMatch[1].replace(/&amp;/g, "&");

      if (followerCount > 0 || displayName !== clean) {
        console.log(`[X Scraper] ScrapingBee success: @${clean} = ${followerCount} followers`);
        const otherSocials = extractSocialLinks(bio, "x");
        const websites = extractWebsites(null, bio);
        return {
          platform: "x",
          handle: clean,
          displayName,
          avatarUrl,
          bio,
          followerCount,
          followingCount,
          postCount: 0,
          isVerified: html.includes('"is_blue_verified":true') || html.includes('"verified":true'),
          category: detectCategoryFromBio(bio),
          externalUrl: null,
          websites,
          otherSocials,
          profileUrl: `https://x.com/${clean}`,
          isBusinessAccount: false,
        };
      }
    }
  } catch { /* fall through */ }

  // Fallback: syndication endpoint (works sometimes)
  try {
    const res = await fetch(
      `https://syndication.twitter.com/srv/timeline-profile/screen-name/${encodeURIComponent(clean)}`,
      {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; bot)" },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const html = await res.text();

    const nameMatch = html.match(/<div[^>]*class="[^"]*UserName[^"]*"[^>]*>([^<]+)</);
    const bioMatch = html.match(/<p[^>]*class="[^"]*UserBio[^"]*"[^>]*>([^<]+)</);
    const followersMatch = html.match(/(\d[\d,.]*)\s*Followers/i);
    const followingMatch = html.match(/(\d[\d,.]*)\s*Following/i);

    const bio = bioMatch?.[1]?.trim() || null;
    const otherSocials = extractSocialLinks(bio, "x");
    const websites = extractWebsites(null, bio);

    return {
      platform: "x",
      handle: clean,
      displayName: nameMatch?.[1]?.trim() || clean,
      avatarUrl: null,
      bio,
      followerCount: followersMatch ? parseInt(followersMatch[1].replace(/[,.]/g, "")) : 0,
      followingCount: followingMatch ? parseInt(followingMatch[1].replace(/[,.]/g, "")) : 0,
      postCount: 0,
      isVerified: false,
      category: detectCategoryFromBio(bio),
      externalUrl: null,
      websites,
      otherSocials,
      profileUrl: `https://x.com/${clean}`,
      isBusinessAccount: false,
    };
  } catch {
    return null;
  }
}

async function fetchTikTokProfile(
  handle: string
): Promise<SocialProfile | null> {
  const clean = handle.replace(/^@/, "").trim().toLowerCase();
  try {
    const res = await fetch(
      `https://www.tiktok.com/@${encodeURIComponent(clean)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const html = await res.text();
    const jsonMatch = html.match(
      /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(\{.+?\})<\/script>/
    );
    if (!jsonMatch) return null;
    try {
      const data = JSON.parse(jsonMatch[1]);
      const userInfo =
        data?.["__DEFAULT_SCOPE__"]?.["webapp.user-detail"]?.userInfo;
      if (!userInfo) return null;
      const user = userInfo.user || {};
      const stats = userInfo.stats || {};

      const bio = user.signature || null;
      const bioLink = user.bioLink?.link || null;
      const searchText = [bio, bioLink].filter(Boolean).join(" ");
      const otherSocials = extractSocialLinks(searchText, "tiktok");
      const websites = extractWebsites(bioLink, bio);

      return {
        platform: "tiktok",
        handle: clean,
        displayName: user.nickname || clean,
        avatarUrl: user.avatarLarger || user.avatarMedium || null,
        bio,
        followerCount: stats.followerCount || 0,
        followingCount: stats.followingCount || 0,
        postCount: stats.videoCount || 0,
        isVerified: user.verified || false,
        category: detectCategoryFromBio(bio),
        externalUrl: bioLink,
        websites,
        otherSocials,
        profileUrl: `https://www.tiktok.com/@${clean}`,
        isBusinessAccount: false,
      };
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

async function fetchYouTubeProfile(
  handle: string
): Promise<SocialProfile | null> {
  const clean = handle.replace(/^@/, "").trim();
  try {
    const res = await fetch(
      `https://www.youtube.com/@${encodeURIComponent(clean)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const html = await res.text();
    const nameMatch = html.match(
      /"channelMetadataRenderer":\{"title":"([^"]+)"/
    );
    const descMatch = html.match(/"description":"((?:[^"\\]|\\.)*)"/);
    const subsMatch = html.match(
      /"subscriberCountText":\{"simpleText":"([\d.]+[KMB]?) subscribers"\}/
    );
    const avatarMatch = html.match(
      /"avatar":\{"thumbnails":\[\{"url":"([^"]+)"/
    );

    let subs = 0;
    if (subsMatch) {
      const raw = subsMatch[1];
      if (raw.endsWith("M")) subs = parseFloat(raw) * 1_000_000;
      else if (raw.endsWith("K")) subs = parseFloat(raw) * 1_000;
      else if (raw.endsWith("B")) subs = parseFloat(raw) * 1_000_000_000;
      else subs = parseInt(raw.replace(/[,.]/g, ""));
    }

    const desc =
      descMatch?.[1]?.replace(/\\n/g, " ").slice(0, 500) || null;
    const otherSocials = extractSocialLinks(desc, "youtube");
    const websites = extractWebsites(null, desc);

    return {
      platform: "youtube",
      handle: clean,
      displayName: nameMatch?.[1] || clean,
      avatarUrl:
        avatarMatch?.[1]?.replace(/=s\d+/, "=s400") || null,
      bio: desc,
      followerCount: subs,
      followingCount: 0,
      postCount: 0,
      isVerified: false,
      category: detectCategoryFromBio(desc),
      externalUrl: null,
      websites,
      otherSocials,
      profileUrl: `https://www.youtube.com/@${clean}`,
      isBusinessAccount: false,
    };
  } catch {
    return null;
  }
}

export async function fetchSocialProfile(
  platform: string,
  handle: string
): Promise<SocialProfile | null> {
  switch (platform) {
    case "instagram":
      return fetchInstagramProfile(handle);
    case "x":
      return fetchXProfile(handle);
    case "tiktok":
      return fetchTikTokProfile(handle);
    case "youtube":
      return fetchYouTubeProfile(handle);
    default:
      return null;
  }
}

export function buildManualProfile(
  platform: string,
  handle: string,
  data: {
    followerCount?: number;
    bio?: string;
    displayName?: string;
    niche?: string;
  }
): SocialProfile {
  const clean = handle.replace(/^@/, "").trim().toLowerCase();
  const profileUrls: Record<string, string> = {
    instagram: `https://www.instagram.com/${clean}/`,
    x: `https://x.com/${clean}`,
    tiktok: `https://www.tiktok.com/@${clean}`,
    youtube: `https://www.youtube.com/@${clean}`,
  };
  return {
    platform,
    handle: clean,
    displayName: data.displayName || clean,
    avatarUrl: null,
    bio: data.bio || null,
    followerCount: data.followerCount || 0,
    followingCount: 0,
    postCount: 0,
    isVerified: false,
    category: data.niche || null,
    externalUrl: null,
    websites: [],
    otherSocials: [],
    profileUrl: profileUrls[platform] || `https://${platform}.com/${clean}`,
    isBusinessAccount: false,
  };
}

export async function crossReferenceSocials(
  profile: SocialProfile
): Promise<SocialProfile[]> {
  const found: SocialProfile[] = [profile];
  const checkedPlatforms = new Set<string>([profile.platform]);

  // 1. Check otherSocials URLs found in bio
  for (const social of profile.otherSocials) {
    if (checkedPlatforms.has(social.platform)) continue;
    checkedPlatforms.add(social.platform);
    const fetched = await fetchSocialProfile(social.platform, social.handle);
    if (fetched) found.push(fetched);
  }

  // 2. Try same handle on other platforms
  const allPlatforms = ["instagram", "x", "tiktok", "youtube"];
  const remaining = allPlatforms.filter((p) => !checkedPlatforms.has(p));

  const results = await Promise.allSettled(
    remaining.map((p) => fetchSocialProfile(p, profile.handle))
  );

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      found.push(result.value);
    }
  }

  return found;
}
