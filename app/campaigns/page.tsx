import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getDb } from "@/lib/db";

async function getCampaigns() {
  try {
    const db = getDb();
    const campaigns = await db`
      SELECT c.*, u.full_name as brand_name, u.avatar_url as brand_avatar
      FROM brand_campaigns c
      LEFT JOIN users u ON c.brand_id = u.id
      WHERE c.status = 'active'
      AND (c.deadline IS NULL OR c.deadline > NOW())
      ORDER BY c.created_at DESC
      LIMIT 20
    `;
    return campaigns;
  } catch {
    return [];
  }
}

function formatBudget(cents: number | null): string {
  if (!cents) return "Flexible";
  if (cents >= 100_000) return `$${(cents / 100_000).toFixed(0)}K`;
  if (cents >= 100) return `$${Math.round(cents / 100)}`;
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
              Brand Campaigns
            </h1>
            <p className="text-neutral-600 max-w-xl">
              Browse active campaigns from brands looking for creators. Apply to the ones that match your niche and audience.
            </p>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">No active campaigns yet</h2>
              <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                Brands are onboarding now. Claim your profile to be first in line when campaigns go live.
              </p>
              <a href="/claim" className="inline-block px-8 py-3 bg-neutral-900 text-white rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-colors">
                Claim Your Profile
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {campaigns.map((campaign) => {
                const platforms = (campaign.platforms as string[]) || [];
                const deadline = campaign.deadline ? new Date(campaign.deadline as string) : null;
                const isUrgent = deadline && deadline.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

                return (
                  <div key={campaign.id as string} className="border border-neutral-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-neutral-900">{campaign.title as string}</h3>
                        <div className="text-sm text-neutral-500 mt-1">
                          {campaign.brand_name ? `by ${campaign.brand_name}` : "Brand"}
                        </div>
                      </div>
                      {isUrgent && (
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                          Ending Soon
                        </span>
                      )}
                    </div>

                    {campaign.description && (
                      <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{campaign.description as string}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {campaign.niche && (
                        <span className="text-xs font-medium text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full capitalize">
                          {campaign.niche as string}
                        </span>
                      )}
                      {platforms.map((p) => (
                        <span key={p} className="text-xs font-medium text-neutral-500 bg-neutral-50 px-3 py-1 rounded-full capitalize">
                          {p}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-neutral-600">
                        <span className="font-semibold text-neutral-900">
                          {formatBudget(campaign.budget_per_creator_cents as number | null)}
                        </span>
                        /creator
                      </div>
                      <div className="text-neutral-500">
                        {campaign.applications_count || 0}/{campaign.max_creators || 10} spots filled
                      </div>
                    </div>

                    {deadline && (
                      <div className="mt-3 text-xs text-neutral-400">
                        Deadline: {deadline.toLocaleDateString("en-AU", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    )}

                    <a
                      href="/claim"
                      className="block mt-4 w-full py-2.5 text-center bg-neutral-900 text-white rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors"
                    >
                      Apply
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
