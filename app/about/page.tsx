import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About HireACreator — The Creator Marketplace with 0% Fees",
  description: "HireACreator is the creator marketplace where brands book creators directly and creators keep 100% of their earnings. No middlemen. No commission. Built in Australia.",
  alternates: { canonical: "https://hireacreator.ai/about" },
  openGraph: {
    title: "About HireACreator — The Creator Marketplace with 0% Fees",
    description: "HireACreator is the creator marketplace where brands book creators directly and creators keep 100% of their earnings.",
    url: "https://hireacreator.ai/about",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-20">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
          The creator marketplace that puts creators first
        </h1>
        <p className="mt-6 text-lg text-neutral-600 leading-relaxed">
          HireACreator is a marketplace where brands discover, book, and pay creators directly — and creators keep 100% of what they earn. No commission. No hidden fees. No middlemen taking a cut of your work.
        </p>

        <div className="mt-16 space-y-14">
          {/* Mission */}
          <section>
            <h2 className="font-display text-2xl font-bold text-neutral-900">Why we built this</h2>
            <p className="mt-4 text-neutral-600 leading-relaxed">
              Every major creator platform takes a cut. Fiverr takes 20%. Upwork takes 10-20%. Even "creator-friendly" platforms quietly skim 10-15% of every transaction. We thought that was wrong.
            </p>
            <p className="mt-3 text-neutral-600 leading-relaxed">
              Creators do the work. Creators build the audience. Creators deliver the content. They should keep what they earn. So we built a marketplace where <strong>creators pay 0% commission — always</strong>. Brands pay a small service fee, not creators.
            </p>
          </section>

          {/* How it works */}
          <section>
            <h2 className="font-display text-2xl font-bold text-neutral-900">How HireACreator works</h2>
            <div className="mt-6 grid gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 font-display font-bold text-neutral-900">1</div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Creators build their profile</h3>
                  <p className="mt-1 text-sm text-neutral-500">Set up a portfolio, list services with your own pricing, connect social accounts, and get a shareable link-in-bio page.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 font-display font-bold text-neutral-900">2</div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Brands discover and book</h3>
                  <p className="mt-1 text-sm text-neutral-500">Search by category, niche, price range, or platform. Find the right creator and book their services directly — no DMs, no negotiations, no agencies.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 font-display font-bold text-neutral-900">3</div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Secure payment via Stripe</h3>
                  <p className="mt-1 text-sm text-neutral-500">Payments are held securely and released when the work is delivered. Creators get paid directly via Stripe Connect — no payout delays, no minimum thresholds.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Who it's for */}
          <section>
            <h2 className="font-display text-2xl font-bold text-neutral-900">Who it's for</h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100">
                <h3 className="font-semibold text-neutral-900">For Creators</h3>
                <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                  <li>UGC creators, videographers, photographers</li>
                  <li>Social media managers, editors, designers</li>
                  <li>TikTok, Instagram, YouTube, Kick creators</li>
                  <li>Anyone selling creative services online</li>
                </ul>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100">
                <h3 className="font-semibold text-neutral-900">For Brands</h3>
                <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                  <li>DTC brands needing UGC content</li>
                  <li>Agencies booking creators at scale</li>
                  <li>Startups hiring freelance creatives</li>
                  <li>AI agents automating creator discovery</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Differentiators */}
          <section>
            <h2 className="font-display text-2xl font-bold text-neutral-900">What makes us different</h2>
            <div className="mt-6 space-y-4">
              {[
                { title: "0% creator commission", desc: "Creators keep every dollar. Brands pay the service fee." },
                { title: "Direct booking", desc: "No middlemen, no agencies, no back-and-forth DMs. Book and pay in one flow." },
                { title: "Link-in-bio built in", desc: "Every creator gets a customizable link-in-bio page with 8 templates, video backgrounds, and portfolio showcases." },
                { title: "AI-agent API", desc: "Brands can integrate creator discovery into their AI workflows via MCP and REST API." },
                { title: "Stripe-powered payments", desc: "Instant payouts, payment protection, and transparent pricing via Stripe Connect." },
                { title: "Free tier that actually competes", desc: "Features that cost $15-35/month on Linktree and Fiverr are free on HireACreator." },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 shrink-0" />
                  <div>
                    <span className="font-semibold text-neutral-900">{item.title}</span>
                    <span className="text-neutral-500"> — {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Built in Australia */}
          <section>
            <h2 className="font-display text-2xl font-bold text-neutral-900">Built in Australia</h2>
            <p className="mt-4 text-neutral-600 leading-relaxed">
              HireACreator is an Australian-built platform serving creators and brands globally. We comply with Australian consumer law and ASIC regulations for payment processing.
            </p>
          </section>

          {/* CTA */}
          <section className="pt-4">
            <div className="p-8 rounded-2xl bg-neutral-900 text-center">
              <h2 className="font-display text-2xl font-bold text-white">Ready to get started?</h2>
              <p className="mt-2 text-neutral-400">Join HireACreator — it takes less than 60 seconds.</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link href="/" className="px-6 py-3 bg-white text-neutral-900 font-semibold text-sm rounded-full hover:bg-neutral-100 transition-colors">
                  Sign Up Free
                </Link>
                <Link href="/contact" className="px-6 py-3 border border-neutral-700 text-white font-semibold text-sm rounded-full hover:border-neutral-500 transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Organization Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "HireACreator",
        url: "https://hireacreator.ai",
        logo: "https://hireacreator.ai/logo-h-180.png",
        description: "The creator marketplace where brands book creators directly and creators keep 100% of their earnings.",
  alternates: { canonical: "https://hireacreator.ai/about" },
        foundingDate: "2026",
        sameAs: ["https://x.com/hireacreatorAI"],
        contactPoint: {
          "@type": "ContactPoint",
          email: "hello@hireacreator.ai",
          contactType: "customer support",
        },
      })}} />

      <Footer />
    </div>
  );
}
