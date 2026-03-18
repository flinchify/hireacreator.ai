"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth-context";
import { AnimateOnScroll, StaggerChildren } from "@/components/animate-on-scroll";

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-neutral-900 shrink-0">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ForBrandsContent() {
  const { openSignup } = useAuth();

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-white" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-neutral-100 rounded-full text-sm font-medium text-neutral-600 mb-8">
            For Brands &amp; Agencies
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
            Stop scrolling Instagram<br className="hidden sm:block" /> for creators
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Search by niche, audience size, engagement rate, and budget. Book in minutes, not weeks.
            Payments are held in Stripe escrow and released when you approve the deliverables.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/browse">
              <button className="px-8 py-3.5 text-base font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20 w-full sm:w-auto">
                Browse Creators
              </button>
            </Link>
            <button
              onClick={() => openSignup("brand")}
              className="px-8 py-3.5 text-base font-medium text-neutral-700 bg-transparent rounded-full border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 transition-all w-full sm:w-auto"
            >
              Create Brand Account
            </button>
          </div>
        </div>
      </section>

      {/* How it works — gradient cards with hover */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 bg-white">
        <AnimateOnScroll>
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-4">
              Three steps. That&apos;s it.
            </h2>
          </div>
        </AnimateOnScroll>
        <StaggerChildren className="grid md:grid-cols-3 gap-4" staggerMs={150}>
          {[
            { num: "01", title: "Search", desc: "Filter by category, platform, location, rate, and engagement. Find exactly who you need.", gradient: "from-neutral-900 via-neutral-800 to-neutral-900", screenshot: "/browse" },
            { num: "02", title: "Book", desc: "Pick a service, submit your brief, pay securely. Funds held in escrow until you approve.", gradient: "from-neutral-900 via-neutral-850 to-neutral-800", screenshot: "/pricing" },
            { num: "03", title: "Ship", desc: "Get deliverables on schedule with full usage rights. Leave a review. Rebook.", gradient: "from-neutral-800 via-neutral-900 to-neutral-900", screenshot: null },
          ].map(step => (
            <div key={step.num} className="aos-stagger-item group bg-gradient-to-br from-neutral-950 to-neutral-900 text-white rounded-3xl p-8 md:p-10 hover:scale-[1.02] hover:shadow-2xl hover:shadow-neutral-900/30 transition-all duration-300 cursor-default">
              <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">{step.num}</div>
              <h3 className="font-display text-xl font-bold mb-3 group-hover:text-white transition-colors">{step.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">{step.desc}</p>
              {/* Mini screenshot placeholder */}
              <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] overflow-hidden aspect-video flex items-center justify-center group-hover:border-white/15 transition-colors">
                <div className="text-[10px] text-neutral-600 font-medium">Preview</div>
              </div>
            </div>
          ))}
        </StaggerChildren>
      </section>

      {/* Why HireACreator — SAME white background */}
      <AnimateOnScroll as="section" className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-neutral-100">
          <div className="max-w-2xl mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight mb-4">
              Built for brands that move fast
            </h2>
            <p className="text-neutral-500 text-lg leading-relaxed">
              No more cold DMs, spreadsheet tracking, or chasing invoices.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Verified creators only", desc: "Every creator connects their socials. Real engagement, no fake followers. You see real numbers.", gradient: "from-neutral-50 to-white" },
              { title: "Transparent pricing", desc: "No more 'DM for rates'. Every creator lists services with clear pricing before you book.", gradient: "from-neutral-50 to-white" },
              { title: "Escrow payments", desc: "Pay via Stripe. Funds held until you approve. No chasing invoices or disputes.", gradient: "from-neutral-50 to-white" },
              { title: "Real brand reviews", desc: "See ratings and reviews from brands who booked the creator. Decisions backed by data.", gradient: "from-neutral-50 to-white" },
              { title: "AI agent compatible", desc: "Your AI marketing agent can search, filter, and book creators via MCP or REST API.", gradient: "from-neutral-50 to-white" },
              { title: "Scale with teams", desc: "Invite team members, manage campaigns, track all creator relationships in one dashboard.", gradient: "from-neutral-50 to-white" },
            ].map((item) => (
              <div key={item.title} className="group bg-gradient-to-br from-neutral-50 to-white border border-neutral-200 rounded-2xl p-6 hover:border-neutral-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 w-8 h-8 rounded-xl bg-neutral-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-neutral-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimateOnScroll>

      {/* Old way vs new way */}
      <AnimateOnScroll as="section" className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-neutral-100">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-4">
              The old way vs. the new way
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-neutral-200 rounded-2xl p-8 hover:shadow-sm transition-shadow">
              <div className="font-display font-bold text-neutral-400 text-lg mb-4">Without HireACreator</div>
              <ul className="space-y-3">
                {["Scroll Instagram for hours looking for creators","DM 50 people, get 5 replies","Negotiate rates over chat for days","Pay via invoice, chase for weeks","No guarantee on quality or delivery","Start over every time you need content"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-neutral-400"><span className="inline-block w-4 h-0.5 bg-neutral-200 rounded" />{item}</li>
                ))}
              </ul>
            </div>
            <div className="border-2 border-neutral-900 rounded-2xl p-8 bg-gradient-to-br from-neutral-50 to-white hover:shadow-lg transition-shadow">
              <div className="font-display font-bold text-neutral-900 text-lg mb-4">With HireACreator</div>
              <ul className="space-y-3">
                {["Search verified creators by niche and budget","See portfolios, pricing, and reviews upfront","Book instantly with clear rates","Pay securely with escrow protection","Ratings and reviews from real brands","Rebook your top performers in one click"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-neutral-700"><CheckIcon />{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </AnimateOnScroll>

      {/* CTA */}
      <AnimateOnScroll as="section" className="bg-neutral-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Your next creator is already here</h2>
          <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto">Browse verified creators, see their work, and book directly. No signup required to browse.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/browse"><button className="px-8 py-3.5 text-base font-medium text-neutral-900 bg-white rounded-full hover:bg-neutral-100 transition-colors w-full sm:w-auto">Browse Creators</button></Link>
            <button onClick={() => openSignup("brand")} className="px-8 py-3.5 text-base font-medium text-white bg-transparent rounded-full border border-neutral-700 hover:border-neutral-500 transition-all w-full sm:w-auto">Create Brand Account</button>
          </div>
        </div>
      </AnimateOnScroll>
    </>
  );
}
