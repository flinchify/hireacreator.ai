"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-context";
import { AnimateOnScroll, StaggerChildren } from "@/components/animate-on-scroll";
import { StripeLogo } from "@/components/stripe-logo";

type Tab = "creators" | "brands" | "api";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-neutral-900 shrink-0">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-neutral-300 shrink-0">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

const tabLabels: Record<Tab, string> = {
  creators: "Creator Plans",
  brands: "Brand Plans",
  api: "API Plans",
};

const creatorComparisonFeatures = [
  { label: "AI-customized profile", free: true, pro: true, biz: true },
  { label: "Premium templates", free: "18 templates", pro: "18 + custom builder", biz: "18 + custom builder" },
  { label: "Services listed", free: "Up to 3", pro: "Unlimited", biz: "Unlimited" },
  { label: "Receive brand offers", free: true, pro: true, biz: true },
  { label: "Intro animations", free: "2 included", pro: "All included", biz: "All included" },
  { label: "AI bio writer", free: false, pro: true, biz: true },
  { label: "Reply templates", free: false, pro: true, biz: true },
  { label: "Analytics", free: "Basic", pro: "Advanced", biz: "Advanced" },
  { label: "Remove branding", free: false, pro: true, biz: true },
  { label: "Priority search", free: false, pro: true, biz: true },
  { label: "Boosted listing", free: false, pro: true, biz: true },
  { label: "Verified badge priority", free: false, pro: true, biz: true },
  { label: "Earnings dashboard", free: false, pro: false, biz: true },
  { label: "Calendar paid sessions", free: false, pro: false, biz: true },
  { label: "Link products and courses", free: false, pro: false, biz: true },
  { label: "Priority support", free: false, pro: true, biz: "Dedicated" },
  { label: "Commission on earnings", free: "0%", pro: "0%", biz: "0%" },
];

const brandComparisonFeatures = [
  { label: "Search and discover creators", analytics: true, enterprise: true },
  { label: "Send offers to creators", analytics: true, enterprise: "Unlimited" },
  { label: "Creator profiles with follower data", analytics: true, enterprise: true },
  { label: "Browse by niche and platform", analytics: true, enterprise: true },
  { label: "Secure Stripe escrow payments", analytics: true, enterprise: true },
  { label: "Service fee on deals", analytics: "10%", enterprise: "5%" },
  { label: "Priority support", analytics: false, enterprise: true },
];

const faqItems = [
  {
    q: "Do creators really pay 0% fees?",
    a: "Yes, always. Creators keep 100% of what they charge. We make money from brand service fees, subscriptions, and optional add-ons. We will never take a cut from creator earnings.",
  },
  {
    q: "What does the 10% service fee cover?",
    a: "The 10% is added on top of the creator's price and paid by the brand. It covers payment processing, payment protection, dispute resolution, and platform maintenance.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. All subscriptions are month-to-month with no contracts. Cancel anytime from your dashboard. You keep access until the end of your billing period.",
  },
  {
    q: "How do Enterprise brands save money?",
    a: "Enterprise brands pay a 5% service fee instead of 10%. If you're spending $20K+ per month on creators, the $999 subscription pays for itself and then some.",
  },
  {
    q: "What's included in the free plan?",
    a: "Everything you need to launch: a full link-in-bio page with 8 premium templates, up to 3 services, 2 intro animations, social links, bio links with click tracking, calendar booking for free sessions, basic analytics, a QR code, and 0% commission on all earnings.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Annual billing is coming soon with a 20% discount. For now, all plans are billed monthly with no long-term commitment required.",
  },
];

function formatPrice(monthly: number, annual: boolean): string {
  if (annual) {
    const discounted = Math.round(monthly * 0.8);
    return `$${discounted}`;
  }
  return `$${monthly}`;
}

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <CheckIcon />;
  }
  if (value === false) {
    return <XIcon />;
  }
  return <span className="text-sm text-neutral-700">{value}</span>;
}

export function PricingContent() {
  const [tab, setTab] = useState<Tab>("creators");
  const [annual, setAnnual] = useState(false);
  const { openSignup } = useAuth();

  return (
    <>
      <section className="pt-32 sm:pt-40 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-4xl sm:text-6xl font-bold text-neutral-900 tracking-tight mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-base sm:text-lg text-neutral-500 max-w-2xl mx-auto">
              Free for creators. Always. Brands and agents pay only for premium features.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex gap-1 p-1 bg-neutral-100 rounded-full overflow-x-auto max-w-full">
              {(["creators", "brands", "api"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-full transition-all whitespace-nowrap ${
                    tab === t
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {tabLabels[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className={`text-sm font-medium ${!annual ? "text-neutral-900" : "text-neutral-400"}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                annual ? "bg-neutral-900" : "bg-neutral-300"
              }`}
              aria-label="Toggle annual billing"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  annual ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-neutral-900" : "text-neutral-400"}`}>
              Annual
            </span>
            {annual && (
              <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            )}
          </div>

          {/* Creator Plans */}
          {tab === "creators" && (
            <>
              <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto" staggerMs={100}>
                {/* Free */}
                <div className="aos-stagger-item border border-neutral-200 rounded-2xl p-8 flex flex-col">
                  <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Free</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display text-4xl font-bold text-neutral-900">$0</span>
                  </div>
                  <div className="text-sm text-neutral-500 mb-6">No credit card required</div>
                  <p className="text-sm text-neutral-500 mb-6">
                    Launch your creator page, receive brand offers, and start earning. Everything you need to get discovered.
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "AI-customized link-in-bio page",
                      "18 premium templates",
                      "Up to 3 services listed",
                      "Custom fonts, colors, button shapes",
                      "2 intro animations included",
                      "Social links (15+ platforms)",
                      "Bio links with click tracking",
                      "Calendar booking (free sessions)",
                      "Receive brand offers",
                      "0% commission on all earnings",
                      "Basic analytics",
                      "QR code for your page",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-600">
                        <span className="mt-0.5"><CheckIcon /></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => openSignup("creator")}
                    className="w-full py-3 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] transition-all"
                  >
                    Get Started Free
                  </button>
                </div>

                {/* Creator Pro */}
                <div className="aos-stagger-item relative rounded-2xl p-8 flex flex-col bg-gradient-to-r from-blue-50 via-white to-blue-50 border-2 border-blue-200">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-neutral-900 text-white text-xs font-medium rounded-full">
                    Popular
                  </div>
                  <div className="text-sm font-medium text-neutral-900 uppercase tracking-wider mb-2">Creator Pro</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display text-4xl font-bold text-neutral-900">
                      {formatPrice(19, annual)}
                    </span>
                    <span className="text-sm text-neutral-500">/mo</span>
                  </div>
                  {annual ? (
                    <div className="text-sm text-neutral-500 mb-6">
                      <span className="line-through text-neutral-400">$19/mo</span>
                      <span className="ml-1.5 text-green-700 font-medium">billed annually</span>
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-500 mb-6">Billed monthly</div>
                  )}
                  <p className="text-sm text-neutral-500 mb-6">
                    Stand out in the marketplace. Get found faster, convert more brand deals, and grow your audience with pro tools.
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "Everything in Free",
                      "Unlimited services",
                      "All 18 templates + custom builder",
                      "All intro animations included",
                      "Priority in marketplace search",
                      "Boosted listing in browse",
                      "Advanced analytics",
                      "AI bio writer",
                      "Reply templates",
                      "Remove HireACreator branding",
                      "Verified badge priority",
                      "Priority support",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-600">
                        <span className="mt-0.5"><CheckIcon /></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {annual && (
                    <p className="text-xs text-neutral-400 text-center mb-3">
                      Annual billing coming soon — you will not be charged annually. You will be billed monthly for now.
                    </p>
                  )}
                  <button
                    onClick={() => handleCheckout("creator_pro")}
                    className="w-full py-3 text-sm font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98] transition-all"
                  >
                    Upgrade to Pro
                  </button>
                </div>

                {/* Creator Business */}
                <div className="aos-stagger-item border border-neutral-200 rounded-2xl p-8 flex flex-col">
                  <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Creator Business</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display text-4xl font-bold text-neutral-900">
                      {formatPrice(49, annual)}
                    </span>
                    <span className="text-sm text-neutral-500">/mo</span>
                  </div>
                  {annual ? (
                    <div className="text-sm text-neutral-500 mb-6">
                      <span className="line-through text-neutral-400">$49/mo</span>
                      <span className="ml-1.5 text-green-700 font-medium">billed annually</span>
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-500 mb-6">Billed monthly</div>
                  )}
                  <p className="text-sm text-neutral-500 mb-6">
                    For serious creators monetizing across multiple channels. Paid calendar, product store, and full earnings visibility.
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "Everything in Pro",
                      "Earnings dashboard",
                      "Calendar paid sessions",
                      "Link your own products and courses",
                      "Verification manager",
                      "Priority in all search results",
                      "Dedicated support",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-600">
                        <span className="mt-0.5"><CheckIcon /></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {annual && (
                    <p className="text-xs text-neutral-400 text-center mb-3">
                      Annual billing coming soon — you will not be charged annually. You will be billed monthly for now.
                    </p>
                  )}
                  <button
                    onClick={() => handleCheckout("creator_biz")}
                    className="w-full py-3 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] transition-all"
                  >
                    Upgrade to Business
                  </button>
                </div>
              </StaggerChildren>

              {/* Creator Feature Comparison Table */}
              <AnimateOnScroll className="mt-16">
                <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold text-neutral-900 text-center mb-8">
                  Compare Creator plans
                </h2>
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full max-w-4xl mx-auto text-sm min-w-[500px] sm:min-w-0">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 pr-4 font-medium text-neutral-500 w-1/3 sticky left-0 bg-white z-10 text-xs sm:text-sm">Feature</th>
                        <th className="text-center py-3 px-3 sm:px-4 font-medium text-neutral-500 text-xs sm:text-sm">Free</th>
                        <th className="text-center py-3 px-3 sm:px-4 font-medium text-neutral-900 text-xs sm:text-sm">Pro</th>
                        <th className="text-center py-3 px-3 sm:px-4 font-medium text-neutral-500 text-xs sm:text-sm">Business</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creatorComparisonFeatures.map((row) => (
                        <tr key={row.label} className="border-b border-neutral-100">
                          <td className="py-3 pr-4 text-neutral-700 text-xs sm:text-sm sticky left-0 bg-white z-10">{row.label}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex justify-center">
                              <ComparisonCell value={row.free} />
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center bg-neutral-50/50">
                            <span className="inline-flex justify-center">
                              <ComparisonCell value={row.pro} />
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex justify-center">
                              <ComparisonCell value={row.biz} />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AnimateOnScroll>
            </>
          )}

          {/* Brand Plans */}
          {tab === "brands" && (
            <>
              <StaggerChildren className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto" staggerMs={100}>
                {/* Brand Analytics */}
                <div className="aos-stagger-item border-2 border-neutral-900 rounded-2xl p-8 relative flex flex-col">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-neutral-900 text-white text-xs font-medium rounded-full">
                    Popular
                  </div>
                  <div className="text-sm font-medium text-neutral-900 uppercase tracking-wider mb-2">Brand Analytics</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display text-4xl font-bold text-neutral-900">
                      {formatPrice(199, annual)}
                    </span>
                    <span className="text-sm text-neutral-500">/mo</span>
                  </div>
                  {annual ? (
                    <div className="text-sm text-neutral-500 mb-6">
                      <span className="line-through text-neutral-400">$199/mo</span>
                      <span className="ml-1.5 text-green-700 font-medium">billed annually</span>
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-500 mb-6">Billed monthly</div>
                  )}
                  <p className="text-sm text-neutral-500 mb-6">
                    Find the right creators for your campaigns. Send offers, browse by niche, and pay securely through Stripe.
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "Search and discover creators",
                      "Send offers to any creator",
                      "Creator profiles with real follower data",
                      { text: "Secure payment via Stripe escrow", stripe: true },
                      "Browse marketplace by niche and platform",
                      "10% service fee on deals",
                    ].map((f) => {
                      const text = typeof f === "string" ? f : f.text;
                      const hasStripe = typeof f !== "string" && f.stripe;
                      return (
                        <li key={text} className="flex items-start gap-2.5 text-sm text-neutral-600">
                          <span className="mt-0.5"><CheckIcon /></span>
                          <span className="flex items-center gap-1.5">{text}{hasStripe && <StripeLogo className="ml-1" />}</span>
                        </li>
                      );
                    })}
                  </ul>
                  {annual && (
                    <p className="text-xs text-neutral-400 text-center mb-3">
                      Annual billing coming soon — you will not be charged annually. You will be billed monthly for now.
                    </p>
                  )}
                  <button
                    onClick={() => handleCheckout("brand_analytics")}
                    className="w-full py-3 text-sm font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98] transition-all"
                  >
                    Get Started
                  </button>
                </div>

                {/* Brand Enterprise */}
                <div className="aos-stagger-item border border-neutral-200 rounded-2xl p-8 flex flex-col">
                  <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Brand Enterprise</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display text-4xl font-bold text-neutral-900">
                      {formatPrice(999, annual)}
                    </span>
                    <span className="text-sm text-neutral-500">/mo</span>
                  </div>
                  {annual ? (
                    <div className="text-sm text-neutral-500 mb-6">
                      <span className="line-through text-neutral-400">$999/mo</span>
                      <span className="ml-1.5 text-green-700 font-medium">billed annually</span>
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-500 mb-6">Billed monthly</div>
                  )}
                  <p className="text-sm text-neutral-500 mb-6">
                    For brands running large-scale creator campaigns. Lower fees, unlimited offers, and priority support.
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "Everything in Brand Analytics",
                      "Reduced 5% service fee",
                      "Priority support",
                      "Unlimited offers to creators",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-600">
                        <span className="mt-0.5"><CheckIcon /></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="mailto:hello@hireacreator.ai"
                    className="block w-full py-3 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] transition-colors text-center"
                  >
                    Contact Sales
                  </a>
                </div>
              </StaggerChildren>

              {/* Brand Feature Comparison Table */}
              <AnimateOnScroll className="mt-16">
                <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold text-neutral-900 text-center mb-8">
                  Compare Brand plans
                </h2>
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full max-w-3xl mx-auto text-sm min-w-[400px] sm:min-w-0">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 pr-4 font-medium text-neutral-500 w-1/2 sticky left-0 bg-white z-10 text-xs sm:text-sm">Feature</th>
                        <th className="text-center py-3 px-3 sm:px-4 font-medium text-neutral-900 text-xs sm:text-sm">Analytics</th>
                        <th className="text-center py-3 px-3 sm:px-4 font-medium text-neutral-500 text-xs sm:text-sm">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brandComparisonFeatures.map((row) => (
                        <tr key={row.label} className="border-b border-neutral-100">
                          <td className="py-3 pr-4 text-neutral-700 text-xs sm:text-sm sticky left-0 bg-white z-10">{row.label}</td>
                          <td className="py-3 px-4 text-center bg-neutral-50/50">
                            <span className="inline-flex justify-center">
                              <ComparisonCell value={row.analytics} />
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex justify-center">
                              <ComparisonCell value={row.enterprise} />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AnimateOnScroll>
            </>
          )}

          {/* API Plans */}
          {tab === "api" && (
            <StaggerChildren className="grid sm:grid-cols-1 gap-6 max-w-lg mx-auto" staggerMs={100}>
              <div className="aos-stagger-item border-2 border-neutral-900 rounded-2xl p-8 flex flex-col">
                <div className="text-sm font-medium text-neutral-900 uppercase tracking-wider mb-2">API Pro</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-display text-4xl font-bold text-neutral-900">
                    {formatPrice(49, annual)}
                  </span>
                  <span className="text-sm text-neutral-500">/mo</span>
                </div>
                {annual ? (
                  <div className="text-sm text-neutral-500 mb-6">
                    <span className="line-through text-neutral-400">$49/mo</span>
                    <span className="ml-1.5 text-green-700 font-medium">billed annually</span>
                  </div>
                ) : (
                  <div className="text-sm text-neutral-500 mb-6">Billed monthly</div>
                )}
                <p className="text-sm text-neutral-500 mb-6">
                  Full API access for building integrations and AI agents on the HireACreator platform.
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Full REST API + MCP server access",
                    "1000 requests/minute",
                    "Creator search, profiles, bookings",
                    "Webhook notifications",
                    "Domain verification",
                    "SDK libraries",
                    "Documentation portal",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-600">
                      <span className="mt-0.5"><CheckIcon /></span>
                      {f}
                    </li>
                  ))}
                </ul>
                {annual && (
                  <p className="text-xs text-neutral-400 text-center mb-3">
                    Annual billing coming soon. You will be billed monthly for now.
                  </p>
                )}
                <button
                  onClick={() => handleCheckout("api_pro")}
                  className="w-full py-3 text-sm font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98] transition-all"
                >
                  Get API Access
                </button>
              </div>
            </StaggerChildren>
          )}

          {/* Add-ons */}
          <AnimateOnScroll className="mt-16">
            <div className="max-w-3xl mx-auto bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 rounded-3xl p-8">
              <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold text-neutral-900 text-center mb-8">
                Add-ons
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-8 text-center">
                  <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Boost</div>
                  <h3 className="font-display text-xl font-bold text-neutral-900 mb-2">Boosted Listing</h3>
                  <p className="text-neutral-500 text-sm mb-4">
                    Appear at the top of search results and the browse page. Available to all creators.
                  </p>
                  <div className="font-display text-2xl font-bold text-neutral-900 mb-4">$10<span className="text-base font-normal text-neutral-500">/week</span></div>
                  <button
                    onClick={() => handleCheckout("boosted")}
                    className="px-6 py-2.5 text-sm font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98] transition-all"
                  >
                    Boost Your Profile
                  </button>
                </div>

                <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-8 text-center">
                  <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Animation</div>
                  <h3 className="font-display text-xl font-bold text-neutral-900 mb-2">AI Intro Animation</h3>
                  <p className="text-neutral-500 text-sm mb-4">
                    Premium full-screen intro animations for your creator page. Buy only what you need.
                  </p>
                  <div className="font-display text-2xl font-bold text-neutral-900 mb-4">$4.99<span className="text-base font-normal text-neutral-500"> each</span></div>
                  <a
                    href="/animations"
                    className="inline-block px-6 py-2.5 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 active:scale-[0.98] transition-colors"
                  >
                    Browse Animations
                  </a>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* FAQ */}
          <AnimateOnScroll className="mt-20">
            <div className="max-w-2xl mx-auto">
              <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold text-neutral-900 text-center mb-10">
                Frequently asked questions
              </h2>
              <div className="space-y-0">
                {faqItems.map((faq, i) => (
                  <div key={faq.q} className={`py-6 ${i < faqItems.length - 1 ? "border-b border-neutral-100" : ""}`}>
                    <h3 className="font-medium text-neutral-900 mb-2">{faq.q}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
