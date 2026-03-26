"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Creator } from "@/lib/types";
import { PlatformIcon } from "./icons/platforms";
import { CalendarBooking } from "./calendar-booking";

/* ── Font map ── */
const FONT_MAP: Record<string, string> = {
  jakarta: "'Plus Jakarta Sans', sans-serif",
  outfit: "'Outfit', sans-serif",
  inter: "'Inter', sans-serif",
  "dm-sans": "'DM Sans', sans-serif",
  poppins: "'Poppins', sans-serif",
  "space-grotesk": "'Space Grotesk', sans-serif",
  sora: "'Sora', sans-serif",
  manrope: "'Manrope', sans-serif",
};

/* ── Size mapping constants ── */
const TEXT_SIZES: Record<string, { name: string; bio: string; link: string; headline: string }> = {
  small: { name: 'text-lg', bio: 'text-sm', link: 'text-sm', headline: 'text-sm' },
  medium: { name: 'text-2xl font-bold', bio: 'text-sm', link: 'text-base font-semibold', headline: 'text-sm' },
  large: { name: 'text-3xl sm:text-4xl font-bold', bio: 'text-base', link: 'text-base font-semibold', headline: 'text-base' },
};

const AVATAR_SIZES: Record<string, string> = {
  small: 'w-16 h-16 sm:w-20 sm:h-20',
  medium: 'w-20 h-20 sm:w-24 sm:h-24',
  large: 'w-20 h-20 sm:w-32 sm:h-32',
};

const BUTTON_SIZES: Record<string, string> = {
  small: 'py-3 px-5 text-sm min-h-[48px]',
  medium: 'py-4 px-6 text-base min-h-[56px]',
  large: 'py-5 px-6 text-lg min-h-[60px]',
};

/* ── Content position/alignment ── */
const CONTENT_JUSTIFY: Record<string, string> = {
  top: 'justify-start',
  center: 'justify-center',
  bottom: 'justify-end',
};

const CONTENT_ITEMS: Record<string, string> = {
  top: 'items-start',
  center: 'items-center',
  bottom: 'items-end',
};

const CONTENT_ALIGN: Record<string, string> = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
};

/* ── Font size CSS values ── */
const FONT_SIZE_CSS: Record<string, string> = {
  small: "0.875rem",
  medium: "1rem",
  large: "1.125rem",
  xl: "1.25rem",
};

/* ── Letter spacing CSS values ── */
const LETTER_SPACING_CSS: Record<string, string> = {
  tight: "-0.025em",
  normal: "0em",
  wide: "0.05em",
};

/* ── Container width values ── */
const CONTAINER_WIDTH_CSS: Record<string, string> = {
  compact: "380px",
  standard: "480px",
  wide: "560px",
  full: "100%",
};

/* ── Button shadow CSS ── */
const BUTTON_SHADOW_CSS: Record<string, string> = {
  none: "none",
  subtle: "0 1px 3px rgba(0,0,0,0.12)",
  medium: "0 4px 12px rgba(0,0,0,0.15)",
  lifted: "0 8px 24px rgba(0,0,0,0.2)",
};

/* ── Avatar shadow CSS ── */
const AVATAR_SHADOW_CSS: Record<string, string> = {
  none: "none",
  soft: "0 4px 12px rgba(0,0,0,0.1)",
  medium: "0 8px 24px rgba(0,0,0,0.15)",
  dramatic: "0 12px 40px rgba(0,0,0,0.25)",
};

/* ── Avatar shape CSS ── */
function avatarShapeClass(shape: string): string {
  switch (shape) {
    case "rounded": return "rounded-2xl";
    case "square": return "rounded-lg";
    case "hexagon": return "rounded-2xl"; // CSS clip-path applied via style
    default: return "rounded-full";
  }
}

function avatarShapeStyle(shape: string): React.CSSProperties {
  if (shape === "hexagon") return { clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" };
  return {};
}

/* ── Hover effect classes ── */
function hoverEffectClass(effect: string): string {
  switch (effect) {
    case "lift": return "hover:-translate-y-1 hover:shadow-lg";
    case "glow": return "hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]";
    case "scale": return "hover:scale-[1.05]";
    case "shadow": return "hover:shadow-xl";
    default: return "hover:scale-[1.02]";
  }
}

/* ── Button width classes ── */
function buttonWidthClass(width: string): string {
  switch (width) {
    case "compact": return "w-auto min-w-[200px]";
    case "full": return "w-full";
    default: return "w-full";
  }
}

/* ── Compute button inline styles from creator fields ── */
function getButtonStyles(creator: Creator, light?: boolean): React.CSSProperties {
  const styles: React.CSSProperties = {};
  if (creator.linkBioButtonFill) styles.background = creator.linkBioButtonFill;
  if (creator.linkBioButtonTextColor) styles.color = creator.linkBioButtonTextColor;
  if (creator.linkBioButtonShadow && creator.linkBioButtonShadow !== "none") {
    styles.boxShadow = BUTTON_SHADOW_CSS[creator.linkBioButtonShadow] || "none";
  }
  if (creator.linkBioButtonBorder) {
    styles.borderWidth = `${creator.linkBioButtonBorderWidth || 1}px`;
    styles.borderStyle = "solid";
    styles.borderColor = creator.linkBioButtonBorderColor || (light ? "rgba(255,255,255,0.2)" : "#e5e5e5");
  }
  return styles;
}

/* ── Button shape classes ── */
function btnClass(shape: string): string {
  switch (shape) {
    case "pill": return "rounded-full";
    case "square": return "rounded-none";
    case "soft": return "rounded-xl";
    case "blob": return "rounded-[30%]";
    default: return "rounded-2xl";
  }
}

/* ── Card style classes ── */
function cardCls(style: string, light: boolean): string {
  const base = light
    ? "border border-white/10 bg-white/[0.08]"
    : "border border-neutral-200 bg-neutral-50";
  switch (style) {
    case "outlined": return light ? "border border-white/20 bg-transparent" : "border border-neutral-300 bg-transparent";
    case "filled": return light ? "bg-white/15 border-none" : "bg-neutral-100 border-none";
    case "shadow": return light ? "bg-white/10 border-none shadow-lg shadow-black/20" : "bg-white border-none shadow-md shadow-black/5";
    case "glass": return light ? "bg-white/10 backdrop-blur-md border border-white/10" : "bg-white/80 backdrop-blur-md border border-neutral-200/60";
    default: return base;
  }
}

/* ── Background layer ── */
function BgLayer({ creator, fallback }: { creator: Creator; fallback?: React.ReactNode }) {
  const { linkBioBgType: bgType, linkBioBgValue: bgValue, linkBioBgVideo: bgVideo, linkBioBgImages: bgImages } = creator;
  const accent = creator.linkBioAccent || "#6366f1";
  const overlayType = creator.linkBioBgOverlay || "dark";
  const overlayOpacity = (creator.linkBioBgOverlayOpacity ?? 40) / 100;
  const overlayColor = overlayType === "light" ? `rgba(255,255,255,${overlayOpacity})` : `rgba(0,0,0,${overlayOpacity})`;
  const glassEnabled = creator.linkBioGlassEnabled;
  const glassIntensity = creator.linkBioGlassIntensity ?? 8;

  // Compose gradient from custom controls if no preset bg_value
  let effectiveBgValue = bgValue;
  if (bgType === "gradient" && creator.linkBioGradientColor1 && creator.linkBioGradientColor2) {
    const dir = creator.linkBioGradientDirection || "135deg";
    effectiveBgValue = `linear-gradient(${dir}, ${creator.linkBioGradientColor1} 0%, ${creator.linkBioGradientColor2} 100%)`;
  }

  const glassOverlay = glassEnabled ? (
    <div className="absolute inset-0" style={{ backdropFilter: `blur(${glassIntensity}px)`, WebkitBackdropFilter: `blur(${glassIntensity}px)` }} />
  ) : null;

  if (bgType === "video" && bgVideo) {
    return (
      <div className="fixed inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover"><source src={bgVideo} type="video/mp4" /></video>
        <div className="absolute inset-0" style={{ background: overlayColor }} />
        {glassOverlay}
      </div>
    );
  }
  if (bgType === "image" && bgValue) {
    return (
      <div className="fixed inset-0 z-0">
        <img src={bgValue} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: overlayColor }} />
        {glassOverlay}
      </div>
    );
  }
  if (bgType === "collage" && bgImages && bgImages.length > 0) {
    const tiles = Array.from({ length: 12 }, (_, i) => bgImages[i % bgImages.length]);
    return (
      <div className="fixed inset-0 z-0 grid grid-cols-3 sm:grid-cols-4 auto-rows-fr">
        {tiles.map((img, i) => <div key={i} className="relative overflow-hidden"><img src={img} alt="" className="w-full h-full object-cover scale-110" style={{ filter: "brightness(0.35) saturate(0.7)" }} /></div>)}
      </div>
    );
  }
  if (bgType === "gradient" && (effectiveBgValue || bgValue)) {
    return <div className="fixed inset-0 z-0" style={{ background: effectiveBgValue || bgValue }} />;
  }
  if (bgType === "solid" && bgValue) {
    return <div className="fixed inset-0 z-0" style={{ background: bgValue }} />;
  }
  return <>{fallback}</>;
}

/* ── Small shared components ── */
function VerifiedBadge({ light }: { light?: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill={light ? "#60a5fa" : "#3b82f6"} className="shrink-0"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
}
function ProBadge() {
  return <span className="text-[9px] font-bold bg-amber-400 text-neutral-900 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Pro</span>;
}
function OnlineDot({ light }: { light?: boolean }) {
  return <div className="flex items-center justify-center gap-1.5 mt-2"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span><span className={`text-[10px] font-medium ${light ? "text-emerald-300" : "text-emerald-600"}`}>Online now</span></div>;
}
function ShareBtn({ slug, light }: { slug: string; light?: boolean }) {
  const [copied, setCopied] = useState(false);
  return <button onClick={() => { navigator.clipboard?.writeText(`https://hireacreator.ai/u/${slug}`); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className={`px-3 py-1.5 rounded-full text-[10px] font-medium transition-all ${light ? "bg-white/10 text-white/70 hover:bg-white/20" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>{copied ? "Copied!" : "Share"}</button>;
}
function Branding({ light, hidden }: { light?: boolean; hidden?: boolean }) {
  if (hidden) return null;
  return <div className={`text-center mt-8 pb-2`}><a href="https://hireacreator.ai" className={`text-[10px] ${light ? "text-white/20" : "text-neutral-300"} hover:underline`}>hireacreator.ai</a></div>;
}
function SectionLabel({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return <div className="flex items-center gap-2.5 my-4"><div className={`h-px flex-1 ${light ? "bg-white/10" : "bg-neutral-200"}`} /><span className={`text-[10px] font-semibold uppercase tracking-widest ${light ? "text-white/30" : "text-neutral-400"}`}>{children}</span><div className={`h-px flex-1 ${light ? "bg-white/10" : "bg-neutral-200"}`} /></div>;
}

/* ── Bio Links Section ── */
function BioLinksSection({ creator, light }: { creator: Creator; light?: boolean }) {
  if (!creator.bioLinks || creator.bioLinks.length === 0) return null;

  function trackClick(linkId: string) {
    fetch("/api/links/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkId }),
    }).catch(() => {});
  }

  // Detect platform from URL for icon
  function getPlatform(url: string): string | null {
    if (!url) return null;
    const u = url.toLowerCase();
    if (u.includes("instagram.com")) return "instagram";
    if (u.includes("tiktok.com")) return "tiktok";
    if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
    if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
    if (u.includes("linkedin.com")) return "linkedin";
    if (u.includes("github.com")) return "github";
    if (u.includes("twitch.tv")) return "twitch";
    if (u.includes("spotify.com")) return "spotify";
    if (u.includes("discord.gg") || u.includes("discord.com")) return "discord";
    if (u.includes("pinterest.com")) return "pinterest";
    if (u.includes("snapchat.com")) return "snapchat";
    if (u.includes("kick.com")) return "kick";
    if (u.includes("cal.com") || u.includes("calendly.com")) return "calendar";
    return null;
  }

  const shape = btnClass(creator.linkBioButtonShape);
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const bs = BUTTON_SIZES[creator.linkBioButtonSize || "medium"] || BUTTON_SIZES.medium;
  const btnStyles = getButtonStyles(creator, light);
  const hoverCls = hoverEffectClass(creator.linkBioHoverEffect);
  const widthCls = buttonWidthClass(creator.linkBioButtonWidth);
  const hasCustomFill = !!creator.linkBioButtonFill;
  const hasCustomTextColor = !!creator.linkBioButtonTextColor;

  const visibleLinks = creator.bioLinks.filter(l => l.isVisible);
  const standalone = visibleLinks.filter(l => !l.sectionName);
  const sections = new Map<string, typeof visibleLinks>();
  visibleLinks.filter(l => l.sectionName).forEach(l => {
    const existing = sections.get(l.sectionName!) || [];
    existing.push(l);
    sections.set(l.sectionName!, existing);
  });

  // Render a single standalone link (button or rich card)
  function renderLink(link: typeof visibleLinks[0]) {
    const platform = getPlatform(link.url);

    if (link.thumbnailUrl) {
      return (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick(link.id)}
          className={`group block ${widthCls} overflow-hidden transition-all duration-200 ${hoverCls} ${shape} ${!hasCustomFill ? (light
            ? "bg-white/[0.08] backdrop-blur-md border border-white/[0.12] hover:bg-white/[0.14]"
            : "bg-white border border-neutral-200/80 hover:border-neutral-300 shadow-sm"
          ) : ""}`}
          style={btnStyles}
        >
          <div className="relative w-full aspect-[2/1] overflow-hidden">
            <img src={link.thumbnailUrl} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
          <div className={`flex items-center gap-3 ${bs}`}>
            {platform && (
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${light ? "bg-white/10" : "bg-neutral-100"}`}>
                {platform === "calendar" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={light ? "white" : "#555"} strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg>
                ) : (
                  <PlatformIcon platform={platform} size={14} className={light ? "text-white/70" : "text-neutral-500"} />
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className={`font-semibold ${ts.link} ${light ? "text-white" : "text-neutral-900"}`}>{link.title}</div>
              <div className={`text-[11px] mt-0.5 truncate ${light ? "text-white/30" : "text-neutral-400"}`}>{link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 transition-all duration-200 ${light ? "text-white/20 group-hover:text-white/50" : "text-neutral-300 group-hover:text-neutral-500"} group-hover:translate-x-0.5`}>
              <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </a>
      );
    }

    return (
      <a
        key={link.id}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick(link.id)}
        className={`group flex items-center gap-3 ${widthCls} ${bs} transition-all duration-200 ${hoverCls} ${shape} ${!hasCustomFill ? (light
          ? "bg-white/[0.08] backdrop-blur-md border border-white/[0.12] hover:bg-white/[0.14]"
          : "bg-white border border-neutral-200/80 hover:border-neutral-300 shadow-sm"
        ) : ""}`}
        style={btnStyles}
      >
        {platform ? (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${hasCustomFill ? "bg-black/10" : (light ? "bg-white/10" : "bg-neutral-100")}`}>
            {platform === "calendar" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={hasCustomTextColor ? creator.linkBioButtonTextColor : (light ? "white" : "#555")} strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg>
            ) : (
              <PlatformIcon platform={platform} size={18} className={hasCustomTextColor ? "" : (light ? "text-white/70" : "text-neutral-500")} />
            )}
          </div>
        ) : null}
        <div className="flex-1 min-w-0">
          <div className={`font-semibold ${ts.link} ${hasCustomTextColor ? "" : (light ? "text-white" : "text-neutral-900")}`}>{link.title}</div>
          <div className={`text-[11px] mt-0.5 truncate ${hasCustomTextColor ? "opacity-50" : (light ? "text-white/30" : "text-neutral-400")}`}>{link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 transition-all duration-200 ${hasCustomTextColor ? "opacity-30" : (light ? "text-white/20 group-hover:text-white/50" : "text-neutral-300 group-hover:text-neutral-500")} group-hover:translate-x-0.5`}>
          <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    );
  }

  return (
    <div className="space-y-3 my-4">
      {/* Standalone links */}
      {standalone.map(link => renderLink(link))}

      {/* Sections as horizontal sliders */}
      {Array.from(sections.entries()).map(([name, sectionLinks]) => (
        <div key={name}>
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 px-1 ${light ? "text-white/40" : "text-neutral-400"}`}>{name}</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-1 px-1">
            {sectionLinks.map(link => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick(link.id)}
                className={`snap-start shrink-0 w-[260px] rounded-xl overflow-hidden transition-all hover:shadow-lg group ${light
                  ? "bg-white/[0.08] backdrop-blur-md border border-white/[0.12] hover:bg-white/[0.14]"
                  : "bg-white border border-neutral-200/80 hover:border-neutral-300 shadow-sm"
                }`}
              >
                {link.thumbnailUrl ? (
                  <div className="relative aspect-video overflow-hidden">
                    <img src={link.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    {link.url.includes("youtube") && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`aspect-video flex items-center justify-center ${light ? "bg-white/5" : "bg-neutral-100"}`}>
                    <span className={`text-xs ${light ? "text-white/20" : "text-neutral-300"}`}>No preview</span>
                  </div>
                )}
                <div className="p-3">
                  <div className={`text-sm font-semibold truncate ${light ? "text-white" : "text-neutral-900"}`}>{link.title}</div>
                  <div className={`text-[10px] mt-0.5 truncate ${light ? "text-white/30" : "text-neutral-400"}`}>{link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Products Section ── */
function ProductsSection({ creator, light, accent }: { creator: Creator; light?: boolean; accent?: string }) {
  if (!creator.products || creator.products.length === 0) return null;
  const ac = accent || creator.linkBioAccent || "#6366f1";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  return (
    <div className="my-5">
      <SectionLabel light={light}>Products</SectionLabel>
      <div className="grid grid-cols-2 gap-2.5">
        {creator.products.map(p => (
          <a key={p.id} href={p.productUrl || "#"} target="_blank" rel="noopener noreferrer"
            className={`group rounded-2xl overflow-hidden hover:scale-[1.02] transition-all ${light ? "bg-white/[0.06] border border-white/[0.08]" : "bg-white border border-neutral-200/80 shadow-sm"}`}>
            {p.thumbnailUrl && <img src={p.thumbnailUrl} alt="" className="w-full aspect-[4/3] object-cover" />}
            <div className="p-3">
              <div className={`${ts.link} font-semibold truncate ${light ? "text-white" : "text-neutral-900"}`}>{p.title}</div>
              <div className="text-xs mt-1 font-medium" style={{ color: ac }}>
                {p.priceCents === 0 ? "Free" : `$${(p.priceCents / 100).toFixed(2)} ${p.currency}`}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ── Niche Rank Badge ── */
function NicheRankBadge({ creator, light }: { creator: Creator; light?: boolean }) {
  if (!creator.nicheRank || creator.nicheRank > 3 || !creator.category) return null;
  const colors = { 1: "from-amber-400 to-yellow-500", 2: "from-neutral-300 to-neutral-400", 3: "from-amber-600 to-orange-700" };
  const color = colors[creator.nicheRank as 1 | 2 | 3];
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r ${color} text-white shadow-sm`}>
      #{creator.nicheRank} in {creator.category}
    </div>
  );
}

function priceLabel(price: number, days?: number): string {
  if (price === 0) return "Open to offers";
  const p = `$${price}`;
  return days ? `${p} / ${days} day${days !== 1 ? "s" : ""}` : p;
}

function EmptyState({ light }: { light?: boolean }) {
  return (
    <div className="mt-6 space-y-3">
      <div className={`border border-dashed rounded-2xl px-5 py-5 ${light ? "border-white/10 bg-white/[0.03]" : "border-neutral-300 bg-neutral-50"}`}>
        <div className={`text-sm ${light ? "text-white/25" : "text-neutral-400"}`}>Your services appear here</div>
        <div className={`text-[11px] mt-1 ${light ? "text-white/15" : "text-neutral-300"}`}>Add them in your dashboard</div>
      </div>
      <a href="/dashboard" className={`block w-full mt-4 font-semibold text-sm text-center rounded-full py-3.5 transition-all shadow-lg ${light ? "bg-white text-neutral-900 hover:bg-neutral-100" : "bg-neutral-900 text-white hover:opacity-90"}`}>Set Up Your Profile</a>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   LogoHeader component — shows logo/header image when available
   ══════════════════════════════════════════════════════ */
function LogoHeader({ creator, light, accentBorder }: {
  creator: Creator; light?: boolean; accentBorder?: string;
}) {
  return (
    <>
      {creator.headerImageUrl && (
        <div className="w-full mb-4 rounded-2xl overflow-hidden">
          <img src={creator.headerImageUrl} alt="" className="w-full h-auto object-cover max-h-[200px]" />
        </div>
      )}
      {creator.logoUrl ? (
        <img src={creator.logoUrl} alt="" className="h-[120px] w-auto max-w-[200px] object-contain" style={accentBorder ? { border: `3px solid ${accentBorder}`, borderRadius: '16px', padding: '4px' } : {}} />
      ) : (
        <Avatar creator={creator} light={light} accentBorder={accentBorder} />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════
   Avatar component — shared across templates
   ══════════════════════════════════════════════════════ */
function Avatar({ creator, size = "md", shape: propShape, light, accentBorder }: {
  creator: Creator; size?: "sm" | "md" | "lg"; shape?: "circle" | "square"; light?: boolean; accentBorder?: string;
}) {
  const avatarSz = creator.linkBioAvatarSize || "medium";
  const sizeMap = { sm: "small", md: "medium", lg: "large" } as const;
  // Support numeric avatar size from advanced editor
  const numericSize = typeof avatarSz === "number" || (typeof avatarSz === "string" && /^\d+$/.test(avatarSz)) ? Number(avatarSz) : 0;
  const sizeClass = numericSize > 0 ? "" : (AVATAR_SIZES[sizeMap[size] === "medium" ? avatarSz : sizeMap[size]] || AVATAR_SIZES.medium);
  const sizeStyle: React.CSSProperties = numericSize > 0 ? { width: numericSize, height: numericSize } : {};

  // Use creator's avatar shape setting, fall back to prop, fall back to circle
  const effectiveShape = creator.linkBioAvatarShape || (propShape === "square" ? "square" : "circle");
  const r = avatarShapeClass(effectiveShape);
  const shapeStyle = avatarShapeStyle(effectiveShape);

  // Border from creator settings or accent border
  const borderStyle: React.CSSProperties = {};
  if (creator.linkBioAvatarBorderWidth > 0) {
    borderStyle.border = `${creator.linkBioAvatarBorderWidth}px solid ${creator.linkBioAvatarBorderColor || (light ? "rgba(255,255,255,0.3)" : "#e5e5e5")}`;
  } else if (accentBorder) {
    borderStyle.border = `3px solid ${accentBorder}`;
  }

  // Shadow
  const shadow = AVATAR_SHADOW_CSS[creator.linkBioAvatarShadow] || AVATAR_SHADOW_CSS.none;
  const shadowStyle: React.CSSProperties = shadow !== "none" ? { boxShadow: shadow } : {};

  const combinedStyle = { ...sizeStyle, ...borderStyle, ...shadowStyle, ...shapeStyle };

  if (creator.avatar) return <img src={creator.avatar} alt="" className={`${sizeClass} ${r} object-cover shadow-lg`} style={combinedStyle} />;
  return <div className={`${sizeClass} ${r} flex items-center justify-center shadow-lg ${light ? "bg-white/10" : "bg-neutral-100"}`} style={combinedStyle}><span className={`text-3xl font-bold ${light ? "text-white/60" : "text-neutral-400"}`}>{(creator.name || "?")[0]}</span></div>;
}

/* ══════════════════════════════════════════════════════
   Socials row — shared
   ══════════════════════════════════════════════════════ */
function isFollowerVerified(s: { followers: string; followersRefreshedAt?: string | null }) {
  if (!s.followers || s.followers === "0" || !s.followersRefreshedAt) return false;
  const refreshed = new Date(s.followersRefreshedAt).getTime();
  return Date.now() - refreshed < 7 * 24 * 60 * 60 * 1000;
}

function VerifiedCheck({ light }: { light?: boolean }) {
  return (
    <svg className={`w-3 h-3 ${light ? "text-green-300" : "text-green-500"}`} viewBox="0 0 20 20" fill="currentColor" aria-label="Verified follower count">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  );
}

function Socials({ creator, light, shape = "circle", showFollowers = false }: { creator: Creator; light?: boolean; shape?: "circle" | "square"; showFollowers?: boolean }) {
  if (creator.socials.length === 0) return null;
  const r = shape === "square" ? "rounded-xl" : "rounded-full";
  return (
    <div className="flex items-center justify-center gap-2.5 my-5 flex-wrap">
      {creator.socials.map(s => (
        showFollowers && s.followers && s.followers !== "0" ? (
          <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${s.platform}`}
            className={`flex items-center gap-2 px-3 py-2 ${r} hover:scale-105 transition-all ${light ? "bg-white/10 hover:bg-white/15" : "bg-neutral-100 hover:bg-neutral-200"}`}>
            <PlatformIcon platform={s.platform} size={16} className={light ? "text-white/80" : "text-neutral-600"} />
            <span className={`text-[11px] font-semibold ${light ? "text-white/70" : "text-neutral-600"}`}>{s.followers}</span>
            {isFollowerVerified(s) && <VerifiedCheck light={light} />}
          </a>
        ) : (
          <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${s.platform}`}
            className={`w-12 h-12 ${r} flex items-center justify-center hover:scale-110 transition-all ${light ? "bg-white/10 hover:bg-white/20" : "bg-neutral-100 hover:bg-neutral-200"}`} title={s.followers && s.followers !== "0" ? `${s.followers} followers${isFollowerVerified(s) ? " (verified)" : ""}` : s.handle}>
            <PlatformIcon platform={s.platform} size={18} className={light ? "text-white/80" : "text-neutral-600"} />
          </a>
        )
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Service card — shared
   ══════════════════════════════════════════════════════ */
function ServiceCard({ service, creator, light, accent }: { service: any; creator: Creator; light?: boolean; accent?: string }) {
  const btn = btnClass(creator.linkBioButtonShape);
  const bs = BUTTON_SIZES[creator.linkBioButtonSize || "medium"] || BUTTON_SIZES.medium;
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const ac = accent || creator.linkBioAccent || "#6366f1";

  if (service.thumbnailUrl) {
    return (
      <a href={`/creators/${creator.slug}`} className={`group block w-full ${btn} overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${light
        ? "bg-white/[0.06] backdrop-blur-md border border-white/[0.10] hover:bg-white/[0.12]"
        : "bg-white border border-neutral-200/80 shadow-sm hover:border-neutral-300"
      }`}>
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          <img src={service.thumbnailUrl} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
        <div className="p-4">
          <div className={`font-semibold ${ts.link} ${light ? "text-white" : "text-neutral-900"}`}>{service.title}</div>
          {service.description && <div className={`text-[11px] mt-0.5 line-clamp-2 ${light ? "text-white/30" : "text-neutral-400"}`}>{service.description}</div>}
          <div className="text-sm font-bold mt-2" style={{ color: ac }}>{priceLabel(service.price, service.deliveryDays)}</div>
        </div>
      </a>
    );
  }

  return (
    <a href={`/creators/${creator.slug}`} className={`group block w-full ${btn} ${bs} transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${light
      ? "bg-white/[0.06] backdrop-blur-md border border-white/[0.10] hover:bg-white/[0.12]"
      : "bg-white border border-neutral-200/80 shadow-sm hover:border-neutral-300"
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <div className={`font-semibold ${ts.link} ${light ? "text-white" : "text-neutral-900"}`}>{service.title}</div>
          {service.description && <div className={`text-[11px] mt-0.5 line-clamp-1 ${light ? "text-white/30" : "text-neutral-400"}`}>{service.description}</div>}
        </div>
        <div className={`text-sm font-bold shrink-0 ml-3 ${light ? "text-white" : "text-neutral-900"}`}>{priceLabel(service.price, service.deliveryDays)}</div>
      </div>
    </a>
  );
}

/* ══════════════════════════════════════════════════════
   Services section — grid for thumbnail services, list for plain
   ══════════════════════════════════════════════════════ */
function ServicesSection({ creator, light, accent }: { creator: Creator; light?: boolean; accent?: string }) {
  if (creator.services.length === 0) return null;
  const hasThumb = creator.services.some(s => s.thumbnailUrl);
  return (
    <>
      <SectionLabel light={light}>Services</SectionLabel>
      {hasThumb ? (
        <div className="grid grid-cols-2 gap-2.5">
          {creator.services.map(s => <ServiceCard key={s.id} service={s} creator={creator} light={light} accent={accent} />)}
        </div>
      ) : (
        <div className="space-y-2.5">
          {creator.services.map(s => <ServiceCard key={s.id} service={s} creator={creator} light={light} accent={accent} />)}
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════
   CTA button — shared
   ══════════════════════════════════════════════════════ */
function CTAButton({ creator, light, accent, isUnclaimed }: { creator: Creator; light?: boolean; accent?: string; isUnclaimed?: boolean }) {
  const ac = creator.linkBioButtonFill || accent || creator.linkBioAccent || "#171717";
  const textColor = creator.linkBioButtonTextColor || "#ffffff";
  const bs = BUTTON_SIZES[creator.linkBioButtonSize || "medium"] || BUTTON_SIZES.medium;
  const btn = btnClass(creator.linkBioButtonShape);
  const shadow = BUTTON_SHADOW_CSS[creator.linkBioButtonShadow] || "0 10px 15px -3px rgba(0,0,0,0.1)";
  const ctaHref = isUnclaimed ? `/u/${creator.slug}/claim` : `/creators/${creator.slug}`;
  const ctaText = isUnclaimed ? "Claim & Customize" : "View Full Profile";
  return (
    <a href={ctaHref}
      className={`block w-full mt-4 font-semibold text-center ${btn} ${bs} transition-all duration-200 hover:scale-[1.02] hover:shadow-xl`}
      style={{ background: ac, color: textColor, boxShadow: shadow }}>
      {ctaText}
    </a>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: MINIMAL — "The Business Card"
   Warm ivory/cream bg, white card, elegant spacing, professional
   ══════════════════════════════════════════════════════════════ */
function TemplateMinimal({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasCustomBg = !!creator.linkBioBgType;
  const accent = creator.linkBioAccent || "#171717";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const items = CONTENT_ITEMS[creator.linkBioContentPosition || 'top'] || CONTENT_ITEMS.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;
  const defaultBg = "linear-gradient(160deg, #fdf8f4 0%, #f5ede6 40%, #ebe3da 100%)";

  return (
    <div className={`min-h-screen flex ${items} justify-center lg:py-10 lg:px-4`} style={{ background: hasCustomBg ? "transparent" : defaultBg }}>
      {hasCustomBg && <BgLayer creator={creator} fallback={<div className="fixed inset-0 z-0" style={{ background: defaultBg }} />} />}
      <div className={`w-full lg:rounded-[2.5rem] lg:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] bg-white min-h-screen lg:min-h-0 relative z-10 overflow-hidden ${hasCustomBg ? "lg:bg-white/95 lg:backdrop-blur-sm" : ""}`} style={{ maxWidth: `var(--bio-container-width, 460px)` }}>
        {/* Header banner */}
        {creator.headerImageUrl && (
          <div className="w-full overflow-hidden lg:rounded-t-[2.5rem]">
            <img src={creator.headerImageUrl} alt="" className="w-full h-auto max-h-[180px] object-cover" />
          </div>
        )}
        {/* Cover */}
        <div className="relative">
          {creator.cover ? (
            <div className="h-52 lg:h-48 lg:rounded-t-[2.5rem] overflow-hidden">
              <img src={creator.cover} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-white" />
            </div>
          ) : (
            <div className="h-44 sm:h-48 lg:rounded-t-[2.5rem] relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}08 0%, ${accent}04 100%)` }}>
              <div className="absolute inset-0 bg-gradient-to-br from-stone-50/80 via-amber-50/40 to-orange-50/30" />
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
            </div>
          )}
          <div className="absolute top-3 right-4 z-10"><ShareBtn slug={creator.slug} /></div>
          {!creator.logoUrl && (
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
              <div className="p-1.5 bg-white rounded-full shadow-xl shadow-black/10">
                <Avatar creator={creator} size="lg" />
              </div>
            </div>
          )}
        </div>

        <div className={`pb-10 ${creator.logoUrl ? 'pt-6' : 'pt-[4.5rem]'} ${align}`} style={{ padding: `var(--bio-page-padding, 24px)`, paddingTop: creator.logoUrl ? '24px' : '4.5rem', gap: `var(--bio-section-gap, 16px)`, display: 'flex', flexDirection: 'column' }}>
          {creator.logoUrl && (
            <div className="flex justify-center mb-4">
              <img src={creator.logoUrl} alt="" className="h-[80px] w-auto max-w-[180px] object-contain" />
            </div>
          )}
          <div className="flex items-center justify-center gap-1.5">
            <h1 className={`font-display ${ts.name} font-bold text-neutral-900 tracking-tight`}>{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}
          </div>
          <p className="text-xs text-neutral-400 mt-0.5 font-medium">@{creator.slug?.split("-")[0]}</p>
          <NicheRankBadge creator={creator} />
          {creator.headline && <p className={`mt-3 ${ts.headline} text-neutral-500 max-w-[300px] mx-auto leading-relaxed`}>{creator.headline}</p>}
          {creator.location && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-100 rounded-full">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-neutral-400"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
              <span className="text-xs text-neutral-500 font-medium">{creator.location}</span>
            </div>
          )}
          {creator.isOnline && <OnlineDot />}

          <Socials creator={creator} />
          {creator.bio && <p className={`${ts.bio} text-neutral-500 mb-4 leading-relaxed`}>{creator.bio}</p>}
          <BioLinksSection creator={creator} />
          <ProductsSection creator={creator} />
          <ServicesSection creator={creator} />

          {creator.portfolio.length > 0 && (
            <>
              <SectionLabel>Portfolio</SectionLabel>
              <div className="grid grid-cols-3 gap-2.5">
                {creator.portfolio.slice(0, 6).map(p => (
                  <div key={p.id} className="aspect-square rounded-2xl overflow-hidden bg-neutral-50 ring-1 ring-neutral-100 hover:scale-105 transition-transform duration-200 cursor-pointer">
                    {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">{p.title}</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
          {isEmpty && <EmptyState />}
          {!isEmpty && <CTAButton creator={creator} accent={accent} isUnclaimed={isUnclaimed} />}
          <Branding hidden={creator.hideBranding} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: GLASS — "The Creator"
   Deep space gradient, floating orbs, frosted glass panels, premium app feel
   ══════════════════════════════════════════════════════════════ */
function TemplateGlass({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasCustomBg = !!creator.linkBioBgType;
  const accent = creator.linkBioAccent || "#818cf8";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {hasCustomBg ? (
        <BgLayer creator={creator} fallback={<div className="fixed inset-0 bg-gradient-to-br from-[#0c0118] via-[#150d30] to-[#0a0a1a]" />} />
      ) : (
        <div className="fixed inset-0 bg-gradient-to-br from-[#0c0118] via-[#150d30] to-[#0a0a1a]" />
      )}
      {/* TWO floating glow orbs */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-5%] w-[55%] h-[55%] rounded-full opacity-25" style={{ background: `radial-gradient(circle, ${accent}50 0%, transparent 70%)` }} />
        <div className="absolute bottom-[-10%] right-[-8%] w-[45%] h-[45%] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #e879f950 0%, transparent 70%)" }} />
      </div>

      <div className="absolute top-4 right-4 z-20"><ShareBtn slug={creator.slug} light /></div>

      <div className={`relative z-10 w-full mx-auto pt-12 pb-10 min-h-screen flex flex-col ${justify}`} style={{ maxWidth: `var(--bio-container-width, 480px)`, padding: `var(--bio-page-padding, 20px)`, paddingTop: '3rem' }}>
        {/* Header banner */}
        {creator.headerImageUrl && (
          <div className="w-full mb-4 rounded-2xl overflow-hidden">
            <img src={creator.headerImageUrl} alt="" className="w-full h-auto max-h-[180px] object-cover" />
          </div>
        )}
        {/* Main glass identity card */}
        <div className={`${align} mb-6 bg-white/[0.06] backdrop-blur-2xl rounded-[2rem] p-8 sm:p-10 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]`}>
          {/* Logo or Avatar with accent glow ring */}
          {creator.logoUrl ? (
            <div className="mb-5">
              <img src={creator.logoUrl} alt="" className="h-[100px] w-auto max-w-[180px] object-contain mx-auto" />
            </div>
          ) : (
            <div className="relative inline-block mb-5">
              <div className="absolute -inset-4 rounded-full opacity-30 blur-2xl" style={{ background: accent }} />
              {creator.avatar ? (
                <img src={creator.avatar} alt="" className={`relative ${avatarSz} rounded-full object-cover ring-[3px] ring-white/15 shadow-2xl`} />
              ) : (
                <div className={`relative ${avatarSz} rounded-full bg-white/[0.08] backdrop-blur-xl flex items-center justify-center ring-[3px] ring-white/15 shadow-2xl`}>
                  <span className="text-4xl font-bold text-white/50">{(creator.name || "?")[0]}</span>
                </div>
              )}
              {creator.isOnline && <span className="absolute bottom-1 right-1 flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-4 w-4 bg-emerald-500 ring-2 ring-[#150d30]" /></span>}
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5">
            <h1 className={`font-display ${ts.name} font-bold text-white tracking-tight`}>{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
          </div>
          <p className="text-xs text-white/30 mt-1 font-medium">@{creator.slug?.split("-")[0]}</p>
          <NicheRankBadge creator={creator} light />
          {creator.headline && <p className={`mt-3 ${ts.headline} text-white/45 max-w-[320px] mx-auto leading-relaxed`}>{creator.headline}</p>}
          {creator.location && <p className="mt-2 text-xs text-white/25 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}

          {/* Stats bar — frosted glass pills */}
          {(creator.totalProjects > 0 || creator.rating > 0 || creator.reviewCount > 0) && (
            <div className="mt-5 flex items-center justify-center gap-3">
              {creator.totalProjects > 0 && <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl px-4 py-2.5 border border-white/[0.05]"><div className="text-sm font-bold text-white">{creator.totalProjects}</div><div className="text-[9px] text-white/25 uppercase tracking-wider">Projects</div></div>}
              {creator.rating > 0 && <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl px-4 py-2.5 border border-white/[0.05]"><div className="text-sm font-bold text-white">{creator.rating.toFixed(1)}</div><div className="text-[9px] text-white/25 uppercase tracking-wider">Rating</div></div>}
              {creator.reviewCount > 0 && <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl px-4 py-2.5 border border-white/[0.05]"><div className="text-sm font-bold text-white">{creator.reviewCount}</div><div className="text-[9px] text-white/25 uppercase tracking-wider">Reviews</div></div>}
            </div>
          )}

          <Socials creator={creator} light />
        </div>

        {/* Bio in frosted panel */}
        {creator.bio && (
          <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/[0.08] px-6 py-4 mb-5">
            <p className={`${ts.bio} text-white/40 text-center leading-relaxed`}>{creator.bio}</p>
          </div>
        )}
        <BioLinksSection creator={creator} light />
        <ProductsSection creator={creator} light accent={accent} />

        <div className="space-y-3">
          <ServicesSection creator={creator} light accent={accent} />

          {creator.portfolio.length > 0 && (
            <>
              <SectionLabel light>Portfolio</SectionLabel>
              <div className="grid grid-cols-3 gap-2.5">
                {creator.portfolio.slice(0, 6).map(p => (
                  <div key={p.id} className="aspect-square rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.06] hover:scale-[1.04] transition-transform duration-200 cursor-pointer">
                    {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/15 text-xs">{p.title}</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
          {isEmpty && <EmptyState light />}
          {!isEmpty && <CTAButton creator={creator} light accent={accent} isUnclaimed={isUnclaimed} />}
        </div>
        <Branding light hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: BOLD — "The Statement"
   Pure black, accent color highlights, high contrast, dramatic
   ══════════════════════════════════════════════════════════════ */
function TemplateBold({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const accent = creator.linkBioAccent || "#6366f1";
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasCustomBg = !!creator.linkBioBgType;
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const items = CONTENT_ITEMS[creator.linkBioContentPosition || 'top'] || CONTENT_ITEMS.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className={`min-h-screen flex ${items} justify-center lg:py-10 lg:px-4`} style={{ background: hasCustomBg ? "transparent" : "#0a0a0a" }}>
      {hasCustomBg && <BgLayer creator={creator} fallback={<div className="fixed inset-0 z-0" style={{ background: "#0a0a0a" }} />} />}
      <div className="w-full lg:max-w-[460px] lg:rounded-[2.5rem] bg-neutral-950 min-h-screen lg:min-h-0 relative z-10 overflow-hidden" style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 25px 60px -12px ${accent}20` }}>
        {/* Accent stripe at top */}
        <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

        {/* Header banner */}
        {creator.headerImageUrl && (
          <div className="w-full overflow-hidden">
            <img src={creator.headerImageUrl} alt="" className="w-full h-auto max-h-[160px] object-cover" />
          </div>
        )}

        <div className="absolute top-5 right-5 z-10"><ShareBtn slug={creator.slug} light /></div>

        <div className={`px-6 sm:px-8 pb-10 pt-10 ${align}`}>
          {/* Logo or Square avatar with accent border and glow */}
          {creator.logoUrl ? (
            <div className="mb-2">
              <img src={creator.logoUrl} alt="" className="h-[90px] w-auto max-w-[180px] object-contain mx-auto" />
            </div>
          ) : (
            <div className="relative inline-block">
              <div className="absolute -inset-3 rounded-2xl opacity-20 blur-xl" style={{ background: accent }} />
              <Avatar creator={creator} size="md" shape="square" light accentBorder={accent} />
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-2">
            <h1 className={`font-display ${ts.name} font-black text-white tracking-tight`}>{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
          </div>
          <p className="text-xs mt-1 font-semibold tracking-wide" style={{ color: accent }}>@{creator.slug?.split("-")[0]}</p>
          <NicheRankBadge creator={creator} light />
          {creator.headline && <p className={`mt-3 ${ts.headline} text-neutral-400 max-w-[320px] mx-auto font-medium leading-relaxed`}>{creator.headline}</p>}
          {creator.location && <p className="mt-2 text-xs text-neutral-600 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
          {creator.isOnline && <OnlineDot light />}

          <Socials creator={creator} light shape="square" />
          {creator.bio && <p className={`${ts.bio} text-neutral-500 mb-5 leading-relaxed`}>{creator.bio}</p>}
          <BioLinksSection creator={creator} light />
          <ProductsSection creator={creator} light accent={accent} />

          {/* Accent-colored divider */}
          {creator.services.length > 0 && (
            <>
              <div className="flex items-center gap-3 my-7">
                <div className="h-[2px] flex-1 rounded-full" style={{ background: `${accent}25` }} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">Services</span>
                <div className="h-[2px] flex-1 rounded-full" style={{ background: `${accent}25` }} />
              </div>
              <div className="space-y-2.5">
                {creator.services.map(s => (
                  <a key={s.id} href={`/creators/${creator.slug}`} className={`group block w-full bg-white/[0.03] border border-white/[0.06] ${btnClass(creator.linkBioButtonShape)} px-6 py-4 min-h-[56px] text-base sm:py-5 text-left hover:bg-white/[0.06] hover:border-white/[0.10] hover:scale-[1.02] transition-all duration-200`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white text-[15px]">{s.title}</span>
                        {s.description && <div className="text-[11px] text-neutral-600 mt-0.5 line-clamp-1">{s.description}</div>}
                      </div>
                      <span className="text-sm font-black px-3 py-1 rounded-lg shrink-0 ml-3" style={{ color: accent, background: `${accent}12` }}>{priceLabel(s.price, s.deliveryDays)}</span>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}

          {creator.portfolio.length > 0 && (
            <>
              <div className="flex items-center gap-3 my-7">
                <div className="h-[2px] flex-1 rounded-full" style={{ background: `${accent}25` }} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">Work</span>
                <div className="h-[2px] flex-1 rounded-full" style={{ background: `${accent}25` }} />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {creator.portfolio.slice(0, 4).map(p => (
                  <div key={p.id} className="aspect-square rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:scale-[1.03] transition-transform duration-200 cursor-pointer">
                    {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs">{p.title}</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
          {isEmpty && <EmptyState light />}
          {!isEmpty && <CTAButton creator={creator} light accent={accent} isUnclaimed={isUnclaimed} />}
          <Branding light hidden={creator.hideBranding} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: SHOWCASE — "The Portfolio"
   Light bg, portfolio-first, prominent cover, visual-first layout
   ══════════════════════════════════════════════════════════════ */
function TemplateShowcase({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasCustomBg = !!creator.linkBioBgType;
  const accent = creator.linkBioAccent || "#171717";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const items = CONTENT_ITEMS[creator.linkBioContentPosition || 'top'] || CONTENT_ITEMS.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className={`min-h-screen flex ${items} justify-center lg:py-10 lg:px-4`} style={{ background: hasCustomBg ? "transparent" : "linear-gradient(160deg, #f8f9fa 0%, #e9ecef 100%)" }}>
      {hasCustomBg && <BgLayer creator={creator} fallback={<div className="fixed inset-0 z-0" style={{ background: "linear-gradient(160deg, #f8f9fa 0%, #e9ecef 100%)" }} />} />}
      <div className="w-full lg:max-w-[480px] lg:rounded-[2rem] lg:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] bg-white min-h-screen lg:min-h-0 relative z-10 overflow-hidden">
        {/* Header banner */}
        {creator.headerImageUrl && (
          <div className="w-full overflow-hidden sm:rounded-t-[2rem]">
            <img src={creator.headerImageUrl} alt="" className="w-full h-auto max-h-[180px] object-cover" />
          </div>
        )}
        {/* Prominent cover */}
        <div className="relative">
          {creator.cover ? (
            <div className="h-52 overflow-hidden sm:rounded-t-[2rem]">
              <img src={creator.cover} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white" />
            </div>
          ) : (
            <div className="h-36 sm:h-44 bg-gradient-to-br from-amber-50 via-rose-50/30 to-violet-50/20 sm:rounded-t-[2rem]" />
          )}
          <div className="absolute top-3 right-4 z-10"><ShareBtn slug={creator.slug} /></div>
        </div>

        <div className={`px-6 sm:px-8 pb-10 -mt-10 relative ${align}`}>
          {/* Profile row — left-aligned editorial */}
          <div className="flex items-end gap-4 mb-5">
            <div className="shrink-0 p-1 bg-white rounded-2xl shadow-lg">
              {creator.logoUrl ? (
                <img src={creator.logoUrl} alt="" className="h-[60px] w-auto max-w-[140px] object-contain" />
              ) : (
                <Avatar creator={creator} shape="square" />
              )}
            </div>
            <div className="pb-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className={`font-display ${ts.name} font-bold text-neutral-900 tracking-tight`}>{creator.name || "Your Name"}</h1>
                {creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}
              </div>
              <p className="text-xs text-neutral-400 font-medium">@{creator.slug?.split("-")[0]}</p>
              <NicheRankBadge creator={creator} />
              {creator.location && <p className="mt-0.5 text-xs text-neutral-400 flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
            </div>
          </div>

          {creator.isOnline && <OnlineDot />}
          {creator.headline && <p className={`${ts.headline} text-neutral-500 leading-relaxed mb-4`}>{creator.headline}</p>}

          <Socials creator={creator} shape="square" />
          {creator.bio && <p className={`${ts.bio} text-neutral-500 mb-5 leading-relaxed`}>{creator.bio}</p>}
          <BioLinksSection creator={creator} />
          <ProductsSection creator={creator} />

          {/* Portfolio THE focus — 2-col grid, aspect-[4/3], hover zoom */}
          {creator.portfolio.length > 0 && (
            <div className="mb-6">
              <SectionLabel>Portfolio</SectionLabel>
              <div className="grid grid-cols-2 gap-2.5">
                {creator.portfolio.slice(0, 6).map((p, i) => (
                  <div key={p.id} className={`${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]"} rounded-2xl overflow-hidden bg-neutral-50 ring-1 ring-neutral-100 group cursor-pointer`}>
                    {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">{p.title}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services as horizontal cards with price on right */}
          {creator.services.length > 0 && (
            <div className="mb-5">
              <SectionLabel>Services</SectionLabel>
              <div className="space-y-2.5">
                {creator.services.map(s => (
                  <a key={s.id} href={`/creators/${creator.slug}`} className={`group block w-full ${btnClass(creator.linkBioButtonShape)} bg-white border border-neutral-200/80 shadow-sm px-6 py-4 min-h-[56px] text-base sm:py-5 hover:border-neutral-300 hover:shadow-md hover:scale-[1.02] transition-all duration-200`}>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-neutral-900">{s.title}</div>
                        {s.description && <div className="text-[11px] mt-0.5 text-neutral-400 line-clamp-1">{s.description}</div>}
                      </div>
                      <div className="text-sm font-bold text-neutral-900 shrink-0 ml-3">{priceLabel(s.price, s.deliveryDays)}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
          {isEmpty && <EmptyState />}
          {!isEmpty && <CTAButton creator={creator} accent={accent} isUnclaimed={isUnclaimed} />}
          <Branding hidden={creator.hideBranding} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: NEON — "The Gamer"
   Pure black, accent glow, double ring avatar, cyberpunk aesthetic
   ══════════════════════════════════════════════════════════════ */
function TemplateNeon({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const accent = creator.linkBioAccent || "#22d3ee";
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasCustomBg = !!creator.linkBioBgType;
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const items = CONTENT_ITEMS[creator.linkBioContentPosition || 'top'] || CONTENT_ITEMS.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className={`min-h-screen flex ${items} justify-center lg:py-10 lg:px-4`} style={{ background: hasCustomBg ? "transparent" : "#000000" }}>
      {hasCustomBg && <BgLayer creator={creator} fallback={<div className="fixed inset-0 z-0" style={{ background: "#000000" }} />} />}

      <div className="w-full lg:max-w-[460px] lg:rounded-[2rem] bg-[#0a0a0a] min-h-screen lg:min-h-0 relative z-10 overflow-hidden" style={{ boxShadow: `0 0 80px -20px ${accent}50, inset 0 1px 0 rgba(255,255,255,0.05)` }}>
        {/* Neon scanline at top */}
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 10%, ${accent} 50%, transparent 90%)`, opacity: 0.7 }} />
        {/* Subtle scanline texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)" }} />
        {/* Corner glow accents */}
        <div className="absolute top-0 left-0 w-40 h-40 opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle at 0 0, ${accent} 0%, transparent 70%)` }} />
        <div className="absolute bottom-0 right-0 w-40 h-40 opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle at 100% 100%, ${accent} 0%, transparent 70%)` }} />

        <div className="absolute top-3 right-4 z-10"><ShareBtn slug={creator.slug} light /></div>

        <div className={`px-6 sm:px-8 pb-10 pt-10 ${align} relative`}>
          {/* Avatar with double neon ring: outer accent, inner dark */}
          <div className="relative inline-block">
            <div className="absolute -inset-5 rounded-full opacity-25 blur-2xl" style={{ background: accent }} />
            <div className="relative p-[3px] rounded-full" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}60, transparent 70%)` }}>
              <div className="p-[3px] rounded-full bg-[#0a0a0a]">
                {creator.avatar ? (
                  <img src={creator.avatar} alt="" className={`${avatarSz} rounded-full object-cover`} style={{ boxShadow: `0 0 30px ${accent}25` }} />
                ) : (
                  <div className={`${avatarSz} rounded-full bg-[#111] flex items-center justify-center`}>
                    <span className="text-3xl font-bold text-white/50">{(creator.name || "?")[0]}</span>
                  </div>
                )}
              </div>
            </div>
            {creator.isOnline && <span className="absolute bottom-1 right-1 flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-4 w-4 bg-emerald-500 ring-2 ring-[#0a0a0a]" /></span>}
          </div>

          <div className="mt-5 flex items-center justify-center gap-1.5">
            <h1 className={`font-display ${ts.name} font-bold text-white tracking-tight`}>{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
          </div>
          <p className="text-xs mt-1 font-mono font-semibold tracking-widest" style={{ color: accent }}>@{creator.slug?.split("-")[0]}</p>
          <NicheRankBadge creator={creator} light />
          {creator.headline && <p className={`mt-3 ${ts.headline} text-neutral-400 max-w-[300px] mx-auto leading-relaxed`}>{creator.headline}</p>}
          {creator.location && <p className="mt-2 text-xs text-neutral-600 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}

          {/* Accent-tinted social circles */}
          {creator.socials.length > 0 && (
            <div className="flex items-center justify-center gap-2.5 my-6 flex-wrap">
              {creator.socials.map(s => (
                <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${s.platform}`}
                  className="w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200"
                  style={{ border: `1px solid ${accent}20`, background: `${accent}0a`, boxShadow: `0 0 15px ${accent}08` }}>
                  <PlatformIcon platform={s.platform} size={18} className="text-neutral-400" />
                </a>
              ))}
            </div>
          )}

          {creator.bio && <p className={`${ts.bio} text-neutral-500 mb-5 leading-relaxed`}>{creator.bio}</p>}
          <BioLinksSection creator={creator} light />
          <ProductsSection creator={creator} light accent={accent} />

          {/* Services with accent glow on hover */}
          {creator.services.length > 0 && (
            <div className="space-y-2.5 mb-5">
              {creator.services.map(s => (
                <a key={s.id} href={`/creators/${creator.slug}`}
                  className={`group block w-full ${btnClass(creator.linkBioButtonShape)} px-6 py-4 min-h-[56px] text-base sm:py-5 text-center transition-all duration-200 hover:scale-[1.02]`}
                  style={{ border: `1px solid ${accent}18`, background: `${accent}06` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${accent}20`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                  <div className="font-semibold text-white text-[15px]">{s.title}</div>
                  <div className="text-xs mt-0.5 font-medium" style={{ color: `${accent}aa` }}>{priceLabel(s.price, s.deliveryDays)}</div>
                </a>
              ))}
            </div>
          )}

          {creator.portfolio.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              {creator.portfolio.slice(0, 6).map(p => (
                <div key={p.id} className="aspect-square rounded-xl overflow-hidden hover:scale-[1.04] transition-transform duration-200 cursor-pointer" style={{ border: `1px solid ${accent}12`, boxShadow: `0 0 10px ${accent}06` }}>
                  {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center text-neutral-700 text-xs">{p.title}</div>}
                </div>
              ))}
            </div>
          )}

          {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
          {isEmpty && <EmptyState light />}
          {!isEmpty && <CTAButton creator={creator} light accent={accent} isUnclaimed={isUnclaimed} />}
          <Branding light hidden={creator.hideBranding} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: COLLAGE — "The Photographer"
   Portfolio tiles as darkened bg, frosted content panel, moody editorial
   ══════════════════════════════════════════════════════════════ */
function TemplateCollage({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;
  const images = (creator.linkBioBgImages && creator.linkBioBgImages.length > 0)
    ? creator.linkBioBgImages
    : creator.portfolio.filter(p => p.image).map(p => p.image!);
  const tiles = images.length > 0 ? Array.from({ length: 12 }, (_, i) => images[i % images.length]) : [];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mosaic tile background */}
      {tiles.length > 0 ? (
        <div className="fixed inset-0 z-0 grid grid-cols-3 sm:grid-cols-4 auto-rows-fr">
          {tiles.map((img, i) => (
            <div key={i} className="relative overflow-hidden">
              <img src={img} alt="" className="w-full h-full object-cover scale-110" style={{ filter: "brightness(0.25) saturate(0.6)" }} />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        </div>
      ) : creator.cover ? (
        <div className="fixed inset-0 z-0">
          <img src={creator.cover} alt="" className="w-full h-full object-cover brightness-[0.25]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
        </div>
      ) : (
        <BgLayer creator={creator} fallback={<div className="fixed inset-0 z-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />} />
      )}

      <div className="absolute top-4 right-4 z-20"><ShareBtn slug={creator.slug} light /></div>

      <div className={`relative z-10 w-full lg:max-w-[480px] mx-auto px-4 lg:px-5 pt-12 pb-10 min-h-screen flex flex-col ${justify}`}>
        {/* Frosted content panel */}
        <div className={`bg-black/30 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 sm:p-8 mb-5 ${align} shadow-[0_8px_32px_rgba(0,0,0,0.4)]`}>
          {/* Avatar — square with subtle rotation for artistic flair */}
          <div className="relative inline-block mb-4">
            <div className="rotate-2">
              {creator.avatar ? (
                <img src={creator.avatar} alt="" className="w-28 h-28 rounded-2xl object-cover shadow-2xl ring-[2px] ring-white/10" />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-white/[0.08] backdrop-blur-xl flex items-center justify-center shadow-2xl ring-[2px] ring-white/10">
                  <span className="text-4xl font-bold text-white/50">{(creator.name || "?")[0]}</span>
                </div>
              )}
            </div>
            {creator.isOnline && <span className="absolute -bottom-1 -right-1 flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-4 w-4 bg-emerald-500 ring-2 ring-black/30" /></span>}
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <h1 className={`font-display ${ts.name} font-bold text-white tracking-tight`}>{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
          </div>
          <p className="text-xs text-white/30 mt-1 font-medium">@{creator.slug?.split("-")[0]}</p>
          <NicheRankBadge creator={creator} light />
          {creator.headline && <p className={`mt-3 ${ts.headline} text-white/50 leading-relaxed max-w-[300px] mx-auto`}>{creator.headline}</p>}
          {creator.location && <p className="mt-2 text-xs text-white/30 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
          <Socials creator={creator} light />
        </div>

        {/* Bio in frosted panel */}
        {creator.bio && (
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/[0.08] px-5 py-4 mb-5">
            <p className={`${ts.bio} text-white/40 text-center leading-relaxed`}>{creator.bio}</p>
          </div>
        )}
        <BioLinksSection creator={creator} light />
        <ProductsSection creator={creator} light />

        <div className="space-y-2.5">
          {creator.services.length > 0 && creator.services.map(s => <ServiceCard key={s.id} service={s} creator={creator} light />)}

          {/* Portfolio strip — only show if not already used as mosaic bg */}
          {creator.portfolio.length > 0 && tiles.length === 0 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 snap-x pt-3">
              {creator.portfolio.slice(0, 8).map(p => (
                <div key={p.id} className="w-28 h-28 rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.06] shrink-0 snap-start hover:scale-[1.04] transition-transform duration-200 cursor-pointer">
                  {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/15 text-xs">{p.title}</div>}
                </div>
              ))}
            </div>
          )}

          {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
          {isEmpty && <EmptyState light />}
          {!isEmpty && <CTAButton creator={creator} light isUnclaimed={isUnclaimed} />}
        </div>
        <Branding light hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: BENTO — "The Grid"
   Apple-style bento grid, dark bg, accent-bordered cells
   ══════════════════════════════════════════════════════════════ */
function TemplateBento({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const accent = creator.linkBioAccent || "#6366f1";
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const hasPortfolio = creator.portfolio.length > 0;
  const hasCustomBg = !!creator.linkBioBgType;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className={`min-h-screen p-3 sm:p-5 flex flex-col ${justify}`} style={{ background: hasCustomBg ? "transparent" : "#0a0a0a" }}>
      {hasCustomBg && <BgLayer creator={creator} fallback={<div className="fixed inset-0 z-0" style={{ background: "#0a0a0a" }} />} />}
      <div className="absolute top-4 right-4 z-20"><ShareBtn slug={creator.slug} light /></div>
      <div className={`w-full lg:max-w-[520px] mx-auto relative z-10 ${align}`}>
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 auto-rows-[95px]">
          {/* Identity card — col-span-4 row-span-2, accent gradient overlay */}
          <div className="col-span-4 row-span-2 rounded-3xl overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${accent}18, ${accent}08)`, border: `1px solid ${accent}25` }}>
            {creator.cover && <img src={creator.cover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" />}
            <div className="relative h-full flex items-center gap-4 sm:gap-5 px-5 sm:px-7">
              {creator.avatar ? (
                <img src={creator.avatar} alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-xl shrink-0 ring-[2px] ring-white/10" />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 ring-[2px] ring-white/10">
                  <span className="text-2xl font-bold text-white/60">{(creator.name || "?")[0]}</span>
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className={`font-display ${ts.name} font-bold text-white tracking-tight`}>{creator.name || "Your Name"}</h1>
                  {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
                </div>
                <p className="text-xs text-white/40 mt-0.5">@{creator.slug?.split("-")[0]}</p>
                <NicheRankBadge creator={creator} light />
                {creator.headline && <p className={`${ts.headline} text-white/50 mt-1 line-clamp-2 leading-relaxed`}>{creator.headline}</p>}
                {creator.isOnline && <div className="flex items-center gap-1 mt-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /><span className="text-[9px] text-emerald-400 font-medium">Online</span></div>}
              </div>
            </div>
          </div>

          {/* Bio — col-span-4 */}
          {creator.bio && (
            <div className="col-span-4 row-span-1 rounded-2xl bg-neutral-900 border border-neutral-800 px-5 py-3 flex items-center">
              <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">{creator.bio}</p>
            </div>
          )}

          {/* Social icons — col-span-2 */}
          {creator.socials.length > 0 && (
            <div className="col-span-2 row-span-1 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center gap-3 px-4 min-h-[80px]">
              {creator.socials.slice(0, 5).map(s => (
                <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${s.platform}`}
                  className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 hover:scale-110 transition-all duration-200">
                  <PlatformIcon platform={s.platform} size={18} className="text-neutral-400" />
                </a>
              ))}
            </div>
          )}

          {/* Location — col-span-2 */}
          <div className={`${creator.socials.length > 0 ? "col-span-2" : "col-span-4"} row-span-1 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center px-3`}>
            {creator.location ? (
              <span className="text-xs text-neutral-500 flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                {creator.location}
              </span>
            ) : (
              <span className="text-xs text-neutral-600">hireacreator.ai</span>
            )}
          </div>

          {/* Bio links — each col-span-2 */}
          {creator.bioLinks && creator.bioLinks.filter(l => l.isVisible).map(link => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
              className="col-span-2 row-span-1 rounded-2xl bg-neutral-900 border border-neutral-800 px-4 flex items-center justify-center hover:bg-neutral-800/80 hover:scale-[1.02] transition-all duration-200">
              <span className="text-xs text-neutral-300 font-medium truncate">{link.title}</span>
            </a>
          ))}

          {/* Products */}
          <div className="col-span-4"><ProductsSection creator={creator} light accent={accent} /></div>

          {/* Portfolio items — col-span-2 row-span-2 each */}
          {hasPortfolio && creator.portfolio.slice(0, 4).map(p => (
            <div key={p.id} className="col-span-2 row-span-2 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 cursor-pointer group">
              {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs">{p.title}</div>}
            </div>
          ))}

          {/* Services — col-span-2 each with accent border */}
          {creator.services.map(s => (
            <a key={s.id} href={`/creators/${creator.slug}`}
              className={`col-span-2 row-span-1 ${btnClass(creator.linkBioButtonShape)} px-4 flex items-center justify-between hover:bg-white/5 hover:scale-[1.02] transition-all duration-200`}
              style={{ borderColor: `${accent}25`, border: `1px solid ${accent}25`, background: `${accent}08` }}>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">{s.title}</div>
                <div className="text-[10px] text-neutral-500">{priceLabel(s.price, s.deliveryDays)}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-600 shrink-0"><path d="M9 18l6-6-6-6" strokeLinecap="round" /></svg>
            </a>
          ))}

          {/* Calendar */}
          {creator.calendarEnabled && (
            <div className="col-span-4 row-span-1">
              <CalendarBooking creatorId={creator.id} creatorName={creator.name} />
            </div>
          )}

          {/* CTA — col-span-4 with accent bg */}
          {!isEmpty && (
            <a href={isUnclaimed ? `/u/${creator.slug}/claim` : `/creators/${creator.slug}`}
              className="col-span-4 row-span-1 rounded-2xl font-semibold text-sm text-center flex items-center justify-center text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
              style={{ background: accent }}>
              {isUnclaimed ? "Claim & Customize" : "View Full Profile"}
            </a>
          )}
          {isEmpty && (
            <a href="/dashboard" className="col-span-4 row-span-1 rounded-2xl bg-white font-semibold text-sm text-center flex items-center justify-center text-neutral-900 hover:bg-neutral-100 transition-all duration-200">
              Set Up Your Profile
            </a>
          )}
        </div>
        <Branding light hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: SPLIT — "The Magazine"
   Two-column: sticky hero left, scrollable content right, editorial feel
   ══════════════════════════════════════════════════════════════ */
function TemplateSplit({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#171717";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const heroImage = creator.cover || (creator.portfolio.length > 0 && creator.portfolio[0].image) || null;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen flex flex-col sm:flex-row">
        {/* Left 45% — sticky hero image */}
        <div className="sm:w-[45%] sm:sticky sm:top-0 sm:h-screen relative overflow-hidden">
          {heroImage ? (
            <>
              <img src={heroImage} alt="" className="w-full h-[35vh] sm:h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 sm:bg-gradient-to-r sm:from-transparent sm:to-black/10" />
            </>
          ) : (
            <div className="w-full h-[35vh] sm:h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700" />
          )}
          {/* ShareBtn on hero */}
          <div className="absolute top-3 right-4 z-10"><ShareBtn slug={creator.slug} light /></div>
          {/* Mobile: name overlay at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 sm:hidden">
            <div className="h-24 bg-gradient-to-t from-white to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <div className="flex items-center gap-2.5">
                {creator.avatar ? (
                  <img src={creator.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-lg" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-neutral-400">{(creator.name || "?")[0]}</span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1">
                    <h1 className="font-display text-lg font-bold text-neutral-900">{creator.name || "Your Name"}</h1>
                    {creator.isVerified && <VerifiedBadge />}
                  </div>
                  <p className="text-[10px] text-neutral-500">@{creator.slug?.split("-")[0]}</p>
                  <NicheRankBadge creator={creator} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 55% — scrollable content */}
        <div className={`sm:w-[55%] sm:overflow-y-auto sm:h-screen ${justify}`}>
          <div className={`px-6 sm:px-8 lg:px-10 py-6 lg:py-10 ${align}`}>
            {/* Desktop header */}
            <div className="hidden sm:block mb-8">
              <div className="flex items-center gap-4 mb-4">
                {creator.avatar ? (
                  <img src={creator.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-neutral-400">{(creator.name || "?")[0]}</span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className={`font-display ${ts.name} font-bold text-neutral-900 tracking-tight`}>{creator.name || "Your Name"}</h1>
                    {creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">@{creator.slug?.split("-")[0]}</p>
                  <NicheRankBadge creator={creator} />
                </div>
              </div>
              {creator.headline && <p className={`${ts.headline} text-neutral-600 leading-relaxed`}>{creator.headline}</p>}
              {creator.location && <p className="text-xs text-neutral-400 mt-1.5 flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
              {creator.isOnline && <OnlineDot />}
            </div>

            {/* Mobile extras (headline/location not in overlay) */}
            <div className="sm:hidden mb-5">
              {creator.headline && <p className={`${ts.headline} text-neutral-600 leading-relaxed`}>{creator.headline}</p>}
              {creator.location && <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
              {creator.isOnline && <OnlineDot />}
            </div>

            {/* Social pills — platform icon + handle text */}
            {creator.socials.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {creator.socials.map(s => (
                  <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${s.platform}`}
                    className="flex items-center gap-2 px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-full hover:bg-neutral-100 hover:scale-[1.02] transition-all duration-200">
                    <PlatformIcon platform={s.platform} size={14} className="text-neutral-500" />
                    <span className="text-xs text-neutral-600 font-medium">{s.handle || s.platform}</span>
                  </a>
                ))}
              </div>
            )}

            {creator.bio && <p className="text-sm text-neutral-500 mb-6 leading-relaxed">{creator.bio}</p>}
            <BioLinksSection creator={creator} />
            <ProductsSection creator={creator} />

            {/* Services with section header */}
            {creator.services.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">Services</h2>
                <div className="space-y-2.5">
                  {creator.services.map(s => <ServiceCard key={s.id} service={s} creator={creator} />)}
                </div>
              </div>
            )}

            {creator.calendarEnabled && <div className="mb-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}

            {/* Portfolio as horizontal scroll */}
            {creator.portfolio.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">Work</h2>
                <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
                  {creator.portfolio.slice(0, 8).map(p => (
                    <div key={p.id} className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-neutral-100 shrink-0 snap-start group cursor-pointer">
                      {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-neutral-300 text-[10px]">{p.title}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isEmpty && <EmptyState />}
            {!isEmpty && <CTAButton creator={creator} accent={accent} isUnclaimed={isUnclaimed} />}
            <Branding hidden={creator.hideBranding} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: CUSTOM — User-designed, fully customizable
   Uses all customization fields, no preset assumptions
   ══════════════════════════════════════════════════════════════ */
function TemplateCustom({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#6366f1";
  const hasCustomBg = !!creator.linkBioBgType;
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;
  const isDarkBg = hasCustomBg && (
    creator.linkBioBgType === "video" || creator.linkBioBgType === "image" || creator.linkBioBgType === "collage" ||
    (creator.linkBioBgType === "gradient" && (creator.linkBioBgValue?.includes("#0") || creator.linkBioBgValue?.includes("#1") || creator.linkBioBgValue?.includes("#2")))
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BgLayer creator={creator} fallback={<div className="fixed inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200" />} />
      {/* Ambient glow orbs for dark backgrounds */}
      {isDarkBg && (
        <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${accent}60 0%, transparent 70%)` }} />
          <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #ec489960 0%, transparent 70%)" }} />
        </div>
      )}
      <div className={`relative z-10 w-full lg:max-w-[480px] mx-auto px-5 pt-14 pb-10 min-h-screen flex flex-col ${justify}`}>
        {/* Header banner */}
        {creator.headerImageUrl && (
          <div className="w-full mb-4 rounded-2xl overflow-hidden -mt-6">
            <img src={creator.headerImageUrl} alt="" className="w-full h-auto max-h-[180px] object-cover" />
          </div>
        )}
        <div className={`${align} mb-8`}>
          {/* Logo or Avatar with glow ring on dark bg */}
          {creator.logoUrl ? (
            <div className="mb-2">
              <img src={creator.logoUrl} alt="" className="h-[100px] w-auto max-w-[200px] object-contain mx-auto" />
            </div>
          ) : (
            <div className="relative inline-block">
              {isDarkBg && <div className="absolute inset-0 rounded-full opacity-30 blur-xl" style={{ background: accent }} />}
              {creator.avatar ? (
                <img src={creator.avatar} alt="" className={`relative ${avatarSz} rounded-full object-cover shadow-2xl ${isDarkBg ? "ring-2 ring-white/20" : "ring-2 ring-neutral-200"}`} />
              ) : (
                <div className={`relative ${avatarSz} rounded-full flex items-center justify-center shadow-2xl ${isDarkBg ? "bg-white/10 backdrop-blur-xl ring-2 ring-white/20" : "bg-neutral-100 ring-2 ring-neutral-200"}`}><span className={`text-3xl font-bold ${isDarkBg ? "text-white/60" : "text-neutral-400"}`}>{(creator.name || "?")[0]}</span></div>
              )}
              {creator.isOnline && <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className={`relative rounded-full h-4 w-4 bg-emerald-500 ring-2 ${isDarkBg ? "ring-[#1a1040]" : "ring-white"}`} /></span>}
            </div>
          )}

          <div className="mt-5 flex items-center justify-center gap-1.5">
            <h1 className={`font-display ${ts.name} font-bold tracking-tight ${isDarkBg ? "text-white" : "text-neutral-900"}`}>{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge light={isDarkBg} />}{creator.isPro && <ProBadge />}
          </div>
          <p className={`text-xs mt-0.5 ${isDarkBg ? "text-white/40" : "text-neutral-400"}`}>@{creator.slug?.split("-")[0]}</p>
          <NicheRankBadge creator={creator} light={isDarkBg} />
          {creator.headline && <p className={`mt-2 ${ts.headline} max-w-[320px] mx-auto leading-relaxed ${isDarkBg ? "text-white/50" : "text-neutral-600"}`}>{creator.headline}</p>}
          {creator.location && <p className={`mt-2 text-xs flex items-center justify-center gap-1 ${isDarkBg ? "text-white/30" : "text-neutral-400"}`}><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}

          {/* Stats bar */}
          {(creator.totalProjects > 0 || creator.rating > 0 || creator.reviewCount > 0) && (
            <div className={`mt-5 flex items-center justify-center gap-6 py-3 rounded-2xl ${isDarkBg ? "bg-white/5" : "bg-neutral-50"}`}>
              {creator.totalProjects > 0 && <div className="text-center"><div className={`text-lg font-bold ${isDarkBg ? "text-white" : "text-neutral-900"}`}>{creator.totalProjects}</div><div className={`text-[10px] uppercase tracking-wider ${isDarkBg ? "text-white/30" : "text-neutral-400"}`}>Projects</div></div>}
              {creator.rating > 0 && <><div className={`w-px h-8 ${isDarkBg ? "bg-white/10" : "bg-neutral-200"}`} /><div className="text-center"><div className={`text-lg font-bold ${isDarkBg ? "text-white" : "text-neutral-900"}`}>{creator.rating.toFixed(1)}</div><div className={`text-[10px] uppercase tracking-wider ${isDarkBg ? "text-white/30" : "text-neutral-400"}`}>Rating</div></div></>}
              {creator.reviewCount > 0 && <><div className={`w-px h-8 ${isDarkBg ? "bg-white/10" : "bg-neutral-200"}`} /><div className="text-center"><div className={`text-lg font-bold ${isDarkBg ? "text-white" : "text-neutral-900"}`}>{creator.reviewCount}</div><div className={`text-[10px] uppercase tracking-wider ${isDarkBg ? "text-white/30" : "text-neutral-400"}`}>Reviews</div></div></>}
            </div>
          )}
        </div>
        <Socials creator={creator} light={isDarkBg} />
        {creator.bio && <p className={`text-sm text-center mb-6 leading-relaxed ${isDarkBg ? "text-white/50" : "text-neutral-500"}`}>{creator.bio}</p>}
        <BioLinksSection creator={creator} light={isDarkBg} />
        <ProductsSection creator={creator} light={isDarkBg} accent={accent} />
        <div className="space-y-3">
          {creator.services.map(s => <ServiceCard key={s.id} service={s} creator={creator} light={isDarkBg} accent={accent} />)}
          {creator.portfolio.length > 0 && <div className="grid grid-cols-3 gap-1.5 pt-2">{creator.portfolio.slice(0, 6).map(p => <div key={p.id} className={`aspect-square rounded-xl overflow-hidden ${isDarkBg ? "bg-white/5" : "bg-neutral-100"}`}>{p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center text-xs ${isDarkBg ? "text-white/20" : "text-neutral-300"}`}>{p.title}</div>}</div>)}</div>}
          {creator.calendarEnabled && <div className="my-4"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
          {isEmpty && <EmptyState light={isDarkBg} />}
          {!isEmpty && <CTAButton creator={creator} light={isDarkBg} accent={accent} isUnclaimed={isUnclaimed} />}
        </div>
        <Branding light={isDarkBg} hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: FOUNDER — "The Landing Page"
   Clean dark theme for startup founders & business owners
   ══════════════════════════════════════════════════════════════ */
function TemplateFounder({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const accent = creator.linkBioAccent || "#3b82f6";
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0 && creator.bioLinks.length === 0;
  const hasCustomBg = !!creator.linkBioBgType;
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  // Detect GitHub links from bioLinks
  const githubLink = creator.bioLinks.find(l => l.isVisible && l.url.toLowerCase().includes("github.com"));
  const otherLinks = creator.bioLinks.filter(l => l.isVisible && l !== githubLink);

  // Business links
  const businessLinks = [
    creator.websiteUrl && { label: "Website", url: creator.websiteUrl },
    creator.businessUrl && { label: creator.businessName || "Business", url: creator.businessUrl },
  ].filter(Boolean) as { label: string; url: string }[];

  function getDomain(url: string) {
    try { return url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]; } catch { return url; }
  }

  return (
    <div className="min-h-screen" style={{ background: hasCustomBg ? "transparent" : "linear-gradient(160deg, #111827 0%, #1f2937 100%)" }}>
      {hasCustomBg && <BgLayer creator={creator} fallback={<div className="fixed inset-0 z-0" style={{ background: "linear-gradient(160deg, #111827 0%, #1f2937 100%)" }} />} />}
      <div className={`relative z-10 w-full lg:max-w-[520px] mx-auto px-5 lg:px-6 pt-12 pb-10 min-h-screen flex flex-col ${justify}`}>
        <div className="absolute top-4 right-4 z-20"><ShareBtn slug={creator.slug} light /></div>

        {/* Identity */}
        <div className="flex items-center gap-5 mb-8">
          <div className="shrink-0">
            {creator.avatar ? (
              <img src={creator.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white/10 shadow-xl" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/[0.08] flex items-center justify-center ring-2 ring-white/10 shadow-xl">
                <span className="text-2xl font-bold text-white/50">{(creator.name || "?")[0]}</span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className={`font-display ${ts.name} font-bold text-white tracking-tight`}>{creator.name || "Your Name"}</h1>
              {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
            </div>
            {creator.businessName && (
              <p className="text-sm font-medium mt-0.5" style={{ color: accent }}>Founder, {creator.businessName}</p>
            )}
            {!creator.businessName && creator.headline && (
              <p className="text-sm text-white/40 mt-0.5">{creator.headline}</p>
            )}
            {creator.location && (
              <p className="text-xs text-white/25 mt-1 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                {creator.location}
              </p>
            )}
            {creator.isOnline && <OnlineDot light />}
          </div>
        </div>

        {/* Business headline + bio */}
        {creator.businessName && creator.headline && (
          <p className="text-sm text-white/50 mb-6 leading-relaxed">{creator.headline}</p>
        )}
        {creator.bio && (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-4 mb-6">
            <p className="text-sm text-white/45 leading-relaxed">{creator.bio}</p>
          </div>
        )}

        {/* Business links — prominent buttons at top */}
        {businessLinks.length > 0 && (
          <div className="flex gap-2.5 mb-6">
            {businessLinks.map(bl => (
              <a key={bl.url} href={bl.url} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:brightness-110"
                style={{ background: accent }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {bl.label}
              </a>
            ))}
          </div>
        )}

        {/* Social icons row */}
        {creator.socials.length > 0 && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {creator.socials.map(s => (
              <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${s.platform}`}
                className="w-12 h-12 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.12] hover:scale-110 transition-all">
                <PlatformIcon platform={s.platform} size={18} className="text-white/50" />
              </a>
            ))}
          </div>
        )}

        {/* Products section */}
        {creator.products && creator.products.length > 0 && (
          <>
            <SectionLabel light>Products</SectionLabel>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {creator.products.map(p => (
                <a key={p.id} href={p.productUrl || "#"} target="_blank" rel="noopener noreferrer"
                  className="group bg-white/[0.05] border border-white/[0.08] rounded-2xl overflow-hidden hover:bg-white/[0.08] hover:scale-[1.02] transition-all">
                  {p.thumbnailUrl && <img src={p.thumbnailUrl} alt="" className="w-full aspect-[4/3] object-cover" />}
                  <div className="p-3">
                    <div className="text-sm font-semibold text-white truncate">{p.title}</div>
                    <div className="text-xs mt-1" style={{ color: accent }}>
                      {p.priceCents === 0 ? "Free" : `$${(p.priceCents / 100).toFixed(2)} ${p.currency}`}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}

        {/* GitHub special card */}
        {githubLink && (
          <a href={githubLink.url} target="_blank" rel="noopener noreferrer"
            className="group flex items-center gap-4 w-full bg-[#0d1117] border border-white/[0.08] rounded-2xl px-6 py-4 min-h-[56px] mb-3 hover:border-white/[0.15] hover:scale-[1.02] transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
              <PlatformIcon platform="github" size={20} className="text-white/80" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-white">{githubLink.title}</div>
              <div className="text-[11px] text-white/30 mt-0.5 truncate">{getDomain(githubLink.url)}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20 group-hover:text-white/50 transition-colors shrink-0"><path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        )}

        {/* Other bio links as product-style cards */}
        {otherLinks.length > 0 && (
          <div className="space-y-2.5 mb-6">
            {otherLinks.map(link => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                onClick={() => { fetch("/api/links/click", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ linkId: link.id }) }).catch(() => {}); }}
                className="group flex items-center gap-3.5 w-full px-6 py-4 min-h-[56px] rounded-2xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.09] hover:scale-[1.02] transition-all">
                {link.thumbnailUrl ? (
                  <img src={link.thumbnailUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 3v18" strokeLinecap="round"/></svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-white">{link.title}</div>
                  <div className="text-[11px] text-white/25 mt-0.5 truncate">{getDomain(link.url)}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/15 group-hover:text-white/40 transition-colors shrink-0"><path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            ))}
          </div>
        )}

        {/* What I Offer — services */}
        {creator.services.length > 0 && (
          <>
            <SectionLabel light>What I Offer</SectionLabel>
            <div className="space-y-2.5 mb-6">
              {creator.services.map(s => (
                <a key={s.id} href={`/creators/${creator.slug}`}
                  className={`group block w-full ${btnClass(creator.linkBioButtonShape)} bg-white/[0.05] border border-white/[0.08] px-6 py-4 min-h-[56px] hover:bg-white/[0.08] hover:scale-[1.02] transition-all`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm text-white">{s.title}</div>
                      {s.description && <div className="text-[11px] text-white/25 mt-0.5 line-clamp-1">{s.description}</div>}
                    </div>
                    <div className="text-sm font-bold shrink-0 ml-3 px-2.5 py-1 rounded-lg" style={{ color: accent, background: `${accent}15` }}>
                      {priceLabel(s.price, s.deliveryDays)}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}

        {/* Projects — portfolio */}
        {creator.portfolio.length > 0 && (
          <>
            <SectionLabel light>Projects</SectionLabel>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {creator.portfolio.slice(0, 6).map((p, i) => (
                <div key={p.id} className={`${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]"} rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.06] group cursor-pointer hover:scale-[1.02] transition-transform`}>
                  {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : (
                    <div className="w-full h-full flex items-center justify-center text-white/15 text-xs">{p.title}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Book a Call */}
        {creator.calendarEnabled && (
          <>
            <SectionLabel light>Book a Call</SectionLabel>
            <div className="mb-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>
          </>
        )}

        {isEmpty && <EmptyState light />}
        {!isEmpty && <CTAButton creator={creator} light accent={accent} isUnclaimed={isUnclaimed} />}
        <Branding light hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: BRUTALIST — Raw, bold, anti-design. Punk zine aesthetic.
   ══════════════════════════════════════════════════════════════ */
function TemplateBrutalist({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#ffffff";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const bs = BUTTON_SIZES[creator.linkBioButtonSize || "medium"] || BUTTON_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      <div className={`w-full lg:max-w-[500px] mx-auto px-5 pt-10 pb-10 min-h-screen flex flex-col ${justify}`}>
        <div className="absolute top-3 right-4 z-10"><ShareBtn slug={creator.slug} light /></div>

        <div className="border-b-[3px] border-white pb-6 mb-6">
          <div className="flex items-start gap-5">
            {creator.avatar ? (
              <img src={creator.avatar} alt="" className={`${avatarSz} object-cover border-[3px] border-white`} />
            ) : (
              <div className={`${avatarSz} border-[3px] border-white flex items-center justify-center bg-white/5`}>
                <span className="text-3xl font-bold text-white/60">{(creator.name || "?")[0]}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className={`${ts.name} font-black uppercase tracking-wider`} style={{ fontFamily: "'Courier New', monospace" }}>{creator.name || "YOUR NAME"}</h1>
                {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
              </div>
              <p className="text-xs text-white/50 uppercase tracking-[0.3em] mt-1">@{creator.slug}</p>
              {creator.headline && <p className={`mt-2 ${ts.headline} text-white/70 uppercase tracking-wide`}>{creator.headline}</p>}
            </div>
          </div>
        </div>

        {creator.bio && (
          <div className="border-[3px] border-white p-4 mb-6">
            <p className={`${ts.bio} text-white/80 leading-relaxed`}>{creator.bio}</p>
          </div>
        )}

        <NicheRankBadge creator={creator} light />

        {creator.socials.length > 0 && (
          <div className="flex items-center gap-3 my-6 flex-wrap">
            {creator.socials.map(s => (
              <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 border-[2px] border-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                aria-label={`Visit ${s.platform}`}>
                <PlatformIcon platform={s.platform} size={16} className="text-white" />
              </a>
            ))}
          </div>
        )}

        <BioLinksSection creator={creator} light />
        <ProductsSection creator={creator} light accent={accent} />

        {creator.services.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="text-xs font-bold uppercase tracking-[0.4em] text-white/40 border-b border-white/20 pb-1">Services</div>
            {creator.services.map(s => (
              <a key={s.id} href={`/creators/${creator.slug}`}
                className={`block w-full ${btnClass(creator.linkBioButtonShape)} ${bs} border-[3px] border-white text-white hover:bg-white hover:text-black transition-colors uppercase tracking-wider font-bold`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{s.title}</span>
                  <span className="text-xs">{priceLabel(s.price, s.deliveryDays)}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {creator.portfolio.length > 0 && (
          <div className="grid grid-cols-3 gap-1 mb-6">
            {creator.portfolio.slice(0, 6).map(p => (
              <div key={p.id} className="aspect-square overflow-hidden border border-white/20">
                {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" /> : <div className="w-full h-full bg-white/5 flex items-center justify-center text-xs text-white/20">{p.title}</div>}
              </div>
            ))}
          </div>
        )}

        {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
        {isEmpty && <EmptyState light />}
        {!isEmpty && (
          <a href={`/creators/${creator.slug}`}
            className={`block w-full mt-8 font-black text-center ${bs} border-[3px] border-white text-white hover:bg-white hover:text-black transition-colors uppercase tracking-[0.3em]`}>
            VIEW FULL PROFILE
          </a>
        )}
        <Branding light hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: AURORA — Animated gradient aurora bg, glassmorphic cards
   ══════════════════════════════════════════════════════════════ */
function TemplateAurora({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#60a5fa";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated aurora background */}
      <div className="fixed inset-0 z-0" style={{ background: "#0a0a1a" }}>
        <div className="absolute inset-0 opacity-60" style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 25%, #1a0a2e 50%, #0d2818 75%, #1e3a5f 100%)",
          backgroundSize: "400% 400%",
          animation: "auroraShift 15s ease infinite",
        }} />
        <div className="absolute inset-0 opacity-40" style={{
          background: "radial-gradient(ellipse at 20% 50%, #4f46e580 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #06b6d480 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #8b5cf680 0%, transparent 50%)",
          backgroundSize: "200% 200%",
          animation: "auroraShift 20s ease-in-out infinite reverse",
        }} />
      </div>
      <style>{`@keyframes auroraShift { 0%,100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }`}</style>

      <div className={`relative z-10 w-full lg:max-w-[460px] mx-auto px-5 pt-12 pb-10 min-h-screen ${align} flex flex-col ${justify}`}>
        <div className="absolute top-3 right-4"><ShareBtn slug={creator.slug} light /></div>

        <div className="relative inline-block mb-5">
          <div className="absolute -inset-3 rounded-full opacity-30 blur-xl" style={{ background: "linear-gradient(135deg, #60a5fa, #a78bfa, #34d399)" }} />
          {creator.avatar ? (
            <img src={creator.avatar} alt="" className={`relative ${avatarSz} rounded-full object-cover shadow-2xl ring-2 ring-white/20`} />
          ) : (
            <div className={`relative ${avatarSz} rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center ring-2 ring-white/20`}>
              <span className="text-3xl font-bold text-white/60">{(creator.name || "?")[0]}</span>
            </div>
          )}
          {creator.isOnline && <span className="absolute bottom-0 right-0 flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-4 w-4 bg-emerald-500 ring-2 ring-[#0a0a1a]" /></span>}
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <h1 className={`${ts.name} font-bold text-white tracking-tight`}>{creator.name || "Your Name"}</h1>
          {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
        </div>
        <p className="text-xs text-white/40 mt-0.5">@{creator.slug}</p>
        <NicheRankBadge creator={creator} light />
        {creator.headline && <p className={`mt-3 ${ts.headline} text-white/60 max-w-[300px] mx-auto leading-relaxed`}>{creator.headline}</p>}
        {creator.location && <p className="mt-2 text-xs text-white/30 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}

        <Socials creator={creator} light />
        {creator.bio && <p className={`${ts.bio} text-white/50 mb-5 leading-relaxed`}>{creator.bio}</p>}
        <BioLinksSection creator={creator} light />
        <ProductsSection creator={creator} light accent={accent} />

        {creator.services.length > 0 && (
          <div className="space-y-2.5 mb-5">
            <SectionLabel light>Services</SectionLabel>
            {creator.services.map(s => (
              <a key={s.id} href={`/creators/${creator.slug}`}
                className={`block w-full ${btnClass(creator.linkBioButtonShape)} px-6 py-4 min-h-[56px] bg-white/10 backdrop-blur-md border border-white/10 text-left hover:bg-white/15 transition-all hover:scale-[1.02]`}>
                <div className="font-semibold text-white text-sm">{s.title}</div>
                <div className="text-xs mt-0.5 text-white/40">{priceLabel(s.price, s.deliveryDays)}</div>
              </a>
            ))}
          </div>
        )}

        {creator.portfolio.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {creator.portfolio.slice(0, 6).map(p => (
              <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10">
                {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-white/20">{p.title}</div>}
              </div>
            ))}
          </div>
        )}

        {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
        {isEmpty && <EmptyState light />}
        {!isEmpty && <CTAButton creator={creator} light accent={accent} isUnclaimed={isUnclaimed} />}
        <Branding light hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: SUNSET — Warm gradient (orange→pink→purple)
   ══════════════════════════════════════════════════════════════ */
function TemplateSunset({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#f59e0b";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(180deg, #f97316 0%, #ec4899 40%, #8b5cf6 80%, #4c1d95 100%)" }}>
      <div className={`relative z-10 w-full lg:max-w-[460px] mx-auto px-5 pt-12 pb-10 min-h-screen ${align} flex flex-col ${justify}`}>
        <div className="absolute top-3 right-4"><ShareBtn slug={creator.slug} light /></div>

        <div className="relative inline-block mb-5">
          {creator.avatar ? (
            <img src={creator.avatar} alt="" className={`${avatarSz} rounded-full object-cover shadow-2xl ring-4 ring-white/30`} />
          ) : (
            <div className={`${avatarSz} rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center ring-4 ring-white/30`}>
              <span className="text-3xl font-bold text-white/80">{(creator.name || "?")[0]}</span>
            </div>
          )}
          {creator.isOnline && <OnlineDot light />}
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <h1 className={`${ts.name} font-bold text-white tracking-tight drop-shadow-lg`}>{creator.name || "Your Name"}</h1>
          {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
        </div>
        <p className="text-xs text-white/50 mt-0.5">@{creator.slug}</p>
        <NicheRankBadge creator={creator} light />
        {creator.headline && <p className={`mt-3 ${ts.headline} text-white/70 max-w-[300px] mx-auto leading-relaxed`}>{creator.headline}</p>}
        {creator.location && <p className="mt-2 text-xs text-white/40 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}

        <Socials creator={creator} light />
        {creator.bio && <p className={`${ts.bio} text-white/60 mb-5 leading-relaxed`}>{creator.bio}</p>}
        <BioLinksSection creator={creator} light />
        <ProductsSection creator={creator} light accent={accent} />

        {creator.services.length > 0 && (
          <div className="space-y-2.5 mb-5">
            <SectionLabel light>Services</SectionLabel>
            {creator.services.map(s => (
              <a key={s.id} href={`/creators/${creator.slug}`}
                className={`block w-full ${btnClass(creator.linkBioButtonShape)} px-6 py-4 min-h-[56px] bg-white/15 backdrop-blur-sm border border-white/20 text-left hover:bg-white/25 transition-all hover:scale-[1.02]`}>
                <div className="font-semibold text-white text-sm">{s.title}</div>
                <div className="text-xs mt-0.5" style={{ color: "#fcd34d" }}>{priceLabel(s.price, s.deliveryDays)}</div>
              </a>
            ))}
          </div>
        )}

        {creator.portfolio.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {creator.portfolio.slice(0, 6).map(p => (
              <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-white/10 border border-white/10">
                {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-white/20">{p.title}</div>}
              </div>
            ))}
          </div>
        )}

        {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
        {isEmpty && <EmptyState light />}
        {!isEmpty && (
          <a href={isUnclaimed ? `/u/${creator.slug}/claim` : `/creators/${creator.slug}`}
            className={`block w-full mt-8 font-semibold text-center ${btnClass(creator.linkBioButtonShape)} py-4 px-5 transition-all hover:scale-[1.02] hover:shadow-xl shadow-lg`}
            style={{ background: "rgba(255,255,255,0.25)", color: "white", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}>
            {isUnclaimed ? "Claim & Customize" : "View Full Profile"}
          </a>
        )}
        <Branding light hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: TERMINAL — Hacker/dev green-on-black terminal aesthetic
   ══════════════════════════════════════════════════════════════ */
function TemplateTerminal({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#00ff00";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const bs = BUTTON_SIZES[creator.linkBioButtonSize || "medium"] || BUTTON_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className="min-h-screen relative" style={{ background: "#0a0a0a", fontFamily: "'Courier New', Courier, monospace" }}>
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-20 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)" }} />

      <div className={`relative z-10 w-full lg:max-w-[500px] mx-auto px-5 pt-8 pb-10 min-h-screen flex flex-col ${justify}`}>
        <div className="absolute top-3 right-4"><ShareBtn slug={creator.slug} light /></div>

        {/* Terminal header bar */}
        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-[#00ff00]/20">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-[10px] text-[#00ff00]/40 ml-2">~/{creator.slug}</span>
        </div>

        <div className="text-center mb-6">
          {creator.avatar ? (
            <img src={creator.avatar} alt="" className={`${avatarSz} rounded-sm object-cover mx-auto border border-[#00ff00]/30`} style={{ filter: "saturate(0.3) brightness(0.9)" }} />
          ) : (
            <div className={`${avatarSz} rounded-sm mx-auto border border-[#00ff00]/30 flex items-center justify-center bg-[#00ff00]/5`}>
              <span className="text-3xl font-bold text-[#00ff00]/60">{(creator.name || "?")[0]}</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-1.5">
            <span className="text-[#00ff00]/50">$</span>
            <h1 className={`${ts.name} font-bold`} style={{ color: "#00ff00" }}>
              {creator.name || "user"}
              <span className="animate-pulse">_</span>
            </h1>
            {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
          </div>
          <p className="text-xs mt-1" style={{ color: "#00ff00", opacity: 0.4 }}>// @{creator.slug}</p>
          <NicheRankBadge creator={creator} light />
          {creator.headline && <p className={`mt-2 ${ts.headline}`} style={{ color: "#00ff00", opacity: 0.6 }}># {creator.headline}</p>}
          {creator.location && <p className="mt-1 text-xs" style={{ color: "#00ff00", opacity: 0.3 }}>location: {creator.location}</p>}
        </div>

        {creator.bio && (
          <div className="mb-6 p-3 border border-[#00ff00]/15 bg-[#00ff00]/[0.02]">
            <p className={`${ts.bio} leading-relaxed`} style={{ color: "#00ff00", opacity: 0.7 }}>/* {creator.bio} */</p>
          </div>
        )}

        {creator.socials.length > 0 && (
          <div className="flex items-center gap-3 my-5 flex-wrap">
            {creator.socials.map(s => (
              <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 border border-[#00ff00]/20 flex items-center justify-center hover:bg-[#00ff00]/10 transition-colors"
                aria-label={`Visit ${s.platform}`}>
                <PlatformIcon platform={s.platform} size={18} className="text-[#00ff00]/60" />
              </a>
            ))}
          </div>
        )}

        <BioLinksSection creator={creator} light />
        <ProductsSection creator={creator} light accent={accent} />

        {creator.services.length > 0 && (
          <div className="space-y-2 mb-6">
            <div className="text-xs font-bold" style={{ color: "#00ff00", opacity: 0.3 }}>--- SERVICES ---</div>
            {creator.services.map(s => (
              <a key={s.id} href={`/creators/${creator.slug}`}
                className={`block w-full ${btnClass(creator.linkBioButtonShape)} ${bs} border border-[#00ff00]/20 hover:bg-[#00ff00]/10 transition-colors`}
                style={{ color: "#00ff00" }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">&gt; {s.title}</span>
                  <span className="text-xs opacity-50">{priceLabel(s.price, s.deliveryDays)}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {creator.portfolio.length > 0 && (
          <div className="grid grid-cols-3 gap-1 mb-6">
            {creator.portfolio.slice(0, 6).map(p => (
              <div key={p.id} className="aspect-square overflow-hidden border border-[#00ff00]/10">
                {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" style={{ filter: "saturate(0) brightness(0.7) contrast(1.3)" }} /> : <div className="w-full h-full bg-[#00ff00]/5 flex items-center justify-center text-xs text-[#00ff00]/20">{p.title}</div>}
              </div>
            ))}
          </div>
        )}

        {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
        {isEmpty && <EmptyState light />}
        {!isEmpty && (
          <a href={`/creators/${creator.slug}`}
            className={`block w-full mt-8 font-bold text-center ${bs} border-2 transition-colors hover:bg-[#00ff00]/10`}
            style={{ borderColor: "#00ff00", color: "#00ff00" }}>
            &gt; VIEW_FULL_PROFILE
          </a>
        )}
        <Branding light hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: PASTEL — Soft pastel colors, cute, rounded
   ══════════════════════════════════════════════════════════════ */
function TemplatePastel({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#c084fc";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const bs = BUTTON_SIZES[creator.linkBioButtonSize || "medium"] || BUTTON_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #fce7f3 0%, #ede9fe 35%, #dbeafe 65%, #d1fae5 100%)" }}>
      <div className={`w-full lg:max-w-[460px] mx-auto px-5 pt-12 pb-10 min-h-screen ${align} flex flex-col ${justify}`}>
        <div className="absolute top-3 right-4"><ShareBtn slug={creator.slug} /></div>

        <div className="relative inline-block mb-5">
          {creator.avatar ? (
            <img src={creator.avatar} alt="" className={`${avatarSz} rounded-full object-cover shadow-lg ring-4 ring-white`} />
          ) : (
            <div className={`${avatarSz} rounded-full bg-white shadow-lg flex items-center justify-center ring-4 ring-white`}>
              <span className="text-3xl font-bold text-purple-300">{(creator.name || "?")[0]}</span>
            </div>
          )}
          {creator.isOnline && <OnlineDot />}
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <h1 className={`${ts.name} font-bold text-neutral-700 tracking-tight`}>{creator.name || "Your Name"}</h1>
          {creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}
        </div>
        <p className="text-xs text-neutral-400 mt-0.5">@{creator.slug}</p>
        <NicheRankBadge creator={creator} />
        {creator.headline && <p className={`mt-3 ${ts.headline} text-neutral-500 max-w-[300px] mx-auto leading-relaxed`}>{creator.headline}</p>}
        {creator.location && <p className="mt-2 text-xs text-neutral-400 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}

        {creator.socials.length > 0 && (
          <div className="flex items-center justify-center gap-2.5 my-5 flex-wrap">
            {creator.socials.map(s => (
              <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-110 hover:shadow-md transition-all"
                aria-label={`Visit ${s.platform}`}>
                <PlatformIcon platform={s.platform} size={18} className="text-neutral-400" />
              </a>
            ))}
          </div>
        )}

        {creator.bio && <p className={`${ts.bio} text-neutral-500 mb-5 leading-relaxed`}>{creator.bio}</p>}
        <BioLinksSection creator={creator} />
        <ProductsSection creator={creator} accent={accent} />

        {creator.services.length > 0 && (
          <div className="space-y-2.5 mb-5">
            <SectionLabel>Services</SectionLabel>
            {creator.services.map(s => (
              <a key={s.id} href={`/creators/${creator.slug}`}
                className={`block w-full ${btnClass(creator.linkBioButtonShape)} ${bs} bg-white shadow-sm border border-neutral-100 text-left hover:shadow-md hover:scale-[1.02] transition-all`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-700">{s.title}</span>
                  <span className="text-xs font-medium" style={{ color: accent }}>{priceLabel(s.price, s.deliveryDays)}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {creator.portfolio.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {creator.portfolio.slice(0, 6).map(p => (
              <div key={p.id} className="aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-neutral-100">
                {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-neutral-300">{p.title}</div>}
              </div>
            ))}
          </div>
        )}

        {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
        {isEmpty && <EmptyState />}
        {!isEmpty && (
          <a href={isUnclaimed ? `/u/${creator.slug}/claim` : `/creators/${creator.slug}`}
            className={`block w-full mt-8 font-semibold text-center ${btnClass(creator.linkBioButtonShape)} ${bs} shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-white`}
            style={{ background: accent }}>
            {isUnclaimed ? "Claim & Customize" : "View Full Profile"}
          </a>
        )}
        <Branding hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: MAGAZINE — Editorial layout, serif headings, clean
   ══════════════════════════════════════════════════════════════ */
function TemplateMagazine({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#171717";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const bs = BUTTON_SIZES[creator.linkBioButtonSize || "medium"] || BUTTON_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <div className="w-full lg:max-w-[540px] mx-auto px-6 pt-10 pb-10 min-h-screen">
        <div className="absolute top-3 right-4"><ShareBtn slug={creator.slug} /></div>

        {/* Masthead */}
        <div className="text-center border-b-2 border-neutral-900 pb-4 mb-6">
          <div className="border-b border-neutral-300 pb-3 mb-3">
            <div className="flex items-center justify-center gap-3 mb-2">
              {creator.avatar ? (
                <img src={creator.avatar} alt="" className={`${avatarSz} rounded-full object-cover`} />
              ) : (
                <div className={`${avatarSz} rounded-full bg-neutral-100 flex items-center justify-center`}>
                  <span className="text-3xl font-bold text-neutral-400">{(creator.name || "?")[0]}</span>
                </div>
              )}
            </div>
            <h1 className={`${ts.name} font-bold text-neutral-900 tracking-tight`} style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              {creator.name || "Your Name"}
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              {creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}
            </div>
          </div>
          <p className="text-xs text-neutral-400 uppercase tracking-[0.3em]">@{creator.slug}</p>
          <NicheRankBadge creator={creator} />
          {creator.headline && <p className={`mt-2 ${ts.headline} text-neutral-600 max-w-[360px] mx-auto leading-relaxed italic`} style={{ fontFamily: "Georgia, serif" }}>{creator.headline}</p>}
          {creator.location && <p className="mt-2 text-xs text-neutral-400 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
          {creator.isOnline && <OnlineDot />}
        </div>

        <Socials creator={creator} />
        {creator.bio && <p className={`${ts.bio} text-neutral-600 mb-6 leading-relaxed text-center`} style={{ fontFamily: "Georgia, serif" }}>{creator.bio}</p>}

        {/* Thin divider */}
        {creator.bio && <div className="flex items-center gap-4 mb-6"><div className="h-px flex-1 bg-neutral-200" /><span className="text-neutral-300 text-xs">&#9830;</span><div className="h-px flex-1 bg-neutral-200" /></div>}

        <BioLinksSection creator={creator} />
        <ProductsSection creator={creator} accent={accent} />

        {creator.services.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4"><div className="h-px flex-1 bg-neutral-200" /><span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Services</span><div className="h-px flex-1 bg-neutral-200" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {creator.services.map(s => (
                <a key={s.id} href={`/creators/${creator.slug}`}
                  className={`block w-full ${bs} border border-neutral-200 bg-white hover:border-neutral-400 transition-all ${btnClass(creator.linkBioButtonShape)}`}>
                  <div className="font-semibold text-neutral-900 text-sm" style={{ fontFamily: "Georgia, serif" }}>{s.title}</div>
                  <div className="text-xs mt-0.5 text-neutral-400">{priceLabel(s.price, s.deliveryDays)}</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {creator.portfolio.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
            {creator.portfolio.slice(0, 6).map(p => (
              <div key={p.id} className="aspect-[4/3] rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-neutral-300">{p.title}</div>}
              </div>
            ))}
          </div>
        )}

        {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
        {isEmpty && <EmptyState />}
        {!isEmpty && <CTAButton creator={creator} accent={accent} isUnclaimed={isUnclaimed} />}
        <Branding hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: RETRO — 90s/Y2K, bright colors, chunky offset shadows
   ══════════════════════════════════════════════════════════════ */
function TemplateRetro({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#ec4899";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const bs = BUTTON_SIZES[creator.linkBioButtonSize || "medium"] || BUTTON_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className="min-h-screen" style={{ background: "#fff200" }}>
      <div className={`w-full lg:max-w-[460px] mx-auto px-5 pt-12 pb-10 min-h-screen ${align} flex flex-col ${justify}`}>
        <div className="absolute top-3 right-4"><ShareBtn slug={creator.slug} /></div>

        {/* Avatar with chunky shadow */}
        <div className="relative inline-block mb-5">
          {creator.avatar ? (
            <img src={creator.avatar} alt="" className={`${avatarSz} rounded-xl object-cover border-4 border-black`} style={{ boxShadow: "5px 5px 0 #000" }} />
          ) : (
            <div className={`${avatarSz} rounded-xl border-4 border-black flex items-center justify-center`} style={{ boxShadow: "5px 5px 0 #000", background: "#00e5ff" }}>
              <span className="text-3xl font-black text-black">{(creator.name || "?")[0]}</span>
            </div>
          )}
          {creator.isOnline && <OnlineDot />}
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <h1 className={`${ts.name} font-black text-black uppercase tracking-tight`}>{creator.name || "Your Name"}</h1>
          {creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}
        </div>
        <p className="text-xs text-black/50 mt-0.5 font-bold uppercase tracking-widest">@{creator.slug}</p>
        <NicheRankBadge creator={creator} />
        {creator.headline && <p className={`mt-3 ${ts.headline} text-black/70 max-w-[300px] mx-auto leading-relaxed font-bold`}>{creator.headline}</p>}
        {creator.location && <p className="mt-2 text-xs text-black/40 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}

        {creator.socials.length > 0 && (
          <div className="flex items-center justify-center gap-2.5 my-5 flex-wrap">
            {creator.socials.map(s => (
              <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 rounded-lg bg-white border-3 border-black flex items-center justify-center hover:scale-110 transition-all"
                style={{ boxShadow: "3px 3px 0 #000", borderWidth: "3px" }}
                aria-label={`Visit ${s.platform}`}>
                <PlatformIcon platform={s.platform} size={18} className="text-black" />
              </a>
            ))}
          </div>
        )}

        {creator.bio && (
          <div className="bg-white border-3 border-black rounded-xl p-4 mb-5 text-left" style={{ boxShadow: "4px 4px 0 #000", borderWidth: "3px" }}>
            <p className={`${ts.bio} text-black/80 leading-relaxed`}>{creator.bio}</p>
          </div>
        )}

        <BioLinksSection creator={creator} />
        <ProductsSection creator={creator} accent={accent} />

        {creator.services.length > 0 && (
          <div className="space-y-3 mb-5">
            {creator.services.map((s, i) => {
              const colors = ["#00e5ff", "#ff6ec7", "#7fff00", "#ff4500"];
              const bg = colors[i % colors.length];
              return (
                <a key={s.id} href={`/creators/${creator.slug}`}
                  className={`block w-full ${bs} ${btnClass(creator.linkBioButtonShape)} border-black font-bold text-black hover:translate-x-[2px] hover:translate-y-[2px] transition-all`}
                  style={{ background: bg, boxShadow: "4px 4px 0 #000", borderWidth: "3px" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm uppercase">{s.title}</span>
                    <span className="text-xs">{priceLabel(s.price, s.deliveryDays)}</span>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {creator.portfolio.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {creator.portfolio.slice(0, 6).map(p => (
              <div key={p.id} className="aspect-square rounded-lg overflow-hidden border-2 border-black" style={{ boxShadow: "3px 3px 0 #000" }}>
                {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#00e5ff] flex items-center justify-center text-xs text-black/40 font-bold">{p.title}</div>}
              </div>
            ))}
          </div>
        )}

        {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
        {isEmpty && <EmptyState />}
        {!isEmpty && (
          <a href={isUnclaimed ? `/u/${creator.slug}/claim` : `/creators/${creator.slug}`}
            className={`block w-full mt-8 font-black text-center ${btnClass(creator.linkBioButtonShape)} ${bs} border-black uppercase tracking-wider hover:translate-x-[2px] hover:translate-y-[2px] transition-all`}
            style={{ background: "#ff6ec7", boxShadow: "5px 5px 0 #000", borderWidth: "3px", color: "#000" }}>
            {isUnclaimed ? "Claim & Customize" : "View Full Profile"}
          </a>
        )}
        <Branding hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: MIDNIGHT — Deep navy, star dots, silver/white, elegant
   ══════════════════════════════════════════════════════════════ */
function TemplateMidnight({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#818cf8";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#0a0e27" }}>
      {/* Star dots via radial gradients */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 70% 40%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 90% 80%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 20% 90%, rgba(255,255,255,0.2) 0%, transparent 100%), radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 80% 15%, rgba(255,255,255,0.25) 0%, transparent 100%), radial-gradient(1.5px 1.5px at 45% 45%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 15% 55%, rgba(255,255,255,0.35) 0%, transparent 100%)",
        backgroundSize: "200px 200px",
      }} />
      {/* Subtle blue glow at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-[40%] pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />

      <div className={`relative z-10 w-full lg:max-w-[460px] mx-auto px-5 pt-12 pb-10 min-h-screen ${align} flex flex-col ${justify}`}>
        <div className="absolute top-3 right-4"><ShareBtn slug={creator.slug} light /></div>

        <div className="relative inline-block mb-5">
          {creator.avatar ? (
            <img src={creator.avatar} alt="" className={`${avatarSz} rounded-full object-cover shadow-2xl ring-2 ring-white/10`} />
          ) : (
            <div className={`${avatarSz} rounded-full bg-white/5 flex items-center justify-center ring-2 ring-white/10`}>
              <span className="text-3xl font-bold text-white/40">{(creator.name || "?")[0]}</span>
            </div>
          )}
          {creator.isOnline && <span className="absolute bottom-0 right-0 flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-4 w-4 bg-emerald-500 ring-2 ring-[#0a0e27]" /></span>}
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <h1 className={`${ts.name} font-bold text-white/90 tracking-tight`}>{creator.name || "Your Name"}</h1>
          {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
        </div>
        <p className="text-xs text-white/25 mt-0.5 tracking-wider">@{creator.slug}</p>
        <NicheRankBadge creator={creator} light />
        {creator.headline && <p className={`mt-3 ${ts.headline} text-white/40 max-w-[300px] mx-auto leading-relaxed`}>{creator.headline}</p>}
        {creator.location && <p className="mt-2 text-xs text-white/20 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}

        <Socials creator={creator} light />
        {creator.bio && <p className={`${ts.bio} text-white/35 mb-5 leading-relaxed`}>{creator.bio}</p>}
        <BioLinksSection creator={creator} light />
        <ProductsSection creator={creator} light accent={accent} />

        {creator.services.length > 0 && (
          <div className="space-y-2.5 mb-5">
            <SectionLabel light>Services</SectionLabel>
            {creator.services.map(s => (
              <a key={s.id} href={`/creators/${creator.slug}`}
                className={`block w-full ${btnClass(creator.linkBioButtonShape)} px-6 py-4 min-h-[56px] bg-white/[0.04] border border-white/[0.08] text-left transition-all hover:scale-[1.02] hover:border-indigo-400/30`}
                style={{ transition: "all 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 25px ${accent}15`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                <div className="font-semibold text-white/80 text-sm">{s.title}</div>
                <div className="text-xs mt-0.5 text-white/25">{priceLabel(s.price, s.deliveryDays)}</div>
              </a>
            ))}
          </div>
        )}

        {creator.portfolio.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {creator.portfolio.slice(0, 6).map(p => (
              <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
                {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-white/10">{p.title}</div>}
              </div>
            ))}
          </div>
        )}

        {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
        {isEmpty && <EmptyState light />}
        {!isEmpty && <CTAButton creator={creator} light accent={accent} isUnclaimed={isUnclaimed} />}
        <Branding light hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: CLAY — Soft 3D neumorphism, tactile clay buttons
   ══════════════════════════════════════════════════════════════ */
function TemplateClay({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#6366f1";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const bs = BUTTON_SIZES[creator.linkBioButtonSize || "medium"] || BUTTON_SIZES.medium;
  const bg = "#e0e0e0";
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div className={`w-full lg:max-w-[460px] mx-auto px-5 pt-12 pb-10 min-h-screen ${align} flex flex-col ${justify}`}>
        <div className="absolute top-3 right-4"><ShareBtn slug={creator.slug} /></div>

        <div className="relative inline-block mb-5">
          {creator.avatar ? (
            <img src={creator.avatar} alt="" className={`${avatarSz} rounded-full object-cover`} style={{ boxShadow: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff" }} />
          ) : (
            <div className={`${avatarSz} rounded-full flex items-center justify-center`} style={{ background: bg, boxShadow: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff" }}>
              <span className="text-3xl font-bold text-neutral-400">{(creator.name || "?")[0]}</span>
            </div>
          )}
          {creator.isOnline && <OnlineDot />}
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <h1 className={`${ts.name} font-bold text-neutral-700 tracking-tight`}>{creator.name || "Your Name"}</h1>
          {creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}
        </div>
        <p className="text-xs text-neutral-400 mt-0.5">@{creator.slug}</p>
        <NicheRankBadge creator={creator} />
        {creator.headline && <p className={`mt-3 ${ts.headline} text-neutral-500 max-w-[300px] mx-auto leading-relaxed`}>{creator.headline}</p>}
        {creator.location && <p className="mt-2 text-xs text-neutral-400 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}

        {creator.socials.length > 0 && (
          <div className="flex items-center justify-center gap-3 my-5 flex-wrap">
            {creator.socials.map(s => (
              <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl flex items-center justify-center hover:scale-105 transition-all"
                style={{ background: bg, boxShadow: "5px 5px 10px #bebebe, -5px -5px 10px #ffffff" }}
                aria-label={`Visit ${s.platform}`}>
                <PlatformIcon platform={s.platform} size={18} className="text-neutral-500" />
              </a>
            ))}
          </div>
        )}

        {creator.bio && <p className={`${ts.bio} text-neutral-500 mb-5 leading-relaxed`}>{creator.bio}</p>}
        <BioLinksSection creator={creator} />
        <ProductsSection creator={creator} accent={accent} />

        {creator.services.length > 0 && (
          <div className="space-y-3 mb-5">
            <SectionLabel>Services</SectionLabel>
            {creator.services.map(s => (
              <a key={s.id} href={`/creators/${creator.slug}`}
                className={`block w-full ${btnClass(creator.linkBioButtonShape)} ${bs} text-left transition-all hover:scale-[1.02]`}
                style={{ background: bg, boxShadow: "6px 6px 12px #bebebe, -6px -6px 12px #ffffff" }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-700">{s.title}</span>
                  <span className="text-xs font-medium" style={{ color: accent }}>{priceLabel(s.price, s.deliveryDays)}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {creator.portfolio.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {creator.portfolio.slice(0, 6).map(p => (
              <div key={p.id} className="aspect-square rounded-2xl overflow-hidden" style={{ boxShadow: "5px 5px 10px #bebebe, -5px -5px 10px #ffffff" }}>
                {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-neutral-300" style={{ background: bg }}>{p.title}</div>}
              </div>
            ))}
          </div>
        )}

        {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
        {isEmpty && <EmptyState />}
        {!isEmpty && (
          <a href={isUnclaimed ? `/u/${creator.slug}/claim` : `/creators/${creator.slug}`}
            className={`block w-full mt-8 font-semibold text-center ${btnClass(creator.linkBioButtonShape)} ${bs} text-white transition-all hover:scale-[1.02]`}
            style={{ background: accent, boxShadow: "6px 6px 12px #bebebe, -6px -6px 12px #ffffff" }}>
            {isUnclaimed ? "Claim & Customize" : "View Full Profile"}
          </a>
        )}
        <Branding hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: GRADIENT MESH — Multi-color mesh bg, white blur cards
   ══════════════════════════════════════════════════════════════ */
function TemplateGradientMesh({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#ec4899";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mesh gradient background */}
      <div className="fixed inset-0 z-0" style={{
        background: "#fafafa",
      }}>
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(at 0% 0%, #ec4899aa 0%, transparent 50%), radial-gradient(at 100% 0%, #3b82f6aa 0%, transparent 50%), radial-gradient(at 100% 100%, #10b981aa 0%, transparent 50%), radial-gradient(at 0% 100%, #f59e0baa 0%, transparent 50%), radial-gradient(at 50% 50%, #8b5cf6aa 0%, transparent 50%)",
        }} />
      </div>

      <div className={`relative z-10 w-full lg:max-w-[460px] mx-auto px-5 pt-12 pb-10 min-h-screen ${align} flex flex-col ${justify}`}>
        <div className="absolute top-3 right-4"><ShareBtn slug={creator.slug} /></div>

        {/* Frosted card container */}
        <div className={`bg-white/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-white/80 ${align}`}>
          <div className="relative inline-block mb-4">
            {creator.avatar ? (
              <img src={creator.avatar} alt="" className={`${avatarSz} rounded-full object-cover shadow-lg ring-4 ring-white/80`} />
            ) : (
              <div className={`${avatarSz} rounded-full bg-white/80 shadow-lg flex items-center justify-center ring-4 ring-white/80`}>
                <span className="text-3xl font-bold text-neutral-400">{(creator.name || "?")[0]}</span>
              </div>
            )}
            {creator.isOnline && <OnlineDot />}
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <h1 className={`${ts.name} font-bold text-neutral-800 tracking-tight`}>{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">@{creator.slug}</p>
          <NicheRankBadge creator={creator} />
          {creator.headline && <p className={`mt-3 ${ts.headline} text-neutral-500 max-w-[300px] mx-auto leading-relaxed`}>{creator.headline}</p>}
          {creator.location && <p className="mt-2 text-xs text-neutral-400 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}

          <Socials creator={creator} />
          {creator.bio && <p className={`${ts.bio} text-neutral-500 mb-4 leading-relaxed`}>{creator.bio}</p>}
        </div>

        {/* Content below the card, floating on the mesh */}
        <div className="mt-5 space-y-3">
          <BioLinksSection creator={creator} />
          <ProductsSection creator={creator} accent={accent} />

          {creator.services.length > 0 && (
            <div className="space-y-2.5">
              <SectionLabel>Services</SectionLabel>
              {creator.services.map(s => (
                <a key={s.id} href={`/creators/${creator.slug}`}
                  className={`block w-full ${btnClass(creator.linkBioButtonShape)} px-6 py-4 min-h-[56px] bg-white/70 backdrop-blur-md border border-white/60 text-left shadow-sm hover:shadow-md hover:scale-[1.02] transition-all`}>
                  <div className="font-semibold text-neutral-800 text-sm">{s.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: accent }}>{priceLabel(s.price, s.deliveryDays)}</div>
                </a>
              ))}
            </div>
          )}

          {creator.portfolio.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {creator.portfolio.slice(0, 6).map(p => (
                <div key={p.id} className="aspect-square rounded-2xl overflow-hidden bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm">
                  {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-neutral-300">{p.title}</div>}
                </div>
              ))}
            </div>
          )}

          {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
          {isEmpty && <EmptyState />}
          {!isEmpty && (
            <a href={isUnclaimed ? `/u/${creator.slug}/claim` : `/creators/${creator.slug}`}
              className={`block w-full mt-6 font-semibold text-center ${btnClass(creator.linkBioButtonShape)} py-4 px-5 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-white`}
              style={{ background: accent }}>
              {isUnclaimed ? "Claim & Customize" : "View Full Profile"}
            </a>
          )}
          <Branding hidden={creator.hideBranding} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: TRADER — Financial traders, crypto, forex, stocks
   ══════════════════════════════════════════════════════════════ */
function TemplateTrader({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#00c087";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const bs = BUTTON_SIZES[creator.linkBioButtonSize || "medium"] || BUTTON_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className="min-h-screen relative" style={{ background: "#0b0e11", fontFamily: "'SF Mono', 'Fira Code', 'Courier New', monospace" }}>
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-20 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,192,135,0.08) 3px, rgba(0,192,135,0.08) 4px)" }} />

      <div className={`relative z-10 w-full lg:max-w-[480px] mx-auto px-5 pt-8 pb-10 min-h-screen ${align} flex flex-col ${justify}`}>
        <div className="absolute top-3 right-4"><ShareBtn slug={creator.slug} light /></div>

        {/* Ticker header bar */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#00c087]/20">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest" style={{ color: "#00c087" }}>${(creator.slug || "TICKER").toUpperCase()}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00c087]/10 text-[#00c087]">LIVE</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-neutral-500">followers</span>
            <span className="text-[10px] font-bold text-[#00c087]">{creator.socials.reduce((sum, s) => sum + (parseInt(s.followers?.replace(/[^0-9]/g, '') || '0') || 0), 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Avatar with green ring */}
        <div className="text-center mb-5">
          {creator.avatar ? (
            <img src={creator.avatar} alt="" className={`${avatarSz} rounded-full object-cover mx-auto ring-2 ring-[#00c087]/60 ring-offset-2 ring-offset-[#0b0e11]`} />
          ) : (
            <div className={`${avatarSz} rounded-full mx-auto bg-[#00c087]/10 flex items-center justify-center ring-2 ring-[#00c087]/60 ring-offset-2 ring-offset-[#0b0e11]`}>
              <span className="text-3xl font-bold text-[#00c087]/70">{(creator.name || "?")[0]}</span>
            </div>
          )}
          {creator.isOnline && <OnlineDot />}
        </div>

        {/* Name / ticker */}
        <div className="text-center mb-5">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className={`${ts.name} font-bold tracking-tight`} style={{ color: "#e8eaed" }}>{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
          </div>
          <p className="text-[10px] mt-1 tracking-widest" style={{ color: "#00c087", opacity: 0.5 }}>@{creator.slug}</p>
          <NicheRankBadge creator={creator} light />
          {creator.headline && <p className={`mt-2 ${ts.headline} text-neutral-400 max-w-[300px] mx-auto`}>{creator.headline}</p>}
          {creator.location && <p className="mt-1 text-xs text-neutral-500 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
        </div>

        {/* Bio in terminal box */}
        {creator.bio && (
          <div className="mb-6 p-3 border border-[#00c087]/15 bg-[#00c087]/[0.03] rounded">
            <p className={`${ts.bio} leading-relaxed`} style={{ color: "#00c087", opacity: 0.8 }}>{creator.bio}</p>
          </div>
        )}

        {creator.socials.length > 0 && (
          <div className="flex items-center justify-center gap-3 my-5 flex-wrap">
            {creator.socials.map(s => (
              <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer"
                className="w-11 h-11 rounded border border-[#00c087]/20 flex items-center justify-center hover:bg-[#00c087]/10 transition-colors"
                aria-label={`Visit ${s.platform}`}>
                <PlatformIcon platform={s.platform} size={17} className="text-[#00c087]/60" />
              </a>
            ))}
          </div>
        )}

        <BioLinksSection creator={creator} light />
        <ProductsSection creator={creator} light accent={accent} />

        {creator.services.length > 0 && (
          <div className="space-y-2 mb-6">
            <div className="text-[10px] font-bold tracking-widest" style={{ color: "#00c087", opacity: 0.4 }}>POSITIONS</div>
            {creator.services.map(s => (
              <a key={s.id} href={`/creators/${creator.slug}`}
                className={`block w-full ${bs} ${btnClass(creator.linkBioButtonShape)} border border-[#00c087]/20 hover:bg-[#00c087]/10 transition-colors text-left`}
                style={{ color: "#e8eaed" }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{s.title}</span>
                  <span className="text-xs font-bold" style={{ color: "#00c087" }}>${priceLabel(s.price, s.deliveryDays)}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {creator.portfolio.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 mb-6">
            {creator.portfolio.slice(0, 6).map(p => (
              <div key={p.id} className="aspect-square overflow-hidden rounded border border-[#00c087]/10">
                {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" style={{ filter: "brightness(0.85)" }} /> : <div className="w-full h-full bg-[#00c087]/5 flex items-center justify-center text-xs text-[#00c087]/20">{p.title}</div>}
              </div>
            ))}
          </div>
        )}

        {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
        {isEmpty && <EmptyState light />}
        {!isEmpty && (
          <a href={`/creators/${creator.slug}`}
            className={`block w-full mt-8 font-bold text-center ${btnClass(creator.linkBioButtonShape)} ${bs} border-2 transition-colors hover:bg-[#00c087]/10`}
            style={{ borderColor: "#00c087", color: "#00c087" }}>
            VIEW FULL PROFILE
          </a>
        )}
        <Branding light hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: EDUCATOR — Course sellers, coaches, mentors
   ══════════════════════════════════════════════════════════════ */
function TemplateEducator({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#d97706";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const bs = BUTTON_SIZES[creator.linkBioButtonSize || "medium"] || BUTTON_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #fffbf0 0%, #fff 40%, #fef3e2 100%)" }}>
      <div className={`w-full lg:max-w-[480px] mx-auto px-5 pt-12 pb-10 min-h-screen ${align} flex flex-col ${justify}`}>
        <div className="absolute top-3 right-4"><ShareBtn slug={creator.slug} /></div>

        {/* Avatar */}
        <div className="relative inline-block mb-5">
          {creator.avatar ? (
            <img src={creator.avatar} alt="" className={`${avatarSz} rounded-full object-cover shadow-md ring-4 ring-amber-100`} />
          ) : (
            <div className={`${avatarSz} rounded-full bg-amber-50 shadow-md flex items-center justify-center ring-4 ring-amber-100`}>
              <span className="text-3xl font-bold text-amber-400">{(creator.name || "?")[0]}</span>
            </div>
          )}
          {creator.isOnline && <OnlineDot />}
        </div>

        {/* Name */}
        <div className="flex items-center justify-center gap-1.5">
          <h1 className={`${ts.name} font-bold text-neutral-800 tracking-tight`} style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>{creator.name || "Your Name"}</h1>
          {creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}
        </div>
        <p className="text-xs text-neutral-400 mt-0.5">@{creator.slug}</p>
        <NicheRankBadge creator={creator} />
        {creator.headline && <p className={`mt-2 ${ts.headline} text-neutral-500 max-w-[320px] mx-auto leading-relaxed`}>{creator.headline}</p>}
        {creator.location && <p className="mt-2 text-xs text-neutral-400 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}

        {/* Bio as featured mission statement */}
        {creator.bio && (
          <div className="my-6 p-5 bg-white rounded-xl shadow-sm border border-amber-100 relative">
            <span className="absolute -top-3 left-4 text-4xl leading-none font-serif" style={{ color: accent, opacity: 0.3 }}>&ldquo;</span>
            <p className={`${ts.bio} text-neutral-600 leading-relaxed italic`} style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>{creator.bio}</p>
            <span className="absolute -bottom-3 right-4 text-4xl leading-none font-serif" style={{ color: accent, opacity: 0.3 }}>&rdquo;</span>
          </div>
        )}

        <Socials creator={creator} />

        <BioLinksSection creator={creator} />
        <ProductsSection creator={creator} accent={accent} />

        {creator.services.length > 0 && (
          <div className="space-y-3 mb-6">
            <SectionLabel>Offerings</SectionLabel>
            {creator.services.map(s => (
              <a key={s.id} href={`/creators/${creator.slug}`}
                className={`block w-full ${bs} ${btnClass(creator.linkBioButtonShape)} bg-white shadow-sm text-left hover:shadow-md hover:scale-[1.01] transition-all border-l-4`}
                style={{ borderLeftColor: accent }}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-neutral-800">{s.title}</span>
                    {s.description && <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{s.description}</p>}
                  </div>
                  <span className="text-xs font-bold shrink-0 ml-3" style={{ color: accent }}>{priceLabel(s.price, s.deliveryDays)}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {creator.portfolio.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            {creator.portfolio.slice(0, 6).map(p => (
              <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-white shadow-sm border border-amber-50">
                {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-neutral-300">{p.title}</div>}
              </div>
            ))}
          </div>
        )}

        {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
        {isEmpty && <EmptyState />}
        {!isEmpty && (
          <a href={isUnclaimed ? `/u/${creator.slug}/claim` : `/creators/${creator.slug}`}
            className={`block w-full mt-8 font-semibold text-center ${btnClass(creator.linkBioButtonShape)} ${bs} shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-white`}
            style={{ background: accent }}>
            {isUnclaimed ? "Claim & Customize" : "View Full Profile"}
          </a>
        )}
        <Branding hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: DEVELOPER — Coders, engineers, open source devs
   ══════════════════════════════════════════════════════════════ */
function TemplateDeveloper({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#7dcfff";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const bs = BUTTON_SIZES[creator.linkBioButtonSize || "medium"] || BUTTON_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  /* Decorative GitHub-style dots */
  const dots = Array.from({ length: 35 }, (_, i) => {
    const colors = ["#9ece6a", "#7dcfff", "#bb9af7", "#ff9e64", "#1a1b26"];
    return colors[Math.floor(Math.random() * colors.length)];
  });

  return (
    <div className="min-h-screen relative" style={{ background: "#1a1b26", fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace" }}>
      <div className={`relative z-10 w-full lg:max-w-[480px] mx-auto px-5 pt-8 pb-10 min-h-screen ${align} flex flex-col ${justify}`}>
        <div className="absolute top-3 right-4"><ShareBtn slug={creator.slug} light /></div>

        {/* GitHub-style activity dots */}
        <div className="flex flex-wrap gap-[3px] mb-6 max-w-[200px]">
          {dots.map((color, i) => (
            <div key={i} className="w-[10px] h-[10px] rounded-sm" style={{ background: color, opacity: color === "#1a1b26" ? 0.3 : 0.6 }} />
          ))}
        </div>

        {/* Profile as code comment */}
        <div className="mb-1 text-xs" style={{ color: "#565f89" }}>{"// @"}{creator.slug}</div>

        <div className="flex items-start gap-4 mb-5">
          {creator.avatar ? (
            <img src={creator.avatar} alt="" className={`${avatarSz} rounded-lg object-cover border border-[#7dcfff]/20`} />
          ) : (
            <div className={`${avatarSz} rounded-lg bg-[#7dcfff]/10 flex items-center justify-center border border-[#7dcfff]/20`}>
              <span className="text-3xl font-bold text-[#7dcfff]/60">{(creator.name || "?")[0]}</span>
            </div>
          )}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className={`${ts.name} font-bold`} style={{ color: "#c0caf5" }}>{creator.name || "Your Name"}</h1>
              {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
            </div>
            <NicheRankBadge creator={creator} light />
            {creator.headline && <p className={`mt-1 ${ts.headline}`} style={{ color: "#9ece6a", opacity: 0.8 }}>{creator.headline}</p>}
            {creator.location && <p className="mt-1 text-xs" style={{ color: "#565f89" }}>{creator.location}</p>}
            {creator.isOnline && <OnlineDot />}
          </div>
        </div>

        {/* Bio in code block */}
        {creator.bio && (
          <div className="mb-6 p-4 rounded-lg border border-[#292e42]" style={{ background: "#16161e" }}>
            <div className="text-[10px] mb-2" style={{ color: "#565f89" }}>/** README.md */</div>
            <p className={`${ts.bio} leading-relaxed`} style={{ color: "#a9b1d6" }}>{creator.bio}</p>
          </div>
        )}

        {creator.socials.length > 0 && (
          <div className="flex items-center gap-3 my-5 flex-wrap">
            {creator.socials.map(s => (
              <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer"
                className="w-11 h-11 rounded-lg border border-[#292e42] flex items-center justify-center hover:bg-[#292e42] transition-colors"
                aria-label={`Visit ${s.platform}`}>
                <PlatformIcon platform={s.platform} size={17} className="text-[#7dcfff]/60" />
              </a>
            ))}
          </div>
        )}

        <BioLinksSection creator={creator} light />
        <ProductsSection creator={creator} light accent={accent} />

        {creator.services.length > 0 && (
          <div className="space-y-2 mb-6">
            <div className="text-xs font-bold" style={{ color: "#565f89" }}>{"{"} services {"}"}</div>
            {creator.services.map((s, i) => (
              <a key={s.id} href={`/creators/${creator.slug}`}
                className={`block w-full ${bs} ${btnClass(creator.linkBioButtonShape)} border border-[#292e42] hover:bg-[#292e42]/60 transition-colors text-left`}
                style={{ background: "#16161e" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs shrink-0" style={{ color: "#bb9af7" }}>const</span>
                    <span className="text-sm truncate" style={{ color: "#c0caf5" }}>{s.title}</span>
                  </div>
                  <span className="text-xs font-bold shrink-0 ml-2" style={{ color: "#9ece6a" }}>{priceLabel(s.price, s.deliveryDays)}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {creator.portfolio.length > 0 && (
          <div className="mb-6">
            <div className="text-xs mb-2" style={{ color: "#565f89" }}>{"{"} portfolio {"}"}</div>
            <div className="grid grid-cols-3 gap-1.5">
              {creator.portfolio.slice(0, 6).map(p => (
                <div key={p.id} className="aspect-square overflow-hidden rounded-lg border border-[#292e42]">
                  {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" style={{ filter: "brightness(0.85)" }} /> : <div className="w-full h-full bg-[#16161e] flex items-center justify-center text-xs" style={{ color: "#565f89" }}>{p.title}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
        {isEmpty && <EmptyState light />}
        {!isEmpty && (
          <a href={`/creators/${creator.slug}`}
            className={`block w-full mt-8 font-bold text-center ${btnClass(creator.linkBioButtonShape)} ${bs} border transition-colors hover:bg-[#7dcfff]/10`}
            style={{ borderColor: "#7dcfff", color: "#7dcfff" }}>
            $ view --full-profile
          </a>
        )}
        <Branding light hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: EXECUTIVE — Business owners, founders, CEOs
   ══════════════════════════════════════════════════════════════ */
function TemplateExecutive({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#1e3a5f";
  const ts = TEXT_SIZES[creator.linkBioTextSize || "medium"] || TEXT_SIZES.medium;
  const avatarSz = AVATAR_SIZES[creator.linkBioAvatarSize || "medium"] || AVATAR_SIZES.medium;
  const bs = BUTTON_SIZES[creator.linkBioButtonSize || "medium"] || BUTTON_SIZES.medium;
  const justify = CONTENT_JUSTIFY[creator.linkBioContentPosition || 'top'] || CONTENT_JUSTIFY.top;
  const align = CONTENT_ALIGN[creator.linkBioContentAlign || 'center'] || CONTENT_ALIGN.center;

  return (
    <div className="min-h-screen" style={{ background: "#ffffff" }}>
      <div className={`w-full lg:max-w-[480px] mx-auto px-6 pt-16 pb-12 min-h-screen ${align} flex flex-col ${justify}`}>
        <div className="absolute top-3 right-4"><ShareBtn slug={creator.slug} /></div>

        {/* Large centered avatar */}
        <div className="text-center mb-8">
          {creator.avatar ? (
            <img src={creator.avatar} alt="" className={`${avatarSz} rounded-full object-cover mx-auto shadow-lg`} />
          ) : (
            <div className={`${avatarSz} rounded-full mx-auto shadow-lg flex items-center justify-center`} style={{ background: "#f1f5f9" }}>
              <span className="text-3xl font-bold" style={{ color: accent }}>{(creator.name || "?")[0]}</span>
            </div>
          )}
          {creator.isOnline && <OnlineDot />}
        </div>

        {/* Name in serif */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className={`${ts.name} font-bold tracking-tight`} style={{ color: "#0f1729", fontFamily: "'Georgia', 'Cambria', serif" }}>{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}
          </div>
          <p className="text-xs mt-1 tracking-widest uppercase" style={{ color: "#94a3b8" }}>@{creator.slug}</p>
          <NicheRankBadge creator={creator} />
          {creator.headline && <p className={`mt-3 ${ts.headline} max-w-[320px] mx-auto leading-relaxed`} style={{ color: "#64748b" }}>{creator.headline}</p>}
          {creator.location && <p className="mt-2 text-xs flex items-center justify-center gap-1" style={{ color: "#94a3b8" }}><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
        </div>

        {/* Thin divider */}
        <div className="w-12 h-px mx-auto mb-6" style={{ background: "#cbd5e1" }} />

        {/* Bio */}
        {creator.bio && (
          <p className={`${ts.bio} text-center leading-relaxed mb-6 max-w-[340px] mx-auto`} style={{ color: "#475569" }}>{creator.bio}</p>
        )}

        <Socials creator={creator} />

        <BioLinksSection creator={creator} />
        <ProductsSection creator={creator} accent={accent} />

        {creator.services.length > 0 && (
          <div className="mb-6 w-full">
            <SectionLabel>Services</SectionLabel>
            <div className="divide-y" style={{ borderColor: "#e2e8f0" }}>
              {creator.services.map(s => (
                <a key={s.id} href={`/creators/${creator.slug}`}
                  className={`block w-full ${btnClass(creator.linkBioButtonShape)} py-4 hover:bg-slate-50/50 transition-colors text-left`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: "#0f1729" }}>{s.title}</span>
                    <span className="text-xs font-medium" style={{ color: accent }}>{priceLabel(s.price, s.deliveryDays)}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {creator.portfolio.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {creator.portfolio.slice(0, 6).map(p => (
              <div key={p.id} className="aspect-square rounded-lg overflow-hidden shadow-sm">
                {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-50 flex items-center justify-center text-xs text-slate-300">{p.title}</div>}
              </div>
            ))}
          </div>
        )}

        {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
        {isEmpty && <EmptyState />}
        {!isEmpty && (
          <a href={isUnclaimed ? `/u/${creator.slug}/claim` : `/creators/${creator.slug}`}
            className={`block w-full mt-8 font-medium text-center ${btnClass(creator.linkBioButtonShape)} ${bs} border transition-colors hover:bg-slate-50`}
            style={{ borderColor: accent, color: accent }}>
            {isUnclaimed ? "Claim & Customize" : "View Full Profile"}
          </a>
        )}
        <Branding hidden={creator.hideBranding} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════════════════ */
const TEMPLATES: Record<string, React.ComponentType<{ creator: Creator; isUnclaimed?: boolean }>> = {
  minimal: TemplateMinimal,
  glass: TemplateGlass,
  bold: TemplateBold,
  showcase: TemplateShowcase,
  neon: TemplateNeon,
  collage: TemplateCollage,
  bento: TemplateBento,
  split: TemplateSplit,
  founder: TemplateFounder,
  custom: TemplateCustom,
  aurora: TemplateAurora,
  brutalist: TemplateBrutalist,
  sunset: TemplateSunset,
  terminal: TemplateTerminal,
  pastel: TemplatePastel,
  magazine: TemplateMagazine,
  retro: TemplateRetro,
  midnight: TemplateMidnight,
  clay: TemplateClay,
  "gradient-mesh": TemplateGradientMesh,
  trader: TemplateTrader,
  educator: TemplateEducator,
  developer: TemplateDeveloper,
  executive: TemplateExecutive,
};

/* ── Intro Animation Overlay ── */
function IntroAnimation({
  animType,
  creatorName,
  accent,
  onComplete,
}: {
  animType: string;
  creatorName: string;
  accent: string;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<"playing" | "fading" | "done">("playing");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const playTimer = setTimeout(() => setPhase("fading"), 1700);
    const doneTimer = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 2200);
    return () => { clearTimeout(playTimer); clearTimeout(doneTimer); };
  }, [onComplete]);

  if (phase === "done") return null;

  const ac = accent || "#6366f1";
  const fadeClass = phase === "fading" ? "intro-anim-fade-out" : "";

  const renderOverlay = () => {
    switch (animType) {
      case "fade-up":
        return (
          <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${fadeClass}`} style={{ background: "rgba(0,0,0,0.6)" }}>
            <style>{`
              @keyframes introFadeUp { 0% { opacity:0; transform:translateY(60px); } 60% { opacity:1; transform:translateY(-8px); } 100% { opacity:1; transform:translateY(0); } }
              .intro-fade-up-content { animation: introFadeUp 1.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
              .intro-anim-fade-out { animation: introOverlayOut 0.5s ease forwards; }
              @keyframes introOverlayOut { to { opacity:0; } }
            `}</style>
            <div className="intro-fade-up-content text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4" style={{ background: ac, boxShadow: `0 0 40px ${ac}80` }} />
              <div className="text-white/60 text-sm tracking-widest uppercase">Welcome</div>
            </div>
          </div>
        );

      case "scale-in":
        return (
          <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${fadeClass}`} style={{ background: "rgba(0,0,0,0.6)" }}>
            <style>{`
              @keyframes introScaleIn { 0% { opacity:0; transform:scale(0.7); filter:blur(20px); } 50% { opacity:1; filter:blur(8px); } 100% { opacity:1; transform:scale(1); filter:blur(0); } }
              .intro-scale-in-content { animation: introScaleIn 1.5s cubic-bezier(0.16,1,0.3,1) forwards; }
              .intro-anim-fade-out { animation: introOverlayOut 0.5s ease forwards; }
              @keyframes introOverlayOut { to { opacity:0; } }
            `}</style>
            <div className="intro-scale-in-content">
              <div className="w-24 h-24 rounded-2xl mx-auto" style={{ background: `linear-gradient(135deg, ${ac}, ${ac}88)`, boxShadow: `0 0 60px ${ac}60` }} />
            </div>
          </div>
        );

      case "spotlight":
        return (
          <div className={`fixed inset-0 z-[9999] ${fadeClass}`}>
            <style>{`
              @keyframes introSpotlight { 0% { clip-path: circle(0% at 50% 50%); } 100% { clip-path: circle(75% at 50% 50%); } }
              .intro-spotlight-mask { animation: introSpotlight 1.6s cubic-bezier(0.4,0,0.2,1) forwards; }
              .intro-anim-fade-out { animation: introOverlayOut 0.5s ease forwards; }
              @keyframes introOverlayOut { to { opacity:0; } }
              @keyframes spotlightPulse { 0%,100% { box-shadow: 0 0 80px ${ac}40; } 50% { box-shadow: 0 0 120px ${ac}80; } }
            `}</style>
            <div className="fixed inset-0 bg-black/60" />
            <div className="fixed inset-0 intro-spotlight-mask" style={{ background: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.6) 100%)` }} />
            <div className="fixed inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full" style={{ background: ac, boxShadow: `0 0 100px 40px ${ac}60`, animation: "spotlightPulse 1s ease infinite" }} />
            </div>
          </div>
        );

      case "glitch":
        return (
          <div className={`fixed inset-0 z-[9999] overflow-hidden ${fadeClass}`} style={{ background: "rgba(0,0,0,0.7)" }}>
            <style>{`
              @keyframes glitchSlice1 { 0%,100% { transform:translateX(0); } 10% { transform:translateX(-20px); } 20% { transform:translateX(15px); } 30% { transform:translateX(-10px); } 40% { transform:translateX(5px); } 50% { transform:translateX(0); } }
              @keyframes glitchSlice2 { 0%,100% { transform:translateX(0); } 15% { transform:translateX(25px); } 25% { transform:translateX(-18px); } 35% { transform:translateX(8px); } 45% { transform:translateX(0); } }
              @keyframes glitchFlicker { 0%,4%,8%,12%,16%,100% { opacity:1; } 2%,6%,10%,14% { opacity:0.3; } }
              @keyframes glitchRGB { 0% { text-shadow: -3px 0 #ff0040, 3px 0 #00ff90; } 25% { text-shadow: 3px 0 #ff0040, -3px 0 #00ff90; } 50% { text-shadow: -2px 2px #ff0040, 2px -2px #00ff90; } 75% { text-shadow: 1px -1px #ff0040, -1px 1px #00ff90; } 100% { text-shadow: 0 0 #ff0040, 0 0 #00ff90; } }
              .intro-glitch-text { animation: glitchRGB 0.4s steps(4) 3, glitchFlicker 1.5s ease forwards; font-size:clamp(2rem,8vw,5rem); font-weight:900; color:#fff; letter-spacing:-0.02em; }
              .intro-glitch-bar { position:absolute; left:0; right:0; height:3px; }
              .intro-anim-fade-out { animation: introOverlayOut 0.3s ease forwards; }
              @keyframes introOverlayOut { to { opacity:0; } }
            `}</style>
            <div className="flex items-center justify-center h-full relative">
              <div className="intro-glitch-text text-center" style={{ animation: "glitchRGB 0.4s steps(4) 3, glitchFlicker 1.5s ease forwards" }}>
                {creatorName || "LOADING"}
              </div>
              {[15, 30, 50, 65, 80].map((top, i) => (
                <div key={i} className="intro-glitch-bar" style={{ top: `${top}%`, background: i % 2 === 0 ? "#ff004040" : "#00ff9040", animation: `glitchSlice${(i % 2) + 1} 0.3s steps(2) ${i * 0.1}s 3` }} />
              ))}
            </div>
          </div>
        );

      case "particle-burst":
        return (
          <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${fadeClass}`} style={{ background: "rgba(0,0,0,0.6)" }}>
            <style>{`
              @keyframes particleBurst { 0% { transform: translate(0,0) scale(1); opacity:1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity:0; } }
              .intro-particle { position:absolute; border-radius:50%; animation: particleBurst 1.4s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
              @keyframes burstCore { 0% { transform:scale(0); opacity:1; } 40% { transform:scale(1.2); opacity:1; } 100% { transform:scale(2); opacity:0; } }
              .intro-burst-core { animation: burstCore 1.5s ease forwards; }
              .intro-anim-fade-out { animation: introOverlayOut 0.5s ease forwards; }
              @keyframes introOverlayOut { to { opacity:0; } }
            `}</style>
            <div className="intro-burst-core w-20 h-20 rounded-full" style={{ background: `radial-gradient(circle, ${ac}, transparent)`, boxShadow: `0 0 60px ${ac}80` }} />
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i / 24) * 360;
              const dist = 120 + Math.random() * 160;
              const tx = Math.cos((angle * Math.PI) / 180) * dist;
              const ty = Math.sin((angle * Math.PI) / 180) * dist;
              const size = 4 + Math.random() * 8;
              const delay = Math.random() * 0.3;
              return (
                <div key={i} className="intro-particle" style={{ width: size, height: size, background: i % 3 === 0 ? ac : i % 3 === 1 ? "#fff" : `${ac}88`, "--tx": `${tx}px`, "--ty": `${ty}px`, animationDelay: `${delay}s` } as React.CSSProperties} />
              );
            })}
          </div>
        );

      case "typewriter":
        return (
          <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${fadeClass}`} style={{ background: "rgba(0,0,0,0.6)" }}>
            <style>{`
              @keyframes typewriterCursor { 0%,100% { opacity:1; } 50% { opacity:0; } }
              .intro-typewriter-cursor { display:inline-block; width:3px; height:1em; vertical-align:text-bottom; margin-left:4px; animation: typewriterCursor 0.6s step-end infinite; }
              .intro-anim-fade-out { animation: introOverlayOut 0.5s ease forwards; }
              @keyframes introOverlayOut { to { opacity:0; } }
            `}</style>
            <TypewriterText name={creatorName || "Creator"} accent={ac} />
          </div>
        );

      case "wave":
        return (
          <div className={`fixed inset-0 z-[9999] ${fadeClass}`}>
            <style>{`
              @keyframes introWaveSweep { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
              .intro-wave-bar { animation: introWaveSweep 1.5s cubic-bezier(0.65,0,0.35,1) forwards; }
              .intro-anim-fade-out { animation: introOverlayOut 0.4s ease forwards; }
              @keyframes introOverlayOut { to { opacity:0; } }
            `}</style>
            <div className="fixed inset-0 bg-black/60" />
            {[0, 0.05, 0.1, 0.15, 0.2].map((delay, i) => (
              <div key={i} className="intro-wave-bar fixed inset-0" style={{ background: i === 0 ? ac : i < 3 ? `${ac}${["cc","88","44"][i]}` : "transparent", animationDelay: `${delay}s`, zIndex: 10000 - i }} />
            ))}
          </div>
        );

      case "neon":
        return (
          <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${fadeClass}`} style={{ background: "rgba(0,0,0,0.7)" }}>
            <style>{`
              @keyframes neonFlicker { 0%,19%,21%,23%,25%,54%,56%,100% { text-shadow: 0 0 10px ${ac}80, 0 0 20px ${ac}60, 0 0 40px ${ac}40, 0 0 80px ${ac}20; opacity:1; } 20%,24%,55% { text-shadow: none; opacity:0.6; } }
              @keyframes neonGlow { 0% { opacity:0; transform:scale(0.95); } 30% { opacity:1; transform:scale(1); } 100% { opacity:1; transform:scale(1); } }
              .intro-neon-text { animation: neonGlow 0.8s ease forwards, neonFlicker 1.5s ease-in-out forwards; font-size:clamp(2rem,8vw,5rem); font-weight:800; letter-spacing:-0.02em; }
              .intro-anim-fade-out { animation: introOverlayOut 0.5s ease forwards; }
              @keyframes introOverlayOut { to { opacity:0; } }
            `}</style>
            <div className="intro-neon-text text-center px-8" style={{ color: ac }}>
              {creatorName || "Creator"}
            </div>
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, ${ac}15, transparent 70%)` }} />
          </div>
        );

      case "cinema":
        return (
          <div className={`fixed inset-0 z-[9999] pointer-events-none ${fadeClass}`}>
            <style>{`
              @keyframes cinemaBarTop { 0% { transform:translateY(0); } 100% { transform:translateY(-100%); } }
              @keyframes cinemaBarBottom { 0% { transform:translateY(0); } 100% { transform:translateY(100%); } }
              @keyframes cinemaFade { 0% { opacity:1; } 100% { opacity:0; } }
              .intro-cinema-top { animation: cinemaBarTop 0.8s cubic-bezier(0.65,0,0.35,1) 1s forwards; }
              .intro-cinema-bottom { animation: cinemaBarBottom 0.8s cubic-bezier(0.65,0,0.35,1) 1s forwards; }
              .intro-cinema-overlay { animation: cinemaFade 0.6s ease 0.8s forwards; }
              .intro-anim-fade-out { animation: introOverlayOut 0.3s ease forwards; }
              @keyframes introOverlayOut { to { opacity:0; } }
            `}</style>
            <div className="intro-cinema-overlay fixed inset-0 bg-black/50" />
            <div className="intro-cinema-top fixed top-0 left-0 right-0 h-[15vh] bg-black" />
            <div className="intro-cinema-bottom fixed bottom-0 left-0 right-0 h-[15vh] bg-black" />
          </div>
        );

      case "morph":
        return (
          <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${fadeClass}`} style={{ background: "rgba(0,0,0,0.6)" }}>
            <style>{`
              @keyframes morphBlob { 0% { border-radius:40% 60% 60% 40%/60% 40% 60% 40%; transform:scale(0.3); } 33% { border-radius:60% 40% 40% 60%/40% 60% 40% 60%; transform:scale(0.8); } 66% { border-radius:50% 50% 40% 60%/60% 40% 50% 50%; transform:scale(3); } 100% { border-radius:0; transform:scale(12); opacity:0; } }
              .intro-morph-blob { animation: morphBlob 1.7s cubic-bezier(0.4,0,0.2,1) forwards; }
              .intro-anim-fade-out { animation: introOverlayOut 0.3s ease forwards; }
              @keyframes introOverlayOut { to { opacity:0; } }
            `}</style>
            <div className="intro-morph-blob w-24 h-24" style={{ background: `linear-gradient(135deg, ${ac}, ${ac}aa, ${ac}55)`, boxShadow: `0 0 60px ${ac}60` }} />
          </div>
        );

      case "trading-candles":
        return (
          <div className={`fixed inset-0 z-[9999] flex items-end justify-center gap-3 px-8 pb-[30vh] ${fadeClass}`} style={{ background: "rgba(0,0,0,0.6)" }}>
            <style>{`
              @keyframes candleGrow { 0% { transform:scaleY(0); opacity:0; } 100% { transform:scaleY(1); opacity:1; } }
              @keyframes candleFadeAll { 0%,70% { opacity:1; } 100% { opacity:0; } }
              .intro-candle { transform-origin:bottom; animation: candleGrow 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards; }
              .intro-candles-wrap { animation: candleFadeAll 1.7s ease forwards; }
              .intro-anim-fade-out { animation: introOverlayOut 0.3s ease forwards; }
              @keyframes introOverlayOut { to { opacity:0; } }
            `}</style>
            <div className="intro-candles-wrap flex items-end gap-2 sm:gap-3">
              {[40, 55, 35, 70, 60, 85, 50, 95, 75, 100, 80, 110].map((h, i) => {
                const green = i > 0 && h > [40, 55, 35, 70, 60, 85, 50, 95, 75, 100, 80, 110][i - 1];
                const color = green || i === 0 ? "#22c55e" : "#ef4444";
                const wickH = 8 + Math.random() * 12;
                return (
                  <div key={i} className="intro-candle flex flex-col items-center" style={{ animationDelay: `${i * 0.08}s`, opacity: 0, animationFillMode: "forwards" }}>
                    <div style={{ width: 2, height: wickH, background: color + "80" }} />
                    <div className="rounded-sm" style={{ width: `clamp(12px, 3vw, 24px)`, height: h, background: color, boxShadow: `0 0 8px ${color}40` }} />
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div ref={overlayRef}>{renderOverlay()}</div>;
}

/* ── Typewriter sub-component ── */
function TypewriterText({ name, accent }: { name: string; accent: string }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      indexRef.current++;
      if (indexRef.current <= name.length) {
        setDisplayed(name.slice(0, indexRef.current));
      } else {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [name]);

  return (
    <div className="text-center px-8">
      <span style={{ fontSize: "clamp(2rem,8vw,5rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
        {displayed}
      </span>
      <span className="intro-typewriter-cursor" style={{ background: accent }} />
    </div>
  );
}

/* ── Main export ── */
export function LinkInBioContent({ creator, isUnclaimed }: { creator: Creator; isUnclaimed?: boolean }) {
  const template = creator.linkBioTemplate || "minimal";
  const font = FONT_MAP[creator.linkBioFont] || FONT_MAP.jakarta;
  const textColor = creator.linkBioTextColor || "";
  const animType = creator.linkBioIntroAnim || "none";

  const [animDone, setAnimDone] = useState(() => {
    if (!animType || animType === "none") return true;
    if (typeof window !== "undefined") {
      const key = `intro-anim-${creator.slug}`;
      if (sessionStorage.getItem(key)) return true;
    }
    return false;
  });

  const handleAnimComplete = useCallback(() => {
    setAnimDone(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`intro-anim-${creator.slug}`, "1");
    }
  }, [creator.slug]);

  const TemplateComponent = TEMPLATES[template] || TemplateCustom;

  // Build wrapper styles from new fields
  const wrapperStyle: React.CSSProperties = {
    fontFamily: font,
    color: textColor || undefined,
    fontWeight: creator.linkBioFontWeight || undefined,
    letterSpacing: LETTER_SPACING_CSS[creator.linkBioLetterSpacing] || undefined,
    // CSS custom properties for templates to consume
    "--bio-page-padding": `${creator.linkBioPagePadding ?? 16}px`,
    "--bio-section-gap": `${creator.linkBioSectionGap ?? 16}px`,
    "--bio-container-width": CONTAINER_WIDTH_CSS[creator.linkBioContainerWidth] || "480px",
    "--bio-font-size": FONT_SIZE_CSS[creator.linkBioFontSize] || "1rem",
  } as React.CSSProperties;

  return (
    <div className="pt-0" style={wrapperStyle}>
      {!animDone && (
        <IntroAnimation
          animType={animType}
          creatorName={creator.name}
          accent={creator.linkBioAccent}
          onComplete={handleAnimComplete}
        />
      )}
      <div>
        <TemplateComponent creator={creator} isUnclaimed={isUnclaimed} />
      </div>
    </div>
  );
}
