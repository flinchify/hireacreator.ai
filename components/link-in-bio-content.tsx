"use client";

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

function LinkInBioCard({ creator }: { creator: Creator }) {
  const isEmpty = !creator.bio && creator.services.length === 0 && creator.socials.length === 0 && creator.portfolio.length === 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 sm:absolute">
        {creator.cover ? (
          <>
            <img src={creator.cover} alt="" className="w-full h-full object-cover scale-110 blur-2xl" />
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md mx-auto px-5 py-10 sm:py-12">
        {/* Avatar + Name */}
        <div className="text-center mb-6">
          {creator.avatar ? (
            <img
              src={creator.avatar}
              alt={creator.name || "Creator"}
              className="w-24 h-24 rounded-full border-3 border-white/20 object-cover mx-auto shadow-2xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-3 border-white/20 bg-white/10 flex items-center justify-center mx-auto shadow-2xl">
              <span className="text-3xl font-bold text-white/80">{(creator.name || "?").charAt(0)}</span>
            </div>
          )}
          <div className="mt-4 flex items-center justify-center gap-2">
            <h1 className="font-display text-xl font-bold text-white">{creator.name || "Your Name"}</h1>
            {creator.isVerified && <VerifiedBadge />}
            {creator.isPro && <ProBadge />}
          </div>
          {creator.headline ? (
            <p className="mt-1.5 text-sm text-white/60 max-w-xs mx-auto">{creator.headline}</p>
          ) : isEmpty ? (
            <p className="mt-1.5 text-sm text-white/40 max-w-xs mx-auto">Add a headline in your dashboard</p>
          ) : null}
          {creator.location && (
            <p className="mt-1 text-xs text-white/40 flex items-center justify-center gap-1">
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

        {/* Bio */}
        {creator.bio && (
          <p className="text-sm text-white/50 text-center mb-6 leading-relaxed">{creator.bio}</p>
        )}

        {/* Empty state — template links for new users */}
        {isEmpty && (
          <div className="space-y-3 mb-6">
            <div className="bg-white/10 border border-white/10 border-dashed rounded-2xl px-5 py-4 text-center">
              <div className="text-sm text-white/30">Your services will appear here</div>
              <div className="text-[11px] text-white/20 mt-1">Add services in your dashboard</div>
            </div>
            <div className="bg-white/10 border border-white/10 border-dashed rounded-2xl px-5 py-4 text-center">
              <div className="text-sm text-white/30">Your social links will appear here</div>
              <div className="text-[11px] text-white/20 mt-1">Connect your platforms</div>
            </div>
            <a
              href="/dashboard"
              className="block bg-white text-neutral-900 font-medium text-sm text-center rounded-full py-3.5 hover:bg-neutral-100 transition-colors shadow-lg active:scale-[0.98]"
            >
              Set Up Your Profile
            </a>
          </div>
        )}

        {/* Services as link cards */}
        {creator.services.length > 0 && (
          <div className="space-y-3 mb-6">
            {creator.services.map(service => (
              <a
                key={service.id}
                href={`/creators/${creator.slug}`}
                className="block bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 text-center hover:bg-white/15 hover:border-white/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
              >
                <div className="font-medium text-white text-sm">{service.title}</div>
                <div className="text-xs text-white/40 mt-0.5">
                  {service.price === 0 ? "Open to offers" : `From $${service.price.toLocaleString()}`}
                  {service.deliveryDays && ` · ${service.deliveryDays}d delivery`}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Social links */}
        {creator.socials.length > 0 && (
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            {creator.socials.map(social => (
              <a
                key={social.platform}
                href={social.url || `#`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all active:scale-95"
                title={`${social.platform}: ${social.handle}`}
              >
                <PlatformIcon platform={social.platform} size={18} className="text-white/70" />
              </a>
            ))}
          </div>
        )}

        {/* Portfolio thumbnails */}
        {creator.portfolio.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-6">
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
        )}

        {/* View full profile */}
        {!isEmpty && (
          <a
            href={`/creators/${creator.slug}`}
            className="block bg-white text-neutral-900 font-medium text-sm text-center rounded-full py-3.5 hover:bg-neutral-100 transition-colors shadow-lg active:scale-[0.98]"
          >
            View Full Profile
          </a>
        )}

        {/* Stats bar */}
        {(creator.rating > 0 || creator.totalProjects > 0) && (
          <div className="mt-6 flex items-center justify-center gap-6 text-white/30 text-xs">
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
        <div className="mt-8 text-center">
          <a href="/" className="text-[10px] text-white/20 hover:text-white/40 transition-colors uppercase tracking-wider">
            hireacreator.ai
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Exported wrapper: full-bleed on mobile, phone frame on desktop ── */
export function LinkInBioContent({ creator }: { creator: Creator }) {
  return (
    <>
      {/* Mobile: full-screen, no frame */}
      <div className="sm:hidden">
        <LinkInBioCard creator={creator} />
      </div>

      {/* Desktop: centered phone frame */}
      <div className="hidden sm:flex min-h-screen bg-neutral-100 items-center justify-center py-12 px-4">
        <div className="relative">
          {/* Phone frame */}
          <div className="relative w-[390px] h-[844px] bg-black rounded-[3rem] shadow-2xl shadow-black/30 border-[6px] border-neutral-800 overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-2xl z-50" />
            {/* Status bar area */}
            <div className="absolute top-0 left-0 right-0 h-[48px] z-40 flex items-center justify-between px-8 pt-1">
              <span className="text-[11px] text-white/80 font-semibold">
                {new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </span>
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" opacity="0.7"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                <svg width="16" height="14" viewBox="0 0 24 14" fill="white" opacity="0.7"><rect x="0" y="3" width="3" height="11" rx="0.5"/><rect x="5" y="1" width="3" height="13" rx="0.5"/><rect x="10" y="5" width="3" height="9" rx="0.5"/><rect x="15" y="0" width="3" height="14" rx="0.5"/><rect x="20" y="3" width="3" height="8" rx="1" stroke="white" strokeOpacity="0.4" fill="none"/></svg>
              </div>
            </div>
            {/* Content area */}
            <div className="w-full h-full overflow-y-auto overflow-x-hidden rounded-[2.5rem]">
              <LinkInBioCard creator={creator} />
            </div>
            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-white/30 rounded-full z-50" />
          </div>

          {/* Share URL beneath phone */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-neutral-200">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm text-neutral-600 font-medium">hireacreator.ai/u/{creator.slug}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(`https://hireacreator.ai/u/${creator.slug}`); }}
                className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors font-medium"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
