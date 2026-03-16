"use client";

import { useState } from "react";
import type { Creator } from "@/lib/types";
import { PlatformIcon } from "./icons/platforms";

function VerifiedBadge() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-blue-500 shrink-0">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-full">
      PRO
    </span>
  );
}

function ShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  function share() {
    const url = `https://hireacreator.ai/u/${slug}`;
    if (navigator.share) {
      navigator.share({ title: "Check out my profile", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <button
      onClick={share}
      className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-90 z-20"
      aria-label="Share"
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/70" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
        </svg>
      )}
    </button>
  );
}

export function LinkInBioContent({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0 && creator.portfolio.length === 0;
  const hasServices = creator.services.length > 0;
  const hasSocials = creator.socials.length > 0;
  const hasPortfolio = creator.portfolio.length > 0;

  return (
    <div className="min-h-screen relative">
      {/* Full-bleed background — fills entire viewport on all devices */}
      <div className="fixed inset-0 z-0">
        {creator.cover ? (
          <>
            <img src={creator.cover} alt="" className="w-full h-full object-cover scale-110 blur-2xl brightness-50" />
            <div className="absolute inset-0 bg-black/30" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950" />
        )}
      </div>

      {/* Share button */}
      <ShareButton slug={creator.slug} />

      {/* Centered content column — narrow on all screens */}
      <div className="relative z-10 w-full max-w-[480px] mx-auto px-5 pt-12 pb-10 min-h-screen flex flex-col">

        {/* ── Header: Avatar + Identity ── */}
        <div className="text-center mb-8">
          {creator.avatar ? (
            <img
              src={creator.avatar}
              alt={creator.name || "Creator"}
              className="w-[88px] h-[88px] rounded-full border-[3px] border-white/20 object-cover mx-auto shadow-2xl"
            />
          ) : (
            <div className="w-[88px] h-[88px] rounded-full border-[3px] border-white/20 bg-white/10 flex items-center justify-center mx-auto shadow-2xl">
              <span className="text-3xl font-bold text-white/80">{(creator.name || "?").charAt(0)}</span>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-2">
            <h1 className="font-display text-xl font-bold text-white tracking-tight">{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge />}
            {creator.isPro && <ProBadge />}
          </div>

          {creator.headline ? (
            <p className="mt-1.5 text-sm text-white/60 max-w-[320px] mx-auto leading-relaxed">{creator.headline}</p>
          ) : isEmpty ? (
            <p className="mt-1.5 text-sm text-white/35 italic">Add a headline in your dashboard</p>
          ) : null}

          {creator.location && (
            <p className="mt-1.5 text-xs text-white/40 flex items-center justify-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {creator.location}
            </p>
          )}

          {creator.isOnline && (
            <div className="mt-2 flex items-center justify-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">Available now</span>
            </div>
          )}
        </div>

        {/* ── Social icons (inline, like Linktree) ── */}
        {hasSocials && (
          <div className="flex items-center justify-center gap-3 mb-7 flex-wrap">
            {creator.socials.map(social => (
              <a
                key={social.platform}
                href={social.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 border border-white/[0.08] flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all active:scale-95"
                title={`${social.platform}: ${social.handle}`}
              >
                <PlatformIcon platform={social.platform} size={18} className="text-white/80" />
              </a>
            ))}
          </div>
        )}

        {/* ── Bio ── */}
        {creator.bio && (
          <p className="text-sm text-white/50 text-center mb-7 leading-relaxed max-w-[380px] mx-auto">{creator.bio}</p>
        )}

        {/* ── Content area (grows to fill) ── */}
        <div className="flex-1 space-y-3">

          {/* Services as link buttons */}
          {hasServices && creator.services.map(service => (
            <a
              key={service.id}
              href={`/creators/${creator.slug}`}
              className="group block w-full bg-white/[0.08] border border-white/[0.08] rounded-2xl px-5 py-4 text-center hover:bg-white/[0.14] hover:border-white/[0.15] transition-all active:scale-[0.98]"
            >
              <div className="font-medium text-white text-[15px]">{service.title}</div>
              <div className="text-xs text-white/40 mt-0.5">
                {service.price === 0 ? "Open to offers" : `From $${service.price.toLocaleString()}`}
                {service.deliveryDays ? ` · ${service.deliveryDays}d delivery` : ""}
              </div>
            </a>
          ))}

          {/* Portfolio grid */}
          {hasPortfolio && (
            <div className="pt-2">
              <div className="grid grid-cols-3 gap-1.5">
                {creator.portfolio.slice(0, 6).map(item => (
                  <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-white/5">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">{item.title}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state for new profiles */}
          {isEmpty && (
            <>
              <div className="bg-white/[0.06] border border-white/[0.08] border-dashed rounded-2xl px-5 py-5 text-center">
                <div className="text-sm text-white/25">Your services will appear here</div>
                <div className="text-[11px] text-white/15 mt-1">Add them in your dashboard</div>
              </div>
              <div className="bg-white/[0.06] border border-white/[0.08] border-dashed rounded-2xl px-5 py-5 text-center">
                <div className="text-sm text-white/25">Connect your social platforms</div>
                <div className="text-[11px] text-white/15 mt-1">They'll show as icons above</div>
              </div>
              <a
                href="/dashboard"
                className="block w-full bg-white text-neutral-900 font-medium text-sm text-center rounded-full py-3.5 hover:bg-neutral-100 transition-colors shadow-lg active:scale-[0.98] mt-4"
              >
                Set Up Your Profile
              </a>
            </>
          )}

          {/* View full profile CTA */}
          {!isEmpty && (
            <a
              href={`/creators/${creator.slug}`}
              className="block w-full bg-white text-neutral-900 font-semibold text-sm text-center rounded-full py-3.5 hover:bg-neutral-100 transition-colors shadow-lg active:scale-[0.98] mt-3"
            >
              View Full Profile
            </a>
          )}
        </div>

        {/* ── Footer: stats + branding ── */}
        <div className="mt-8 pt-6 border-t border-white/[0.06]">
          {/* Stats */}
          {(creator.rating > 0 || creator.totalProjects > 0 || creator.reviewCount > 0) && (
            <div className="flex items-center justify-center gap-6 text-white/30 text-xs mb-4">
              {creator.totalProjects > 0 && <span>{creator.totalProjects} projects</span>}
              {creator.rating > 0 && (
                <span className="flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {creator.rating.toFixed(1)}
                </span>
              )}
              {creator.reviewCount > 0 && <span>{creator.reviewCount} reviews</span>}
            </div>
          )}

          {/* Branding */}
          <div className="text-center">
            <a href="/" className="inline-flex items-center gap-1.5 text-[10px] text-white/20 hover:text-white/40 transition-colors uppercase tracking-wider">
              <svg width="12" height="12" viewBox="0 0 32 32" className="opacity-40">
                <rect width="32" height="32" rx="6" fill="white" fillOpacity="0.15" />
                <text x="7" y="23" fontSize="18" fontWeight="bold" fill="white" fillOpacity="0.5">H</text>
              </svg>
              hireacreator.ai
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
