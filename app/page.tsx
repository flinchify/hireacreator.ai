import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CreatorCard } from "@/components/creator-card";
import { Button } from "@/components/ui/button";
import { getFeaturedCreators } from "@/lib/data";

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-emerald-500 shrink-0">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

const stats = [
  { value: "10,000+", label: "Vetted Creators" },
  { value: "$25M+", label: "Creator Earnings" },
  { value: "4.9/5", label: "Avg. Rating" },
  { value: "98%", label: "Completion Rate" },
];

const howItWorks = [
  {
    step: "01",
    title: "Post Your Brief",
    description:
      "Describe your project, timeline, and budget. Our matching engine surfaces the best-fit creators instantly.",
  },
  {
    step: "02",
    title: "Review and Book",
    description:
      "Browse portfolios, read verified reviews, and book the creator that matches your vision. No back-and-forth.",
  },
  {
    step: "03",
    title: "Collaborate and Launch",
    description:
      "Work together through our platform with milestone payments, revision tracking, and usage rights built in.",
  },
];

const logos = [
  "Glossier", "Notion", "Vercel", "Linear", "Raycast", "Figma", "Stripe", "Airbnb",
];

export default function HomePage() {
  const featured = getFeaturedCreators();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-100 via-white to-white" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-sm text-neutral-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Trusted by 2,000+ brands worldwide
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 text-balance">
              Hire world-class creators for your next campaign
            </h1>
            <p className="mt-6 text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              The premium marketplace connecting brands with vetted creators for
              UGC, video production, photography, design, and strategy. From
              brief to delivery in days, not weeks.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/browse">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Creators
                  <ArrowRightIcon />
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Join as a Creator
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Logos */}
      <section className="border-y border-neutral-200 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-neutral-400 mb-8">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {logos.map((logo) => (
              <span
                key={logo}
                className="text-lg font-semibold text-neutral-300 hover:text-neutral-400 transition-colors"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold text-neutral-900">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-neutral-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Creators */}
      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-neutral-900">
                Featured Creators
              </h2>
              <p className="mt-2 text-neutral-600">
                Hand-picked talent, vetted for quality and reliability.
              </p>
            </div>
            <Link
              href="/browse"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors"
            >
              View all <ArrowRightIcon />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/browse">
              <Button variant="outline">View All Creators</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl font-bold text-neutral-900">
            How It Works
          </h2>
          <p className="mt-2 text-neutral-600">
            From brief to final delivery in three simple steps.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {howItWorks.map((item) => (
            <div key={item.step} className="relative">
              <div className="text-5xl font-display font-bold text-neutral-100 mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {item.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* For Brands */}
      <section id="for-brands" className="bg-neutral-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
                For Brands
              </div>
              <h2 className="font-display text-3xl font-bold mb-6">
                Scale your content production without scaling your team
              </h2>
              <p className="text-neutral-400 leading-relaxed mb-8">
                Access a curated network of creators who understand performance
                marketing. Every creator is vetted, reviewed, and rated by real
                clients. Pay only for what you need.
              </p>
              <ul className="space-y-3">
                {[
                  "Vetted creators with proven track records",
                  "Secure payments with milestone-based releases",
                  "Full usage rights included with every deliverable",
                  "Dedicated account manager for enterprise teams",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckIcon />
                    <span className="text-neutral-300">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-white text-neutral-900 hover:bg-neutral-100"
                  >
                    Start Hiring
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                  <span className="text-neutral-400">Avg. time to hire</span>
                  <span className="font-semibold">Under 24 hours</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                  <span className="text-neutral-400">Avg. project cost</span>
                  <span className="font-semibold">$1,200</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                  <span className="text-neutral-400">Client satisfaction</span>
                  <span className="font-semibold">98.4%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Repeat booking rate</span>
                  <span className="font-semibold">73%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Creators */}
      <section id="for-creators" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 bg-neutral-50 rounded-2xl p-8 border border-neutral-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <span className="text-neutral-500">Platform fee</span>
                <span className="font-semibold text-neutral-900">Only 10%</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <span className="text-neutral-500">Avg. creator earnings</span>
                <span className="font-semibold text-neutral-900">$4,800/mo</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <span className="text-neutral-500">Payout speed</span>
                <span className="font-semibold text-neutral-900">Next-day via Stripe</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Profile views per month</span>
                <span className="font-semibold text-neutral-900">2,400 avg.</span>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
              For Creators
            </div>
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-6">
              Turn your skills into a thriving business
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-8">
              Set your own rates, choose your clients, and get paid on time.
              Your profile doubles as a link-in-bio page that showcases your
              best work and drives direct bookings.
            </p>
            <ul className="space-y-3">
              {[
                "Beautiful, customizable profile page",
                "Built-in booking and payment system",
                "Client management dashboard",
                "Analytics to grow your audience",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-neutral-600">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/signup">
                <Button size="lg">
                  Create Your Profile
                  <ArrowRightIcon />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* For Agents / Talent Managers */}
      <section id="for-agents" className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
              For Talent Agents
            </div>
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-6">
              Manage your roster in one place
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-8">
              Onboard your creators, manage their profiles, handle inbound
              booking requests, and track earnings across your entire roster.
              Purpose-built tools for talent management at scale.
            </p>
            <Link href="/signup">
              <Button size="lg">
                Apply for Agent Access
                <ArrowRightIcon />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-neutral-900 rounded-2xl px-8 py-16 sm:px-16 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to work with the best creators?
          </h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
            Join thousands of brands and creators already using HireACreator to
            produce world-class content.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/browse">
              <Button
                size="lg"
                className="bg-white text-neutral-900 hover:bg-neutral-100 w-full sm:w-auto"
              >
                Browse Creators
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                size="lg"
                className="border-neutral-700 text-white hover:bg-neutral-800 w-full sm:w-auto"
              >
                Join as a Creator
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
