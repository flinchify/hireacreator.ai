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

export function LinkInBioContent({ creator }: { creator: Creator }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background — cover image with blur, or gradient */}
      <div className="fixed inset-0 z-0">
        {creator.cover ? (
          <>
            <img src={creator.cover} alt="" className="w-full h-full object-cover scale-110 blur-2xl" />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md mx-auto px-5 py-10 sm:py-16">
        {/* Avatar + Name */}
        <div className="text-center mb-8">
          {creator.avatar ? (
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-24 h-24 rounded-full border-3 border-white/20 object-cover mx-auto shadow-2xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-3 border-white/20 bg-white/10 backdrop-blur flex items-center justify-center mx-auto shadow-2xl">
              <span className="text-3xl font-bold text-white/80">{creator.name.charAt(0)}</span>
            </div>
          )}
          <div className="mt-4 flex items-center justify-center gap-2">
            <h1 className="font-display text-xl font-bold text-white">{creator.name}</h1>
            {creator.isVerified && <VerifiedBadge />}
            {creator.isPro && <ProBadge />}
          </div>
          {creator.headline && (
            <p className="mt-1.5 text-sm text-white/60 max-w-xs mx-auto">{creator.headline}</p>
          )}
          {creator.location && (
            <p className="mt-1 text-xs text-white/40 flex items-center justify-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
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
              <span className="text-[10px] text-emerald-400 font-medium">Available now</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {creator.bio && (
          <p className="text-sm text-white/50 text-center mb-8 leading-relaxed">{creator.bio}</p>
        )}

        {/* Services as link cards */}
        {creator.services.length > 0 && (
          <div className="space-y-3 mb-8">
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
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
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
          <div className="grid grid-cols-3 gap-2 mb-8">
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

        {/* View full profile link */}
        <a
          href={`/creators/${creator.slug}`}
          className="block bg-white text-neutral-900 font-medium text-sm text-center rounded-full py-3.5 hover:bg-neutral-100 transition-colors shadow-lg active:scale-[0.98]"
        >
          View Full Profile
        </a>

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
        <div className="mt-10 text-center">
          <a href="/" className="text-[10px] text-white/20 hover:text-white/40 transition-colors uppercase tracking-wider">
            hireacreator.ai
          </a>
        </div>
      </div>
    </div>
  );
}
