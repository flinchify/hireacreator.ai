"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { AnimateOnScroll, StaggerChildren } from "@/components/animate-on-scroll";
import { CATEGORIES } from "@/lib/types";

const CATEGORY_ICONS: Record<string, string> = {
  "UGC Creator": "🎬", "Video Editor": "🎥", "Photographer": "📸", "Graphic Designer": "🎨",
  "Social Media Manager": "📱", "Copywriter": "✍️", "Brand Strategist": "📊", "Motion Designer": "✨",
  "Podcast Producer": "🎙️", "Influencer": "⭐", "Automotive": "🏎️", "Education / Tech": "💻",
  "Consultant": "💼", "Music Producer": "🎵", "Developer": "🖥️",
};

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-blue-500 shrink-0">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type TopCreator = { name: string; slug: string; avatar: string | null; nicheRank: number; category: string | null };

export function ForCreatorsContent() {
  const { openSignup } = useAuth();
  const [topByCategory, setTopByCategory] = useState<Record<string, TopCreator[]>>({});

  useEffect(() => {
    fetch("/api/creators/top-by-category")
      .then(r => r.json())
      .then(data => setTopByCategory(data || {}))
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/30" />
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0)_1px,transparent_0)] bg-[length:32px_32px]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
            Anyone can be a creator
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            You don&apos;t need millions of followers. Edit videos? Tutor students? Train clients?
            Review products? Cook meals? Fix cars? If you have a skill, you&apos;re a creator.
            Get a profile, list your services, and start getting booked.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openSignup("creator")}
              className="min-h-[48px] px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors shadow-md shadow-blue-500/5 w-full sm:w-auto"
            >
              Claim Your Profile
            </button>
            <Link href="/browse">
              <button className="min-h-[48px] px-8 py-3.5 text-base font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-neutral-400 hover:bg-neutral-50 transition-all w-full sm:w-auto">
                See Live Profiles
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <AnimateOnScroll>
          <div className="text-center mb-14">
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl font-bold text-neutral-900 mb-4">
              Sound familiar?
            </h2>
          </div>
        </AnimateOnScroll>
        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerMs={150}>
          <div className="aos-stagger-item bg-blue-50 rounded-2xl p-6 sm:p-8 border border-blue-100">
            <div className="text-2xl mb-4">&#x1F4AC;</div>
            <h3 className="font-display font-bold text-neutral-900 mb-2">&ldquo;DM me for rates&rdquo;</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              You spend hours replying to DMs, quoting prices, getting ghosted. Half of them
              were never serious. Your inbox is a mess.
            </p>
          </div>
          <div className="aos-stagger-item bg-blue-50 rounded-2xl p-6 sm:p-8 border border-blue-100">
            <div className="text-2xl mb-4">&#x1F4B8;</div>
            <h3 className="font-display font-bold text-neutral-900 mb-2">Platforms take 20%+</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Fiverr takes 20%. Upwork takes up to 20%. You do the work, they skim off the top.
              On a $1,000 job, that&apos;s $200 gone.
            </p>
          </div>
          <div className="aos-stagger-item bg-blue-50 rounded-2xl p-6 sm:p-8 border border-blue-100">
            <div className="text-2xl mb-4">&#x1F50D;</div>
            <h3 className="font-display font-bold text-neutral-900 mb-2">Brands can&apos;t find you</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Your work is scattered across 5 platforms. No single page shows your portfolio,
              services, and rates. Brands give up and hire someone easier to book.
            </p>
          </div>
        </StaggerChildren>
      </section>

      {/* Niche Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <AnimateOnScroll>
          <div className="text-center mb-14">
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl font-bold text-neutral-900 mb-4">
              Find your niche
            </h2>
            <p className="text-neutral-500 max-w-xl mx-auto">
              See who&apos;s leading in each category. Join and climb the ranks.
            </p>
          </div>
        </AnimateOnScroll>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => {
            const creators = topByCategory[cat] || [];
            return (
              <Link key={cat} href={`/browse?category=${encodeURIComponent(cat)}`}>
                <div className="bg-white rounded-2xl border border-neutral-200 p-5 hover:border-neutral-300 shadow-md shadow-blue-500/5 transition-all duration-200 group cursor-pointer h-full">
                  <div className="text-2xl mb-3">{CATEGORY_ICONS[cat] || "🎯"}</div>
                  <h3 className="font-display font-bold text-neutral-900 text-sm mb-2 group-hover:text-neutral-700">{cat}</h3>
                  {creators.length > 0 ? (
                    <div className="space-y-1.5">
                      {creators.slice(0, 3).map((c: TopCreator, i: number) => (
                        <div key={c.slug} className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold w-4 ${i === 0 ? "text-amber-500" : i === 1 ? "text-neutral-400" : "text-amber-700"}`}>#{i + 1}</span>
                          {c.avatar ? (
                            <img src={c.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-[8px] font-bold text-neutral-400">{c.name?.[0]}</div>
                          )}
                          <span className="text-xs text-neutral-600 truncate">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-neutral-300">Be the first</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* What you get */}
      <AnimateOnScroll as="section" className="bg-neutral-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl mb-14">
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "Your storefront",
                desc: "Portfolio, services with pricing, verified reviews, and instant booking. One link that does the job of an entire website.",
              },
              {
                title: "Calendar sync",
                desc: "Connect Google, Apple, or Outlook. Brands see your real availability. No more back-and-forth on scheduling.",
              },
              {
                title: "0% platform fees",
                desc: "You keep every dollar you charge. Stripe handles payments. We don't take a cut from creator earnings.",
              },
              {
                title: "Verified badge",
                desc: "Connect your socials, prove your engagement is real, and get a verified badge that builds instant trust.",
              },
              {
                title: "Brand inbox",
                desc: "Brands send booking requests with briefs and budgets. Accept, decline, or counter. No more cold DMs.",
              },
              {
                title: "Custom domain",
                desc: "Use hireacreator.ai/yourname or connect your own domain. Your profile, your brand.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
                <h3 className="font-display text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimateOnScroll>

      {/* vs Linktree */}
      <AnimateOnScroll as="section" className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center mb-14">
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl font-bold text-neutral-900 mb-4">
              Linktree shows links. This books clients.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-neutral-200 rounded-2xl p-6 sm:p-8">
              <div className="font-display font-bold text-neutral-400 text-lg mb-4">Linktree</div>
              <ul className="space-y-3">
                {[
                  "List of links",
                  "No services or pricing",
                  "No booking system",
                  "No portfolio",
                  "No brand discovery",
                  "$24/mo for pro features",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-neutral-400">
                    <span className="inline-block w-4 h-0.5 bg-neutral-200 rounded" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-2 border-blue-500 rounded-2xl p-6 sm:p-8 bg-blue-50 shadow-md shadow-blue-500/5">
              <div className="font-display font-bold text-neutral-900 text-lg mb-4">HireACreator</div>
              <ul className="space-y-3">
                {[
                  "Full portfolio + services page",
                  "Clear pricing on every service",
                  "Built-in booking & payments",
                  "Verified creator profiles",
                  "Brands discover and book you",
                  "Free. Always.",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-neutral-700">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </AnimateOnScroll>

      {/* CTA */}
      <AnimateOnScroll as="section" className="bg-blue-50 border-t border-blue-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            Ready to get booked?
          </h2>
          <p className="text-neutral-500 text-lg mb-10 max-w-xl mx-auto">
            Create your profile in under 2 minutes. List your services, connect your socials,
            and start getting discovered by brands.
          </p>
          <button
            onClick={() => openSignup("creator")}
            className="px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors shadow-md shadow-blue-500/5"
          >
            Claim Your Profile
          </button>
          <p className="mt-4 text-sm text-neutral-400">
            No credit card. No fees. No catch.
          </p>
        </div>
      </AnimateOnScroll>
    </>
  );
}
