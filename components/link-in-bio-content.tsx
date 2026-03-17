"use client";

import { useState } from "react";
import type { Creator } from "@/lib/types";
import { PlatformIcon } from "./icons/platforms";

function VerifiedBadge() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-500 shrink-0">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm">
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
    <button onClick={share} className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-white/20 transition-all active:scale-90" aria-label="Share">
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-500 dark:text-white/60" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>
      )}
    </button>
  );
}

/* Section header like Stan Store */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center my-5">
      <span className="px-4 py-1.5 bg-neutral-100 dark:bg-white/10 rounded-full text-xs font-semibold text-neutral-700 dark:text-white/70 tracking-wide">
        {children}
      </span>
    </div>
  );
}

export function LinkInBioContent({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0 && creator.portfolio.length === 0;
  const hasServices = creator.services.length > 0;
  const hasSocials = creator.socials.length > 0;
  const hasPortfolio = creator.portfolio.length > 0;

  return (
    <div className="min-h-screen bg-neutral-200 dark:bg-neutral-900">
      {/* Desktop: subtle pattern bg. Mobile: clean */}
      <div className="min-h-screen flex items-start sm:items-center justify-center sm:py-8 sm:px-4">

        {/* Card container — full screen on mobile, contained card on desktop */}
        <div className="w-full sm:max-w-[460px] sm:rounded-3xl sm:shadow-2xl sm:shadow-black/10 bg-white dark:bg-neutral-950 min-h-screen sm:min-h-0 sm:max-h-[92vh] sm:overflow-y-auto relative">

          {/* Cover / Header area */}
          <div className="relative">
            {creator.cover ? (
              <div className="h-32 sm:h-36 sm:rounded-t-3xl overflow-hidden">
                <img src={creator.cover} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
              </div>
            ) : (
              <div className="h-24 sm:h-28 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 sm:rounded-t-3xl" />
            )}

            {/* Top bar — share button */}
            <div className="absolute top-3 right-3 z-10">
              <ShareButton slug={creator.slug} />
            </div>

            {/* Avatar — overlaps cover */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              {creator.avatar ? (
                <img
                  src={creator.avatar}
                  alt={creator.name || "Creator"}
                  className="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-950 object-cover shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-950 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-neutral-400 dark:text-neutral-500">{(creator.name || "?").charAt(0)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-5 pb-8">
            {/* Identity — below avatar overlap */}
            <div className="pt-14 text-center mb-2">
              <div className="flex items-center justify-center gap-1.5">
                <h1 className="font-display text-lg font-bold text-neutral-900 dark:text-white tracking-tight">{creator.name || "Your Name"}</h1>
                {creator.isVerified && <VerifiedBadge />}
                {creator.isPro && <ProBadge />}
              </div>

              {/* @handle */}
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">@{creator.slug?.split("-")[0] || "creator"}</p>

              {creator.headline && (
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-[300px] mx-auto leading-relaxed">{creator.headline}</p>
              )}

              {creator.location && (
                <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500 flex items-center justify-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {creator.location}
                </p>
              )}

              {/* Online indicator */}
              {creator.isOnline && (
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Available now</span>
                </div>
              )}
            </div>

            {/* Social icons row */}
            {hasSocials && (
              <div className="flex items-center justify-center gap-2.5 my-5 flex-wrap">
                {creator.socials.map(social => (
                  <a
                    key={social.platform}
                    href={social.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-white/20 hover:scale-110 transition-all active:scale-95"
                    title={`${social.platform}: ${social.handle}`}
                  >
                    <PlatformIcon platform={social.platform} size={18} className="text-neutral-600 dark:text-white/70" />
                  </a>
                ))}
              </div>
            )}

            {/* Bio */}
            {creator.bio && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mb-2 leading-relaxed max-w-[360px] mx-auto">{creator.bio}</p>
            )}

            {/* ── Services section ── */}
            {hasServices && (
              <>
                <SectionLabel>Services</SectionLabel>
                <div className="space-y-2.5">
                  {creator.services.map(service => (
                    <a
                      key={service.id}
                      href={`/creators/${creator.slug}`}
                      className="group flex items-center gap-3 w-full bg-neutral-50 dark:bg-white/[0.05] border border-neutral-200/80 dark:border-white/[0.08] rounded-2xl px-4 py-3.5 hover:bg-neutral-100 dark:hover:bg-white/[0.08] hover:border-neutral-300 dark:hover:border-white/[0.12] transition-all active:scale-[0.98]"
                    >
                      {/* Service icon */}
                      <div className="w-10 h-10 rounded-xl bg-neutral-200/80 dark:bg-white/10 flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-500 dark:text-white/50">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="7" y1="7" x2="7.01" y2="7" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium text-neutral-900 dark:text-white text-sm truncate">{service.title}</div>
                        <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                          {service.price === 0 ? "Open to offers" : `From $${service.price.toLocaleString()}`}
                          {service.deliveryDays ? ` · ${service.deliveryDays}d` : ""}
                        </div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors shrink-0" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </a>
                  ))}
                </div>
              </>
            )}

            {/* ── Portfolio section ── */}
            {hasPortfolio && (
              <>
                <SectionLabel>Portfolio</SectionLabel>
                <div className="grid grid-cols-3 gap-1.5">
                  {creator.portfolio.slice(0, 6).map(item => (
                    <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-white/5">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-white/20 text-xs">{item.title}</div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Empty state ── */}
            {isEmpty && (
              <>
                {!creator.headline && (
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center italic mt-2">Add a headline in your dashboard</p>
                )}
                <div className="mt-6 space-y-2.5">
                  <div className="flex items-center gap-3 w-full bg-neutral-50 dark:bg-white/[0.03] border border-dashed border-neutral-300 dark:border-white/[0.1] rounded-2xl px-4 py-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-200/60 dark:bg-white/[0.06] flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-300 dark:text-white/20"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" strokeLinecap="round" strokeLinejoin="round" /><line x1="7" y1="7" x2="7.01" y2="7" strokeLinecap="round" /></svg>
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-neutral-400 dark:text-neutral-500">Your services appear here</div>
                      <div className="text-[11px] text-neutral-300 dark:text-neutral-600">Add them in your dashboard</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full bg-neutral-50 dark:bg-white/[0.03] border border-dashed border-neutral-300 dark:border-white/[0.1] rounded-2xl px-4 py-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-200/60 dark:bg-white/[0.06] flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-300 dark:text-white/20"><path d="M16 8a6 6 0 01-12 0" /><path d="M12 2v1m-7 3H4m16 0h-1M6.3 6.3l-.7-.7m12.1.7l.7-.7" strokeLinecap="round" /></svg>
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-neutral-400 dark:text-neutral-500">Social links appear here</div>
                      <div className="text-[11px] text-neutral-300 dark:text-neutral-600">Connect your platforms</div>
                    </div>
                  </div>
                </div>
                <a
                  href="/dashboard"
                  className="block w-full mt-5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm text-center rounded-full py-3.5 hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
                >
                  Set Up Your Profile
                </a>
              </>
            )}

            {/* ── View full profile CTA ── */}
            {!isEmpty && (
              <a
                href={`/creators/${creator.slug}`}
                className="block w-full mt-6 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm text-center rounded-full py-3.5 hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
              >
                View Full Profile
              </a>
            )}

            {/* ── Stats ── */}
            {(creator.rating > 0 || creator.totalProjects > 0 || creator.reviewCount > 0) && (
              <div className="flex items-center justify-center gap-5 mt-5 text-neutral-400 dark:text-neutral-500 text-xs">
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

            {/* ── Footer / Branding ── */}
            <div className="mt-8 pt-5 border-t border-neutral-100 dark:border-white/[0.06] text-center">
              <a href="/" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-50 dark:bg-white/[0.05] hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors">
                <img src="/logo-512.png" alt="H" className="w-4 h-4" />
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">Create your own — free</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
