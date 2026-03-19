"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { CreatorCard } from "@/components/creator-card";
import { AnimateOnScroll, StaggerChildren } from "@/components/animate-on-scroll";
import {
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
  TwitterIcon,
  LinkedInIcon,
  TwitchIcon,
  SnapchatIcon,
} from "@/components/icons/platforms";
import { PlatformTicker } from "@/components/platform-ticker";
import type { Creator } from "@/lib/types";
import { HeroFlow3D } from "@/components/3d/hero-flow-dynamic";

/* ──────────────────────── Utility Icons ──────────────────────── */

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className || "text-neutral-900 shrink-0"}>
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ──────────────────────── Custom SVG Icons ──────────────────────── */

function ProfileStarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="6" width="24" height="22" rx="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M8 24c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 4l1.5 3 3.5.5-2.5 2.5.5 3.5L22 12l-3 1.5.5-3.5L17 7.5l3.5-.5L22 4z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function MarketplaceGridIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect x="3" y="3" width="11" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
      <rect x="18" y="3" width="11" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="18" width="11" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
      <rect x="18" y="18" width="11" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="8.5" cy="8.5" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="23.5" cy="8.5" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="8.5" cy="23.5" r="2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <path d="M16 3L5 8v7c0 7.7 4.7 14.9 11 17 6.3-2.1 11-9.3 11-17V8L16 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M11 16l3.5 3.5L21 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchCreatorsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <circle cx="17" cy="17" r="10" stroke="currentColor" strokeWidth="2.5" />
      <path d="M24.5 24.5L34 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="10" y="12" width="8" height="2" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="10" y="16" width="6" height="2" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="10" y="20" width="7" height="2" rx="1" fill="currentColor" opacity="0.3" />
      <circle cx="8" cy="13" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="8" cy="17" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="8" cy="21" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function CalendarBookIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="8" width="30" height="26" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <path d="M5 16h30" stroke="currentColor" strokeWidth="2.5" />
      <path d="M13 4v8M27 4v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 24l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="30" r="5" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" />
      <text x="29.5" y="33" fill="currentColor" fontSize="8" fontWeight="bold">$</text>
    </svg>
  );
}

function DeliverableSparkleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <rect x="8" y="5" width="24" height="30" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <path d="M14 14h12M14 19h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M32 8l2 4 4 1-3 3 .5 4-3.5-2-3.5 2 .5-4-3-3 4-1 2-4z" fill="currentColor" opacity="0.8" />
      <path d="M12 28l1 2 2 .5-1.5 1.5.25 2-1.75-1-1.75 1 .25-2L9 30.5l2-.5 1-2z" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M3 18h18L19 8l-5 4-2-6-2 6-5-4-2 10z" fill="currentColor" />
      <rect x="3" y="18" width="18" height="3" rx="1" fill="currentColor" />
    </svg>
  );
}

/* ──────────────────────── FAQ Search + Accordion ──────────────────────── */

const faqItems = [
  { q: "Is HireACreator really free for creators?", a: "Yes. Creators pay 0% commission on every booking. Brands pay a small service fee, not creators. There are optional paid upgrades (Creator Pro at $19/mo) for premium features, but the core platform is free.", cat: "pricing" },
  { q: "How is this different from Fiverr or Upwork?", a: "Fiverr takes 20% of your earnings. Upwork takes 10-20%. HireACreator takes 0% from creators. You also get a built-in link-in-bio page, portfolio showcase, and direct bookings without back-and-forth messaging.", cat: "general" },
  { q: "How do payments work?", a: "Payments are processed via Stripe. Brands pay upfront, funds are held in escrow, and released to creators via Stripe Connect once work is delivered. No payout delays, no minimum thresholds.", cat: "payments" },
  { q: "Can I use HireACreator as my link-in-bio?", a: "Absolutely. Every creator gets a customizable link-in-bio page with 8 templates, video backgrounds, button styling, and portfolio sections. Put it in your Instagram, TikTok, or Twitter bio.", cat: "features" },
  { q: "Do you have an API for AI agents?", a: "Yes. HireACreator offers both MCP (Model Context Protocol) and REST API access. AI agents can search creators, filter by category, and initiate bookings programmatically.", cat: "api" },
  { q: "What types of creators can join?", a: "UGC creators, videographers, photographers, social media managers, graphic designers, editors, TikTok creators, YouTube creators, Instagram creators — anyone selling creative services.", cat: "general" },
];

const faqCatIcons: Record<string, React.ReactNode> = {
  pricing: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
  general: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  payments: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
  features: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  api: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
};

/* ──────────────────────── Main Component ──────────────────────── */

export function HomepageContent({
  featured,
  creatorCount,
}: {
  featured: Creator[];
  creatorCount: number;
}) {
  const { openSignup } = useAuth();
  const [faqSearch, setFaqSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaqs = faqSearch
    ? faqItems.filter(
        (f) =>
          f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
          f.a.toLowerCase().includes(faqSearch.toLowerCase())
      )
    : faqItems;

  return (
    <>
      {/* Top gradient wash — behind header */}
      <div className="fixed top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/[0.04] to-transparent z-40 pointer-events-none" />

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative pt-40 sm:pt-52 pb-20 sm:pb-28 overflow-hidden">
        {/* Aurora mesh background — blue tones only */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-50/80 via-neutral-50/40 to-white" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-neutral-200/30 blur-[120px] animate-aurora" />
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full bg-neutral-200/25 blur-[100px] animate-aurora-2" />
          <div className="absolute -bottom-20 left-1/2 w-[700px] h-[400px] rounded-full bg-neutral-100/20 blur-[120px] animate-aurora-3" />
          {/* Dot grid overlay */}
          <div className="absolute inset-0 dot-grid opacity-40" />
        </div>

        {/* Floating platform logos — scattered behind text */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-32 left-[8%] opacity-[0.07] animate-float">
            <InstagramIcon size={48} className="text-neutral-900" />
          </div>
          <div className="absolute top-44 right-[12%] opacity-[0.06] animate-float-slow">
            <TikTokIcon size={40} className="text-neutral-900" />
          </div>
          <div className="absolute top-64 left-[18%] opacity-[0.05] animate-float-delayed">
            <YouTubeIcon size={44} className="text-neutral-900" />
          </div>
          <div className="absolute top-36 right-[28%] opacity-[0.06] animate-float">
            <TwitterIcon size={36} className="text-neutral-900" />
          </div>
          <div className="absolute top-72 right-[8%] opacity-[0.05] animate-float-slow">
            <LinkedInIcon size={38} className="text-neutral-900" />
          </div>
          <div className="absolute top-56 left-[35%] opacity-[0.04] animate-float-delayed">
            <TwitchIcon size={34} className="text-neutral-900" />
          </div>
          <div className="absolute top-80 left-[6%] opacity-[0.05] animate-float">
            <SnapchatIcon size={32} className="text-neutral-900" />
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
              <h1
                className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter text-neutral-900 leading-[1.05]"
              >
                The marketplace where<br className="hidden sm:block" /> creators and AI agents trade
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
                Link-in-bio meets marketplace meets AI. Your storefront, your services, your price.
                Brands book you directly. AI agents find and hire you via MCP.
                0% commission — you keep every dollar.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => openSignup("creator")}
                  className="px-8 py-3.5 text-base font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors duration-300 shadow-lg shadow-neutral-900/20 w-full sm:w-auto"
                >
                  Get Started — it's free
                </button>
                <Link href="/browse">
                  <button className="px-8 py-3.5 text-base font-medium text-neutral-700 bg-white/80 backdrop-blur rounded-full border border-neutral-200 hover:border-neutral-300 hover:bg-white transition-all duration-300 w-full sm:w-auto">
                    Browse Creators
                  </button>
                </Link>
              </div>

              <p className="mt-6 text-sm text-neutral-400">
                Link-in-bio + marketplace + AI agent API. Built for the creator economy.
              </p>
          </div>

          {/* Hero screenshot in browser chrome */}
          <div className="mt-16 mx-auto max-w-4xl screenshot-perspective">
            <div className="browser-chrome rounded-xl overflow-hidden border border-neutral-200/80 bg-white">
              <div className="flex items-center gap-2 px-4 py-3 bg-neutral-100/80 border-b border-neutral-200/60">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md px-3 py-1 text-xs text-neutral-400 text-center border border-neutral-200/60">
                    hireacreator.ai/browse
                  </div>
                </div>
              </div>
              <img
                src="/screenshots/browse.png"
                alt="HireACreator marketplace — browse and discover creators"
                className="w-full h-auto"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 3D FLOW GRAPH ═══════════════════ */}
      <section className="relative hidden lg:block py-16 overflow-hidden">
        {/* Radial glow behind the 3D scene */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="w-[700px] h-[400px] rounded-full blur-[60px]" style={{ background: "radial-gradient(ellipse, rgba(196,181,253,0.3), rgba(191,219,254,0.2) 50%, transparent 80%)" }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold tracking-widest text-neutral-400 uppercase">How it works</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-neutral-900">
              From signup to delivery — in one seamless flow
            </h2>
          </div>
          <div className="mx-auto max-w-5xl h-[500px] rounded-2xl overflow-hidden">
            <HeroFlow3D />
          </div>
        </div>
      </section>

      {/* ═══════════════════ PLATFORM TRUST TICKER ═══════════════════ */}
      <AnimateOnScroll as="section" className="bg-gradient-to-b from-neutral-50/60 via-neutral-50/30 to-white border-y border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">
              Trusted by creators and brands worldwide
            </h2>
            <p className="text-neutral-500">The platforms your audience lives on, connected to your storefront.</p>
          </div>
          <PlatformTicker />
        </div>
      </AnimateOnScroll>

      {/* ═══════════════════ WHAT YOU GET ═══════════════════ */}
      <section className="bg-neutral-50/50 border-y border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <AnimateOnScroll className="text-center mb-14">
            <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">What you get</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
              Everything a creator needs, in one place
            </h2>
          </AnimateOnScroll>

          <StaggerChildren className="grid md:grid-cols-3 gap-6" staggerMs={150}>
            {/* Card 1 — Profile with real screenshots */}
            <div className="aos-stagger-item group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative p-6 pb-4 bg-gradient-to-br from-neutral-50/80 to-neutral-100/60">
                <div className="text-neutral-500"><ProfileStarIcon /></div>
                {/* Real link-in-bio screenshots — phone frames */}
                <div className="mt-4 flex items-center justify-center gap-[-8px]">
                  <div className="relative z-10 w-[45%] rounded-xl overflow-hidden border-2 border-white shadow-lg" style={{ transform: "rotate(-3deg)" }}>
                    <img src="/screenshots/linkinbio-finn.png" alt="Finn Dougherty link-in-bio" className="w-full h-auto" loading="lazy" />
                  </div>
                  <div className="relative z-0 w-[45%] rounded-xl overflow-hidden border-2 border-white shadow-lg -ml-3" style={{ transform: "rotate(2deg)" }}>
                    <img src="/screenshots/linkinbio-umove.png" alt="U Move Australia link-in-bio" className="w-full h-auto" loading="lazy" />
                  </div>
                </div>
              </div>
              <div className="p-6 pt-4">
                <h3 className="font-display text-lg font-bold text-neutral-900 mb-2">A profile that converts</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Not another boring link page. A full portfolio, service menu with pricing,
                  and instant booking. Put it in your bio and watch it work.
                </p>
              </div>
            </div>

            {/* Card 2 — Marketplace */}
            <div className="aos-stagger-item group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative p-6 pb-4 bg-gradient-to-br from-neutral-50/80 to-neutral-100/60">
                <div className="text-neutral-600"><MarketplaceGridIcon /></div>
                {/* Mini browser frame with screenshot */}
                <div className="mt-4 rounded-lg overflow-hidden border border-neutral-200/60 shadow-sm bg-white">
                  <div className="flex items-center gap-1 px-2 py-1.5 bg-neutral-100/80 border-b border-neutral-200/40">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                  </div>
                  <img src="/screenshots/browse.png" alt="Browse marketplace" className="w-full h-auto" loading="lazy" />
                </div>
              </div>
              <div className="p-6 pt-4">
                <h3 className="font-display text-lg font-bold text-neutral-900 mb-2">Brands find you</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Stop pitching. Brands browse creators by niche, platform, and budget —
                  then book directly. You set your own rates. Early creators get featured placement.
                </p>
              </div>
            </div>

            {/* Card 3 — Payments */}
            <div className="aos-stagger-item group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative p-6 pb-4 bg-gradient-to-br from-emerald-50/80 to-green-50/60">
                <div className="text-emerald-600"><ShieldCheckIcon /></div>
                {/* Payment success graphic */}
                <div className="mt-4 bg-white rounded-xl p-4 border border-neutral-100 shadow-sm text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                  <div className="text-xs text-emerald-600 font-medium mb-0.5">Payment received</div>
                  <div className="font-display text-lg font-bold text-neutral-900">$1,200.00</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">0% platform fee</div>
                </div>
              </div>
              <div className="p-6 pt-4">
                <h3 className="font-display text-lg font-bold text-neutral-900 mb-2">Get paid instantly</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  0% commission — you keep 100% of what you charge.
                  Payments held in Stripe escrow until work is approved. No chasing invoices.
                </p>
              </div>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════════════ PLATFORM PREVIEW — Real Screenshots ═══════════════════ */}
      <AnimateOnScroll as="section" id="for-creators" className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left — Two real link-in-bio screenshots in phone frames, slightly overlapping */}
            <div className="order-2 lg:order-1">
              <div className="relative flex items-center justify-center max-w-md mx-auto">
                {/* Phone frame 1 — Finn */}
                <div className="relative z-10 w-[52%] rounded-[20px] overflow-hidden border-2 border-white shadow-2xl shadow-neutral-300/40" style={{ transform: "rotate(-4deg)" }}>
                  <img
                    src="/screenshots/linkinbio-finn.png"
                    alt="Finn Dougherty's link-in-bio page on HireACreator"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
                {/* Phone frame 2 — U Move */}
                <div className="relative z-20 w-[52%] rounded-[20px] overflow-hidden border-2 border-white shadow-2xl shadow-neutral-300/40 -ml-8" style={{ transform: "rotate(3deg)" }}>
                  <img
                    src="/screenshots/linkinbio-umove.png"
                    alt="U Move Australia's link-in-bio page on HireACreator"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Right — Copy */}
            <div className="order-1 lg:order-2">
              <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
                Your profile
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight mb-6">
                You have the audience.<br />
                Now monetize it.
              </h2>
              <p className="text-neutral-500 leading-relaxed mb-8 text-lg">
                Millions of creators build audiences but struggle to turn followers into income.
                A car creator with 500K followers on TikTok still can&apos;t easily sell
                detailing walkthroughs, mod consultations, or sponsored review slots.
                HireACreator gives every creator a storefront that converts — portfolio,
                services, payments, and booking in one link.
              </p>
              <ul className="space-y-4">
                {[
                  "Turn your content niche into bookable services",
                  "Accept payments directly via Stripe — 0% platform fee",
                  "Sell consultations, reviews, UGC, tutorials — anything",
                  "Verified profile builds trust so brands find and pay you",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                    <span className="text-neutral-600">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <button
                  onClick={() => openSignup("creator")}
                  className="px-8 py-3.5 text-base font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors duration-300"
                >
                  Create Your Profile
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard screenshot — full-width browser frame below */}
          <div className="mt-16 relative">
            {/* Soft blue glow behind */}
            <div className="absolute -inset-4 bg-neutral-50/60 rounded-3xl blur-2xl" />
            <div className="relative rounded-xl overflow-hidden border border-neutral-200/80 bg-white shadow-xl shadow-neutral-300/20" style={{ transform: "perspective(1200px) rotateX(2deg)" }}>
              {/* macOS-style browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-neutral-100/80 border-b border-neutral-200/60">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md px-3 py-1 text-xs text-neutral-400 text-center border border-neutral-200/60">
                    hireacreator.ai/dashboard
                  </div>
                </div>
              </div>
              <img
                src="/screenshots/dashboard.jpg"
                alt="HireACreator creator dashboard — manage bookings, earnings, and analytics"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            <p className="text-center text-sm text-neutral-400 mt-4">Manage everything from one place</p>
          </div>
        </div>
      </AnimateOnScroll>

      {/* ═══════════════════ FEATURED CREATORS ═══════════════════ */}
      {featured.length > 0 && (
        <AnimateOnScroll as="section" className="bg-gradient-to-b from-neutral-50/50 to-white border-t border-neutral-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl font-bold text-neutral-900">
                  Creators on the platform
                </h2>
                <p className="mt-2 text-neutral-500">
                  {creatorCount} creator{creatorCount !== 1 ? "s" : ""} and growing.
                </p>
              </div>
              <Link
                href="/browse"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors duration-300"
              >
                View all <ArrowRightIcon />
              </Link>
            </div>
            <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" staggerMs={100}>
              {featured.map((creator) => (
                <div key={creator.id} className="aos-stagger-item relative">
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-neutral-900 text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                    Featured This Week
                  </div>
                  <CreatorCard creator={creator} />
                </div>
              ))}
            </StaggerChildren>
          </div>
        </AnimateOnScroll>
      )}

      {/* ═══════════════════ FOR BRANDS ═══════════════════ */}
      <AnimateOnScroll as="section" id="for-brands" className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-neutral-100">
          <div className="text-center mb-14">
            <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
              For Brands & Agencies
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight mb-4">
              Stop scrolling Instagram for creators
            </h2>
            <p className="text-neutral-500 text-lg leading-relaxed max-w-2xl mx-auto">
              Search by niche, audience size, engagement rate, and budget.
              Book in minutes, not weeks. Payments are held in Stripe escrow
              and released when you approve the deliverables.
            </p>
          </div>

          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerMs={120}>
            {/* Search */}
            <div className="aos-stagger-item group relative bg-gradient-to-br from-neutral-50 to-white rounded-2xl p-7 border border-neutral-200 hover:border-neutral-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-5 text-neutral-700 group-hover:scale-110 transition-transform duration-300">
                  <SearchCreatorsIcon />
                </div>
                <div className="text-lg font-display font-bold text-neutral-900 mb-2">Search</div>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Filter by category, platform, location, rate, and engagement.
                  Find exactly who you need.
                </p>
              </div>
            </div>

            {/* Book */}
            <div className="aos-stagger-item group relative bg-gradient-to-br from-amber-50 to-white rounded-2xl p-7 border border-amber-100/80 hover:border-amber-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-5 text-amber-700 group-hover:scale-110 transition-transform duration-300">
                  <CalendarBookIcon />
                </div>
                <div className="text-lg font-display font-bold text-neutral-900 mb-2">Book</div>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Pick a service, submit your brief, pay securely.
                  Funds held in escrow until you approve.
                </p>
              </div>
            </div>

            {/* Ship */}
            <div className="aos-stagger-item group relative bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-7 border border-emerald-100/80 hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-5 text-emerald-700 group-hover:scale-110 transition-transform duration-300">
                  <DeliverableSparkleIcon />
                </div>
                <div className="text-lg font-display font-bold text-neutral-900 mb-2">Ship</div>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Get deliverables on schedule with full usage rights.
                  Leave a review. Rebook.
                </p>
              </div>
            </div>
          </StaggerChildren>

          <div className="mt-10 text-center">
            <Link href="/browse">
              <button className="px-8 py-3.5 text-base font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors duration-300 shadow-lg shadow-neutral-900/10">
                Find a Creator
              </button>
            </Link>
          </div>
        </div>
      </AnimateOnScroll>

      {/* ═══════════════════ FOR AI AGENTS ═══════════════════ */}
      <AnimateOnScroll as="section" id="for-agents" className="bg-gradient-to-b from-neutral-950 to-neutral-900 text-white">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 overflow-hidden">
          {/* Subtle dot grid */}
          <div className="absolute inset-0 dot-grid-light opacity-30" />

          <div className="relative grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
                For AI Agents
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight mb-6">
                The first creator marketplace your agent can use
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed mb-8">
                Your AI agent needs content? It can search creators, check availability,
                and place a booking autonomously. MCP and REST API,
                built for the agentic era.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5"><CheckIcon className="text-emerald-400 shrink-0" /></div>
                  <div>
                    <span className="font-medium text-white">MCP Server</span>
                    <span className="text-neutral-400"> — Claude, GPT, and any MCP-compatible agent can discover and book creators natively.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5"><CheckIcon className="text-emerald-400 shrink-0" /></div>
                  <div>
                    <span className="font-medium text-white">REST API</span>
                    <span className="text-neutral-400"> — Full programmatic access. Search, filter, book, and manage campaigns via JSON endpoints.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5"><CheckIcon className="text-emerald-400 shrink-0" /></div>
                  <div>
                    <span className="font-medium text-white">End-to-end autonomous</span>
                    <span className="text-neutral-400"> — From search to payment to delivery tracking. No human bottleneck required.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Code preview with animated gradient border */}
            <div className="relative">
              {/* Floating badges */}
              <div className="absolute -top-3 -left-2 z-10 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30 backdrop-blur-sm animate-badge-float">
                MCP Compatible
              </div>
              <div className="absolute -top-2 right-8 z-10 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-medium border border-sky-500/30 backdrop-blur-sm animate-badge-float-alt">
                REST API
              </div>
              <div className="absolute -bottom-3 left-4 z-10 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30 backdrop-blur-sm animate-badge-float">
                Auto-booking
              </div>
              <div className="absolute -bottom-2 right-12 z-10 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30 backdrop-blur-sm animate-badge-float-alt">
                GPT + Claude
              </div>

              {/* Animated gradient glow behind code block */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600/40 via-sky-600/40 to-emerald-600/40 blur-sm opacity-60 animate-pulse-soft" />

              <div className="relative bg-neutral-950 rounded-3xl border border-neutral-700/50 overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-neutral-800/50">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="text-xs text-neutral-500 ml-2 font-mono">api.hireacreator.ai</span>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                  <div className="text-neutral-600">{"// Find UGC creators under $2k"}</div>
                  <div><span className="text-emerald-400">GET</span> <span className="text-neutral-300">/v1/creators</span></div>
                  <div className="text-neutral-500 mb-4">{"  ?category=ugc&max_rate=2000"}</div>
                  <div className="text-neutral-600">{"// Book a service"}</div>
                  <div><span className="text-amber-400">POST</span> <span className="text-neutral-300">/v1/bookings</span></div>
                  <div className="text-neutral-500 mb-4">{"  {service_id, brief, budget}"}</div>
                  <div className="text-neutral-600">{"// Or use MCP directly"}</div>
                  <div className="text-neutral-300">{"{"}</div>
                  <div className="text-neutral-300 pl-4">{'"tool": "search_creators",'}</div>
                  <div className="text-neutral-300 pl-4">{'"input": {'}</div>
                  <div className="text-neutral-300 pl-8">{'"niche": "ugc",'}</div>
                  <div className="text-neutral-300 pl-8">{'"min_rating": 4.5,'}</div>
                  <div className="text-neutral-300 pl-8">{'"budget": 1500'}</div>
                  <div className="text-neutral-300 pl-4">{"}"}</div>
                  <div className="text-neutral-300">{"}"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimateOnScroll>

      {/* ═══════════════════ PRICING ═══════════════════ */}
      <AnimateOnScroll as="section" id="pricing" className="relative bg-white overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center mb-14">
            <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
              Pricing
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight mb-4">
              Free for creators. Transparent for everyone.
            </h2>
            <p className="text-neutral-500 text-lg leading-relaxed max-w-2xl mx-auto">
              Creators keep 100% of their earnings with 0% commission. Upgrade for advanced tools, or stay free forever.
            </p>
          </div>

          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto" staggerMs={120}>
            {/* Free */}
            <div className="aos-stagger-item bg-white rounded-2xl border border-neutral-200 p-8 hover:border-neutral-300 hover:shadow-lg transition-all duration-300">
              <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Free</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-display text-3xl font-bold text-neutral-900">$0</span>
                <span className="text-sm text-neutral-400">forever</span>
              </div>
              <p className="text-sm text-neutral-500 mb-5">Link-in-bio, services, bookings, and analytics. No strings attached.</p>
              <ul className="space-y-2.5 mb-6">
                {[
                  { text: "8 premium templates", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M3 9h18" /></svg> },
                  { text: "Up to 3 services", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
                  { text: "0% commission on earnings", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg> },
                  { text: "Basic analytics + QR code", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg> },
                ].map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5 text-sm text-neutral-600">
                    <span className="mt-0.5 text-neutral-400 shrink-0">{f.icon}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => openSignup("creator")}
                className="w-full py-2.5 text-sm font-medium rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors duration-300"
              >
                Get Started Free
              </button>
            </div>

            {/* Popular */}
            <div className="aos-stagger-item bg-white rounded-2xl border-2 border-neutral-900 p-8 relative hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-neutral-900 text-white text-xs font-medium rounded-full">
                Popular
              </div>
              <div className="text-sm font-medium text-neutral-900 uppercase tracking-wider mb-2">Creator Pro</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-display text-3xl font-bold text-neutral-900">$19</span>
                <span className="text-sm text-neutral-400">/mo</span>
              </div>
              <p className="text-sm text-neutral-500 mb-5">Custom domain, advanced analytics, unlimited services, and priority visibility.</p>
              <ul className="space-y-2.5 mb-6">
                {[
                  { text: "Unlimited services", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18.5 3A2.5 2.5 0 0121 5.5v13a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 18.5v-13A2.5 2.5 0 015.5 3h13z" /><path d="M12 8v8M8 12h8" /></svg> },
                  { text: "Custom domain (yourname.com)", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg> },
                  { text: "Advanced analytics + heatmaps", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg> },
                  { text: "All 11 premium animations", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
                ].map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5 text-sm text-neutral-600">
                    <span className="mt-0.5 text-neutral-900 shrink-0">{f.icon}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link href="/pricing">
                <button className="w-full py-2.5 text-sm font-medium rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors duration-300">
                  See Pro Features
                </button>
              </Link>
            </div>

            {/* Business */}
            <div className="aos-stagger-item bg-white rounded-2xl border border-neutral-200 p-8 hover:border-neutral-300 hover:shadow-lg transition-all duration-300">
              <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Creator Business</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-display text-3xl font-bold text-neutral-900">$49</span>
                <span className="text-sm text-neutral-400">/mo</span>
              </div>
              <p className="text-sm text-neutral-500 mb-5">Multi-page sites, team collaboration, white-label, and API access.</p>
              <ul className="space-y-2.5 mb-6">
                {[
                  { text: "Multi-page sites (up to 5)", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg> },
                  { text: "Team collaboration", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg> },
                  { text: "White-label solution", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg> },
                  { text: "Revenue dashboard", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg> },
                ].map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5 text-sm text-neutral-600">
                    <span className="mt-0.5 text-neutral-400 shrink-0">{f.icon}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link href="/pricing">
                <button className="w-full py-2.5 text-sm font-medium rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors duration-300">
                  See Business Features
                </button>
              </Link>
            </div>
          </StaggerChildren>

          <div className="mt-10 text-center">
            <p className="text-sm text-neutral-400 mb-4">
              Also available: Brand plans from $199/mo and API access at $49/mo
            </p>
            <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors duration-300">
              View all plans and compare features <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </AnimateOnScroll>

      {/* ═══════════════════ COMPARISON TABLE ═══════════════════ */}
      <AnimateOnScroll as="section" className="bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Why not just use Linktree or Fiverr?
            </h2>
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
              Because they weren&apos;t built for what you actually need.
            </p>
          </div>

          <div className="overflow-x-auto bg-white rounded-2xl border border-neutral-200 shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="p-4 pr-4 text-sm font-medium text-neutral-400 w-1/4" />
                  <th className="p-4 px-4 text-center bg-neutral-50">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="text-amber-500"><CrownIcon /></span>
                      <span className="font-display font-bold text-neutral-900">HireACreator</span>
                    </div>
                  </th>
                  <th className="p-4 px-4 text-center">
                    <div className="font-display font-bold" style={{ color: "#43E55E" }}>Linktree</div>
                  </th>
                  <th className="p-4 px-4 text-center">
                    <div className="font-display font-bold" style={{ color: "#1DBF73" }}>Fiverr.</div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { feature: "Portfolio + services page", us: true, linktree: false, fiverr: true },
                  { feature: "Direct booking & payments", us: true, linktree: false, fiverr: true },
                  { feature: "Link-in-bio friendly", us: true, linktree: true, fiverr: false },
                  { feature: "0% creator commission", us: true, linktree: false, fiverr: false },
                  { feature: "Verified creator profiles", us: true, linktree: false, fiverr: false },
                  { feature: "Brand marketplace discovery", us: true, linktree: false, fiverr: true },
                  { feature: "AI agent API (MCP + REST)", us: true, linktree: false, fiverr: false },
                  { feature: "Calendar & availability", us: true, linktree: false, fiverr: false },
                  { feature: "Custom domain", us: true, linktree: true, fiverr: false },
                  { feature: "You set your own rates", us: true, linktree: false, fiverr: false },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-neutral-100 comparison-row transition-colors duration-300">
                    <td className="py-3.5 px-4 text-neutral-700 font-medium">{row.feature}</td>
                    <td className="py-3.5 px-4 text-center bg-neutral-50">
                      {row.us ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-neutral-900 text-white shadow-sm">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                        </span>
                      ) : (
                        <span className="inline-block w-6 h-0.5 bg-neutral-200 rounded" />
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.linktree ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-200 text-neutral-500">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                        </span>
                      ) : (
                        <span className="inline-block w-6 h-0.5 bg-neutral-200 rounded" />
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.fiverr ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-200 text-neutral-500">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                        </span>
                      ) : (
                        <span className="inline-block w-6 h-0.5 bg-neutral-200 rounded" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimateOnScroll>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <AnimateOnScroll as="section" className="bg-white border-t border-neutral-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-4">
            Frequently asked questions
          </h2>
          <p className="text-neutral-500 text-center mb-8">
            Everything you need to know about HireACreator.
          </p>

          {/* Search bar */}
          <div className="relative mb-8 max-w-md mx-auto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search questions..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/5 outline-none transition-all duration-300 placeholder:text-neutral-400"
            />
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((item, i) => (
              <div
                key={i}
                className="rounded-xl bg-neutral-50 border border-neutral-200 hover:border-neutral-300 transition-colors duration-300 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 text-left flex items-center gap-3"
                >
                  <span className="text-neutral-400 shrink-0">{faqCatIcons[item.cat]}</span>
                  <span className="flex-1 text-sm font-semibold text-neutral-900">{item.q}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`shrink-0 ml-2 text-neutral-400 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div
                  className="transition-all duration-300 ease-in-out overflow-hidden"
                  style={{
                    maxHeight: openFaq === i ? "200px" : "0px",
                    opacity: openFaq === i ? 1 : 0,
                  }}
                >
                  <p className="px-5 pb-5 ml-7 text-sm text-neutral-500 leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimateOnScroll>

      {/* Homepage FAQ Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "Is HireACreator really free for creators?", acceptedAnswer: { "@type": "Answer", text: "Yes. Creators pay 0% commission on every booking. Brands pay a small service fee, not creators." } },
          { "@type": "Question", name: "How is HireACreator different from Fiverr or Upwork?", acceptedAnswer: { "@type": "Answer", text: "Fiverr takes 20% of your earnings. Upwork takes 10-20%. HireACreator takes 0% from creators. You also get a built-in link-in-bio page, portfolio showcase, and direct bookings." } },
          { "@type": "Question", name: "How do payments work on HireACreator?", acceptedAnswer: { "@type": "Answer", text: "Payments are processed via Stripe. Brands pay upfront, funds are held in escrow, and released to creators via Stripe Connect once work is delivered." } },
          { "@type": "Question", name: "Can I use HireACreator as my link-in-bio?", acceptedAnswer: { "@type": "Answer", text: "Yes. Every creator gets a customizable link-in-bio page with 8 templates, video backgrounds, button styling, and portfolio sections." } },
          { "@type": "Question", name: "Does HireACreator have an API for AI agents?", acceptedAnswer: { "@type": "Answer", text: "Yes. HireACreator offers both MCP (Model Context Protocol) and REST API access for AI agents to search creators, filter by category, and initiate bookings." } },
          { "@type": "Question", name: "What types of creators can join HireACreator?", acceptedAnswer: { "@type": "Answer", text: "UGC creators, videographers, photographers, social media managers, graphic designers, editors, TikTok creators, YouTube creators, Instagram creators — anyone selling creative services." } },
        ],
      })}} />

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-blue-950 to-blue-900">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute w-1 h-1 rounded-full bg-white/20 left-[10%] animate-particle-1" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-white/15 left-[30%] animate-particle-2" />
          <div className="absolute w-1 h-1 rounded-full bg-white/20 left-[55%] animate-particle-3" />
          <div className="absolute w-0.5 h-0.5 rounded-full bg-white/25 left-[75%] animate-particle-1" style={{ animationDelay: "6s" }} />
          <div className="absolute w-1 h-1 rounded-full bg-white/15 left-[90%] animate-particle-2" style={{ animationDelay: "2s" }} />
          {/* Gradient orbs — blue only */}
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full bg-sky-500/10 blur-[80px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 text-center">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            {creatorCount > 0
              ? "Join the creators already here"
              : "Be one of the first"}
          </h2>
          <p className="text-neutral-400 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            {creatorCount > 0
              ? "Create your profile, list your services, and start getting booked by brands and AI agents."
              : "Early creators get featured placement to every brand that joins. First 500 get priority access."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openSignup("creator")}
              className="px-10 py-4 text-base font-medium text-neutral-900 bg-white rounded-full hover:bg-neutral-100 transition-colors duration-300 shadow-xl shadow-white/10 w-full sm:w-auto"
            >
              Get Started — it's free
            </button>
            <Link href="/browse">
              <button className="px-10 py-4 text-base font-medium text-white bg-white/10 backdrop-blur rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 w-full sm:w-auto">
                Browse Creators
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
