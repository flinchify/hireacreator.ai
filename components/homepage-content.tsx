"use client";

import { useEffect, useRef, useState } from "react";
import { ScoreChecker } from "./score-checker";
import { AnimateOnScroll, StaggerChildren } from "./animate-on-scroll";
import { PlatformTicker } from "./platform-ticker";
import { CreatorCard } from "./creator-card";
import type { Creator } from "@/lib/types";

/* ─── Animated count-up hook ─── */
function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
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
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="white" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-outfit)" }}>
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

export function HomepageContent({ featured, creatorCount }: { featured: Creator[]; creatorCount: number }) {
  const stat1 = useCountUp(creatorCount || 12847);
  const stat2 = useCountUp(15);
  const stat3 = useCountUp(0);

  return (
    <>
      {/* ═══ Hero ═══ */}
      <section className="relative pt-32 sm:pt-40 pb-20 px-6 overflow-hidden">
        {/* Subtle blue gradient wash */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(186,230,253,0.4) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center animate-hero-fade-in">
          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-neutral-900 mb-6"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Your{" "}
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              creator
            </span>{" "}
            career starts here.
          </h1>
          <p className="text-base sm:text-lg text-neutral-500 max-w-lg mx-auto px-6 mb-10">
            Build your portfolio. Get your creator score. Land brand deals. All in one link.
          </p>

          <div className="flex justify-center mb-4 px-4 sm:px-0">
            <ScoreChecker variant="light" />
          </div>
          <p className="text-sm text-neutral-400">No signup required — check your score in seconds</p>
        </div>
      </section>

      {/* ═══ Animated Stats Bar ═══ */}
      <AnimateOnScroll as="section" className="bg-gradient-to-r from-blue-500 to-blue-600 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
          <div ref={stat1.ref} className="flex flex-col items-center">
            <div className="glass-stat bg-white/15 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums" style={{ fontFamily: "var(--font-outfit)" }}>
                {stat1.value.toLocaleString()}+
              </div>
              <div className="text-sm text-white/70 mt-1">Creators Scored</div>
            </div>
          </div>
          <div ref={stat2.ref} className="flex flex-col items-center">
            <div className="glass-stat bg-white/15 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums" style={{ fontFamily: "var(--font-outfit)" }}>
                {stat2.value}+
              </div>
              <div className="text-sm text-white/70 mt-1">Platforms</div>
            </div>
          </div>
          <div ref={stat3.ref} className="flex flex-col items-center">
            <div className="glass-stat bg-white/15 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums" style={{ fontFamily: "var(--font-outfit)" }}>
                Coming soon
              </div>
              <div className="text-sm text-white/70 mt-1">Brand Deals</div>
            </div>
          </div>
        </div>
      </AnimateOnScroll>

      {/* ═══ Platform Ticker ═══ */}
      <AnimateOnScroll as="section" className="py-10 px-6">
        <p className="text-sm text-neutral-400 text-center mb-6">Connect 15+ platforms in one profile</p>
        <PlatformTicker />
      </AnimateOnScroll>

      {/* ═══ How It Works ═══ */}
      <section className="py-20 lg:py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
              How it works
            </h2>
          </div>
          <StaggerChildren className="grid md:grid-cols-3 gap-8">
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
                className="aos-stagger-item bg-white border border-neutral-200/60 rounded-2xl p-8 shadow-lg shadow-blue-500/5 text-center hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-default"
              >
                <div
                  className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">{item.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══ For Creators ═══ */}
      <section className="py-20 lg:py-28 px-6 bg-slate-50/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-outfit)" }}>
              Everything{" "}
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">creators</span>{" "}
              need
            </h2>
          </div>
          <StaggerChildren className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                className="aos-stagger-item bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-neutral-900 text-sm sm:text-base mb-1">{feature.title}</h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══ Interactive Score Demo ═══ */}
      <AnimateOnScroll className="mx-4 sm:mx-8 my-8">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl py-16 sm:py-20 px-6 sm:px-12 text-center text-white overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-outfit)" }}>
            See what brands see
          </h2>
          <p className="text-white/70 max-w-md mx-auto mb-10">
            Every creator gets a transparency score. This is what yours could look like.
          </p>

          <div className="flex flex-col items-center gap-8">
            {/* Demo score gauge */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <DemoGauge score={85} />
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                {[
                  { label: "Reach", value: "92%" },
                  { label: "Engagement", value: "78%" },
                  { label: "Niche Value", value: "85%" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-lg font-bold text-white">{item.value}</div>
                    <div className="text-xs text-white/50">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="/claim"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 rounded-full font-semibold text-sm hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20"
            >
              Check your real score
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </AnimateOnScroll>

      {/* ═══ For Brands ═══ */}
      <section className="py-20 lg:py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-12" style={{ fontFamily: "var(--font-outfit)" }}>
            Find creators that move the needle
          </h2>
          <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: brandIcons.matched, title: "AI-Matched Creators", desc: "Our algorithm finds creators that fit your brand, niche, and budget." },
              { icon: brandIcons.verified, title: "Scored and Verified", desc: "Every creator has a transparency score. Know what you are paying for." },
              { icon: brandIcons.campaign, title: "Campaign Management", desc: "Post briefs, review applications, and manage deals in one dashboard." },
              { icon: brandIcons.secure, title: "Secure Payments", desc: "Escrow-based payments through Stripe. Pay only when satisfied." },
            ].map((card) => (
              <div
                key={card.title}
                className="aos-stagger-item bg-white border border-neutral-200/60 rounded-2xl p-6 text-center shadow-lg shadow-blue-500/5 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
              >
                <div className="flex justify-center mb-3">{card.icon}</div>
                <h3 className="font-bold text-neutral-900 mb-2 text-sm sm:text-base">{card.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══ Featured Creators ═══ */}
      {featured.length > 0 && (
        <AnimateOnScroll as="section" className="py-20 lg:py-28 px-6 bg-slate-50/80">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-center mb-12" style={{ fontFamily: "var(--font-outfit)" }}>
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
        </AnimateOnScroll>
      )}

      {/* ═══ Final CTA ═══ */}
      <AnimateOnScroll className="mx-4 sm:mx-8 my-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl py-16 sm:py-20 px-6 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
            Ready to get discovered?
          </h2>
          <p className="text-white/70 mb-10 max-w-md mx-auto">
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
      </AnimateOnScroll>
    </>
  );
}
