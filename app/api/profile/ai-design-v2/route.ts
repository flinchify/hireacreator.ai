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

// Extract colors and style from a webpage
async function extractBrandFromUrl(url: string): Promise<{
  colors: string[];
  fonts: string[];
  isDark: boolean;
  style: string;
}> {
  const result = { colors: [] as string[], fonts: [] as string[], isDark: false, style: "modern" };
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HireACreator/1.0)" },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!res.ok) return result;
    const html = await res.text();

    // Extract theme-color
    const themeColor = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
    if (themeColor) result.colors.push(themeColor[1]);

    // Extract msapplication-TileColor
    const tileColor = html.match(/<meta[^>]*name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i);
    if (tileColor) result.colors.push(tileColor[1]);

    // Extract hex colors from CSS variables and inline styles
    const hexColors = html.match(/#[0-9a-fA-F]{6}\b/g) || [];
    const uniqueHex = Array.from(new Set(hexColors)).slice(0, 20);
    
    // Filter out common generic colors (black, white, grays)
    const brandColors = uniqueHex.filter(c => {
      const lower = c.toLowerCase();
      return !["#000000", "#ffffff", "#333333", "#666666", "#999999", "#cccccc", "#f5f5f5", "#fafafa", "#eeeeee", "#e5e5e5", "#f0f0f0", "#d4d4d4"].includes(lower);
    });
    result.colors.push(...brandColors.slice(0, 6));

    // Extract font families from CSS
    const fontMatches = html.match(/font-family:\s*["']?([^;"'}\n]+)/gi) || [];
    const fonts = fontMatches.map(f => f.replace(/font-family:\s*["']?/i, "").split(",")[0].trim().replace(/["']/g, ""));
    result.fonts = Array.from(new Set(fonts)).filter(f => !["inherit", "sans-serif", "serif", "monospace", "system-ui", "-apple-system"].includes(f.toLowerCase())).slice(0, 4);

    // CSS variables for brand colors
    const cssVars = html.match(/--(?:primary|brand|accent|main)[^:]*:\s*([^;}\n]+)/gi) || [];
    for (const v of cssVars) {
      const val = v.split(":").pop()?.trim();
      if (val && val.startsWith("#")) result.colors.push(val);
    }

    // Detect dark/light
    const darkIndicators = (html.match(/dark/gi) || []).length;
    const bgDark = html.match(/background(?:-color)?:\s*(?:#[0-3][0-9a-f]{5}|rgb\(\s*[0-5]\d)/gi);
    result.isDark = darkIndicators > 5 || (bgDark && bgDark.length > 3) || false;

    // Detect style keywords
    if (html.match(/minimal|minimalist|clean/gi)) result.style = "minimal";
    else if (html.match(/bold|vibrant|colorful|creative/gi)) result.style = "bold";
    else if (html.match(/luxury|premium|elegant/gi)) result.style = "luxury";
    else if (html.match(/tech|developer|code/gi)) result.style = "tech";
    else if (html.match(/brutalist|raw|experimental/gi)) result.style = "brutalist";

    // Deduplicate colors
    result.colors = Array.from(new Set(result.colors)).slice(0, 8);
  } catch {}
  return result;
}

// Map extracted data to our template system
function generateDesignFromBrand(
  brandData: { colors: string[]; fonts: string[]; isDark: boolean; style: string }[],
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

  // Pick primary brand color (most common non-gray)
  const colorFreq: Record<string, number> = {};
  for (const c of allColors) {
    const lower = c.toLowerCase();
    colorFreq[lower] = (colorFreq[lower] || 0) + 1;
  }
  const sortedColors = Object.entries(colorFreq).sort((a, b) => b[1] - a[1]).map(e => e[0]);
  const primaryColor = sortedColors[0] || "#3b82f6";
  const secondaryColor = sortedColors[1] || sortedColors[0] || "#8b5cf6";

  // Map style to template
  const styleMap: Record<string, string[]> = {
    minimal: ["minimal", "clay", "pastel"],
    bold: ["bold", "neon", "gradient-mesh"],
    luxury: ["executive", "midnight", "glass"],
    tech: ["terminal", "developer", "neon"],
    brutalist: ["brutalist", "retro"],
    modern: ["showcase", "aurora", "glass"],
  };

  const dominantStyle = styles[0] || "modern";
  const templateOptions = styleMap[dominantStyle] || styleMap.modern;

  // If dark brand, prefer dark templates
  let template = templateOptions[0];
  if (isDark) {
    const darkTemplates = ["midnight", "terminal", "neon", "developer", "trader"];
    template = darkTemplates.find(t => templateOptions.includes(t)) || templateOptions[0];
  }

  // Description overrides
  if (description) {
    const desc = description.toLowerCase();
    if (desc.includes("dark") || desc.includes("night")) template = "midnight";
    if (desc.includes("minimal") || desc.includes("clean")) template = "minimal";
    if (desc.includes("bold") || desc.includes("vibrant")) template = "bold";
    if (desc.includes("professional") || desc.includes("business")) template = "executive";
    if (desc.includes("creative") || desc.includes("artistic")) template = "aurora";
    if (desc.includes("tech") || desc.includes("developer")) template = "developer";
    if (desc.includes("trading") || desc.includes("finance")) template = "trader";
    if (desc.includes("retro") || desc.includes("vintage")) template = "retro";
  }

  // Niche overrides
  if (niche) {
    const n = niche.toLowerCase();
    if (n.includes("fitness") || n.includes("gym")) template = "bold";
    if (n.includes("beauty") || n.includes("fashion")) template = isDark ? "glass" : "pastel";
    if (n.includes("tech") || n.includes("gaming")) template = "terminal";
    if (n.includes("finance") || n.includes("trading") || n.includes("crypto")) template = "trader";
    if (n.includes("education")) template = "educator";
    if (n.includes("music") || n.includes("art")) template = "aurora";
    if (n.includes("executive") || n.includes("business")) template = "executive";
  }

  // Generate gradient from brand colors
  const bgType = "gradient";
  const bgValue = isDark
    ? `linear-gradient(135deg, ${primaryColor}22 0%, #0a0a0a 50%, ${secondaryColor}15 100%)`
    : `linear-gradient(135deg, ${primaryColor}15 0%, #ffffff 50%, ${secondaryColor}10 100%)`;

  const textColor = isDark ? "#ffffff" : "#171717";

  // Map fonts to our available fonts
  const fontMap: Record<string, string> = {
    "inter": "inter", "roboto": "inter", "helvetica": "inter",
    "poppins": "poppins", "montserrat": "poppins",
    "playfair": "playfair", "georgia": "playfair", "merriweather": "playfair",
    "dm sans": "dm-sans", "open sans": "dm-sans",
    "outfit": "outfit", "space grotesk": "outfit",
    "fira code": "fira-code", "jetbrains mono": "fira-code", "source code": "fira-code",
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

  return { template, bgType, bgValue, textColor, buttonShape, font, accent: primaryColor };
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

    // Extract brand data from reference URLs
    const brandData = [];
    const urls = (referenceUrls || []).filter(u => u && u.startsWith("http")).slice(0, 5);
    for (const url of urls) {
      const data = await extractBrandFromUrl(url);
      if (data.colors.length > 0 || data.fonts.length > 0) {
        brandData.push(data);
      }
    }

    // If no reference URLs provided, try to extract from user's connected social profiles
    if (brandData.length === 0) {
      for (const social of socials.slice(0, 2)) {
        const profileUrl = social.url as string;
        if (profileUrl) {
          const data = await extractBrandFromUrl(profileUrl);
          if (data.colors.length > 0) brandData.push(data);
        }
      }
    }

    // If still nothing, use a default modern style
    if (brandData.length === 0) {
      brandData.push({ colors: ["#3b82f6"], fonts: [], isDark: false, style: "modern" });
    }

    const design = generateDesignFromBrand(brandData, brandDescription, niche);

    // Save the design to user's profile
    await sql`
      UPDATE users SET
        link_bio_template = ${design.template},
        link_bio_bg_type = ${design.bgType},
        link_bio_bg_value = ${design.bgValue},
        link_bio_text_color = ${design.textColor},
        link_bio_button_shape = ${design.buttonShape},
        link_bio_font = ${design.font},
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
