import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import type { BrandDNA } from "@/lib/brand-extractor";
import {
  hexToRgb,
  luminance,
  contrastRatio,
  adjustForContrast,
  saturate,
  desaturate,
  darken,
  lighten,
  generateComplementaryColor,
} from "@/lib/brand-extractor";
import type { PageSpec } from "@/lib/page-schema";
import { validatePageSpec } from "@/lib/page-schema";

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
/*  Font map                                                           */
/* ------------------------------------------------------------------ */

const FONT_MAP: Record<string, string> = {
  inter: "inter",
  roboto: "inter",
  helvetica: "inter",
  poppins: "poppins",
  montserrat: "poppins",
  raleway: "poppins",
  playfair: "playfair",
  georgia: "playfair",
  merriweather: "playfair",
  "dm sans": "dm-sans",
  "open sans": "dm-sans",
  lato: "dm-sans",
  outfit: "outfit",
  "space grotesk": "space-grotesk",
  sora: "sora",
  manrope: "manrope",
  "fira code": "fira-code",
  "plus jakarta": "jakarta",
  jakarta: "jakarta",
};

/* ------------------------------------------------------------------ */
/*  Variation profiles                                                 */
/* ------------------------------------------------------------------ */

interface VariationProfile {
  name: string;
  key: string;
  templates: string[];
  colorTransform: (
    colors: string[],
    isDark: boolean,
  ) => {
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    buttonBg: string;
    buttonText: string;
  };
  typography: {
    weightH1: number;
    weightBody: number;
    scaleH1: number;
    scaleBody: number;
    scaleSmall: number;
    preferredFonts: string[];
  };
  button: {
    shape: "rounded" | "pill" | "square" | "soft";
    variant: "solid" | "outline" | "glass";
    shadow: "none" | "subtle" | "medium" | "lifted";
  };
  avatar: {
    shape: "circle" | "rounded" | "square";
    size: "small" | "medium" | "large";
    borderWidth: number;
    shadow: "none" | "soft" | "medium" | "dramatic";
  };
  background: {
    type: "solid" | "gradient";
  };
  motion: {
    introAnimation: string;
    hoverEffect: string;
    preset: "none" | "subtle" | "energetic";
  };
  layout: {
    containerWidth: "compact" | "standard" | "wide";
    pagePadding: number;
    sectionGap: number;
  };
}

/* ── Variation 1: Clean (Minimal) ──────────────────────────────────── */

const cleanVariation: VariationProfile = {
  name: "Clean",
  key: "clean",
  templates: ["minimal", "clay", "pastel", "showcase", "educator"],
  colorTransform(colors, isDark) {
    const primary = colors[0] || "#3b82f6";
    const secondary = colors[1] || generateComplementaryColor(primary);
    const muted = desaturate(primary, 0.3);

    const background = isDark ? "#1a1a1a" : "#fafafa";
    const surface = isDark ? "#262626" : "#f5f5f5";
    const textPrimary = adjustForContrast(isDark ? "#e5e5e5" : "#171717", background, 4.5);
    const textSecondary = adjustForContrast(isDark ? "#a3a3a3" : "#737373", background, 4.5);
    const accent = muted;
    const buttonBg = desaturate(primary, 0.15);
    const buttonText = adjustForContrast(isDark ? "#fafafa" : "#fafafa", buttonBg, 4.5);

    return { background, surface, textPrimary, textSecondary, accent, buttonBg, buttonText };
  },
  typography: {
    weightH1: 300,
    weightBody: 400,
    scaleH1: 28,
    scaleBody: 15,
    scaleSmall: 12,
    preferredFonts: ["inter", "dm-sans", "jakarta"],
  },
  button: { shape: "soft", variant: "outline", shadow: "subtle" },
  avatar: { shape: "circle", size: "medium", borderWidth: 0, shadow: "soft" },
  background: { type: "solid" },
  motion: { introAnimation: "fade-up", hoverEffect: "none", preset: "subtle" },
  layout: { containerWidth: "compact", pagePadding: 24, sectionGap: 20 },
};

/* ── Variation 2: Bold (Energetic) ─────────────────────────────────── */

const boldVariation: VariationProfile = {
  name: "Bold",
  key: "bold",
  templates: ["bold", "neon", "gradient-mesh", "aurora", "sunset"],
  colorTransform(colors, isDark) {
    const primary = colors[0] || "#3b82f6";
    const secondary = colors[1] || generateComplementaryColor(primary);
    const vibrantPrimary = saturate(primary, 0.2);
    const vibrantSecondary = saturate(secondary, 0.2);

    const background = isDark ? "#0f0f0f" : "#ffffff";
    const surface = isDark ? "#1c1c1c" : "#f8f8f8";
    const textPrimary = adjustForContrast(isDark ? "#f5f5f5" : "#111111", background, 4.5);
    const textSecondary = adjustForContrast(isDark ? "#b0b0b0" : "#555555", background, 4.5);
    const accent = vibrantPrimary;
    const buttonBg = vibrantPrimary;
    const buttonText = adjustForContrast("#ffffff", buttonBg, 4.5);

    return { background, surface, textPrimary, textSecondary, accent, buttonBg, buttonText };
  },
  typography: {
    weightH1: 600,
    weightBody: 500,
    scaleH1: 36,
    scaleBody: 16,
    scaleSmall: 12,
    preferredFonts: ["outfit", "poppins", "space-grotesk"],
  },
  button: { shape: "pill", variant: "solid", shadow: "medium" },
  avatar: { shape: "rounded", size: "large", borderWidth: 3, shadow: "medium" },
  background: { type: "gradient" },
  motion: { introAnimation: "scale-in", hoverEffect: "lift", preset: "energetic" },
  layout: { containerWidth: "standard", pagePadding: 20, sectionGap: 24 },
};

/* ── Variation 3: Premium (Luxury) ─────────────────────────────────── */

const premiumVariation: VariationProfile = {
  name: "Premium",
  key: "premium",
  templates: ["glass", "midnight", "executive", "retro", "developer"],
  colorTransform(colors, _isDark) {
    const primary = colors[0] || "#3b82f6";
    const accent = colors.length > 0 ? lighten(primary, 0.3) : "#d4a574";

    const background = "#0a0a0a";
    const surface = "#1a1a2e";
    const textPrimary = adjustForContrast("#f5f5f5", background, 4.5);
    const textSecondary = adjustForContrast("#a0a0b0", background, 4.5);
    const buttonBg = accent;
    const buttonText = adjustForContrast("#0a0a0a", buttonBg, 4.5);

    return { background, surface, textPrimary, textSecondary, accent, buttonBg, buttonText };
  },
  typography: {
    weightH1: 500,
    weightBody: 400,
    scaleH1: 32,
    scaleBody: 15,
    scaleSmall: 11,
    preferredFonts: ["playfair", "sora", "inter"],
  },
  button: { shape: "soft", variant: "glass", shadow: "lifted" },
  avatar: { shape: "circle", size: "medium", borderWidth: 2, shadow: "dramatic" },
  background: { type: "gradient" },
  motion: { introAnimation: "fade-up", hoverEffect: "glow", preset: "subtle" },
  layout: { containerWidth: "compact", pagePadding: 28, sectionGap: 24 },
};

/* ── Variation 4: Playful ──────────────────────────────────────────── */

const playfulVariation: VariationProfile = {
  name: "Playful",
  key: "playful",
  templates: ["pastel", "retro", "aurora", "collage", "sunset"],
  colorTransform(colors, isDark) {
    const primary = colors[0] || "#3b82f6";
    const secondary = colors[1] || generateComplementaryColor(primary);
    const pastelPrimary = lighten(desaturate(primary, 0.15), 0.35);
    const pastelSecondary = lighten(desaturate(secondary, 0.15), 0.35);

    const background = isDark ? "#1e1e2e" : "#fef9f4";
    const surface = isDark ? "#2a2a3e" : "#fff5ed";
    const textPrimary = adjustForContrast(isDark ? "#f0e6da" : "#2d1f10", background, 4.5);
    const textSecondary = adjustForContrast(isDark ? "#b0a090" : "#7a6a5a", background, 4.5);
    const accent = pastelPrimary;
    const buttonBg = saturate(pastelPrimary, 0.2);
    const buttonText = adjustForContrast(isDark ? "#fef9f4" : "#1a1a1a", buttonBg, 4.5);

    return { background, surface, textPrimary, textSecondary, accent, buttonBg, buttonText };
  },
  typography: {
    weightH1: 500,
    weightBody: 400,
    scaleH1: 30,
    scaleBody: 15,
    scaleSmall: 12,
    preferredFonts: ["poppins", "outfit", "dm-sans"],
  },
  button: { shape: "pill", variant: "solid", shadow: "subtle" },
  avatar: { shape: "rounded", size: "large", borderWidth: 0, shadow: "soft" },
  background: { type: "gradient" },
  motion: { introAnimation: "scale-in", hoverEffect: "lift", preset: "energetic" },
  layout: { containerWidth: "standard", pagePadding: 20, sectionGap: 20 },
};

/* ── Variation 5: Corporate ────────────────────────────────────────── */

const corporateVariation: VariationProfile = {
  name: "Corporate",
  key: "corporate",
  templates: ["executive", "minimal", "founder", "glass", "educator"],
  colorTransform(colors, isDark) {
    const primary = colors[0] || "#1e40af";
    const conservative = desaturate(darken(primary, 0.1), 0.2);

    const background = isDark ? "#111827" : "#ffffff";
    const surface = isDark ? "#1f2937" : "#f9fafb";
    const textPrimary = adjustForContrast(isDark ? "#f3f4f6" : "#111827", background, 4.5);
    const textSecondary = adjustForContrast(isDark ? "#9ca3af" : "#6b7280", background, 4.5);
    const accent = conservative;
    const buttonBg = conservative;
    const buttonText = adjustForContrast("#ffffff", buttonBg, 4.5);

    return { background, surface, textPrimary, textSecondary, accent, buttonBg, buttonText };
  },
  typography: {
    weightH1: 500,
    weightBody: 400,
    scaleH1: 28,
    scaleBody: 15,
    scaleSmall: 12,
    preferredFonts: ["inter", "dm-sans", "jakarta"],
  },
  button: { shape: "rounded", variant: "solid", shadow: "subtle" },
  avatar: { shape: "circle", size: "small", borderWidth: 1, shadow: "none" },
  background: { type: "solid" },
  motion: { introAnimation: "fade-up", hoverEffect: "none", preset: "none" },
  layout: { containerWidth: "compact", pagePadding: 28, sectionGap: 24 },
};

const ALL_VARIATIONS: VariationProfile[] = [
  cleanVariation,
  boldVariation,
  premiumVariation,
  playfulVariation,
  corporateVariation,
];

/* ------------------------------------------------------------------ */
/*  Template selection                                                 */
/* ------------------------------------------------------------------ */

/** Template mood / purpose metadata for scoring */
const TEMPLATE_META: Record<
  string,
  { moods: string[]; darkFriendly: boolean; purposes: string[] }
> = {
  minimal:        { moods: ["minimal", "clean"],    darkFriendly: false, purposes: ["personal", "creator"] },
  clay:           { moods: ["minimal", "modern"],   darkFriendly: false, purposes: ["personal", "creator"] },
  pastel:         { moods: ["playful", "soft"],     darkFriendly: false, purposes: ["creator", "personal"] },
  bold:           { moods: ["bold", "energetic"],   darkFriendly: true,  purposes: ["creator", "business"] },
  neon:           { moods: ["bold", "tech"],        darkFriendly: true,  purposes: ["creator", "tech"] },
  "gradient-mesh":{ moods: ["bold", "modern"],      darkFriendly: true,  purposes: ["creator", "agency"] },
  aurora:         { moods: ["bold", "playful"],     darkFriendly: true,  purposes: ["creator", "personal"] },
  sunset:         { moods: ["bold", "playful"],     darkFriendly: false, purposes: ["creator", "personal"] },
  glass:          { moods: ["luxury", "modern"],    darkFriendly: true,  purposes: ["business", "agency"] },
  midnight:       { moods: ["luxury", "tech"],      darkFriendly: true,  purposes: ["business", "creator"] },
  executive:      { moods: ["luxury", "corporate"], darkFriendly: true,  purposes: ["business", "agency"] },
  retro:          { moods: ["playful", "bold"],     darkFriendly: false, purposes: ["creator", "personal"] },
  developer:      { moods: ["tech", "minimal"],     darkFriendly: true,  purposes: ["tech", "creator"] },
  showcase:       { moods: ["modern", "minimal"],   darkFriendly: false, purposes: ["creator", "ecommerce"] },
  educator:       { moods: ["minimal", "corporate"],darkFriendly: false, purposes: ["creator", "business"] },
  collage:        { moods: ["playful", "bold"],     darkFriendly: false, purposes: ["creator", "personal"] },
  founder:        { moods: ["corporate", "modern"], darkFriendly: true,  purposes: ["business", "agency"] },
};

/** Niche keyword map for template scoring */
const NICHE_TEMPLATE_MAP: Record<string, string[]> = {
  fitness:      ["bold", "neon", "showcase"],
  beauty:       ["pastel", "glass", "aurora"],
  fashion:      ["glass", "showcase", "aurora"],
  tech:         ["developer", "neon", "midnight"],
  gaming:       ["neon", "bold", "midnight"],
  finance:      ["executive", "midnight", "founder"],
  trading:      ["executive", "midnight"],
  crypto:       ["neon", "midnight", "developer"],
  education:    ["educator", "minimal", "clay"],
  music:        ["aurora", "neon", "bold"],
  art:          ["aurora", "collage", "showcase"],
  food:         ["showcase", "bold", "pastel"],
  photography:  ["showcase", "collage", "glass"],
  business:     ["executive", "founder", "glass"],
};

function pickTemplate(
  pool: string[],
  brandDna: BrandDNA,
  niche: string | undefined,
): string {
  const scores: Record<string, number> = {};
  for (const t of pool) scores[t] = 0;

  for (const t of pool) {
    const meta = TEMPLATE_META[t];
    if (!meta) continue;

    // Brand style match
    if (meta.moods.includes(brandDna.style)) {
      scores[t] += 10;
    }

    // Dark / light match
    if (brandDna.isDark && meta.darkFriendly) {
      scores[t] += 6;
    } else if (!brandDna.isDark && !meta.darkFriendly) {
      scores[t] += 3;
    }

    // Content type match
    if (meta.purposes.includes(brandDna.contentType)) {
      scores[t] += 5;
    }

    // Niche keyword match
    if (niche) {
      const lower = niche.toLowerCase();
      for (const [keyword, templates] of Object.entries(NICHE_TEMPLATE_MAP)) {
        if (lower.includes(keyword) && templates.includes(t)) {
          scores[t] += 7;
        }
      }
    }
  }

  // Return highest scoring template from the pool
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || pool[0];
}

/* ------------------------------------------------------------------ */
/*  Font resolution                                                    */
/* ------------------------------------------------------------------ */

function resolveFont(brandFonts: string[], preferredFonts: string[]): string {
  // Try to match brand fonts first
  for (const f of brandFonts) {
    const lower = f.toLowerCase();
    for (const [key, mapped] of Object.entries(FONT_MAP)) {
      if (lower.includes(key)) {
        return mapped;
      }
    }
  }
  // Fall back to variation's preferred fonts
  return preferredFonts[0];
}

/* ------------------------------------------------------------------ */
/*  Build PageSpec                                                     */
/* ------------------------------------------------------------------ */

function buildPageSpec(
  variation: VariationProfile,
  brandDna: BrandDNA,
  niche: string | undefined,
  offers: { title: string; price?: number; type: string }[] | undefined,
): PageSpec {
  const colors = variation.colorTransform(brandDna.colors, brandDna.isDark);

  // Pick font
  const font = resolveFont(brandDna.fonts, variation.typography.preferredFonts);

  // Pick template
  const template = pickTemplate(variation.templates, brandDna, niche);

  // Build background value
  let bgValue: string;
  if (variation.background.type === "gradient") {
    bgValue = `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`;
  } else {
    bgValue = colors.background;
  }

  const spec: PageSpec = {
    schemaVersion: "hac.page.v1",
    mode: "hireacreator",
    pageId: `ai-${variation.key}-${Date.now()}`,
    designTokens: {
      colors: {
        background: colors.background,
        surface: colors.surface,
        textPrimary: colors.textPrimary,
        textSecondary: colors.textSecondary,
        accent: colors.accent,
        buttonBg: colors.buttonBg,
        buttonText: colors.buttonText,
      },
      typography: {
        family: font,
        scale: {
          h1: variation.typography.scaleH1,
          body: variation.typography.scaleBody,
          small: variation.typography.scaleSmall,
        },
        weights: {
          h1: variation.typography.weightH1,
          body: variation.typography.weightBody,
        },
      },
      components: {
        button: variation.button,
        card: { radius: 12, stroke: "none" },
      },
      motion: {
        respectReducedMotion: true,
        preset: variation.motion.preset,
        introAnimation: variation.motion.introAnimation,
        hoverEffect: variation.motion.hoverEffect,
      },
      layout: {
        template,
        containerWidth: variation.layout.containerWidth,
        pagePadding: variation.layout.pagePadding,
        sectionGap: variation.layout.sectionGap,
      },
      background: {
        type: variation.background.type,
        value: bgValue,
        overlayType:
          colors.background.startsWith("#0") || colors.background.startsWith("#1")
            ? "dark"
            : "light",
        overlayOpacity: 40,
        glassEnabled: variation.button.variant === "glass",
        glassIntensity: variation.button.variant === "glass" ? 8 : 0,
      },
      avatar: {
        mode: "photo",
        shape: variation.avatar.shape,
        size: variation.avatar.size,
        borderWidth: variation.avatar.borderWidth,
        borderColor: colors.accent,
        shadow: variation.avatar.shadow,
      },
    },
    assets: {
      logo: brandDna.logos[0]
        ? {
            source: { kind: "url", url: brandDna.logos[0] },
            placement: { area: "headerTitle", size: "medium", alignment: "center" },
          }
        : undefined,
      profileImage: { source: { kind: "placeholder" } },
    },
    sections: [
      { id: "header", type: "header", props: {} },
      { id: "links", type: "linkList", props: {} },
      { id: "social", type: "socialIcons", props: { position: "bottom" } },
    ],
    contentSlots: {
      header: {
        title: brandDna.metaText.split(" ").slice(0, 5).join(" ") || "Your Name",
        bio: "",
      },
      products: offers?.map((o, i) => ({
        id: `offer-${i}`,
        productType: (o.type === "call" ? "call" : "urlMedia") as "call" | "urlMedia",
        title: o.title,
        price: o.price || 0,
        cta: o.type === "call" ? "Book Now" : "Get Access",
      })),
    },
    validationReport: { errors: [], warnings: [] },
  };

  // Run validation
  spec.validationReport = validatePageSpec(spec);

  return spec;
}

/* ------------------------------------------------------------------ */
/*  POST /api/ai-designer/generate                                     */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    /* ── Auth ── */
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* ── Parse body ── */
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      brandDna: rawBrandDna,
      mode,
      niche,
      variationCount: rawVariationCount,
      offers: rawOffers,
    } = body as {
      brandDna?: BrandDNA;
      mode?: string;
      niche?: string;
      variationCount?: number;
      offers?: { title: string; price?: number; type: string }[];
    };

    /* ── Validate input ── */
    if (!rawBrandDna || typeof rawBrandDna !== "object") {
      return NextResponse.json(
        { error: "brandDna is required and must be an object" },
        { status: 400 },
      );
    }

    // Normalise brandDna with sensible defaults
    const brandDna: BrandDNA = {
      colors: Array.isArray(rawBrandDna.colors) ? rawBrandDna.colors : [],
      fonts: Array.isArray(rawBrandDna.fonts) ? rawBrandDna.fonts : [],
      isDark: typeof rawBrandDna.isDark === "boolean" ? rawBrandDna.isDark : false,
      style: typeof rawBrandDna.style === "string" ? rawBrandDna.style : "modern",
      logos: Array.isArray(rawBrandDna.logos) ? rawBrandDna.logos : [],
      ogImages: Array.isArray(rawBrandDna.ogImages) ? rawBrandDna.ogImages : [],
      contentType: typeof rawBrandDna.contentType === "string" ? rawBrandDna.contentType : "creator",
      metaText: typeof rawBrandDna.metaText === "string" ? rawBrandDna.metaText : "",
    };

    const variationCount = Math.max(1, Math.min(5, Number(rawVariationCount) || 3));

    const offers = Array.isArray(rawOffers)
      ? rawOffers.filter(
          (o): o is { title: string; price?: number; type: string } =>
            typeof o === "object" && o !== null && typeof o.title === "string" && typeof o.type === "string",
        )
      : undefined;

    /* ── Generate variations ── */
    const selectedVariations = ALL_VARIATIONS.slice(0, variationCount);
    const variations: PageSpec[] = selectedVariations.map((v) =>
      buildPageSpec(v, brandDna, niche, offers),
    );

    return NextResponse.json({
      variations,
      brandDna,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("[ai-designer/generate] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
