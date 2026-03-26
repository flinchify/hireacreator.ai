import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { extractBrandFromUrl, extractLogos, detectContentType } from "@/lib/brand-extractor";
import type { BrandDNA } from "@/lib/brand-extractor";

/* ------------------------------------------------------------------ */
/*  Auth helper                                                        */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  SSRF-safe URL validation                                           */
/* ------------------------------------------------------------------ */

const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^0\.0\.0\.0$/,
  /^\[::1\]$/,
  /^::1$/,
  /^0+$/,
  /^fd[0-9a-f]{2}:/i,   // IPv6 private
  /^fe80:/i,             // IPv6 link-local
  /^fc00:/i,             // IPv6 ULA
  /^169\.254\.\d+\.\d+$/, // link-local
];

function isBlockedUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    const hostname = url.hostname;
    return BLOCKED_HOST_PATTERNS.some((p) => p.test(hostname));
  } catch {
    return true; // unparseable = blocked
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/ai-designer/analyze                                      */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    /* ---- auth ---- */
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* ---- parse body ---- */
    const body = await req.json();
    const {
      referenceUrls,
      brandName,
      brandDescription,
      audience,
      goal,
      logoAssetUrl,
      paletteHex,
    } = body as {
      referenceUrls?: string[];
      brandName?: string;
      brandDescription?: string;
      audience?: string;
      goal?: string;
      logoAssetUrl?: string;
      paletteHex?: string[];
    };

    /* ---- validate referenceUrls ---- */
    if (!referenceUrls || !Array.isArray(referenceUrls) || referenceUrls.length < 1) {
      return NextResponse.json(
        { error: "referenceUrls must be an array of 1-5 URLs" },
        { status: 400 },
      );
    }
    if (referenceUrls.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 reference URLs allowed" },
        { status: 400 },
      );
    }

    const invalidUrls: string[] = [];
    const blockedUrls: string[] = [];

    for (const url of referenceUrls) {
      if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
        invalidUrls.push(url);
      } else if (isBlockedUrl(url)) {
        blockedUrls.push(url);
      }
    }

    if (invalidUrls.length > 0) {
      return NextResponse.json(
        { error: `Invalid URL(s): URLs must start with http:// or https://`, invalidUrls },
        { status: 400 },
      );
    }
    if (blockedUrls.length > 0) {
      return NextResponse.json(
        { error: "One or more URLs point to internal/private addresses and are not allowed", blockedUrls },
        { status: 400 },
      );
    }

    /* ---- extract brand data from every URL in parallel ---- */
    const extractions = await Promise.all(
      referenceUrls.map((url) => extractBrandFromUrl(url)),
    );

    /* ---- merge all signals ---- */
    const allColors = extractions.flatMap((e) => e.colors);
    const allFonts = extractions.flatMap((e) => e.fonts);
    const logos = extractions.map((e) => e.logo).filter(Boolean) as string[];
    const ogImages = extractions.map((e) => e.ogImage).filter(Boolean) as string[];
    const isDark = extractions.some((e) => e.isDark);

    // Dedupe colors sorted by frequency
    const colorFreq: Record<string, number> = {};
    for (const c of allColors) {
      const lower = c.toLowerCase();
      colorFreq[lower] = (colorFreq[lower] || 0) + 1;
    }
    const colors = Object.entries(colorFreq)
      .sort((a, b) => b[1] - a[1])
      .map((e) => e[0])
      .slice(0, 12);

    // Dedupe fonts
    const fonts = Array.from(new Set(allFonts)).slice(0, 8);

    // Determine dominant style
    const styles = extractions.map((e) => e.style);
    const styleFreq: Record<string, number> = {};
    for (const s of styles) styleFreq[s] = (styleFreq[s] || 0) + 1;
    const style =
      Object.entries(styleFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || "modern";

    // Merge meta text
    const metaText = extractions
      .map((e) => `${e.siteTitle} ${e.metaDescription}`)
      .join(" ");

    // Detect content type
    const contentType = detectContentType(metaText);

    // If user provided paletteHex, prepend those
    if (paletteHex) {
      colors.unshift(
        ...paletteHex.filter((c) => /^#[0-9a-fA-F]{6}$/.test(c)),
      );
    }

    // If user provided logoAssetUrl, prepend
    if (logoAssetUrl) logos.unshift(logoAssetUrl);

    /* ---- build BrandDNA ---- */
    const brandDna: BrandDNA = {
      colors,
      fonts,
      logos,
      ogImages,
      isDark,
      style,
      contentType,
      metaText,
    };

    /* ---- per-URL summary ---- */
    const urlResults = referenceUrls.map((url, i) => {
      const e = extractions[i];
      return {
        url,
        colorsFound: e.colors.length,
        fontsFound: e.fonts.length,
        hasLogo: Boolean(e.logo),
        hasOgImage: Boolean(e.ogImage),
      };
    });

    return NextResponse.json({
      brandDna,
      extractedFrom: referenceUrls.length,
      urlResults,
    });
  } catch (err: any) {
    console.error("[ai-designer/analyze] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
