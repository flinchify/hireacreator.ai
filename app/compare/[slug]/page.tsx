import Link from "next/link";
import type { Metadata } from "next";

type ComparisonData = {
  competitor: string;
  title: string;
  desc: string;
  heroLine: string;
  subLine: string;
  rows: { feature: string; us: string; them: string }[];
  sections: { heading: string; body: string }[];
  faq: { q: string; a: string }[];
  verdict: string;
};

const DATA: Record<string, ComparisonData> = {
  "fiverr": {
    competitor: "Fiverr",
    title: "HireACreator vs Fiverr — 0% Creator Fees vs 20%",
    desc: "Compare HireACreator and Fiverr. See why creators are switching to a marketplace that takes 0% commission instead of Fiverr's 20% cut.",
    heroLine: "Why creators are leaving Fiverr for HireACreator",
    subLine: "Fiverr takes 20% of every gig. HireACreator takes 0%. Here's the full comparison.",
    rows: [
      { feature: "Creator commission", us: "0% — always free", them: "20% on every order" },
      { feature: "Buyer service fee", us: "15% brand fee", them: "5.5% + $2.50 processing" },
      { feature: "Link-in-bio page", us: "8 templates, free", them: "Not available" },
      { feature: "Video portfolio", us: "Auto-play on hover", them: "Basic gig gallery" },
      { feature: "Custom domain", us: "Pro plan ($19/mo)", them: "Not available" },
      { feature: "Direct booking", us: "One-click booking", them: "Message-first, then order" },
      { feature: "Payout speed", us: "Instant via Stripe", them: "14-day clearance" },
      { feature: "AI agent API", us: "MCP + REST API", them: "Not available" },
      { feature: "Portfolio showcase", us: "Unlimited, multimedia", them: "3 images per gig" },
      { feature: "Analytics", us: "Free (basic), Pro (advanced)", them: "Seller Plus $29/mo" },
    ],
    sections: [
      { heading: "Fiverr's 20% commission adds up fast", body: "If you earn $5,000/month on Fiverr, you lose $1,000 to platform fees. That's $12,000/year gone. On HireACreator, you keep every dollar. We charge brands a 15% service fee instead — creators never pay." },
      { heading: "A portfolio that actually shows your work", body: "Fiverr limits you to a gig page with 3 images and a description. HireACreator gives you a full profile with video portfolio, link-in-bio page, service menu, social connections, and portfolio showcase — all customizable with 8 templates." },
      { heading: "Get paid faster", body: "Fiverr holds your money for 14 days after delivery. HireACreator uses Stripe Connect for instant payouts with no minimum threshold. Your money, when you want it." },
      { heading: "Built for the AI era", body: "HireACreator's API lets AI agents search, filter, and book creators programmatically. No other creator marketplace offers MCP and REST API access for automated workflows." },
    ],
    faq: [
      { q: "Can I use both Fiverr and HireACreator?", a: "Absolutely. Many creators list on both platforms while they transition. Since HireACreator is free, there's no risk — just add your profile and start getting bookings." },
      { q: "Do I need to cancel Fiverr to join?", a: "No. HireACreator is a separate marketplace. Keep your Fiverr gigs active and use HireACreator as an additional channel with better commission rates." },
      { q: "Is HireACreator legit?", a: "Yes. Payments are processed through Stripe, the same payment processor used by Shopify, Amazon, and thousands of other platforms. All transactions are secure and PCI-compliant." },
    ],
    verdict: "If you're tired of losing 20% of your earnings to Fiverr, HireACreator is the obvious switch. Same concept — brands find and book creators — but creators keep 100% of what they earn.",
  },
  "upwork": {
    competitor: "Upwork",
    title: "HireACreator vs Upwork — Built for Creators, Not Freelancers",
    desc: "Compare HireACreator and Upwork for creative work. 0% fees for creators vs Upwork's sliding 10-20% commission.",
    heroLine: "A creator marketplace, not a generic freelance board",
    subLine: "Upwork charges 10-20% and buries creators in proposal spam. HireACreator is purpose-built for creative professionals.",
    rows: [
      { feature: "Creator commission", us: "0% — always free", them: "20% (first $500), 10% (500-10K), 5% (10K+)" },
      { feature: "Booking flow", us: "Direct booking", them: "Proposals → interviews → contracts" },
      { feature: "Link-in-bio", us: "8 templates, free", them: "Not available" },
      { feature: "Profile customization", us: "Full portfolio, video, socials", them: "Basic text profile" },
      { feature: "Payout", us: "Instant via Stripe", them: "5-7 days minimum" },
      { feature: "Target audience", us: "Creators + brands", them: "All freelancers + all clients" },
      { feature: "AI agent API", us: "MCP + REST", them: "Not available" },
      { feature: "Platform fee model", us: "Brands pay 15%", them: "Freelancer pays 10-20%" },
    ],
    sections: [
      { heading: "Upwork wasn't built for creators", body: "Upwork is a generic freelance marketplace. Your UGC portfolio sits next to data entry gigs and virtual assistant listings. HireACreator is purpose-built for creative professionals — every feature is designed for showcasing visual work and getting booked by brands." },
      { heading: "No more proposal grinding", body: "On Upwork, you write proposals, wait for responses, do interviews, negotiate contracts. On HireACreator, brands browse your portfolio and book directly. One click, payment handled, work begins." },
      { heading: "Keep what you earn", body: "Upwork's sliding scale means you pay 20% on your first $500 with each client. For creators doing multiple small projects with different brands, that 20% never goes away. HireACreator charges 0% to creators — period." },
    ],
    faq: [
      { q: "Is HireACreator only for UGC creators?", a: "No. Any creative professional can join — videographers, photographers, designers, social media managers, editors, and more. If you sell creative services, HireACreator is for you." },
      { q: "Can brands post job listings?", a: "Not yet in the traditional sense, but brands can browse creators by category and book services directly. We're building more brand-side tools soon." },
    ],
    verdict: "If you're a creative professional tired of writing proposals and paying 20% on Upwork, HireACreator gives you a visual portfolio, direct bookings, and 0% commission.",
  },
  "linktree": {
    competitor: "Linktree",
    title: "HireACreator vs Linktree — Link-in-Bio That Actually Makes Money",
    desc: "Compare HireACreator and Linktree. Get everything Linktree Pro offers for free, plus a full creator marketplace with booking and payments.",
    heroLine: "Your link-in-bio should make you money, not just list your links",
    subLine: "Linktree charges $8-44/month for features HireACreator gives you free — plus we add a marketplace, bookings, and payments on top.",
    rows: [
      { feature: "Free plan links", us: "Unlimited", them: "Unlimited" },
      { feature: "Custom themes", us: "Free (8 templates)", them: "$8/mo (Pro)" },
      { feature: "Video backgrounds", us: "Free", them: "$24/mo (Premium)" },
      { feature: "Custom domain", us: "Pro $19/mo", them: "$8/mo (Pro)" },
      { feature: "Analytics", us: "Free (basic)", them: "$8/mo (Pro)" },
      { feature: "Service booking", us: "Built-in", them: "Not available" },
      { feature: "Payment collection", us: "Built-in (Stripe)", them: "Commerce add-on" },
      { feature: "Creator marketplace", us: "Built-in", them: "Not available" },
      { feature: "Portfolio showcase", us: "Video + images", them: "Basic embeds" },
      { feature: "AI agent discovery", us: "MCP + REST API", them: "Not available" },
      { feature: "Brand bookings", us: "Direct booking flow", them: "Not available" },
    ],
    sections: [
      { heading: "Linktree is a link page. HireACreator is a business.", body: "Linktree lists your links. That's it. HireACreator gives you a link-in-bio page PLUS a service menu, portfolio showcase, booking system, payment processing, and marketplace visibility. Your link-in-bio becomes a storefront." },
      { heading: "Stop paying for basic features", body: "Linktree charges $8/mo for custom themes, $15/mo for analytics, $24/mo for priority support. On HireACreator, you get 8 customizable templates, video backgrounds, button styling, and basic analytics — all free." },
      { heading: "Get discovered by brands", body: "Linktree doesn't have a marketplace. Your page exists in isolation. On HireACreator, your profile is listed in a searchable marketplace where brands actively looking for creators can find and book you." },
    ],
    faq: [
      { q: "Can I replace Linktree with HireACreator?", a: "Yes. Your HireACreator link-in-bio page at hireacreator.ai/u/yourname works exactly like a Linktree — put it in your Instagram, TikTok, or Twitter bio. But it also includes services, portfolio, and booking capabilities." },
      { q: "Does HireACreator work in Instagram/TikTok bios?", a: "Absolutely. Your link-in-bio URL works in any bio field on any platform." },
      { q: "What if I just want the link-in-bio and not the marketplace?", a: "That's fine. Sign up, customize your page, and use it as your link-in-bio. The marketplace is optional — your profile only appears in search if you enable it in your privacy settings." },
    ],
    verdict: "If you're paying for Linktree Pro just to customize your link page, you're overpaying. HireACreator gives you better templates, plus a marketplace, bookings, and payments — for free.",
  },
};

const SLUGS = Object.keys(DATA);

export function generateStaticParams() {
  return SLUGS.map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const d = DATA[params.slug];
  if (!d) return {};
  return {
    title: d.title,
    description: d.desc,
    openGraph: { title: d.title, description: d.desc, url: `https://hireacreator.ai/compare/${params.slug}` },
  };
}

export default function ComparePage({ params }: { params: { slug: string } }) {
  const d = DATA[params.slug];
  if (!d) return <div className="pt-32 text-center">Not found</div>;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 relative min-h-screen">
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0)_1px,transparent_0)] bg-[length:32px_32px]"></div>
      <div className="relative">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs text-neutral-400">
          <Link href="/" className="hover:text-neutral-600">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/compare" className="hover:text-neutral-600">Compare</Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-600">vs {d.competitor}</span>
        </nav>

        <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight leading-tight">
          {d.heroLine}
        </h1>
      <p className="mt-4 text-lg text-neutral-500">{d.subLine}</p>

      {/* Comparison table */}
      <div className="mt-12 overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="py-3 pr-4 text-left font-semibold text-neutral-900 w-[40%]">Feature</th>
              <th className="py-3 px-4 text-left font-semibold text-neutral-900">HireACreator</th>
              <th className="py-3 pl-4 text-left font-semibold text-neutral-400">{d.competitor}</th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r, i) => (
              <tr key={i} className="border-b border-neutral-100">
                <td className="py-3.5 pr-4 text-neutral-600">{r.feature}</td>
                <td className="py-3.5 px-4 font-medium text-neutral-900">{r.us}</td>
                <td className="py-3.5 pl-4 text-neutral-400">{r.them}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail sections */}
      <div className="mt-16 space-y-12">
        {d.sections.map((s, i) => (
          <section key={i}>
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold text-neutral-900">{s.heading}</h2>
            <p className="mt-3 text-neutral-600 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>

      {/* Verdict */}
      <div className="mt-14 p-6 rounded-2xl bg-neutral-50 border border-neutral-200">
        <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-xl font-bold text-neutral-900 mb-2">The verdict</h2>
        <p className="text-neutral-600 leading-relaxed">{d.verdict}</p>
      </div>

      {/* FAQ */}
      <div className="mt-14">
        <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold text-neutral-900 mb-6">Frequently asked questions</h2>
        <div className="space-y-3">
          {d.faq.map((item, i) => (
            <details key={i} className="group p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors">
              <summary className="text-sm font-semibold text-neutral-900 cursor-pointer list-none flex items-center justify-between">
                {item.q}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 ml-2 text-neutral-400 group-open:rotate-180 transition-transform"><polyline points="6 9 12 15 18 9" /></svg>
              </summary>
              <p className="mt-2 text-sm text-neutral-500">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-14 text-center">
        <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold text-neutral-900 mb-3">Ready to switch?</h2>
        <p className="text-neutral-500 mb-6">Join HireACreator for free — no credit card required.</p>
        <Link href="/" className="inline-block px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors">
          Get Started Free
        </Link>
      </div>

        <p className="text-xs text-neutral-400 text-center max-w-2xl mx-auto mt-12 px-4">
          Fiverr is a registered trademark of Fiverr International Ltd. Upwork is a registered trademark of Upwork Inc. Linktree is a registered trademark of Linktree Pty Ltd. HireACreator is not affiliated with, endorsed by, or sponsored by any of these companies. Comparisons are based on publicly available information as of March 2026.
        </p>
      </div>

      {/* Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: d.title,
        description: d.desc,
        url: `https://hireacreator.ai/compare/${params.slug}`,
        author: { "@type": "Organization", name: "HireACreator" },
        publisher: { "@type": "Organization", name: "HireACreator", url: "https://hireacreator.ai" },
      })}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: d.faq.map(f => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      })}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://hireacreator.ai" },
          { "@type": "ListItem", position: 2, name: "Compare", item: "https://hireacreator.ai/compare" },
          { "@type": "ListItem", position: 3, name: `vs ${d.competitor}`, item: `https://hireacreator.ai/compare/${params.slug}` },
        ],
      })}} />
    </main>
  );
}
