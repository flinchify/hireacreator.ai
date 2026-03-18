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
  { label: "Services listed", free: "Up to 3", pro: "Unlimited", biz: "Unlimited" },
  { label: "Premium templates", free: "8 templates", pro: "8 + custom builder", biz: "8 + custom builder" },
  { label: "Intro animations", free: "2 free", pro: "All 11 included", biz: "All 11 included" },
  { label: "Custom domain", free: false, pro: true, biz: true },
  { label: "Analytics", free: "Basic", pro: "Advanced", biz: "Advanced + revenue" },
  { label: "Remove branding", free: false, pro: true, biz: true },
  { label: "Priority search", free: false, pro: true, biz: true },
  { label: "Verified badge priority", free: false, pro: true, biz: true },
  { label: "SEO tools", free: false, pro: true, biz: true },
  { label: "Multi-page sites", free: false, pro: false, biz: "Up to 5 pages" },
  { label: "Team collaboration", free: false, pro: false, biz: true },
  { label: "White-label solution", free: false, pro: false, biz: true },
  { label: "API access", free: false, pro: false, biz: "1000 req/min" },
  { label: "Lead capture forms", free: false, pro: false, biz: true },
  { label: "Email marketing integration", free: false, pro: false, biz: true },
  { label: "Priority support", free: false, pro: true, biz: "Dedicated CSM" },
  { label: "Commission on earnings", free: "0%", pro: "0%", biz: "0%" },
];

const brandComparisonFeatures = [
  { label: "Search and discover creators", analytics: true, enterprise: true },
  { label: "Campaign management", analytics: true, enterprise: "Unlimited campaigns" },
  { label: "Creator analytics", analytics: true, enterprise: true },
  { label: "Bulk outreach tools", analytics: true, enterprise: true },
  { label: "ROI tracking", analytics: true, enterprise: true },
  { label: "Contract management", analytics: true, enterprise: true },
  { label: "Service fee on bookings", analytics: "10%", enterprise: "5%" },
  { label: "Dedicated account manager", analytics: false, enterprise: true },
  { label: "Custom integrations", analytics: false, enterprise: true },
  { label: "SLA guarantees", analytics: false, enterprise: true },
  { label: "API access", analytics: false, enterprise: "5000 req/min" },
  { label: "White-label marketplace", analytics: false, enterprise: true },
];

const faqItems = [
  {
    q: "Do creators really pay 0% fees?",
    a: "Yes, always. Creators keep 100% of what they charge. We make money from brand service fees, subscriptions, and optional add-ons. We will never take a cut from creator earnings.",
  },
  {
    q: "What does the 10% service fee cover?",
    a: "The 10% is added on top of the creator's price and paid by the brand. It covers payment processing, escrow protection, dispute resolution, and platform maintenance.",
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
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              Free for creators. Always. Brands and agents pay only for premium features.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex gap-1 p-1 bg-neutral-100 rounded-full">
              {(["creators", "brands", "api"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all ${
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
                  <div className="text-sm text-neutral-500 mb-6">Free forever</div>
                  <p className="text-sm text-neutral-500 mb-6">
                    Everything you need to launch your creator page and start getting booked.
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "Link-in-bio page with 8 premium templates",
                      "Up to 3 services listed",
                      "Custom fonts, colors, button shapes",
                      "2 free intro animations (Fade Up, Scale In)",
                      "Social links integration (15+ platforms)",
                      "Bio links with click tracking",
                      "Calendar booking (free sessions only)",
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
                    className="w-full py-3 text-sm font-medium rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Get Started Free
                  </button>
                </div>

                {/* Creator Pro */}
                <div className="aos-stagger-item border-2 border-neutral-900 rounded-2xl p-8 relative flex flex-col">
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
                    For creators ready to scale, stand out, and take control of their brand.
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "Everything in Free",
                      "Unlimited services",
                      "All 8 premium templates + custom template builder",
                      "Priority in marketplace search",
                      "Advanced analytics (traffic, heatmaps, demographics)",
                      "Custom domain support (yourname.com)",
                      "Verified badge priority",
                      "9 premium intro animations included",
                      "Boosted visibility in browse",
                      "Remove HireACreator branding",
                      "Priority support",
                      "SEO optimization tools",
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
                    onClick={() => handleCheckout("creator_pro")}
                    className="w-full py-3 text-sm font-medium rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
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
                    For agencies and creator teams who need collaboration and white-label tools.
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "Everything in Pro",
                      "Multi-page sites (up to 5 pages)",
                      "Team collaboration (invite editors)",
                      "White-label solution",
                      "API access (1000 req/min)",
                      "Custom embed widgets",
                      "Lead capture forms",
                      "Email marketing integration",
                      "Revenue dashboard",
                      "Priority customer success manager",
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
                    onClick={() => handleCheckout("creator_biz")}
                    className="w-full py-3 text-sm font-medium rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Upgrade to Business
                  </button>
                </div>
              </StaggerChildren>

              {/* Creator Feature Comparison Table */}
              <AnimateOnScroll className="mt-16">
                <h2 className="font-display text-2xl font-bold text-neutral-900 text-center mb-8">
                  Compare Creator plans
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full max-w-4xl mx-auto text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 pr-4 font-medium text-neutral-500 w-1/3">Feature</th>
                        <th className="text-center py-3 px-4 font-medium text-neutral-500">Free</th>
                        <th className="text-center py-3 px-4 font-medium text-neutral-900">Pro</th>
                        <th className="text-center py-3 px-4 font-medium text-neutral-500">Business</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creatorComparisonFeatures.map((row) => (
                        <tr key={row.label} className="border-b border-neutral-100">
                          <td className="py-3 pr-4 text-neutral-700">{row.label}</td>
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
                    Data-driven creator marketing for brands ready to scale their campaigns.
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "Search and discover creators",
                      "Campaign management dashboard",
                      "Creator analytics and audience data",
                      "Bulk outreach tools",
                      "ROI tracking",
                      "Contract management",
                      "10% service fee on bookings",
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
                    onClick={() => handleCheckout("brand_analytics")}
                    className="w-full py-3 text-sm font-medium rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
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
                    For brands spending $20K+ per month on creators. Halved service fees pay for themselves.
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "Everything in Brand Analytics",
                      "Dedicated account manager",
                      "Custom integrations",
                      "SLA guarantees",
                      "Reduced 5% service fee",
                      "Unlimited campaigns",
                      "API access (5000 req/min)",
                      "White-label marketplace",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-600">
                        <span className="mt-0.5"><CheckIcon /></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="mailto:hello@hireacreator.ai"
                    className="block w-full py-3 text-sm font-medium rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors text-center"
                  >
                    Contact Sales
                  </a>
                </div>
              </StaggerChildren>

              {/* Brand Feature Comparison Table */}
              <AnimateOnScroll className="mt-16">
                <h2 className="font-display text-2xl font-bold text-neutral-900 text-center mb-8">
                  Compare Brand plans
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full max-w-3xl mx-auto text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 pr-4 font-medium text-neutral-500 w-1/2">Feature</th>
                        <th className="text-center py-3 px-4 font-medium text-neutral-900">Analytics</th>
                        <th className="text-center py-3 px-4 font-medium text-neutral-500">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brandComparisonFeatures.map((row) => (
                        <tr key={row.label} className="border-b border-neutral-100">
                          <td className="py-3 pr-4 text-neutral-700">{row.label}</td>
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
                  className="w-full py-3 text-sm font-medium rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  Get API Access
                </button>
              </div>
            </StaggerChildren>
          )}

          {/* Add-ons */}
          <AnimateOnScroll className="mt-16">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-2xl font-bold text-neutral-900 text-center mb-8">
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
                    className="px-6 py-2.5 text-sm font-medium rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
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
                    className="inline-block px-6 py-2.5 text-sm font-medium rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors"
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
              <h2 className="font-display text-2xl font-bold text-neutral-900 text-center mb-10">
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
