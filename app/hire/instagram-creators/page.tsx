import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hire Instagram Creators | HireACreator",
  description:
    "Find and hire professional Instagram creators for stunning visual content. Browse verified Instagram influencers for Reels, Stories, and feed posts on HireACreator.",
  alternates: {
    canonical: "https://hireacreator.ai/hire/instagram-creators",
  },
  openGraph: {
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function HireInstagramCreators() {
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
            Hire Instagram Creators
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
            Partner with Instagram creators who produce stunning Reels,
            Stories, and feed posts that elevate your brand{"'"}s visual
            identity and grow your audience.
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
                {"📸"}
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Visual Storytelling Experts
              </h3>
              <p className="text-sm text-neutral-600">
                Instagram creators on our platform specialize in eye-catching
                photography, lifestyle content, and aesthetic brand visuals
                that stop the scroll and drive engagement.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">
                {"🎥"}
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Reels, Stories &amp; Feed Posts
              </h3>
              <p className="text-sm text-neutral-600">
                From short-form Reels that reach new audiences to polished
                feed posts and interactive Stories — hire creators who know
                every Instagram format inside and out.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">
                {"🛍️"}
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Drive Sales Through Content
              </h3>
              <p className="text-sm text-neutral-600">
                Leverage Instagram Shopping, product tags, and shoppable
                content created by influencers who understand how to turn
                followers into paying customers.
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
                Discover Instagram Creators
              </h3>
              <p className="text-sm text-neutral-600">
                Search by aesthetic, niche, and audience demographics. Preview
                portfolios featuring Reels, carousel posts, and branded
                Stories from each creator.
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sm">
                2
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Collaborate on Your Vision
              </h3>
              <p className="text-sm text-neutral-600">
                Share your brand guidelines, mood boards, and campaign goals.
                Your creator will develop content concepts that align with
                your aesthetic and resonate with your target audience.
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sm">
                3
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Publish &amp; Grow Your Brand
              </h3>
              <p className="text-sm text-neutral-600">
                Receive ready-to-post Instagram content including Reels,
                Stories, and feed images. Use them organically or boost them
                as paid ads to maximize your reach.
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
            Elevate your Instagram presence with content from creators who
            understand the platform. Browse verified Instagram talent and
            start your next campaign now.
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
