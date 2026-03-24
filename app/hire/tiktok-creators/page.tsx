import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hire TikTok Creators | HireACreator",
  description:
    "Find and hire expert TikTok creators for viral short-form video content. Browse verified TikTok influencers and manage campaigns through HireACreator.",
  alternates: { canonical: "https://hireacreator.ai/hire/tiktok-creators" },
  openGraph: {
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function HireTikTokCreators() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Hire TikTok Creators
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
            Work with TikTok-native creators who understand viral trends, the
            algorithm, and how to captivate Gen Z audiences with short-form
            video content.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 min-h-[48px] bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Creators
          </Link>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-8 text-center"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Why Hire Through HireACreator?
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">
                {"📱"}
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                TikTok-Native Talent
              </h3>
              <p className="text-sm text-neutral-600">
                Our creators live and breathe TikTok. They know what{"'"}s
                trending, how to hook viewers in the first second, and how to
                ride the algorithm for maximum reach.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">
                {"🚀"}
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Built for Virality
              </h3>
              <p className="text-sm text-neutral-600">
                TikTok rewards authenticity and creativity over production
                budgets. Our creators craft short-form videos designed to get
                shared, stitched, and dueted across the platform.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">
                {"🎯"}
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Reach Gen Z &amp; Millennials
              </h3>
              <p className="text-sm text-neutral-600">
                TikTok is where younger audiences discover brands. Hire
                creators who speak their language and know how to turn views
                into followers, clicks, and customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-8 text-center"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            How It Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sm">
                1
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Find TikTok Creators
              </h3>
              <p className="text-sm text-neutral-600">
                Browse verified TikTok creators by niche, follower count, and
                content style. Preview their past work and engagement rates
                before reaching out.
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sm">
                2
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Share Your Campaign Brief
              </h3>
              <p className="text-sm text-neutral-600">
                Outline your goals — whether it{"'"}s a product launch, trend
                participation, or brand awareness campaign. The creator will
                pitch creative concepts tailored to TikTok{"'"}s format.
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sm">
                3
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Go Viral Together
              </h3>
              <p className="text-sm text-neutral-600">
                Receive polished TikTok-ready videos optimized for the
                algorithm. Repurpose them as Spark Ads or organic posts to
                amplify your brand{"'"}s presence on the platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Ready to Get Started?
          </h2>
          <p className="text-neutral-600 mb-8 max-w-xl mx-auto">
            Stop guessing what works on TikTok. Hire a creator who already
            knows. Browse our marketplace and launch your next viral campaign
            today.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 min-h-[48px] bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Find Your Creator
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
