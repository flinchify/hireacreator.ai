"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth-context";
import { CreatorCard } from "@/components/creator-card";
import { AnimateOnScroll, StaggerChildren } from "@/components/animate-on-scroll";
import {
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
  TwitterIcon,
  LinkedInIcon,
} from "@/components/icons/platforms";
import { PlatformTicker } from "@/components/platform-ticker";
import type { Creator } from "@/lib/types";

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-neutral-900 shrink-0">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HomepageContent({
  featured,
  creatorCount,
}: {
  featured: Creator[];
  creatorCount: number;
}) {
  const { openSignup } = useAuth();

  return (
    <>
      {/* Hero — creator-first */}
      <section className="relative pt-40 sm:pt-52 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-white" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
            Your talent deserves<br className="hidden sm:block" /> more than a link in bio
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Stop undercharging on Fiverr. Stop getting ghosted on DMs.
            Get a profile that sells your work, a calendar that fills itself,
            and brands that come to you.
          </p>

          <div className="mt-10 mb-2">
            <PlatformTicker />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openSignup("creator")}
              className="px-8 py-3.5 text-base font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20 w-full sm:w-auto"
            >
              Get Started — it's free
            </button>
            <Link href="/browse">
              <button className="px-8 py-3.5 text-base font-medium text-neutral-700 bg-transparent rounded-full border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 transition-all w-full sm:w-auto">
                Browse Creators
              </button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-neutral-400">
            0% commission on bookings. Creators keep 100% of earnings.
          </p>
        </div>
      </section>

      {/* What you get — visual cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <StaggerChildren className="grid md:grid-cols-3 gap-4" staggerMs={150}>
          <div className="aos-stagger-item bg-neutral-950 text-white rounded-3xl p-8 md:p-10">
            <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">01</div>
            <h3 className="font-display text-xl font-bold mb-3">
              A profile that converts
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Not another boring link page. A full portfolio, service menu with pricing,
              and instant booking. Put it in your bio and watch it work.
            </p>
          </div>
          <div className="aos-stagger-item bg-neutral-950 text-white rounded-3xl p-8 md:p-10">
            <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">02</div>
            <h3 className="font-display text-xl font-bold mb-3">
              Brands find you
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Stop pitching. Brands browse creators by niche, platform, and budget —
              then book directly. You set your own rates. Early creators get featured placement.
            </p>
          </div>
          <div className="aos-stagger-item bg-neutral-950 text-white rounded-3xl p-8 md:p-10">
            <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">03</div>
            <h3 className="font-display text-xl font-bold mb-3">
              Get paid instantly
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              0% commission — you keep 100% of what you charge.
              Payments held in Stripe escrow until work is approved. No chasing invoices. Brands pay a small service fee, not you.
            </p>
          </div>
        </StaggerChildren>
      </section>

      {/* Platform preview / link-in-bio mockup */}
      <AnimateOnScroll as="section" id="for-creators" className="bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Mockup */}
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-xl shadow-neutral-200/50 max-w-sm mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-300 flex items-center justify-center text-white font-bold text-lg">
                    SR
                  </div>
                  <div>
                    <div className="font-display font-bold text-neutral-900">Sarah Rivera</div>
                    <div className="text-sm text-neutral-400">hireacreator.ai/sarahrivera</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    Verified
                  </span>
                  <span className="text-xs text-neutral-400">UGC Creator</span>
                  <span className="text-xs text-neutral-400">Melbourne, AU</span>
                </div>
                <p className="text-sm text-neutral-500 mb-4 leading-relaxed">
                  UGC specialist for beauty, skincare &amp; wellness brands. 150+ videos delivered. Fast turnaround.
                </p>
                <div className="flex gap-3 mb-5">
                  <InstagramIcon size={16} className="text-neutral-400" />
                  <TikTokIcon size={16} className="text-neutral-400" />
                  <YouTubeIcon size={16} className="text-neutral-400" />
                  <TwitterIcon size={16} className="text-neutral-400" />
                </div>
                <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">Services</div>
                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
                    <div>
                      <div className="text-sm font-medium text-neutral-900">UGC Video Package</div>
                      <div className="text-xs text-neutral-400">3 videos, 7-day delivery</div>
                    </div>
                    <span className="text-sm font-bold text-neutral-900">$1,200</span>
                  </div>
                  <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
                    <div>
                      <div className="text-sm font-medium text-neutral-900">Product Photography</div>
                      <div className="text-xs text-neutral-400">10 edited shots, 5-day delivery</div>
                    </div>
                    <span className="text-sm font-bold text-neutral-900">$800</span>
                  </div>
                  <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
                    <div>
                      <div className="text-sm font-medium text-neutral-900">Monthly Retainer</div>
                      <div className="text-xs text-neutral-400">8 videos + 15 photos/mo</div>
                    </div>
                    <span className="text-sm font-bold text-neutral-900">$3,500</span>
                  </div>
                </div>
                <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">Portfolio</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-rose-100 to-rose-200" />
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-100 to-amber-200" />
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-violet-100 to-violet-200" />
                </div>
                <button className="w-full mt-5 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors">
                  Book Now
                </button>
              </div>
            </div>

            {/* Copy */}
            <div className="order-1 lg:order-2">
              <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
                Your profile
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight mb-6">
                Linktree shows links.<br />
                This books clients.
              </h2>
              <p className="text-neutral-500 leading-relaxed mb-8 text-lg">
                Your HireACreator profile is a complete storefront. Portfolio,
                services with clear pricing, verified reviews, and a booking
                system built in. Drop it in your bio and let it sell for you.
              </p>
              <ul className="space-y-4">
                {[
                  "Portfolio, pricing, and booking in one page",
                  "Connect Instagram, TikTok, YouTube, and more",
                  "Accept payments directly via Stripe — 0% platform fee",
                  "Verified badge builds instant trust with brands",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-0.5"><CheckIcon /></div>
                    <span className="text-neutral-600">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <button
                  onClick={() => openSignup("creator")}
                  className="px-8 py-3.5 text-base font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors"
                >
                  Create Your Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </AnimateOnScroll>

      {/* Featured Creators */}
      {featured.length > 0 && (
        <AnimateOnScroll as="section" className="bg-white">
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
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors"
              >
                View all <ArrowRightIcon />
              </Link>
            </div>
            <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" staggerMs={100}>
              {featured.map((creator) => (
                <div key={creator.id} className="aos-stagger-item">
                  <CreatorCard creator={creator} />
                </div>
              ))}
            </StaggerChildren>
          </div>
        </AnimateOnScroll>
      )}

      {/* For Brands */}
      <AnimateOnScroll as="section" id="for-brands" className="bg-neutral-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl mb-14">
            <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
              For Brands & Agencies
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-4">
              Stop scrolling Instagram for creators
            </h2>
            <p className="text-neutral-400 text-lg leading-relaxed">
              Search by niche, audience size, engagement rate, and budget.
              Book in minutes, not weeks. Payments are held in Stripe escrow
              and released when you approve the deliverables.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
              <div className="text-2xl font-display font-bold text-white mb-1">Search</div>
              <p className="text-sm text-neutral-400">
                Filter by category, platform, location, rate, and engagement.
                Find exactly who you need.
              </p>
            </div>
            <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
              <div className="text-2xl font-display font-bold text-white mb-1">Book</div>
              <p className="text-sm text-neutral-400">
                Pick a service, submit your brief, pay securely.
                Funds held in escrow until you approve.
              </p>
            </div>
            <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
              <div className="text-2xl font-display font-bold text-white mb-1">Ship</div>
              <p className="text-sm text-neutral-400">
                Get deliverables on schedule with full usage rights.
                Leave a review. Rebook.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link href="/browse">
              <button className="px-8 py-3.5 text-base font-medium text-neutral-900 bg-white rounded-full hover:bg-neutral-100 transition-colors">
                Find a Creator
              </button>
            </Link>
          </div>
        </div>
      </AnimateOnScroll>

      {/* For AI Agents */}
      <AnimateOnScroll as="section" id="for-agents" className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
                For AI Agents
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight mb-6">
                The first creator marketplace your agent can use
              </h2>
              <p className="text-neutral-500 text-lg leading-relaxed mb-8">
                Your AI agent needs content? It can search creators, check availability,
                and place a booking autonomously. MCP and REST API,
                built for the agentic era.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5"><CheckIcon /></div>
                  <div>
                    <span className="font-medium text-neutral-900">MCP Server</span>
                    <span className="text-neutral-500"> — Claude, GPT, and any MCP-compatible agent can discover and book creators natively.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5"><CheckIcon /></div>
                  <div>
                    <span className="font-medium text-neutral-900">REST API</span>
                    <span className="text-neutral-500"> — Full programmatic access. Search, filter, book, and manage campaigns via JSON endpoints.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5"><CheckIcon /></div>
                  <div>
                    <span className="font-medium text-neutral-900">End-to-end autonomous</span>
                    <span className="text-neutral-500"> — From search to payment to delivery tracking. No human bottleneck required.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Code preview */}
            <div className="bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-neutral-800/50">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <span className="text-xs text-neutral-600 ml-2 font-mono">api.hireacreator.ai</span>
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
      </AnimateOnScroll>

      {/* Comparison */}
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

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="pb-4 pr-4 text-sm font-medium text-neutral-400 w-1/4" />
                  <th className="pb-4 px-4 text-center">
                    <div className="font-display font-bold text-neutral-900">HireACreator</div>
                  </th>
                  <th className="pb-4 px-4 text-center">
                    <div className="font-display font-bold text-neutral-400">Linktree</div>
                  </th>
                  <th className="pb-4 px-4 text-center">
                    <div className="font-display font-bold text-neutral-400">Fiverr</div>
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
                  <tr key={i} className="border-b border-neutral-100">
                    <td className="py-3.5 pr-4 text-neutral-700 font-medium">{row.feature}</td>
                    <td className="py-3.5 px-4 text-center">
                      {row.us ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-900 text-white">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
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

      {/* Final CTA */}
      <AnimateOnScroll as="section" className="bg-white border-t border-neutral-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            {creatorCount > 0
              ? "Join the creators already here"
              : "Be one of the first"}
          </h2>
          <p className="text-neutral-500 text-lg mb-10 max-w-xl mx-auto">
            {creatorCount > 0
              ? "Create your profile, list your services, and start getting booked by brands and AI agents."
              : "Early creators get featured placement to every brand that joins. First 500 get priority access."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openSignup("creator")}
              className="px-8 py-3.5 text-base font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20 w-full sm:w-auto"
            >
              Get Started — it's free
            </button>
            <Link href="/browse">
              <button className="px-8 py-3.5 text-base font-medium text-neutral-700 bg-transparent rounded-full border border-neutral-300 hover:border-neutral-400 hover:bg-white transition-all w-full sm:w-auto">
                Browse Creators
              </button>
            </Link>
          </div>
        </div>
      </AnimateOnScroll>
    </>
  );
}
