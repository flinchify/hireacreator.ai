"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-context";
import { AnimateOnScroll, StaggerChildren } from "@/components/animate-on-scroll";

type Tab = "creators" | "brands" | "agents";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-neutral-900 shrink-0">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

async function handleCheckout(plan: string) {
  const res = await fetch("/api/checkout/subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else if (data.error === "unauthorized") {
    // Will be caught by the openSignup fallback
  }
}

export function PricingContent() {
  const [tab, setTab] = useState<Tab>("creators");
  const { openSignup } = useAuth();

  return (
    <>
      <section className="pt-32 sm:pt-40 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              Free for creators. Always. Brands and agents pay only for premium features.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex gap-1 p-1 bg-neutral-100 rounded-full">
              {(["creators", "brands", "agents"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-6 py-2 text-sm font-medium rounded-full transition-all capitalize ${
                    tab === t
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {t === "agents" ? "API / Agents" : `For ${t}`}
                </button>
              ))}
            </div>
          </div>

          {/* Creator pricing */}
          {tab === "creators" && (
            <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto" staggerMs={100}>
              <div className="aos-stagger-item border border-neutral-200 rounded-2xl p-8">
                <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Free</div>
                <div className="font-display text-4xl font-bold text-neutral-900 mb-1">$0</div>
                <div className="text-sm text-neutral-500 mb-6">forever</div>
                <p className="text-sm text-neutral-500 mb-6">Everything you need to get started and get booked.</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Creator profile page",
                    "Up to 3 services listed",
                    "Basic analytics",
                    "hireacreator.ai/yourname",
                    "0% platform fees on earnings",
                    "Stripe payouts",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-600">
                      <CheckIcon /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => openSignup("creator")}
                  className="w-full py-2.5 text-sm font-medium rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Get Started Free
                </button>
              </div>

              <div className="aos-stagger-item border-2 border-neutral-900 rounded-2xl p-8 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-neutral-900 text-white text-xs font-medium rounded-full">
                  Popular
                </div>
                <div className="text-sm font-medium text-neutral-900 uppercase tracking-wider mb-2">Pro</div>
                <div className="font-display text-4xl font-bold text-neutral-900 mb-1">$19</div>
                <div className="text-sm text-neutral-500 mb-6">per month</div>
                <p className="text-sm text-neutral-500 mb-6">For creators ready to scale and stand out.</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Free",
                    "Unlimited services",
                    "Custom domain support",
                    "Priority in search results",
                    "Advanced analytics dashboard",
                    "Premium profile templates",
                    "0% platform fees on earnings",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-600">
                      <CheckIcon /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout("creator_pro")}
                  className="w-full py-2.5 text-sm font-medium rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  Upgrade to Pro
                </button>
              </div>

              <div className="aos-stagger-item border border-neutral-200 rounded-2xl p-8">
                <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Business</div>
                <div className="font-display text-4xl font-bold text-neutral-900 mb-1">$49</div>
                <div className="text-sm text-neutral-500 mb-6">per month</div>
                <p className="text-sm text-neutral-500 mb-6">For agencies and multi-person creator teams.</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Pro",
                    "Team member access",
                    "Built-in invoicing",
                    "Calendar sync (Google, Apple, Outlook)",
                    "Branded profile page",
                    "Priority support",
                    "0% platform fees on earnings",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-600">
                      <CheckIcon /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout("creator_biz")}
                  className="w-full py-2.5 text-sm font-medium rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Upgrade to Business
                </button>
              </div>
            </StaggerChildren>
          )}

          {/* Brand pricing */}
          {tab === "brands" && (
            <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto" staggerMs={100}>
              <div className="aos-stagger-item border border-neutral-200 rounded-2xl p-8">
                <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Free</div>
                <div className="font-display text-4xl font-bold text-neutral-900 mb-1">$0</div>
                <div className="text-sm text-neutral-500 mb-6">forever</div>
                <p className="text-sm text-neutral-500 mb-6">Browse and book creators with no monthly commitment.</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Browse all creators",
                    "Search & filter by niche",
                    "Book creators directly",
                    "Escrow payment protection",
                    "10% service fee per booking",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-600">
                      <CheckIcon /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => openSignup("brand")}
                  className="w-full py-2.5 text-sm font-medium rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Get Started Free
                </button>
              </div>

              <div className="aos-stagger-item border-2 border-neutral-900 rounded-2xl p-8 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-neutral-900 text-white text-xs font-medium rounded-full">
                  Popular
                </div>
                <div className="text-sm font-medium text-neutral-900 uppercase tracking-wider mb-2">Analytics</div>
                <div className="font-display text-4xl font-bold text-neutral-900 mb-1">$199</div>
                <div className="text-sm text-neutral-500 mb-6">per month</div>
                <p className="text-sm text-neutral-500 mb-6">Data-driven creator marketing for serious brands.</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Free",
                    "Creator comparison tools",
                    "Engagement analytics",
                    "Campaign ROI tracking",
                    "Saved creator shortlists",
                    "Advanced search filters",
                    "10% service fee per booking",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-600">
                      <CheckIcon /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout("brand_analytics")}
                  className="w-full py-2.5 text-sm font-medium rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  Upgrade to Analytics
                </button>
              </div>

              <div className="aos-stagger-item border border-neutral-200 rounded-2xl p-8">
                <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Enterprise</div>
                <div className="font-display text-4xl font-bold text-neutral-900 mb-1">$999</div>
                <div className="text-sm text-neutral-500 mb-6">per month</div>
                <p className="text-sm text-neutral-500 mb-6">For brands spending $20K+ per month on creators.</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Analytics",
                    "5% service fee (halved)",
                    "Dedicated account manager",
                    "Unlimited team seats",
                    "Priority creator matching",
                    "Custom integrations",
                    "SLA guarantee",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-600">
                      <CheckIcon /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout("brand_enterprise")}
                  className="w-full py-2.5 text-sm font-medium rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Upgrade to Enterprise
                </button>
              </div>
            </StaggerChildren>
          )}

          {/* Agent pricing */}
          {tab === "agents" && (
            <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto" staggerMs={100}>
              <div className="aos-stagger-item border border-neutral-200 rounded-2xl p-8">
                <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Free</div>
                <div className="font-display text-4xl font-bold text-neutral-900 mb-1">$0</div>
                <div className="text-sm text-neutral-500 mb-6">forever</div>
                <p className="text-sm text-neutral-500 mb-6">Get started and explore the API.</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "100 requests per day",
                    "Read-only access",
                    "REST API",
                    "Community support",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-600">
                      <CheckIcon /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => openSignup("agent")}
                  className="w-full py-2.5 text-sm font-medium rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Get API Key Free
                </button>
              </div>

              <div className="aos-stagger-item border-2 border-neutral-900 rounded-2xl p-8 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-neutral-900 text-white text-xs font-medium rounded-full">
                  Popular
                </div>
                <div className="text-sm font-medium text-neutral-900 uppercase tracking-wider mb-2">Pro</div>
                <div className="font-display text-4xl font-bold text-neutral-900 mb-1">$49</div>
                <div className="text-sm text-neutral-500 mb-6">per month</div>
                <p className="text-sm text-neutral-500 mb-6">Full access for production agents.</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "10,000 requests per day",
                    "Read + write + book access",
                    "MCP server access",
                    "Priority support",
                    "Webhooks for booking status",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-600">
                      <CheckIcon /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout("api_pro")}
                  className="w-full py-2.5 text-sm font-medium rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  Upgrade to Pro
                </button>
              </div>

              <div className="aos-stagger-item border border-neutral-200 rounded-2xl p-8">
                <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Enterprise</div>
                <div className="font-display text-4xl font-bold text-neutral-900 mb-1">Custom</div>
                <div className="text-sm text-neutral-500 mb-6">contact us</div>
                <p className="text-sm text-neutral-500 mb-6">For high-volume agents and agencies.</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited requests",
                    "Dedicated infrastructure",
                    "Custom integrations",
                    "SLA guarantee",
                    "Dedicated support engineer",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-600">
                      <CheckIcon /> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:hello@hireacreator.ai"
                  className="block w-full py-2.5 text-sm font-medium rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors text-center"
                >
                  Contact Sales
                </a>
              </div>
            </StaggerChildren>
          )}

          {/* Add-on */}
          <AnimateOnScroll className="mt-16">
            <div className="max-w-2xl mx-auto bg-neutral-50 rounded-2xl border border-neutral-200 p-8 text-center">
              <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Add-on</div>
              <h3 className="font-display text-xl font-bold text-neutral-900 mb-2">Boosted Listing</h3>
              <p className="text-neutral-500 text-sm mb-4">
                Appear at the top of search results and the browse page. Available to all creators.
              </p>
              <div className="font-display text-2xl font-bold text-neutral-900 mb-4">$10/week</div>
              <button
                onClick={() => handleCheckout("boosted")}
                className="px-6 py-2.5 text-sm font-medium rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
              >
                Boost Your Profile
              </button>
            </div>
          </AnimateOnScroll>

          {/* FAQ */}
          <div className="mt-20 max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-neutral-900 text-center mb-10">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "Do creators really pay 0% fees?",
                  a: "Yes. Creators keep 100% of what they charge. We make money from brand service fees, subscriptions, and optional add-ons. We will never take a cut from creator earnings.",
                },
                {
                  q: "What does the 10% service fee cover?",
                  a: "The 10% is added on top of the creator's price and paid by the brand. It covers payment processing, escrow protection, dispute resolution, and platform maintenance.",
                },
                {
                  q: "Can I cancel my subscription anytime?",
                  a: "Yes. All subscriptions are month-to-month with no contracts. Cancel anytime from your dashboard. You keep access until the end of your billing period.",
                },
                {
                  q: "How do Enterprise brands save money?",
                  a: "Enterprise brands pay a 5% service fee instead of 10%. If you're spending $20K+ per month on creators, the $999 subscription pays for itself and then some.",
                },
              ].map((faq) => (
                <div key={faq.q} className="border-b border-neutral-100 pb-6">
                  <h3 className="font-medium text-neutral-900 mb-2">{faq.q}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
