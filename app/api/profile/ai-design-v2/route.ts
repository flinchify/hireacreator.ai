import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { fetchSocialProfile } from "@/lib/social-scraper";
import { extractBrandFromUrl, isBrandColor } from "@/lib/brand-extractor";
import type { BrandData } from "@/lib/brand-extractor";

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

// Score and select the best template based on brand signals
function scoreTemplates(
  isDark: boolean,
  dominantStyle: string,
  hasImage: boolean,
  description?: string,
  niche?: string | null,
  metaText?: string,
): string {
  const scores: Record<string, number> = {};

  const allTemplates = [
    "minimal", "clay", "pastel", "bold", "neon", "gradient-mesh",
    "executive", "midnight", "glass", "terminal", "developer",
    "brutalist", "retro", "showcase", "aurora", "collage",
    "trader", "educator", "founder",
  ];
  for (const t of allTemplates) scores[t] = 0;

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

  if (isDark) {
    for (const t of ["midnight", "terminal", "neon", "developer", "trader"]) {
      scores[t] = (scores[t] || 0) + 6;
    }
    for (const t of ["pastel", "clay", "minimal"]) {
      scores[t] = (scores[t] || 0) - 3;
    }
  }

  if (hasImage) {
    for (const t of ["showcase", "collage", "aurora", "gradient-mesh", "glass", "midnight"]) {
      scores[t] = (scores[t] || 0) + 5;
    }
  }

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

  if (metaText) {
    const mt = metaText.toLowerCase();
    if (/photography|photo|portfolio/.test(mt)) { scores["showcase"] += 5; scores["collage"] += 4; }
    if (/restaurant|food|menu|chef/.test(mt)) { scores["showcase"] += 4; scores["bold"] += 3; }
    if (/agency|studio|design/.test(mt)) { scores["aurora"] += 4; scores["glass"] += 3; }
    if (/consulting|law|accounting/.test(mt)) { scores["executive"] += 5; scores["minimal"] += 3; }
    if (/startup|saas|app/.test(mt)) { scores["developer"] += 4; scores["glass"] += 3; }
  }

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
  const allColors = brandData.flatMap(b => b.colors);
  const allFonts = brandData.flatMap(b => b.fonts);
  const isDark = brandData.some(b => b.isDark);
  const styles = brandData.map(b => b.style);

  const ogImages = brandData.map(b => b.ogImage).filter(Boolean) as string[];
  const bestOgImage = ogImages[0] || null;

  const metaText = brandData.map(b => `${b.siteTitle} ${b.metaDescription}`).join(" ");

  const colorFreq: Record<string, number> = {};
  for (const c of allColors) {
    const lower = c.toLowerCase();
    colorFreq[lower] = (colorFreq[lower] || 0) + 1;
  }
  const sortedColors = Object.entries(colorFreq).sort((a, b) => b[1] - a[1]).map(e => e[0]);
  const primaryColor = sortedColors[0] || "#3b82f6";
  const secondaryColor = sortedColors[1] || sortedColors[0] || "#8b5cf6";

  const dominantStyle = styles[0] || "modern";
  const template = scoreTemplates(isDark, dominantStyle, !!bestOgImage, description, niche, metaText);

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

  const textColor = (bgType === "image" || isDark) ? "#ffffff" : "#171717";

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

  const shapeMap: Record<string, string> = {
    minimal: "soft", bold: "rounded", luxury: "pill", tech: "square", brutalist: "square", modern: "rounded",
  };
  const buttonShape = shapeMap[dominantStyle] || "rounded";

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

    const isAdmin = ADMIN_EMAILS.includes(user.email as string);
    const designForUserId = (isAdmin && targetUserId) ? targetUserId : user.id;

    const sql = getDb();

    const socials = await sql`SELECT * FROM social_connections WHERE user_id = ${designForUserId}`;
    const targetUser = designForUserId !== user.id
      ? (await sql`SELECT * FROM users WHERE id = ${designForUserId}`)[0]
      : user;

    let niche: string | null = (targetUser?.category as string) || null;
    if (!niche && socials.length > 0) {
      try {
        const p = await fetchSocialProfile(socials[0].platform as string, socials[0].handle as string);
        if (p?.category) niche = p.category;
      } catch {}
    }

    const urls = (referenceUrls || []).filter(u => u && u.startsWith("http")).slice(0, 5);
    const extractions = await Promise.all(urls.map(u => extractBrandFromUrl(u)));
    const brandData = extractions.filter(d => d.colors.length > 0 || d.fonts.length > 0 || d.ogImage);

    if (brandData.length === 0) {
      for (const social of socials.slice(0, 2)) {
        const profileUrl = social.url as string;
        if (profileUrl) {
          const data = await extractBrandFromUrl(profileUrl);
          if (data.colors.length > 0 || data.ogImage) brandData.push(data);
        }
      }
    }

    if (brandData.length === 0) {
      brandData.push({
        colors: ["#3b82f6"], fonts: [], isDark: false, style: "modern",
        ogImage: null, favicon: null, logo: null, metaDescription: "", siteTitle: "",
      });
    }

    const design = generateDesignFromBrand(brandData, brandDescription, niche);

    const suggestedLogo = brandData.map(b => b.logo).filter(Boolean)[0] || null;

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
      design: { ...design, suggestedLogo },
      extractedFrom: urls.length,
      niche,
    });
  } catch (e: any) {
    console.error("[ai-design-v2] Error:", e);
    return NextResponse.json({ error: "AI design failed" }, { status: 500 });
  }
}
