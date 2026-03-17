"use client";

import { useState } from "react";
import Link from "next/link";
import type { Creator } from "@/lib/types";
import { useAuth } from "@/components/auth-context";
import { PlatformIcon } from "./icons/platforms";

/* ── Shared small components ── */

function VerifiedBadge({ light }: { light?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={light ? "text-blue-400" : "text-blue-500"}>
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm">PRO</span>
  );
}

function ShareBtn({ slug, light }: { slug: string; light?: boolean }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        const u = `https://hireacreator.ai/u/${slug}`;
        navigator.share ? navigator.share({ url: u }).catch(() => {}) : navigator.clipboard.writeText(u).then(() => { setOk(true); setTimeout(() => setOk(false), 2000); });
      }}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${light ? "bg-white/10 hover:bg-white/20" : "bg-neutral-100 hover:bg-neutral-200"}`}
    >
      {ok ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={light ? "text-white/60" : "text-neutral-500"} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>
      )}
    </button>
  );
}

function OnlineDot({ light }: { light?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mt-2">
      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>
      <span className={`text-[10px] font-medium ${light ? "text-emerald-400" : "text-emerald-600"}`}>Available now</span>
    </div>
  );
}

function Branding({ light }: { light?: boolean }) {
  return (
    <div className="mt-8 pt-5 border-t border-current/[0.06] text-center">
      <a href="/" className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full transition-colors ${light ? "bg-white/5 hover:bg-white/10 text-white/30" : "bg-neutral-50 hover:bg-neutral-100 text-neutral-400"}`}>
        <img src="/logo-512.png" alt="H" className="w-4 h-4 opacity-60" />
        <span className="text-[11px] font-medium">Create your own — free</span>
      </a>
    </div>
  );
}

function SectionLabel({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className="flex items-center justify-center my-5">
      <span className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide ${light ? "bg-white/10 text-white/70" : "bg-neutral-100 text-neutral-700"}`}>{children}</span>
    </div>
  );
}

/* Helper: service price display */
function priceLabel(price: number, days?: number | null) {
  const p = price === 0 ? "Open to offers" : `From $${price.toLocaleString()}`;
  return days ? `${p} · ${days}d` : p;
}

/* ═══════════════════════════════════════════════
   TEMPLATE 1 — MINIMAL (Linktree-style card)
   Clean white card on grey bg, professional
   ═══════════════════════════════════════════════ */
function TemplateMinimal({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  return (
    <div className="min-h-screen bg-neutral-200 flex items-start sm:items-center justify-center sm:py-8 sm:px-4">
      <div className="w-full sm:max-w-[460px] sm:rounded-3xl sm:shadow-2xl sm:shadow-black/10 bg-white min-h-screen sm:min-h-0 sm:max-h-[92vh] sm:overflow-y-auto relative">
        {/* Cover */}
        <div className="relative">
          {creator.cover ? (
            <div className="h-32 sm:h-36 sm:rounded-t-3xl overflow-hidden"><img src={creator.cover} alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" /></div>
          ) : (
            <div className="h-24 sm:h-28 bg-gradient-to-br from-neutral-100 to-neutral-200 sm:rounded-t-3xl" />
          )}
          <div className="absolute top-3 right-3 z-10"><ShareBtn slug={creator.slug} /></div>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            {creator.avatar ? <img src={creator.avatar} alt="" className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg" /> : <div className="w-24 h-24 rounded-full border-4 border-white bg-neutral-100 flex items-center justify-center shadow-lg"><span className="text-3xl font-bold text-neutral-400">{(creator.name || "?")[0]}</span></div>}
          </div>
        </div>
        <div className="px-5 pb-8 pt-14 text-center">
          <div className="flex items-center justify-center gap-1.5"><h1 className="font-display text-lg font-bold text-neutral-900">{creator.name || "Your Name"}</h1>{creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}</div>
          <p className="text-xs text-neutral-400 mt-0.5">@{creator.slug?.split("-")[0]}</p>
          {creator.headline && <p className="mt-2 text-sm text-neutral-600 max-w-[300px] mx-auto">{creator.headline}</p>}
          {creator.location && <p className="mt-1.5 text-xs text-neutral-400">📍 {creator.location}</p>}
          {creator.isOnline && <OnlineDot />}
          {creator.socials.length > 0 && <div className="flex items-center justify-center gap-2.5 my-5 flex-wrap">{creator.socials.map(s => <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 hover:scale-110 transition-all"><PlatformIcon platform={s.platform} size={18} className="text-neutral-600" /></a>)}</div>}
          {creator.bio && <p className="text-sm text-neutral-500 mb-2">{creator.bio}</p>}
          {creator.services.length > 0 && <><SectionLabel>Services</SectionLabel><div className="space-y-2.5">{creator.services.map(s => <a key={s.id} href={`/creators/${creator.slug}`} className="group flex items-center gap-3 w-full bg-neutral-50 border border-neutral-200/80 rounded-2xl px-4 py-3.5 hover:bg-neutral-100 transition-all text-left"><div className="w-10 h-10 rounded-xl bg-neutral-200/80 flex items-center justify-center shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-500"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" strokeLinecap="round" strokeLinejoin="round" /><line x1="7" y1="7" x2="7.01" y2="7" strokeLinecap="round" /></svg></div><div className="flex-1 min-w-0"><div className="font-medium text-neutral-900 text-sm truncate">{s.title}</div><div className="text-xs text-neutral-400 mt-0.5">{priceLabel(s.price, s.deliveryDays)}</div></div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-300 shrink-0"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg></a>)}</div></>}
          {creator.portfolio.length > 0 && <><SectionLabel>Portfolio</SectionLabel><div className="grid grid-cols-3 gap-1.5">{creator.portfolio.slice(0, 6).map(p => <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-neutral-100">{p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">{p.title}</div>}</div>)}</div></>}
          {isEmpty && <EmptyState light={false} />}
          {!isEmpty && <a href={`/creators/${creator.slug}`} className="block w-full mt-6 bg-neutral-900 text-white font-semibold text-sm text-center rounded-full py-3.5 hover:opacity-90 transition-all shadow-lg">View Full Profile</a>}
          <Branding />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TEMPLATE 2 — GLASS (bio.link style)
   Full-bleed bg with glassmorphic frosted cards
   ═══════════════════════════════════════════════ */
function TemplateGlass({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0">{creator.cover ? <><img src={creator.cover} alt="" className="w-full h-full object-cover scale-110 blur-2xl brightness-50" /><div className="absolute inset-0 bg-black/30" /></> : <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950" />}</div>
      <div className="absolute top-3 right-3 z-20"><ShareBtn slug={creator.slug} light /></div>
      <div className="relative z-10 max-w-[480px] mx-auto px-5 pt-12 pb-10 min-h-screen flex flex-col">
        <div className="text-center mb-6">
          {creator.avatar ? <img src={creator.avatar} alt="" className="w-[88px] h-[88px] rounded-full border-[3px] border-white/20 object-cover mx-auto shadow-2xl" /> : <div className="w-[88px] h-[88px] rounded-full border-[3px] border-white/20 bg-white/10 flex items-center justify-center mx-auto shadow-2xl"><span className="text-3xl font-bold text-white/80">{(creator.name || "?")[0]}</span></div>}
          <div className="mt-4 flex items-center justify-center gap-1.5"><h1 className="font-display text-xl font-bold text-white">{creator.name || "Your Name"}</h1>{creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}</div>
          {creator.headline && <p className="mt-1.5 text-sm text-white/60 max-w-[320px] mx-auto">{creator.headline}</p>}
          {creator.location && <p className="mt-1.5 text-xs text-white/40">📍 {creator.location}</p>}
          {creator.isOnline && <OnlineDot light />}
        </div>
        {creator.socials.length > 0 && <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">{creator.socials.map(s => <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 border border-white/[0.08] flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"><PlatformIcon platform={s.platform} size={18} className="text-white/80" /></a>)}</div>}
        {creator.bio && <p className="text-sm text-white/50 text-center mb-6">{creator.bio}</p>}
        <div className="flex-1 space-y-3">
          {creator.services.map(s => <a key={s.id} href={`/creators/${creator.slug}`} className="block w-full bg-white/[0.08] backdrop-blur-md border border-white/[0.08] rounded-2xl px-5 py-4 text-center hover:bg-white/[0.14] transition-all"><div className="font-medium text-white text-[15px]">{s.title}</div><div className="text-xs text-white/40 mt-0.5">{priceLabel(s.price, s.deliveryDays)}</div></a>)}
          {creator.portfolio.length > 0 && <div className="grid grid-cols-3 gap-1.5 pt-2">{creator.portfolio.slice(0, 6).map(p => <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-white/5">{p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">{p.title}</div>}</div>)}</div>}
          {isEmpty && <EmptyState light />}
          {!isEmpty && <a href={`/creators/${creator.slug}`} className="block w-full mt-3 bg-white text-neutral-900 font-semibold text-sm text-center rounded-full py-3.5 hover:bg-neutral-100 transition-all shadow-lg">View Full Profile</a>}
        </div>
        <Branding light />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TEMPLATE 3 — BOLD (Dark, punchy, Stan Store-inspired)
   Dark bg, accent-colored section dividers, strong type
   ═══════════════════════════════════════════════ */
function TemplateBold({ creator }: { creator: Creator }) {
  const accent = creator.linkBioAccent || "#6366f1";
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  return (
    <div className="min-h-screen bg-neutral-950 flex items-start sm:items-center justify-center sm:py-8 sm:px-4">
      <div className="w-full sm:max-w-[460px] sm:rounded-3xl sm:shadow-2xl bg-neutral-950 sm:border sm:border-neutral-800 min-h-screen sm:min-h-0 sm:max-h-[92vh] sm:overflow-y-auto relative">
        <div className="absolute top-3 right-3 z-10"><ShareBtn slug={creator.slug} light /></div>
        <div className="px-5 pb-8 pt-10 text-center">
          {/* Big avatar */}
          {creator.avatar ? <img src={creator.avatar} alt="" className="w-28 h-28 rounded-2xl object-cover mx-auto shadow-2xl" style={{ border: `3px solid ${accent}` }} /> : <div className="w-28 h-28 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto" style={{ border: `3px solid ${accent}` }}><span className="text-4xl font-bold text-neutral-500">{(creator.name || "?")[0]}</span></div>}
          <div className="mt-5 flex items-center justify-center gap-2"><h1 className="font-display text-2xl font-black text-white tracking-tight">{creator.name || "Your Name"}</h1>{creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}</div>
          <p className="text-xs mt-1" style={{ color: accent }}>@{creator.slug?.split("-")[0]}</p>
          {creator.headline && <p className="mt-2 text-sm text-neutral-400 max-w-[320px] mx-auto font-medium">{creator.headline}</p>}
          {creator.location && <p className="mt-1.5 text-xs text-neutral-600">📍 {creator.location}</p>}
          {creator.isOnline && <OnlineDot light />}
          {creator.socials.length > 0 && <div className="flex items-center justify-center gap-2 my-6 flex-wrap">{creator.socials.map(s => <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:border-neutral-600 hover:scale-110 transition-all"><PlatformIcon platform={s.platform} size={20} className="text-neutral-400" /></a>)}</div>}
          {creator.bio && <p className="text-sm text-neutral-500 mb-4 leading-relaxed">{creator.bio}</p>}
          {/* Services as bold cards */}
          {creator.services.length > 0 && <><div className="w-12 h-[2px] mx-auto my-6" style={{ background: accent }} />{creator.services.map(s => <a key={s.id} href={`/creators/${creator.slug}`} className="block w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-4 mb-3 text-left hover:border-neutral-700 transition-all group"><div className="flex items-center justify-between"><span className="font-bold text-white text-[15px]">{s.title}</span><span className="text-xs font-bold" style={{ color: accent }}>{s.price === 0 ? "Offers" : `$${s.price}`}</span></div>{s.deliveryDays && <div className="text-[11px] text-neutral-600 mt-1">{s.deliveryDays} day delivery</div>}</a>)}</>}
          {creator.portfolio.length > 0 && <><div className="w-12 h-[2px] mx-auto my-6" style={{ background: accent }} /><div className="grid grid-cols-2 gap-2">{creator.portfolio.slice(0, 4).map(p => <div key={p.id} className="aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">{p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs">{p.title}</div>}</div>)}</div></>}
          {isEmpty && <EmptyState light />}
          {!isEmpty && <a href={`/creators/${creator.slug}`} className="block w-full mt-6 font-bold text-sm text-center rounded-full py-3.5 transition-all shadow-lg text-white" style={{ background: accent }}>View Full Profile</a>}
          <Branding light />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TEMPLATE 4 — SHOWCASE (hoo.be / media-rich)
   White bg, 2-column portfolio grid, visual-first
   ═══════════════════════════════════════════════ */
function TemplateShowcase({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  return (
    <div className="min-h-screen bg-neutral-100 flex items-start sm:items-center justify-center sm:py-8 sm:px-4">
      <div className="w-full sm:max-w-[460px] sm:rounded-3xl sm:shadow-2xl sm:shadow-black/10 bg-white min-h-screen sm:min-h-0 sm:max-h-[92vh] sm:overflow-y-auto relative">
        <div className="absolute top-3 right-3 z-10"><ShareBtn slug={creator.slug} /></div>
        <div className="px-5 pb-8 pt-10 text-center">
          {creator.avatar ? <img src={creator.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover mx-auto shadow-md" /> : <div className="w-20 h-20 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto"><span className="text-2xl font-bold text-neutral-400">{(creator.name || "?")[0]}</span></div>}
          <div className="mt-3 flex items-center justify-center gap-1.5"><h1 className="font-display text-lg font-bold text-neutral-900">{creator.name || "Your Name"}</h1>{creator.isVerified && <VerifiedBadge />}{creator.isPro && <ProBadge />}</div>
          <p className="text-xs text-neutral-400">@{creator.slug?.split("-")[0]}</p>
          {creator.headline && <p className="mt-2 text-sm text-neutral-500 max-w-[300px] mx-auto">{creator.headline}</p>}
          {creator.location && <p className="mt-1 text-xs text-neutral-400">📍 {creator.location}</p>}
          {creator.isOnline && <OnlineDot />}
          {/* Socials as compact row */}
          {creator.socials.length > 0 && <div className="flex items-center justify-center gap-2 my-4 flex-wrap">{creator.socials.map(s => <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 hover:scale-110 transition-all"><PlatformIcon platform={s.platform} size={16} className="text-neutral-500" /></a>)}</div>}
          {creator.bio && <p className="text-sm text-neutral-500 mb-4">{creator.bio}</p>}
          {/* 2-column media grid for portfolio (hoo.be style) */}
          {creator.portfolio.length > 0 && <div className="grid grid-cols-2 gap-2 mb-5">{creator.portfolio.slice(0, 6).map(p => <div key={p.id} className="rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100"><div className="aspect-[4/3]">{p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-300 text-xs">{p.title}</div>}</div><div className="px-3 py-2"><span className="text-xs font-medium text-neutral-900 uppercase tracking-wide line-clamp-1">{p.title}</span></div></div>)}</div>}
          {/* Services as 2-col cards */}
          {creator.services.length > 0 && <div className="grid grid-cols-2 gap-2 mb-5">{creator.services.map(s => <a key={s.id} href={`/creators/${creator.slug}`} className="rounded-2xl bg-neutral-50 border border-neutral-200 p-3.5 text-left hover:bg-neutral-100 transition-all"><div className="text-sm font-semibold text-neutral-900 line-clamp-2">{s.title}</div><div className="text-xs text-neutral-400 mt-1.5">{priceLabel(s.price, s.deliveryDays)}</div></a>)}</div>}
          {isEmpty && <EmptyState light={false} />}
          {!isEmpty && <a href={`/creators/${creator.slug}`} className="block w-full bg-neutral-900 text-white font-semibold text-sm text-center rounded-full py-3.5 hover:opacity-90 transition-all shadow-lg">View Full Profile</a>}
          <Branding />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TEMPLATE 5 — NEON (Futuristic dark + glow)
   Dark with neon accent borders and glow effects
   ═══════════════════════════════════════════════ */
function TemplateNeon({ creator }: { creator: Creator }) {
  const accent = creator.linkBioAccent || "#22d3ee";
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0;
  return (
    <div className="min-h-screen bg-black flex items-start sm:items-center justify-center sm:py-8 sm:px-4">
      <div className="w-full sm:max-w-[460px] sm:rounded-3xl bg-neutral-950 min-h-screen sm:min-h-0 sm:max-h-[92vh] sm:overflow-y-auto relative" style={{ boxShadow: `0 0 60px -20px ${accent}40` }}>
        <div className="absolute top-3 right-3 z-10"><ShareBtn slug={creator.slug} light /></div>
        <div className="px-5 pb-8 pt-10 text-center">
          {/* Glowing avatar */}
          <div className="relative inline-block">
            {creator.avatar ? <img src={creator.avatar} alt="" className="w-24 h-24 rounded-full object-cover shadow-2xl" style={{ border: `2px solid ${accent}`, boxShadow: `0 0 30px ${accent}40` }} /> : <div className="w-24 h-24 rounded-full bg-neutral-900 flex items-center justify-center" style={{ border: `2px solid ${accent}`, boxShadow: `0 0 30px ${accent}40` }}><span className="text-3xl font-bold text-neutral-500">{(creator.name || "?")[0]}</span></div>}
          </div>
          <div className="mt-4 flex items-center justify-center gap-1.5"><h1 className="font-display text-xl font-bold text-white">{creator.name || "Your Name"}</h1>{creator.isVerified && <VerifiedBadge light />}{creator.isPro && <ProBadge />}</div>
          <p className="text-xs mt-0.5" style={{ color: accent }}>@{creator.slug?.split("-")[0]}</p>
          {creator.headline && <p className="mt-2 text-sm text-neutral-400 max-w-[300px] mx-auto">{creator.headline}</p>}
          {creator.location && <p className="mt-1.5 text-xs text-neutral-600">📍 {creator.location}</p>}
          {creator.isOnline && <OnlineDot light />}
          {creator.socials.length > 0 && <div className="flex items-center justify-center gap-2.5 my-5 flex-wrap">{creator.socials.map(s => <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border flex items-center justify-center hover:scale-110 transition-all" style={{ borderColor: `${accent}30`, background: `${accent}10` }}><PlatformIcon platform={s.platform} size={18} className="text-neutral-300" /></a>)}</div>}
          {creator.bio && <p className="text-sm text-neutral-500 mb-4">{creator.bio}</p>}
          {/* Neon-bordered service cards */}
          {creator.services.length > 0 && <div className="space-y-3 mb-5">{creator.services.map(s => <a key={s.id} href={`/creators/${creator.slug}`} className="block w-full rounded-2xl px-5 py-4 text-center transition-all hover:scale-[1.02]" style={{ border: `1px solid ${accent}25`, background: `${accent}08`, boxShadow: `0 0 15px ${accent}10` }}><div className="font-medium text-white text-[15px]">{s.title}</div><div className="text-xs mt-0.5" style={{ color: `${accent}99` }}>{priceLabel(s.price, s.deliveryDays)}</div></a>)}</div>}
          {creator.portfolio.length > 0 && <div className="grid grid-cols-3 gap-1.5 mb-5">{creator.portfolio.slice(0, 6).map(p => <div key={p.id} className="aspect-square rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}15` }}>{p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-700 text-xs">{p.title}</div>}</div>)}</div>}
          {isEmpty && <EmptyState light />}
          {!isEmpty && <a href={`/creators/${creator.slug}`} className="block w-full mt-4 font-semibold text-sm text-center rounded-full py-3.5 transition-all text-black" style={{ background: accent, boxShadow: `0 0 20px ${accent}40` }}>View Full Profile</a>}
          <Branding light />
        </div>
      </div>
    </div>
  );
}

/* Empty state placeholder */
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

/* ═══════════════════════════════════════════════
   MAIN EXPORT — picks template based on user pref
   ═══════════════════════════════════════════════ */
export function LinkInBioContent({ creator }: { creator: Creator }) {
  const { user } = useAuth();
  const isOwner = user && creator.id && user.id === creator.id;
  const template = creator.linkBioTemplate || "minimal";

  const TemplateComponent = {
    minimal: TemplateMinimal,
    glass: TemplateGlass,
    bold: TemplateBold,
    showcase: TemplateShowcase,
    neon: TemplateNeon,
  }[template] || TemplateMinimal;

  return (
    <div>
      {isOwner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-neutral-900 text-white px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs text-white/60">Previewing your link in bio</span>
          <Link href="/dashboard" className="px-3.5 py-1.5 text-xs font-medium bg-white text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors">Back to Dashboard</Link>
        </div>
      )}
      <div className={isOwner ? "pt-[44px]" : ""}>
        <TemplateComponent creator={creator} />
      </div>
    </div>
  );
}
