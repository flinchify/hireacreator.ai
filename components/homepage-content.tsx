"use client";

import { useEffect, useRef, useState } from "react";
import { ScoreChecker } from "./score-checker";
import { AnimateOnScroll, StaggerChildren } from "./animate-on-scroll";
import { PlatformTicker } from "./platform-ticker";
import { CreatorCard } from "./creator-card";

import type { Creator } from "@/lib/types";

/* ─── Typing rotation for hero ─── */
const heroWords = [
  "starts here",
  "gets discovered",
  "lands brand deals",
  "goes global",
  "levels up",
  "gets paid",
];

function TypingRotation() {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const word = heroWords[wordIndex];

    if (!isDeleting) {
      if (text.length < word.length) {
        timeoutRef.current = setTimeout(() => {
          setText(word.slice(0, text.length + 1));
        }, 80);
      } else {
        // Pause at full word
        timeoutRef.current = setTimeout(() => setIsDeleting(true), 2200);
      }
    } else {
      if (text.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setText(text.slice(0, -1));
        }, 40);
      } else {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % heroWords.length);
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, isDeleting, wordIndex]);

  return (
    <span className="bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 bg-clip-text text-transparent">
      {text}
      <span className="animate-blink text-blue-500">|</span>
    </span>
  );
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
  { q: "How does HireACreator work?", a: "Enter your social handle and we instantly build your creator profile. Customize it, go live in our marketplace, and start getting discovered by brands looking for creators like you." },
  { q: "Is it free?", a: "Completely free to join and build your profile. We only take a small percentage when you complete a paid brand deal through the platform." },
  { q: "How do I get paid?", a: "Through Stripe. When a brand accepts a deal, funds are held in escrow. After you deliver the work and the brand approves it, payment is released directly to your bank account. Funds are never released automatically — only when the brand approves your deliverables." },
  { q: "Which platforms are supported?", a: "Instagram, TikTok, YouTube, X (Twitter), LinkedIn, Twitch, Spotify, Pinterest, Facebook, Snapchat, Discord, GitHub, Reddit, and more being added regularly." },
  { q: "What do brands see on my profile?", a: "Your content, audience stats, niche, engagement metrics, and a transparency rating. Everything they need to decide if you are the right fit for their campaign." },
  { q: "Can someone else claim my profile?", a: "No. Only the real account owner can claim a profile. We verify ownership through email or social login to prevent impersonation." },
];

export function HomepageContent({ featured, creatorCount }: { featured: Creator[]; creatorCount: number }) {
  return (
    <>
      {/* ═══ Section 1: Hero ═══ */}
      <section className="relative pt-32 sm:pt-52 pb-20 sm:pb-32 px-5 overflow-hidden min-h-[90vh] flex flex-col justify-center">
        {/* Ocean gradient mesh background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            radial-gradient(ellipse 120% 80% at 20% 10%, rgba(56,189,248,0.15) 0%, transparent 50%),
            radial-gradient(ellipse 100% 60% at 80% 20%, rgba(59,130,246,0.12) 0%, transparent 50%),
            radial-gradient(ellipse 80% 100% at 50% 80%, rgba(14,165,233,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 90% 70%, rgba(99,102,241,0.06) 0%, transparent 50%),
            linear-gradient(180deg, rgba(240,249,255,0.8) 0%, rgba(255,255,255,1) 100%)
          `,
        }} />
        {/* Subtle animated dots/grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

        {/* Floating social media icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z", x: "8%", y: "15%", delay: "0s", dur: "18s", color: "rgba(228,64,95,0.08)" },
            { icon: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z", x: "88%", y: "20%", delay: "2s", dur: "22s", color: "rgba(255,0,0,0.07)" },
            { icon: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z", x: "15%", y: "75%", delay: "4s", dur: "20s", color: "rgba(29,161,242,0.07)" },
            { icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", x: "82%", y: "70%", delay: "1s", dur: "16s", color: "rgba(0,119,181,0.07)" },
            { icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z", x: "92%", y: "45%", delay: "3s", dur: "19s", color: "rgba(0,0,0,0.05)" },
            { icon: "M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z", x: "5%", y: "45%", delay: "5s", dur: "21s", color: "rgba(131,58,180,0.06)" },
          ].map((social, i) => (
            <div
              key={i}
              className="absolute animate-float-icon"
              style={{
                left: social.x,
                top: social.y,
                animationDelay: social.delay,
                animationDuration: social.dur,
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill={social.color} className="opacity-0 animate-fade-drift">
                <path d={social.icon} />
              </svg>
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center animate-hero-fade-in">
          <h1
            className="text-3xl sm:text-5xl lg:text-7xl text-neutral-800 leading-[1.1] mb-6"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Where every creator{" "}
            <br className="hidden sm:block" />
            <TypingRotation />
          </h1>

          <p className="text-neutral-500 text-base sm:text-lg max-w-xl mx-auto">
            Claim your free profile, get discovered by brands, and land your first deal — all in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <a
              href="/claim"
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-8 py-3.5 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all min-h-[48px] text-sm"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Claim Your Profile
            </a>
            <a
              href="/for-brands"
              className="inline-flex items-center justify-center bg-white/80 backdrop-blur-sm border border-neutral-200 text-neutral-700 rounded-lg px-8 py-3.5 font-medium hover:bg-white hover:border-neutral-300 transition-all min-h-[48px] text-sm"
              style={{ fontFamily: "var(--font-display)" }}
            >
              I'm a Brand
            </a>
          </div>

          <div className="mt-10 flex justify-center">
            <ScoreChecker variant="light" />
          </div>
          <p className="text-xs text-neutral-400 mt-3">Free forever. Takes 30 seconds.</p>
        </div>

        {/* Hero visual: floating creator profile mockups */}
        <div className="relative z-10 mt-12 sm:mt-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { name: "Add Creator", role: "Your photo here", score: "—", color: "from-blue-100 to-sky-100" },
              { name: "Add Creator", role: "Your photo here", score: "—", color: "from-cyan-100 to-blue-100" },
              { name: "Add Creator", role: "Your photo here", score: "—", color: "from-sky-100 to-indigo-100" },
              { name: "Add Creator", role: "Your photo here", score: "—", color: "from-blue-100 to-cyan-100" },
            ].map((creator, i) => (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-sm border border-neutral-200/60 rounded-2xl p-4 shadow-md shadow-blue-500/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-center"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${creator.color} mx-auto mb-3 flex items-center justify-center`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400">
                    <circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0112 0v1" strokeLinecap="round" />
                    <path d="M16 11h6M19 8v6" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-xs font-medium text-neutral-400">{creator.name}</div>
                <div className="text-[10px] text-neutral-300 mt-0.5">{creator.role}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-neutral-300 mt-4">Replace with your featured creators</p>
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
                  title: "Claim your profile",
                  desc: "Enter your social handle. We instantly build your creator profile with your content, stats, and niche.",
                },
                {
                  step: "2",
                  title: "Get discovered",
                  desc: "Your profile goes live in our marketplace. Brands browse by niche, platform, and audience to find you.",
                },
                {
                  step: "3",
                  title: "Land brand deals",
                  desc: "Receive offers directly, negotiate on your terms. Funds are held in secure escrow and released to you only after the brand approves your deliverables.",
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

      {/* ═══ Section 4b: From Comment to Payment ═══ */}
      <section className="py-16 sm:py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl text-neutral-800 text-center mb-4 font-serif"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            From Comment to Payment
          </h2>
          <p className="text-neutral-500 text-sm text-center max-w-xl mx-auto mb-12">
            Brands discover creators on Instagram or X, our AI does the rest.
          </p>
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Brand tags @hireacreatorai on Instagram or X",
                desc: "A brand comments on Instagram or tweets on X tagging a creator they want to work with. Our bot picks it up instantly on both platforms.",
                icon: (
                  <div className="flex items-center gap-1">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-blue-500"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </div>
                ),
              },
              {
                step: "2",
                title: "Profile is auto-built with AI",
                desc: "We scrape public data and build a professional creator profile — avatar, stats, niche, and rating — in seconds.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0112 0v1" /><path d="M16 3l2 2 4-4" /></svg>
                ),
              },
              {
                step: "3",
                title: "Brand sends offer, escrow protects both sides",
                desc: "The brand sends an offer with a budget and brief. On acceptance, funds go into secure escrow. Creator delivers, brand reviews and approves, then funds are released.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="aos-stagger-item bg-white border border-neutral-100 rounded-2xl p-6 sm:p-8 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-xs font-semibold text-blue-500">Step {item.step}</span>
                </div>
                <h3 className="font-semibold text-neutral-800 text-base">{item.title}</h3>
                <p className="text-neutral-500 text-sm mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </StaggerChildren>
          <div className="text-center mt-8">
            <a
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-blue-500 font-semibold text-sm hover:text-blue-600 transition-colors"
            >
              See how it works
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ═══ Section 5: For Creators ═══ */}
      <section className="py-16 sm:py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            <h2
              className="text-2xl sm:text-3xl text-neutral-800 text-center mb-12 font-serif"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Everything you need to grow
            </h2>
          </div>
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: featureIcons.portfolio, title: "AI-Built Portfolio", desc: "We auto-generate a stunning portfolio page from your social profiles." },
              { icon: featureIcons.score, title: "Transparency Rating", desc: "A clear rating that shows brands your reach, engagement, and value." },
              { icon: featureIcons.matching, title: "Brand Deal Matching", desc: "Get matched with campaigns that fit your niche and audience." },
              { icon: featureIcons.link, title: "Link-in-Bio", desc: "One link for all your platforms, content, and brand deal rates." },
              { icon: featureIcons.cross, title: "Cross-Platform Profile", desc: "Combine stats from 15+ platforms into one unified creator profile." },
              { icon: featureIcons.payments, title: "Direct Payments", desc: "Get paid securely through the platform. No invoicing headaches." },
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
            Know your worth
          </h2>
          <p className="text-white/70 text-sm mt-2 max-w-md mx-auto">
            Every creator profile includes a transparency rating. Brands see exactly what you bring to the table.
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
              className="inline-flex items-center gap-2 bg-white text-blue-600 rounded-lg px-6 py-3 font-semibold text-sm hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20 mt-8"
            >
              Claim your profile
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </AnimateOnScroll>

      {/* ═══ Section 7: For Brands ═══ */}
      <section className="py-16 sm:py-24 px-5">
        <div className="max-w-5xl mx-auto text-center">
          <h2
            className="text-2xl sm:text-3xl text-neutral-800 mb-12 font-serif"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Find creators that move the needle
          </h2>
          <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              { icon: brandIcons.matched, title: "AI-Matched Creators", desc: "Our algorithm finds creators that fit your brand, niche, and budget." },
              { icon: brandIcons.verified, title: "Rated & Verified", desc: "Every creator has a transparency rating. Know exactly what you are paying for." },
              { icon: brandIcons.campaign, title: "Campaign Management", desc: "Post briefs, review applications, and manage deals in one dashboard." },
              { icon: brandIcons.secure, title: "Secure Payments", desc: "Funds held in secure escrow. Released only when you approve the deliverables. Request revisions or dispute if not satisfied." },
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
                <summary className="px-5 py-4 cursor-pointer font-medium text-neutral-800 text-sm flex justify-between items-center hover:bg-neutral-50 rounded-xl transition-colors min-h-[48px]">
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
            Ready to get discovered?
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
