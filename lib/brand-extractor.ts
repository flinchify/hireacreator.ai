// ─── Brand Extractor ─────────────────────────────────────────────────────────
// Shared module for extracting brand signals from URLs, plus color utilities.
// No external dependencies.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Generic color filter ────────────────────────────────────────────────────

export const GENERIC_COLORS = new Set([
  "#000000", "#ffffff", "#333333", "#666666", "#999999", "#cccccc",
  "#f5f5f5", "#fafafa", "#eeeeee", "#e5e5e5", "#f0f0f0", "#d4d4d4",
  "#111111", "#222222", "#444444", "#555555", "#777777", "#888888",
  "#aaaaaa", "#bbbbbb", "#dddddd", "#f8f8f8", "#f9f9f9", "#fbfbfb",
]);

export function isBrandColor(hex: string): boolean {
  return !GENERIC_COLORS.has(hex.toLowerCase());
}

// ─── URL helper ──────────────────────────────────────────────────────────────

export function resolveUrl(href: string, baseUrl: string): string {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return "";
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type BrandData = {
  colors: string[];
  fonts: string[];
  isDark: boolean;
  style: string;
  ogImage: string | null;
  favicon: string | null;
  logo: string | null;
  metaDescription: string;
  siteTitle: string;
};

export interface BrandDNA {
  colors: string[];
  fonts: string[];
  isDark: boolean;
  style: string;
  logos: string[];
  ogImages: string[];
  contentType: string; // creator|business|ecommerce|agency|personal
  metaText: string;
}

// ─── Color utilities ─────────────────────────────────────────────────────────

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace(/^#/, "");
  const full = h.length === 3
    ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    : h.slice(0, 6);
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r: rr, g: gg, b: bb } = hexToRgb(hex);
  const r = rr / 255;
  const g = gg / 255;
  const b = bb / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  if (s === 0) {
    const v = Math.round(l * 255);
    return rgbToHex(v, v, v);
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return rgbToHex(
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  );
}

/** Relative luminance per WCAG 2.1 */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG contrast ratio between two hex colors */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Adjust foreground color to meet a minimum contrast ratio against background.
 * Lightens or darkens fg iteratively until the ratio is met or we hit black/white.
 */
export function adjustForContrast(
  fg: string,
  bg: string,
  minRatio: number,
): string {
  if (contrastRatio(fg, bg) >= minRatio) return fg;

  const bgLum = luminance(bg);
  // Decide whether to lighten or darken fg
  const goLight = bgLum < 0.5;
  let { h, s, l } = hexToHsl(fg);

  for (let i = 0; i < 100; i++) {
    l = goLight ? Math.min(1, l + 0.01) : Math.max(0, l - 0.01);
    const candidate = hslToHex(h, s, l);
    if (contrastRatio(candidate, bg) >= minRatio) return candidate;
  }
  return goLight ? "#ffffff" : "#000000";
}

/** Rotate hue 180 degrees to produce the complementary color */
export function generateComplementaryColor(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex((h + 0.5) % 1, s, l);
}

/**
 * Ensure text color has sufficient contrast against bg.
 * If not, adjusts text until WCAG ratio is met. Default 4.5:1 (AA normal text).
 */
export function ensureContrast(
  bg: string,
  text: string,
  minRatio: number = 4.5,
): string {
  return adjustForContrast(text, bg, minRatio);
}

/** Increase saturation by amount (0-1, where 1 = fully saturated) */
export function saturate(hex: string, amount: number): string {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, Math.min(1, s + (1 - s) * amount), l);
}

/** Decrease saturation by amount (0-1, where 1 = fully desaturated / gray) */
export function desaturate(hex: string, amount: number): string {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, Math.max(0, s - s * amount), l);
}

/** Darken a color by amount (0-1, where 1 = black) */
export function darken(hex: string, amount: number): string {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, l - l * amount));
}

/** Lighten a color by amount (0-1, where 1 = white) */
export function lighten(hex: string, amount: number): string {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.min(1, l + (1 - l) * amount));
}

// ─── Logo extraction ─────────────────────────────────────────────────────────

/**
 * Extract logo URLs from HTML markup.
 * Checks: img[logo], header a > img, apple-touch-icon, favicon.
 */
export function extractLogos(html: string, baseUrl: string): string[] {
  const logos: string[] = [];
  const seen = new Set<string>();

  const addLogo = (href: string) => {
    const resolved = resolveUrl(href, baseUrl);
    if (resolved && !seen.has(resolved)) {
      seen.add(resolved);
      logos.push(resolved);
    }
  };

  // 1. <img> tags with 'logo' in src, alt, class, or id
  const logoImgMatches =
    html.match(
      /<img[^>]*(?:src|alt|class|id)=["'][^"']*logo[^"']*["'][^>]*>/gi,
    ) || [];
  for (const tag of logoImgMatches) {
    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
    if (srcMatch) addLogo(srcMatch[1]);
  }

  // 2. Header / nav a > img pattern
  const headerMatches =
    html.match(
      /<(?:header|nav)[^>]*>[\s\S]*?<a[^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>/gi,
    ) || [];
  for (const block of headerMatches) {
    const srcMatch = block.match(/src=["']([^"']+)["']/i);
    if (srcMatch) addLogo(srcMatch[1]);
  }

  // 3. apple-touch-icon
  const appleTouchIcon =
    html.match(
      /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i,
    ) ||
    html.match(
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']apple-touch-icon["']/i,
    );
  if (appleTouchIcon) addLogo(appleTouchIcon[1]);

  // 4. Favicon
  const faviconLink =
    html.match(
      /<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i,
    ) ||
    html.match(
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:icon|shortcut icon)["']/i,
    );
  if (faviconLink) addLogo(faviconLink[1]);

  return logos;
}

// ─── Content type detection ──────────────────────────────────────────────────

/**
 * Detect the content type of a site based on its meta text.
 * Returns: creator | business | ecommerce | agency | personal
 */
export function detectContentType(metaText: string): string {
  const t = metaText.toLowerCase();

  // Order matters — most specific first
  if (
    /shop|store|buy|cart|product|ecommerce|e-commerce|checkout|pricing|add to cart/.test(
      t,
    )
  )
    return "ecommerce";

  if (
    /agency|studio|we\s+(?:are|build|create|design|develop)|our\s+team|our\s+services|clients|case\s+stud/.test(
      t,
    )
  )
    return "agency";

  if (
    /creator|influencer|youtuber|streamer|content\s+creator|follow\s+me|my\s+(?:channel|stream|videos|podcast)/.test(
      t,
    )
  )
    return "creator";

  if (
    /business|company|enterprise|corporation|solutions|services|b2b|consulting|firm/.test(
      t,
    )
  )
    return "business";

  return "personal";
}

// ─── Main extraction function ────────────────────────────────────────────────

/** Extract colors, fonts, images, and style from a webpage */
export async function extractBrandFromUrl(url: string): Promise<BrandData> {
  const result: BrandData = {
    colors: [],
    fonts: [],
    isDark: false,
    style: "modern",
    ogImage: null,
    favicon: null,
    logo: null,
    metaDescription: "",
    siteTitle: "",
  };

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HireACreator/1.0)",
      },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!res.ok) return result;
    const html = await res.text();

    // ── OG / Twitter images ──
    const ogImg =
      html.match(
        /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
      ) ||
      html.match(
        /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
      );
    if (ogImg) result.ogImage = resolveUrl(ogImg[1], url);

    if (!result.ogImage) {
      const twImg =
        html.match(
          /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
        ) ||
        html.match(
          /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
        );
      if (twImg) result.ogImage = resolveUrl(twImg[1], url);
    }

    // ── Favicon / logo ──
    const iconLink =
      html.match(
        /<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']/i,
      ) ||
      html.match(
        /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["']/i,
      );
    if (iconLink) result.favicon = resolveUrl(iconLink[1], url);

    // ── Logo extraction ──
    // 1. <img> tags with 'logo' in src, alt, class, or id
    const logoImgMatch = html.match(
      /<img[^>]*(?:src|alt|class|id)=["'][^"']*logo[^"']*["'][^>]*>/gi,
    );
    if (logoImgMatch) {
      for (const tag of logoImgMatch) {
        const srcMatch = tag.match(/src=["']([^"']+)["']/i);
        if (srcMatch) {
          result.logo = resolveUrl(srcMatch[1], url);
          break;
        }
      }
    }
    // 2. <a> wrapping logo images (header > a > img pattern)
    if (!result.logo) {
      const headerLogoMatch = html.match(
        /<(?:header|nav)[^>]*>[\s\S]*?<a[^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>/i,
      );
      if (headerLogoMatch) result.logo = resolveUrl(headerLogoMatch[1], url);
    }
    // 3. apple-touch-icon as fallback logo
    if (!result.logo) {
      const appleTouchIcon =
        html.match(
          /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i,
        ) ||
        html.match(
          /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']apple-touch-icon["']/i,
        );
      if (appleTouchIcon) result.logo = resolveUrl(appleTouchIcon[1], url);
    }
    // 4. Fallback to favicon
    if (!result.logo && result.favicon) result.logo = result.favicon;

    // ── Meta description + title for business type detection ──
    const metaDesc =
      html.match(
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
      ) ||
      html.match(
        /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i,
      );
    if (metaDesc) result.metaDescription = metaDesc[1];

    const ogDesc = html.match(
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
    );
    if (ogDesc && !result.metaDescription) result.metaDescription = ogDesc[1];

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) result.siteTitle = titleMatch[1].trim();

    // ── Theme-color meta ──
    const themeColor = html.match(
      /<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i,
    );
    if (themeColor) result.colors.push(themeColor[1]);

    const tileColor = html.match(
      /<meta[^>]*name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i,
    );
    if (tileColor) result.colors.push(tileColor[1]);

    // ── CSS custom properties (expanded patterns) ──
    const cssVars =
      html.match(
        /--(?:primary|brand|accent|main|color|bg|theme|highlight|link|cta|button|heading|text-primary|surface)[^:]*:\s*([^;}\n]+)/gi,
      ) || [];
    for (const v of cssVars) {
      const val = v.split(":").pop()?.trim() || "";
      const hexMatch = val.match(/#[0-9a-fA-F]{3,8}\b/);
      if (hexMatch)
        result.colors.push(
          hexMatch[0].length === 4
            ? `#${hexMatch[0][1]}${hexMatch[0][1]}${hexMatch[0][2]}${hexMatch[0][2]}${hexMatch[0][3]}${hexMatch[0][3]}`
            : hexMatch[0].slice(0, 7),
        );
    }

    // ── Inline hex colors ──
    const hexColors = html.match(/#[0-9a-fA-F]{6}\b/g) || [];
    const uniqueHex = Array.from(new Set(hexColors)).slice(0, 30);
    const brandColors = uniqueHex.filter(isBrandColor);
    result.colors.push(...brandColors.slice(0, 8));

    // ── Font extraction from inline CSS ──
    const fontMatches =
      html.match(/font-family:\s*["']?([^;"'}\n]+)/gi) || [];
    const fonts = fontMatches
      .map((f) =>
        f
          .replace(/font-family:\s*["']?/i, "")
          .split(",")[0]
          .trim()
          .replace(/["']/g, ""),
      )
      .filter(Boolean);
    result.fonts = Array.from(new Set(fonts))
      .filter(
        (f) =>
          ![
            "inherit",
            "sans-serif",
            "serif",
            "monospace",
            "system-ui",
            "-apple-system",
            "BlinkMacSystemFont",
            "Segoe UI",
          ].includes(f),
      )
      .slice(0, 6);

    // ── Google Fonts detection ──
    const gFontLinks =
      html.match(
        /<link[^>]*href=["']([^"']*fonts\.googleapis\.com\/css2?\?[^"']+)["']/gi,
      ) || [];
    for (const linkTag of gFontLinks) {
      const hrefMatch = linkTag.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        const familyMatches =
          hrefMatch[1].match(/family=([^&:;]+)/g) || [];
        for (const fm of familyMatches) {
          const fontName = decodeURIComponent(fm.replace("family=", ""))
            .replace(/\+/g, " ")
            .split(":")[0];
          if (fontName && !result.fonts.includes(fontName))
            result.fonts.push(fontName);
        }
      }
    }

    // ── @font-face detection in inline styles ──
    const fontFaceMatches =
      html.match(
        /@font-face\s*\{[^}]*font-family:\s*["']?([^;"'}\n]+)/gi,
      ) || [];
    for (const block of fontFaceMatches) {
      const nameMatch = block.match(
        /font-family:\s*["']?([^;"'}\n]+)/i,
      );
      if (nameMatch) {
        const name = nameMatch[1].trim().replace(/["']/g, "");
        if (name && !result.fonts.includes(name)) result.fonts.push(name);
      }
    }

    // ── Fetch first external stylesheet for deeper extraction (up to 50KB) ──
    const cssLinkMatch =
      html.match(
        /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/i,
      ) ||
      html.match(
        /<link[^>]*href=["']([^"']+\.css[^"']*)["'][^>]*rel=["']stylesheet["']/i,
      );
    if (cssLinkMatch) {
      try {
        const cssUrl = resolveUrl(cssLinkMatch[1], url);
        if (cssUrl) {
          const cssRes = await fetch(cssUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; HireACreator/1.0)",
            },
            signal: AbortSignal.timeout(5000),
          });
          if (cssRes.ok) {
            const cssText = (await cssRes.text()).slice(0, 50000);

            // Colors from external CSS
            const cssHexColors = cssText.match(/#[0-9a-fA-F]{6}\b/g) || [];
            const cssBrandColors = Array.from(new Set(cssHexColors))
              .filter(isBrandColor)
              .slice(0, 6);
            result.colors.push(...cssBrandColors);

            // CSS custom properties from external stylesheet
            const extVars =
              cssText.match(
                /--(?:primary|brand|accent|main|color|bg|theme|highlight|link|cta|button|heading)[^:]*:\s*([^;}\n]+)/gi,
              ) || [];
            for (const v of extVars) {
              const val = v.split(":").pop()?.trim() || "";
              const hexMatch = val.match(/#[0-9a-fA-F]{3,8}\b/);
              if (hexMatch) result.colors.push(hexMatch[0].slice(0, 7));
            }

            // Fonts from external CSS
            const cssFontMatches =
              cssText.match(/font-family:\s*["']?([^;"'}\n]+)/gi) || [];
            for (const f of cssFontMatches) {
              const name = f
                .replace(/font-family:\s*["']?/i, "")
                .split(",")[0]
                .trim()
                .replace(/["']/g, "");
              if (
                name &&
                ![
                  "inherit",
                  "sans-serif",
                  "serif",
                  "monospace",
                  "system-ui",
                  "-apple-system",
                ].includes(name) &&
                !result.fonts.includes(name)
              ) {
                result.fonts.push(name);
              }
            }

            // @font-face in external CSS
            const extFontFaceBlocks =
              cssText.match(
                /@font-face\s*\{[^}]*font-family:\s*["']?([^;"'}\n]+)/gi,
              ) || [];
            for (const block of extFontFaceBlocks) {
              const nameMatch = block.match(
                /font-family:\s*["']?([^;"'}\n]+)/i,
              );
              if (nameMatch) {
                const name = nameMatch[1].trim().replace(/["']/g, "");
                if (name && !result.fonts.includes(name))
                  result.fonts.push(name);
              }
            }
          }
        }
      } catch {
        // Stylesheet fetch failed — continue with what we have
      }
    }

    // ── Detect dark/light ──
    const darkIndicators = (
      html.match(/dark-mode|dark-theme|theme-dark|color-scheme:\s*dark/gi) ||
      []
    ).length;
    const darkClassCount = (
      html.match(/class="[^"]*dark[^"]*"/gi) || []
    ).length;
    const bgDark = html.match(
      /background(?:-color)?:\s*(?:#[0-3][0-9a-f]{5}|rgb\(\s*[0-5]\d)/gi,
    );
    result.isDark =
      darkIndicators > 0 ||
      darkClassCount > 3 ||
      (bgDark != null && bgDark.length > 3);

    // ── Detect style keywords from content ──
    const textContent = (
      result.metaDescription +
      " " +
      result.siteTitle +
      " " +
      html.slice(0, 5000)
    ).toLowerCase();
    if (/minimal|minimalist|clean|simple/.test(textContent))
      result.style = "minimal";
    else if (/bold|vibrant|colorful|creative|artistic/.test(textContent))
      result.style = "bold";
    else if (/luxury|premium|elegant|exclusive|haute/.test(textContent))
      result.style = "luxury";
    else if (/tech|developer|code|software|saas|api/.test(textContent))
      result.style = "tech";
    else if (/brutalist|raw|experimental/.test(textContent))
      result.style = "brutalist";

    // ── Deduplicate and limit ──
    result.colors = Array.from(
      new Set(result.colors.map((c) => c.toLowerCase())),
    )
      .filter(isBrandColor)
      .slice(0, 12);
    result.fonts = result.fonts.slice(0, 8);
  } catch {
    // Fetch failed entirely — return defaults
  }

  return result;
}
