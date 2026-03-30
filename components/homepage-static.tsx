import { ScoreChecker } from "./score-checker";
import { CreatorCard } from "./creator-card";
import { FaqAccordion } from "./faq-accordion";
import type { Creator } from "@/lib/types";

const faqs = [
  {
    q: "How does HireACreator work?",
    a: "Brands browse or search our marketplace to find creators by niche, platform, and engagement metrics. AI agents can do the same via our RESTful API. Once matched, you send a brief, negotiate terms, and book directly. Payments are held in escrow and released on delivery approval.",
  },
  {
    q: "Is it free for creators?",
    a: "Yes. Creators pay 0% platform fees. Building your profile is free, listing in the marketplace is free, and you keep 100% of what brands pay you.",
  },
  {
    q: "How do payments work?",
    a: "Through Stripe-powered escrow. When a creator accepts a deal, funds are held securely. After the creator delivers and the brand approves, payment is released directly to the creator's bank account.",
  },
  {
    q: "What is the API for?",
    a: "Our RESTful API lets AI agents and software platforms programmatically search for creators, send booking requests, and manage campaigns. It is designed for the next generation of autonomous marketing tools.",
  },
  {
    q: "Which platforms are supported?",
    a: "Instagram, TikTok, YouTube, X (Twitter), LinkedIn, Twitch, Spotify, Pinterest, Facebook, Snapchat, Discord, GitHub, Reddit, and more being added regularly.",
  },
  {
    q: "Can AI agents book creators autonomously?",
    a: "Yes. Domain-verified agents can search creators, send briefs, negotiate, and initiate escrow-protected payments through our API. Human approval checkpoints are configurable.",
  },
];

function CheckIcon({ className = "text-blue-500" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={`${className} shrink-0 mt-0.5`}>
      <path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HomepageStatic({ featured, creatorCount }: { featured: Creator[]; creatorCount: number }) {
  return (
    <>
      {/* Section 1: Hero */}
      <section className="relative pt-32 sm:pt-44 pb-20 sm:pb-28 px-5 overflow-hidden min-h-[85vh] flex flex-col justify-center">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            radial-gradient(ellipse 120% 80% at 20% 10%, rgba(56,189,248,0.10) 0%, transparent 50%),
            radial-gradient(ellipse 100% 60% at 80% 20%, rgba(59,130,246,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 80% 100% at 50% 80%, rgba(14,165,233,0.05) 0%, transparent 50%),
            linear-gradient(180deg, rgba(240,249,255,0.6) 0%, rgba(255,255,255,1) 100%)
          `,
        }} />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl text-neutral-900 leading-tight tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Creator hiring infrastructure
            <br />
            for the AI era.
          </h1>

          <p className="text-neutral-500 text-base sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
            Discover, book, and pay creators in one place — whether you are a brand team or an AI agent acting on behalf of one.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <a href="/browse" className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-8 py-3.5 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all min-h-[48px] text-sm" style={{ fontFamily: "var(--font-display)" }}>
              Hire Creators
            </a>
            <a href="/for-agents" className="inline-flex items-center justify-center bg-white border border-neutral-200 text-neutral-700 rounded-lg px-8 py-3.5 font-medium hover:bg-neutral-50 hover:border-neutral-300 transition-all min-h-[48px] text-sm" style={{ fontFamily: "var(--font-display)" }}>
              Explore API
            </a>
          </div>

          <div className="mt-10 flex justify-center">
            <ScoreChecker variant="light" />
          </div>

          {creatorCount > 0 && (
            <p className="text-xs text-neutral-400 mt-4">
              Trusted by {creatorCount.toLocaleString()}+ creators
            </p>
          )}
        </div>
      </section>

      {/* Section 2: Two-Column Value Props */}
      <section className="py-16 sm:py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* For Brands */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-8 sm:p-10">
              <h2 className="text-xl sm:text-2xl text-neutral-900 mb-6" style={{ fontFamily: "var(--font-display)" }}>
                For Brands
              </h2>
              <ul className="space-y-4">
                {[
                  { title: "AI-matched creator discovery", desc: "Find the right creators by niche, audience, and engagement metrics." },
                  { title: "Direct booking and payments", desc: "Send briefs, negotiate, and pay — all in one place." },
                  { title: "Escrow-protected deals", desc: "Funds are held securely and released only on delivery approval." },
                  { title: "Campaign management", desc: "Track briefs, deliverables, and payments from a single dashboard." },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <CheckIcon />
                    <div>
                      <p className="font-semibold text-neutral-800 text-sm">{item.title}</p>
                      <p className="text-neutral-500 text-sm mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* For AI Agents */}
            <div className="bg-neutral-900 text-white rounded-2xl p-8 sm:p-10">
              <h2 className="text-xl sm:text-2xl text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                For AI Agents
              </h2>
              <ul className="space-y-4">
                {[
                  { title: "RESTful API access", desc: "Full programmatic access to the creator marketplace." },
                  { title: "Programmatic creator search and booking", desc: "Search, filter, and book creators with API calls." },
                  { title: "Domain-verified agent workflows", desc: "Secure agent authentication tied to your organization." },
                  { title: "Webhooks for autonomous hiring", desc: "Real-time event notifications for end-to-end automation." },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <CheckIcon className="text-blue-400" />
                    <div>
                      <p className="font-semibold text-white text-sm">{item.title}</p>
                      <p className="text-neutral-400 text-sm mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section className="my-4">
        <div className="bg-blue-50 py-16 sm:py-24 rounded-3xl mx-4 sm:mx-6">
          <div className="max-w-5xl mx-auto px-5">
            <h2 className="text-2xl sm:text-3xl text-neutral-900 text-center mb-12" style={{ fontFamily: "var(--font-display)" }}>
              How it works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: "1", title: "Discover", desc: "Browse creators or search via API. AI-scored profiles with engagement metrics, audience data, and niche classification." },
                { step: "2", title: "Book", desc: "Send a brief, negotiate, and book directly. Or let your AI agent handle the entire workflow programmatically." },
                { step: "3", title: "Pay", desc: "Escrow-protected payments. Creators keep 100%. Funds are released on delivery approval." },
              ].map((item) => (
                <div key={item.step} className="bg-white rounded-2xl p-6 sm:p-8 shadow-md shadow-neutral-900/5">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-sm">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-neutral-900 text-lg mt-4">{item.title}</h3>
                  <p className="text-neutral-500 text-sm mt-2 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: For Creators */}
      <section className="py-16 sm:py-24 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl text-neutral-900 mb-6" style={{ fontFamily: "var(--font-display)" }}>
            Creators keep everything.
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base max-w-xl mx-auto mb-12">
            No platform fees. No hidden costs. You keep 100% of what brands pay you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            {[
              "0% platform fees on earnings",
              "AI-built profile in 60 seconds from any social handle",
              "18 customizable templates",
              "Bookings, calendar, messaging built in",
              "Get discovered by brands AND AI agents",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 bg-white border border-neutral-100 rounded-xl p-4">
                <CheckIcon />
                <span className="text-sm text-neutral-700">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <a href="/claim" className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-8 py-3.5 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all min-h-[48px] text-sm" style={{ fontFamily: "var(--font-display)" }}>
              Claim Your Profile
            </a>
          </div>
        </div>
      </section>

      {/* Section 5: Featured Creators */}
      {featured.length > 0 && (
        <section className="py-16 sm:py-24 px-5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl text-neutral-900 text-center mb-12" style={{ fontFamily: "var(--font-display)" }}>
              Featured creators
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {featured.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 6: FAQ */}
      <section className="py-16 px-5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl text-neutral-900 text-center mb-12" style={{ fontFamily: "var(--font-display)" }}>
            Questions? Answered.
          </h2>
          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      {/* Section 7: Final CTA */}
      <section className="my-4 mb-8">
        <div className="bg-neutral-900 rounded-3xl mx-4 sm:mx-6 py-16 sm:py-20 px-5 text-white text-center">
          <h2 className="text-2xl sm:text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
            The future of creator hiring is here.
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-4 max-w-lg mx-auto">
            Whether you are a brand, an agency, or building the next AI agent — HireACreator is the infrastructure layer.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <a href="/claim" className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-8 py-3.5 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all min-h-[48px] text-sm" style={{ fontFamily: "var(--font-display)" }}>
              Get Started
            </a>
            <a href="/for-agents" className="inline-flex items-center justify-center border border-white/20 text-white rounded-lg px-8 py-3.5 font-medium hover:bg-white/10 transition-all min-h-[48px] text-sm" style={{ fontFamily: "var(--font-display)" }}>
              Read API Docs
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
