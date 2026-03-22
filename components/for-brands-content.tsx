"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { AnimateOnScroll, StaggerChildren } from "@/components/animate-on-scroll";

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-blue-500 shrink-0">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── SVG Icons for Steps ── */
function SearchIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-neutral-900">
      <rect x="4" y="4" width="40" height="40" rx="12" stroke="currentColor" strokeWidth="2" />
      <circle cx="22" cy="22" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M28 28l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 36h6M14 32h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function BookPayIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-neutral-900">
      <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M16 16h16M16 22h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="16" y="28" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M22 32h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="36" cy="14" r="6" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M36 12v4M34 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DeliverIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-neutral-900">
      <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M6 18h36" stroke="currentColor" strokeWidth="2" />
      <path d="M20 26l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="14" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="17" cy="14" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="22" cy="14" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function ApiIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-neutral-900">
      <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 18l-4 4 4 4M28 18l4 4-4 4M22 16l-4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function McpIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-neutral-900">
      <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="20" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="26" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="28" cy="26" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 17v3M15 24l3-2M25 24l-3-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WebhookIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-neutral-900">
      <path d="M8 12h24v4l-12 8-12-8v-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 16l12 8 12-8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="8" y="12" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-500 shrink-0">
      <path d="M12 3l8 4v5c0 5.25-3.5 8.25-8 10-4.5-1.75-8-4.75-8-10V7l8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const BUDGET_OPTIONS = [
  "Under $5K",
  "$5K – $20K",
  "$20K – $50K",
  "$50K+",
];

export function ForBrandsContent() {
  const { openSignup } = useAuth();

  const [form, setForm] = useState({ company: "", email: "", budget: "", message: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setFormStatus("sent");
      setForm({ company: "", email: "", budget: "", message: "" });
    } catch {
      setFormStatus("error");
    }
  }

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/30" />
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0)_1px,transparent_0)] bg-[length:32px_32px]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium mb-8">
            For Brands &amp; Agencies
          </div>

          <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
            Stop scrolling Instagram<br className="hidden sm:block" /> for creators
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Search by niche, audience size, engagement rate, and budget. Book in minutes, not weeks.
            Funds held securely via Stripe and released when you approve the deliverables.
          </p>

          <p className="mt-4 text-sm font-medium text-neutral-400 tracking-wide">
            Creators ready to work &middot; Dozens of niches &middot; Multiple countries
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/browse">
              <button className="px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-500/5 w-full sm:w-auto">
                Browse Creators
              </button>
            </Link>
            <button
              onClick={() => openSignup("brand")}
              className="px-8 py-3.5 text-base font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-neutral-400 hover:bg-neutral-50 transition-all w-full sm:w-auto"
            >
              Create Brand Account
            </button>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 bg-white">
        <AnimateOnScroll>
          <div className="text-center mb-14">
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Three steps. That&apos;s it.
            </h2>
            <p className="text-neutral-500 text-lg max-w-xl mx-auto">
              From search to signed-off deliverable in a fraction of the time.
            </p>
          </div>
        </AnimateOnScroll>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerMs={150}>
          {/* Step 1 */}
          <div className="aos-stagger-item group bg-white border border-neutral-200 rounded-2xl p-8 hover:border-neutral-300 hover:shadow-sm transition-all duration-200">
            <div className="flex items-center gap-4 mb-6">
              <span className="font-display text-3xl font-bold text-blue-200 group-hover:text-blue-300 transition-colors">01</span>
              <SearchIcon />
            </div>
            <h3 className="font-display text-xl font-bold text-neutral-900 mb-4">Search &amp; Discover</h3>
            <ul className="space-y-2.5 text-sm text-neutral-600 leading-relaxed">
              <li className="flex items-start gap-2"><CheckIcon /><span>Filter by niche, platform, audience size, and location</span></li>
              <li className="flex items-start gap-2"><CheckIcon /><span>Set engagement rate and budget requirements</span></li>
              <li className="flex items-start gap-2"><CheckIcon /><span>Browse portfolios, past work, and verified analytics</span></li>
              <li className="flex items-start gap-2"><CheckIcon /><span>Read reviews from other brands before reaching out</span></li>
              <li className="flex items-start gap-2"><CheckIcon /><span>Or let your AI agent query our API and find matches in seconds</span></li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="aos-stagger-item group bg-white border border-neutral-200 rounded-2xl p-8 hover:border-neutral-300 hover:shadow-sm transition-all duration-200">
            <div className="flex items-center gap-4 mb-6">
              <span className="font-display text-3xl font-bold text-blue-200 group-hover:text-blue-300 transition-colors">02</span>
              <BookPayIcon />
            </div>
            <h3 className="font-display text-xl font-bold text-neutral-900 mb-4">Book &amp; Pay</h3>
            <ul className="space-y-2.5 text-sm text-neutral-600 leading-relaxed">
              <li className="flex items-start gap-2"><CheckIcon /><span>Select a service and submit your creative brief</span></li>
              <li className="flex items-start gap-2"><CheckIcon /><span>Pay securely via Stripe — no invoices to chase</span></li>
              <li className="flex items-start gap-2"><CheckIcon /><span>Funds held securely until you approve deliverables</span></li>
              <li className="flex items-start gap-2"><CheckIcon /><span>Contract generated automatically with usage rights</span></li>
              <li className="flex items-start gap-2"><CheckIcon /><span>Same workflow works via API for autonomous agent campaigns</span></li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="aos-stagger-item group bg-white border border-neutral-200 rounded-2xl p-8 hover:border-neutral-300 hover:shadow-sm transition-all duration-200">
            <div className="flex items-center gap-4 mb-6">
              <span className="font-display text-3xl font-bold text-blue-200 group-hover:text-blue-300 transition-colors">03</span>
              <DeliverIcon />
            </div>
            <h3 className="font-display text-xl font-bold text-neutral-900 mb-4">Receive &amp; Review</h3>
            <ul className="space-y-2.5 text-sm text-neutral-600 leading-relaxed">
              <li className="flex items-start gap-2"><CheckIcon /><span>Get deliverables on schedule with full usage rights</span></li>
              <li className="flex items-start gap-2"><CheckIcon /><span>Request revisions if the brief wasn&apos;t met</span></li>
              <li className="flex items-start gap-2"><CheckIcon /><span>Approve and release payment when you&apos;re satisfied</span></li>
              <li className="flex items-start gap-2"><CheckIcon /><span>Leave a review and rebook your top performers</span></li>
            </ul>
          </div>
        </StaggerChildren>
      </section>

      {/* ─── AI Agents & API ─── */}
      <AnimateOnScroll as="section" className="bg-neutral-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium text-neutral-300 mb-6">
              Industry First
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-4">
              Your AI agent can hire creators too
            </h2>
            <p className="text-neutral-400 text-lg leading-relaxed">
              HireACreator is the first creator marketplace with a full API and MCP server.
              Your AI marketing agent can search, filter, vet, and book creators autonomously.
            </p>
          </div>

          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16" staggerMs={120}>
            {[
              {
                icon: <ApiIcon />,
                title: "REST API",
                desc: "Full REST API with search, profiles, bookings, and webhooks.",
                detail: "$49/mo for 1,000 req/min",
              },
              {
                icon: <McpIcon />,
                title: "MCP Server",
                desc: "Model Context Protocol server for Claude, GPT, and other AI agents.",
                detail: "One-line integration",
              },
              {
                icon: <WebhookIcon />,
                title: "Webhooks",
                desc: "Real-time notifications for bookings, deliveries, reviews, and payments.",
                detail: "JSON payloads over HTTPS",
              },
            ].map((card) => (
              <div key={card.title} className="aos-stagger-item group bg-white/[0.05] border border-white/10 rounded-2xl p-8 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300">
                <div className="mb-5 text-white">{card.icon}</div>
                <h3 className="font-display text-lg font-bold mb-2">{card.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-4">{card.desc}</p>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{card.detail}</span>
              </div>
            ))}
          </StaggerChildren>

          {/* Code snippet */}
          <AnimateOnScroll>
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">Example MCP call</p>
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 sm:p-6 overflow-x-auto">
                <pre className="text-xs sm:text-sm text-neutral-300 font-mono leading-relaxed">{`{
  "tool": "search_creators",
  "input": {
    "niche": "UGC",
    "location": "Australia",
    "max_rate": 500,
    "min_rating": 4.5
  }
}`}</pre>
              </div>
              <Link href="/api-docs" className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                Read the full API docs
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </AnimateOnScroll>

      {/* ─── For Agencies ─── */}
      <AnimateOnScroll as="section" className="bg-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 border-t border-neutral-100">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium mb-6">
                For Agencies
              </div>
              <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight mb-4">
                Manage campaigns at scale
              </h2>
              <p className="text-neutral-500 text-lg leading-relaxed">
                One dashboard for your entire team. Track every creator relationship, every campaign, every dollar.
              </p>
            </div>

            <StaggerChildren className="space-y-4" staggerMs={100}>
              {[
                { title: "Multi-campaign dashboard", desc: "Run multiple brand campaigns simultaneously with separate budgets and timelines." },
                { title: "Team roles & permissions", desc: "Invite team members with role-based access — managers, coordinators, and viewers." },
                { title: "Creator relationship tracking", desc: "See every booking, deliverable, and review across all your brand clients." },
                { title: "Bulk outreach tools", desc: "Send briefs to multiple creators at once and compare proposals side by side." },
                { title: "White-label marketplace", desc: "Enterprise clients get a branded version of the marketplace with their own domain." },
              ].map((item) => (
                <div key={item.title} className="aos-stagger-item flex items-start gap-4 p-4 rounded-xl hover:bg-blue-100/50 transition-colors">
                  <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-neutral-900 mb-0.5">{item.title}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </AnimateOnScroll>

      {/* ─── Pricing Snapshot ─── */}
      <AnimateOnScroll as="section" className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 border-t border-neutral-100">
          <div className="text-center mb-14">
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Simple pricing for brands
            </h2>
            <p className="text-neutral-500 text-lg">
              No per-booking fees. No hidden charges. Cancel anytime.
            </p>
          </div>

          <StaggerChildren className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto" staggerMs={150}>
            {/* Brand Analytics */}
            <div className="aos-stagger-item group border border-neutral-200 rounded-2xl p-8 hover:border-neutral-300 shadow-md shadow-blue-500/5 transition-all duration-200">
              <h3 className="font-display text-lg font-bold text-neutral-900 mb-1">Brand Analytics</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-4xl font-bold text-neutral-900">$199</span>
                <span className="text-neutral-500 text-sm">/mo</span>
              </div>
              <ul className="space-y-2.5 text-sm text-neutral-600">
                <li className="flex items-center gap-2"><CheckIcon />Unlimited creator search</li>
                <li className="flex items-center gap-2"><CheckIcon />Audience analytics &amp; vetting</li>
                <li className="flex items-center gap-2"><CheckIcon />Campaign tracking dashboard</li>
                <li className="flex items-center gap-2"><CheckIcon />Secure payment protection via Stripe</li>
                <li className="flex items-center gap-2"><CheckIcon />Priority support</li>
              </ul>
            </div>

            {/* Enterprise */}
            <div className="aos-stagger-item group border-2 border-blue-500 rounded-2xl p-8 shadow-md shadow-blue-500/5 transition-all duration-200">
              <h3 className="font-display text-lg font-bold text-neutral-900 mb-1">Enterprise</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-4xl font-bold text-neutral-900">$999</span>
                <span className="text-neutral-500 text-sm">/mo</span>
              </div>
              <ul className="space-y-2.5 text-sm text-neutral-600">
                <li className="flex items-center gap-2"><CheckIcon />Everything in Brand Analytics</li>
                <li className="flex items-center gap-2"><CheckIcon />API access (1,000 req/min)</li>
                <li className="flex items-center gap-2"><CheckIcon />MCP server integration</li>
                <li className="flex items-center gap-2"><CheckIcon />Team roles &amp; permissions</li>
                <li className="flex items-center gap-2"><CheckIcon />White-label option</li>
                <li className="flex items-center gap-2"><CheckIcon />Dedicated account manager</li>
              </ul>
            </div>
          </StaggerChildren>

          <div className="text-center mt-8">
            <Link href="/pricing" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
              See full pricing details &rarr;
            </Link>
          </div>
        </div>
      </AnimateOnScroll>

      {/* ─── Trust & Security ─── */}
      <AnimateOnScroll as="section" className="bg-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
          <div className="text-center mb-14">
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Trust &amp; security built in
            </h2>
            <p className="text-neutral-500 text-lg max-w-xl mx-auto">
              Every transaction is protected. Every creator is verified. Every review is real.
            </p>
          </div>

          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerMs={80}>
            {[
              { title: "Secure payment protection via Stripe", desc: "Funds are held securely until you approve the deliverables. No risk of paying for work you don't receive." },
              { title: "Verified creator profiles", desc: "Every creator connects their social accounts. Follower counts, engagement rates, and audience demographics are verified." },
              { title: "Real brand reviews", desc: "Only brands that completed a booking can leave reviews. No fake testimonials — just honest feedback." },
              { title: "Contract management", desc: "Contracts are generated automatically with clear terms, usage rights, and deliverable specs." },
              { title: "Dispute resolution", desc: "If something goes wrong, our team steps in. Funds stay held securely until the issue is resolved." },
              { title: "Data privacy", desc: "SOC 2 compliant infrastructure. Your data and creator communications are encrypted at rest and in transit." },
            ].map((item) => (
              <div key={item.title} className="aos-stagger-item flex items-start gap-3 bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 hover:border-neutral-300 shadow-md shadow-blue-500/5 transition-all duration-200">
                <ShieldIcon />
                <div>
                  <h3 className="font-display font-bold text-neutral-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </AnimateOnScroll>

      {/* ─── Contact Form ─── */}
      <AnimateOnScroll as="section" className="bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 border-t border-neutral-100">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Get in touch
            </h2>
            <p className="text-neutral-500 text-lg">
              Planning a large campaign or need enterprise features? Let&apos;s talk.
            </p>
          </div>

          {formStatus === "sent" ? (
            <div className="text-center py-12 border border-neutral-200 rounded-2xl shadow-md shadow-blue-500/5">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <h3 className="font-display text-xl font-bold text-neutral-900 mb-2">Message sent</h3>
              <p className="text-neutral-500 text-sm">We&apos;ll get back to you within one business day.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-neutral-700 mb-1.5">Company name *</label>
                <input
                  id="company"
                  type="text"
                  required
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">Work email *</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-neutral-700 mb-1.5">Monthly creator budget</label>
                <select
                  id="budget"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors bg-white appearance-none"
                >
                  <option value="">Select a range</option>
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1.5">Message</label>
                <textarea
                  id="message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors resize-none"
                  placeholder="Tell us about your campaign or what you're looking for..."
                />
              </div>

              {formStatus === "error" && (
                <p className="text-sm text-red-600">Something went wrong. Please try again or email us directly.</p>
              )}

              <button
                type="submit"
                disabled={formStatus === "sending"}
                className="w-full px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formStatus === "sending" ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </AnimateOnScroll>

      {/* ─── Final CTA ─── */}
      <AnimateOnScroll as="section" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-4xl font-bold mb-4">Your next creator is already here</h2>
          <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto">
            Browse verified creators, see their work, and book directly. No signup required to browse.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/browse">
              <button className="px-8 py-3.5 text-base font-medium text-neutral-900 bg-white rounded-lg hover:bg-neutral-100 transition-colors w-full sm:w-auto">
                Browse Creators
              </button>
            </Link>
            <Link href="#contact">
              <button className="px-8 py-3.5 text-base font-medium text-white bg-transparent rounded-lg border border-neutral-300 hover:border-neutral-200 transition-all w-full sm:w-auto">
                Contact Sales
              </button>
            </Link>
          </div>
        </div>
      </AnimateOnScroll>
    </>
  );
}
