"use client";

import { useState, useEffect } from "react";
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

  if (bgType === "video" && bgVideo) {
    return <div className="fixed inset-0 z-0"><video autoPlay muted loop playsInline className="w-full h-full object-cover"><source src={bgVideo} type="video/mp4" /></video><div className="absolute inset-0 bg-black/40" /></div>;
  }
  if (bgType === "image" && bgValue) {
    return <div className="fixed inset-0 z-0"><img src={bgValue} alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/30" /></div>;
  }
  if (bgType === "collage" && bgImages && bgImages.length > 0) {
    const tiles = Array.from({ length: 12 }, (_, i) => bgImages[i % bgImages.length]);
    return (
      <div className="fixed inset-0 z-0 grid grid-cols-3 sm:grid-cols-4 auto-rows-fr">
        {tiles.map((img, i) => <div key={i} className="relative overflow-hidden"><img src={img} alt="" className="w-full h-full object-cover scale-110" style={{ filter: "brightness(0.35) saturate(0.7)" }} /></div>)}
      </div>
    );
  }
  if (bgType === "gradient" && bgValue) {
    return <div className="fixed inset-0 z-0" style={{ background: bgValue }} />;
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
function Branding({ light }: { light?: boolean }) {
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

  return (
    <div className="space-y-3 my-5">
      {creator.bioLinks.filter(l => l.isVisible).map(link => {
        const platform = getPlatform(link.url);
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick(link.id)}
            className={`group flex items-center gap-3 w-full px-5 py-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${shape} ${light
              ? "bg-white/[0.08] backdrop-blur-md border border-white/[0.12] hover:bg-white/[0.14]"
              : "bg-white border border-neutral-200/80 hover:border-neutral-300 shadow-sm"
            }`}
          >
            {link.thumbnailUrl ? (
              <img src={link.thumbnailUrl} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
            ) : platform ? (
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${light ? "bg-white/10" : "bg-neutral-100"}`}>
                {platform === "calendar" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={light ? "white" : "#555"} strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg>
                ) : (
                  <PlatformIcon platform={platform} size={18} className={light ? "text-white/70" : "text-neutral-500"} />
                )}
              </div>
            ) : null}
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-sm ${light ? "text-white" : "text-neutral-900"}`}>{link.title}</div>
              <div className={`text-[11px] mt-0.5 truncate ${light ? "text-white/30" : "text-neutral-400"}`}>{link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 transition-all duration-200 ${light ? "text-white/20 group-hover:text-white/50" : "text-neutral-300 group-hover:text-neutral-500"} group-hover:translate-x-0.5`}>
              <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        );
      })}
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
   Avatar component — shared across templates
   ══════════════════════════════════════════════════════ */
function Avatar({ creator, size = "md", shape = "circle", light, accentBorder }: {
  creator: Creator; size?: "sm" | "md" | "lg"; shape?: "circle" | "square"; light?: boolean; accentBorder?: string;
}) {
  const sizes = { sm: "w-16 h-16", md: "w-24 h-24", lg: "w-28 h-28" };
  const s = sizes[size];
  const r = shape === "square" ? "rounded-2xl" : "rounded-full";
  const border = accentBorder ? { border: `3px solid ${accentBorder}` } : {};
  if (creator.avatar) return <img src={creator.avatar} alt="" className={`${s} ${r} object-cover shadow-lg`} style={border} />;
  return <div className={`${s} ${r} flex items-center justify-center shadow-lg ${light ? "bg-white/10" : "bg-neutral-100"}`} style={border}><span className={`text-3xl font-bold ${light ? "text-white/60" : "text-neutral-400"}`}>{(creator.name || "?")[0]}</span></div>;
}

/* ══════════════════════════════════════════════════════
   Socials row — shared
   ══════════════════════════════════════════════════════ */
function Socials({ creator, light, shape = "circle" }: { creator: Creator; light?: boolean; shape?: "circle" | "square" }) {
  if (creator.socials.length === 0) return null;
  const r = shape === "square" ? "rounded-xl" : "rounded-full";
  return (
    <div className="flex items-center justify-center gap-2.5 my-5 flex-wrap">
      {creator.socials.map(s => (
        <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${s.platform}`}
          className={`w-10 h-10 ${r} flex items-center justify-center hover:scale-110 transition-all ${light ? "bg-white/10 hover:bg-white/20" : "bg-neutral-100 hover:bg-neutral-200"}`}>
          <PlatformIcon platform={s.platform} size={18} className={light ? "text-white/80" : "text-neutral-600"} />
        </a>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Service card — shared
   ══════════════════════════════════════════════════════ */
function ServiceCard({ service, creator, light, accent }: { service: any; creator: Creator; light?: boolean; accent?: string }) {
  const btn = btnClass(creator.linkBioButtonShape);
  return (
    <a href={`/creators/${creator.slug}`} className={`group block w-full ${btn} px-5 py-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${light
      ? "bg-white/[0.06] backdrop-blur-md border border-white/[0.10] hover:bg-white/[0.12]"
      : "bg-white border border-neutral-200/80 shadow-sm hover:border-neutral-300"
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <div className={`font-semibold text-sm ${light ? "text-white" : "text-neutral-900"}`}>{service.title}</div>
          {service.description && <div className={`text-[11px] mt-0.5 line-clamp-1 ${light ? "text-white/30" : "text-neutral-400"}`}>{service.description}</div>}
        </div>
        <div className={`text-sm font-bold shrink-0 ml-3 ${light ? "text-white" : "text-neutral-900"}`}>{priceLabel(service.price, service.deliveryDays)}</div>
      </div>
    </a>
  );
}

/* ══════════════════════════════════════════════════════
   CTA button — shared
   ══════════════════════════════════════════════════════ */
function CTAButton({ creator, light, accent }: { creator: Creator; light?: boolean; accent?: string }) {
  const ac = accent || creator.linkBioAccent || "#171717";
  return (
    <a href={`/creators/${creator.slug}`}
      className="block w-full mt-8 font-semibold text-sm text-center rounded-2xl py-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl shadow-lg text-white"
      style={{ background: ac }}>
      View Full Profile
    </a>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: MINIMAL — "The Business Card"
   Warm ivory/cream bg, white card, elegant spacing, professional
   ══════════════════════════════════════════════════════════════ */
function TemplateMinimal({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasCustomBg = creator.linkBioBgType && creator.linkBioBgType !== "gradient";
  const accent = creator.linkBioAccent || "#171717";

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center sm:py-10 sm:px-4" style={{ background: hasCustomBg ? "transparent" : "linear-gradient(160deg, #fdf8f4 0%, #f5ede6 40%, #ebe3da 100%)" }}>
      {hasCustomBg && <BgLayer creator={creator} />}
      <div className={`w-full sm:max-w-[460px] sm:rounded-[2.5rem] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] bg-white min-h-screen sm:min-h-0 relative z-10 overflow-hidden ${hasCustomBg ? "sm:bg-white/95 sm:backdrop-blur-sm" : ""}`}>
        {/* Cover */}
        <div className="relative">
          {creator.cover ? (
            <div className="h-48 sm:rounded-t-[2.5rem] overflow-hidden">
              <img src={creator.cover} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-white" />
            </div>
          ) : (
            <div className="h-40 sm:h-44 sm:rounded-t-[2.5rem] relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}08 0%, ${accent}04 100%)` }}>
              <div className="absolute inset-0 bg-gradient-to-br from-stone-50/80 via-amber-50/40 to-orange-50/30" />
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
            </div>
          )}
          <div className="absolute top-4 right-4 z-10"><ShareBtn slug={creator.slug} /></div>
          <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
            <div className="p-1.5 bg-white rounded-full shadow-xl shadow-black/10">
              <Avatar creator={creator} size="lg" />
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-10 pt-[4.5rem] text-center">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}
          </div>
          <p className="text-xs text-neutral-400 mt-0.5 font-medium">@{creator.slug?.split("-")[0]}</p>
          {creator.headline && <p className="mt-3 text-sm text-neutral-500 max-w-[300px] mx-auto leading-relaxed">{creator.headline}</p>}
          {creator.location && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-100 rounded-full">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-neutral-400"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
              <span className="text-xs text-neutral-500 font-medium">{creator.location}</span>
            </div>
          )}
          {creator.isOnline && <OnlineDot />}

          <Socials creator={creator} />
          {creator.bio && <p className="text-sm text-neutral-500 mb-4 leading-relaxed">{creator.bio}</p>}
          <BioLinksSection creator={creator} />

          {creator.services.length > 0 && (
            <>
              <SectionLabel>Services</SectionLabel>
              <div className="space-y-2.5">
                {creator.services.map(s => <ServiceCard key={s.id} service={s} creator={creator} />)}
              </div>
            </>
          )}

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
          {!isEmpty && <CTAButton creator={creator} accent={accent} />}
          <Branding />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: GLASS — "The Creator"
   Deep space gradient, floating orbs, frosted glass panels, premium app feel
   ══════════════════════════════════════════════════════════════ */
function TemplateGlass({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasCustomBg = !!creator.linkBioBgType;
  const accent = creator.linkBioAccent || "#818cf8";

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

      <div className="relative z-10 max-w-[480px] mx-auto px-5 sm:px-6 pt-12 pb-10 min-h-screen flex flex-col">
        {/* Main glass identity card */}
        <div className="text-center mb-6 bg-white/[0.06] backdrop-blur-2xl rounded-[2rem] p-8 sm:p-10 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          {/* Avatar with accent glow ring */}
          <div className="relative inline-block mb-5">
            <div className="absolute -inset-4 rounded-full opacity-30 blur-2xl" style={{ background: accent }} />
            {creator.avatar ? (
              <img src={creator.avatar} alt="" className="relative w-28 h-28 rounded-full object-cover ring-[3px] ring-white/15 shadow-2xl" />
            ) : (
              <div className="relative w-28 h-28 rounded-full bg-white/[0.08] backdrop-blur-xl flex items-center justify-center ring-[3px] ring-white/15 shadow-2xl">
                <span className="text-4xl font-bold text-white/50">{(creator.name || "?")[0]}</span>
              </div>
            )}
            {creator.isOnline && <span className="absolute bottom-1 right-1 flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-4 w-4 bg-emerald-500 ring-2 ring-[#150d30]" /></span>}
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
          </div>
          <p className="text-xs text-white/30 mt-1 font-medium">@{creator.slug?.split("-")[0]}</p>
          {creator.headline && <p className="mt-3 text-sm text-white/45 max-w-[320px] mx-auto leading-relaxed">{creator.headline}</p>}
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
            <p className="text-sm text-white/40 text-center leading-relaxed">{creator.bio}</p>
          </div>
        )}
        <BioLinksSection creator={creator} light />

        <div className="flex-1 space-y-3">
          {creator.services.length > 0 && (
            <>
              <SectionLabel light>Services</SectionLabel>
              {creator.services.map(s => <ServiceCard key={s.id} service={s} creator={creator} light />)}
            </>
          )}

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
          {!isEmpty && <CTAButton creator={creator} light accent={accent} />}
        </div>
        <Branding light />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: BOLD — "The Statement"
   Pure black, accent color highlights, high contrast, dramatic
   ══════════════════════════════════════════════════════════════ */
function TemplateBold({ creator }: { creator: Creator }) {
  const accent = creator.linkBioAccent || "#6366f1";
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasCustomBg = !!creator.linkBioBgType;

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center sm:py-10 sm:px-4" style={{ background: hasCustomBg ? "transparent" : "#0a0a0a" }}>
      {hasCustomBg && <BgLayer creator={creator} />}
      <div className="w-full sm:max-w-[460px] sm:rounded-[2.5rem] bg-neutral-950 min-h-screen sm:min-h-0 relative z-10 overflow-hidden" style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 25px 60px -12px ${accent}20` }}>
        {/* Accent stripe at top */}
        <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

        <div className="absolute top-5 right-5 z-10"><ShareBtn slug={creator.slug} light /></div>

        <div className="px-6 sm:px-8 pb-10 pt-10 text-center">
          {/* Square avatar with accent border and glow */}
          <div className="relative inline-block">
            <div className="absolute -inset-3 rounded-2xl opacity-20 blur-xl" style={{ background: accent }} />
            <Avatar creator={creator} size="md" shape="square" light accentBorder={accent} />
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <h1 className="font-display text-2xl font-black text-white tracking-tight">{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
          </div>
          <p className="text-xs mt-1 font-semibold tracking-wide" style={{ color: accent }}>@{creator.slug?.split("-")[0]}</p>
          {creator.headline && <p className="mt-3 text-sm text-neutral-400 max-w-[320px] mx-auto font-medium leading-relaxed">{creator.headline}</p>}
          {creator.location && <p className="mt-2 text-xs text-neutral-600 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
          {creator.isOnline && <OnlineDot light />}

          <Socials creator={creator} light shape="square" />
          {creator.bio && <p className="text-sm text-neutral-500 mb-5 leading-relaxed">{creator.bio}</p>}
          <BioLinksSection creator={creator} light />

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
                  <a key={s.id} href={`/creators/${creator.slug}`} className={`group block w-full bg-white/[0.03] border border-white/[0.06] ${btnClass(creator.linkBioButtonShape)} px-5 py-4 sm:py-5 text-left hover:bg-white/[0.06] hover:border-white/[0.10] hover:scale-[1.02] transition-all duration-200`}>
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
          {!isEmpty && <CTAButton creator={creator} light accent={accent} />}
          <Branding light />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: SHOWCASE — "The Portfolio"
   Light bg, portfolio-first, prominent cover, visual-first layout
   ══════════════════════════════════════════════════════════════ */
function TemplateShowcase({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasCustomBg = !!creator.linkBioBgType;
  const accent = creator.linkBioAccent || "#171717";

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center sm:py-10 sm:px-4" style={{ background: hasCustomBg ? "transparent" : "linear-gradient(160deg, #f8f9fa 0%, #e9ecef 100%)" }}>
      {hasCustomBg && <BgLayer creator={creator} />}
      <div className="w-full sm:max-w-[480px] sm:rounded-[2rem] sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] bg-white min-h-screen sm:min-h-0 relative z-10 overflow-hidden">
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
          <div className="absolute top-4 right-4 z-10"><ShareBtn slug={creator.slug} /></div>
        </div>

        <div className="px-6 sm:px-8 pb-10 -mt-10 relative">
          {/* Profile row — left-aligned editorial */}
          <div className="flex items-end gap-4 mb-5">
            <div className="shrink-0 p-1 bg-white rounded-2xl shadow-lg">
              <Avatar creator={creator} shape="square" />
            </div>
            <div className="pb-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">{creator.name || "Your Name"}</h1>
                {creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}
              </div>
              <p className="text-xs text-neutral-400 font-medium">@{creator.slug?.split("-")[0]}</p>
              {creator.location && <p className="mt-0.5 text-xs text-neutral-400 flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
            </div>
          </div>

          {creator.isOnline && <OnlineDot />}
          {creator.headline && <p className="text-sm text-neutral-500 leading-relaxed mb-4">{creator.headline}</p>}

          <Socials creator={creator} shape="square" />
          {creator.bio && <p className="text-sm text-neutral-500 mb-5 leading-relaxed">{creator.bio}</p>}
          <BioLinksSection creator={creator} />

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
                  <a key={s.id} href={`/creators/${creator.slug}`} className={`group block w-full ${btnClass(creator.linkBioButtonShape)} bg-white border border-neutral-200/80 shadow-sm px-5 py-4 sm:py-5 hover:border-neutral-300 hover:shadow-md hover:scale-[1.02] transition-all duration-200`}>
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
          {!isEmpty && <CTAButton creator={creator} accent={accent} />}
          <Branding />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: NEON — "The Gamer"
   Pure black, accent glow, double ring avatar, cyberpunk aesthetic
   ══════════════════════════════════════════════════════════════ */
function TemplateNeon({ creator }: { creator: Creator }) {
  const accent = creator.linkBioAccent || "#22d3ee";
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasCustomBg = !!creator.linkBioBgType;

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center sm:py-10 sm:px-4" style={{ background: hasCustomBg ? "transparent" : "#000000" }}>
      {hasCustomBg && <BgLayer creator={creator} />}

      <div className="w-full sm:max-w-[460px] sm:rounded-[2rem] bg-[#0a0a0a] min-h-screen sm:min-h-0 relative z-10 overflow-hidden" style={{ boxShadow: `0 0 80px -20px ${accent}50, inset 0 1px 0 rgba(255,255,255,0.05)` }}>
        {/* Neon scanline at top */}
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 10%, ${accent} 50%, transparent 90%)`, opacity: 0.7 }} />
        {/* Subtle scanline texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)" }} />
        {/* Corner glow accents */}
        <div className="absolute top-0 left-0 w-40 h-40 opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle at 0 0, ${accent} 0%, transparent 70%)` }} />
        <div className="absolute bottom-0 right-0 w-40 h-40 opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle at 100% 100%, ${accent} 0%, transparent 70%)` }} />

        <div className="absolute top-4 right-4 z-10"><ShareBtn slug={creator.slug} light /></div>

        <div className="px-6 sm:px-8 pb-10 pt-10 text-center relative">
          {/* Avatar with double neon ring: outer accent, inner dark */}
          <div className="relative inline-block">
            <div className="absolute -inset-5 rounded-full opacity-25 blur-2xl" style={{ background: accent }} />
            <div className="relative p-[3px] rounded-full" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}60, transparent 70%)` }}>
              <div className="p-[3px] rounded-full bg-[#0a0a0a]">
                {creator.avatar ? (
                  <img src={creator.avatar} alt="" className="w-24 h-24 rounded-full object-cover" style={{ boxShadow: `0 0 30px ${accent}25` }} />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#111] flex items-center justify-center">
                    <span className="text-3xl font-bold text-white/50">{(creator.name || "?")[0]}</span>
                  </div>
                )}
              </div>
            </div>
            {creator.isOnline && <span className="absolute bottom-1 right-1 flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-4 w-4 bg-emerald-500 ring-2 ring-[#0a0a0a]" /></span>}
          </div>

          <div className="mt-5 flex items-center justify-center gap-1.5">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
          </div>
          <p className="text-xs mt-1 font-mono font-semibold tracking-widest" style={{ color: accent }}>@{creator.slug?.split("-")[0]}</p>
          {creator.headline && <p className="mt-3 text-sm text-neutral-400 max-w-[300px] mx-auto leading-relaxed">{creator.headline}</p>}
          {creator.location && <p className="mt-2 text-xs text-neutral-600 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}

          {/* Accent-tinted social circles */}
          {creator.socials.length > 0 && (
            <div className="flex items-center justify-center gap-2.5 my-6 flex-wrap">
              {creator.socials.map(s => (
                <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${s.platform}`}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200"
                  style={{ border: `1px solid ${accent}20`, background: `${accent}0a`, boxShadow: `0 0 15px ${accent}08` }}>
                  <PlatformIcon platform={s.platform} size={16} className="text-neutral-400" />
                </a>
              ))}
            </div>
          )}

          {creator.bio && <p className="text-sm text-neutral-500 mb-5 leading-relaxed">{creator.bio}</p>}
          <BioLinksSection creator={creator} light />

          {/* Services with accent glow on hover */}
          {creator.services.length > 0 && (
            <div className="space-y-2.5 mb-5">
              {creator.services.map(s => (
                <a key={s.id} href={`/creators/${creator.slug}`}
                  className={`group block w-full ${btnClass(creator.linkBioButtonShape)} px-5 py-4 sm:py-5 text-center transition-all duration-200 hover:scale-[1.02]`}
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
          {!isEmpty && <CTAButton creator={creator} light accent={accent} />}
          <Branding light />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: COLLAGE — "The Photographer"
   Portfolio tiles as darkened bg, frosted content panel, moody editorial
   ══════════════════════════════════════════════════════════════ */
function TemplateCollage({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
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

      <div className="relative z-10 max-w-[480px] mx-auto px-4 sm:px-5 pt-12 pb-10 min-h-screen flex flex-col">
        {/* Frosted content panel */}
        <div className="bg-black/30 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 sm:p-8 mb-5 text-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
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
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
          </div>
          <p className="text-xs text-white/30 mt-1 font-medium">@{creator.slug?.split("-")[0]}</p>
          {creator.headline && <p className="mt-3 text-sm text-white/50 leading-relaxed max-w-[300px] mx-auto">{creator.headline}</p>}
          {creator.location && <p className="mt-2 text-xs text-white/30 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
          <Socials creator={creator} light />
        </div>

        {/* Bio in frosted panel */}
        {creator.bio && (
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/[0.08] px-5 py-4 mb-5">
            <p className="text-sm text-white/40 text-center leading-relaxed">{creator.bio}</p>
          </div>
        )}
        <BioLinksSection creator={creator} light />

        <div className="flex-1 space-y-2.5">
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
          {!isEmpty && <CTAButton creator={creator} light />}
        </div>
        <Branding light />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: BENTO — "The Grid"
   Apple-style bento grid, dark bg, accent-bordered cells
   ══════════════════════════════════════════════════════════════ */
function TemplateBento({ creator }: { creator: Creator }) {
  const accent = creator.linkBioAccent || "#6366f1";
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasPortfolio = creator.portfolio.length > 0;
  const hasCustomBg = !!creator.linkBioBgType;

  return (
    <div className="min-h-screen p-3 sm:p-5" style={{ background: hasCustomBg ? "transparent" : "#0a0a0a" }}>
      {hasCustomBg && <BgLayer creator={creator} />}
      <div className="absolute top-4 right-4 z-20"><ShareBtn slug={creator.slug} light /></div>
      <div className="max-w-[520px] mx-auto relative z-10">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 auto-rows-[85px]">
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
                  <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">{creator.name || "Your Name"}</h1>
                  {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
                </div>
                <p className="text-xs text-white/40 mt-0.5">@{creator.slug?.split("-")[0]}</p>
                {creator.headline && <p className="text-xs text-white/50 mt-1 line-clamp-2 leading-relaxed">{creator.headline}</p>}
                {creator.isOnline && <div className="flex items-center gap-1 mt-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /><span className="text-[9px] text-emerald-400 font-medium">Online</span></div>}
              </div>
            </div>
          </div>

          {/* Bio — col-span-4 */}
          {creator.bio && (
            <div className="col-span-4 row-span-1 rounded-2xl bg-neutral-900 border border-neutral-800 px-5 flex items-center">
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{creator.bio}</p>
            </div>
          )}

          {/* Social icons — col-span-2 */}
          {creator.socials.length > 0 && (
            <div className="col-span-2 row-span-1 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center gap-2 px-3">
              {creator.socials.slice(0, 5).map(s => (
                <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${s.platform}`}
                  className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 hover:scale-110 transition-all duration-200">
                  <PlatformIcon platform={s.platform} size={14} className="text-neutral-400" />
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

          {/* Portfolio items — col-span-2 row-span-2 each */}
          {hasPortfolio && creator.portfolio.slice(0, 4).map(p => (
            <div key={p.id} className="col-span-2 row-span-2 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 cursor-pointer group">
              {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs">{p.title}</div>}
            </div>
          ))}

          {/* Services — col-span-2 each with accent border */}
          {creator.services.map(s => (
            <a key={s.id} href={`/creators/${creator.slug}`}
              className="col-span-2 row-span-1 rounded-2xl px-4 flex items-center justify-between hover:bg-white/5 hover:scale-[1.02] transition-all duration-200"
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
            <a href={`/creators/${creator.slug}`}
              className="col-span-4 row-span-1 rounded-2xl font-semibold text-sm text-center flex items-center justify-center text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
              style={{ background: accent }}>
              View Full Profile
            </a>
          )}
          {isEmpty && (
            <a href="/dashboard" className="col-span-4 row-span-1 rounded-2xl bg-white font-semibold text-sm text-center flex items-center justify-center text-neutral-900 hover:bg-neutral-100 transition-all duration-200">
              Set Up Your Profile
            </a>
          )}
        </div>
        <Branding light />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: SPLIT — "The Magazine"
   Two-column: sticky hero left, scrollable content right, editorial feel
   ══════════════════════════════════════════════════════════════ */
function TemplateSplit({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#171717";
  const heroImage = creator.cover || (creator.portfolio.length > 0 && creator.portfolio[0].image) || null;

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
          <div className="absolute top-4 right-4 z-10"><ShareBtn slug={creator.slug} light /></div>
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 55% — scrollable content */}
        <div className="sm:w-[55%] sm:overflow-y-auto sm:h-screen">
          <div className="px-6 sm:px-8 lg:px-10 py-6 sm:py-10">
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
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">{creator.name || "Your Name"}</h1>
                    {creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">@{creator.slug?.split("-")[0]}</p>
                </div>
              </div>
              {creator.headline && <p className="text-sm text-neutral-600 leading-relaxed">{creator.headline}</p>}
              {creator.location && <p className="text-xs text-neutral-400 mt-1.5 flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
              {creator.isOnline && <OnlineDot />}
            </div>

            {/* Mobile extras (headline/location not in overlay) */}
            <div className="sm:hidden mb-5">
              {creator.headline && <p className="text-sm text-neutral-600 leading-relaxed">{creator.headline}</p>}
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
            {!isEmpty && <CTAButton creator={creator} accent={accent} />}
            <Branding />
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
function TemplateCustom({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const accent = creator.linkBioAccent || "#6366f1";
  const hasCustomBg = !!creator.linkBioBgType;
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
      <div className="relative z-10 max-w-[480px] mx-auto px-5 pt-14 pb-10 min-h-screen flex flex-col">
        <div className="text-center mb-8">
          {/* Avatar with glow ring on dark bg */}
          <div className="relative inline-block">
            {isDarkBg && <div className="absolute inset-0 rounded-full opacity-30 blur-xl" style={{ background: accent }} />}
            {creator.avatar ? (
              <img src={creator.avatar} alt="" className={`relative w-24 h-24 rounded-full object-cover shadow-2xl ${isDarkBg ? "ring-2 ring-white/20" : "ring-2 ring-neutral-200"}`} />
            ) : (
              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl ${isDarkBg ? "bg-white/10 backdrop-blur-xl ring-2 ring-white/20" : "bg-neutral-100 ring-2 ring-neutral-200"}`}><span className={`text-3xl font-bold ${isDarkBg ? "text-white/60" : "text-neutral-400"}`}>{(creator.name || "?")[0]}</span></div>
            )}
            {creator.isOnline && <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className={`relative rounded-full h-4 w-4 bg-emerald-500 ring-2 ${isDarkBg ? "ring-[#1a1040]" : "ring-white"}`} /></span>}
          </div>

          <div className="mt-5 flex items-center justify-center gap-1.5">
            <h1 className={`font-display text-2xl font-bold tracking-tight ${isDarkBg ? "text-white" : "text-neutral-900"}`}>{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge light={isDarkBg} />}{creator.isPro && <ProBadge />}
          </div>
          <p className={`text-xs mt-0.5 ${isDarkBg ? "text-white/40" : "text-neutral-400"}`}>@{creator.slug?.split("-")[0]}</p>
          {creator.headline && <p className={`mt-2 text-sm max-w-[320px] mx-auto leading-relaxed ${isDarkBg ? "text-white/50" : "text-neutral-600"}`}>{creator.headline}</p>}
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
        <div className="flex-1 space-y-3">
          {creator.services.map(s => <ServiceCard key={s.id} service={s} creator={creator} light={isDarkBg} accent={accent} />)}
          {creator.portfolio.length > 0 && <div className="grid grid-cols-3 gap-1.5 pt-2">{creator.portfolio.slice(0, 6).map(p => <div key={p.id} className={`aspect-square rounded-xl overflow-hidden ${isDarkBg ? "bg-white/5" : "bg-neutral-100"}`}>{p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center text-xs ${isDarkBg ? "text-white/20" : "text-neutral-300"}`}>{p.title}</div>}</div>)}</div>}
          {creator.calendarEnabled && <div className="my-4"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
          {isEmpty && <EmptyState light={isDarkBg} />}
          {!isEmpty && <CTAButton creator={creator} light={isDarkBg} accent={accent} />}
        </div>
        <Branding light={isDarkBg} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════════════════ */
const TEMPLATES: Record<string, React.ComponentType<{ creator: Creator }>> = {
  minimal: TemplateMinimal,
  glass: TemplateGlass,
  bold: TemplateBold,
  showcase: TemplateShowcase,
  neon: TemplateNeon,
  collage: TemplateCollage,
  bento: TemplateBento,
  split: TemplateSplit,
  custom: TemplateCustom,
  // All other template names map to custom (user-designed)
  aurora: TemplateCustom,
  brutalist: TemplateCustom,
  sunset: TemplateCustom,
  terminal: TemplateCustom,
  pastel: TemplateCustom,
  magazine: TemplateCustom,
  retro: TemplateCustom,
  midnight: TemplateCustom,
  clay: TemplateCustom,
  "gradient-mesh": TemplateCustom,
};

export function LinkInBioContent({ creator }: { creator: Creator }) {
  const template = creator.linkBioTemplate || "minimal";
  const font = FONT_MAP[creator.linkBioFont] || FONT_MAP.jakarta;
  const textColor = creator.linkBioTextColor || "";

  const TemplateComponent = TEMPLATES[template] || TemplateCustom;

  return (
    <div style={{ fontFamily: font, color: textColor || undefined }}>
      <TemplateComponent creator={creator} />
    </div>
  );
}
