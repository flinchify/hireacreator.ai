"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-context";

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-neutral-900 shrink-0">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-900">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export default function BrandsPage() {
  const { openSignup } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-white" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
            For Brands & Agencies
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
            Stop scrolling Instagram<br className="hidden sm:block" /> for creators
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Search, book, and pay — all in one place. Every creator is verified with real work, real engagement, and real reviews.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/browse">
              <button className="px-8 py-3.5 text-base font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20 w-full sm:w-auto">
                Find a Creator
              </button>
            </Link>
            <button
              onClick={() => openSignup("brand")}
              className="px-8 py-3.5 text-base font-medium text-neutral-700 bg-transparent rounded-full border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 transition-all w-full sm:w-auto"
            >
              Sign Up as a Brand
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-neutral-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
            How it works
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-14">
            Three steps to great content
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
              <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">01</div>
              <div className="text-2xl font-display font-bold text-white mb-3">Search</div>
              <p className="text-neutral-400 leading-relaxed">
                Filter by category, platform, location, rate, and engagement metrics.
                Find exactly the creator you need in seconds, not days.
              </p>
            </div>
            <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
              <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">02</div>
              <div className="text-2xl font-display font-bold text-white mb-3">Book</div>
              <p className="text-neutral-400 leading-relaxed">
                Pick a service from the creator's menu, submit your brief, and pay securely.
                Funds are held in escrow until you approve the deliverables.
              </p>
            </div>
            <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
              <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">03</div>
              <div className="text-2xl font-display font-bold text-white mb-3">Ship</div>
              <p className="text-neutral-400 leading-relaxed">
                Get deliverables on schedule with full usage rights included.
                Leave a review, rebook your favorites, build a roster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight mb-4">
            Everything you need to hire creators
          </h2>
          <p className="text-neutral-500 text-lg mb-14 max-w-2xl">
            No more spreadsheets, no more DM negotiations, no more ghosting. One platform for the entire workflow.
          </p>

          <div className="grid sm:grid-cols-2 gap-8">
            {[
              {
                title: "Verified creators only",
                desc: "Every creator goes through portfolio review and identity verification. You see real work from real people.",
              },
              {
                title: "Escrow payments",
                desc: "Your money is held securely until you approve the deliverables. No risk, no chasing refunds.",
              },
              {
                title: "Full usage rights",
                desc: "Every booking includes commercial usage rights by default. No surprise licensing fees after the fact.",
              },
              {
                title: "Direct booking",
                desc: "No middlemen, no agency markup. Book directly with creators at their listed price. What you see is what you pay.",
              },
              {
                title: "Real engagement data",
                desc: "We pull and verify follower counts, engagement rates, and audience demographics. No inflated numbers.",
              },
              {
                title: "Reviews from real brands",
                desc: "Every review is tied to a verified booking. No fake testimonials, no paid reviews.",
              },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="mt-1"><CheckIcon /></div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Verification */}
      <section className="bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-6">
                <ShieldIcon />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight mb-6">
                Trust is built in, not bolted on
              </h2>
              <p className="text-neutral-500 text-lg leading-relaxed mb-8">
                We verify every creator before they go live. Fake followers get flagged.
                Engagement rates are calculated from real data. Reviews come from verified bookings only.
              </p>
              <ul className="space-y-4">
                {[
                  "Portfolio review by our team before listing",
                  "Engagement rate verification across platforms",
                  "Fake follower detection and flagging",
                  "Identity verification for all creators",
                  "Reviews tied to completed, verified bookings",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-0.5"><CheckIcon /></div>
                    <span className="text-neutral-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-xl shadow-neutral-200/50">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900">Identity Verified</div>
                    <div className="text-sm text-neutral-500">Government ID confirmed</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900">Portfolio Reviewed</div>
                    <div className="text-sm text-neutral-500">Work samples verified</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900">Engagement Authentic</div>
                    <div className="text-sm text-neutral-500">No fake followers detected</div>
                  </div>
                </div>
                <div className="border-t border-neutral-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Engagement Rate</span>
                    <span className="font-semibold text-neutral-900">4.8%</span>
                  </div>
                  <div className="mt-2 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-900 rounded-full" style={{ width: "72%" }} />
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">Above average for this niche</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            Transparent pricing
          </h2>
          <p className="text-neutral-500 text-lg mb-14 max-w-2xl mx-auto">
            You pay the creator's listed price. No hidden markup, no agency fees, no surprises.
            The price you see on a creator's profile is the price you pay.
          </p>
          <div className="bg-neutral-50 rounded-3xl border border-neutral-200 p-8 sm:p-12 max-w-lg mx-auto">
            <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">For Brands</div>
            <div className="font-display text-4xl font-bold text-neutral-900 mb-2">$0</div>
            <div className="text-neutral-500 mb-6">Free to browse and book</div>
            <ul className="space-y-3 text-left">
              {[
                "No platform fee for brands",
                "Pay only the creator's listed price",
                "Escrow protection included",
                "Full usage rights on all deliverables",
                "Unlimited bookings",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-0.5"><CheckIcon /></div>
                  <span className="text-sm text-neutral-600">{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => openSignup("brand")}
              className="mt-8 w-full px-8 py-3.5 text-base font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-neutral-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Ready to find your next creator?
          </h2>
          <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto">
            Browse verified creators, check real portfolios and reviews, and book the talent you need. No middlemen.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/browse">
              <button className="px-8 py-3.5 text-base font-medium text-neutral-900 bg-white rounded-full hover:bg-neutral-100 transition-colors w-full sm:w-auto">
                Find a Creator
              </button>
            </Link>
            <button
              onClick={() => openSignup("brand")}
              className="px-8 py-3.5 text-base font-medium text-white bg-transparent rounded-full border border-neutral-600 hover:border-neutral-400 transition-all w-full sm:w-auto"
            >
              Sign Up as a Brand
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
