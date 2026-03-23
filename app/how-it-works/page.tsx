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

function Step({ number, title, description, commands }: { number: string; title: string; description: string; commands?: { cmd: string; result: string }[] }) {
  return (
    <div className="border border-neutral-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-5">
        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>
          <p className="text-neutral-600 leading-relaxed mb-4">{description}</p>
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
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-6" style={{ fontFamily: "var(--font-serif)" }}>
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
              <div key={item.command} className="bg-white border border-blue-100 rounded-2xl p-6">
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
              description="All payments go through Stripe escrow. Pay only when you are satisfied with the deliverables. Creators receive their payout directly to their bank."
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
            From a single Instagram comment to a completed brand deal. Here is the full journey.
          </p>

          {/* Timeline */}
          <div className="relative">
            {/* Desktop horizontal connector */}
            <div className="hidden lg:block absolute top-10 left-[8%] right-[8%] h-0.5 bg-blue-200" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
              {[
                {
                  num: "1",
                  title: "Tag",
                  desc: "A brand comments '@hireacreatorai' on a creator's Instagram post, or tags a creator they want to work with.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                  ),
                },
                {
                  num: "2",
                  title: "Profile Built",
                  desc: "Our AI instantly scrapes the creator's data and builds a professional profile with their avatar, followers, bio, and niche.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0112 0v1" /><path d="M16 3l2 2 4-4" /></svg>
                  ),
                },
                {
                  num: "3",
                  title: "Offer Sent",
                  desc: "The brand sends an offer through HireACreator with a budget, brief, and deliverables.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4z" /></svg>
                  ),
                },
                {
                  num: "4",
                  title: "Creator Claims",
                  desc: "The creator gets notified, claims their profile, and verifies they own the account.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                  ),
                },
                {
                  num: "5",
                  title: "Deal Accepted",
                  desc: "Creator reviews the offer and accepts. Brand pays through Stripe with a 10% service fee.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  ),
                },
                {
                  num: "6",
                  title: "Get Paid",
                  desc: "Creator delivers the work, brand approves, funds are released. Creator keeps 100%.",
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
              {/* Mock Instagram Comment */}
              <div className="flex-1 w-full max-w-xs">
                <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">B</div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">brandco</div>
                      <div className="text-[10px] text-neutral-400">Just now</div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-700">
                    <span className="text-blue-500 font-medium">@hireacreatorai</span> check out <span className="text-blue-500 font-medium">@jessicafitness</span> for our campaign
                  </p>
                </div>
                <p className="text-[10px] text-neutral-400 text-center mt-2">Instagram Comment</p>
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
                  <div className="mt-3 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg text-center">Payment Confirmed</div>
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
                <summary className="px-6 py-4 cursor-pointer font-medium text-neutral-900 flex justify-between items-center hover:bg-neutral-50 rounded-xl transition-colors">
                  {faq.q}
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                </summary>
                <div className="px-6 pb-4 text-sm text-neutral-600 leading-relaxed">{faq.a}</div>
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
            <a href="/claim" className="px-8 py-3 bg-white text-neutral-900 rounded-lg font-semibold text-sm hover:bg-neutral-100 transition-colors">
              Check Your Rating
            </a>
            <a href="/campaigns" className="px-8 py-3 border border-white/20 text-white rounded-lg font-semibold text-sm hover:bg-white/10 transition-colors">
              Browse Campaigns
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
