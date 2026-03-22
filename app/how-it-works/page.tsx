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
        <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
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
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
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
          <h2 className="text-2xl font-bold text-neutral-900 mb-8" style={{ fontFamily: "var(--font-outfit)" }}>
            For Creators
          </h2>

          <div className="space-y-6">
            <Step
              number="1"
              title="Tag @hireacreator on Instagram or X"
              description="Post a story, comment, or tweet and tag @hireacreator. You can also tag another creator you think deserves brand deals. Our bot detects the tag within seconds."
              commands={[
                { cmd: "@hireacreator", result: "We score you and build your profile automatically" },
                { cmd: "@hireacreator @jessicafitness", result: "We score and build a profile for @jessicafitness" },
              ]}
            />

            <Step
              number="2"
              title="We build your profile instantly"
              description="Our AI pulls your public profile data — name, avatar, bio, follower count, linked socials — and creates a complete portfolio page on hireacreator.ai. We also detect your niche and cross-reference your accounts across platforms."
            />

            <Step
              number="3"
              title="Get your creator score"
              description="We rate you 0-100 based on your profile quality, reach, engagement, niche demand, content consistency, and platform. We also estimate what your posts are worth to brands. This score is visible to every brand on the platform."
            />

            <Step
              number="4"
              title="Claim your profile"
              description="Visit the link in our reply to see your pre-built profile. Click 'Claim' to verify it is yours, customize your page, and appear in the creator marketplace. Only the real account owner can claim a profile."
            />

            <Step
              number="5"
              title="Get matched with brand deals"
              description="Once claimed, your profile is live in the marketplace. Brands post campaigns and our AI matches you based on your niche, score, and audience size. Apply to campaigns, negotiate rates, and get paid through the platform."
            />
          </div>
        </div>
      </section>

      {/* Bot Commands */}
      <section className="py-24 px-6 bg-neutral-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
            Bot Commands
          </h2>
          <p className="text-neutral-600 mb-8">
            Tag @hireacreator on Instagram or @hireacreatorAI on X with these commands. The bot replies publicly in the comments so everyone can see.
          </p>

          <div className="space-y-4">
            {[
              {
                command: "@hireacreator",
                description: "Score yourself. We analyze your profile and reply with your score and a link to your page.",
                example: "Just tag us in any post, story, or tweet.",
              },
              {
                command: "@hireacreator @username",
                description: "Score another creator. We build their profile and reply with their score.",
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
              <div key={item.command} className="bg-white border border-neutral-200 rounded-2xl p-6">
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
          <h2 className="text-2xl font-bold text-neutral-900 mb-8" style={{ fontFamily: "var(--font-outfit)" }}>
            For Brands
          </h2>

          <div className="space-y-6">
            <Step
              number="1"
              title="Browse scored creators"
              description="Every creator on the platform has a transparency score, verified social accounts, and estimated rates. Filter by niche, platform, follower range, and score to find the right fit."
            />
            <Step
              number="2"
              title="Post a campaign"
              description="Describe your campaign — budget, niche, platforms, number of creators needed, and deadline. Our AI matches you with creators who fit your brief."
            />
            <Step
              number="3"
              title="Review applications and hire"
              description="Creators apply to your campaign with a pitch. Review their profiles, scores, and portfolio. Accept the ones you want to work with."
            />
            <Step
              number="4"
              title="Pay securely through the platform"
              description="All payments go through Stripe escrow. Pay only when you are satisfied with the deliverables. Creators receive their payout directly to their bank."
            />
          </div>
        </div>
      </section>

      {/* Scoring Breakdown */}
      <section className="py-24 px-6 bg-neutral-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
            How We Score Creators
          </h2>
          <p className="text-neutral-600 mb-8">
            Every creator gets a score from 0 to 100 based on six factors. This score helps brands find the right creators and helps creators understand their market value.
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

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8" style={{ fontFamily: "var(--font-outfit)" }}>
            Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: "Is it really free?", a: "Checking your score and claiming your profile costs nothing. We take a small percentage of brand deals completed through the platform. Creators keep the rest." },
              { q: "What data do you collect?", a: "Only publicly available profile information — your name, bio, avatar, follower count, and linked accounts. We never access private messages, stories, or analytics." },
              { q: "Can someone else claim my profile?", a: "No. We verify ownership through email or social login before allowing a claim. Only the real account owner can claim and customize their profile." },
              { q: "What if my score is low?", a: "Your score updates as your profile grows. Improve it by completing your bio, posting consistently, and growing your audience. The score is transparent — you can see exactly which areas to improve." },
              { q: "Which platforms are supported?", a: "Instagram, TikTok, X (Twitter), and YouTube. We detect cross-linked accounts automatically — one profile shows all your platforms." },
              { q: "How fast does the bot respond?", a: "Within seconds of detecting a tag. The reply appears as a public comment so everyone in the thread can see your score and profile link." },
              { q: "Do I need to tag you to use the platform?", a: "No. You can also go directly to hireacreator.ai/claim and enter your handle to get scored and claim your profile without tagging." },
            ].map((faq) => (
              <details key={faq.q} className="group border border-neutral-200 rounded-xl">
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
      <section className="py-24 px-6 bg-neutral-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
            Ready to get started?
          </h2>
          <p className="text-neutral-400 mb-8">
            Tag @hireacreator on Instagram or X. Or check your score right now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/claim" className="px-8 py-3 bg-white text-neutral-900 rounded-xl font-semibold text-sm hover:bg-neutral-100 transition-colors">
              Check Your Score
            </a>
            <a href="/campaigns" className="px-8 py-3 border border-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors">
              Browse Campaigns
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
