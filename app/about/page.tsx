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
      
      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/30" />
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0)_1px,transparent_0)] bg-[length:32px_32px]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
            The creator marketplace that puts creators first
          </h1>
          <p className="text-lg text-neutral-600 leading-relaxed">
            HireACreator is a marketplace where brands discover, book, and pay creators directly — and creators keep 100% of what they earn. No commission. No hidden fees. No middlemen taking a cut of your work.
          </p>
        </div>
      </section>
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">

        <div className="mt-16 space-y-14">
          {/* Mission */}
          <section>
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold text-neutral-900">Why we built this</h2>
            <p className="mt-4 text-neutral-600 leading-relaxed">
              Every major creator platform takes a cut. Fiverr takes 20%. Upwork takes 10-20%. Even "creator-friendly" platforms quietly skim 10-15% of every transaction. We thought that was wrong.
            </p>
            <p className="mt-3 text-neutral-600 leading-relaxed">
              Creators do the work. Creators build the audience. Creators deliver the content. They should keep what they earn. So we built a marketplace where <strong>creators pay 0% commission — always</strong>. Brands pay a small service fee, not creators.
            </p>
          </section>

          {/* Who it's for */}
          <section>
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold text-neutral-900">Who it's for</h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 shadow-md shadow-blue-500/5">
                <h3 className="font-semibold text-neutral-900">For Creators</h3>
                <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                  <li>UGC creators, videographers, photographers</li>
                  <li>Social media managers, editors, designers</li>
                  <li>TikTok, Instagram, YouTube, Kick creators</li>
                  <li>Anyone selling creative services online</li>
                </ul>
              </div>
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 shadow-md shadow-blue-500/5">
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

          {/* Built in Australia */}
          <section>
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold text-neutral-900">Built in Australia</h2>
            <p className="mt-4 text-neutral-600 leading-relaxed">
              HireACreator is an Australian-built platform serving creators and brands globally. We comply with Australian consumer law and ASIC regulations for payment processing.
            </p>
          </section>

          {/* CTA */}
          <section className="pt-4">
            <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-center shadow-md shadow-blue-500/5">
              <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold text-white">Ready to get started?</h2>
              <p className="mt-2 text-neutral-400">Join HireACreator — it takes less than 60 seconds.</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link href="/" className="px-6 py-3 bg-white text-neutral-900 font-semibold text-sm rounded-lg hover:bg-neutral-100 transition-colors">
                  Sign Up Free
                </Link>
                <Link href="/contact" className="px-6 py-3 border border-white/20 text-white font-semibold text-sm rounded-lg hover:border-white/30 transition-colors">
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
