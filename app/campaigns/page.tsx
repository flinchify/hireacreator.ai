import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Brand Campaigns | HireACreator",
  description: "Browse active campaigns from brands looking for creators. Apply to campaigns that match your niche and audience.",
};

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section className="pt-32 sm:pt-40 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-500">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Brand Campaigns
          </h1>
          <p className="text-neutral-500 text-lg mb-4 max-w-xl mx-auto">
            Brands will post campaigns with briefs, budgets, and deadlines. Apply to the ones that match your niche and start earning.
          </p>
          <p className="text-neutral-400 text-sm mb-10 max-w-md mx-auto">
            We're onboarding brands now. Campaigns will go live once we have enough verified creators in the marketplace.
          </p>

          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 mb-8 max-w-lg mx-auto">
            <h2 className="font-display text-sm font-bold text-neutral-900 mb-6 uppercase tracking-wider">What to expect</h2>
            <div className="space-y-4 text-left">
              {[
                { title: "Paid UGC briefs", desc: "Brands post briefs with clear deliverables, timelines, and budgets per creator." },
                { title: "Apply in one click", desc: "See a campaign that fits your niche? Apply instantly with your existing profile." },
                { title: "Escrow-protected payments", desc: "Funds are held securely. You get paid when the brand approves your deliverables." },
                { title: "AI-matched opportunities", desc: "Get recommended for campaigns that match your audience, niche, and engagement rate." },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-blue-500 shrink-0 mt-0.5">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <span className="text-sm font-semibold text-neutral-900">{item.title}</span>
                    <p className="text-sm text-neutral-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <a href="/claim" className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-8 py-3.5 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all min-h-[48px] text-sm">
            Claim Your Profile to Get Notified
          </a>
        </div>
      </section>
      <Footer />
    </div>
  );
}
