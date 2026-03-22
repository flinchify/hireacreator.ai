import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface Props {
  params: { platform: string; handle: string };
}

async function getClaimedProfile(platform: string, handle: string) {
  const db = getDb();
  const rows = await db`
    SELECT * FROM claimed_profiles 
    WHERE platform = ${platform} AND platform_handle = ${handle.toLowerCase()} 
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getClaimedProfile(params.platform, params.handle);
  if (!profile) return { title: "Score Not Found | HireACreator" };

  const score = profile.creator_score as number;
  const name = (profile.display_name as string) || params.handle;
  const title = `${name} scored ${score}/100 on HireACreator`;
  const description = `@${params.handle} has a creator score of ${score}/100 for brand deals. Check out their full profile.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og/score?platform=${params.platform}&handle=${params.handle}`],
      type: "website",
      url: `https://hireacreator.ai/score/${params.platform}/${params.handle}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og/score?platform=${params.platform}&handle=${params.handle}`],
    },
  };
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-neutral-600">{label}</span>
        <span className="font-semibold text-neutral-900">{value}/{max}</span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 80 ? "#22c55e" : pct >= 50 ? "#eab308" : "#f97316",
          }}
        />
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 30) return "#f97316";
  return "#ef4444";
}

function formatCents(cents: number): string {
  if (cents >= 100_000) return `$${(cents / 100_000).toFixed(0)}K`;
  if (cents >= 100) return `$${Math.round(cents / 100)}`;
  return `$${(cents / 100).toFixed(2)}`;
}

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return String(count);
}

export default async function ScorePage({ params }: Props) {
  const validPlatforms = ["instagram", "tiktok", "x", "youtube"];
  if (!validPlatforms.includes(params.platform)) notFound();

  const profile = await getClaimedProfile(params.platform, params.handle);
  if (!profile) notFound();

  const score = (profile.creator_score as number) || 0;
  const breakdown = (profile.score_breakdown as Record<string, number>) || {};
  const name = (profile.display_name as string) || params.handle;
  const bio = profile.bio as string | null;
  const followers = (profile.follower_count as number) || 0;
  const niche = (profile.niche as string) || "lifestyle";
  const postValue = (profile.estimated_post_value as number) || 0;
  const color = getScoreColor(score);
  const platformLabel = params.platform === "x" ? "X" : params.platform.charAt(0).toUpperCase() + params.platform.slice(1);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Score Card */}
          <div className="border border-neutral-200 rounded-2xl p-8 shadow-lg mb-8">
            <div className="flex items-center gap-4 mb-6">
              {profile.avatar_url ? (
                <img src={profile.avatar_url as string} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center text-2xl font-bold text-neutral-600">
                  {name[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="font-bold text-xl text-neutral-900">{name}</div>
                <div className="text-sm text-neutral-500">@{params.handle} on {platformLabel}</div>
              </div>
              <div className="text-5xl font-bold" style={{ fontFamily: "var(--font-outfit)", color }}>
                {score}
              </div>
            </div>

            {bio && <p className="text-sm text-neutral-600 mb-6">{bio}</p>}

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-neutral-50 rounded-xl p-3 text-center">
                <div className="text-xs text-neutral-500">Followers</div>
                <div className="font-bold text-neutral-900">{formatFollowers(followers)}</div>
              </div>
              <div className="bg-neutral-50 rounded-xl p-3 text-center">
                <div className="text-xs text-neutral-500">Niche</div>
                <div className="font-bold text-neutral-900 capitalize">{niche}</div>
              </div>
              <div className="bg-neutral-50 rounded-xl p-3 text-center">
                <div className="text-xs text-neutral-500">Est. Rate</div>
                <div className="font-bold text-neutral-900">{formatCents(postValue)}/post</div>
              </div>
            </div>

            <div className="space-y-3">
              <ScoreBar label="Profile" value={breakdown.profile || 0} max={15} />
              <ScoreBar label="Reach" value={breakdown.reach || 0} max={25} />
              <ScoreBar label="Engagement" value={breakdown.engagement || 0} max={20} />
              <ScoreBar label="Niche Demand" value={breakdown.nicheValue || 0} max={15} />
              <ScoreBar label="Consistency" value={breakdown.consistency || 0} max={15} />
              <ScoreBar label="Platform" value={breakdown.platformBonus || 0} max={10} />
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <a
              href="/claim"
              className="inline-block w-full py-4 bg-neutral-900 text-white rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-colors"
            >
              Get Your Own Score
            </a>
            <p className="text-sm text-neutral-400">Free. No signup required. Takes 10 seconds.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
