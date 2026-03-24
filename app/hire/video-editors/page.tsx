import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hire Video Editors | HireACreator",
  description:
    "Find and hire skilled video editors for professional content editing. Browse verified editors for social media clips, long-form content, and brand videos on HireACreator.",
  alternates: { canonical: "https://hireacreator.ai/hire/video-editors" },
  openGraph: {
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function HireVideoEditors() {
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
            Hire Video Editors
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
            Work with professional video editors who transform raw footage
            into polished social media clips, YouTube videos, podcast
            highlights, and brand content.
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
                {"✂️"}
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Platform-Optimized Editing
              </h3>
              <p className="text-sm text-neutral-600">
                Our editors know the specs, pacing, and styles that perform
                best on each platform — from fast-cut TikTok clips to
                long-form YouTube edits and everything in between.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">
                {"🎞️"}
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Full Post-Production Services
              </h3>
              <p className="text-sm text-neutral-600">
                Get more than just cuts and transitions. Hire editors skilled
                in color grading, motion graphics, subtitles, sound design,
                and thumbnail creation for a complete package.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">
                {"⚡"}
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Fast Turnaround Times
              </h3>
              <p className="text-sm text-neutral-600">
                Content moves fast and your editing shouldn{"'"}t slow you
                down. Our video editors deliver polished work on tight
                deadlines so you can publish consistently.
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
                Browse Video Editors
              </h3>
              <p className="text-sm text-neutral-600">
                Filter editors by specialty — social media clips, YouTube
                long-form, podcast highlights, or brand commercials. Watch
                portfolio samples to find your style match.
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sm">
                2
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Upload Your Raw Footage
              </h3>
              <p className="text-sm text-neutral-600">
                Share your footage, reference videos, and editing notes. Your
                editor will handle the rest — from rough cut to final
                delivery, with revisions included.
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sm">
                3
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Get Publish-Ready Videos
              </h3>
              <p className="text-sm text-neutral-600">
                Receive professionally edited videos exported in the right
                formats and aspect ratios for each platform. Download, post,
                and watch the engagement roll in.
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
            Stop spending hours editing videos yourself. Hire a professional
            video editor and get back to creating. Browse our talent
            marketplace and book your first edit today.
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
