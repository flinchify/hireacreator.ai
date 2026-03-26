/**
 * HireACreator AI Page Designer — Schema v1
 * 
 * This is the contract between the AI generation pipeline and the frontend renderer.
 * All AI-generated designs output this format. The frontend maps it to Creator fields.
 */

// ─── Core Types ───

export interface PageSpec {
  schemaVersion: "hac.page.v1";
  mode: "hireacreator" | "linktree" | "stan";
  pageId: string;
  designTokens: DesignTokens;
  assets: Assets;
  sections: Section[];
  contentSlots: ContentSlots;
  validationReport: ValidationReport;
  exportRecipe?: ExportRecipe;
}

// ─── Design Tokens ───

export interface DesignTokens {
  colors: {
    background: string;        // hex
    surface: string;           // card/overlay bg
    textPrimary: string;       // main text
    textSecondary: string;     // muted text
    accent: string;            // brand accent
    buttonBg: string;          // button fill
    buttonText: string;        // button text
  };
  typography: {
    family: string;            // font id (inter, outfit, jakarta, etc.)
    scale: {
      h1: number;             // px
      body: number;
      small: number;
    };
    weights: {
      h1: number;             // 300-700
      body: number;
    };
  };
  components: {
    button: {
      shape: "rounded" | "pill" | "square" | "soft";
      variant: "solid" | "outline" | "glass";
      shadow: "none" | "subtle" | "medium" | "lifted";
    };
    card: {
      radius: number;         // px
      stroke: "none" | "thin" | "medium";
    };
  };
  motion: {
    respectReducedMotion: boolean;
    preset: "none" | "subtle" | "energetic";
    introAnimation: string;   // none, fade-up, scale-in, etc.
    hoverEffect: string;      // none, lift, glow, scale, shadow
  };
  layout: {
    template: string;          // template id (minimal, glass, bold, etc.)
    containerWidth: "compact" | "standard" | "wide" | "full";
    pagePadding: number;       // px
    sectionGap: number;        // px
  };
  background: {
    type: "solid" | "gradient" | "image" | "video";
    value: string;             // hex, gradient CSS, image URL, or video URL
    overlayType?: "dark" | "light";
    overlayOpacity?: number;   // 0-100
    glassEnabled?: boolean;
    glassIntensity?: number;   // 0-20
  };
  avatar: {
    mode: "photo" | "logo";
    shape: "circle" | "rounded" | "square" | "hexagon";
    size: "small" | "medium" | "large" | number; // preset or px
    borderWidth: number;
    borderColor: string;
    shadow: "none" | "soft" | "medium" | "dramatic";
  };
}

// ─── Assets ───

export interface Assets {
  logo?: {
    source: AssetSource;
    placement: {
      area: "headerTitle" | "aboveTitle" | "hidden";
      size: "small" | "medium" | "large";
      alignment: "left" | "center" | "right";
    };
  };
  background?: {
    source: AssetSource;
    recommendedExport?: Record<string, { image?: { width: number; height: number } }>;
  };
  profileImage?: {
    source: AssetSource;
  };
  thumbnails?: {
    targetId: string;
    aspect: "1:1" | "16:9" | "4:3";
    source: AssetSource;
    alt: string;
  }[];
}

export interface AssetSource {
  kind: "userUpload" | "generated" | "url" | "placeholder";
  assetId?: string;
  url?: string;
  prompt?: string;  // for AI-generated images
}

// ─── Sections ───

export interface Section {
  id: string;
  type: SectionType;
  props: Record<string, any>;
  animation?: {
    type: string;
    durationMs: number;
    delayMs?: number;
  };
}

export type SectionType =
  | "header"
  | "linkList"
  | "collection"
  | "productList"
  | "socialIcons"
  | "bio"
  | "cta"
  | "divider"
  | "testimonial"
  | "gallery"
  | "video"
  | "contact"
  | "newsletter"
  | "text"
  | "booking";

// ─── Content Slots ───

export interface ContentSlots {
  header: {
    title: string;
    bio: string;                // max 160 chars for Linktree mode
    bioVariants?: string[];     // multiple options for user to pick
  };
  social?: {
    position: "top" | "bottom" | "both";
    items: { platform: string; value: string; url?: string }[];
  };
  links?: {
    id: string;
    title: string;
    url: string;
    layout?: "classic" | "featured";
    thumbnailRef?: string;
    priority?: boolean;
  }[];
  products?: {
    id: string;
    productType: "urlMedia" | "digitalDownload" | "call" | "membership";
    style?: "button" | "callout" | "embed" | "preview";
    title: string;
    description?: string;
    price?: number;
    cta: string;
    url?: string;
    thumbnailRef?: string;
  }[];
}

// ─── Validation ───

export interface ValidationReport {
  errors: ValidationItem[];
  warnings: ValidationItem[];
}

export interface ValidationItem {
  code: string;
  message: string;
  field?: string;
  suggestion?: string;
}

// ─── Export Recipe ───

export interface ExportRecipe {
  linktree?: { notes: string[] };
  stan?: { notes: string[] };
  hireacreator?: { notes: string[] };
}

// ─── Helper: Map PageSpec to HireACreator DB fields ───

export function pageSpecToDbFields(spec: PageSpec): Record<string, any> {
  const t = spec.designTokens;
  return {
    link_bio_template: t.layout.template,
    link_bio_font: t.typography.family,
    link_bio_text_color: t.colors.textPrimary,
    link_bio_accent: t.colors.accent,
    link_bio_bg_type: t.background.type,
    link_bio_bg_value: t.background.value,
    link_bio_button_shape: t.components.button.shape,
    link_bio_button_anim: "none",
    link_bio_button_fill: t.colors.buttonBg,
    link_bio_button_text_color: t.colors.buttonText,
    link_bio_button_shadow: t.components.button.shadow,
    link_bio_font_size: typeof t.typography.scale.body === "number"
      ? (t.typography.scale.body <= 14 ? "small" : t.typography.scale.body <= 16 ? "medium" : t.typography.scale.body <= 18 ? "large" : "xl")
      : "medium",
    link_bio_font_weight: t.typography.weights.body,
    link_bio_avatar_mode: t.avatar.mode,
    link_bio_avatar_shape: t.avatar.shape,
    link_bio_avatar_size: typeof t.avatar.size === "string" ? t.avatar.size : "medium",
    link_bio_avatar_border_width: t.avatar.borderWidth,
    link_bio_avatar_border_color: t.avatar.borderColor,
    link_bio_avatar_shadow: t.avatar.shadow,
    link_bio_page_padding: t.layout.pagePadding,
    link_bio_section_gap: t.layout.sectionGap,
    link_bio_container_width: t.layout.containerWidth,
    link_bio_bg_overlay: t.background.overlayType || "dark",
    link_bio_bg_overlay_opacity: t.background.overlayOpacity ?? 40,
    link_bio_glass_enabled: t.background.glassEnabled || false,
    link_bio_glass_intensity: t.background.glassIntensity ?? 8,
    link_bio_intro_anim: t.motion.introAnimation,
    link_bio_hover_effect: t.motion.hoverEffect,
  };
}

// ─── Helper: Validate a PageSpec ───

export function validatePageSpec(spec: PageSpec): ValidationReport {
  const errors: ValidationItem[] = [];
  const warnings: ValidationItem[] = [];

  if (!spec.schemaVersion) errors.push({ code: "MISSING_VERSION", message: "Schema version is required" });
  if (!spec.mode) errors.push({ code: "MISSING_MODE", message: "Platform mode is required" });
  if (!spec.designTokens?.colors?.background) errors.push({ code: "MISSING_BG", message: "Background color is required" });

  // Bio length check (Linktree mode)
  if (spec.mode === "linktree" && spec.contentSlots?.header?.bio) {
    if (spec.contentSlots.header.bio.length > 160) {
      warnings.push({
        code: "BIO_TOO_LONG",
        message: `Bio is ${spec.contentSlots.header.bio.length} chars (Linktree limit: 160)`,
        field: "contentSlots.header.bio",
        suggestion: spec.contentSlots.header.bioVariants?.[0] || "Shorten the bio",
      });
    }
  }

  // Contrast check (basic)
  const bg = spec.designTokens.colors.background;
  const text = spec.designTokens.colors.textPrimary;
  if (bg && text && bg.toLowerCase() === text.toLowerCase()) {
    errors.push({
      code: "ZERO_CONTRAST",
      message: "Text color matches background — text will be invisible",
      field: "designTokens.colors",
    });
  }

  // Button contrast
  const btnBg = spec.designTokens.colors.buttonBg;
  const btnText = spec.designTokens.colors.buttonText;
  if (btnBg && btnText && btnBg.toLowerCase() === btnText.toLowerCase()) {
    warnings.push({
      code: "BTN_LOW_CONTRAST",
      message: "Button text matches button background",
      field: "designTokens.colors",
    });
  }

  return { errors, warnings };
}
