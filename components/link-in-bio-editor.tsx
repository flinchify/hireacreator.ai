"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { PlatformIcon } from "./icons/platforms";
import { LinkManager } from "./link-manager";

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
};

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
];

const CARD_STYLES = [
  { id: "default", name: "Default" },
  { id: "outlined", name: "Outlined" },
  { id: "filled", name: "Filled" },
  { id: "shadow", name: "Shadow" },
  { id: "glass", name: "Glass" },
];

/* ── Mini Preview ── */
function MiniPreview({ settings, creator }: { settings: Settings; creator: any }) {
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
  });
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

  async function aiDesign() {
    setAiDesigning(true);
    setAiDone(false);
    try {
      const res = await fetch("/api/profile/ai-design");
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
      setAiDone(true);
      setTimeout(() => setAiDone(false), 3000);
    } catch (e) {
      console.error("AI design error:", e);
      setSaveError("AI design failed — try again");
    }
    setAiDesigning(false);
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
          // Keeping removed fields to preserve existing data
          link_bio_bg_type: user.link_bio_bg_type || "gradient",
          link_bio_bg_value: user.link_bio_bg_value || "",
          link_bio_bg_video: user.link_bio_bg_video || "",
          link_bio_bg_images: user.link_bio_bg_images || "[]",
          link_bio_font: user.link_bio_font || "jakarta",
          link_bio_text_color: user.link_bio_text_color || "",
          link_bio_card_style: user.link_bio_card_style || "default",
          link_bio_text_size: user.link_bio_text_size || "medium",
          link_bio_avatar_size: user.link_bio_avatar_size || "medium",
          link_bio_button_size: user.link_bio_button_size || "medium",
          link_bio_content_position: user.link_bio_content_position || "top",
          link_bio_content_align: user.link_bio_content_align || "center",
          // Only update the fields we still have
          link_bio_button_shape: next.buttonShape,
          link_bio_button_anim: next.buttonAnim,
          link_bio_intro_anim: next.introAnim,
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



  const sections = [
    { id: "links", name: "Links" },
    { id: "template", name: "Template" },
    { id: "buttons", name: "Buttons" },
    { id: "animation", name: "Animation" },
  ];

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
              onClick={aiDesign}
              disabled={aiDesigning}
              className="px-4 py-1.5 text-xs font-semibold text-white rounded-full transition-all flex items-center gap-1.5 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)" }}
            >
              {aiDesigning ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" /></svg>
              )}
              {aiDesigning ? "Designing..." : "AI Design My Page"}
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

            {/* ─── TEMPLATE ─── */}
            {section === "template" && (
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
              </div>
            )}



            {/* ─── ANIMATION ─── */}
            {section === "animation" && (
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
                  <div className="w-full h-full overflow-y-auto rounded-[2rem]"><MiniPreview key={`${settings.template}-${settings.buttonShape}-${settings.accent}`} settings={settings} creator={user} /></div>
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
                      <div className="w-[400px] bg-white rounded-2xl shadow-lg overflow-hidden"><MiniPreview key={`d-${settings.template}-${settings.buttonShape}-${settings.accent}`} settings={settings} creator={user} /></div>
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
                <MiniPreview key={`m-${settings.template}-${settings.buttonShape}-${settings.accent}`} settings={settings} creator={user} />
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
