import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { fetchSocialProfile } from "@/lib/social-scraper";

const ADMIN_EMAILS = ["inpromptyou@gmail.com", "flinchify@gmail.com"];

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.* FROM users u JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

// Generic colors to filter out when detecting brand colors
const GENERIC_COLORS = new Set([
  "#000000", "#ffffff", "#333333", "#666666", "#999999", "#cccccc",
  "#f5f5f5", "#fafafa", "#eeeeee", "#e5e5e5", "#f0f0f0", "#d4d4d4",
  "#111111", "#222222", "#444444", "#555555", "#777777", "#888888",
  "#aaaaaa", "#bbbbbb", "#dddddd", "#f8f8f8", "#f9f9f9", "#fbfbfb",
]);

function isBrandColor(hex: string): boolean {
  return !GENERIC_COLORS.has(hex.toLowerCase());
}

// Resolve a potentially relative URL against a base URL
function resolveUrl(href: string, baseUrl: string): string {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return "";
  }
}

type BrandData = {
  colors: string[];
  fonts: string[];
  isDark: boolean;
  style: string;
  ogImage: string | null;
  favicon: string | null;
  metaDescription: string;
  siteTitle: string;
};

// Extract colors, fonts, images, and style from a webpage
async function extractBrandFromUrl(url: string): Promise<BrandData> {
  const result: BrandData = {
    colors: [], fonts: [], isDark: false, style: "modern",
    ogImage: null, favicon: null, metaDescription: "", siteTitle: "",
  };
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HireACreator/1.0)" },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!res.ok) return result;
    const html = await res.text();

    // ── OG / Twitter images ──
    const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogImg) result.ogImage = resolveUrl(ogImg[1], url);

    if (!result.ogImage) {
      const twImg = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
      if (twImg) result.ogImage = resolveUrl(twImg[1], url);
    }

    // ── Favicon / logo ──
    const iconLink = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']/i)
      || html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["']/i);
    if (iconLink) result.favicon = resolveUrl(iconLink[1], url);

    // ── Meta description + title for business type detection ──
    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    if (metaDesc) result.metaDescription = metaDesc[1];

    const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    if (ogDesc && !result.metaDescription) result.metaDescription = ogDesc[1];

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) result.siteTitle = titleMatch[1].trim();

    // ── Theme-color meta ──
    const themeColor = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
    if (themeColor) result.colors.push(themeColor[1]);

    const tileColor = html.match(/<meta[^>]*name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i);
    if (tileColor) result.colors.push(tileColor[1]);

    // ── CSS custom properties (expanded patterns) ──
    const cssVars = html.match(/--(?:primary|brand|accent|main|color|bg|theme|highlight|link|cta|button|heading|text-primary|surface)[^:]*:\s*([^;}\n]+)/gi) || [];
    for (const v of cssVars) {
      const val = v.split(":").pop()?.trim() || "";
      const hexMatch = val.match(/#[0-9a-fA-F]{3,8}\b/);
      if (hexMatch) result.colors.push(hexMatch[0].length === 4
        ? `#${hexMatch[0][1]}${hexMatch[0][1]}${hexMatch[0][2]}${hexMatch[0][2]}${hexMatch[0][3]}${hexMatch[0][3]}`
        : hexMatch[0].slice(0, 7));
    }

    // ── Inline hex colors ──
    const hexColors = html.match(/#[0-9a-fA-F]{6}\b/g) || [];
    const uniqueHex = Array.from(new Set(hexColors)).slice(0, 30);
    const brandColors = uniqueHex.filter(isBrandColor);
    result.colors.push(...brandColors.slice(0, 8));

    // ── Font extraction from inline CSS ──
    const fontMatches = html.match(/font-family:\s*["']?([^;"'}\n]+)/gi) || [];
    const fonts = fontMatches
      .map(f => f.replace(/font-family:\s*["']?/i, "").split(",")[0].trim().replace(/["']/g, ""))
      .filter(Boolean);
    result.fonts = Array.from(new Set(fonts)).filter(f =>
      !["inherit", "sans-serif", "serif", "monospace", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI"].includes(f)
    ).slice(0, 6);

    // ── Google Fonts detection ──
    const gFontLinks = html.match(/<link[^>]*href=["']([^"']*fonts\.googleapis\.com\/css2?\?[^"']+)["']/gi) || [];
    for (const linkTag of gFontLinks) {
      const hrefMatch = linkTag.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        const familyMatches = hrefMatch[1].match(/family=([^&:;]+)/g) || [];
        for (const fm of familyMatches) {
          const fontName = decodeURIComponent(fm.replace("family=", "")).replace(/\+/g, " ").split(":")[0];
          if (fontName && !result.fonts.includes(fontName)) result.fonts.push(fontName);
        }
      }
    }

    // ── @font-face detection in inline styles ──
    const fontFaceMatches = html.match(/@font-face\s*\{[^}]*font-family:\s*["']?([^;"'}\n]+)/gi) || [];
    for (const block of fontFaceMatches) {
      const nameMatch = block.match(/font-family:\s*["']?([^;"'}\n]+)/i);
      if (nameMatch) {
        const name = nameMatch[1].trim().replace(/["']/g, "");
        if (name && !result.fonts.includes(name)) result.fonts.push(name);
      }
    }

    // ── Fetch first external stylesheet for deeper extraction (up to 50KB) ──
    const cssLinkMatch = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/i)
      || html.match(/<link[^>]*href=["']([^"']+\.css[^"']*)["'][^>]*rel=["']stylesheet["']/i);
    if (cssLinkMatch) {
      try {
        const cssUrl = resolveUrl(cssLinkMatch[1], url);
        if (cssUrl) {
          const cssRes = await fetch(cssUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; HireACreator/1.0)" },
            signal: AbortSignal.timeout(5000),
          });
          if (cssRes.ok) {
            const cssText = (await cssRes.text()).slice(0, 50000);

            // Colors from external CSS
            const cssHexColors = cssText.match(/#[0-9a-fA-F]{6}\b/g) || [];
            const cssBrandColors = Array.from(new Set(cssHexColors)).filter(isBrandColor).slice(0, 6);
            result.colors.push(...cssBrandColors);

            // CSS custom properties from external stylesheet
            const extVars = cssText.match(/--(?:primary|brand|accent|main|color|bg|theme|highlight|link|cta|button|heading)[^:]*:\s*([^;}\n]+)/gi) || [];
            for (const v of extVars) {
              const val = v.split(":").pop()?.trim() || "";
              const hexMatch = val.match(/#[0-9a-fA-F]{3,8}\b/);
              if (hexMatch) result.colors.push(hexMatch[0].slice(0, 7));
            }

            // Fonts from external CSS
            const cssFontMatches = cssText.match(/font-family:\s*["']?([^;"'}\n]+)/gi) || [];
            for (const f of cssFontMatches) {
              const name = f.replace(/font-family:\s*["']?/i, "").split(",")[0].trim().replace(/["']/g, "");
              if (name && !["inherit", "sans-serif", "serif", "monospace", "system-ui", "-apple-system"].includes(name) && !result.fonts.includes(name)) {
                result.fonts.push(name);
              }
            }

            // @font-face in external CSS
            const extFontFaceBlocks = cssText.match(/@font-face\s*\{[^}]*font-family:\s*["']?([^;"'}\n]+)/gi) || [];
            for (const block of extFontFaceBlocks) {
              const nameMatch = block.match(/font-family:\s*["']?([^;"'}\n]+)/i);
              if (nameMatch) {
                const name = nameMatch[1].trim().replace(/["']/g, "");
                if (name && !result.fonts.includes(name)) result.fonts.push(name);
              }
            }
          }
        }
      } catch {}
    }

    // ── Detect dark/light ──
    const darkIndicators = (html.match(/dark-mode|dark-theme|theme-dark|color-scheme:\s*dark/gi) || []).length;
    const darkClassCount = (html.match(/class="[^"]*dark[^"]*"/gi) || []).length;
    const bgDark = html.match(/background(?:-color)?:\s*(?:#[0-3][0-9a-f]{5}|rgb\(\s*[0-5]\d)/gi);
    result.isDark = darkIndicators > 0 || darkClassCount > 3 || (bgDark != null && bgDark.length > 3);

    // ── Detect style keywords from content ──
    const textContent = (result.metaDescription + " " + result.siteTitle + " " + html.slice(0, 5000)).toLowerCase();
    if (/minimal|minimalist|clean|simple/.test(textContent)) result.style = "minimal";
    else if (/bold|vibrant|colorful|creative|artistic/.test(textContent)) result.style = "bold";
    else if (/luxury|premium|elegant|exclusive|haute/.test(textContent)) result.style = "luxury";
    else if (/tech|developer|code|software|saas|api/.test(textContent)) result.style = "tech";
    else if (/brutalist|raw|experimental/.test(textContent)) result.style = "brutalist";

    // ── Deduplicate and limit ──
    result.colors = Array.from(new Set(result.colors.map(c => c.toLowerCase()))).filter(isBrandColor).slice(0, 12);
    result.fonts = result.fonts.slice(0, 8);
  } catch {}
  return result;
}

// Score and select the best template based on brand signals
function scoreTemplates(
  isDark: boolean,
  dominantStyle: string,
  hasImage: boolean,
  description?: string,
  niche?: string | null,
  metaText?: string,
): string {
  // Template scores: higher = better match
  const scores: Record<string, number> = {};

  // All available templates
  const allTemplates = [
    "minimal", "clay", "pastel", "bold", "neon", "gradient-mesh",
    "executive", "midnight", "glass", "terminal", "developer",
    "brutalist", "retro", "showcase", "aurora", "collage",
    "trader", "educator", "founder",
  ];
  for (const t of allTemplates) scores[t] = 0;

  // Style-based scoring
  const styleScores: Record<string, Record<string, number>> = {
    minimal: { minimal: 10, clay: 8, pastel: 6, executive: 4, glass: 3 },
    bold: { bold: 10, neon: 8, "gradient-mesh": 7, aurora: 5, showcase: 4 },
    luxury: { executive: 10, midnight: 8, glass: 7, minimal: 3, showcase: 4 },
    tech: { terminal: 10, developer: 9, neon: 6, midnight: 5, glass: 3 },
    brutalist: { brutalist: 10, retro: 7, terminal: 4, bold: 3 },
    modern: { showcase: 8, aurora: 7, glass: 6, "gradient-mesh": 5, minimal: 4 },
  };
  const styleMap = styleScores[dominantStyle] || styleScores.modern;
  for (const [t, s] of Object.entries(styleMap)) scores[t] = (scores[t] || 0) + s;

  // Dark brand bonus
  if (isDark) {
    for (const t of ["midnight", "terminal", "neon", "developer", "trader"]) {
      scores[t] = (scores[t] || 0) + 6;
    }
    for (const t of ["pastel", "clay", "minimal"]) {
      scores[t] = (scores[t] || 0) - 3;
    }
  }

  // Image-present bonus (templates that showcase backgrounds well)
  if (hasImage) {
    for (const t of ["showcase", "collage", "aurora", "gradient-mesh", "glass", "midnight"]) {
      scores[t] = (scores[t] || 0) + 5;
    }
  }

  // Description keyword scoring
  if (description) {
    const desc = description.toLowerCase();
    const descMap: Record<string, string[]> = {
      dark: ["midnight", "terminal", "neon"],
      night: ["midnight", "neon"],
      minimal: ["minimal", "clay"],
      clean: ["minimal", "clay", "executive"],
      bold: ["bold", "neon", "gradient-mesh"],
      vibrant: ["bold", "aurora", "neon"],
      professional: ["executive", "founder", "minimal"],
      business: ["executive", "founder"],
      creative: ["aurora", "gradient-mesh", "showcase"],
      artistic: ["aurora", "collage", "bold"],
      tech: ["developer", "terminal"],
      developer: ["developer", "terminal"],
      trading: ["trader"],
      finance: ["trader", "executive"],
      retro: ["retro", "brutalist"],
      vintage: ["retro"],
    };
    for (const [keyword, templates] of Object.entries(descMap)) {
      if (desc.includes(keyword)) {
        for (const t of templates) scores[t] = (scores[t] || 0) + 8;
      }
    }
  }

  // Niche-based scoring
  if (niche) {
    const n = niche.toLowerCase();
    const nicheMap: Record<string, string[]> = {
      fitness: ["bold", "neon", "showcase"],
      gym: ["bold", "neon"],
      beauty: isDark ? ["glass", "midnight", "aurora"] : ["pastel", "glass", "showcase"],
      fashion: isDark ? ["glass", "midnight"] : ["pastel", "showcase", "aurora"],
      tech: ["terminal", "developer", "neon"],
      gaming: ["terminal", "neon", "bold"],
      finance: ["trader", "executive", "midnight"],
      trading: ["trader", "executive"],
      crypto: ["trader", "terminal", "neon"],
      education: ["educator", "minimal", "clay"],
      music: ["aurora", "neon", "bold"],
      art: ["aurora", "collage", "showcase"],
      executive: ["executive", "founder", "glass"],
      business: ["executive", "founder"],
      food: ["showcase", "bold", "pastel"],
      photography: ["showcase", "collage", "glass"],
      real_estate: ["executive", "showcase", "glass"],
    };
    for (const [keyword, templates] of Object.entries(nicheMap)) {
      if (n.includes(keyword)) {
        for (const t of templates) scores[t] = (scores[t] || 0) + 7;
      }
    }
  }

  // Meta text business type detection
  if (metaText) {
    const mt = metaText.toLowerCase();
    if (/photography|photo|portfolio/.test(mt)) { scores["showcase"] += 5; scores["collage"] += 4; }
    if (/restaurant|food|menu|chef/.test(mt)) { scores["showcase"] += 4; scores["bold"] += 3; }
    if (/agency|studio|design/.test(mt)) { scores["aurora"] += 4; scores["glass"] += 3; }
    if (/consulting|law|accounting/.test(mt)) { scores["executive"] += 5; scores["minimal"] += 3; }
    if (/startup|saas|app/.test(mt)) { scores["developer"] += 4; scores["glass"] += 3; }
  }

  // Pick highest scoring template
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

// Map extracted data to our template system
function generateDesignFromBrand(
  brandData: BrandData[],
  description?: string,
  niche?: string | null
): {
  template: string;
  bgType: string;
  bgValue: string;
  textColor: string;
  buttonShape: string;
  font: string;
  accent: string;
} {
  // Merge all brand data
  const allColors = brandData.flatMap(b => b.colors);
  const allFonts = brandData.flatMap(b => b.fonts);
  const isDark = brandData.some(b => b.isDark);
  const styles = brandData.map(b => b.style);

  // Pick the best og:image across all references
  const ogImages = brandData.map(b => b.ogImage).filter(Boolean) as string[];
  const bestOgImage = ogImages[0] || null;

  // Collect meta text for business type detection
  const metaText = brandData.map(b => `${b.siteTitle} ${b.metaDescription}`).join(" ");

  // Pick primary brand color (most frequent non-gray)
  const colorFreq: Record<string, number> = {};
  for (const c of allColors) {
    const lower = c.toLowerCase();
    colorFreq[lower] = (colorFreq[lower] || 0) + 1;
  }
  const sortedColors = Object.entries(colorFreq).sort((a, b) => b[1] - a[1]).map(e => e[0]);
  const primaryColor = sortedColors[0] || "#3b82f6";
  const secondaryColor = sortedColors[1] || sortedColors[0] || "#8b5cf6";

  // Score-based template selection
  const dominantStyle = styles[0] || "modern";
  const template = scoreTemplates(isDark, dominantStyle, !!bestOgImage, description, niche, metaText);

  // Background: use og:image if available, otherwise generate gradient
  let bgType: string;
  let bgValue: string;

  if (bestOgImage) {
    bgType = "image";
    bgValue = bestOgImage;
  } else {
    bgType = "gradient";
    bgValue = isDark
      ? `linear-gradient(135deg, ${primaryColor}22 0%, #0a0a0a 50%, ${secondaryColor}15 100%)`
      : `linear-gradient(135deg, ${primaryColor}15 0%, #ffffff 50%, ${secondaryColor}10 100%)`;
  }

  // Text color with proper contrast
  // If we have a background image, text should be white (overlay will darken it)
  // If dark brand, use white; otherwise dark text
  const textColor = (bgType === "image" || isDark) ? "#ffffff" : "#171717";

  // Map fonts more accurately
  const fontMap: Record<string, string> = {
    "inter": "inter", "roboto": "inter", "helvetica": "inter", "helvetica neue": "inter",
    "arial": "inter", "sf pro": "inter", "sf pro display": "inter",
    "poppins": "poppins", "montserrat": "poppins", "raleway": "poppins", "nunito": "poppins",
    "playfair": "playfair", "georgia": "playfair", "merriweather": "playfair",
    "lora": "playfair", "crimson": "playfair", "cormorant": "playfair", "libre baskerville": "playfair",
    "dm sans": "dm-sans", "open sans": "dm-sans", "source sans": "dm-sans", "noto sans": "dm-sans",
    "lato": "dm-sans", "work sans": "dm-sans", "karla": "dm-sans",
    "outfit": "outfit", "space grotesk": "outfit", "sora": "outfit", "general sans": "outfit",
    "cabinet grotesk": "outfit", "clash display": "outfit", "satoshi": "outfit",
    "fira code": "fira-code", "jetbrains mono": "fira-code", "source code": "fira-code",
    "ibm plex mono": "fira-code", "cascadia code": "fira-code",
    "plus jakarta": "jakarta", "jakarta": "jakarta", "plus jakarta sans": "jakarta",
    "manrope": "outfit", "urbanist": "outfit", "figtree": "dm-sans",
    "geist": "inter", "cal sans": "outfit",
  };
  let font = "inter";
  for (const f of allFonts) {
    const lower = f.toLowerCase();
    const match = Object.entries(fontMap).find(([key]) => lower.includes(key));
    if (match) { font = match[1]; break; }
  }

  // Button shape based on style
  const shapeMap: Record<string, string> = {
    minimal: "soft", bold: "rounded", luxury: "pill", tech: "square", brutalist: "square", modern: "rounded",
  };
  const buttonShape = shapeMap[dominantStyle] || "rounded";

  // Generate accent (use primary brand color)
  const accent = primaryColor;

  return { template, bgType, bgValue, textColor, buttonShape, font, accent };
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json();
    const { referenceUrls, brandDescription, targetUserId } = body as {
      referenceUrls?: string[];
      brandDescription?: string;
      targetUserId?: string;
    };

    // Admin mode: allow designing for another user
    const isAdmin = ADMIN_EMAILS.includes(user.email as string);
    const designForUserId = (isAdmin && targetUserId) ? targetUserId : user.id;

    const sql = getDb();

    // Get target user's social data
    const socials = await sql`SELECT * FROM social_connections WHERE user_id = ${designForUserId}`;
    const targetUser = designForUserId !== user.id
      ? (await sql`SELECT * FROM users WHERE id = ${designForUserId}`)[0]
      : user;

    // Fetch social profile for niche detection
    let niche: string | null = (targetUser?.category as string) || null;
    if (!niche && socials.length > 0) {
      try {
        const p = await fetchSocialProfile(socials[0].platform as string, socials[0].handle as string);
        if (p?.category) niche = p.category;
      } catch {}
    }

    // Extract brand data from reference URLs (parallel for speed)
    const urls = (referenceUrls || []).filter(u => u && u.startsWith("http")).slice(0, 5);
    const extractions = await Promise.all(urls.map(u => extractBrandFromUrl(u)));
    const brandData = extractions.filter(d => d.colors.length > 0 || d.fonts.length > 0 || d.ogImage);

    // If no reference URLs provided, try to extract from user's connected social profiles
    if (brandData.length === 0) {
      for (const social of socials.slice(0, 2)) {
        const profileUrl = social.url as string;
        if (profileUrl) {
          const data = await extractBrandFromUrl(profileUrl);
          if (data.colors.length > 0 || data.ogImage) brandData.push(data);
        }
      }
    }

    // If still nothing, use a default modern style
    if (brandData.length === 0) {
      brandData.push({
        colors: ["#3b82f6"], fonts: [], isDark: false, style: "modern",
        ogImage: null, favicon: null, metaDescription: "", siteTitle: "",
      });
    }

    const design = generateDesignFromBrand(brandData, brandDescription, niche);

    // Save the design to user's profile (including accent)
    await sql`
      UPDATE users SET
        link_bio_template = ${design.template},
        link_bio_bg_type = ${design.bgType},
        link_bio_bg_value = ${design.bgValue},
        link_bio_text_color = ${design.textColor},
        link_bio_button_shape = ${design.buttonShape},
        link_bio_font = ${design.font},
        link_bio_accent = ${design.accent},
        updated_at = NOW()
      WHERE id = ${designForUserId}
    `;

    return NextResponse.json({
      success: true,
      design,
      extractedFrom: urls.length,
      niche,
    });
  } catch (e: any) {
    console.error("[ai-design-v2] Error:", e);
    return NextResponse.json({ error: "AI design failed" }, { status: 500 });
  }
}
