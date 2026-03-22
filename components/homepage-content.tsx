"use client";

import { useEffect, useRef, useState } from "react";
import { ScoreChecker } from "./score-checker";
import { AnimateOnScroll, StaggerChildren } from "./animate-on-scroll";
import { PlatformTicker } from "./platform-ticker";
import { CreatorCard } from "./creator-card";
import type { Creator } from "@/lib/types";

/* ─── Animated score gauge for demo ─── */
function DemoGauge({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / 1500, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimated(Math.round(score * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [score]);

  const size = 180;
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animated / 100) * circumference;

  return (
    <div ref={ref} className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="white" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tracking-tight text-white font-display">
          {animated}
        </span>
        <span className="text-sm text-white/70 font-medium mt-1">Excellent</span>
      </div>
    </div>
  );
}

/* ─── Feature icons (inline SVGs) ─── */
const featureIcons = {
  portfolio: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
    </svg>
  ),
  score: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  matching: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  link: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  ),
  cross: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  payments: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" />
    </svg>
  ),
};

/* ─── Brand feature icons ─── */
const brandIcons = {
  matched: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  verified: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  campaign: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
  secure: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
};

/* ─── FAQ data ─── */
const faqs = [
  { q: "How does HireACreator work?", a: "Tag @hireacreator on any social platform (or enter your handle on our site). Our AI builds your creator profile, scores your brand-deal potential, and lists you in our marketplace for brands to discover." },
  { q: "Is it free to use?", a: "Checking your score and claiming your profile is completely free. We take a small percentage only when you complete a paid brand deal through the platform." },
  { q: "What is a creator score?", a: "A transparent 0-100 rating based on your profile quality, reach, engagement rate, niche demand, and content consistency. Brands use it to find the right creators for their campaigns." },
  { q: "How do I get paid?", a: "Through Stripe. Once you complete a brand deal, payment is released from escrow directly to your bank account. No invoicing headaches." },
  { q: "Which platforms are supported?", a: "Instagram, TikTok, YouTube, X (Twitter), LinkedIn, Twitch, Spotify, Pinterest, Facebook, Snapchat, Discord, GitHub, Reddit, and more being added regularly." },
  { q: "Can I claim a profile someone else tagged?", a: "Only the real account owner can claim a profile. We verify ownership through email or social login to prevent impersonation." },
];

export function HomepageContent({ featured, creatorCount }: { featured: Creator[]; creatorCount: number }) {
  return (
    <>
      {/* ═══ Section 1: Hero ═══ */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 px-5 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(219,234,254,0.5) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center animate-hero-fade-in">
          <span className="inline-block bg-blue-50 text-blue-600 rounded-full text-xs font-medium px-3 py-1 mb-6">
            The creator marketplace
          </span>

          <h1
            className="text-3xl sm:text-4xl lg:text-6xl text-neutral-800 leading-tight mb-4 font-serif"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Find and hire creators, instantly.
          </h1>

          <p className="text-neutral-500 text-base max-w-lg mx-auto mt-4">
            Tag us on Instagram. We build your profile, score your potential, and connect you with brand deals.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <a
              href="/claim"
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full px-6 py-3 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all min-h-[48px]"
            >
              Get Your Score
            </a>
            <a
              href="/for-brands"
              className="inline-flex items-center justify-center bg-white border border-neutral-200 text-neutral-700 rounded-full px-6 py-3 font-medium hover:bg-neutral-50 transition-colors min-h-[48px]"
            >
              For Brands
            </a>
          </div>

          <div className="mt-10 flex justify-center px-0 sm:px-0">
            <ScoreChecker variant="light" />
          </div>
          <p className="text-xs text-neutral-400 mt-3">No signup required</p>
        </div>
      </section>

      {/* ═══ Section 2: Trust Bar ═══ */}
      {creatorCount > 0 && (
        <section className="py-8 border-y border-neutral-100">
          <p className="text-sm text-neutral-400 text-center">
            Trusted by {creatorCount.toLocaleString()}+ creators
          </p>
        </section>
      )}

      {/* ═══ Section 3: Platform Ticker ═══ */}
      <AnimateOnScroll as="section" className="py-10 px-5">
        <p className="text-sm text-neutral-400 text-center mb-4">One profile for all your platforms</p>
        <PlatformTicker />
      </AnimateOnScroll>

      {/* ═══ Section 4: How It Works ═══ */}
      <section className="my-4">
        <div className="bg-blue-50 py-16 sm:py-24 rounded-3xl mx-4 sm:mx-6">
          <div className="max-w-5xl mx-auto px-5">
            <h2
              className="text-2xl sm:text-3xl text-neutral-800 text-center mb-12 font-serif"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              How it works
            </h2>
            <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  title: "Tag @hireacreator",
                  desc: "On Instagram, X, TikTok, or YouTube. Tag us or any creator and we build their profile instantly.",
                },
                {
                  step: "2",
                  title: "AI scores your profile",
                  desc: "We analyze your reach, engagement, niche, and content to generate your creator score and estimated brand deal rate.",
                },
                {
                  step: "3",
                  title: "Get brand deals",
                  desc: "Claim your profile, appear in our marketplace, and start receiving brand deal offers that match your niche.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="aos-stagger-item bg-white rounded-2xl p-6 sm:p-8 shadow-md shadow-neutral-900/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-sm">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-neutral-800 text-base mt-4">{item.title}</h3>
                  <p className="text-neutral-500 text-sm mt-2 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* ═══ Section 5: For Creators ═══ */}
      <section className="py-16 sm:py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            <span className="inline-block bg-blue-50 text-blue-600 rounded-full text-xs px-3 py-1 font-medium">
              For Creators
            </span>
            <h2
              className="text-2xl sm:text-3xl text-neutral-800 text-center mt-4 mb-12 font-serif"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Everything you need to grow
            </h2>
          </div>
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: featureIcons.portfolio, title: "AI-Built Portfolio", desc: "We auto-generate a stunning portfolio page from your social profiles." },
              { icon: featureIcons.score, title: "Creator Score", desc: "A transparent 0-100 score that shows brands exactly what you bring." },
              { icon: featureIcons.matching, title: "Brand Deal Matching", desc: "Get matched with campaigns that fit your niche and audience." },
              { icon: featureIcons.link, title: "Link-in-Bio", desc: "One link for all your platforms, content, and brand deal rates." },
              { icon: featureIcons.cross, title: "Cross-Platform Profile", desc: "Combine stats from 15+ platforms into one unified creator profile." },
              { icon: featureIcons.payments, title: "Direct Payments", desc: "Get paid securely through Stripe. No invoicing headaches." },
            ].map((feature) => (
              <div
                key={feature.title}
                className="aos-stagger-item bg-white border border-neutral-100 rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-neutral-800 text-sm sm:text-base mt-3">{feature.title}</h3>
                <p className="text-neutral-500 text-sm mt-1">{feature.desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══ Section 6: Score Demo ═══ */}
      <AnimateOnScroll className="mx-4 sm:mx-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl py-16 px-5 sm:px-12 text-white text-center">
          <h2
            className="text-2xl sm:text-3xl text-white font-serif"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            See what you are worth
          </h2>
          <p className="text-white/70 text-sm mt-2 max-w-md mx-auto">
            Every creator gets a transparency score. This is what yours could look like.
          </p>

          <div className="flex flex-col items-center gap-8 mt-10">
            <DemoGauge score={85} />

            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "Reach", value: "92%" },
                { label: "Engagement", value: "78%" },
                { label: "Niche", value: "85%" },
              ].map((item) => (
                <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                  <div className="text-lg font-bold text-white">{item.value}</div>
                  <div className="text-xs text-white/50">{item.label}</div>
                </div>
              ))}
            </div>

            <a
              href="/claim"
              className="inline-flex items-center gap-2 bg-white text-blue-600 rounded-full px-6 py-3 font-semibold text-sm hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20 mt-8"
            >
              Check your real score
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </AnimateOnScroll>

      {/* ═══ Section 7: For Brands ═══ */}
      <section className="py-16 sm:py-24 px-5">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block bg-blue-50 text-blue-600 rounded-full text-xs px-3 py-1 font-medium">
            For Brands
          </span>
          <h2
            className="text-2xl sm:text-3xl text-neutral-800 mt-4 mb-12 font-serif"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Find creators that move the needle
          </h2>
          <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              { icon: brandIcons.matched, title: "AI-Matched Creators", desc: "Our algorithm finds creators that fit your brand, niche, and budget." },
              { icon: brandIcons.verified, title: "Scored & Verified", desc: "Every creator has a transparency score. Know what you are paying for." },
              { icon: brandIcons.campaign, title: "Campaign Management", desc: "Post briefs, review applications, and manage deals in one dashboard." },
              { icon: brandIcons.secure, title: "Secure Payments", desc: "Escrow-based payments through Stripe. Pay only when satisfied." },
            ].map((card) => (
              <div
                key={card.title}
                className="aos-stagger-item bg-white border border-neutral-100 rounded-2xl p-6 text-center shadow-md shadow-neutral-900/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-center mb-3">{card.icon}</div>
                <h3 className="font-semibold text-neutral-800 mb-2 text-sm sm:text-base">{card.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══ Section 8: Featured Creators ═══ */}
      {featured.length > 0 && (
        <section className="my-4">
          <div className="bg-blue-50 py-16 rounded-3xl mx-4 sm:mx-6">
            <div className="max-w-5xl mx-auto px-5">
              <h2
                className="text-2xl sm:text-3xl text-neutral-800 text-center mb-12 font-serif"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Featured this week
              </h2>
              <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((creator) => (
                  <div key={creator.id} className="aos-stagger-item">
                    <CreatorCard creator={creator} />
                  </div>
                ))}
              </StaggerChildren>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Section 9: FAQ ═══ */}
      <section className="py-16 px-5">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl text-neutral-800 text-center mb-12 font-serif"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Questions? Answered.
          </h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group border border-neutral-100 rounded-xl">
                <summary className="px-5 py-4 cursor-pointer font-medium text-neutral-800 text-sm flex justify-between items-center hover:bg-neutral-50 rounded-xl transition-colors">
                  {faq.q}
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform shrink-0 ml-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                </summary>
                <div className="faq-content px-5 pb-4 text-sm text-neutral-500 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 10: Final CTA ═══ */}
      <section className="my-4 mb-8">
        <div className="bg-neutral-900 rounded-3xl mx-4 sm:mx-6 py-16 px-5 text-white text-center">
          <h2
            className="text-2xl sm:text-3xl text-white font-serif"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Start your creator career today
          </h2>
          <p className="text-neutral-400 text-sm mt-3 max-w-md mx-auto mb-10">
            {creatorCount > 0
              ? `Join ${creatorCount.toLocaleString()} creators already on the platform.`
              : "Free forever. No signup required."}
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <ScoreChecker variant="onBlue" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
