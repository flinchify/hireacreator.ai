"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-context";
import { AnimateOnScroll, StaggerChildren } from "@/components/animate-on-scroll";


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

async function handleCheckout(plan: string, openSignup?: (role?: string) => void) {
  const res = await fetch("/api/checkout/subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else if (data.error === "unauthorized" && openSignup) {
    const role = plan.startsWith("brand") ? "brand" : plan.startsWith("api") ? "agent" : "creator";
    openSignup(role);
  }
}

const tabLabels: Record<Tab, string> = {
  creators: "Creator Plans",
  brands: "Brand Plans",
  api: "API Plans",
};

const creatorComparisonFeatures = [
  { label: "AI-designed link-in-bio page", free: true, pro: true, biz: true },
  { label: "Premium templates", free: "18 + customization", pro: "All + custom CSS builder", biz: "All + custom CSS builder" },
  { label: "Receive brand offers", free: "Unlimited", pro: "Unlimited", biz: "Unlimited" },
  { label: "Services listed", free: "Up to 3", pro: "Unlimited", biz: "Unlimited" },
  { label: "Social links", free: "15+ platforms", pro: "15+ platforms", biz: "15+ platforms" },
  { label: "Bio links with click tracking", free: true, pro: true, biz: true },
  { label: "Calendar booking", free: "Free sessions", pro: "Free sessions", biz: "Paid sessions (Stripe)" },
  { label: "Intro animations", free: "2 included", pro: "All unlocked", biz: "All unlocked" },
  { label: "Analytics", free: "Basic", pro: "Advanced dashboard", biz: "Advanced dashboard" },
  { label: "QR code", free: true, pro: true, biz: true },
  { label: "AI bio writer + page designer", free: false, pro: true, biz: true },
  { label: "Reply templates", free: false, pro: true, biz: true },
  { label: "Boosted listing in search", free: false, pro: true, biz: "Priority" },
  { label: "Pro badge on profile", free: false, pro: true, biz: true },
  { label: "Remove branding", free: false, pro: true, biz: true },
  { label: "Logo and header image upload", free: false, pro: true, biz: true },
  { label: "Paid calendar sessions", free: false, pro: false, biz: true },
  { label: "Link products and courses", free: false, pro: false, biz: true },
  { label: "Earnings dashboard", free: false, pro: false, biz: true },
  { label: "Verification manager", free: false, pro: false, biz: true },
  { label: "Creator spotlights", free: false, pro: false, biz: true },
  { label: "Comment-to-payment flow", free: false, pro: false, biz: true },
  { label: "Community templates", free: false, pro: false, biz: true },
  { label: "Priority support", free: false, pro: true, biz: "Dedicated" },
  { label: "Commission on earnings", free: "0%", pro: "0%", biz: "0%" },
];

const brandComparisonFeatures = [
  { label: "Search and discover creators", free: true, pro: true, enterprise: true },
  { label: "Send offers via @mention or dashboard", free: true, pro: true, enterprise: true },
  { label: "Browse by niche and platform", free: true, pro: true, enterprise: true },
  { label: "Secure Stripe escrow payments", free: true, pro: true, enterprise: true },
  { label: "Creator profiles with follower data and scores", free: true, pro: true, enterprise: true },
  { label: "Comment-to-offer flow", free: true, pro: true, enterprise: true },
  { label: "Service fee on deals", free: "15%", pro: "10%", enterprise: "5%" },
  { label: "Creator shortlists", free: false, pro: true, enterprise: true },
  { label: "Offer templates", free: false, pro: true, enterprise: true },
  { label: "Brand profile page", free: false, pro: true, enterprise: true },
  { label: "Offer analytics", free: false, pro: true, enterprise: true },
  { label: "Verified Brand badge", free: false, pro: true, enterprise: true },
  { label: "Invoice management", free: false, pro: true, enterprise: true },
  { label: "Priority in creator inboxes", free: false, pro: false, enterprise: true },
  { label: "Bulk offer sends", free: false, pro: false, enterprise: true },
  { label: "Custom invoicing", free: false, pro: false, enterprise: true },
  { label: "API access", free: false, pro: false, enterprise: true },
  { label: "Priority support", free: false, pro: true, enterprise: "Dedicated account manager" },
];

const faqItems = [
  {
    q: "Do brands need a subscription to send offers?",
    a: "No. Brands can search creators, send offers, and pay securely — all for free. The only cost is a 15% service fee on completed deals. Subscriptions reduce that fee and unlock extras like offer analytics, creator shortlists, and verified badges.",
  },
  {
    q: "Do creators really pay 0% fees?",
    a: "Yes, always. Creators keep 100% of what they charge. We make money from brand service fees, subscriptions, and optional add-ons. We will never take a cut from creator earnings.",
  },
  {
    q: "What does the 15% service fee cover?",
    a: "The 15% is added on top of the creator's price and paid by the brand. It covers payment processing, payment protection, dispute resolution, and platform maintenance. Brand Pro reduces this to 10%, and Enterprise to 5%.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. All subscriptions are month-to-month with no contracts. Cancel anytime from your dashboard. You keep access until the end of your billing period.",
  },
  {
    q: "What's included in the free creator plan?",
    a: "Everything you need to get discovered: an AI-designed link-in-bio page auto-designed from your socials, 18 premium templates with full customization, up to 3 services, unlimited brand offers, comment-to-payment flow, 2 intro animations, social links, bio links with click tracking, free calendar booking sessions, basic analytics, a QR code, and 0% commission on all earnings.",
  },
  {
    q: "What's included in the free brand plan?",
    a: "Everything you need to find and hire creators: search and discovery, offers to any creator via @mention or dashboard, the comment-to-offer flow (mention creators on X or Instagram to auto-create offers), marketplace browsing by niche and platform, secure Stripe escrow payments, and creator profiles with real follower data and scores. The only cost is a 15% service fee on completed deals.",
  },
  {
    q: "What is the comment-to-payment flow?",
    a: "Brands can mention creators on X or Instagram, and our bot creates an offer automatically. The brand pays through their dashboard, the creator delivers, and funds are released. It turns social media comments into real paid collaborations.",
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
            <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-6xl font-bold text-neutral-900 tracking-tight mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-base sm:text-lg text-neutral-500 max-w-2xl mx-auto">
              Free to send and receive offers. Subscriptions unlock growth tools.
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
                <div className="aos-stagger-item border border-neutral-200 rounded-2xl p-6 sm:p-8 flex flex-col">
                  <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Free</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display text-4xl font-bold text-neutral-900">$0</span>
                  </div>
                  <div className="text-sm text-neutral-500 mb-6">No credit card required</div>
                  <p className="text-sm text-neutral-500 mb-6">
                    Get discovered by brands, receive offers, and start earning. No limits on opportunities.
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "AI-designed link-in-bio page (auto-designed from your socials)",
                      "18 premium templates + full customization",
                      "Receive unlimited brand offers",
                      "Up to 3 services listed",
                      "Social links (15+ platforms)",
                      "Bio links with click tracking",
                      "Free calendar booking sessions",
                      "2 intro animations included",
                      "Basic analytics",
                      "QR code for your page",
                      "0% commission — keep everything",
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
                <div className="aos-stagger-item relative rounded-2xl p-6 sm:p-8 flex flex-col bg-gradient-to-r from-blue-50 via-white to-blue-50 border-2 border-blue-200">
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
                    Grow faster. Get found first, look more professional, and convert more deals.
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "Everything in Free",
                      "Unlimited services",
                      "All templates + custom CSS builder",
                      "All intro animations unlocked",
                      "AI bio writer + AI page designer",
                      "Reply templates for brand inquiries",
                      "Boosted listing in search results",
                      "Advanced analytics dashboard",
                      "Pro badge on profile",
                      "Remove HireACreator branding",
                      "Logo and header image upload",
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
                    onClick={() => handleCheckout("creator_pro", openSignup)}
                    className="w-full py-3 text-sm font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98] transition-all"
                  >
                    Upgrade to Pro
                  </button>
                </div>

                {/* Creator Business */}
                <div className="aos-stagger-item border border-neutral-200 rounded-2xl p-6 sm:p-8 flex flex-col">
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
                    For creators building a real business. Sell time, products, and services from one page.
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "Everything in Pro",
                      "Paid calendar sessions (Stripe checkout)",
                      "Link your own products and courses",
                      "Earnings dashboard with payout tracking",
                      "Verification manager",
                      "Featured in weekly creator spotlights",
                      "Priority in all search results",
                      "Comment-to-payment flow (brands pay through social comments)",
                      "Community templates (share and use custom designs)",
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
                    onClick={() => handleCheckout("creator_biz", openSignup)}
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
              <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto" staggerMs={100}>
                {/* Brand Free */}
                <div className="aos-stagger-item border border-neutral-200 rounded-2xl p-6 sm:p-8 flex flex-col">
                  <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Free</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display text-4xl font-bold text-neutral-900">$0</span>
                  </div>
                  <div className="text-sm text-neutral-500 mb-6">No credit card required</div>
                  <p className="text-sm text-neutral-500 mb-6">
                    Find creators, send offers, and pay securely. No subscription needed.
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "Search and discover creators",
                      "Send offers to any creator via @mention or dashboard",
                      "Browse marketplace by niche and platform",
                      "Secure Stripe escrow payments",
                      "Creator profiles with real follower data and scores",
                      "Comment-to-offer flow (mention creators on X/Instagram)",
                      "15% service fee on completed deals",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-600">
                        <span className="mt-0.5"><CheckIcon /></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => openSignup("brand")}
                    className="w-full py-3 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] transition-all"
                  >
                    Get Started Free
                  </button>
                </div>

                {/* Brand Pro */}
                <div className="aos-stagger-item relative rounded-2xl p-6 sm:p-8 flex flex-col bg-gradient-to-r from-blue-50 via-white to-blue-50 border-2 border-blue-200">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-neutral-900 text-white text-xs font-medium rounded-full">
                    Popular
                  </div>
                  <div className="text-sm font-medium text-neutral-900 uppercase tracking-wider mb-2">Brand Pro</div>
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
                    For brands running regular creator campaigns. Lower fees and better tools.
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "Everything in Free",
                      "Reduced 10% service fee",
                      "Creator shortlists",
                      "Offer templates (reusable briefs)",
                      "Brand profile page",
                      "Offer analytics (views, response rate)",
                      "Verified Brand badge",
                      "Invoice management dashboard",
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
                    onClick={() => handleCheckout("brand_pro", openSignup)}
                    className="w-full py-3 text-sm font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98] transition-all"
                  >
                    Upgrade to Pro
                  </button>
                </div>

                {/* Brand Enterprise */}
                <div className="aos-stagger-item border border-neutral-200 rounded-2xl p-6 sm:p-8 flex flex-col">
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
                    For brands spending big on creators. Lowest fees, maximum reach.
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "Everything in Brand Pro",
                      "Reduced 5% service fee",
                      "Priority in creator inboxes",
                      "Bulk offer sends",
                      "Custom invoicing",
                      "API access included",
                      "Dedicated account manager",
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
                    onClick={() => handleCheckout("brand_enterprise", openSignup)}
                    className="w-full py-3 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] transition-all"
                  >
                    Upgrade to Enterprise
                  </button>
                </div>
              </StaggerChildren>

              {/* Brand Feature Comparison Table */}
              <AnimateOnScroll className="mt-16">
                <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold text-neutral-900 text-center mb-8">
                  Compare Brand plans
                </h2>
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full max-w-4xl mx-auto text-sm min-w-[500px] sm:min-w-0">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 pr-4 font-medium text-neutral-500 w-1/3 sticky left-0 bg-white z-10 text-xs sm:text-sm">Feature</th>
                        <th className="text-center py-3 px-3 sm:px-4 font-medium text-neutral-500 text-xs sm:text-sm">Free</th>
                        <th className="text-center py-3 px-3 sm:px-4 font-medium text-neutral-900 text-xs sm:text-sm">Pro</th>
                        <th className="text-center py-3 px-3 sm:px-4 font-medium text-neutral-500 text-xs sm:text-sm">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brandComparisonFeatures.map((row) => (
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
                  onClick={() => handleCheckout("api_pro", openSignup)}
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
                    onClick={() => handleCheckout("boosted", openSignup)}
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
