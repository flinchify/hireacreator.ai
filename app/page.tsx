import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CreatorCard } from "@/components/creator-card";
import { Button } from "@/components/ui/button";
import { getFeaturedCreators, getCreatorCount } from "@/lib/queries";
import {
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
  TwitterIcon,
  LinkedInIcon,
  DribbbleIcon,
  TwitchIcon,
  SpotifyIcon,
} from "@/components/icons/platforms";

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-emerald-500 shrink-0">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CodeBlockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-brand-500 shrink-0">
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-amber-500 shrink-0">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getFeaturedCreators>> = [];
  let creatorCount = 0;
  try {
    [featured, creatorCount] = await Promise.all([
      getFeaturedCreators(),
      getCreatorCount(),
    ]);
  } catch {
    featured = [];
    creatorCount = 0;
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-100 via-white to-white" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 sm:pt-28 sm:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 text-balance">
              The creator marketplace built for the AI era
            </h1>
            <p className="mt-6 text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Find and book verified creators for UGC, video, photography, design, and strategy.
              Browse yourself, or let AI agents discover and book talent autonomously through our API.
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

      {/* What we do - concise */}
      <section className="border-y border-neutral-200 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-neutral-900 mb-2">
                Discover real talent
              </h3>
              <p className="text-neutral-600 leading-relaxed text-sm">
                Every creator on the platform is verified. Browse portfolios, check reviews from real clients, and book directly. No middlemen.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-neutral-900 mb-2">
                Pay with confidence
              </h3>
              <p className="text-neutral-600 leading-relaxed text-sm">
                Payments are held in escrow via Stripe and released on delivery. Full usage rights included. No surprises.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-neutral-900 mb-2">
                API-first platform
              </h3>
              <p className="text-neutral-600 leading-relaxed text-sm">
                Built for AI agents from day one. Discover creators, check availability, and place bookings programmatically via REST API or MCP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Creators */}
      {featured.length > 0 && (
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl font-bold text-neutral-900">
                  Featured Creators
                </h2>
                <p className="mt-2 text-neutral-600">
                  {creatorCount > 0
                    ? `${creatorCount} creator${creatorCount !== 1 ? "s" : ""} and growing.`
                    : "Our first creators are joining now."}
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
      )}

      {/* For Brands */}
      <section id="for-brands" className="bg-neutral-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
                For Brands
              </div>
              <h2 className="font-display text-3xl font-bold mb-6">
                Scale content without scaling headcount
              </h2>
              <p className="text-neutral-400 leading-relaxed mb-8">
                Stop wasting time on cold DMs and unreliable freelancers.
                Every creator here has a verified portfolio and real client reviews.
                Book directly, pay securely, get your deliverables.
              </p>
              <ul className="space-y-3">
                {[
                  "Verified creators with real portfolios and reviews",
                  "Secure escrow payments via Stripe",
                  "Full usage rights on every deliverable",
                  "Direct booking — no back-and-forth negotiation",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckIcon />
                    <span className="text-neutral-300">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/browse">
                  <Button size="lg" className="bg-white text-neutral-900 hover:bg-neutral-100">
                    Find a Creator
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
              <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-6">
                How it works
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-semibold shrink-0">1</div>
                  <div>
                    <div className="font-medium mb-1">Browse or search</div>
                    <div className="text-sm text-neutral-400">Filter by category, rate, rating, or platform. Every profile has real work samples.</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-semibold shrink-0">2</div>
                  <div>
                    <div className="font-medium mb-1">Book a service</div>
                    <div className="text-sm text-neutral-400">Pick a service, submit your brief, and pay. Funds are held until you approve the work.</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-semibold shrink-0">3</div>
                  <div>
                    <div className="font-medium mb-1">Get your content</div>
                    <div className="text-sm text-neutral-400">Receive deliverables on schedule. Approve, request revisions, or leave a review.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Creators / Link-in-bio */}
      <section id="for-creators" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-neutral-200" />
                <div>
                  <div className="font-semibold text-neutral-900">yourname</div>
                  <div className="text-sm text-neutral-500">hireacreator.ai/yourname</div>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="h-3 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-200 rounded w-1/2" />
              </div>
              <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">Platforms</div>
              <div className="flex gap-3 mb-6">
                <InstagramIcon size={18} className="text-neutral-400" />
                <TikTokIcon size={18} className="text-neutral-400" />
                <YouTubeIcon size={18} className="text-neutral-400" />
                <TwitterIcon size={18} className="text-neutral-400" />
                <LinkedInIcon size={18} className="text-neutral-400" />
                <DribbbleIcon size={18} className="text-neutral-400" />
                <TwitchIcon size={18} className="text-neutral-400" />
                <SpotifyIcon size={18} className="text-neutral-400" />
              </div>
              <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">Services</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-neutral-200">
                  <span className="text-sm text-neutral-700">UGC Video Package</span>
                  <span className="text-sm font-semibold text-neutral-900">$1,200</span>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-neutral-200">
                  <span className="text-sm text-neutral-700">Product Photography</span>
                  <span className="text-sm font-semibold text-neutral-900">$800</span>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
              For Creators
            </div>
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-6">
              Your profile is your new link-in-bio
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-8">
              Get a beautiful profile page that showcases your work, lists your services
              with clear pricing, and lets clients book you directly.
              Put it in your bio — it does more than a Linktree ever could.
            </p>
            <ul className="space-y-3">
              {[
                "Portfolio, services, and booking in one page",
                "Accept payments directly via Stripe",
                "Connect all your social platforms",
                "Set your own rates — we take 10%",
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

      {/* For AI Agents — the differentiator */}
      <section id="for-agents" className="bg-neutral-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
                For AI Agents
              </div>
              <h2 className="font-display text-3xl font-bold mb-6">
                The first creator marketplace with an API
              </h2>
              <p className="text-neutral-400 leading-relaxed mb-8">
                Your AI agent needs a content creator? It can find one, check availability,
                and place a booking — without a human in the loop.
                We built HireACreator API-first so autonomous agents can use it natively.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CodeBlockIcon />
                  <div>
                    <div className="font-medium text-white">MCP Server</div>
                    <div className="text-sm text-neutral-400">
                      Connect directly via Model Context Protocol. Claude, GPT, and other agents can discover and book creators in a single tool call.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <BoltIcon />
                  <div>
                    <div className="font-medium text-white">REST API</div>
                    <div className="text-sm text-neutral-400">
                      Full CRUD access to creator profiles, services, availability, and bookings. JSON responses, OAuth2 auth, rate-limited and documented.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <div className="font-medium text-white">Autonomous Booking</div>
                    <div className="text-sm text-neutral-400">
                      Agents can search by criteria, compare creators, and place bookings with payment — end to end, programmatically.
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
                <div className="w-3 h-3 rounded-full bg-neutral-700" />
                <div className="w-3 h-3 rounded-full bg-neutral-700" />
                <div className="w-3 h-3 rounded-full bg-neutral-700" />
                <span className="text-xs text-neutral-500 ml-2 font-mono">api.hireacreator.ai</span>
              </div>
              <div className="p-5 font-mono text-sm leading-relaxed">
                <div className="text-neutral-500">{"// Search for UGC creators"}</div>
                <div className="text-emerald-400">GET</div>
                <div className="text-neutral-300 mb-3">/v1/creators?category=ugc&min_rating=4.5</div>
                <div className="text-neutral-500">{"// Book a service"}</div>
                <div className="text-amber-400">POST</div>
                <div className="text-neutral-300 mb-3">/v1/bookings</div>
                <div className="text-neutral-500">{"// MCP tool call"}</div>
                <div className="text-brand-400">{"{"}</div>
                <div className="text-neutral-300 pl-4">{'"tool": "hire_creator",'}</div>
                <div className="text-neutral-300 pl-4">{'"input": {'}</div>
                <div className="text-neutral-300 pl-8">{'"category": "ugc",'}</div>
                <div className="text-neutral-300 pl-8">{'"budget": 1500'}</div>
                <div className="text-neutral-300 pl-4">{"}"}</div>
                <div className="text-brand-400">{"}"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-neutral-900 rounded-2xl px-8 py-16 sm:px-16 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            {creatorCount > 0
              ? "See who's on the platform"
              : "We're just getting started"}
          </h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
            {creatorCount > 0
              ? "Browse creator profiles, check out their work, and book your first project."
              : "Be one of the first creators on HireACreator and get featured to every brand that joins after you."}
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
