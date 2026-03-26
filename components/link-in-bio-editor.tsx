"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { PlatformIcon } from "./icons/platforms";
import { LinkManager } from "./link-manager";
import { AiDesignModal, type AIDesignResult } from "./ai-design-modal";

/* ── Types ── */
type Settings = {
  template: string;
  accent: string;
  bgType: string;
  bgValue: string;
  textColor: string;
  font: string;
  buttonShape: string;
  buttonAnim: string;
  introAnim: string;
  hideBranding: boolean;
  /* v2 – style */
  fontSize: string;
  fontWeight: number;
  letterSpacing: string;
  nameColor: string;
  bgGradientDir: string;
  bgGradientFrom: string;
  bgGradientTo: string;
  bgImageUrl: string;
  bgVideoUrl: string;
  overlayType: string;
  overlayOpacity: number;
  blurIntensity: number;
  pagePadding: number;
  sectionGap: number;
  containerWidth: string;
  /* v2 – avatar */
  avatarShape: string;
  avatarSize: number;
  avatarBorderWidth: number;
  avatarBorderColor: string;
  avatarShadow: string;
  avatarMode: string;
  avatarRing: boolean;
  avatarRingColor: string;
  /* v2 – buttons */
  buttonFill: string;
  buttonBorder: boolean;
  buttonBorderWidth: number;
  buttonBorderColor: string;
  buttonShadow: string;
  buttonWidth: string;
  buttonHeight: string;
  buttonTextColor: string;
  buttonIconPos: string;
  buttonHoverEffect: string;
  /* v2 – animation */
  animTiming: number;
  animStagger: number;
};

type Block = {
  id: string;
  type: string;
  config: Record<string, any>;
  visible: boolean;
  order: number;
};

const BLOCK_TYPES = [
  { type: "hero", name: "Hero Header", icon: "H" },
  { type: "cta", name: "CTA Button", icon: "!" },
  { type: "links", name: "Links List", icon: "≡" },
  { type: "socials", name: "Social Grid", icon: "@" },
  { type: "video", name: "Video Embed", icon: "▶" },
  { type: "testimonial", name: "Testimonial Quote", icon: "❝" },
  { type: "contact", name: "Contact Card", icon: "✉" },
  { type: "gallery", name: "Gallery Grid", icon: "▦" },
  { type: "product", name: "Product Card", icon: "$" },
  { type: "booking", name: "Booking Section", icon: "📅" },
  { type: "divider", name: "Divider", icon: "—" },
  { type: "text", name: "Text Block", icon: "T" },
  { type: "newsletter", name: "Newsletter Signup", icon: "📧" },
] as const;

const DEFAULT_BLOCKS: Block[] = [
  { id: "blk_hero", type: "hero", config: {}, visible: true, order: 0 },
  { id: "blk_links", type: "links", config: {}, visible: true, order: 1 },
  { id: "blk_socials", type: "socials", config: {}, visible: true, order: 2 },
  { id: "blk_cta", type: "cta", config: { label: "Book Now" }, visible: true, order: 3 },
];

const BLOCK_ANIMS = [
  { id: "none", name: "None" },
  { id: "fade-up", name: "Fade Up" },
  { id: "fade-down", name: "Fade Down" },
  { id: "slide-left", name: "Slide Left" },
  { id: "slide-right", name: "Slide Right" },
  { id: "scale-in", name: "Scale In" },
  { id: "blur-in", name: "Blur In" },
];

const ANIM_TIMINGS = [
  { value: 0, name: "Instant" },
  { value: 200, name: "Fast" },
  { value: 400, name: "Normal" },
  { value: 800, name: "Slow" },
];

const STAGGER_DELAYS = [0, 50, 100, 200];

const HOVER_EFFECTS = [
  { id: "none", name: "None" },
  { id: "lift", name: "Lift" },
  { id: "glow", name: "Glow" },
  { id: "scale", name: "Scale" },
  { id: "shadow", name: "Shadow" },
];

const GRADIENT_DIRECTIONS = [
  { id: "to top", name: "↑", deg: "0deg" },
  { id: "to top right", name: "↗", deg: "45deg" },
  { id: "to right", name: "→", deg: "90deg" },
  { id: "to bottom right", name: "↘", deg: "135deg" },
  { id: "to bottom", name: "↓", deg: "180deg" },
  { id: "to bottom left", name: "↙", deg: "225deg" },
  { id: "to left", name: "←", deg: "270deg" },
  { id: "to top left", name: "↖", deg: "315deg" },
];

const BG_PRESETS = [
  "#ffffff", "#f5f5f5", "#fafafa", "#171717", "#0a0a0a", "#1a1a2e",
  "#0b0e11", "#f2ebe3", "#fef3c7", "#1a1b26", "#0a1628",
];

const FONT_SIZES = [
  { id: "small", name: "Small", scale: 0.85 },
  { id: "medium", name: "Medium", scale: 1 },
  { id: "large", name: "Large", scale: 1.15 },
  { id: "xl", name: "XL", scale: 1.3 },
];

const FONT_WEIGHTS = [300, 400, 500, 600, 700];

const LETTER_SPACINGS = [
  { id: "tight", name: "Tight", value: "-0.025em" },
  { id: "normal", name: "Normal", value: "0em" },
  { id: "wide", name: "Wide", value: "0.05em" },
];

const AVATAR_SHAPES = [
  { id: "circle", name: "Circle" },
  { id: "rounded-square", name: "Rounded" },
  { id: "square", name: "Square" },
  { id: "hexagon", name: "Hexagon" },
];

const AVATAR_SHADOWS = [
  { id: "none", name: "None", css: "none" },
  { id: "soft", name: "Soft", css: "0 2px 8px rgba(0,0,0,0.1)" },
  { id: "medium", name: "Medium", css: "0 4px 16px rgba(0,0,0,0.15)" },
  { id: "dramatic", name: "Dramatic", css: "0 8px 32px rgba(0,0,0,0.25)" },
];

const BUTTON_SHADOWS = [
  { id: "none", name: "None", css: "none" },
  { id: "subtle", name: "Subtle", css: "0 1px 3px rgba(0,0,0,0.08)" },
  { id: "medium", name: "Medium", css: "0 4px 12px rgba(0,0,0,0.12)" },
  { id: "lifted", name: "Lifted", css: "0 8px 24px rgba(0,0,0,0.18)" },
];

/* ── Constants ── */
const TEMPLATES = [
  { id: "minimal", name: "Minimal", dark: false },
  { id: "glass", name: "Glass", dark: true },
  { id: "bold", name: "Bold", dark: true },
  { id: "showcase", name: "Showcase", dark: false },
  { id: "neon", name: "Neon", dark: true },
  { id: "collage", name: "Collage", dark: true },
  { id: "bento", name: "Bento", dark: true },
  { id: "split", name: "Split", dark: false },
  { id: "aurora", name: "Aurora", dark: true },
  { id: "brutalist", name: "Brutalist", dark: false },
  { id: "sunset", name: "Sunset", dark: true },
  { id: "terminal", name: "Terminal", dark: true },
  { id: "pastel", name: "Pastel", dark: false },
  { id: "magazine", name: "Magazine", dark: false },
  { id: "retro", name: "Retro", dark: true },
  { id: "midnight", name: "Midnight", dark: true },
  { id: "clay", name: "Clay", dark: false },
  { id: "gradient-mesh", name: "Gradient Mesh", dark: true },
  { id: "trader", name: "Trader", dark: true },
  { id: "educator", name: "Educator", dark: false },
  { id: "developer", name: "Developer", dark: true },
  { id: "executive", name: "Executive", dark: false },
];

const TEMPLATE_DEFAULTS: Record<string, { bgType: string; bgValue: string; textColor: string }> = {
  minimal: { bgType: 'solid', bgValue: '#ffffff', textColor: '#171717' },
  glass: { bgType: 'gradient', bgValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', textColor: '#ffffff' },
  bold: { bgType: 'gradient', bgValue: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', textColor: '#ffffff' },
  showcase: { bgType: 'solid', bgValue: '#fafafa', textColor: '#171717' },
  neon: { bgType: 'solid', bgValue: '#0a0a0a', textColor: '#00ff88' },
  collage: { bgType: 'gradient', bgValue: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', textColor: '#ffffff' },
  bento: { bgType: 'solid', bgValue: '#111111', textColor: '#ffffff' },
  split: { bgType: 'solid', bgValue: '#ffffff', textColor: '#171717' },
  aurora: { bgType: 'gradient', bgValue: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #0f3460 100%)', textColor: '#ffffff' },
  brutalist: { bgType: 'solid', bgValue: '#f5f0e8', textColor: '#1a1a1a' },
  sunset: { bgType: 'gradient', bgValue: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', textColor: '#ffffff' },
  terminal: { bgType: 'solid', bgValue: '#0a0a0a', textColor: '#00ff00' },
  pastel: { bgType: 'gradient', bgValue: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', textColor: '#4a4a4a' },
  magazine: { bgType: 'solid', bgValue: '#ffffff', textColor: '#171717' },
  retro: { bgType: 'gradient', bgValue: 'linear-gradient(135deg, #232526 0%, #414345 100%)', textColor: '#f5deb3' },
  midnight: { bgType: 'gradient', bgValue: 'linear-gradient(180deg, #0c0c0c 0%, #1a1a2e 100%)', textColor: '#ffffff' },
  clay: { bgType: 'solid', bgValue: '#f2ebe3', textColor: '#3d3229' },
  'gradient-mesh': { bgType: 'gradient', bgValue: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #fd79a8 100%)', textColor: '#ffffff' },
  trader: { bgType: 'solid', bgValue: '#0b0e11', textColor: '#00c087' },
  educator: { bgType: 'gradient', bgValue: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 50%, #ffffff 100%)', textColor: '#78350f' },
  developer: { bgType: 'solid', bgValue: '#1a1b26', textColor: '#c0caf5' },
  executive: { bgType: 'solid', bgValue: '#ffffff', textColor: '#1e3a5f' },
};

const FONTS = [
  { id: "jakarta", name: "Jakarta", css: "'Plus Jakarta Sans', sans-serif" },
  { id: "outfit", name: "Outfit", css: "'Outfit', sans-serif" },
  { id: "inter", name: "Inter", css: "'Inter', sans-serif" },
  { id: "dm-sans", name: "DM Sans", css: "'DM Sans', sans-serif" },
  { id: "poppins", name: "Poppins", css: "'Poppins', sans-serif" },
  { id: "space-grotesk", name: "Space Grotesk", css: "'Space Grotesk', sans-serif" },
  { id: "sora", name: "Sora", css: "'Sora', sans-serif" },
  { id: "manrope", name: "Manrope", css: "'Manrope', sans-serif" },
];

const GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
  "linear-gradient(180deg, #0c0c0c 0%, #1a1a2e 100%)",
  "linear-gradient(135deg, #232526 0%, #414345 100%)",
  "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  "linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)",
  "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
  "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
  "linear-gradient(135deg, #fd79a8 0%, #e84393 100%)",
  "linear-gradient(135deg, #00b894 0%, #00cec9 100%)",
  "linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)",
  "linear-gradient(135deg, #0984e3 0%, #6c5ce7 100%)",
  "linear-gradient(135deg, #2d3436 0%, #636e72 100%)",
  "linear-gradient(135deg, #b33939 0%, #e74c3c 50%, #f39c12 100%)",
  "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  "linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)",
  "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
];

const ACCENT_COLORS = [
  "#6366f1", "#22d3ee", "#ef4444", "#f97316", "#22c55e",
  "#a855f7", "#ec4899", "#eab308", "#14b8a6", "#171717", "#ffffff",
];

const TEXT_COLORS = [
  { id: "", name: "Auto", color: "" },
  { id: "#ffffff", name: "White", color: "#ffffff" },
  { id: "#f5f5f5", name: "Light", color: "#f5f5f5" },
  { id: "#171717", name: "Dark", color: "#171717" },
  { id: "#0a0a0a", name: "Black", color: "#0a0a0a" },
  { id: "#6366f1", name: "Indigo", color: "#6366f1" },
  { id: "#ec4899", name: "Pink", color: "#ec4899" },
  { id: "#22d3ee", name: "Cyan", color: "#22d3ee" },
];

const BUTTON_SHAPES = [
  { id: "rounded", name: "Rounded", radius: "16px" },
  { id: "pill", name: "Pill", radius: "9999px" },
  { id: "square", name: "Square", radius: "0px" },
  { id: "soft", name: "Soft", radius: "8px" },
];

const BUTTON_ANIMS = [
  { id: "none", name: "None" },
  { id: "bounce", name: "Bounce" },
  { id: "pulse", name: "Pulse" },
  { id: "shake", name: "Shake" },
  { id: "scale", name: "Scale Up" },
  { id: "glow", name: "Glow" },
];

const INTRO_ANIMS = [
  { id: "none", name: "None", desc: "No animation", free: true },
  { id: "fade-up", name: "Fade Up", desc: "Content slides up smoothly", free: true },
  { id: "fade-scale", name: "Scale In", desc: "Grows from center", free: true },
  { id: "spotlight", name: "Spotlight", desc: "Light reveals your page", free: false },
  { id: "glitch", name: "Glitch", desc: "Digital glitch effect", free: false },
  { id: "particle-burst", name: "Particle Burst", desc: "Particles explode then settle", free: false },
  { id: "typewriter", name: "Typewriter", desc: "Name types itself letter by letter", free: false },
  { id: "wave", name: "Wave", desc: "Content ripples into view", free: false },
  { id: "neon", name: "Neon Flicker", desc: "Neon sign turning on", free: false },
  { id: "cinema", name: "Cinema", desc: "Cinematic letterbox reveal", free: false },
  { id: "morph", name: "Morph", desc: "Shapes morph into your profile", free: false },
  { id: "trading-candles", name: "Trading Candles", desc: "Candlestick chart rises up", free: false },
  { id: "slide-left", name: "Slide Left", desc: "Content slides in from the left", free: true },
  { id: "slide-right", name: "Slide Right", desc: "Content slides in from the right", free: true },
  { id: "blur-in", name: "Blur In", desc: "Blurred content sharpens into focus", free: true },
  { id: "cascade", name: "Cascade", desc: "Elements fall in one by one", free: false },
  { id: "bounce-in", name: "Bounce In", desc: "Content bounces into place", free: false },
  { id: "rotate-in", name: "Rotate In", desc: "Elements rotate and scale in", free: false },
];

const CARD_STYLES = [
  { id: "default", name: "Default" },
  { id: "outlined", name: "Outlined" },
  { id: "filled", name: "Filled" },
  { id: "shadow", name: "Shadow" },
  { id: "glass", name: "Glass" },
];

/* ── Mini Preview ── */
function MiniPreview({ settings, creator, blocks: blocksProp }: { settings: Settings; creator: any; blocks?: Block[] }) {
  const dark = TEMPLATES.find(t => t.id === settings.template)?.dark ?? false;
  const accent = settings.accent || "#6366f1";
  const btnRadius = BUTTON_SHAPES.find(s => s.id === settings.buttonShape)?.radius || "16px";
  const fontFamily = "'Inter', sans-serif"; // Default font
  const textCol = dark ? "#ffffff" : "#171717"; // Default text colors
  const textMuted = dark ? "rgba(255,255,255,0.5)" : "rgba(23,23,23,0.5)";

  // Default positioning
  const justifyPos = "flex-start"; // Default to top
  const textAlignVal = "center" as React.CSSProperties["textAlign"];
  const alignItemsVal = "center";
  const positioningStyle: React.CSSProperties = { minHeight: '100%', justifyContent: justifyPos, alignItems: alignItemsVal, textAlign: textAlignVal };

  const name = creator.full_name || creator.name || "Your Name";
  const headline = creator.headline || "Creator / Content Maker";
  const avatar = creator.avatar_url || creator.avatar;
  const socials = (creator.socials || []).length > 0 ? creator.socials : [{ platform: "instagram" }, { platform: "tiktok" }, { platform: "youtube" }];
  const services = creator.services?.length > 0 ? creator.services.slice(0, 3) : [
    { title: "UGC Video Package", price: 299 },
    { title: "Product Photography", price: 199 },
    { title: "Social Media Audit", price: 99 },
  ];

  // Helper components
  function PlatformIcon({ platform, size = 16, className }: { platform: string; size?: number; className?: string }) {
    return <div className={className} style={{ width: size, height: size }} />;
  }

  function Avatar({ size, borderCol = "#fff", shape = "circle" }: { size: string; borderCol?: string; shape?: string }) {
    const isCircle = shape === "circle";
    return avatar ? (
      <img src={avatar} alt="" className={`${size} ${isCircle ? "rounded-full" : "rounded-xl"} object-cover border-4`} style={{ borderColor: borderCol }} />
    ) : (
      <div className={`${size} ${isCircle ? "rounded-full" : "rounded-xl"} bg-neutral-300 flex items-center justify-center text-2xl font-bold text-neutral-600 border-4`} style={{ borderColor: borderCol }}>
        {name[0]}
      </div>
    );
  }

  function Socials({ light = false }: { light?: boolean } = {}) {
    return (
      <div className="flex gap-1.5">
        {socials.slice(0, 5).map((s: any, i: number) => (
          <div key={i} className={`w-7 h-7 rounded-full border ${light ? "border-white/20 bg-white/10" : "border-neutral-200 bg-neutral-50"} flex items-center justify-center`}>
            <PlatformIcon platform={s.platform} size={14} className={light ? "text-white/60" : "text-neutral-500"} />
          </div>
        ))}
      </div>
    );
  }

  function CTAButton({ altStyle }: { altStyle?: React.CSSProperties } = {}) {
    return (
      <button
        className="w-full py-3 text-sm font-semibold text-center transition-all hover:opacity-90 active:scale-95"
        style={{
          borderRadius: btnRadius,
          background: accent,
          color: "#fff",
          ...altStyle
        }}
      >
        Book Now
      </button>
    );
  }

  function ServiceCard({ s, i }: { s: any; i: number }) {
    const cardStyle = "default"; // Default card style
    const cardBg = dark ? "rgba(255,255,255,0.08)" : "#fff";
    const cardBorder = `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`;
    const cardShadow = "none";
    return (
      <div className="w-full py-2.5 px-3 text-[11px] font-medium text-left" style={{ borderRadius: btnRadius, background: cardBg, border: cardBorder, boxShadow: cardShadow, color: textCol }}>
        <div className="flex items-center justify-between"><span>{s.title}</span><span style={{ opacity: 0.4 }}>${s.price}</span></div>
      </div>
    );
  }

  const tpl = settings.template;

  /* ═══ BLOCK-BASED RENDERING ═══ */
  const visibleBlocks = (blocksProp || []).filter(b => b.visible).sort((a, b) => a.order - b.order);
  const hasCustomBlocks = blocksProp && blocksProp.length > 0 && !(blocksProp.length === 4 && blocksProp[0].id === "blk_hero" && blocksProp[1].id === "blk_links" && blocksProp[2].id === "blk_socials" && blocksProp[3].id === "blk_cta" && !blocksProp.some(b => Object.keys(b.config).length > 0 && b.type !== "cta"));

  if (hasCustomBlocks && visibleBlocks.length > 0) {
    return (
      <div className="relative w-full min-h-full overflow-hidden" style={{ fontFamily, background: dark ? "#0a0a0a" : "#f5f5f5" }}>
        <div className="relative z-10 flex flex-col items-center px-4 pb-8 max-w-[440px] mx-auto" style={{ paddingTop: "24px", gap: `${8}px` }}>
          {visibleBlocks.map((block) => {
            if (block.type === "hero") return (
              <div key={block.id} className="flex flex-col items-center w-full">
                <Avatar size="w-16 h-16" borderCol={accent} />
                <h2 className="mt-2 text-sm font-bold" style={{ color: textCol }}>{name}</h2>
                <p className="text-[10px]" style={{ color: textMuted }}>{headline}</p>
                {block.config.subtitle && <p className="text-[9px] mt-0.5" style={{ color: textMuted }}>{block.config.subtitle}</p>}
              </div>
            );
            if (block.type === "socials") return (
              <div key={block.id}><Socials light={dark} /></div>
            );
            if (block.type === "links") return (
              <div key={block.id} className="w-full space-y-2">{services.map((s: any, i: number) => <ServiceCard key={i} s={s} i={i} />)}</div>
            );
            if (block.type === "cta") return (
              <div key={block.id} className="w-full"><CTAButton altStyle={block.config.label ? {} : undefined} /></div>
            );
            if (block.type === "text") return (
              <div key={block.id} className="w-full px-1">
                <p className="text-[11px]" style={{ color: textCol }}>{block.config.text || "Text block"}</p>
              </div>
            );
            if (block.type === "divider") return (
              <div key={block.id} className="w-full flex items-center justify-center py-1">
                {(block.config.style === "dots") ? (
                  <div className="flex gap-1">{[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full" style={{ background: textMuted }} />)}</div>
                ) : (block.config.style === "space") ? (
                  <div className="h-4" />
                ) : (
                  <div className="w-full h-[1px]" style={{ background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
                )}
              </div>
            );
            if (block.type === "testimonial") return (
              <div key={block.id} className="w-full p-3 rounded-xl" style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}` }}>
                <p className="text-[10px] italic" style={{ color: textCol }}>"{block.config.quote || "Great work!"}"</p>
                {block.config.author && <p className="text-[9px] mt-1 font-semibold" style={{ color: textMuted }}>— {block.config.author}</p>}
              </div>
            );
            if (block.type === "contact") return (
              <div key={block.id} className="w-full p-3 rounded-xl text-[10px]" style={{ background: dark ? "rgba(255,255,255,0.05)" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, color: textCol }}>
                {block.config.email && <div>{block.config.email}</div>}
                {block.config.phone && <div className="mt-0.5">{block.config.phone}</div>}
                {!block.config.email && !block.config.phone && <div>Contact info</div>}
              </div>
            );
            if (block.type === "video") return (
              <div key={block.id} className="w-full aspect-video rounded-xl bg-neutral-800 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" opacity={0.5}><polygon points="5,3 19,12 5,21" /></svg>
              </div>
            );
            if (block.type === "gallery") return (
              <div key={block.id} className="w-full grid grid-cols-3 gap-1">
                {[1,2,3].map(i => <div key={i} className="aspect-square rounded-lg" style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />)}
              </div>
            );
            if (block.type === "product") return (
              <div key={block.id} className="w-full p-3 rounded-xl" style={{ background: dark ? "rgba(255,255,255,0.05)" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}` }}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold" style={{ color: textCol }}>{block.config.name || "Product"}</span>
                  <span className="text-[10px] font-bold" style={{ color: accent }}>{block.config.price || "$0"}</span>
                </div>
              </div>
            );
            if (block.type === "booking") return (
              <div key={block.id} className="w-full">
                <button className="w-full py-2.5 text-[11px] font-semibold rounded-xl" style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>Book a Session</button>
              </div>
            );
            if (block.type === "newsletter") return (
              <div key={block.id} className="w-full p-3 rounded-xl" style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}` }}>
                <div className="text-[10px] font-semibold mb-1.5" style={{ color: textCol }}>{block.config.heading || "Join my newsletter"}</div>
                <div className="flex gap-1">
                  <div className="flex-1 h-6 rounded-lg" style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)" }} />
                  <div className="px-3 h-6 rounded-lg flex items-center text-[9px] font-bold text-white" style={{ background: accent }}>Join</div>
                </div>
              </div>
            );
            return <div key={block.id} className="w-full h-8 rounded-lg" style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }} />;
          })}
        </div>
      </div>
    );
  }

  /* ═══ MINIMAL — White card on grey, cover, centered avatar ═══ */
  if (tpl === "minimal") return (
    <div className="relative w-full min-h-full bg-neutral-200 flex items-start justify-center sm:py-2 sm:px-2" style={{ fontFamily }}>
      <div className="relative z-10 w-full sm:max-w-[400px] bg-white sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 relative">
          {creator.cover_url && <img src={creator.cover_url} alt="" className="w-full h-full object-cover" />}
          <svg viewBox="0 0 100 12" className="absolute -bottom-[1px] left-0 w-full" preserveAspectRatio="none"><path d="M0 12 Q25 2 50 9 Q75 16 100 5 L100 12 Z" fill="white"/></svg>
        </div>
        <div className="flex flex-col items-center px-4 pb-6 -mt-8">
          <Avatar size="w-16 h-16" borderCol="#fff" />
          <h2 className="mt-2 text-sm font-bold" style={{ color: textCol }}>{name}</h2>
          <p className="text-[10px]" style={{ color: textMuted }}>{headline}</p>
          <div className="mt-3"><Socials /></div>
          <div className="w-full mt-4 space-y-2">{services.map((s: any, i: number) => <ServiceCard key={i} s={s} i={i} />)}</div>
          <div className="w-full mt-4"><CTAButton /></div>
        </div>
      </div>
    </div>
  );

  /* ═══ GLASS — Full-bleed gradient, frosted cards ═══ */
  if (tpl === "glass") return (
    <div className="relative w-full min-h-full overflow-hidden" style={{ fontFamily, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <div className="absolute top-10 right-4 w-24 h-24 rounded-full bg-pink-400/20 blur-2xl" />
      <div className="absolute bottom-10 left-2 w-32 h-32 rounded-full bg-blue-400/15 blur-3xl" />
      <div className="relative z-10 flex flex-col items-center pt-10 px-5 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <Avatar size="w-16 h-16" borderCol="rgba(255,255,255,0.25)" />
        <h2 className="mt-3 text-sm font-bold text-white" style={{ color: textCol }}>{name}</h2>
        <p className="text-[10px] text-white/50" style={{ color: textMuted }}>{headline}</p>
        <div className="mt-3"><Socials light /></div>
        <div className="w-full mt-4 space-y-2">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-2.5 px-3 text-[11px] font-medium text-center" style={{ borderRadius: btnRadius, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)", color: textCol, backdropFilter: "blur(12px)" }}>
            <div className="flex items-center justify-between"><span>{s.title}</span><span style={{ opacity: 0.4 }}>${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ borderRadius: btnRadius, background: "#fff", color: "#171717", width: "100%", padding: "10px 0", fontSize: "11px", fontWeight: 700 }} /></div>
      </div>
    </div>
  );

  /* ═══ BOLD — Dark, big square avatar, accent accent accent ═══ */
  if (tpl === "bold") return (
    <div className="relative w-full min-h-full bg-neutral-950 overflow-hidden" style={{ fontFamily }}>
      <div className="absolute top-0 right-0 w-1/3 h-full -skew-x-12 translate-x-8" style={{ background: `${accent}10` }} />
      <div className="relative z-10 flex flex-col items-center pt-8 px-5 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <Avatar size="w-20 h-20" shape="square" borderCol={accent} />
        <h2 className="mt-3 text-base font-black text-white tracking-tight" style={{ color: textCol }}>{name}</h2>
        <p className="text-[10px] mt-0.5" style={{ color: accent }}>@{creator.slug?.split("-")[0] || "creator"}</p>
        <p className="text-[10px] mt-1" style={{ color: textMuted }}>{headline}</p>
        <div className="mt-3"><Socials light /></div>
        <div className="w-8 h-[2px] mt-4 mb-3" style={{ background: accent }} />
        <div className="w-full space-y-2">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-2.5 px-3 text-[11px] font-medium text-left bg-neutral-900 border border-neutral-800" style={{ borderRadius: btnRadius, color: textCol }}>
            <div className="flex items-center justify-between"><span>{s.title}</span><span style={{ color: accent }}>${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ borderRadius: btnRadius, background: accent, color: "#fff", width: "100%", padding: "10px 0", fontSize: "11px", fontWeight: 700 }} /></div>
      </div>
    </div>
  );

  /* ═══ NEON — Black, glowing ring, scanlines ═══ */
  if (tpl === "neon") return (
    <div className="relative w-full min-h-full bg-black overflow-hidden" style={{ fontFamily }}>
      <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:"repeating-linear-gradient(0deg, " + accent + " 0px, transparent 1px, transparent 4px)"}}/>
      <div className="absolute top-2 left-2 w-4 h-[1px]" style={{background:`${accent}50`}}/><div className="absolute top-2 left-2 w-[1px] h-4" style={{background:`${accent}50`}}/>
      <div className="absolute bottom-2 right-2 w-4 h-[1px]" style={{background:`${accent}50`}}/><div className="absolute bottom-2 right-2 w-[1px] h-4" style={{background:`${accent}50`}}/>
      <div className="relative z-10 flex flex-col items-center pt-8 px-5 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <div className="relative">
          <div className="absolute inset-0 rounded-full scale-[1.35]" style={{ border: `1px solid ${accent}30` }} />
          {avatar
            ? <img src={avatar} alt="" className="w-16 h-16 rounded-full object-cover" style={{ border: `2px solid ${accent}`, boxShadow: `0 0 20px ${accent}40` }} />
            : <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center text-lg font-bold text-white/50" style={{ border: `2px solid ${accent}`, boxShadow: `0 0 20px ${accent}40` }}>{name[0]}</div>
          }
        </div>
        <h2 className="mt-3 text-sm font-bold text-white" style={{ color: textCol }}>{name}</h2>
        <p className="text-[10px] mt-0.5" style={{ color: accent }}>@{creator.slug?.split("-")[0] || "creator"}</p>
        <p className="text-[10px] mt-1" style={{ color: textMuted }}>{headline}</p>
        <div className="flex gap-1.5 mt-3">{socials.slice(0, 5).map((s: any, i: number) => (
          <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ border: `1px solid ${accent}30`, background: `${accent}10` }}>
            <PlatformIcon platform={s.platform} size={14} className="text-neutral-300" />
          </div>
        ))}</div>
        <div className="w-full mt-4 space-y-2">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-2.5 px-3 text-[11px] font-medium text-center" style={{ borderRadius: btnRadius, border: `1px solid ${accent}25`, background: `${accent}08`, boxShadow: `0 0 12px ${accent}10`, color: textCol }}>
            <div className="flex items-center justify-between"><span>{s.title}</span><span style={{ color: `${accent}99` }}>${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ borderRadius: btnRadius, background: accent, color: "#000", width: "100%", padding: "10px 0", fontSize: "11px", fontWeight: 700, boxShadow: `0 0 20px ${accent}40` }} /></div>
      </div>
    </div>
  );

  /* ═══ COLLAGE — Photo mosaic bg, frosted card ═══ */
  if (tpl === "collage") return (
    <div className="relative w-full min-h-full overflow-hidden" style={{ fontFamily }}>
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-neutral-950" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 flex flex-col items-center pt-10 px-5 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <div className="w-full bg-black/30 rounded-2xl p-5 border border-white/10 flex flex-col items-center" style={{backdropFilter:"blur(12px)"}}>
          <Avatar size="w-14 h-14" shape="square" borderCol="rgba(255,255,255,0.2)" />
          <h2 className="mt-2 text-sm font-bold text-white" style={{ color: textCol }}>{name}</h2>
          <p className="text-[10px] text-white/50" style={{ color: textMuted }}>{headline}</p>
          <div className="mt-2"><Socials light /></div>
        </div>
        <div className="w-full mt-3 space-y-2">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-2.5 px-3 text-[11px] font-medium text-center" style={{ borderRadius: btnRadius, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", color: textCol }}>
            <div className="flex items-center justify-between"><span>{s.title}</span><span style={{ opacity: 0.4 }}>${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ borderRadius: btnRadius, background: "rgba(255,255,255,0.9)", color: "#171717", width: "100%", padding: "10px 0", fontSize: "11px", fontWeight: 700 }} /></div>
      </div>
    </div>
  );

  /* ═══ BENTO — Dark grid layout ═══ */
  if (tpl === "bento") return (
    <div className="relative w-full min-h-full bg-neutral-950 p-3" style={{ fontFamily }}>
      
      <div className="relative z-10 max-w-[440px] mx-auto grid grid-cols-4 gap-2 auto-rows-[60px]">
        {/* Identity card */}
        <div className="col-span-4 row-span-2 rounded-2xl overflow-hidden relative flex items-center gap-3 px-4" style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}>
          <Avatar size="w-12 h-12" shape="square" borderCol={`${accent}40`} />
          <div>
            <h2 className="text-sm font-bold text-white" style={{ color: textCol }}>{name}</h2>
            <p className="text-[9px]" style={{ color: textMuted }}>{headline}</p>
          </div>
        </div>
        {/* Socials */}
        <div className="col-span-2 row-span-1 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center gap-1.5">
          {socials.slice(0, 4).map((s: any, i: number) => (
            <div key={i} className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center"><PlatformIcon platform={s.platform} size={12} className="text-neutral-400" /></div>
          ))}
        </div>
        {/* Location */}
        <div className="col-span-2 row-span-1 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
          <span className="text-[9px]" style={{ color: textMuted }}>{creator.location || "hireacreator.ai"}</span>
        </div>
        {/* Service cards */}
        {services.slice(0, 2).map((s: any, i: number) => (
          <div key={i} className="col-span-2 row-span-1 rounded-xl px-3 flex items-center justify-between" style={{ border: `1px solid ${accent}25`, background: `${accent}08` }}>
            <span className="text-[10px] font-medium truncate" style={{ color: textCol }}>{s.title}</span>
            <span className="text-[9px]" style={{ color: textMuted }}>${s.price}</span>
          </div>
        ))}
        {/* CTA */}
        <div className="col-span-4 row-span-1 rounded-xl flex items-center justify-center font-bold text-[11px] text-white" style={{ background: accent, borderRadius: btnRadius }}>View Full Profile</div>
      </div>
    </div>
  );

  /* ═══ SHOWCASE — Light, 2-col grid ═══ */
  if (tpl === "showcase") return (
    <div className="relative w-full min-h-full bg-neutral-100 flex items-start justify-center sm:py-2 sm:px-2" style={{ fontFamily }}>
      
      <div className="relative z-10 w-full sm:max-w-[400px] bg-white sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="px-4 pb-6 pt-6 text-center">
          <Avatar size="w-14 h-14" shape="square" borderCol="transparent" />
          <h2 className="mt-2 text-sm font-bold" style={{ color: textCol }}>{name}</h2>
          <p className="text-[10px]" style={{ color: textMuted }}>{headline}</p>
          <div className="mt-3"><Socials /></div>
          <div className="grid grid-cols-2 gap-2 mt-4">{services.map((s: any, i: number) => (
            <div key={i} className="rounded-xl bg-neutral-50 border border-neutral-200 p-3 text-left">
              <div className="text-[11px] font-semibold" style={{ color: textCol }}>{s.title}</div>
              <div className="text-[9px] mt-1" style={{ color: textMuted }}>${s.price}</div>
            </div>
          ))}</div>
          <div className="mt-4"><CTAButton /></div>
        </div>
      </div>
    </div>
  );

  /* ═══ SPLIT — Left hero, right content ═══ */
  if (tpl === "split") return (
    <div className="relative w-full min-h-full bg-white" style={{ fontFamily }}>
      <div className="min-h-full flex">
        <div className="w-[42%] relative">
          {creator.cover_url ? <img src={creator.cover_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-b from-neutral-300 to-neutral-400" />}
          <svg viewBox="0 0 12 100" className="absolute top-0 -right-[1px] h-full w-3" preserveAspectRatio="none"><polygon points="0,0 12,6 12,94 0,100" fill="white"/></svg>
        </div>
        <div className="w-[58%] flex flex-col px-4 py-6 relative">
          <div className="absolute -left-5 top-4">
            <Avatar size="w-10 h-10" borderCol="#fff" />
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-bold" style={{ color: textCol }}>{name}</h2>
            <p className="text-[9px]" style={{ color: textMuted }}>{headline}</p>
          </div>
          <div className="flex flex-wrap gap-1 mt-3">{socials.slice(0, 4).map((s: any, i: number) => (
            <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-50 border border-neutral-200">
              <PlatformIcon platform={s.platform} size={10} className="text-neutral-500" />
              <span className="text-[8px] text-neutral-600 font-medium">{s.handle || s.platform}</span>
            </div>
          ))}</div>
          <div className="mt-3 space-y-1.5 flex-1">{services.map((s: any, i: number) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 bg-neutral-50 border border-neutral-200" style={{ borderRadius: btnRadius }}>
              <span className="text-[10px] font-medium" style={{ color: textCol }}>{s.title}</span>
              <span className="text-[9px]" style={{ color: textMuted }}>${s.price}</span>
            </div>
          ))}</div>
          <div className="mt-3"><CTAButton /></div>
        </div>
      </div>
    </div>
  );

  /* ═══ AURORA — Animated gradient bg, centered, ethereal ═══ */
  if (tpl === "aurora") return (
    <div className="relative w-full min-h-full overflow-hidden" style={{ fontFamily, background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <div className="absolute top-0 left-1/4 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-0 w-48 h-48 rounded-full bg-teal-400/15 blur-3xl" />
      <div className="absolute top-1/2 left-0 w-32 h-32 rounded-full bg-pink-500/10 blur-3xl" />
      <div className="relative z-10 flex flex-col items-center pt-10 px-5 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <Avatar size="w-16 h-16" borderCol="rgba(167,139,250,0.4)" />
        <h2 className="mt-3 text-sm font-bold" style={{ color: textCol || "#fff" }}>{name}</h2>
        <p className="text-[10px]" style={{ color: textMuted }}>{headline}</p>
        <div className="mt-3"><Socials light /></div>
        <div className="w-full mt-4 space-y-2">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-2.5 px-3 text-[11px] font-medium" style={{ borderRadius: btnRadius, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(167,139,250,0.15)", backdropFilter: "blur(12px)", color: textCol || "#fff" }}>
            <div className="flex items-center justify-between"><span>{s.title}</span><span style={{ opacity: 0.4 }}>${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ borderRadius: btnRadius, background: "linear-gradient(135deg, #a78bfa, #818cf8)", color: "#fff", width: "100%", padding: "10px 0", fontSize: "11px", fontWeight: 700 }} /></div>
      </div>
    </div>
  );

  /* ═══ BRUTALIST — White bg, thick black borders, raw typography ═══ */
  if (tpl === "brutalist") return (
    <div className="relative w-full min-h-full bg-white" style={{ fontFamily }}>
      
      <div className="relative z-10 flex flex-col items-center pt-8 px-5 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <div className="w-20 h-20 border-[3px] border-black overflow-hidden">{avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-2xl font-black">{name[0]}</div>}</div>
        <h2 className="mt-3 text-lg font-black uppercase tracking-widest" style={{ color: textCol }}>{name}</h2>
        <p className="text-[10px] uppercase tracking-wider" style={{ color: textMuted }}>{headline}</p>
        <div className="flex gap-2 mt-3">{socials.slice(0, 5).map((s: any, i: number) => (
          <div key={i} className="w-7 h-7 border-2 border-black flex items-center justify-center"><PlatformIcon platform={s.platform} size={14} className="text-black" /></div>
        ))}</div>
        <div className="w-full mt-4 space-y-2">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-3 px-4 text-[11px] font-bold uppercase tracking-wide border-[2px] border-black" style={{ color: textCol }}>
            <div className="flex items-center justify-between"><span>{s.title}</span><span>${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ background: "#000", color: "#fff", width: "100%", padding: "12px 0", fontSize: "11px", fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: "0.1em", border: "2px solid #000" }} /></div>
      </div>
    </div>
  );

  /* ═══ SUNSET — Warm gradient, rounded everything ═══ */
  if (tpl === "sunset") return (
    <div className="relative w-full min-h-full overflow-hidden" style={{ fontFamily, background: "linear-gradient(180deg, #ff6b6b 0%, #ee5a24 40%, #f39c12 100%)" }}>
      
      <div className="relative z-10 flex flex-col items-center pt-10 px-5 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <Avatar size="w-16 h-16" borderCol="rgba(255,255,255,0.4)" />
        <h2 className="mt-3 text-sm font-bold text-white" style={{ color: textCol }}>{name}</h2>
        <p className="text-[10px] text-white/60" style={{ color: textMuted }}>{headline}</p>
        <div className="mt-3"><Socials light /></div>
        <div className="w-full mt-4 space-y-2">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-2.5 px-3 text-[11px] font-medium" style={{ borderRadius: "9999px", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.15)", color: textCol || "#fff" }}>
            <div className="flex items-center justify-between"><span>{s.title}</span><span style={{ opacity: 0.5 }}>${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ borderRadius: "9999px", background: "#fff", color: "#ee5a24", width: "100%", padding: "10px 0", fontSize: "11px", fontWeight: 700 }} /></div>
      </div>
    </div>
  );

  /* ═══ TERMINAL — Hacker green-on-black, monospace ═══ */
  if (tpl === "terminal") return (
    <div className="relative w-full min-h-full bg-[#0a0a0a] overflow-hidden" style={{ fontFamily: "'Space Grotesk', monospace" }}>
      <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:"repeating-linear-gradient(0deg, #00ff00 0px, transparent 1px, transparent 3px)"}}/>
      
      <div className="relative z-10 flex flex-col items-center pt-8 px-5 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <div className="text-[10px] text-green-500/50 self-start mb-3 font-mono">$ cat profile.json</div>
        <Avatar size="w-14 h-14" borderCol="#22c55e" />
        <h2 className="mt-3 text-sm font-bold text-green-400" style={{ color: textCol }}>{name}</h2>
        <p className="text-[10px] text-green-500/50 font-mono" style={{ color: textMuted }}>&gt; {headline}</p>
        <div className="flex gap-1.5 mt-3">{socials.slice(0, 5).map((s: any, i: number) => (
          <div key={i} className="w-7 h-7 rounded border border-green-500/30 bg-green-500/5 flex items-center justify-center"><PlatformIcon platform={s.platform} size={14} className="text-green-400/60" /></div>
        ))}</div>
        <div className="w-full mt-4 space-y-2">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-2.5 px-3 text-[11px] font-mono border border-green-500/20 bg-green-500/5" style={{ borderRadius: "4px", color: textCol || "#4ade80" }}>
            <div className="flex items-center justify-between"><span>{'>'} {s.title}</span><span className="text-green-500/40">${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ borderRadius: "4px", background: "#22c55e", color: "#000", width: "100%", padding: "10px 0", fontSize: "11px", fontWeight: 700, fontFamily: "monospace" }} /></div>
      </div>
    </div>
  );

  /* ═══ PASTEL — Soft pastel bg, rounded cards, playful ═══ */
  if (tpl === "pastel") return (
    <div className="relative w-full min-h-full" style={{ fontFamily, background: "linear-gradient(180deg, #fce4ec 0%, #e8eaf6 50%, #e0f7fa 100%)" }}>
      
      <div className="relative z-10 flex flex-col items-center pt-10 px-5 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <Avatar size="w-16 h-16" borderCol="#fff" />
        <h2 className="mt-3 text-sm font-bold text-neutral-800" style={{ color: textCol }}>{name}</h2>
        <p className="text-[10px] text-neutral-500" style={{ color: textMuted }}>{headline}</p>
        <div className="mt-3"><Socials /></div>
        <div className="w-full mt-4 space-y-2">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-2.5 px-3 text-[11px] font-medium bg-white/70 border border-white shadow-sm" style={{ borderRadius: "20px", color: textCol || "#1a1a1a", backdropFilter: "blur(4px)" }}>
            <div className="flex items-center justify-between"><span>{s.title}</span><span style={{ opacity: 0.4 }}>${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ borderRadius: "9999px", background: "#6c5ce7", color: "#fff", width: "100%", padding: "10px 0", fontSize: "11px", fontWeight: 700 }} /></div>
      </div>
    </div>
  );

  /* ═══ MAGAZINE — Editorial, left-aligned, serif feel ═══ */
  if (tpl === "magazine") return (
    <div className="relative w-full min-h-full bg-[#fafaf8]" style={{ fontFamily }}>
      
      <div className="relative z-10 max-w-[440px] mx-auto px-6 pt-8 pb-8 flex flex-col" style={positioningStyle}>
        <div className="flex items-start gap-4 mb-6">
          <Avatar size="w-14 h-14" borderCol="transparent" />
          <div className="text-left">
            <h2 className="text-base font-bold" style={{ color: textCol }}>{name}</h2>
            <p className="text-[10px] mt-0.5" style={{ color: textMuted }}>{headline}</p>
            <div className="flex gap-1.5 mt-2">{socials.slice(0, 4).map((s: any, i: number) => (
              <div key={i} className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center"><PlatformIcon platform={s.platform} size={12} className="text-neutral-400" /></div>
            ))}</div>
          </div>
        </div>
        <div className="w-full h-[1px] bg-neutral-200 mb-4" />
        <div className="space-y-0">{services.map((s: any, i: number) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-neutral-200" style={{ color: textCol }}>
            <span className="text-[12px] font-medium">{s.title}</span><span className="text-[11px]" style={{ color: textMuted }}>${s.price}</span>
          </div>
        ))}</div>
        <div className="mt-5"><CTAButton /></div>
      </div>
    </div>
  );

  /* ═══ RETRO — 80s/synthwave, neon pink + purple ═══ */
  if (tpl === "retro") return (
    <div className="relative w-full min-h-full overflow-hidden" style={{ fontFamily, background: "linear-gradient(180deg, #1a0533 0%, #2d1b69 50%, #0f0c29 100%)" }}>
      {/* Grid floor */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-20" style={{backgroundImage:"linear-gradient(rgba(236,72,153,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.3) 1px, transparent 1px)", backgroundSize:"30px 30px", transform:"perspective(200px) rotateX(40deg)", transformOrigin:"bottom"}}/>
      
      <div className="relative z-10 flex flex-col items-center pt-10 px-5 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <Avatar size="w-16 h-16" borderCol="#ec4899" />
        <h2 className="mt-3 text-sm font-bold" style={{ color: textCol || "#f472b6" }}>{name}</h2>
        <p className="text-[10px]" style={{ color: textMuted || "#a78bfa80" }}>{headline}</p>
        <div className="flex gap-1.5 mt-3">{socials.slice(0, 5).map((s: any, i: number) => (
          <div key={i} className="w-7 h-7 rounded-full border border-pink-500/30 bg-pink-500/10 flex items-center justify-center"><PlatformIcon platform={s.platform} size={14} className="text-pink-400/60" /></div>
        ))}</div>
        <div className="w-full mt-4 space-y-2">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-2.5 px-3 text-[11px] font-medium border border-pink-500/20 bg-pink-500/5" style={{ borderRadius: btnRadius, color: textCol || "#f9a8d4" }}>
            <div className="flex items-center justify-between"><span>{s.title}</span><span className="text-purple-400/50">${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ borderRadius: btnRadius, background: "linear-gradient(90deg, #ec4899, #a855f7)", color: "#fff", width: "100%", padding: "10px 0", fontSize: "11px", fontWeight: 700 }} /></div>
      </div>
    </div>
  );

  /* ═══ MIDNIGHT — Deep navy, gold accents ═══ */
  if (tpl === "midnight") return (
    <div className="relative w-full min-h-full bg-[#0a1628]" style={{ fontFamily }}>
      
      <div className="relative z-10 flex flex-col items-center pt-10 px-5 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <Avatar size="w-16 h-16" borderCol="#d4a574" />
        <h2 className="mt-3 text-sm font-bold" style={{ color: textCol || "#f5f0e8" }}>{name}</h2>
        <p className="text-[10px]" style={{ color: textMuted || "#d4a57480" }}>{headline}</p>
        <div className="flex gap-1.5 mt-3">{socials.slice(0, 5).map((s: any, i: number) => (
          <div key={i} className="w-7 h-7 rounded-full border border-amber-600/30 bg-amber-600/5 flex items-center justify-center"><PlatformIcon platform={s.platform} size={14} className="text-amber-500/60" /></div>
        ))}</div>
        <div className="w-full mt-4 space-y-2">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-2.5 px-3 text-[11px] font-medium bg-white/[0.04] border border-amber-600/15" style={{ borderRadius: btnRadius, color: textCol || "#f5f0e8" }}>
            <div className="flex items-center justify-between"><span>{s.title}</span><span className="text-amber-500/50">${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ borderRadius: btnRadius, background: "linear-gradient(135deg, #d4a574, #b8860b)", color: "#0a1628", width: "100%", padding: "10px 0", fontSize: "11px", fontWeight: 700 }} /></div>
      </div>
    </div>
  );

  /* ═══ CLAY — Soft 3D clay/neumorphic, light bg ═══ */
  if (tpl === "clay") return (
    <div className="relative w-full min-h-full bg-[#e8e4df]" style={{ fontFamily }}>
      
      <div className="relative z-10 flex flex-col items-center pt-10 px-5 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <div className="w-16 h-16 rounded-2xl overflow-hidden" style={{ boxShadow: "6px 6px 12px #c5c1bc, -6px -6px 12px #fff" }}>
          {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#e8e4df] flex items-center justify-center text-xl font-bold text-neutral-400">{name[0]}</div>}
        </div>
        <h2 className="mt-3 text-sm font-bold text-neutral-700" style={{ color: textCol }}>{name}</h2>
        <p className="text-[10px] text-neutral-400" style={{ color: textMuted }}>{headline}</p>
        <div className="flex gap-1.5 mt-3">{socials.slice(0, 5).map((s: any, i: number) => (
          <div key={i} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ boxShadow: "3px 3px 6px #c5c1bc, -3px -3px 6px #fff" }}><PlatformIcon platform={s.platform} size={14} className="text-neutral-500" /></div>
        ))}</div>
        <div className="w-full mt-4 space-y-2.5">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-2.5 px-3 text-[11px] font-medium" style={{ borderRadius: "16px", boxShadow: "4px 4px 10px #c5c1bc, -4px -4px 10px #fff", color: textCol || "#525252" }}>
            <div className="flex items-center justify-between"><span>{s.title}</span><span style={{ opacity: 0.4 }}>${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ borderRadius: "16px", background: "#525252", color: "#e8e4df", width: "100%", padding: "10px 0", fontSize: "11px", fontWeight: 700, boxShadow: "4px 4px 10px #c5c1bc, -4px -4px 10px #fff" }} /></div>
      </div>
    </div>
  );

  /* ═══ GRADIENT MESH — Colorful mesh gradient bg ═══ */
  if (tpl === "gradient-mesh") return (
    <div className="relative w-full min-h-full overflow-hidden" style={{ fontFamily, background: "#000" }}>
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] rounded-full bg-purple-600/40 blur-[80px]" />
      <div className="absolute top-[30%] right-[-10%] w-[50%] h-[40%] rounded-full bg-blue-500/30 blur-[80px]" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-emerald-500/25 blur-[80px]" />
      <div className="absolute top-[10%] left-[40%] w-[30%] h-[30%] rounded-full bg-pink-500/20 blur-[60px]" />
      
      <div className="relative z-10 flex flex-col items-center pt-10 px-5 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <Avatar size="w-16 h-16" borderCol="rgba(255,255,255,0.3)" />
        <h2 className="mt-3 text-sm font-bold text-white" style={{ color: textCol }}>{name}</h2>
        <p className="text-[10px] text-white/50" style={{ color: textMuted }}>{headline}</p>
        <div className="mt-3"><Socials light /></div>
        <div className="w-full mt-4 space-y-2">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-2.5 px-3 text-[11px] font-medium" style={{ borderRadius: btnRadius, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", color: textCol || "#fff" }}>
            <div className="flex items-center justify-between"><span>{s.title}</span><span style={{ opacity: 0.4 }}>${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ borderRadius: btnRadius, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", color: "#fff", width: "100%", padding: "10px 0", fontSize: "11px", fontWeight: 700 }} /></div>
      </div>
    </div>
  );

  /* ═══ TRADER — Trading terminal dark green/black ═══ */
  if (tpl === "trader") return (
    <div className="relative w-full min-h-full bg-[#0b0e11] overflow-hidden" style={{ fontFamily: "'SF Mono', 'Courier New', monospace" }}>
      <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage:"repeating-linear-gradient(0deg, #00c087 0px, transparent 1px, transparent 4px)"}}/>
      
      <div className="relative z-10 flex flex-col items-center pt-6 px-5 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <div className="w-full flex items-center justify-between mb-4 text-[8px] font-mono">
          <span className="text-[#00c087]/50">{name.toUpperCase().replace(/\s/g, '')}.X</span>
          <div className="flex gap-2"><span className="text-[#00c087]">▲ LIVE</span></div>
        </div>
        <Avatar size="w-14 h-14" borderCol="#00c087" />
        <h2 className="mt-3 text-sm font-bold text-[#00c087]" style={{ color: textCol }}>{name}</h2>
        <p className="text-[10px] text-[#00c087]/40 font-mono" style={{ color: textMuted }}>{headline}</p>
        <div className="flex gap-1.5 mt-3">{socials.slice(0, 5).map((s: any, i: number) => (
          <div key={i} className="w-7 h-7 rounded border border-[#00c087]/20 bg-[#00c087]/5 flex items-center justify-center"><PlatformIcon platform={s.platform} size={14} className="text-[#00c087]/50" /></div>
        ))}</div>
        <div className="w-full mt-4 space-y-2">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-2.5 px-3 text-[11px] font-mono border border-[#00c087]/15 bg-[#00c087]/[0.03]" style={{ borderRadius: "4px", color: textCol || "#00c087" }}>
            <div className="flex items-center justify-between"><span>{s.title}</span><span className="text-[#00c087]/50">${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ borderRadius: "4px", background: "#00c087", color: "#0b0e11", width: "100%", padding: "10px 0", fontSize: "11px", fontWeight: 700, fontFamily: "monospace" }} /></div>
      </div>
    </div>
  );

  /* ═══ EDUCATOR — Warm, trustworthy, course-seller aesthetic ═══ */
  if (tpl === "educator") return (
    <div className="relative w-full min-h-full" style={{ fontFamily, background: "linear-gradient(180deg, #fffbf0 0%, #fff 40%, #fef3e2 100%)" }}>
      
      <div className="relative z-10 flex flex-col items-center pt-10 px-5 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <Avatar size="w-16 h-16" borderCol="#d97706" />
        <h2 className="mt-3 text-sm font-bold text-neutral-900" style={{ color: textCol, fontFamily: "'Georgia', serif" }}>{name}</h2>
        <p className="text-[10px] text-amber-700/60" style={{ color: textMuted }}>{headline}</p>
        <div className="mt-3"><Socials /></div>
        <div className="w-full mt-4 space-y-2">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-2.5 px-3 text-[11px] font-medium bg-white border border-amber-200/50 shadow-sm" style={{ borderRadius: "12px", borderLeft: "3px solid #d97706", color: textCol || "#1a1a1a" }}>
            <div className="flex items-center justify-between"><span>{s.title}</span><span style={{ opacity: 0.4 }}>${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ borderRadius: "12px", background: "#d97706", color: "#fff", width: "100%", padding: "10px 0", fontSize: "11px", fontWeight: 700 }} /></div>
      </div>
    </div>
  );

  /* ═══ DEVELOPER — Code editor dark, syntax colors ═══ */
  if (tpl === "developer") return (
    <div className="relative w-full min-h-full bg-[#1a1b26] overflow-hidden" style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
      
      <div className="relative z-10 flex flex-col items-center pt-8 px-5 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <div className="text-[8px] text-[#565f89] self-start mb-3 font-mono">// profile.ts</div>
        <Avatar size="w-14 h-14" shape="square" borderCol="#7dcfff" />
        <h2 className="mt-3 text-sm font-bold text-[#c0caf5]" style={{ color: textCol }}>{name}</h2>
        <p className="text-[10px] text-[#565f89] font-mono" style={{ color: textMuted }}>@{(creator?.slug || name).toLowerCase().replace(/\s/g, '-')}</p>
        <div className="flex gap-1.5 mt-3">{socials.slice(0, 5).map((s: any, i: number) => (
          <div key={i} className="w-7 h-7 rounded-lg border border-[#7dcfff]/20 bg-[#7dcfff]/5 flex items-center justify-center"><PlatformIcon platform={s.platform} size={14} className="text-[#7dcfff]/50" /></div>
        ))}</div>
        <div className="w-full mt-4 space-y-2">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-2.5 px-3 text-[11px] font-mono border border-[#9ece6a]/15 bg-white/[0.03]" style={{ borderRadius: "6px", color: textCol || "#c0caf5" }}>
            <div className="flex items-center justify-between"><span><span className="text-[#7dcfff]/60">$ </span>{s.title}</span><span className="text-[#bb9af7]/50">${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ borderRadius: "6px", background: "#7dcfff", color: "#1a1b26", width: "100%", padding: "10px 0", fontSize: "11px", fontWeight: 700, fontFamily: "monospace" }} /></div>
      </div>
    </div>
  );

  /* ═══ EXECUTIVE — Ultra-clean, premium whitespace ═══ */
  if (tpl === "executive") return (
    <div className="relative w-full min-h-full bg-white" style={{ fontFamily }}>
      
      <div className="relative z-10 flex flex-col items-center pt-12 px-6 pb-8 max-w-[440px] mx-auto" style={positioningStyle}>
        <Avatar size="w-20 h-20" borderCol="transparent" />
        <h2 className="mt-4 text-base font-bold text-[#0f1729]" style={{ color: textCol, fontFamily: "'Georgia', serif" }}>{name}</h2>
        <p className="text-[10px] text-neutral-400 mt-1" style={{ color: textMuted }}>{headline}</p>
        <div className="mt-3"><Socials /></div>
        <div className="w-16 h-[0.5px] bg-neutral-200 my-4" />
        <div className="w-full space-y-2">{services.map((s: any, i: number) => (
          <div key={i} className="w-full py-3 px-4 text-[11px] font-medium bg-white border border-neutral-200 hover:border-neutral-300 transition-colors" style={{ borderRadius: "10px", color: textCol || "#0f1729" }}>
            <div className="flex items-center justify-between"><span>{s.title}</span><span className="text-neutral-400">${s.price}</span></div>
          </div>
        ))}</div>
        <div className="w-full mt-4"><CTAButton altStyle={{ borderRadius: "10px", background: "#1e3a5f", color: "#fff", width: "100%", padding: "10px 0", fontSize: "11px", fontWeight: 700, fontFamily: "'Georgia', serif" }} /></div>
      </div>
    </div>
  );

  /* ═══ FALLBACK ═══ */
  return (
    <div className="relative w-full min-h-full overflow-hidden" style={{ fontFamily, background: dark ? "#0a0a0a" : "#e5e5e5" }}>
      
      <div className="relative z-10 flex flex-col items-center pt-10 px-4 pb-8" style={positioningStyle}>
        <Avatar size="w-16 h-16" />
        <h2 className="mt-3 text-sm font-bold" style={{ color: textCol }}>{name}</h2>
        <p className="text-[10px]" style={{ color: textMuted }}>{headline}</p>
        <div className="mt-3"><Socials light={dark} /></div>
        <div className="w-full mt-4 space-y-2">{services.map((s: any, i: number) => <ServiceCard key={i} s={s} i={i} />)}</div>
        <div className="w-full mt-4"><CTAButton /></div>
      </div>
    </div>
  );
}

function getAnim(id: string): string | undefined {
  const m: Record<string, string> = { bounce: "edBounce 0.4s ease", pulse: "edPulse 0.35s ease", shake: "edShake 0.3s ease", scale: "edScale 0.35s ease", glow: "edGlow 0.5s ease" };
  return m[id];
}

/* ── Main Editor ── */
export function LinkInBioEditorContent({ user }: { user: any }) {


  const [settings, setSettings] = useState<Settings>({
    template: user.link_bio_template || "minimal",
    accent: user.link_bio_accent || "#6366f1",
    bgType: user.link_bio_bg_type || "",
    bgValue: user.link_bio_bg_value || "",
    textColor: user.link_bio_text_color || "",
    font: user.link_bio_font || "jakarta",
    buttonShape: user.link_bio_button_shape || "rounded",
    buttonAnim: user.link_bio_button_anim || "none",
    introAnim: user.link_bio_intro_anim || "none",
    hideBranding: user.hide_branding || false,
    /* v2 style */
    fontSize: user.link_bio_font_size || "medium",
    fontWeight: user.link_bio_font_weight || 500,
    letterSpacing: user.link_bio_letter_spacing || "normal",
    nameColor: user.link_bio_name_color || "",
    bgGradientDir: user.link_bio_bg_gradient_dir || "135deg",
    bgGradientFrom: user.link_bio_bg_gradient_from || "#667eea",
    bgGradientTo: user.link_bio_bg_gradient_to || "#764ba2",
    bgImageUrl: user.link_bio_bg_image_url || "",
    bgVideoUrl: user.link_bio_bg_video || "",
    overlayType: user.link_bio_overlay_type || "none",
    overlayOpacity: user.link_bio_overlay_opacity ?? 40,
    blurIntensity: user.link_bio_blur_intensity ?? 0,
    pagePadding: user.link_bio_page_padding ?? 20,
    sectionGap: user.link_bio_section_gap ?? 16,
    containerWidth: user.link_bio_container_width || "standard",
    /* v2 avatar */
    avatarShape: user.link_bio_avatar_shape || "circle",
    avatarSize: user.link_bio_avatar_size_px ?? 80,
    avatarBorderWidth: user.link_bio_avatar_border_width ?? 3,
    avatarBorderColor: user.link_bio_avatar_border_color || "#ffffff",
    avatarShadow: user.link_bio_avatar_shadow || "none",
    avatarMode: user.link_bio_avatar_mode || "photo",
    avatarRing: user.link_bio_avatar_ring || false,
    avatarRingColor: user.link_bio_avatar_ring_color || "#6366f1",
    /* v2 buttons */
    buttonFill: user.link_bio_button_fill || "",
    buttonBorder: user.link_bio_button_border || false,
    buttonBorderWidth: user.link_bio_button_border_width ?? 1,
    buttonBorderColor: user.link_bio_button_border_color || "#e5e5e5",
    buttonShadow: user.link_bio_button_shadow || "none",
    buttonWidth: user.link_bio_button_width || "full-width",
    buttonHeight: user.link_bio_button_height || "medium",
    buttonTextColor: user.link_bio_button_text_color || "",
    buttonIconPos: user.link_bio_button_icon_pos || "none",
    buttonHoverEffect: user.link_bio_button_hover || "none",
    /* v2 animation */
    animTiming: user.link_bio_anim_timing ?? 400,
    animStagger: user.link_bio_anim_stagger ?? 100,
  });

  const [blocks, setBlocks] = useState<Block[]>(
    user.link_bio_blocks ? JSON.parse(user.link_bio_blocks) : DEFAULT_BLOCKS
  );
  const [editMode, setEditMode] = useState<"quick" | "advanced">(
    user.link_bio_edit_mode || "quick"
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [aiReferenceUrl, setAiReferenceUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState("links");
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  const [mobilePreview, setMobilePreview] = useState(false);

  // Use ref for latest settings so save never has stale closure
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const [saveError, setSaveError] = useState("");
  const [aiDesigning, setAiDesigning] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  async function aiDesign() {
    setAiDesigning(true);
    setAiDone(false);
    try {
      const aiUrl = aiReferenceUrl ? `/api/profile/ai-design?referenceUrl=${encodeURIComponent(aiReferenceUrl)}` : "/api/profile/ai-design";
      const res = await fetch(aiUrl);
      if (!res.ok) throw new Error("AI design failed");
      const data = await res.json();
      await save({
        template: data.template,
        bgType: data.bgType,
        bgValue: data.bgValue,
        textColor: data.textColor,
        buttonShape: data.buttonShape,
        font: data.font,
      });
      // Also update headline if AI suggested one and user doesn't have one
      if (data.suggestedHeadline) {
        try {
          await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ headline: data.suggestedHeadline }),
          });
        } catch {}
      }
      setAiDone(true);
      setTimeout(() => setAiDone(false), 5000);
    } catch (e) {
      console.error("AI design error:", e);
      setSaveError("AI design failed — try again");
    }
    setAiDesigning(false);
  }

  async function handleAiModalApply(design: AIDesignResult) {
    try {
      await save({
        template: design.template,
        bgType: design.bgType,
        bgValue: design.bgValue,
        textColor: design.textColor,
        buttonShape: design.buttonShape,
        font: design.font,
        accent: design.accent,
      });
      if (design.suggestedHeadline) {
        try {
          await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ headline: design.suggestedHeadline }),
          });
        } catch {}
      }
      setAiDone(true);
      setTimeout(() => setAiDone(false), 5000);
    } catch (e) {
      console.error("AI design apply error:", e);
      setSaveError("Failed to apply AI design");
    }
  }

  async function save(updates: Partial<Settings>) {
    const next = { ...settingsRef.current, ...updates };
    setSettings(next);
    settingsRef.current = next;
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link_bio_template: next.template,
          link_bio_accent: next.accent,
          link_bio_bg_type: next.bgType || user.link_bio_bg_type || "gradient",
          link_bio_bg_value: next.bgValue || user.link_bio_bg_value || "",
          link_bio_bg_video: user.link_bio_bg_video || "",
          link_bio_bg_images: user.link_bio_bg_images || "[]",
          link_bio_font: next.font || user.link_bio_font || "jakarta",
          link_bio_text_color: next.textColor || user.link_bio_text_color || "",
          link_bio_card_style: user.link_bio_card_style || "default",
          link_bio_text_size: user.link_bio_text_size || "medium",
          link_bio_avatar_size: user.link_bio_avatar_size || "medium",
          link_bio_button_size: user.link_bio_button_size || "medium",
          link_bio_content_position: user.link_bio_content_position || "top",
          link_bio_content_align: user.link_bio_content_align || "center",
          link_bio_button_shape: next.buttonShape,
          link_bio_button_anim: next.buttonAnim,
          link_bio_intro_anim: next.introAnim,
          /* v2 fields */
          link_bio_blocks: JSON.stringify(blocks),
          link_bio_font_size: next.fontSize,
          link_bio_font_weight: next.fontWeight,
          link_bio_letter_spacing: next.letterSpacing,
          link_bio_page_padding: next.pagePadding,
          link_bio_section_gap: next.sectionGap,
          link_bio_container_width: next.containerWidth,
          link_bio_avatar_shape: next.avatarShape,
          link_bio_avatar_border_width: next.avatarBorderWidth,
          link_bio_avatar_border_color: next.avatarBorderColor,
          link_bio_avatar_shadow: next.avatarShadow,
          link_bio_button_fill: next.buttonFill,
          link_bio_button_border: next.buttonBorder,
          link_bio_button_shadow: next.buttonShadow,
          link_bio_button_width: next.buttonWidth,
          link_bio_overlay_type: next.overlayType,
          link_bio_overlay_opacity: next.overlayOpacity,
          link_bio_blur_intensity: next.blurIntensity,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setSaveError(errData.error || `Save failed (${res.status})`);
        setSaving(false);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e: any) {
      console.error("Save failed:", e);
      setSaveError("Network error — check your connection");
    }
    setSaving(false);
  }

  async function saveBlocks(newBlocks: Block[]) {
    setBlocks(newBlocks);
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link_bio_blocks: JSON.stringify(newBlocks) }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setSaveError(errData.error || `Save failed (${res.status})`);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    } catch {
      setSaveError("Network error — check your connection");
    }
    setSaving(false);
  }

  function addBlock(type: string) {
    const newBlock: Block = {
      id: `blk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      config: type === "cta" ? { label: "Book Now" } : {},
      visible: true,
      order: blocks.length,
    };
    saveBlocks([...blocks, newBlock]);
  }

  function removeBlock(id: string) {
    saveBlocks(blocks.filter(b => b.id !== id).map((b, i) => ({ ...b, order: i })));
    if (selectedBlockId === id) setSelectedBlockId(null);
  }

  function duplicateBlock(id: string) {
    const src = blocks.find(b => b.id === id);
    if (!src) return;
    const dup: Block = { ...src, id: `blk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, order: src.order + 1 };
    const updated = [...blocks];
    const idx = updated.findIndex(b => b.id === id);
    updated.splice(idx + 1, 0, dup);
    saveBlocks(updated.map((b, i) => ({ ...b, order: i })));
  }

  function moveBlock(id: string, dir: -1 | 1) {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= blocks.length) return;
    const updated = [...blocks];
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    saveBlocks(updated.map((b, i) => ({ ...b, order: i })));
  }

  function updateBlockConfig(id: string, config: Record<string, any>) {
    saveBlocks(blocks.map(b => b.id === id ? { ...b, config: { ...b.config, ...config } } : b));
  }

  function toggleBlockVisibility(id: string) {
    saveBlocks(blocks.map(b => b.id === id ? { ...b, visible: !b.visible } : b));
  }



  const [logoUrl, setLogoUrl] = useState<string | null>(user.logo_url || null);
  const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(user.header_image_url || null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  async function uploadBranding(file: File, type: "logo" | "header") {
    const setUploading = type === "logo" ? setUploadingLogo : setUploadingHeader;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (type === "logo") {
        setLogoUrl(data.url);
        await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ logo_url: data.url }) });
      } else {
        setHeaderImageUrl(data.url);
        await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ header_image_url: data.url }) });
      }
    } catch (e) {
      console.error("Upload error:", e);
      setSaveError("Upload failed — try again");
    }
    setUploading(false);
  }

  async function removeBranding(type: "logo" | "header") {
    try {
      if (type === "logo") {
        setLogoUrl(null);
        await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ logo_url: null }) });
      } else {
        setHeaderImageUrl(null);
        await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ header_image_url: null }) });
      }
    } catch (e) {
      console.error("Remove error:", e);
    }
  }

  const quickSections = [
    { id: "links", name: "Links" },
    { id: "template", name: "Template" },
    { id: "style", name: "Style" },
  ];
  const advancedSections = [
    { id: "links", name: "Links" },
    { id: "blocks", name: "Blocks" },
    { id: "branding", name: "Branding" },
    { id: "template", name: "Template" },
    { id: "style", name: "Style" },
    { id: "buttons", name: "Buttons" },
    { id: "animation", name: "Animation" },
  ];
  const sections = editMode === "quick" ? quickSections : advancedSections;

  return (
    <div className="min-h-screen bg-neutral-100">


      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-600"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <h1 className="font-display font-bold text-neutral-900 text-base">Edit Link in Bio</h1>
          </div>
          <div className="flex items-center gap-2">
            {saving && <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />}
            {saved && <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-full"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg>Saved</span>}
            {aiDone && <span className="text-xs text-blue-600 font-medium flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-full"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg>Page designed by AI</span>}
            {saveError && <span className="text-xs text-red-600 font-medium">{saveError}</span>}
            <button
              onClick={() => setAiModalOpen(true)}
              className="px-4 py-1.5 text-xs font-semibold text-white rounded-full transition-all flex items-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" /></svg>
              AI Design My Page
            </button>
            <button
              onClick={aiDesign}
              disabled={aiDesigning}
              className="px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              {aiDesigning ? (
                <div className="w-3 h-3 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              )}
              {aiDesigning ? "..." : "Quick"}
            </button>
            {user.slug && (
              <Link href={`/u/${user.slug}`} target="_blank" className="px-4 py-1.5 text-xs font-semibold bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors">
                View Live
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left — Editor */}
          <div className="lg:w-[55%] space-y-4 pb-20 lg:pb-0">
            {/* Quick / Advanced toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 p-0.5 bg-white rounded-lg border border-neutral-200/60">
                <button onClick={() => { setEditMode("quick"); if (!quickSections.find(s => s.id === section)) setSection("links"); }} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${editMode === "quick" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-600"}`}>Quick Edit</button>
                <button onClick={() => setEditMode("advanced")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${editMode === "advanced" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-600"}`}>Advanced</button>
              </div>
            </div>
            {/* Section tabs — scrollable */}
            <div className="flex gap-1 p-1 bg-white rounded-2xl border border-neutral-200/60 overflow-x-auto sticky top-14 z-40 scrollbar-hide">
              {sections.map(s => (
                <button key={s.id} onClick={() => setSection(s.id)} className={`flex-shrink-0 py-3 px-5 min-h-[44px] rounded-xl text-xs font-semibold text-center transition-all whitespace-nowrap ${section === s.id ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-700"}`}>
                  {s.name}
                </button>
              ))}
            </div>

            {/* ─── LINKS ─── */}
            {section === "links" && (
              <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900">Your Links</h2>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Add links, drag to reorder, toggle visibility</p>
                  </div>
                </div>
                <LinkManager />
              </div>
            )}

            {/* ─── BRANDING ─── */}
            {section === "branding" && (
              <div className="space-y-4">
                {/* Logo Upload */}
                <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 mb-1">Brand Logo</h2>
                    <p className="text-[11px] text-neutral-400 mb-3">Replaces circular avatar. Shown large, not cropped to circle.</p>
                    <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadBranding(f, "logo"); }} />
                    {logoUrl ? (
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden">
                          <img src={logoUrl} alt="" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="space-y-2">
                          <button onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo} className="block text-xs font-semibold text-blue-600 hover:text-blue-700">
                            {uploadingLogo ? "Uploading..." : "Replace"}
                          </button>
                          <button onClick={() => removeBranding("logo")} className="block text-xs font-semibold text-red-500 hover:text-red-600">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo} className="w-full py-8 border-2 border-dashed border-neutral-300 rounded-xl text-sm text-neutral-400 hover:border-neutral-400 hover:text-neutral-500 transition-colors">
                        {uploadingLogo ? (
                          <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />Uploading...</span>
                        ) : "Click to upload logo"}
                      </button>
                    )}
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 mb-1">Header Image</h2>
                    <p className="text-[11px] text-neutral-400 mb-3">Banner image shown above the fold, full-width.</p>
                    <input ref={headerInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadBranding(f, "header"); }} />
                    {headerImageUrl ? (
                      <div className="space-y-3">
                        <div className="w-full h-32 rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden">
                          <img src={headerImageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => headerInputRef.current?.click()} disabled={uploadingHeader} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                            {uploadingHeader ? "Uploading..." : "Replace"}
                          </button>
                          <button onClick={() => removeBranding("header")} className="text-xs font-semibold text-red-500 hover:text-red-600">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => headerInputRef.current?.click()} disabled={uploadingHeader} className="w-full py-8 border-2 border-dashed border-neutral-300 rounded-xl text-sm text-neutral-400 hover:border-neutral-400 hover:text-neutral-500 transition-colors">
                        {uploadingHeader ? (
                          <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />Uploading...</span>
                        ) : "Click to upload header image"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Profile Image / Avatar Controls */}
                <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-5">
                  <h2 className="text-sm font-bold text-neutral-900">Profile Image Controls</h2>
                  {/* Mode toggle */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Display Mode</label>
                    <div className="flex gap-2">
                      <button onClick={() => save({ avatarMode: "photo" })} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${settings.avatarMode === "photo" ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>Profile Photo</button>
                      <button onClick={() => save({ avatarMode: "logo" })} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${settings.avatarMode === "logo" ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>Brand Logo</button>
                    </div>
                  </div>
                  {/* Shape */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Shape</label>
                    <div className="flex gap-2">
                      {AVATAR_SHAPES.map(s => (
                        <button key={s.id} onClick={() => save({ avatarShape: s.id })} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${settings.avatarShape === s.id ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>{s.name}</button>
                      ))}
                    </div>
                  </div>
                  {/* Size slider */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Size: {settings.avatarSize}px</label>
                    <input type="range" min={48} max={200} value={settings.avatarSize} onChange={e => save({ avatarSize: parseInt(e.target.value) } as any)} className="w-full accent-neutral-900" />
                  </div>
                  {/* Border */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Border Width: {settings.avatarBorderWidth}px</label>
                    <input type="range" min={0} max={8} value={settings.avatarBorderWidth} onChange={e => save({ avatarBorderWidth: parseInt(e.target.value) })} className="w-full accent-neutral-900" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Border Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.avatarBorderColor} onChange={e => save({ avatarBorderColor: e.target.value })} className="w-8 h-8 rounded-lg border border-neutral-200 cursor-pointer" />
                      <input type="text" value={settings.avatarBorderColor} onChange={e => save({ avatarBorderColor: e.target.value })} className="flex-1 px-3 py-1.5 text-xs border border-neutral-200 rounded-lg font-mono" />
                    </div>
                  </div>
                  {/* Shadow */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Shadow</label>
                    <div className="flex gap-2">
                      {AVATAR_SHADOWS.map(s => (
                        <button key={s.id} onClick={() => save({ avatarShadow: s.id })} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${settings.avatarShadow === s.id ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>{s.name}</button>
                      ))}
                    </div>
                  </div>
                  {/* Ring */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-neutral-600">Ring / Outline</div>
                      <div className="text-[10px] text-neutral-400">Add a colored ring around avatar</div>
                    </div>
                    <button onClick={() => save({ avatarRing: !settings.avatarRing })} role="switch" aria-checked={settings.avatarRing} className={`relative w-11 h-6 rounded-full transition-colors ${settings.avatarRing ? "bg-neutral-900" : "bg-neutral-300"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.avatarRing ? "translate-x-5" : ""}`} />
                    </button>
                  </div>
                  {settings.avatarRing && (
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.avatarRingColor} onChange={e => save({ avatarRingColor: e.target.value })} className="w-7 h-7 rounded border border-neutral-200 cursor-pointer" />
                      <input type="text" value={settings.avatarRingColor} onChange={e => save({ avatarRingColor: e.target.value })} className="flex-1 px-3 py-1.5 text-xs border border-neutral-200 rounded-lg font-mono" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── TEMPLATE ─── */}
            {section === "template" && (
              <>
              {/* AI Reference URL + Design CTA */}
              <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold text-neutral-600">Paste your website or social URL for AI to match your brand</span>
                  <input
                    type="url"
                    placeholder="https://yoursite.com or @handle"
                    value={aiReferenceUrl}
                    onChange={e => setAiReferenceUrl(e.target.value)}
                    className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-neutral-50"
                  />
                </label>
                <button
                  onClick={() => setAiModalOpen(true)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-neutral-900">AI Design My Page</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{aiReferenceUrl ? "AI will match your brand from the URL above" : "Add your brand links and let AI create a custom design"}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-300 shrink-0 group-hover:text-neutral-500 transition-colors"><path d="M9 18l6-6-6-6" strokeLinecap="round" /></svg>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
                <h2 className="text-sm font-bold text-neutral-900 mb-4">Choose Template</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[70vh] overflow-y-auto pr-1">
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => save({ template: t.id })} className={`relative rounded-2xl overflow-hidden transition-all active:scale-95 ${settings.template === t.id ? "ring-2 ring-neutral-900 ring-offset-2" : "hover:ring-1 hover:ring-neutral-300"}`}>
                      <EditorTemplateMini id={t.id} />
                      <div className="p-2 bg-white text-center">
                        <div className="text-[10px] font-bold text-neutral-900">{t.name}</div>
                      </div>
                      {settings.template === t.id && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              </>
            )}

            {/* ─── BLOCKS ─── */}
            {section === "blocks" && (
              <div className="space-y-4">
                {/* Current blocks */}
                <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
                  <h2 className="text-sm font-bold text-neutral-900 mb-1">Page Blocks</h2>
                  <p className="text-[11px] text-neutral-400 mb-4">Add, reorder, and configure sections of your page.</p>
                  {blocks.length === 0 && <p className="text-xs text-neutral-400 py-6 text-center">No blocks yet. Add one below.</p>}
                  <div className="space-y-2">
                    {blocks.sort((a, b) => a.order - b.order).map((block, idx) => {
                      const bt = BLOCK_TYPES.find(t => t.type === block.type);
                      const isSelected = selectedBlockId === block.id;
                      return (
                        <div key={block.id}>
                          <div
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-300"} ${!block.visible ? "opacity-50" : ""}`}
                            onClick={() => setSelectedBlockId(isSelected ? null : block.id)}
                          >
                            <span className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500 shrink-0">{bt?.icon || "?"}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-neutral-900 truncate">{bt?.name || block.type}</div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={e => { e.stopPropagation(); moveBlock(block.id, -1); }} disabled={idx === 0} className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 text-neutral-400"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" strokeLinecap="round"/></svg></button>
                              <button onClick={e => { e.stopPropagation(); moveBlock(block.id, 1); }} disabled={idx === blocks.length - 1} className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 text-neutral-400"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round"/></svg></button>
                              <button onClick={e => { e.stopPropagation(); toggleBlockVisibility(block.id); }} className="p-1 rounded hover:bg-neutral-100 text-neutral-400"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{block.visible ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> : <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>}</svg></button>
                              <button onClick={e => { e.stopPropagation(); duplicateBlock(block.id); }} className="p-1 rounded hover:bg-neutral-100 text-neutral-400"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></button>
                              <button onClick={e => { e.stopPropagation(); removeBlock(block.id); }} className="p-1 rounded hover:bg-red-50 text-red-400"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round"/></svg></button>
                            </div>
                          </div>
                          {/* Block config panel */}
                          {isSelected && (
                            <div className="mt-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                              {block.type === "hero" && (
                                <div className="space-y-2">
                                  <label className="block text-[11px] font-semibold text-neutral-600">Subtitle</label>
                                  <input type="text" value={block.config.subtitle || ""} onChange={e => updateBlockConfig(block.id, { subtitle: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" placeholder="Optional subtitle" />
                                </div>
                              )}
                              {block.type === "cta" && (
                                <div className="space-y-2">
                                  <label className="block text-[11px] font-semibold text-neutral-600">Button Label</label>
                                  <input type="text" value={block.config.label || ""} onChange={e => updateBlockConfig(block.id, { label: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" placeholder="Book Now" />
                                  <label className="block text-[11px] font-semibold text-neutral-600">URL</label>
                                  <input type="url" value={block.config.url || ""} onChange={e => updateBlockConfig(block.id, { url: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" placeholder="https://" />
                                </div>
                              )}
                              {block.type === "text" && (
                                <div className="space-y-2">
                                  <label className="block text-[11px] font-semibold text-neutral-600">Text Content</label>
                                  <textarea value={block.config.text || ""} onChange={e => updateBlockConfig(block.id, { text: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg resize-none" rows={3} placeholder="Your text here..." />
                                </div>
                              )}
                              {block.type === "video" && (
                                <div className="space-y-2">
                                  <label className="block text-[11px] font-semibold text-neutral-600">Video URL</label>
                                  <input type="url" value={block.config.videoUrl || ""} onChange={e => updateBlockConfig(block.id, { videoUrl: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" placeholder="YouTube or direct URL" />
                                </div>
                              )}
                              {block.type === "testimonial" && (
                                <div className="space-y-2">
                                  <label className="block text-[11px] font-semibold text-neutral-600">Quote</label>
                                  <textarea value={block.config.quote || ""} onChange={e => updateBlockConfig(block.id, { quote: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg resize-none" rows={2} placeholder="What they said..." />
                                  <label className="block text-[11px] font-semibold text-neutral-600">Author</label>
                                  <input type="text" value={block.config.author || ""} onChange={e => updateBlockConfig(block.id, { author: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" placeholder="Name" />
                                </div>
                              )}
                              {block.type === "contact" && (
                                <div className="space-y-2">
                                  <label className="block text-[11px] font-semibold text-neutral-600">Email</label>
                                  <input type="email" value={block.config.email || ""} onChange={e => updateBlockConfig(block.id, { email: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" placeholder="you@email.com" />
                                  <label className="block text-[11px] font-semibold text-neutral-600">Phone</label>
                                  <input type="text" value={block.config.phone || ""} onChange={e => updateBlockConfig(block.id, { phone: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" placeholder="+1 (555) 000-0000" />
                                </div>
                              )}
                              {block.type === "product" && (
                                <div className="space-y-2">
                                  <label className="block text-[11px] font-semibold text-neutral-600">Product Name</label>
                                  <input type="text" value={block.config.name || ""} onChange={e => updateBlockConfig(block.id, { name: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" />
                                  <label className="block text-[11px] font-semibold text-neutral-600">Price</label>
                                  <input type="text" value={block.config.price || ""} onChange={e => updateBlockConfig(block.id, { price: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" placeholder="$99" />
                                  <label className="block text-[11px] font-semibold text-neutral-600">Link</label>
                                  <input type="url" value={block.config.link || ""} onChange={e => updateBlockConfig(block.id, { link: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" placeholder="https://" />
                                </div>
                              )}
                              {block.type === "booking" && (
                                <div className="space-y-2">
                                  <label className="block text-[11px] font-semibold text-neutral-600">Booking URL (Calendly, Cal.com, etc)</label>
                                  <input type="url" value={block.config.bookingUrl || ""} onChange={e => updateBlockConfig(block.id, { bookingUrl: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" placeholder="https://calendly.com/you" />
                                </div>
                              )}
                              {block.type === "newsletter" && (
                                <div className="space-y-2">
                                  <label className="block text-[11px] font-semibold text-neutral-600">Heading</label>
                                  <input type="text" value={block.config.heading || ""} onChange={e => updateBlockConfig(block.id, { heading: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" placeholder="Join my newsletter" />
                                  <label className="block text-[11px] font-semibold text-neutral-600">Form Action URL</label>
                                  <input type="url" value={block.config.formAction || ""} onChange={e => updateBlockConfig(block.id, { formAction: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" placeholder="https://" />
                                </div>
                              )}
                              {block.type === "divider" && (
                                <div className="space-y-2">
                                  <label className="block text-[11px] font-semibold text-neutral-600">Style</label>
                                  <div className="flex gap-2">
                                    {["line", "dots", "space"].map(s => (
                                      <button key={s} onClick={() => updateBlockConfig(block.id, { style: s })} className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${block.config.style === s ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"}`}>{s}</button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Per-block animation */}
                              <div>
                                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Block Animation</label>
                                <div className="flex flex-wrap gap-1">
                                  {BLOCK_ANIMS.map(a => (
                                    <button key={a.id} onClick={() => updateBlockConfig(block.id, { animation: a.id })} className={`px-2 py-1 text-[10px] font-semibold rounded-lg ${(block.config.animation || "none") === a.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"}`}>{a.name}</button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Add block library */}
                <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Add Block</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {BLOCK_TYPES.map(bt => (
                      <button key={bt.type} onClick={() => addBlock(bt.type)} className="flex items-center gap-2 p-3 rounded-xl border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-all text-left">
                        <span className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500 shrink-0">{bt.icon}</span>
                        <span className="text-xs font-semibold text-neutral-700">{bt.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── STYLE ─── */}
            {section === "style" && (
              <div className="space-y-4">
                {/* Typography */}
                <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-5">
                  <h2 className="text-sm font-bold text-neutral-900">Typography</h2>
                  {/* Font family */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Font Family</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {FONTS.map(f => (
                        <button key={f.id} onClick={() => save({ font: f.id })} className={`py-2 text-[10px] font-semibold rounded-lg transition-all ${settings.font === f.id ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`} style={{ fontFamily: f.css }}>{f.name}</button>
                      ))}
                    </div>
                  </div>
                  {/* Font size */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Font Size</label>
                    <div className="flex gap-2">
                      {FONT_SIZES.map(s => (
                        <button key={s.id} onClick={() => save({ fontSize: s.id })} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${settings.fontSize === s.id ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>{s.name}</button>
                      ))}
                    </div>
                  </div>
                  {/* Font weight */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Font Weight</label>
                    <div className="flex gap-2">
                      {FONT_WEIGHTS.map(w => (
                        <button key={w} onClick={() => save({ fontWeight: w })} className={`flex-1 py-2 text-xs rounded-lg transition-all ${settings.fontWeight === w ? "bg-neutral-900 text-white font-bold" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>{w}</button>
                      ))}
                    </div>
                  </div>
                  {/* Letter spacing */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Letter Spacing</label>
                    <div className="flex gap-2">
                      {LETTER_SPACINGS.map(s => (
                        <button key={s.id} onClick={() => save({ letterSpacing: s.id })} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${settings.letterSpacing === s.id ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>{s.name}</button>
                      ))}
                    </div>
                  </div>
                  {/* Accent color */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Accent Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {ACCENT_COLORS.map(c => (
                        <button key={c} onClick={() => save({ accent: c })} className={`w-8 h-8 rounded-full border-2 transition-all ${settings.accent === c ? "border-neutral-900 scale-110" : "border-transparent hover:scale-105"}`} style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                  {/* Text color */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Text Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {TEXT_COLORS.map(c => (
                        <button key={c.id} onClick={() => save({ textColor: c.id })} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${settings.textColor === c.id ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>
                          {c.color && <span className="w-3 h-3 rounded-full border border-neutral-200" style={{ background: c.color }} />}
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Name color */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Name/Headline Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.nameColor || settings.textColor || "#171717"} onChange={e => save({ nameColor: e.target.value })} className="w-8 h-8 rounded-lg border border-neutral-200 cursor-pointer" />
                      <input type="text" value={settings.nameColor || ""} onChange={e => save({ nameColor: e.target.value })} placeholder="Auto" className="flex-1 px-3 py-1.5 text-xs border border-neutral-200 rounded-lg" />
                      {settings.nameColor && <button onClick={() => save({ nameColor: "" })} className="text-[10px] text-neutral-400 hover:text-neutral-600">Reset</button>}
                    </div>
                  </div>
                </div>

                {/* Background */}
                <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-5">
                  <h2 className="text-sm font-bold text-neutral-900">Background</h2>
                  {/* Type switcher */}
                  <div className="flex gap-2">
                    {(["solid", "gradient", "image", "video"] as const).map(t => (
                      <button key={t} onClick={() => save({ bgType: t })} className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${settings.bgType === t ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>{t}</button>
                    ))}
                  </div>
                  {/* Solid */}
                  {settings.bgType === "solid" && (
                    <div className="space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        {BG_PRESETS.map(c => (
                          <button key={c} onClick={() => save({ bgValue: c })} className={`w-8 h-8 rounded-lg border-2 transition-all ${settings.bgValue === c ? "border-neutral-900 scale-110" : "border-neutral-200 hover:scale-105"}`} style={{ background: c }} />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="color" value={settings.bgValue || "#ffffff"} onChange={e => save({ bgValue: e.target.value })} className="w-8 h-8 rounded-lg border border-neutral-200 cursor-pointer" />
                        <input type="text" value={settings.bgValue} onChange={e => save({ bgValue: e.target.value })} className="flex-1 px-3 py-1.5 text-xs border border-neutral-200 rounded-lg font-mono" placeholder="#ffffff" />
                      </div>
                    </div>
                  )}
                  {/* Gradient */}
                  {settings.bgType === "gradient" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Direction</label>
                        <div className="flex gap-1.5">
                          {GRADIENT_DIRECTIONS.map(d => (
                            <button key={d.id} onClick={() => save({ bgGradientDir: d.deg })} className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${settings.bgGradientDir === d.deg ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100"}`}>{d.name}</button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">From</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={settings.bgGradientFrom} onChange={e => save({ bgGradientFrom: e.target.value, bgValue: `linear-gradient(${settings.bgGradientDir}, ${e.target.value} 0%, ${settings.bgGradientTo} 100%)` })} className="w-7 h-7 rounded border border-neutral-200 cursor-pointer" />
                            <input type="text" value={settings.bgGradientFrom} onChange={e => save({ bgGradientFrom: e.target.value, bgValue: `linear-gradient(${settings.bgGradientDir}, ${e.target.value} 0%, ${settings.bgGradientTo} 100%)` })} className="flex-1 px-2 py-1.5 text-[10px] border border-neutral-200 rounded-lg font-mono" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">To</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={settings.bgGradientTo} onChange={e => save({ bgGradientTo: e.target.value, bgValue: `linear-gradient(${settings.bgGradientDir}, ${settings.bgGradientFrom} 0%, ${e.target.value} 100%)` })} className="w-7 h-7 rounded border border-neutral-200 cursor-pointer" />
                            <input type="text" value={settings.bgGradientTo} onChange={e => save({ bgGradientTo: e.target.value, bgValue: `linear-gradient(${settings.bgGradientDir}, ${settings.bgGradientFrom} 0%, ${e.target.value} 100%)` })} className="flex-1 px-2 py-1.5 text-[10px] border border-neutral-200 rounded-lg font-mono" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Presets</label>
                        <div className="grid grid-cols-6 gap-1.5 max-h-32 overflow-y-auto">
                          {GRADIENTS.map((g, i) => (
                            <button key={i} onClick={() => save({ bgValue: g })} className={`h-8 rounded-lg border-2 transition-all ${settings.bgValue === g ? "border-neutral-900 scale-105" : "border-transparent hover:scale-105"}`} style={{ background: g }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Image */}
                  {settings.bgType === "image" && (
                    <div className="space-y-3">
                      {settings.bgImageUrl && <div className="w-full h-24 rounded-xl bg-neutral-100 overflow-hidden"><img src={settings.bgImageUrl} alt="" className="w-full h-full object-cover" /></div>}
                      <button onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"; input.onchange = async (e: any) => { const file = e.target.files[0]; if (!file) return; const fd = new FormData(); fd.append("file", file); fd.append("type", "background"); const res = await fetch("/api/upload", { method: "POST", body: fd }); if (res.ok) { const data = await res.json(); save({ bgImageUrl: data.url, bgValue: data.url }); } }; input.click(); }} className="w-full py-4 border-2 border-dashed border-neutral-300 rounded-xl text-xs text-neutral-400 hover:border-neutral-400 transition-colors">Upload Background Image</button>
                      {/* Overlay */}
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Overlay</label>
                        <div className="flex gap-2">
                          {["none", "dark", "light", "colored"].map(o => (
                            <button key={o} onClick={() => save({ overlayType: o })} className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg capitalize transition-all ${settings.overlayType === o ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500"}`}>{o}</button>
                          ))}
                        </div>
                        {settings.overlayType !== "none" && (
                          <div className="mt-2">
                            <label className="block text-[10px] text-neutral-500 mb-1">Opacity: {settings.overlayOpacity}%</label>
                            <input type="range" min={0} max={100} value={settings.overlayOpacity} onChange={e => save({ overlayOpacity: parseInt(e.target.value) })} className="w-full accent-neutral-900" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Video */}
                  {settings.bgType === "video" && (
                    <div className="space-y-3">
                      <input type="url" value={settings.bgVideoUrl} onChange={e => save({ bgVideoUrl: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl" placeholder="YouTube or direct video URL" />
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Overlay</label>
                        <div className="flex gap-2">
                          {["none", "dark", "light"].map(o => (
                            <button key={o} onClick={() => save({ overlayType: o })} className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg capitalize transition-all ${settings.overlayType === o ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500"}`}>{o}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Blur / Glass */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Glass / Blur Effect</label>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-neutral-400">Intensity: {settings.blurIntensity}px</span>
                      <input type="range" min={0} max={30} value={settings.blurIntensity} onChange={e => save({ blurIntensity: parseInt(e.target.value) })} className="flex-1 accent-neutral-900" />
                    </div>
                  </div>
                </div>

                {/* Spacing */}
                <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-5">
                  <h2 className="text-sm font-bold text-neutral-900">Spacing</h2>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Page Padding: {settings.pagePadding}px</label>
                    <input type="range" min={0} max={48} value={settings.pagePadding} onChange={e => save({ pagePadding: parseInt(e.target.value) })} className="w-full accent-neutral-900" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Section Gap: {settings.sectionGap}px</label>
                    <input type="range" min={0} max={32} value={settings.sectionGap} onChange={e => save({ sectionGap: parseInt(e.target.value) })} className="w-full accent-neutral-900" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Container Width</label>
                    <div className="flex gap-2">
                      {(["compact", "standard", "wide", "full"] as const).map(w => (
                        <button key={w} onClick={() => save({ containerWidth: w })} className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${settings.containerWidth === w ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>{w}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}




            {/* ─── BUTTONS ─── */}
            {section === "buttons" && (
              <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-6">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Button Shape</h2>
                  <div className="grid grid-cols-4 gap-2">
                    {BUTTON_SHAPES.map(s => (
                      <button key={s.id} onClick={() => save({ buttonShape: s.id })} className={`py-4 text-sm min-h-[48px] font-semibold transition-all ${settings.buttonShape === s.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`} style={{ borderRadius: s.radius }}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fill color */}
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Fill Color</h2>
                  <div className="flex items-center gap-2">
                    <input type="color" value={settings.buttonFill || settings.accent} onChange={e => save({ buttonFill: e.target.value })} className="w-8 h-8 rounded-lg border border-neutral-200 cursor-pointer" />
                    <input type="text" value={settings.buttonFill} onChange={e => save({ buttonFill: e.target.value })} placeholder="Uses accent color" className="flex-1 px-3 py-1.5 text-xs border border-neutral-200 rounded-lg font-mono" />
                    {settings.buttonFill && <button onClick={() => save({ buttonFill: "" })} className="text-[10px] text-neutral-400 hover:text-neutral-600">Reset</button>}
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {ACCENT_COLORS.map(c => (
                      <button key={c} onClick={() => save({ buttonFill: c })} className={`w-6 h-6 rounded-full border transition-all ${settings.buttonFill === c ? "border-neutral-900 scale-110" : "border-neutral-200 hover:scale-105"}`} style={{ background: c }} />
                    ))}
                  </div>
                </div>

                {/* Text color */}
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Text Color</h2>
                  <div className="flex items-center gap-2">
                    <input type="color" value={settings.buttonTextColor || "#ffffff"} onChange={e => save({ buttonTextColor: e.target.value })} className="w-8 h-8 rounded-lg border border-neutral-200 cursor-pointer" />
                    <input type="text" value={settings.buttonTextColor} onChange={e => save({ buttonTextColor: e.target.value })} placeholder="Auto" className="flex-1 px-3 py-1.5 text-xs border border-neutral-200 rounded-lg font-mono" />
                  </div>
                </div>

                {/* Border */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-neutral-900">Border</h2>
                    <button onClick={() => save({ buttonBorder: !settings.buttonBorder })} role="switch" aria-checked={settings.buttonBorder} className={`relative w-11 h-6 rounded-full transition-colors ${settings.buttonBorder ? "bg-neutral-900" : "bg-neutral-300"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.buttonBorder ? "translate-x-5" : ""}`} />
                    </button>
                  </div>
                  {settings.buttonBorder && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-500 w-12">Width</span>
                        <input type="range" min={1} max={4} value={settings.buttonBorderWidth} onChange={e => save({ buttonBorderWidth: parseInt(e.target.value) })} className="flex-1 accent-neutral-900" />
                        <span className="text-[10px] text-neutral-400 w-6">{settings.buttonBorderWidth}px</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-500 w-12">Color</span>
                        <input type="color" value={settings.buttonBorderColor} onChange={e => save({ buttonBorderColor: e.target.value })} className="w-7 h-7 rounded border border-neutral-200 cursor-pointer" />
                        <input type="text" value={settings.buttonBorderColor} onChange={e => save({ buttonBorderColor: e.target.value })} className="flex-1 px-2 py-1.5 text-[10px] border border-neutral-200 rounded-lg font-mono" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Shadow */}
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Shadow</h2>
                  <div className="flex gap-2">
                    {BUTTON_SHADOWS.map(s => (
                      <button key={s.id} onClick={() => save({ buttonShadow: s.id })} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${settings.buttonShadow === s.id ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>{s.name}</button>
                    ))}
                  </div>
                </div>

                {/* Width */}
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Width</h2>
                  <div className="flex gap-2">
                    {(["compact", "standard", "full-width"] as const).map(w => (
                      <button key={w} onClick={() => save({ buttonWidth: w })} className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${settings.buttonWidth === w ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>{w.replace("-", " ")}</button>
                    ))}
                  </div>
                </div>

                {/* Height */}
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Height</h2>
                  <div className="flex gap-2">
                    {(["small", "medium", "large"] as const).map(h => (
                      <button key={h} onClick={() => save({ buttonHeight: h })} className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${settings.buttonHeight === h ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>{h}</button>
                    ))}
                  </div>
                </div>

                {/* Icon position */}
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Icon Position</h2>
                  <div className="flex gap-2">
                    {(["none", "left", "right"] as const).map(p => (
                      <button key={p} onClick={() => save({ buttonIconPos: p })} className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${settings.buttonIconPos === p ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>{p}</button>
                    ))}
                  </div>
                </div>

                {/* Hover effect */}
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Hover Effect</h2>
                  <div className="flex gap-2 flex-wrap">
                    {HOVER_EFFECTS.map(h => (
                      <button key={h.id} onClick={() => save({ buttonHoverEffect: h.id })} className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${settings.buttonHoverEffect === h.id ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>{h.name}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Click Animation</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {BUTTON_ANIMS.map(a => (
                      <button key={a.id} onClick={() => save({ buttonAnim: a.id })} className={`py-2.5 text-xs font-semibold rounded-xl transition-all ${settings.buttonAnim === a.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                        {a.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-neutral-50 rounded-xl text-center">
                  <p className="text-[10px] text-neutral-400 mb-2">Tap to preview</p>
                  <AnimTestButton shape={settings.buttonShape} anim={settings.buttonAnim} />
                </div>

                {/* Display Toggles */}
                <div className="border-t border-neutral-100 pt-5">
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Display</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-neutral-900 font-medium">HireACreator badge</div>
                        <div className="text-xs text-neutral-400">Show "hireacreator.ai" branding at the bottom</div>
                      </div>
                      <button
                        onClick={async () => {
                          const newVal = !settings.hideBranding;
                          setSettings(prev => ({ ...prev, hideBranding: newVal }));
                          await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hide_branding: newVal }) });
                        }}
                        role="switch"
                        aria-checked={!settings.hideBranding}
                        className={`relative w-11 h-6 rounded-full transition-colors ${!settings.hideBranding ? "bg-emerald-500" : "bg-neutral-300"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${!settings.hideBranding ? "translate-x-5" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}



            {/* ─── ANIMATION ─── */}
            {section === "animation" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
                  <h2 className="text-sm font-bold text-neutral-900 mb-1">Intro Animation</h2>
                  <p className="text-[11px] text-neutral-400 mb-4">Plays once when someone visits your link in bio. Premium animations are $4.99 each from the <Link href="/animations" className="text-blue-600 hover:underline">animations store</Link>.</p>
                  <div className="space-y-1.5">
                    {INTRO_ANIMS.map(a => {
                      const owned = a.free || (user.owned_animations || []).includes?.(a.id) || user.role === "admin";
                      const isActive = settings.introAnim === a.id;
                      return (
                        <button
                          key={a.id}
                          onClick={() => owned ? save({ introAnim: a.id }) : undefined}
                          className={`flex items-center gap-3 p-4 min-h-[56px] rounded-xl text-left transition-all w-full ${
                            isActive ? "bg-neutral-900 text-white" :
                            owned ? "bg-neutral-50 text-neutral-600 hover:bg-neutral-100" :
                            "bg-neutral-50/50 text-neutral-400 cursor-default"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold">{a.name}</span>
                              {!a.free && !owned && (
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-bold rounded-full">$4.99</span>
                              )}
                              {!a.free && owned && (
                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-bold rounded-full">OWNED</span>
                              )}
                            </div>
                            <div className={`text-[10px] ${isActive ? "text-white/50" : "text-neutral-400"}`}>{a.desc}</div>
                          </div>
                          {isActive && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg>
                          )}
                          {!a.free && !owned && (
                            <Link href="/animations" className="px-3 py-1.5 bg-neutral-900 text-white text-[10px] font-bold rounded-full shrink-0 hover:bg-neutral-800" onClick={e => e.stopPropagation()}>
                              Get
                            </Link>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Animation Timing */}
                <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-5">
                  <h2 className="text-sm font-bold text-neutral-900">Animation Timing</h2>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Speed</label>
                    <div className="flex gap-2">
                      {ANIM_TIMINGS.map(t => (
                        <button key={t.value} onClick={() => save({ animTiming: t.value })} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${settings.animTiming === t.value ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>
                          {t.name}
                          <span className="block text-[9px] opacity-60">{t.value}ms</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-2">Stagger Delay (between items)</label>
                    <div className="flex gap-2">
                      {STAGGER_DELAYS.map(d => (
                        <button key={d} onClick={() => save({ animStagger: d })} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${settings.animStagger === d ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>{d}ms</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}


          </div>

          {/* Right — Live preview */}
          <div className="hidden lg:block lg:w-[45%] lg:sticky lg:top-20 lg:self-start">
            <div className="bg-white rounded-2xl border border-neutral-200/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-lg">
                  <button onClick={() => setPreviewMode("mobile")} className={`p-1.5 rounded-md transition-all ${previewMode === "mobile" ? "bg-white shadow-sm" : "hover:bg-neutral-200/50"}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={previewMode === "mobile" ? "text-neutral-900" : "text-neutral-400"}><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" /></svg>
                  </button>
                  <button onClick={() => setPreviewMode("desktop")} className={`p-1.5 rounded-md transition-all ${previewMode === "desktop" ? "bg-white shadow-sm" : "hover:bg-neutral-200/50"}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={previewMode === "desktop" ? "text-neutral-900" : "text-neutral-400"}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                  </button>
                </div>
                {user.slug && <Link href={`/u/${user.slug}`} target="_blank" className="text-[11px] text-blue-600 font-medium hover:text-blue-800">Open →</Link>}
              </div>
              {previewMode === "mobile" && (
                <div className="mx-auto w-[280px] h-[560px] bg-black rounded-[2.5rem] shadow-2xl border-[6px] border-neutral-800 overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90px] h-[22px] bg-black rounded-b-2xl z-50" />
                  <div className="w-full h-full overflow-y-auto rounded-[2rem]"><MiniPreview key={`${settings.template}-${settings.buttonShape}-${settings.accent}`} settings={settings} creator={user} blocks={blocks} /></div>
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-white/30 rounded-full z-50" />
                </div>
              )}
              {previewMode === "desktop" && (
                <div className="mx-auto">
                  <div className="bg-neutral-200 rounded-t-xl px-3 py-2 flex items-center gap-2">
                    <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><div className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>
                    <div className="flex-1 bg-white rounded-md px-2 py-1 text-[8px] text-neutral-400 truncate">hireacreator.ai/u/{user.slug || "yourname"}</div>
                  </div>
                  <div className="w-full h-[450px] border border-t-0 border-neutral-200 rounded-b-xl overflow-y-auto bg-neutral-100">
                    <div className="flex items-start justify-center py-6 min-h-full">
                      <div className="w-[400px] bg-white rounded-2xl shadow-lg overflow-hidden"><MiniPreview key={`d-${settings.template}-${settings.buttonShape}-${settings.accent}`} settings={settings} creator={user} blocks={blocks} /></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar — save status + preview */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-neutral-200 px-4 py-3 flex items-center justify-between gap-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
        <div className="flex items-center gap-2 min-w-0">
          {saving && <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin shrink-0" />}
          {saved && <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-full shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg>Saved</span>}
          {saveError && <span className="text-xs text-red-600 font-medium truncate">{saveError}</span>}
          {!saving && !saved && !saveError && <span className="text-xs text-neutral-400">Auto-saves on change</span>}
        </div>
        <button
          onClick={() => setMobilePreview(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 active:scale-95 transition-all shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          Preview
        </button>
      </div>

      {/* Mobile Preview Overlay */}
      {mobilePreview && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-neutral-100 flex flex-col" style={{ animation: "fadeIn .15s ease-out" }}>
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200">
            <h3 className="font-display font-bold text-neutral-900">Preview</h3>
            <button onClick={() => setMobilePreview(false)} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-[320px] h-[640px] bg-black rounded-[2.5rem] shadow-2xl border-[6px] border-neutral-800 overflow-hidden relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90px] h-[22px] bg-black rounded-b-2xl z-50" />
              <div className="w-full h-full overflow-y-auto rounded-[2rem]">
                <MiniPreview key={`m-${settings.template}-${settings.buttonShape}-${settings.accent}`} settings={settings} creator={user} blocks={blocks} />
              </div>
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-white/30 rounded-full z-50" />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes edBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes edPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes edShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        @keyframes edScale { 0% { transform: scale(1); } 50% { transform: scale(1.12); } 100% { transform: scale(1); } }
        @keyframes edGlow { 0%,100% { box-shadow: 0 0 0 transparent; } 50% { box-shadow: 0 0 20px rgba(99,102,241,0.5); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .scrollbar-hide::-webkit-scrollbar { display: none } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none }
      `}</style>

      <AiDesignModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onApply={handleAiModalApply}
      />
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" /><span className="text-xs text-neutral-400">Uploading...</span></div>;
}

function AnimTestButton({ shape, anim }: { shape: string; anim: string }) {
  const [key, setKey] = useState(0);
  const radius = BUTTON_SHAPES.find(s => s.id === shape)?.radius || "16px";
  return (
    <button key={key} onClick={() => setKey(k => k + 1)} className="w-full py-3 bg-neutral-900 text-white text-sm font-semibold" style={{ borderRadius: radius, animation: key > 0 ? getAnim(anim) : undefined }}>
      Example Button
    </button>
  );
}

function EditorTemplateMini({ id }: { id: string }) {
  const c = "aspect-[3/5] overflow-hidden relative";

  /* MINIMAL — White card on grey, wavy cover edge, round avatar */
  if (id === "minimal") return (
    <div className={`${c} bg-neutral-200 flex items-center justify-center p-1.5`}>
      <div className="w-full h-full bg-white rounded-lg flex flex-col items-center overflow-hidden relative">
        <div className="w-full h-8 bg-gradient-to-br from-neutral-100 to-neutral-200 relative">
          <svg viewBox="0 0 100 12" className="absolute -bottom-[1px] left-0 w-full" preserveAspectRatio="none"><path d="M0 12 Q25 0 50 8 Q75 16 100 4 L100 12 Z" fill="white"/></svg>
        </div>
        <div className="w-8 h-8 rounded-full bg-neutral-300 -mt-4 border-[3px] border-white z-10 shrink-0" />
        <div className="w-10 h-1 rounded-full bg-neutral-800 mt-1" />
        <div className="w-7 h-0.5 rounded-full bg-neutral-300 mt-0.5" />
        <div className="flex gap-1 mt-1.5">{[1,2,3].map(i=><div key={i} className="w-4 h-4 rounded-full bg-neutral-100"/>)}</div>
        <div className="w-full px-1.5 mt-1.5 space-y-1">
          <div className="h-5 rounded-xl bg-neutral-50 border border-neutral-200" />
          <div className="h-5 rounded-xl bg-neutral-50 border border-neutral-200" />
        </div>
        <div className="w-[calc(100%-12px)] h-4 rounded-full bg-neutral-900 mt-1.5 mb-1.5" />
      </div>
    </div>
  );

  /* GLASS — Gradient with floating blurred orbs, frosted cards */
  if (id === "glass") return (
    <div className={`${c} flex flex-col items-center justify-center px-2`} style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      {/* Floating orbs */}
      <div className="absolute top-2 right-1 w-8 h-8 rounded-full bg-pink-400/30 blur-md" />
      <div className="absolute bottom-4 left-0 w-10 h-10 rounded-full bg-blue-400/20 blur-lg" />
      <div className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full bg-white/10 blur-md" />
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/25 shadow-lg" />
        <div className="w-10 h-1 rounded-full bg-white/40 mt-1.5" />
        <div className="w-7 h-0.5 rounded-full bg-white/20 mt-0.5" />
        <div className="flex gap-1 mt-1.5">{[1,2,3].map(i=><div key={i} className="w-4 h-4 rounded-full bg-white/10 border border-white/15"/>)}</div>
        <div className="w-full space-y-1 mt-2">
          <div className="h-5 rounded-xl bg-white/[0.08] border border-white/[0.12]" />
          <div className="h-5 rounded-xl bg-white/[0.08] border border-white/[0.12]" />
        </div>
        <div className="w-full h-4 rounded-full bg-white mt-1.5" />
      </div>
    </div>
  );

  /* BOLD — Dark, hexagonal avatar frame, accent stripe, chunky cards */
  if (id === "bold") return (
    <div className={`${c} bg-neutral-950 flex flex-col items-center pt-2.5 px-2`}>
      {/* Diagonal accent stripe */}
      <div className="absolute top-0 right-0 w-12 h-full bg-indigo-500/[0.07] -skew-x-12 translate-x-3" />
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Hexagonal avatar */}
        <svg viewBox="0 0 40 44" className="w-11 h-12 shrink-0">
          <polygon points="20,2 38,12 38,32 20,42 2,32 2,12" fill="#1a1a1a" stroke="#6366f1" strokeWidth="2.5"/>
          <circle cx="20" cy="22" r="8" fill="#6366f1" opacity="0.2"/>
        </svg>
        <div className="w-12 h-1.5 rounded-full bg-white mt-1.5" />
        <div className="w-5 h-0.5 rounded-full bg-indigo-400 mt-0.5" />
        <div className="flex gap-1 mt-1.5">{[1,2,3].map(i=><div key={i} className="w-4 h-4 rounded bg-neutral-900 border border-neutral-800"/>)}</div>
        <div className="w-8 h-[2px] bg-indigo-500 mt-2 mb-1.5" />
        <div className="w-full space-y-1">
          <div className="h-5 rounded-lg bg-neutral-900 border border-neutral-800" />
          <div className="h-5 rounded-lg bg-neutral-900 border border-neutral-800" />
        </div>
        <div className="w-full h-4 rounded-full bg-indigo-500 mt-1.5" />
      </div>
    </div>
  );

  /* NEON — Black, ring avatar with animated glow, scanline overlay */
  if (id === "neon") return (
    <div className={`${c} bg-black flex flex-col items-center pt-3 px-2`}>
      {/* Scanlines */}
      <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:"repeating-linear-gradient(0deg, #22d3ee 0px, transparent 1px, transparent 3px)"}}/>
      {/* Corner accents */}
      <div className="absolute top-1 left-1 w-3 h-[1px] bg-cyan-400/40"/><div className="absolute top-1 left-1 w-[1px] h-3 bg-cyan-400/40"/>
      <div className="absolute bottom-1 right-1 w-3 h-[1px] bg-cyan-400/40"/><div className="absolute bottom-1 right-1 w-[1px] h-3 bg-cyan-400/40"/>
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Double-ring avatar */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border border-cyan-400/20 scale-[1.3]" />
          <div className="w-full h-full rounded-full border-2 border-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.5)]" />
        </div>
        <div className="w-10 h-1 rounded-full bg-white mt-1.5" />
        <div className="w-5 h-0.5 rounded-full bg-cyan-400 mt-0.5" />
        <div className="flex gap-1 mt-1.5">{[1,2,3].map(i=><div key={i} className="w-4 h-4 rounded-full border border-cyan-400/30 bg-cyan-400/10"/>)}</div>
        <div className="w-full space-y-1 mt-2">
          <div className="h-5 rounded-lg border border-cyan-400/25 bg-cyan-400/[0.06] shadow-[0_0_8px_rgba(34,211,238,0.08)]" />
          <div className="h-5 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.04]" />
        </div>
        <div className="w-full h-4 rounded-full bg-cyan-400 mt-1.5 shadow-[0_0_14px_rgba(34,211,238,0.4)]" />
      </div>
    </div>
  );

  /* COLLAGE — Tilted photo grid, film grain, frosted badge card */
  if (id === "collage") return (
    <div className={`${c}`}>
      <div className="absolute inset-[-10%] grid grid-cols-3 grid-rows-3 gap-[2px] rotate-[-6deg] scale-[1.15]">
        <div className="bg-rose-400 rounded-sm"/><div className="bg-sky-300 rounded-sm"/><div className="bg-amber-300 rounded-sm"/>
        <div className="bg-emerald-300 rounded-sm"/><div className="bg-violet-400 rounded-sm"/><div className="bg-orange-300 rounded-sm"/>
        <div className="bg-teal-300 rounded-sm"/><div className="bg-pink-300 rounded-sm"/><div className="bg-indigo-300 rounded-sm"/>
      </div>
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-2">
        <div className="w-full bg-black/40 rounded-2xl p-2.5 border border-white/10 flex flex-col items-center" style={{backdropFilter:"blur(8px)"}}>
          {/* Diamond avatar */}
          <div className="w-8 h-8 rotate-45 rounded-md bg-white/20 border border-white/25 overflow-hidden flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-white/15 -rotate-45"/>
          </div>
          <div className="w-10 h-1 rounded-full bg-white/40 mt-1.5" />
          <div className="w-6 h-0.5 rounded-full bg-white/20 mt-0.5" />
          <div className="flex gap-1 mt-1">{[1,2,3].map(i=><div key={i} className="w-3.5 h-3.5 rounded-md bg-white/10"/>)}</div>
        </div>
        <div className="w-full space-y-1 mt-1.5">
          <div className="h-4 rounded-xl bg-black/40 border border-white/10" style={{backdropFilter:"blur(4px)"}} />
          <div className="h-4 rounded-xl bg-black/40 border border-white/10" style={{backdropFilter:"blur(4px)"}} />
        </div>
        <div className="w-full h-4 rounded-full bg-white/90 mt-1.5" />
      </div>
    </div>
  );

  /* BENTO — Dark, varied box sizes, rounded avatar in pill card, staggered grid */
  if (id === "bento") return (
    <div className={`${c} bg-neutral-950 p-1.5`}>
      <div className="w-full h-full grid grid-cols-4 gap-[3px] auto-rows-fr">
        <div className="col-span-4 row-span-2 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center gap-2 px-2">
          <div className="w-7 h-7 rounded-lg bg-neutral-700 shrink-0" />
          <div><div className="w-10 h-1.5 bg-white/50 rounded-full"/><div className="w-6 h-1 bg-white/20 rounded-full mt-1"/></div>
        </div>
        <div className="col-span-2 row-span-1 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center gap-1">
          {[1,2,3].map(i=><div key={i} className="w-3.5 h-3.5 rounded bg-neutral-800"/>)}
        </div>
        <div className="col-span-2 row-span-1 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
          <div className="w-8 h-1 bg-neutral-600 rounded-full"/>
        </div>
        <div className="col-span-2 row-span-2 rounded-lg bg-gradient-to-br from-violet-900/40 to-violet-800/20 border border-violet-500/20" />
        <div className="col-span-2 row-span-2 rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-800" />
        <div className="col-span-2 row-span-1 rounded-lg bg-violet-600/15 border border-violet-500/25 flex items-center justify-center">
          <div className="w-8 h-0.5 bg-white/30 rounded-full"/>
        </div>
        <div className="col-span-2 row-span-1 rounded-lg bg-neutral-200 flex items-center justify-center">
          <div className="w-6 h-0.5 bg-neutral-700 rounded-full"/>
        </div>
      </div>
    </div>
  );

  /* SHOWCASE — Light, rounded square avatar, staggered 2-col masonry feel */
  if (id === "showcase") return (
    <div className={`${c} bg-neutral-100 flex items-center justify-center p-1.5`}>
      <div className="w-full h-full bg-white rounded-lg flex flex-col items-center overflow-hidden px-1.5 pt-2 pb-1.5">
        <div className="flex items-center gap-1.5 w-full mb-1.5">
          <div className="w-7 h-7 rounded-xl bg-neutral-200 shrink-0" />
          <div><div className="w-8 h-1 bg-neutral-800 rounded-full"/><div className="w-5 h-0.5 bg-neutral-300 rounded-full mt-0.5"/></div>
        </div>
        <div className="flex gap-1 mb-1.5">{[1,2,3].map(i=><div key={i} className="w-4 h-4 rounded-lg bg-neutral-100 border border-neutral-200"/>)}</div>
        {/* 2-col masonry */}
        <div className="w-full grid grid-cols-2 gap-[3px] mb-1.5">
          <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200">
            <div className="w-full h-full rounded-lg flex items-end p-1"><div className="w-6 h-0.5 bg-neutral-400 rounded-full"/></div>
          </div>
          <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-neutral-200 to-neutral-100">
            <div className="w-full h-full rounded-lg flex items-end p-1"><div className="w-4 h-0.5 bg-neutral-400 rounded-full"/></div>
          </div>
        </div>
        <div className="w-full grid grid-cols-2 gap-[3px] mb-1.5">
          <div className="h-5 rounded-lg bg-neutral-50 border border-neutral-200" />
          <div className="h-5 rounded-lg bg-neutral-50 border border-neutral-200" />
        </div>
        <div className="w-full h-4 rounded-full bg-neutral-900 mt-auto" />
      </div>
    </div>
  );

  /* SPLIT — Diagonal cut between image and content, overlapping avatar */
  if (id === "split") return (
    <div className={`${c}`}>
      <div className="flex w-full h-full">
        <div className="w-[42%] bg-gradient-to-b from-neutral-300 to-neutral-400 relative">
          {/* Diagonal edge */}
          <svg viewBox="0 0 10 100" className="absolute top-0 -right-[1px] h-full w-2" preserveAspectRatio="none"><polygon points="0,0 10,5 10,95 0,100" fill="white"/></svg>
        </div>
        <div className="w-[58%] bg-white flex flex-col justify-center gap-1 px-2 py-2 relative">
          {/* Avatar overlapping the split */}
          <div className="absolute -left-3 top-3 w-6 h-6 rounded-full bg-neutral-300 border-2 border-white shadow-md z-10"/>
          <div className="ml-2">
            <div className="w-10 h-1.5 bg-neutral-800 rounded-full"/>
            <div className="w-6 h-0.5 bg-neutral-300 rounded-full mt-0.5"/>
          </div>
          <div className="flex gap-0.5 mt-0.5 ml-2">{[1,2].map(i=><div key={i} className="px-1.5 py-0.5 rounded-full bg-neutral-50 border border-neutral-200"><div className="w-4 h-0.5 bg-neutral-400 rounded-full"/></div>)}</div>
          <div className="space-y-0.5 mt-1">
            <div className="h-4 rounded-lg bg-neutral-50 border border-neutral-200" />
            <div className="h-4 rounded-lg bg-neutral-50 border border-neutral-200" />
          </div>
          <div className="w-full h-3.5 rounded-full bg-neutral-900 mt-auto" />
        </div>
      </div>
    </div>
  );

  /* AURORA — Dark with colorful blurred orbs */
  if (id === "aurora") return (
    <div className={`${c}`} style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <div className="absolute top-1 left-2 w-8 h-8 rounded-full bg-purple-500/30 blur-lg" />
      <div className="absolute bottom-3 right-1 w-10 h-10 rounded-full bg-teal-400/20 blur-xl" />
      <div className="absolute top-1/2 left-0 w-6 h-6 rounded-full bg-pink-500/20 blur-lg" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-2">
        <div className="w-8 h-8 rounded-full bg-white/15 border-2 border-purple-400/30" />
        <div className="w-10 h-1 rounded-full bg-white/30 mt-1" />
        <div className="w-full space-y-1 mt-2 px-1">
          <div className="h-4 rounded-lg bg-white/[0.06] border border-purple-400/15" />
          <div className="h-4 rounded-lg bg-white/[0.06] border border-purple-400/15" />
        </div>
        <div className="w-full h-3.5 rounded-full mt-1.5 mx-1" style={{ background: "linear-gradient(135deg, #a78bfa, #818cf8)" }} />
      </div>
    </div>
  );

  /* BRUTALIST — White, thick black borders, raw */
  if (id === "brutalist") return (
    <div className={`${c} bg-white flex flex-col items-center pt-3 px-2`}>
      <div className="w-9 h-9 border-[2px] border-black bg-neutral-100" />
      <div className="w-12 h-1.5 bg-black mt-1.5" />
      <div className="w-8 h-0.5 bg-neutral-400 mt-0.5" />
      <div className="flex gap-1 mt-1.5">{[1,2,3].map(i=><div key={i} className="w-4 h-4 border-[1.5px] border-black"/>)}</div>
      <div className="w-full space-y-1 mt-2">
        <div className="h-5 border-[2px] border-black" />
        <div className="h-5 border-[2px] border-black" />
      </div>
      <div className="w-full h-4 bg-black mt-1.5" />
    </div>
  );

  /* SUNSET — Warm red-orange-yellow gradient */
  if (id === "sunset") return (
    <div className={`${c} flex flex-col items-center justify-center px-2`} style={{ background: "linear-gradient(180deg, #ff6b6b 0%, #ee5a24 40%, #f39c12 100%)" }}>
      <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30" />
      <div className="w-10 h-1 rounded-full bg-white/40 mt-1" />
      <div className="w-full space-y-1 mt-2">
        <div className="h-4 rounded-full bg-white/20 border border-white/15" />
        <div className="h-4 rounded-full bg-white/20 border border-white/15" />
      </div>
      <div className="w-full h-3.5 rounded-full bg-white mt-1.5" />
    </div>
  );

  /* TERMINAL — Green on black, monospace feel */
  if (id === "terminal") return (
    <div className={`${c} bg-[#0a0a0a] flex flex-col items-center pt-2 px-2`}>
      <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:"repeating-linear-gradient(0deg, #00ff00 0px, transparent 1px, transparent 3px)"}}/>
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="w-full h-1 bg-green-500/20 rounded-full mb-1.5" />
        <div className="w-8 h-8 rounded border border-green-500/40 bg-green-500/5" />
        <div className="w-10 h-1 rounded-full bg-green-400/40 mt-1" />
        <div className="w-full space-y-1 mt-2">
          <div className="h-4 rounded-sm border border-green-500/20 bg-green-500/5 flex items-center px-1"><div className="w-1 h-1 rounded-full bg-green-400 mr-1"/><div className="w-6 h-0.5 bg-green-400/30 rounded-full"/></div>
          <div className="h-4 rounded-sm border border-green-500/20 bg-green-500/5 flex items-center px-1"><div className="w-1 h-1 rounded-full bg-green-400 mr-1"/><div className="w-8 h-0.5 bg-green-400/30 rounded-full"/></div>
        </div>
        <div className="w-full h-3.5 bg-green-500 rounded-sm mt-1.5" />
      </div>
    </div>
  );

  /* PASTEL — Soft pink/blue/teal gradient, playful */
  if (id === "pastel") return (
    <div className={`${c} flex flex-col items-center justify-center px-2`} style={{ background: "linear-gradient(180deg, #fce4ec 0%, #e8eaf6 50%, #e0f7fa 100%)" }}>
      <div className="w-8 h-8 rounded-full bg-white/80 border-2 border-white shadow-sm" />
      <div className="w-10 h-1 rounded-full bg-neutral-700/30 mt-1" />
      <div className="w-full space-y-1 mt-2">
        <div className="h-4 rounded-2xl bg-white/70 border border-white shadow-sm" />
        <div className="h-4 rounded-2xl bg-white/70 border border-white shadow-sm" />
      </div>
      <div className="w-full h-3.5 rounded-full mt-1.5" style={{ background: "#6c5ce7" }} />
    </div>
  );

  /* MAGAZINE — Editorial, left-aligned with divider lines */
  if (id === "magazine") return (
    <div className={`${c} bg-[#fafaf8] flex flex-col pt-3 px-2`}>
      <div className="flex items-start gap-1.5 mb-1.5">
        <div className="w-7 h-7 rounded-full bg-neutral-200 shrink-0" />
        <div className="pt-0.5"><div className="w-10 h-1 bg-neutral-800 rounded-full"/><div className="w-6 h-0.5 bg-neutral-300 rounded-full mt-0.5"/></div>
      </div>
      <div className="w-full h-[1px] bg-neutral-200 my-1" />
      <div className="space-y-0">
        <div className="flex items-center justify-between py-1.5 border-b border-neutral-200"><div className="w-10 h-0.5 bg-neutral-600 rounded-full"/><div className="w-4 h-0.5 bg-neutral-400 rounded-full"/></div>
        <div className="flex items-center justify-between py-1.5 border-b border-neutral-200"><div className="w-8 h-0.5 bg-neutral-600 rounded-full"/><div className="w-4 h-0.5 bg-neutral-400 rounded-full"/></div>
        <div className="flex items-center justify-between py-1.5 border-b border-neutral-200"><div className="w-12 h-0.5 bg-neutral-600 rounded-full"/><div className="w-4 h-0.5 bg-neutral-400 rounded-full"/></div>
      </div>
      <div className="w-full h-4 rounded-full bg-neutral-900 mt-2" />
    </div>
  );

  /* RETRO — Synthwave purple/pink, grid floor */
  if (id === "retro") return (
    <div className={`${c}`} style={{ background: "linear-gradient(180deg, #1a0533 0%, #2d1b69 50%, #0f0c29 100%)" }}>
      <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-20" style={{backgroundImage:"linear-gradient(rgba(236,72,153,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.4) 1px, transparent 1px)", backgroundSize:"12px 12px", transform:"perspective(100px) rotateX(30deg)", transformOrigin:"bottom"}}/>
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-2">
        <div className="w-8 h-8 rounded-full border-2 border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]" />
        <div className="w-10 h-1 rounded-full bg-pink-400/50 mt-1" />
        <div className="w-full space-y-1 mt-2">
          <div className="h-4 rounded-lg border border-pink-500/20 bg-pink-500/5" />
          <div className="h-4 rounded-lg border border-pink-500/20 bg-pink-500/5" />
        </div>
        <div className="w-full h-3.5 rounded-full mt-1.5" style={{ background: "linear-gradient(90deg, #ec4899, #a855f7)" }} />
      </div>
    </div>
  );

  /* MIDNIGHT — Deep navy, gold accents */
  if (id === "midnight") return (
    <div className={`${c} bg-[#0a1628] flex flex-col items-center justify-center px-2`}>
      <div className="w-8 h-8 rounded-full border-2 border-amber-600/50 bg-amber-600/5" />
      <div className="w-10 h-1 rounded-full bg-amber-100/40 mt-1" />
      <div className="w-full space-y-1 mt-2">
        <div className="h-4 rounded-lg bg-white/[0.04] border border-amber-600/15" />
        <div className="h-4 rounded-lg bg-white/[0.04] border border-amber-600/15" />
      </div>
      <div className="w-full h-3.5 rounded-full mt-1.5" style={{ background: "linear-gradient(135deg, #d4a574, #b8860b)" }} />
    </div>
  );

  /* CLAY — Neumorphic, soft shadows */
  if (id === "clay") return (
    <div className={`${c} bg-[#e8e4df] flex flex-col items-center justify-center px-2`}>
      <div className="w-8 h-8 rounded-xl bg-[#e8e4df]" style={{ boxShadow: "3px 3px 6px #c5c1bc, -3px -3px 6px #fff" }} />
      <div className="w-10 h-1 rounded-full bg-neutral-500/30 mt-1.5" />
      <div className="w-full space-y-1.5 mt-2">
        <div className="h-5 rounded-xl bg-[#e8e4df]" style={{ boxShadow: "2px 2px 5px #c5c1bc, -2px -2px 5px #fff" }} />
        <div className="h-5 rounded-xl bg-[#e8e4df]" style={{ boxShadow: "2px 2px 5px #c5c1bc, -2px -2px 5px #fff" }} />
      </div>
      <div className="w-full h-4 rounded-xl bg-neutral-600 mt-1.5" style={{ boxShadow: "2px 2px 5px #c5c1bc, -2px -2px 5px #fff" }} />
    </div>
  );

  /* GRADIENT MESH — Colorful blurred blobs on black */
  if (id === "gradient-mesh") return (
    <div className={`${c} bg-black overflow-hidden`}>
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[40%] rounded-full bg-purple-600/40 blur-xl" />
      <div className="absolute top-[30%] right-[-5%] w-[40%] h-[30%] rounded-full bg-blue-500/30 blur-xl" />
      <div className="absolute bottom-[-5%] left-[20%] w-[40%] h-[30%] rounded-full bg-emerald-500/25 blur-xl" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-2">
        <div className="w-8 h-8 rounded-full bg-white/15 border border-white/20" />
        <div className="w-10 h-1 rounded-full bg-white/30 mt-1" />
        <div className="w-full space-y-1 mt-2">
          <div className="h-4 rounded-lg bg-white/[0.08] border border-white/10" />
          <div className="h-4 rounded-lg bg-white/[0.08] border border-white/10" />
        </div>
        <div className="w-full h-3.5 rounded-full bg-white/15 border border-white/20 mt-1.5" />
      </div>
    </div>
  );

  if (id === "trader") return (
    <div className={`${c} bg-[#0b0e11] flex flex-col items-center pt-2 px-2`}>
      <div className="w-full flex items-center justify-between mb-1">
        <div className="flex gap-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[#00c087]/60" /><div className="w-4 h-0.5 bg-[#00c087]/30 rounded-full mt-0.5" /></div>
        <div className="flex gap-1"><div className="w-3 h-1.5 rounded-sm bg-[#00c087]/20 text-[3px] text-[#00c087]/60 flex items-center justify-center">+</div><div className="w-3 h-1.5 rounded-sm bg-red-500/20" /></div>
      </div>
      <div className="w-8 h-8 rounded-full border border-[#00c087]/40 bg-[#00c087]/5" />
      <div className="w-10 h-1 rounded-full bg-[#00c087]/40 mt-1" />
      <div className="w-full space-y-1 mt-2">
        <div className="h-4 rounded-sm border border-[#00c087]/20 bg-[#00c087]/5 flex items-center justify-between px-1"><div className="w-6 h-0.5 bg-[#00c087]/30 rounded-full"/><div className="w-3 h-0.5 bg-[#00c087]/20 rounded-full"/></div>
        <div className="h-4 rounded-sm border border-[#00c087]/20 bg-[#00c087]/5 flex items-center justify-between px-1"><div className="w-8 h-0.5 bg-[#00c087]/30 rounded-full"/><div className="w-3 h-0.5 bg-[#00c087]/20 rounded-full"/></div>
      </div>
      <div className="w-full h-3.5 bg-[#00c087] rounded-sm mt-1.5" />
    </div>
  );

  if (id === "educator") return (
    <div className={`${c} flex flex-col items-center justify-center px-2`} style={{ background: "linear-gradient(180deg, #fffbf0 0%, #fff 50%, #fef3e2 100%)" }}>
      <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-300/50" />
      <div className="w-10 h-1 rounded-full bg-amber-900/60 mt-1" />
      <div className="w-full mt-1.5 p-1 rounded-lg bg-amber-50 border border-amber-200/50">
        <div className="w-full h-0.5 bg-amber-300/40 rounded-full mb-0.5" />
        <div className="w-8 h-0.5 bg-amber-300/30 rounded-full" />
      </div>
      <div className="w-full space-y-1 mt-1.5">
        <div className="h-4 rounded-lg bg-white border border-amber-200/40 shadow-sm flex items-center px-1"><div className="w-0.5 h-2.5 bg-amber-500 rounded-full mr-1"/><div className="w-6 h-0.5 bg-neutral-600/40 rounded-full"/></div>
        <div className="h-4 rounded-lg bg-white border border-amber-200/40 shadow-sm flex items-center px-1"><div className="w-0.5 h-2.5 bg-amber-500 rounded-full mr-1"/><div className="w-8 h-0.5 bg-neutral-600/40 rounded-full"/></div>
      </div>
      <div className="w-full h-3.5 rounded-lg mt-1.5" style={{ background: "#d97706" }} />
    </div>
  );

  if (id === "developer") return (
    <div className={`${c} bg-[#1a1b26] flex flex-col items-center pt-2 px-2`}>
      <div className="flex gap-0.5 mb-1.5 self-start">{[...Array(7)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-sm" style={{ background: i % 3 === 0 ? "#9ece6a" : i % 3 === 1 ? "#7dcfff33" : "#bb9af733", opacity: 0.3 + Math.random() * 0.5 }} />)}</div>
      <div className="w-8 h-8 rounded-lg border border-[#7dcfff]/30 bg-[#7dcfff]/5" />
      <div className="w-10 h-1 rounded-full bg-[#bb9af7]/40 mt-1" />
      <div className="w-full space-y-1 mt-2">
        <div className="h-4 rounded-sm border border-[#9ece6a]/15 bg-white/[0.03] flex items-center px-1"><span className="text-[4px] text-[#7dcfff]/40 mr-0.5">$</span><div className="w-6 h-0.5 bg-[#9ece6a]/30 rounded-full"/></div>
        <div className="h-4 rounded-sm border border-[#9ece6a]/15 bg-white/[0.03] flex items-center px-1"><span className="text-[4px] text-[#7dcfff]/40 mr-0.5">$</span><div className="w-8 h-0.5 bg-[#bb9af7]/30 rounded-full"/></div>
      </div>
      <div className="w-full h-3.5 rounded-sm mt-1.5 border border-[#7dcfff]/40" style={{ background: "#7dcfff" }} />
    </div>
  );

  if (id === "executive") return (
    <div className={`${c} bg-white flex flex-col items-center justify-center px-2`}>
      <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 shadow-sm" />
      <div className="w-12 h-1 rounded-full bg-[#0f1729] mt-1.5" />
      <div className="w-8 h-0.5 rounded-full bg-neutral-300 mt-0.5" />
      <div className="w-full h-[0.5px] bg-neutral-200 my-2" />
      <div className="w-full space-y-1">
        <div className="h-4 rounded-lg bg-white border border-neutral-200 flex items-center justify-between px-1"><div className="w-8 h-0.5 bg-neutral-600/50 rounded-full"/><div className="w-2 h-0.5 bg-neutral-300 rounded-full"/></div>
        <div className="h-4 rounded-lg bg-white border border-neutral-200 flex items-center justify-between px-1"><div className="w-6 h-0.5 bg-neutral-600/50 rounded-full"/><div className="w-2 h-0.5 bg-neutral-300 rounded-full"/></div>
      </div>
      <div className="w-full h-3.5 rounded-lg mt-1.5 bg-[#1e3a5f]" />
    </div>
  );

  return <div className={`${c} bg-neutral-100 flex items-center justify-center`}><div className="w-8 h-8 rounded-full bg-neutral-300/50" /></div>;
}
