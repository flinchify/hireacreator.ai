import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | HireACreator",
  description: "Tag @hireacreator on Instagram or X and we build your creator profile, score your brand deal potential, and match you with paying campaigns.",
  openGraph: {
    title: "How It Works | HireACreator",
    description: "Tag @hireacreator on Instagram or X and we build your creator profile, score your brand deal potential, and match you with paying campaigns.",
  },
};

function Step({ number, title, description, commands, badge }: { number: string; title: string; description: string; commands?: { cmd: string; result: string }[]; badge?: React.ReactNode }) {
  return (
    <div className="border border-neutral-200 rounded-2xl p-5 sm:p-8 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-5">
        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>
          <p className="text-neutral-600 leading-relaxed mb-4">{description}</p>
          {badge}
          {commands && (
            <div className="space-y-3">
              {commands.map((c) => (
                <div key={c.cmd} className="bg-neutral-50 rounded-xl p-4">
                  <div className="text-sm font-mono font-semibold text-neutral-900 mb-1">{c.cmd}</div>
                  <div className="text-sm text-neutral-500">{c.result}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 relative">
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0)_1px,transparent_0)] bg-[length:32px_32px]"></div>
        <div className="max-w-3xl mx-auto text-center relative">
          <h1 className="text-3xl sm:text-5xl font-bold text-neutral-900 mb-6" style={{ fontFamily: "var(--font-serif)" }}>
            How HireACreator Works
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Tag us on Instagram or X. Our AI analyzes your profile, builds your portfolio page, scores your brand deal potential, and connects you with paying campaigns. All automatic. All free.
          </p>
        </div>
      </section>

      {/* For Creators */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8" style={{ fontFamily: "var(--font-serif)" }}>
            For Creators
          </h2>

          <div className="space-y-6">
            <Step
              number="1"
              title="Tag @hireacreator on Instagram or X"
              description="Post a story, comment, or tweet and tag @hireacreator. You can also tag another creator you think deserves brand deals. Our bot detects the tag within seconds."
              commands={[
                { cmd: "@hireacreator", result: "We rate you and build your profile automatically" },
                { cmd: "@hireacreator @jessicafitness", result: "We rate and build a profile for @jessicafitness" },
              ]}
            />

            <Step
              number="2"
              title="We build your profile instantly"
              description="Our AI pulls your public profile data — name, avatar, bio, follower count, linked socials — and creates a complete portfolio page on hireacreator.ai. We also detect your niche and cross-reference your accounts across platforms."
            />

            <Step
              number="3"
              title="Get your creator rating"
              description="We rate you 0-100 based on your profile quality, reach, engagement, niche demand, content consistency, and platform. We also estimate what your posts are worth to brands. This rating is visible to every brand on the platform."
            />

            <Step
              number="4"
              title="Claim your profile"
              description="Visit the link in our reply to see your pre-built profile. Click 'Claim' to verify it is yours, customize your page, and appear in the creator marketplace. Only the real account owner can claim a profile."
            />

            <Step
              number="5"
              title="Get matched with brand deals"
              description="Once claimed, your profile is live in the marketplace. Brands post campaigns and our AI matches you based on your niche, rating, and audience size. Apply to campaigns, negotiate rates, and get paid through the platform."
            />
          </div>
        </div>
      </section>

      {/* Bot Commands */}
      <section className="py-24 px-6 bg-blue-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            Bot Commands
          </h2>
          <p className="text-neutral-600 mb-8">
            Tag @hireacreator on Instagram or @hireacreatorAI on X with these commands. The bot replies publicly in the comments so everyone can see.
          </p>

          <div className="space-y-4">
            {[
              {
                command: "@hireacreator",
                description: "Rate yourself. We analyze your profile and reply with your rating and a link to your page.",
                example: "Just tag us in any post, story, or tweet.",
              },
              {
                command: "@hireacreator @username",
                description: "Rate another creator. We build their profile and reply with their rating.",
                example: "Tag us alongside any creator you think brands should know about.",
              },
              {
                command: "@hireacreator who is @username",
                description: "Look up a creator. We reply with their full profile — all social accounts, follower counts, niche, and estimated rates.",
                example: "Works best for influencers and verified creators.",
              },
              {
                command: "@hireacreator make me a linkinbio",
                description: "We build you a free link-in-bio page with all your socials, bio, and portfolio — hosted on hireacreator.ai.",
                example: "Your page is live instantly. Claim it to customize.",
              },
              {
                command: "@hireacreator make @username a profile",
                description: "Build a profile for another creator. They get a pre-made page they can claim.",
                example: "Great for nominating creators you think deserve brand deals.",
              },
            ].map((item) => (
              <div key={item.command} className="bg-white border border-blue-100 rounded-2xl p-4 sm:p-6">
                <div className="font-mono text-sm font-semibold text-neutral-900 bg-neutral-50 inline-block px-3 py-1 rounded-lg mb-3">
                  {item.command}
                </div>
                <p className="text-neutral-700 mb-2">{item.description}</p>
                <p className="text-sm text-neutral-400">{item.example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Brands */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8" style={{ fontFamily: "var(--font-serif)" }}>
            For Brands
          </h2>

          <div className="space-y-6">
            <Step
              number="1"
              title="Browse rated creators"
              description="Every creator on the platform has a transparency rating, verified social accounts, and estimated rates. Filter by niche, platform, follower range, and rating to find the right fit."
            />
            <Step
              number="2"
              title="Post a campaign"
              description="Describe your campaign — budget, niche, platforms, number of creators needed, and deadline. Our AI matches you with creators who fit your brief."
            />
            <Step
              number="3"
              title="Review applications and hire"
              description="Creators apply to your campaign with a pitch. Review their profiles, ratings, and portfolio. Accept the ones you want to work with."
            />
            <Step
              number="4"
              title="Pay securely through the platform"
              description="All payments go through secure escrow. Funds are held securely until you review and approve the deliverables. Not satisfied? Request revisions or open a dispute before releasing payment. Creators receive their payout directly to their bank only after your approval."

            />
          </div>
        </div>
      </section>

      {/* Rating Breakdown */}
      <section className="py-24 px-6 bg-blue-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            How We Rate Creators
          </h2>
          <p className="text-neutral-600 mb-8">
            Every creator gets a rating from 0 to 100 based on six factors. This rating helps brands find the right creators and helps creators understand their market value.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Profile Quality", max: "15", desc: "Complete bio, professional avatar, external links" },
              { label: "Reach", max: "25", desc: "Total follower count across platforms" },
              { label: "Engagement", max: "20", desc: "Follower-to-following ratio, posting activity" },
              { label: "Niche Demand", max: "15", desc: "How much brands pay in your category" },
              { label: "Consistency", max: "15", desc: "How regularly you post content" },
              { label: "Platform Bonus", max: "10", desc: "Some platforms have higher brand deal demand" },
            ].map((item) => (
              <div key={item.label} className="bg-white border border-neutral-200 rounded-xl p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-neutral-900">{item.label}</span>
                  <span className="text-sm text-neutral-400">/{item.max} pts</span>
                </div>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment-to-Payment Flow */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4 text-center" style={{ fontFamily: "var(--font-serif)" }}>
            The Comment-to-Payment Flow
          </h2>
          <p className="text-neutral-600 text-center max-w-2xl mx-auto mb-16">
            From a single tag on Instagram or X to a completed brand deal. Here is the full journey.
          </p>

          {/* Timeline */}
          <div className="relative">
            {/* Desktop horizontal connector */}
            <div className="hidden lg:block absolute top-10 left-[4%] right-[4%] h-0.5 bg-blue-200" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-5">
              {[
                {
                  num: "1",
                  title: "Tag",
                  desc: "A brand comments @hireacreatorai @jessicafitness on Instagram — or tweets it on X.",
                  example: 'e.g. "@hireacreatorai @jessicafitness would be great for our summer campaign"',
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                  ),
                },
                {
                  num: "2",
                  title: "Profile Built",
                  desc: "Within 60 seconds, jessicafitness has a custom link-in-bio page with her avatar, bio, and 124K followers pulled from Instagram.",
                  example: "AI picks a fitness template, bold colors, and detects her niche automatically.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0112 0v1" /><path d="M16 3l2 2 4-4" /></svg>
                  ),
                },
                {
                  num: "3",
                  title: "Offer Sent",
                  desc: "The brand sends jessicafitness a $2,500 offer for 2 Instagram Reels through the platform.",
                  example: "Brief: 2 Reels + 1 Story featuring their protein powder. 7-day deadline.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4z" /></svg>
                  ),
                },
                {
                  num: "4",
                  title: "Creator Accepts",
                  desc: "Jessica gets notified, claims her pre-built profile, verifies her Instagram, and accepts the $2,500 offer.",
                  example: "One click to claim. One click to accept. Profile already looks great.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                  ),
                },
                {
                  num: "5",
                  title: "Brand Pays",
                  desc: "The brand pays $2,500 via Stripe. Funds are held in secure escrow — Jessica can see the money is locked in.",
                  example: "No one touches the money until the work is reviewed and approved.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  ),
                },
                {
                  num: "6",
                  title: "Creator Delivers",
                  desc: "Jessica films and uploads 2 Reels and 1 Story. She submits the deliverables through the platform.",
                  example: "All content is tracked. The brand gets notified instantly when it's ready.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  ),
                },
                {
                  num: "7",
                  title: "Brand Approves",
                  desc: "The brand watches Jessica's Reels, loves them, and clicks Approve. Or requests one small revision first.",
                  example: "Revisions are free. Payment only releases after the brand is happy.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 00-6 0v4" /><path d="M18.8 22H5.2A2.2 2.2 0 013 19.8v-5.6A2.2 2.2 0 015.2 12h13.6a2.2 2.2 0 012.2 2.2v5.6a2.2 2.2 0 01-2.2 2.2z" /><path d="M12 16v2" /></svg>
                  ),
                },
                {
                  num: "8",
                  title: "Creator Gets Paid",
                  desc: "Jessica receives $2,500 directly to her bank account. No commission, no hidden fees, no waiting.",
                  example: "From an Instagram comment to $2,500 in her bank. That's the whole flow.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                  ),
                },
              ].map((step) => (
                <div key={step.num} className="relative text-center">
                  {/* Step circle */}
                  <div className="relative z-10 w-20 h-20 rounded-full bg-blue-500 text-white flex flex-col items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                    <div className="text-white/90">{step.icon}</div>
                  </div>
                  {/* Mobile vertical connector */}
                  <div className="sm:hidden w-0.5 h-6 bg-blue-200 mx-auto my-1" />
                  <div className="mt-4">
                    <span className="inline-block text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full mb-2">Step {step.num}</span>
                    <h3 className="text-lg font-bold text-neutral-900">{step.title}</h3>
                    <p className="text-sm text-neutral-600 mt-1 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                    {step.example && (
                      <p className="text-xs text-neutral-400 mt-2 italic max-w-xs mx-auto">{step.example}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Example */}
          <div className="mt-20 rounded-2xl bg-gradient-to-br from-blue-50 via-blue-50/80 to-sky-50 border border-blue-100 p-6 sm:p-10 overflow-hidden">
            <h3 className="text-lg font-bold text-neutral-900 mb-8 text-center" style={{ fontFamily: "var(--font-serif)" }}>
              See it in action
            </h3>

            <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-0">
              {/* Mock Instagram Comment + X Tweet */}
              <div className="flex-1 w-full max-w-xs space-y-3">
                <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">brandco</div>
                      <div className="text-[10px] text-neutral-400">Instagram &middot; Just now</div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-700">
                    <span className="text-blue-500 font-medium">@hireacreatorai</span> check out <span className="text-blue-500 font-medium">@jessicafitness</span> for our campaign
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">@brandco</div>
                      <div className="text-[10px] text-neutral-400">X &middot; Just now</div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-700">
                    <span className="text-blue-500 font-medium">@hireacreatorAI</span> <span className="text-blue-500 font-medium">@jessicafitness</span> would be perfect for our campaign
                  </p>
                </div>
                <p className="text-[10px] text-neutral-400 text-center">Tag on Instagram or X — same result</p>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 text-blue-300 lg:px-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="rotate-90 lg:rotate-0"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>

              {/* Mock Profile Card */}
              <div className="flex-1 w-full max-w-xs">
                <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold">JF</div>
                  <div className="text-sm font-semibold text-neutral-900">Jessica Fitness</div>
                  <div className="text-xs text-neutral-500 mt-0.5">@jessicafitness</div>
                  <div className="flex justify-center gap-4 mt-3 text-[11px] text-neutral-500">
                    <span><strong className="text-neutral-800">124K</strong> followers</span>
                    <span><strong className="text-neutral-800">Fitness</strong> niche</span>
                  </div>
                  <div className="mt-3 inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">Score: 82/100</div>
                </div>
                <p className="text-[10px] text-neutral-400 text-center mt-2">Profile Auto-Built</p>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 text-blue-300 lg:px-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="rotate-90 lg:rotate-0"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>

              {/* Mock Offer */}
              <div className="flex-1 w-full max-w-xs">
                <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-blue-500"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>
                    <span className="text-sm font-semibold text-neutral-900">New Offer</span>
                  </div>
                  <div className="text-xs text-neutral-500 space-y-1">
                    <div>Brand: <span className="text-neutral-800 font-medium">BrandCo</span></div>
                    <div>Budget: <span className="text-neutral-800 font-medium">$2,500</span></div>
                    <div>Deliverables: <span className="text-neutral-800 font-medium">2 Reels + 1 Story</span></div>
                  </div>
                  <div className="mt-3 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-lg text-center">Funds in Escrow — Released on Approval</div>
                </div>
                <p className="text-[10px] text-neutral-400 text-center mt-2">Offer to Payment</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8" style={{ fontFamily: "var(--font-serif)" }}>
            Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: "Is it really free?", a: "Checking your rating and claiming your profile costs nothing. We take a small percentage of brand deals completed through the platform. Creators keep the rest." },
              { q: "What data do you collect?", a: "Only publicly available profile information — your name, bio, avatar, follower count, and linked accounts. We never access private messages, stories, or analytics." },
              { q: "Can someone else claim my profile?", a: "No. We verify ownership through email or social login before allowing a claim. Only the real account owner can claim and customize their profile." },
              { q: "What if my rating is low?", a: "Your rating updates as your profile grows. Improve it by completing your bio, posting consistently, and growing your audience. The rating is transparent — you can see exactly which areas to improve." },
              { q: "Which platforms are supported?", a: "Instagram, TikTok, X (Twitter), and YouTube. We detect cross-linked accounts automatically — one profile shows all your platforms." },
              { q: "How fast does the bot respond?", a: "Within seconds of detecting a tag. The reply appears as a public comment so everyone in the thread can see your rating and profile link." },
              { q: "Do I need to tag you to use the platform?", a: "No. You can also go directly to hireacreator.ai/claim and enter your handle to get rated and claim your profile without tagging." },
            ].map((faq) => (
              <details key={faq.q} className="group border border-neutral-100 rounded-xl">
                <summary className="px-4 sm:px-6 py-4 cursor-pointer font-medium text-neutral-900 flex justify-between items-center hover:bg-neutral-50 rounded-xl transition-colors min-h-[48px]">
                  {faq.q}
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                </summary>
                <div className="px-4 sm:px-6 pb-4 text-sm text-neutral-600 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            Ready to get started?
          </h2>
          <p className="text-blue-100 mb-8">
            Tag @hireacreator on Instagram or X. Or check your rating right now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/claim" className="px-8 py-3 min-h-[48px] flex items-center justify-center bg-white text-neutral-900 rounded-lg font-semibold text-sm hover:bg-neutral-100 transition-colors">
              Check Your Rating
            </a>
            <a href="/campaigns" className="px-8 py-3 min-h-[48px] flex items-center justify-center border border-white/20 text-white rounded-lg font-semibold text-sm hover:bg-white/10 transition-colors">
              Browse Campaigns
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
