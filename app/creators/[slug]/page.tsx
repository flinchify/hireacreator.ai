export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PlatformIcon } from "@/components/icons/platforms";
import { getCreatorBySlug, getCreatorCalendarSessions } from "@/lib/queries";
import { AnimateOnScroll, StaggerChildren } from "@/components/animate-on-scroll";
import { CountUp } from "@/components/count-up";
import { CreatorHeroActions, ServiceAction, ContactCreatorButton, BoostProfileButton } from "@/components/creator-profile-client";
import { ReviewSection } from "@/components/review-form";
import { ProfileStarButton } from "@/components/profile-star-button";

function StarIcon({ filled = true }: { filled?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      className={filled ? "text-amber-400" : "text-neutral-300"}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-blue-500 shrink-0">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      PRO
    </span>
  );
}

function OnlineIndicator() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      Online now
    </span>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default async function CreatorProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  let creator: Awaited<ReturnType<typeof getCreatorBySlug>> = null;
  try {
    creator = await getCreatorBySlug(params.slug);
  } catch {
    creator = null;
  }

  if (!creator) {
    notFound();
  }

  // Fire-and-forget view tracking
  fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "https://hireacreator.ai"}/api/profile/view?slug=${params.slug}`).catch(() => {});

  // Fetch calendar sessions if enabled
  const calendarSessions = creator.calendarEnabled
    ? await getCreatorCalendarSessions(creator.id)
    : [];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* Cover + Avatar Hero with fade-in */}
      <div className="relative animate-fadeIn">
        <div className="h-48 sm:h-72 bg-neutral-200 overflow-hidden relative">
          {creator.cover ? (
            <img
              src={creator.cover}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-300" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Avatar — overlaps the banner */}
          <div className="relative -mt-16 sm:-mt-20">
            <div className="relative group inline-block">
              {creator.avatar ? (
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-white object-cover shadow-lg transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-white bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-neutral-400">
                    {creator.name.charAt(0)}
                  </span>
                </div>
              )}
              {creator.isOnline && (
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-white" />
                </span>
              )}
            </div>
          </div>

          {/* Name + Info — clearly below banner with gap */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-6 pt-5 sm:pt-6 pb-8 sm:pb-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900">
                  {creator.name}
                </h1>
                {creator.isVerified && <VerifiedBadge />}
                {creator.isPro && <ProBadge />}
                <ProfileStarButton creatorId={creator.id} />
              </div>
              {creator.headline && (
                <p className="text-neutral-600 mt-1 animate-slideUp">{creator.headline}</p>
              )}
              {creator.nicheRank > 0 && creator.nicheRank <= 3 && creator.category && (
                <div className={`inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm bg-gradient-to-r ${creator.nicheRank === 1 ? "from-amber-400 to-yellow-500" : creator.nicheRank === 2 ? "from-neutral-300 to-neutral-400" : "from-amber-600 to-orange-700"}`}>
                  #{creator.nicheRank} in {creator.category}
                </div>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {creator.category && <Badge>{creator.category}</Badge>}
                {creator.location && (
                  <span className="text-sm text-neutral-500 flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {creator.location}
                  </span>
                )}
                {creator.isOnline && <OnlineIndicator />}
              </div>

              {/* Business & website links */}
              {(creator.businessUrl || creator.websiteUrl) && (
                <div className="flex items-center gap-4 mt-3">
                  {creator.businessUrl && (
                    <a
                      href={creator.businessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      <ExternalLinkIcon />
                      {creator.businessName || "Business"}
                    </a>
                  )}
                  {creator.websiteUrl && (
                    <a
                      href={creator.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      <ExternalLinkIcon />
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:items-end mt-4 sm:mt-0">
              <CreatorHeroActions
                hasServices={creator.services.length > 0}
                creatorName={creator.name}
                creatorId={creator.id}
              />
              <BoostProfileButton creatorId={creator.id} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Row */}
            <AnimateOnScroll>
              <Card className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-neutral-900">
                      <CountUp end={creator.totalProjects} />
                    </div>
                    <div className="text-sm text-neutral-500 mt-0.5">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <StarIcon />
                      <span className="font-display text-2xl font-bold text-neutral-900">
                        <CountUp end={creator.rating} decimals={1} />
                      </span>
                    </div>
                    <div className="text-sm text-neutral-500 mt-0.5">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-neutral-900">
                      <CountUp end={creator.reviewCount} />
                    </div>
                    <div className="text-sm text-neutral-500 mt-0.5">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-neutral-900">
                      {creator.hourlyRate ? (
                        <CountUp end={creator.hourlyRate} prefix="$" />
                      ) : (
                        "—"
                      )}
                    </div>
                    <div className="text-sm text-neutral-500 mt-0.5">Per hour</div>
                  </div>
                </div>
              </Card>
            </AnimateOnScroll>

            {/* About */}
            {creator.bio && (
              <AnimateOnScroll>
                <Card className="p-6">
                  <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
                    About
                  </h2>
                  <p className="text-neutral-600 leading-relaxed whitespace-pre-line">{creator.bio}</p>

                  {/* Socials */}
                  {creator.socials.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-neutral-100">
                      <div className="flex flex-wrap gap-4">
                        {creator.socials.map((s) => (
                          <div
                            key={s.platform}
                            className="flex items-center gap-2.5 text-sm bg-neutral-50 rounded-xl px-3 py-2 border border-neutral-100 hover:border-neutral-200 hover:shadow-sm transition-all"
                          >
                            <PlatformIcon platform={s.platform} size={20} className="text-neutral-500" />
                            <div>
                              <div className="font-medium text-neutral-900 text-xs">
                                {s.handle}
                              </div>
                              <div className="text-[10px] text-neutral-400">
                                {s.followers} followers
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </AnimateOnScroll>
            )}

            {/* Portfolio */}
            {creator.portfolio.length > 0 && (
              <AnimateOnScroll>
                <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
                  Portfolio
                </h2>
                <StaggerChildren className="grid grid-cols-2 gap-4" staggerMs={100}>
                  {creator.portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="aos-stagger-item group relative aspect-square rounded-xl overflow-hidden bg-neutral-100 shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      {item.mediaType === "video" && item.video ? (
                        <video
                          src={item.video}
                          poster={item.image || undefined}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                          onMouseLeave={(e) => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0; }}
                        />
                      ) : item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
                          {item.title}
                        </div>
                      )}
                      {/* Video play icon */}
                      {item.mediaType === "video" && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:opacity-0 transition-opacity">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4">
                          <div className="text-white font-medium text-sm">
                            {item.title}
                          </div>
                          {item.category && (
                            <div className="text-white/70 text-xs mt-0.5">
                              {item.category}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </StaggerChildren>
              </AnimateOnScroll>
            )}

            {/* Reviews */}
            {creator.reviews.length > 0 && (
              <AnimateOnScroll>
                <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
                  Reviews ({creator.reviewCount})
                </h2>
                <div className="space-y-4">
                  {creator.reviews.map((review) => (
                    <Card key={review.id} className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        {review.avatar ? (
                          <img
                            src={review.avatar}
                            alt={review.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-neutral-500">
                              {review.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-neutral-900">
                              {review.name}
                            </span>
                            <span className="text-xs text-neutral-400">
                              {review.date}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <StarIcon key={i} filled={i < review.rating} />
                            ))}
                          </div>
                          <p className="text-neutral-600 text-sm mt-2 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </AnimateOnScroll>
            )}

            {/* Review form — only shows if user has completed bookings with this creator */}
            <ReviewSection creatorId={creator.id} creatorName={creator.name} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Services */}
            {creator.services.length > 0 && (
              <AnimateOnScroll>
                <h2 id="services-section" className="font-display text-lg font-semibold text-neutral-900 mb-4 scroll-mt-24">
                  Services
                </h2>
                <div className="space-y-4">
                  {creator.services.map((service) => (
                    <Card key={service.id} hover className="p-5 group">
                      <h3 className="font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                        {service.title}
                      </h3>
                      {service.category && (
                        <span className="inline-block mt-1 text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                          {service.category}
                        </span>
                      )}
                      <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
                        <div>
                          {service.price === 0 ? (
                            <span className="font-display text-lg font-bold text-emerald-600">
                              Open to offers
                            </span>
                          ) : (
                            <span className="font-display text-lg font-bold text-neutral-900">
                              ${service.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-neutral-400">
                          {service.deliveryDays} day delivery
                        </span>
                      </div>
                      <ServiceAction serviceId={service.id} price={service.price} />
                    </Card>
                  ))}
                </div>
              </AnimateOnScroll>
            )}

            {/* No services state */}
            {creator.services.length === 0 && (
              <Card className="p-5 text-center">
                <p className="text-sm text-neutral-500 mb-3">
                  This creator hasn&apos;t listed any services yet.
                </p>
                <ContactCreatorButton creatorName={creator.name} creatorId={creator.id} />
              </Card>
            )}

            {/* Book a Session */}
            {creator.calendarEnabled && calendarSessions.length > 0 && (
              <AnimateOnScroll>
                <Card className="p-5">
                  <h3 className="font-semibold text-neutral-900 mb-3">Book a Session</h3>
                  <div className="space-y-3">
                    {calendarSessions.map((session) => (
                      <div key={session.id} className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100 last:border-0 last:pb-0">
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-neutral-900">{session.title}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">{session.duration_min} min</div>
                          {session.description && (
                            <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{session.description}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold text-neutral-900">
                            {session.price === 0 ? 'Free' : `$${session.price}`}
                          </div>
                          <a
                            href={`/${creator.slug}/links`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            Book
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </AnimateOnScroll>
            )}

            {/* Link in Bio */}
            <AnimateOnScroll>
              <Card className="p-5">
                <h3 className="font-semibold text-neutral-900 mb-3">Creator Page</h3>
                <a
                  href={`/${creator.slug}/links`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors group"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                  <span className="group-hover:underline">View link-in-bio page</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
              </Card>
            </AnimateOnScroll>

            {/* Share Profile */}
            <AnimateOnScroll>
              <Card className="p-5">
                <h3 className="font-semibold text-neutral-900 mb-3">
                  Share this profile
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={`hireacreator.ai/${creator.slug}`}
                    className="flex-1 text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-neutral-600"
                  />
                  <Button variant="secondary" size="sm">
                    Copy
                  </Button>
                </div>
              </Card>
            </AnimateOnScroll>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-slideUp { animation: slideUp 0.5s ease-out 0.2s both; }
      `}</style>
    </div>
  );
}
