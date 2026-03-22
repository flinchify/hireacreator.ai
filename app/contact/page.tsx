import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact HireACreator — Get in Touch",
  description: "Contact the HireACreator team. Reach out for support, partnerships, press inquiries, or enterprise solutions. We typically respond within 24 hours.",
  alternates: { canonical: "https://hireacreator.ai/contact" },
  openGraph: {
    title: "Contact HireACreator — Get in Touch",
    description: "Contact the HireACreator team for support, partnerships, or enterprise inquiries.",
    url: "https://hireacreator.ai/contact",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/30" />
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0)_1px,transparent_0)] bg-[length:32px_32px]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
            Get in touch
          </h1>
          <p className="text-lg text-neutral-600">
            Have a question, partnership idea, or need support? We'd love to hear from you.
          </p>
        </div>
      </section>
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">

        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          {/* General */}
          <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 shadow-md shadow-blue-500/5">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" /><polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h2 className="font-semibold text-neutral-900">General Support</h2>
            <p className="mt-1 text-sm text-neutral-500">Questions about the platform, your account, or getting started.</p>
            <a href="mailto:hello@hireacreator.ai" className="mt-3 inline-block text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors">
              hello@hireacreator.ai
            </a>
          </div>

          {/* Brands/Enterprise */}
          <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 shadow-md shadow-blue-500/5">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" strokeLinecap="round" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" strokeLinecap="round" /></svg>
            </div>
            <h2 className="font-semibold text-neutral-900">Brands &amp; Enterprise</h2>
            <p className="mt-1 text-sm text-neutral-500">Enterprise plans, bulk booking, custom API access, or agency partnerships.</p>
            <a href="mailto:brands@hireacreator.ai" className="mt-3 inline-block text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors">
              brands@hireacreator.ai
            </a>
          </div>

          {/* Press */}
          <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 shadow-md shadow-blue-500/5">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" /><polyline points="14 2 14 8 20 8" strokeLinecap="round" /></svg>
            </div>
            <h2 className="font-semibold text-neutral-900">Press &amp; Media</h2>
            <p className="mt-1 text-sm text-neutral-500">Media inquiries, interviews, or press kit requests.</p>
            <a href="mailto:press@hireacreator.ai" className="mt-3 inline-block text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors">
              press@hireacreator.ai
            </a>
          </div>

          {/* Socials */}
          <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 shadow-md shadow-blue-500/5">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </div>
            <h2 className="font-semibold text-neutral-900">Follow Us</h2>
            <p className="mt-1 text-sm text-neutral-500">Stay up to date with product updates and creator tips.</p>
            <a href="https://x.com/hireacreatorAI" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors">
              @hireacreatorAI on X
            </a>
          </div>
        </div>

        {/* Response time */}
        <div className="mt-10 p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 text-center">
          <p className="text-sm text-neutral-600">
            We typically respond within <strong>24 hours</strong> on business days.
          </p>
        </div>

        {/* FAQ quick links */}
        <div className="mt-12">
          <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-xl font-bold text-neutral-900 mb-4">Common questions</h2>
          <div className="space-y-3">
            {[
              { q: "How much does HireACreator cost for creators?", a: "Nothing. Creators pay 0% commission. Brands pay a small service fee on bookings." },
              { q: "How do I get paid?", a: "Via Stripe Connect. Set up takes 2 minutes and payouts are instant once work is delivered." },
              { q: "Can I use HireACreator as a link-in-bio?", a: "Yes. Every creator gets a free customizable link-in-bio page with 8 templates, video backgrounds, and portfolio showcases." },
              { q: "Do you have an API?", a: "Yes. We offer MCP and REST API access for brands and AI agents to search, filter, and book creators programmatically." },
            ].map((item, i) => (
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
      </main>

      {/* ContactPoint + FAQ Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact HireACreator",
        url: "https://hireacreator.ai/contact",
        mainEntity: {
          "@type": "Organization",
          name: "HireACreator",
          url: "https://hireacreator.ai",
          email: "hello@hireacreator.ai",
          contactPoint: [
            { "@type": "ContactPoint", email: "hello@hireacreator.ai", contactType: "customer support" },
            { "@type": "ContactPoint", email: "brands@hireacreator.ai", contactType: "sales" },
            { "@type": "ContactPoint", email: "press@hireacreator.ai", contactType: "press" },
          ],
        },
      })}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "How much does HireACreator cost for creators?", acceptedAnswer: { "@type": "Answer", text: "Nothing. Creators pay 0% commission. Brands pay a small service fee on bookings." } },
          { "@type": "Question", name: "How do I get paid on HireACreator?", acceptedAnswer: { "@type": "Answer", text: "Via Stripe Connect. Set up takes 2 minutes and payouts are instant once work is delivered." } },
          { "@type": "Question", name: "Can I use HireACreator as a link-in-bio?", acceptedAnswer: { "@type": "Answer", text: "Yes. Every creator gets a free customizable link-in-bio page with 8 templates, video backgrounds, and portfolio showcases." } },
          { "@type": "Question", name: "Does HireACreator have an API?", acceptedAnswer: { "@type": "Answer", text: "Yes. HireACreator offers MCP and REST API access for brands and AI agents to search, filter, and book creators programmatically." } },
        ],
      })}} />

      <Footer />
    </div>
  );
}
