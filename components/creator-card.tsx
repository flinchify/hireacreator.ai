import Link from "next/link";
import { Badge } from "./ui/badge";
import { PlatformIcon } from "./icons/platforms";
import type { Creator } from "@/lib/types";

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Link href={`/creators/${creator.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-neutral-300 hover:shadow-lg transition-all duration-200">
        <div className="relative h-32 bg-neutral-100">
          {creator.cover ? (
            <img
              src={creator.cover}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
          )}
          <div className="absolute -bottom-6 left-4">
            {creator.avatar ? (
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-14 h-14 rounded-full border-2 border-white object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full border-2 border-white bg-neutral-200 flex items-center justify-center">
                <span className="text-lg font-semibold text-neutral-500">
                  {creator.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 pb-5 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-neutral-900 truncate">
                  {creator.name}
                </h3>
                {creator.isVerified && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-brand-600 shrink-0">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              {creator.headline && (
                <p className="text-sm text-neutral-500 truncate mt-0.5">
                  {creator.headline}
                </p>
              )}
            </div>
          </div>

          {/* Profile link */}
          <div className="mt-2">
            <span className="text-xs text-neutral-400 font-mono">
              hireacreator.ai/{creator.slug}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            {creator.category && <Badge>{creator.category}</Badge>}
            {creator.location && (
              <span className="text-xs text-neutral-400">{creator.location}</span>
            )}
          </div>

          {/* Platform icons */}
          {creator.socials.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {creator.socials.slice(0, 5).map((s) => (
                <PlatformIcon
                  key={s.platform}
                  platform={s.platform}
                  size={16}
                  className="text-neutral-300 group-hover:text-neutral-500 transition-colors"
                />
              ))}
              {creator.socials.length > 5 && (
                <span className="text-xs text-neutral-400">+{creator.socials.length - 5}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
            <div className="flex items-center gap-1">
              <StarIcon />
              <span className="text-sm font-medium text-neutral-900">
                {creator.rating}
              </span>
              <span className="text-xs text-neutral-400">
                ({creator.reviewCount})
              </span>
            </div>
            {creator.hourlyRate && (
              <span className="text-sm font-semibold text-neutral-900">
                ${creator.hourlyRate}/hr
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
