import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { generateSlug } from "@/lib/claim-scoring";
import { designProfile } from "@/lib/ai-profile-designer";

const SOCIAL_URL_PATTERNS: { platform: string; regex: RegExp; handleGroup: number }[] = [
  { platform: "youtube", regex: /(?:youtube\.com\/(?:@|channel\/|c\/|user\/))([\w.-]+)/i, handleGroup: 1 },
  { platform: "tiktok", regex: /tiktok\.com\/@?([\w.-]+)/i, handleGroup: 1 },
  { platform: "x", regex: /(?:twitter\.com|x\.com)\/([\w]+)/i, handleGroup: 1 },
  { platform: "instagram", regex: /instagram\.com\/([\w.]+)/i, handleGroup: 1 },
  { platform: "twitch", regex: /twitch\.tv\/([\w]+)/i, handleGroup: 1 },
  { platform: "facebook", regex: /facebook\.com\/([\w.]+)/i, handleGroup: 1 },
  { platform: "snapchat", regex: /snapchat\.com\/add\/([\w.]+)/i, handleGroup: 1 },
  { platform: "pinterest", regex: /pinterest\.com\/([\w.]+)/i, handleGroup: 1 },
  { platform: "linkedin", regex: /linkedin\.com\/in\/([\w-]+)/i, handleGroup: 1 },
  { platform: "spotify", regex: /open\.spotify\.com\/(artist|user)\/([\w]+)/i, handleGroup: 2 },
  { platform: "github", regex: /github\.com\/([\w-]+)/i, handleGroup: 1 },
];

async function getAdminUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id FROM users u JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW() AND u.role = 'admin'
  `;
  return rows.length > 0 ? rows[0] : null;
}

function detectPlatformFromUrl(url: string): { platform: string; handle: string } | null {
  for (const p of SOCIAL_URL_PATTERNS) {
    const match = url.match(p.regex);
    if (match) {
      const handle = match[p.handleGroup]?.replace(/[/?#].*$/, "") || "";
      if (handle && handle.length > 1) return { platform: p.platform, handle };
    }
  }
  return null;
}

function parseImportedHtml(html: string, sourceUrl: string) {
  // Extract OG tags
  const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i)?.[1] || null;
  const ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i)?.[1] || null;
  const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)?.[1]?.replace(/&amp;/g, "&") || null;

  // Fallback: try <title> tag
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || null;
  const name = ogTitle || titleTag || null;

  // Extract all external links from <a href="">
  const linkRegex = /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>([^<]*)<\/a>/gi;
  const allLinks: { url: string; title: string }[] = [];
  let linkMatch;
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const url = linkMatch[1].replace(/&amp;/g, "&");
    const title = linkMatch[2].replace(/<[^>]*>/g, "").trim();
    // Skip internal links, tracking links that redirect to the same domain
    const sourceHost = new URL(sourceUrl).hostname;
    try {
      const linkHost = new URL(url).hostname;
      if (linkHost === sourceHost) continue;
      // Skip common tracking/internal patterns
      if (url.includes("/redirect") || url.includes("linktr.ee/") || url.includes("stan.store/") || url.includes("hoo.be/")) continue;
    } catch { continue; }
    allLinks.push({ url, title: title || url });
  }

  // Deduplicate links
  const seen = new Set<string>();
  const uniqueLinks = allLinks.filter((l) => {
    const key = l.url.replace(/\/$/, "").toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Classify links into socials vs bio links
  const socials: { platform: string; handle: string; url: string }[] = [];
  const bioLinks: { title: string; url: string }[] = [];

  for (const link of uniqueLinks) {
    const detected = detectPlatformFromUrl(link.url);
    if (detected) {
      if (!socials.some((s) => s.platform === detected.platform)) {
        socials.push({ platform: detected.platform, handle: detected.handle, url: link.url });
      }
    } else {
      bioLinks.push({ title: link.title || new URL(link.url).hostname.replace(/^www\./, ""), url: link.url });
    }
  }

  return { name, bio: ogDesc, avatar: ogImage, socials, bioLinks };
}

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL is a supported platform
    let parsedUrl: URL;
    try { parsedUrl = new URL(url); } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const supportedHosts = ["linktr.ee", "stan.store", "hoo.be", "www.linktr.ee", "www.stan.store", "www.hoo.be"];
    if (!supportedHosts.some((h) => parsedUrl.hostname === h || parsedUrl.hostname.endsWith("." + h))) {
      return NextResponse.json({ error: "Only Linktree, Stan Store, and Hoo.be URLs are supported" }, { status: 400 });
    }

    // Scrape via ScrapingBee
    const apiKey = process.env.SCRAPINGBEE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ScrapingBee API key not configured" }, { status: 500 });
    }

    // Try multiple scraping strategies
    let html = "";
    
    // Strategy 1: ScrapingBee with stealth and JS rendering
    const strategies: Record<string, string>[] = [
      { render_js: "true", premium_proxy: "true", stealth_proxy: "true" },
      { render_js: "true", premium_proxy: "true" },
      { render_js: "false", premium_proxy: "true" },
      { render_js: "false" },
    ];
    
    for (const strategy of strategies) {
      try {
        const params = new URLSearchParams({ api_key: apiKey, url, ...strategy } as Record<string, string>);
        const scrapeRes = await fetch(`https://app.scrapingbee.com/api/v1/?${params}`, {
          signal: AbortSignal.timeout(20000),
        });
        if (scrapeRes.ok) {
          html = await scrapeRes.text();
          if (html.length > 500) break; // Got real content
        }
      } catch { continue; }
    }

    // Strategy 2: Direct fetch with Googlebot UA as fallback
    if (html.length < 500) {
      try {
        const directRes = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", "Accept": "text/html" },
          signal: AbortSignal.timeout(10000),
          redirect: "follow",
        });
        if (directRes.ok) html = await directRes.text();
      } catch {}
    }

    if (html.length < 100) {
      return NextResponse.json({ error: "Could not scrape this URL. The site may be blocking automated access." }, { status: 502 });
    }

    // Parse the HTML
    const parsed = parseImportedHtml(html, url);
    if (!parsed.name) {
      return NextResponse.json({ error: "Could not extract profile name from URL" }, { status: 422 });
    }

    // Determine a handle/slug from the URL path
    const pathHandle = parsedUrl.pathname.replace(/^\//, "").replace(/\/.*$/, "").toLowerCase();
    if (!pathHandle) {
      return NextResponse.json({ error: "Could not determine handle from URL" }, { status: 422 });
    }

    // Determine source platform
    let sourcePlatform = "linktree";
    if (parsedUrl.hostname.includes("stan.store")) sourcePlatform = "stanstore";
    else if (parsedUrl.hostname.includes("hoo.be")) sourcePlatform = "hoobe";

    const db = getDb();

    // Generate slug
    let slug = generateSlug("instagram", pathHandle); // Use raw handle as slug
    const slugCheck = await db`
      SELECT 1 FROM users WHERE slug = ${slug}
      UNION ALL
      SELECT 1 FROM claimed_profiles WHERE auto_profile_slug = ${slug}
    `;
    if (slugCheck.length > 0) {
      slug = `${slug}-${sourcePlatform}`;
      const doubleCheck = await db`
        SELECT 1 FROM users WHERE slug = ${slug}
        UNION ALL
        SELECT 1 FROM claimed_profiles WHERE auto_profile_slug = ${slug}
      `;
      if (doubleCheck.length > 0) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }
    }

    // Generate design from parsed data
    const profileForDesign = {
      platform: "instagram" as const,
      handle: pathHandle,
      displayName: parsed.name,
      avatarUrl: parsed.avatar,
      bio: parsed.bio,
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
      isVerified: false,
      category: null,
      externalUrl: null,
      websites: [] as string[],
      otherSocials: [] as { platform: string; url: string; handle: string }[],
      profileUrl: url,
      isBusinessAccount: false,
    };
    const design = designProfile(profileForDesign);

    // Ensure design columns exist
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_template VARCHAR(50)`.catch(() => {});
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_bg_type VARCHAR(20)`.catch(() => {});
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_bg_value TEXT`.catch(() => {});
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_text_color VARCHAR(20)`.catch(() => {});
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_font VARCHAR(50)`.catch(() => {});
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_button_shape VARCHAR(20)`.catch(() => {});
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_headline TEXT`.catch(() => {});
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS auto_socials JSONB DEFAULT '[]'`.catch(() => {});
    await db`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS auto_bio_links JSONB DEFAULT '[]'`.catch(() => {});

    // Insert claimed_profiles entry
    // Use the first detected social platform, or default to "instagram"
    const primaryPlatform = parsed.socials[0]?.platform || "instagram";
    const primaryHandle = parsed.socials[0]?.handle || pathHandle;

    await db`
      INSERT INTO claimed_profiles (
        platform, platform_handle, display_name, avatar_url, bio,
        follower_count, niche, creator_score, score_breakdown,
        estimated_post_value, auto_profile_slug,
        source_post_url,
        link_bio_template, link_bio_bg_type, link_bio_bg_value, link_bio_text_color,
        link_bio_font, link_bio_button_shape, link_bio_headline,
        auto_socials, auto_bio_links
      ) VALUES (
        ${primaryPlatform}, ${primaryHandle}, ${parsed.name},
        ${parsed.avatar}, ${parsed.bio}, ${0},
        ${"general"}, ${0}, ${"{}"},
        ${0}, ${slug},
        ${url},
        ${design.template}, ${design.bgType}, ${design.bgValue}, ${design.textColor},
        ${design.font}, ${design.buttonShape}, ${design.suggestedHeadline},
        ${JSON.stringify(parsed.socials)}, ${JSON.stringify(parsed.bioLinks)}
      )
      ON CONFLICT (platform, platform_handle) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        avatar_url = COALESCE(EXCLUDED.avatar_url, claimed_profiles.avatar_url),
        bio = COALESCE(EXCLUDED.bio, claimed_profiles.bio),
        auto_socials = EXCLUDED.auto_socials,
        auto_bio_links = EXCLUDED.auto_bio_links,
        link_bio_template = EXCLUDED.link_bio_template,
        link_bio_bg_type = EXCLUDED.link_bio_bg_type,
        link_bio_bg_value = EXCLUDED.link_bio_bg_value,
        link_bio_text_color = EXCLUDED.link_bio_text_color,
        link_bio_font = EXCLUDED.link_bio_font,
        link_bio_button_shape = EXCLUDED.link_bio_button_shape,
        link_bio_headline = EXCLUDED.link_bio_headline,
        updated_at = NOW()
    `;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hireacreator.ai";
    const profileUrl = `${baseUrl}/u/${slug}`;
    const claimUrl = `${baseUrl}/claim/${slug}`;

    return NextResponse.json({
      slug,
      profileUrl,
      claimUrl,
      name: parsed.name,
      bio: parsed.bio,
      avatar: parsed.avatar,
      socialsCount: parsed.socials.length,
      bioLinksCount: parsed.bioLinks.length,
    });
  } catch (e: any) {
    console.error("[import-profile] Error:", e);
    return NextResponse.json({ error: e.message || "Import failed" }, { status: 500 });
  }
}
