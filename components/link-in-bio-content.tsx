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

  return (
    <div className="space-y-2.5 my-4">
      {creator.bioLinks.filter(l => l.isVisible).map(link => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick(link.id)}
          className={`group flex items-center gap-3 w-full px-4 py-3.5 transition-all hover:scale-[1.01] ${btnClass(creator.linkBioButtonShape)} ${cardCls(creator.linkBioCardStyle, !!light)}`}
        >
          {link.thumbnailUrl && (
            <img src={link.thumbnailUrl} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
          )}
          <div className="flex-1 min-w-0 text-center">
            <div className={`font-medium text-sm ${light ? "text-white" : "text-neutral-900"}`}>{link.title}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 ${light ? "text-white/30" : "text-neutral-300"} group-hover:translate-x-0.5 transition-transform`}>
            <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      ))}
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
  const card = cardCls(creator.linkBioCardStyle, !!light);
  const btn = btnClass(creator.linkBioButtonShape);
  return (
    <a href={`/creators/${creator.slug}`} className={`block w-full ${btn} px-5 py-4 text-center transition-all hover:scale-[1.01] ${card}`}>
      <div className={`font-medium text-[15px] ${light ? "text-white" : "text-neutral-900"}`}>{service.title}</div>
      <div className={`text-xs mt-0.5 ${light ? "text-white/40" : "text-neutral-400"}`}>{priceLabel(service.price, service.deliveryDays)}</div>
    </a>
  );
}

/* ══════════════════════════════════════════════════════
   CTA button — shared
   ══════════════════════════════════════════════════════ */
function CTAButton({ creator, light, accent }: { creator: Creator; light?: boolean; accent?: string }) {
  return (
    <a href={`/creators/${creator.slug}`}
      className={`block w-full mt-6 font-semibold text-sm text-center rounded-full py-3.5 transition-all shadow-lg ${light ? "bg-white text-neutral-900 hover:bg-neutral-100" : "bg-neutral-900 text-white hover:opacity-90"}`}
      style={accent ? { background: accent, color: "#fff" } : {}}>
      View Full Profile
    </a>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: MINIMAL — Clean white card, simple and elegant
   ══════════════════════════════════════════════════════════════ */
function TemplateMinimal({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasCustomBg = creator.linkBioBgType && creator.linkBioBgType !== "gradient";

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center sm:py-8 sm:px-4" style={{ background: hasCustomBg ? "transparent" : "#e5e5e5" }}>
      {hasCustomBg && <BgLayer creator={creator} />}
      <div className={`w-full sm:max-w-[460px] sm:rounded-3xl sm:shadow-2xl bg-white min-h-screen sm:min-h-0 relative z-10 ${hasCustomBg ? "sm:bg-white/95 sm:backdrop-blur-sm" : ""}`}>
        {/* Cover */}
        <div className="relative">
          {creator.cover ? (
            <div className="h-32 sm:h-36 sm:rounded-t-3xl overflow-hidden"><img src={creator.cover} alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" /></div>
          ) : (
            <div className="h-24 sm:h-28 bg-gradient-to-br from-neutral-100 to-neutral-200 sm:rounded-t-3xl" />
          )}
          <div className="absolute top-3 right-3 z-10"><ShareBtn slug={creator.slug} /></div>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2"><Avatar creator={creator} /></div>
        </div>
        <div className="px-5 pb-8 pt-14 text-center">
          <div className="flex items-center justify-center gap-1.5"><h1 className="font-display text-lg font-bold text-neutral-900">{creator.name || "Your Name"}</h1>{creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}</div>
          <p className="text-xs text-neutral-400 mt-0.5">@{creator.slug?.split("-")[0]}</p>
          {creator.headline && <p className="mt-2 text-sm text-neutral-600 max-w-[300px] mx-auto">{creator.headline}</p>}
          {creator.location && <p className="mt-1.5 text-xs text-neutral-400 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
          {creator.isOnline && <OnlineDot />}
          <Socials creator={creator} />
          {creator.bio && <p className="text-sm text-neutral-500 mb-2">{creator.bio}</p>}
          <BioLinksSection creator={creator} />
          {creator.services.length > 0 && <><SectionLabel>Services</SectionLabel><div className="space-y-2.5">{creator.services.map(s => <ServiceCard key={s.id} service={s} creator={creator} />)}</div></>}
          {creator.portfolio.length > 0 && <><SectionLabel>Portfolio</SectionLabel><div className="grid grid-cols-3 gap-1.5">{creator.portfolio.slice(0, 6).map(p => <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-neutral-100">{p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">{p.title}</div>}</div>)}</div></>}
          {creator.calendarEnabled && <div className="my-4"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
          {isEmpty && <EmptyState />}
          {!isEmpty && <CTAButton creator={creator} />}
          <Branding />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: GLASS — Premium frosted glass on deep gradient
   ══════════════════════════════════════════════════════════════ */
function TemplateGlass({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasCustomBg = !!creator.linkBioBgType;
  const accent = creator.linkBioAccent || "#6366f1";

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      {hasCustomBg ? (
        <BgLayer creator={creator} fallback={<div className="fixed inset-0 bg-gradient-to-br from-[#0f0720] via-[#1a1040] to-[#0a0a1a]" />} />
      ) : (
        <div className="fixed inset-0 bg-gradient-to-br from-[#0f0720] via-[#1a1040] to-[#0a0a1a]" />
      )}
      {/* Ambient glow orbs */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${accent}60 0%, transparent 70%)` }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-15" style={{ background: `radial-gradient(circle, #ec489960 0%, transparent 70%)` }} />
      </div>

      <div className="absolute top-4 right-4 z-20"><ShareBtn slug={creator.slug} light /></div>

      <div className="relative z-10 max-w-[480px] mx-auto px-5 pt-14 pb-10 min-h-screen flex flex-col">
        <div className="text-center mb-8">
          {/* Avatar with glow ring */}
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full opacity-40 blur-xl" style={{ background: accent }} />
            {creator.avatar ? (
              <img src={creator.avatar} alt="" className="relative w-24 h-24 rounded-full object-cover ring-2 ring-white/20 shadow-2xl" />
            ) : (
              <div className="relative w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center ring-2 ring-white/20 shadow-2xl"><span className="text-3xl font-bold text-white/60">{(creator.name || "?")[0]}</span></div>
            )}
            {creator.isOnline && <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-4 w-4 bg-emerald-500 ring-2 ring-[#1a1040]" /></span>}
          </div>

          <div className="mt-5 flex items-center justify-center gap-1.5">
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}
          </div>
          {creator.headline && <p className="mt-2 text-sm text-white/50 max-w-[320px] mx-auto leading-relaxed">{creator.headline}</p>}
          {creator.location && <p className="mt-2 text-xs text-white/30 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}

          {/* Stats bar */}
          {(creator.totalProjects > 0 || creator.rating > 0 || creator.reviewCount > 0) && (
            <div className="mt-5 flex items-center justify-center gap-6">
              {creator.totalProjects > 0 && <div className="text-center"><div className="text-lg font-bold text-white">{creator.totalProjects}</div><div className="text-[10px] text-white/30 uppercase tracking-wider">Projects</div></div>}
              {creator.rating > 0 && <div className="text-center"><div className="text-lg font-bold text-white">{creator.rating.toFixed(1)}</div><div className="text-[10px] text-white/30 uppercase tracking-wider">Rating</div></div>}
              {creator.reviewCount > 0 && <div className="text-center"><div className="text-lg font-bold text-white">{creator.reviewCount}</div><div className="text-[10px] text-white/30 uppercase tracking-wider">Reviews</div></div>}
            </div>
          )}
        </div>
        <Socials creator={creator} light />
        {creator.bio && <p className="text-sm text-white/50 text-center mb-6">{creator.bio}</p>}
        <BioLinksSection creator={creator} light />
        <div className="flex-1 space-y-3">
          {creator.services.map(s => <ServiceCard key={s.id} service={s} creator={creator} light />)}
          {creator.portfolio.length > 0 && <div className="grid grid-cols-3 gap-1.5 pt-2">{creator.portfolio.slice(0, 6).map(p => <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-white/5">{p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">{p.title}</div>}</div>)}</div>}
          {creator.calendarEnabled && <div className="my-4"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
          {isEmpty && <EmptyState light />}
          {!isEmpty && <CTAButton creator={creator} light />}
        </div>
        <Branding light />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: BOLD — Dark, punchy, accent-driven
   ══════════════════════════════════════════════════════════════ */
function TemplateBold({ creator }: { creator: Creator }) {
  const accent = creator.linkBioAccent || "#6366f1";
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasCustomBg = !!creator.linkBioBgType;

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center sm:py-8 sm:px-4" style={{ background: hasCustomBg ? "transparent" : "#0a0a0a" }}>
      {hasCustomBg && <BgLayer creator={creator} />}
      <div className="w-full sm:max-w-[460px] sm:rounded-3xl sm:shadow-2xl bg-neutral-950 sm:border sm:border-neutral-800 min-h-screen sm:min-h-0 relative z-10">
        <div className="absolute top-3 right-3 z-10"><ShareBtn slug={creator.slug} light /></div>
        <div className="px-5 pb-8 pt-10 text-center">
          <Avatar creator={creator} size="lg" shape="square" light accentBorder={accent} />
          <div className="mt-5 flex items-center justify-center gap-2"><h1 className="font-display text-2xl font-black text-white tracking-tight">{creator.name || "Your Name"}</h1>{creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}</div>
          <p className="text-xs mt-1" style={{ color: accent }}>@{creator.slug?.split("-")[0]}</p>
          {creator.headline && <p className="mt-2 text-sm text-neutral-400 max-w-[320px] mx-auto font-medium">{creator.headline}</p>}
          {creator.location && <p className="mt-1.5 text-xs text-neutral-600 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
          {creator.isOnline && <OnlineDot light />}
          <Socials creator={creator} light shape="square" />
          {creator.bio && <p className="text-sm text-neutral-500 mb-4 leading-relaxed">{creator.bio}</p>}
          <BioLinksSection creator={creator} light />
          {creator.services.length > 0 && <><div className="w-12 h-[2px] mx-auto my-6" style={{ background: accent }} /><div className="space-y-3">{creator.services.map(s => (
            <a key={s.id} href={`/creators/${creator.slug}`} className={`block w-full bg-neutral-900 border border-neutral-800 ${btnClass(creator.linkBioButtonShape)} px-5 py-4 text-left hover:border-neutral-700 transition-all`}>
              <div className="flex items-center justify-between"><span className="font-bold text-white text-[15px]">{s.title}</span><span className="text-xs font-bold" style={{ color: accent }}>{s.price === 0 ? "Offers" : `$${s.price}`}</span></div>
              {s.deliveryDays && <div className="text-[11px] text-neutral-600 mt-1">{s.deliveryDays} day delivery</div>}
            </a>
          ))}</div></>}
          {creator.portfolio.length > 0 && <><div className="w-12 h-[2px] mx-auto my-6" style={{ background: accent }} /><div className="grid grid-cols-2 gap-2">{creator.portfolio.slice(0, 4).map(p => <div key={p.id} className="aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">{p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs">{p.title}</div>}</div>)}</div></>}
          {creator.calendarEnabled && <div className="my-4"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
          {isEmpty && <EmptyState light />}
          {!isEmpty && <CTAButton creator={creator} light accent={accent} />}
          <Branding light />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: SHOWCASE — Media-rich, visual-first
   ══════════════════════════════════════════════════════════════ */
function TemplateShowcase({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasCustomBg = !!creator.linkBioBgType;

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center sm:py-8 sm:px-4" style={{ background: hasCustomBg ? "transparent" : "#f5f5f5" }}>
      {hasCustomBg && <BgLayer creator={creator} />}
      <div className="w-full sm:max-w-[460px] sm:rounded-3xl sm:shadow-2xl bg-white min-h-screen sm:min-h-0 relative z-10">
        <div className="absolute top-3 right-3 z-10"><ShareBtn slug={creator.slug} /></div>
        <div className="px-5 pb-8 pt-10 text-center">
          <Avatar creator={creator} shape="square" />
          <div className="mt-3 flex items-center justify-center gap-1.5"><h1 className="font-display text-lg font-bold text-neutral-900">{creator.name || "Your Name"}</h1>{creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}</div>
          <p className="text-xs text-neutral-400">@{creator.slug?.split("-")[0]}</p>
          {creator.headline && <p className="mt-2 text-sm text-neutral-500 max-w-[300px] mx-auto">{creator.headline}</p>}
          {creator.location && <p className="mt-1 text-xs text-neutral-400 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
          {creator.isOnline && <OnlineDot />}
          <Socials creator={creator} shape="square" />
          {creator.bio && <p className="text-sm text-neutral-500 mb-4">{creator.bio}</p>}
          <BioLinksSection creator={creator} />
          {creator.portfolio.length > 0 && <div className="grid grid-cols-2 gap-2 mb-5">{creator.portfolio.slice(0, 6).map(p => <div key={p.id} className="rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100"><div className="aspect-[4/3]">{p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-300 text-xs">{p.title}</div>}</div></div>)}</div>}
          {creator.services.length > 0 && <div className="grid grid-cols-2 gap-2 mb-5">{creator.services.map(s => <ServiceCard key={s.id} service={s} creator={creator} />)}</div>}
          {creator.calendarEnabled && <div className="my-4"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
          {isEmpty && <EmptyState />}
          {!isEmpty && <CTAButton creator={creator} />}
          <Branding />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: NEON — Futuristic dark with glow effects
   ══════════════════════════════════════════════════════════════ */
function TemplateNeon({ creator }: { creator: Creator }) {
  const accent = creator.linkBioAccent || "#22d3ee";
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasCustomBg = !!creator.linkBioBgType;

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center sm:py-8 sm:px-4" style={{ background: hasCustomBg ? "transparent" : "#000" }}>
      {hasCustomBg && <BgLayer creator={creator} />}
      <div className="w-full sm:max-w-[460px] sm:rounded-3xl bg-neutral-950 min-h-screen sm:min-h-0 relative z-10" style={{ boxShadow: `0 0 60px -20px ${accent}40` }}>
        <div className="absolute top-3 right-3 z-10"><ShareBtn slug={creator.slug} light /></div>
        <div className="px-5 pb-8 pt-10 text-center">
          <div className="relative inline-block">
            <Avatar creator={creator} light accentBorder={accent} />
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 30px ${accent}40` }} />
          </div>
          <div className="mt-4 flex items-center justify-center gap-1.5"><h1 className="font-display text-xl font-bold text-white">{creator.name || "Your Name"}</h1>{creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}</div>
          <p className="text-xs mt-0.5" style={{ color: accent }}>@{creator.slug?.split("-")[0]}</p>
          {creator.headline && <p className="mt-2 text-sm text-neutral-400 max-w-[300px] mx-auto">{creator.headline}</p>}
          {creator.location && <p className="mt-1.5 text-xs text-neutral-600 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
          {creator.isOnline && <OnlineDot light />}
          {creator.socials.length > 0 && <div className="flex items-center justify-center gap-2.5 my-5 flex-wrap">{creator.socials.map(s => <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${s.platform}`} className="w-10 h-10 rounded-full border flex items-center justify-center hover:scale-110 transition-all" style={{ borderColor: `${accent}30`, background: `${accent}10` }}><PlatformIcon platform={s.platform} size={18} className="text-neutral-300" /></a>)}</div>}
          {creator.bio && <p className="text-sm text-neutral-500 mb-4">{creator.bio}</p>}
          <BioLinksSection creator={creator} light />
          {creator.services.length > 0 && <div className="space-y-3 mb-5">{creator.services.map(s => <a key={s.id} href={`/creators/${creator.slug}`} className={`block w-full ${btnClass(creator.linkBioButtonShape)} px-5 py-4 text-center transition-all hover:scale-[1.02]`} style={{ border: `1px solid ${accent}25`, background: `${accent}08`, boxShadow: `0 0 15px ${accent}10` }}><div className="font-medium text-white text-[15px]">{s.title}</div><div className="text-xs mt-0.5" style={{ color: `${accent}99` }}>{priceLabel(s.price, s.deliveryDays)}</div></a>)}</div>}
          {creator.portfolio.length > 0 && <div className="grid grid-cols-3 gap-1.5 mb-5">{creator.portfolio.slice(0, 6).map(p => <div key={p.id} className="aspect-square rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}15` }}>{p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-700 text-xs">{p.title}</div>}</div>)}</div>}
          {creator.calendarEnabled && <div className="my-4"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
          {isEmpty && <EmptyState light />}
          {!isEmpty && <CTAButton creator={creator} light accent={accent} />}
          <Branding light />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: COLLAGE — Portfolio/photos as background mosaic
   ══════════════════════════════════════════════════════════════ */
function TemplateCollage({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  // Use custom bg images first, then portfolio images, then cover
  const images = (creator.linkBioBgImages && creator.linkBioBgImages.length > 0)
    ? creator.linkBioBgImages
    : creator.portfolio.filter(p => p.image).map(p => p.image!);
  const tiles = images.length > 0 ? Array.from({ length: 12 }, (_, i) => images[i % images.length]) : [];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {tiles.length > 0 ? (
        <div className="fixed inset-0 z-0 grid grid-cols-3 sm:grid-cols-4 auto-rows-fr">
          {tiles.map((img, i) => <div key={i} className="relative overflow-hidden"><img src={img} alt="" className="w-full h-full object-cover scale-110" style={{ filter: "brightness(0.35) saturate(0.7)" }} /></div>)}
        </div>
      ) : creator.cover ? (
        <div className="fixed inset-0 z-0"><img src={creator.cover} alt="" className="w-full h-full object-cover brightness-[0.35]" /></div>
      ) : (
        <BgLayer creator={creator} fallback={<div className="fixed inset-0 z-0 bg-gradient-to-br from-neutral-900 to-neutral-950" />} />
      )}

      <div className="relative z-10 max-w-[460px] mx-auto px-5 pt-14 pb-10 min-h-screen flex flex-col">
        <div className="text-center mb-8 bg-black/30 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
          <Avatar creator={creator} shape="square" light />
          <div className="mt-3 flex items-center justify-center gap-1.5"><h1 className="font-display text-xl font-bold text-white">{creator.name || "Your Name"}</h1>{creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}</div>
          {creator.headline && <p className="mt-1.5 text-sm text-white/60">{creator.headline}</p>}
          {creator.location && <p className="mt-1 text-xs text-white/40 flex items-center justify-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
          {creator.isOnline && <OnlineDot light />}
          <Socials creator={creator} light />
        </div>
        {creator.bio && <p className="text-sm text-white/50 text-center mb-6">{creator.bio}</p>}
        <BioLinksSection creator={creator} light />
        <div className="flex-1 space-y-2.5">
          {creator.services.map(s => <ServiceCard key={s.id} service={s} creator={creator} light />)}
          {creator.calendarEnabled && <div className="my-4"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
          {isEmpty && <EmptyState light />}
          {!isEmpty && <CTAButton creator={creator} light />}
        </div>
        <Branding light />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: BENTO — Apple-style grid boxes
   ══════════════════════════════════════════════════════════════ */
function TemplateBento({ creator }: { creator: Creator }) {
  const accent = creator.linkBioAccent || "#171717";
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const hasPortfolio = creator.portfolio.length > 0;
  const hasCustomBg = !!creator.linkBioBgType;

  return (
    <div className="min-h-screen p-3 sm:p-5" style={{ background: hasCustomBg ? "transparent" : "#0a0a0a" }}>
      {hasCustomBg && <BgLayer creator={creator} />}
      <div className="max-w-[520px] mx-auto relative z-10">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 auto-rows-[80px] sm:auto-rows-[90px]">
          {/* Identity card */}
          <div className="col-span-4 row-span-2 rounded-3xl overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${accent}15, ${accent}05)`, border: `1px solid ${accent}20` }}>
            {creator.cover && <img src={creator.cover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />}
            <div className="relative h-full flex items-center gap-4 px-5 sm:px-6">
              {creator.avatar ? <img src={creator.avatar} alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-xl shrink-0" /> : <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 flex items-center justify-center shrink-0"><span className="text-2xl font-bold text-white/60">{(creator.name || "?")[0]}</span></div>}
              <div>
                <div className="flex items-center gap-1.5"><h1 className="font-display text-lg sm:text-xl font-bold text-white">{creator.name || "Your Name"}</h1>{creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}</div>
                <p className="text-xs text-white/40 mt-0.5">@{creator.slug?.split("-")[0]}</p>
                {creator.headline && <p className="text-xs text-white/50 mt-1 line-clamp-2">{creator.headline}</p>}
                {creator.isOnline && <div className="flex items-center gap-1 mt-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /><span className="text-[9px] text-emerald-400 font-medium">Online</span></div>}
              </div>
            </div>
          </div>
          {creator.bio && <div className="col-span-4 row-span-1 rounded-2xl bg-neutral-900 border border-neutral-800 px-4 flex items-center"><p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{creator.bio}</p></div>}
          {creator.bioLinks.filter(l => l.isVisible).length > 0 && creator.bioLinks.filter(l => l.isVisible).map(link => <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="col-span-2 row-span-1 rounded-2xl bg-neutral-900 border border-neutral-800 px-4 flex items-center justify-center hover:bg-neutral-800/80 transition-all"><span className="text-xs text-neutral-300 font-medium truncate">{link.title}</span></a>)}
          {creator.socials.length > 0 && <div className="col-span-2 row-span-1 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center gap-2 px-3">{creator.socials.slice(0, 5).map(s => <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${s.platform}`} className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-all"><PlatformIcon platform={s.platform} size={14} className="text-neutral-400" /></a>)}</div>}
          <div className={`${creator.socials.length > 0 ? "col-span-2" : "col-span-4"} row-span-1 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center px-3`}>{creator.location ? <span className="text-xs text-neutral-500 flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</span> : <span className="text-xs text-neutral-600">hireacreator.ai</span>}</div>
          {hasPortfolio && creator.portfolio.slice(0, 4).map((p) => <div key={p.id} className="col-span-2 row-span-2 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">{p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs">{p.title}</div>}</div>)}
          {creator.services.map(s => <a key={s.id} href={`/creators/${creator.slug}`} className="col-span-2 row-span-1 rounded-2xl border px-4 flex items-center justify-between hover:bg-white/5 transition-all" style={{ borderColor: `${accent}25`, background: `${accent}08` }}><div><div className="text-sm font-medium text-white truncate">{s.title}</div><div className="text-[10px] text-neutral-500">{priceLabel(s.price, s.deliveryDays)}</div></div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-600 shrink-0"><path d="M9 18l6-6-6-6" strokeLinecap="round" /></svg></a>)}
          {!isEmpty && <a href={`/creators/${creator.slug}`} className="col-span-4 row-span-1 rounded-2xl font-semibold text-sm text-center flex items-center justify-center text-white transition-all hover:opacity-90" style={{ background: accent }}>View Full Profile</a>}
          {isEmpty && <a href="/dashboard" className="col-span-4 row-span-1 rounded-2xl bg-white font-semibold text-sm text-center flex items-center justify-center text-neutral-900 hover:bg-neutral-100 transition-all">Set Up Your Profile</a>}
        </div>
        <Branding light />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE: SPLIT — Magazine hero + scrollable content
   ══════════════════════════════════════════════════════════════ */
function TemplateSplit({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  const heroImage = creator.cover || (creator.portfolio.length > 0 && creator.portfolio[0].image) || null;

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen flex flex-col sm:flex-row">
        <div className="sm:w-[45%] sm:sticky sm:top-0 sm:h-screen relative">
          {heroImage ? <img src={heroImage} alt="" className="w-full h-[35vh] sm:h-full object-cover" /> : <div className="w-full h-[35vh] sm:h-full bg-gradient-to-br from-neutral-200 to-neutral-300" />}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent sm:hidden" />
          <div className="absolute bottom-4 left-5 right-5 sm:hidden">
            <div className="flex items-center gap-2">
              {creator.avatar && <img src={creator.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-lg" />}
              <div><div className="flex items-center gap-1"><h1 className="font-display text-lg font-bold text-neutral-900">{creator.name || "Your Name"}</h1>{creator.isVerified && <VerifiedBadge />}</div><p className="text-[10px] text-neutral-500">@{creator.slug?.split("-")[0]}</p></div>
            </div>
          </div>
        </div>
        <div className="sm:w-[55%] sm:overflow-y-auto sm:h-screen">
          <div className="px-6 sm:px-8 lg:px-10 py-6 sm:py-10">
            <div className="hidden sm:block mb-8">
              <div className="flex items-center gap-3 mb-3">
                {creator.avatar ? <img src={creator.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-md" /> : <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center"><span className="text-xl font-bold text-neutral-400">{(creator.name || "?")[0]}</span></div>}
                <div><div className="flex items-center gap-1.5"><h1 className="font-display text-2xl font-bold text-neutral-900">{creator.name || "Your Name"}</h1>{creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}</div><p className="text-xs text-neutral-400">@{creator.slug?.split("-")[0]}</p></div>
              </div>
              {creator.headline && <p className="text-sm text-neutral-600 leading-relaxed">{creator.headline}</p>}
              {creator.location && <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
              {creator.isOnline && <OnlineDot />}
            </div>
            <div className="sm:hidden mb-5">
              {creator.headline && <p className="text-sm text-neutral-600">{creator.headline}</p>}
              {creator.location && <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>{creator.location}</p>}
              {creator.isOnline && <OnlineDot />}
            </div>
            {creator.socials.length > 0 && <div className="flex flex-wrap gap-2 mb-6">{creator.socials.map(s => <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${s.platform}`} className="flex items-center gap-2 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-full hover:bg-neutral-100 transition-all"><PlatformIcon platform={s.platform} size={14} className="text-neutral-500" /><span className="text-xs text-neutral-600 font-medium">{s.handle || s.platform}</span></a>)}</div>}
            {creator.bio && <p className="text-sm text-neutral-500 mb-6 leading-relaxed">{creator.bio}</p>}
            <BioLinksSection creator={creator} />
            {creator.services.length > 0 && <div className="mb-6"><h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">Services</h2><div className="space-y-2">{creator.services.map(s => <ServiceCard key={s.id} service={s} creator={creator} />)}</div></div>}
            {creator.calendarEnabled && <div className="mb-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
            {creator.portfolio.length > 0 && <div className="mb-6"><h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">Work</h2><div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x">{creator.portfolio.slice(0, 8).map(p => <div key={p.id} className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-neutral-100 shrink-0 snap-start">{p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-300 text-[10px]">{p.title}</div>}</div>)}</div></div>}
            {creator.calendarEnabled && <div className="my-4"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
            {isEmpty && <EmptyState />}
            {!isEmpty && <CTAButton creator={creator} />}
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
      {creator.calendarEnabled && (
        <div className="max-w-[460px] mx-auto px-4 pb-8 relative z-20">
          <CalendarBooking creatorId={creator.id} creatorName={creator.name} />
        </div>
      )}
    </div>
  );
}
