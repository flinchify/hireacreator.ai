import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCreatorBySlug, CREATORS } from "@/lib/data";

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

function SocialIcon({ platform }: { platform: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
      <span className="text-xs font-medium">{platform.charAt(0)}</span>
    </div>
  );
}

export function generateStaticParams() {
  return CREATORS.map((c) => ({ slug: c.slug }));
}

export default function CreatorProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const creator = getCreatorBySlug(params.slug);

  if (!creator) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* Cover + Avatar Hero */}
      <div className="relative">
        <div className="h-48 sm:h-64 bg-neutral-200 overflow-hidden">
          <img
            src={creator.cover}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end sm:gap-6 pb-6">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-white object-cover shadow-sm"
            />
            <div className="mt-4 sm:mt-0 sm:pb-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900">
                  {creator.name}
                </h1>
                {creator.isVerified && (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-brand-600 shrink-0">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <p className="text-neutral-600 mt-1">{creator.headline}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge>{creator.category}</Badge>
                <span className="text-sm text-neutral-500">{creator.location}</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:pb-2 flex gap-3">
              <Button size="lg">Book Now</Button>
              <Button variant="outline" size="lg">
                Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Row */}
            <Card className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="font-display text-2xl font-bold text-neutral-900">
                    {creator.totalProjects}
                  </div>
                  <div className="text-sm text-neutral-500 mt-0.5">Projects</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <StarIcon />
                    <span className="font-display text-2xl font-bold text-neutral-900">
                      {creator.rating}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-500 mt-0.5">Rating</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-2xl font-bold text-neutral-900">
                    {creator.reviewCount}
                  </div>
                  <div className="text-sm text-neutral-500 mt-0.5">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-2xl font-bold text-neutral-900">
                    ${creator.hourlyRate}
                  </div>
                  <div className="text-sm text-neutral-500 mt-0.5">Per hour</div>
                </div>
              </div>
            </Card>

            {/* About */}
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
                About
              </h2>
              <p className="text-neutral-600 leading-relaxed">{creator.bio}</p>

              {/* Socials */}
              <div className="mt-6 pt-6 border-t border-neutral-100">
                <div className="flex flex-wrap gap-4">
                  {creator.socials.map((s) => (
                    <div
                      key={s.platform}
                      className="flex items-center gap-2 text-sm"
                    >
                      <SocialIcon platform={s.platform} />
                      <div>
                        <div className="font-medium text-neutral-900">
                          {s.handle}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {s.followers} followers
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Portfolio */}
            <div>
              <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
                Portfolio
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {creator.portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-100"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4">
                        <div className="text-white font-medium text-sm">
                          {item.title}
                        </div>
                        <div className="text-white/70 text-xs mt-0.5">
                          {item.category}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {creator.reviews.length > 0 && (
              <div>
                <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
                  Reviews ({creator.reviewCount})
                </h2>
                <div className="space-y-4">
                  {creator.reviews.map((review) => (
                    <Card key={review.id} className="p-6">
                      <div className="flex items-start gap-3">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
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
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Services */}
            <div>
              <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
                Services
              </h2>
              <div className="space-y-4">
                {creator.services.map((service) => (
                  <Card key={service.id} hover className="p-5">
                    <h3 className="font-semibold text-neutral-900">
                      {service.title}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
                      <div>
                        <span className="font-display text-lg font-bold text-neutral-900">
                          ${service.price.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-400">
                        {service.deliveryDays} day delivery
                      </span>
                    </div>
                    <Button className="w-full mt-3" size="sm">
                      Book This Service
                    </Button>
                  </Card>
                ))}
              </div>
            </div>

            {/* Availability Calendar Placeholder */}
            <Card className="p-5">
              <h3 className="font-semibold text-neutral-900 mb-3">
                Availability
              </h3>
              <div className="grid grid-cols-7 gap-1 text-center">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                  <div
                    key={i}
                    className="text-xs font-medium text-neutral-400 py-1"
                  >
                    {day}
                  </div>
                ))}
                {Array.from({ length: 28 }).map((_, i) => {
                  const isAvailable = ![2, 3, 10, 15, 22, 23].includes(i);
                  return (
                    <div
                      key={i}
                      className={`text-xs py-1.5 rounded ${
                        isAvailable
                          ? "text-neutral-900 hover:bg-neutral-100 cursor-pointer"
                          : "text-neutral-300"
                      }`}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-neutral-400 mt-3">
                Green dates are available for booking
              </p>
            </Card>

            {/* Share Profile */}
            <Card className="p-5">
              <h3 className="font-semibold text-neutral-900 mb-3">
                Share this profile
              </h3>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={`hireacreator.ai/creators/${creator.slug}`}
                  className="flex-1 text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-neutral-600"
                />
                <Button variant="secondary" size="sm">
                  Copy
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
