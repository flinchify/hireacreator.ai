import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hire UGC Creators | HireACreator",
  description:
    "Find and hire top UGC creators for authentic user-generated content. Browse verified creators, manage bookings, and pay securely through HireACreator.",
  alternates: { canonical: "https://hireacreator.ai/hire/ugc-creators" },
  openGraph: {
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function HireUgcCreators() {
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
            Hire UGC Creators
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
            Connect with verified UGC creators who craft authentic,
            scroll-stopping content that builds trust and drives real
            conversions for your brand.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
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
                {"🎬"}
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Authentic Content That Converts
              </h3>
              <p className="text-sm text-neutral-600">
                UGC creators produce relatable product reviews, unboxing
                videos, and testimonials that feel genuine — because they are.
                Audiences trust real people over polished ads.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">
                {"✅"}
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Verified &amp; Vetted Creators
              </h3>
              <p className="text-sm text-neutral-600">
                Every UGC creator on our platform is verified with portfolio
                samples and ratings. You{"'"}ll know exactly what to expect
                before you book.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">
                {"🔒"}
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Secure Payments &amp; Clear Terms
              </h3>
              <p className="text-sm text-neutral-600">
                Pay securely through HireACreator with clear deliverables and
                timelines. Funds are held safely until you{"'"}re satisfied with
                the final content.
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
                Browse UGC Creators
              </h3>
              <p className="text-sm text-neutral-600">
                Search our marketplace of verified UGC creators. Filter by
                niche, content style, and budget to find the perfect match for
                your brand{"'"}s voice.
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sm">
                2
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Book &amp; Brief Your Creator
              </h3>
              <p className="text-sm text-neutral-600">
                Send your product, share your brief, and let the creator do
                what they do best — produce authentic user-generated content
                that resonates with your target audience.
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sm">
                3
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Receive &amp; Launch Content
              </h3>
              <p className="text-sm text-neutral-600">
                Get high-quality UGC delivered on time. Use it across your ads,
                social channels, and product pages to boost engagement and
                sales.
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
            Join hundreds of brands already using HireACreator to source
            authentic UGC that outperforms traditional ads. Find your perfect
            creator today.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Find Your Creator
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
