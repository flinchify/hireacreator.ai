import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works - HireACreator",
  description: "Learn how creators, businesses, and brands use HireACreator to connect, collaborate, and grow. Free link-in-bio, marketplace listings, and in-platform messaging.",
};

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-bold shrink-0">{num}</div>
      <div>
        <h3 className="font-bold text-neutral-900 text-lg">{title}</h3>
        <p className="text-sm text-neutral-500 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">

          <h1 className="text-4xl sm:text-5xl font-display font-bold text-neutral-900 text-center">How It Works</h1>
          <p className="text-center text-neutral-500 mt-4 max-w-xl mx-auto">
            Whether you are a creator, a local business, or a brand looking to hire — here is how HireACreator fits into your workflow.
          </p>

          {/* For Creators */}
          <section className="mt-16">
            <div className="inline-block px-3 py-1 bg-neutral-100 rounded-full text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-4">For Creators</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Build your brand. Get discovered. Get paid.</h2>
            <div className="space-y-6">
              <Step num="1" title="Create your free account" desc="Sign up in under 60 seconds. No credit card required. You get a free link-in-bio page, marketplace listing, and creator profile." />
              <Step num="2" title="Set up your link-in-bio" desc="Choose from 18+ templates. Add your socials, services, portfolio, and business links. Customize fonts, colors, backgrounds, and animations. Share your link anywhere." />
              <Step num="3" title="List your services" desc="Add what you offer with pricing. Brands can browse, book, and pay directly through the platform. You keep 100% — we charge 0% commission on creator earnings." />
              <Step num="4" title="Get booked and get paid" desc="Brands find you through our marketplace or your link-in-bio. Payments are held in escrow via Stripe until you deliver. No chasing invoices." />
            </div>
          </section>

          {/* For Businesses */}
          <section className="mt-20">
            <div className="inline-block px-3 py-1 bg-blue-50 rounded-full text-xs font-semibold text-blue-600 uppercase tracking-wider mb-4">For Businesses</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Your business deserves more than a Linktree.</h2>
            <p className="text-neutral-500 text-sm mb-6">
              Local businesses across Australia are using link-in-bio tools. HireACreator gives you that plus a professional marketplace presence, 
              Google Reviews integration, contact forms, and the ability to be discovered by creators and brands looking to hire services.
            </p>
            <div className="space-y-6">
              <Step num="1" title="Create a business profile" desc="Sign up as a business. Add your company name, logo, website, Google Reviews link, location, and a description of what you do." />
              <Step num="2" title="Get a professional link-in-bio" desc="Same powerful templates as creators — but tailored for business. Link to your website, booking page, Google Maps, social media, and more. Replace your Linktree." />
              <Step num="3" title="List your services" desc="Whether you are a marketing agency, photography studio, print shop, or consulting firm — list your services with pricing so clients can book directly." />
              <Step num="4" title="Get found by creators and brands" desc="Creators and agents can browse the marketplace, find your business, and enquire or book services directly through the platform." />
            </div>
            <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
              <h3 className="font-bold text-neutral-900 mb-2">Why businesses choose HireACreator over Linktree</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">&#10003;</span> Free marketplace listing (Linktree has no marketplace)</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">&#10003;</span> In-platform messaging and booking (not just links)</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">&#10003;</span> 18+ professionally designed templates (not 1 layout)</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">&#10003;</span> Built-in payments via Stripe (no third-party tools needed)</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">&#10003;</span> Custom fonts, animations, and video backgrounds for free</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">&#10003;</span> SEO-optimized profiles that rank on Google</li>
              </ul>
            </div>
          </section>

          {/* For Brands */}
          <section className="mt-20">
            <div className="inline-block px-3 py-1 bg-amber-50 rounded-full text-xs font-semibold text-amber-600 uppercase tracking-wider mb-4">For Brands</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Find and hire creators in minutes.</h2>
            <div className="space-y-6">
              <Step num="1" title="Browse the marketplace" desc="Explore creators by category, location, or price. View their portfolios, services, ratings, and availability." />
              <Step num="2" title="Message or book directly" desc="Use in-platform messaging to discuss your project, or book a service directly with secure Stripe payments." />
              <Step num="3" title="Payments held in escrow" desc="Your payment is held securely until the creator delivers. If there is an issue, our team reviews and resolves disputes." />
              <Step num="4" title="Leave a review" desc="After the project is complete, rate your experience. Reviews help other brands and keep the marketplace trustworthy." />
            </div>
          </section>

          {/* For AI Agents */}
          <section className="mt-20">
            <div className="inline-block px-3 py-1 bg-purple-50 rounded-full text-xs font-semibold text-purple-600 uppercase tracking-wider mb-4">For AI Agents</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Programmatic creator discovery and booking.</h2>
            <div className="space-y-6">
              <Step num="1" title="Get an API key" desc="Sign up for an agent account and generate API keys. Access our REST API and MCP server to search, filter, and book creators programmatically." />
              <Step num="2" title="Search and filter" desc="Query creators by category, location, price range, availability, and rating. Get structured data back for your workflows." />
              <Step num="3" title="Book via API" desc="Create bookings, manage payments, and track project status — all through the API. No manual steps required." />
            </div>
            <p className="text-sm text-neutral-500 mt-6">
              See the <Link href="/api" className="text-neutral-900 underline font-medium">API documentation</Link> for integration details.
            </p>
          </section>

          {/* CTA */}
          <section className="mt-20 text-center">
            <h2 className="text-2xl font-bold text-neutral-900">Ready to get started?</h2>
            <p className="text-neutral-500 mt-2 mb-6">It takes less than a minute. No credit card needed.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/" className="px-8 py-3 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-800 transition-colors">
                Create Free Account
              </Link>
              <Link href="/browse" className="px-8 py-3 bg-neutral-100 text-neutral-900 text-sm font-semibold rounded-full hover:bg-neutral-200 transition-colors">
                Browse Marketplace
              </Link>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
