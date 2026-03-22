"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScoreChecker } from "@/components/score-checker";
import { ScoreGauge, BreakdownBars } from "@/components/score-gauge";

interface ScoreData {
  score: number;
  breakdown: {
    profile: number;
    reach: number;
    engagement: number;
    nicheValue: number;
    consistency: number;
    platformBonus: number;
  };
  estimatedPostValue: number;
  estimatedPostRange: [number, number];
  detectedNiche: string;
  matchingCampaigns: number;
  profile: {
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
    followerCount: number;
    platform: string;
    handle: string;
  };
  slug: string;
  profileUrl: string;
  isClaimed: boolean;
  manualInputRequired: boolean;
  error?: string;
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

function ClaimPageInner() {
  const searchParams = useSearchParams();
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ followerCount: "", bio: "", niche: "" });

  useEffect(() => {
    const platform = searchParams.get("platform");
    const handle = searchParams.get("handle");
    if (platform && handle) {
      fetchScore(platform, handle);
    }
  }, [searchParams]);

  async function fetchScore(platform: string, handle: string, manualData?: Record<string, unknown>) {
    setLoading(true);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle, manual: manualData }),
      });
      const data = await res.json();
      if (data.error) {
        setScoreData({ ...data } as ScoreData);
      } else {
        setScoreData(data as ScoreData);
        if (data.manualInputRequired) {
          setShowManual(true);
        }
      }
    } catch {
      setScoreData({ error: "Something went wrong. Please try again." } as unknown as ScoreData);
    }
    setLoading(false);
  }

  function handleResult(data: Record<string, unknown>) {
    if (data.error && typeof data.error === "string") {
      setScoreData({ error: data.error } as unknown as ScoreData);
    } else {
      setScoreData(data as unknown as ScoreData);
      if (data.manualInputRequired) setShowManual(true);
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const platform = searchParams.get("platform") || scoreData?.profile?.platform || "instagram";
    const handle = searchParams.get("handle") || scoreData?.profile?.handle || "";
    fetchScore(platform, handle, {
      followerCount: parseInt(manual.followerCount) || 0,
      bio: manual.bio,
      niche: manual.niche,
    });
    setShowManual(false);
  }

  function copyShareUrl() {
    if (!scoreData?.slug) return;
    const url = `https://hireacreator.ai/score/${scoreData.profile.platform}/${scoreData.profile.handle}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero / Input */}
      {!scoreData?.score && (
        <section className="pt-32 pb-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
              Discover What You Are Worth to Brands
            </h1>
            <p className="text-lg text-neutral-500 max-w-xl mx-auto mb-10">
              Enter your social handle. We build your creator profile and match you with brand deals — instantly.
            </p>
            <div className="flex justify-center px-4 sm:px-0">
              <ScoreChecker variant="light" onResult={handleResult} />
            </div>
            {loading && (
              <div className="mt-8 flex items-center justify-center gap-3 text-neutral-500">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Analyzing your profile...
              </div>
            )}
            {scoreData?.error && !scoreData.score && (
              <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                {scoreData.error}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Manual Input Fallback */}
      {showManual && (
        <section className="pb-16 px-6">
          <div className="max-w-lg mx-auto">
            <div className="bg-white border border-neutral-200/60 rounded-2xl p-8 shadow-lg">
              <h3 className="font-bold text-lg text-neutral-900 mb-2">We could not auto-detect your profile</h3>
              <p className="text-sm text-neutral-500 mb-6">Enter your details manually for an accurate score.</p>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Follower count</label>
                  <input type="number" value={manual.followerCount} onChange={(e) => setManual({ ...manual, followerCount: e.target.value })} placeholder="e.g. 15000" className="w-full min-h-[48px] px-4 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-neutral-400 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Bio</label>
                  <textarea value={manual.bio} onChange={(e) => setManual({ ...manual, bio: e.target.value })} placeholder="What do you create?" rows={3} className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-neutral-400 transition-colors resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Niche</label>
                  <select value={manual.niche} onChange={(e) => setManual({ ...manual, niche: e.target.value })} className="w-full min-h-[48px] px-4 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-neutral-400 transition-colors">
                    <option value="">Select your niche</option>
                    {["fitness","beauty","tech","fashion","food","travel","finance","gaming","music","art","education","lifestyle","automotive"].map((n) => (
                      <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full min-h-[48px] bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold text-sm hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 transition-all">
                  Calculate My Score
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Score Results */}
      {scoreData?.score && !scoreData.error && (
        <section className="pt-24 pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left: Score Gauge */}
              <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8">
                <ScoreGauge score={scoreData.score} size={220} />
                <div className="mt-8 w-full max-w-sm">
                  <BreakdownBars breakdown={scoreData.breakdown} />
                </div>
              </div>

              {/* Right: Profile Preview + Actions */}
              <div>
                <div className="bg-white border border-neutral-200/60 rounded-2xl p-8 shadow-lg mb-6">
                  <div className="flex items-center gap-4 mb-6">
                    {scoreData.profile.avatarUrl ? (
                      <img src={scoreData.profile.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                        {scoreData.profile.displayName[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-lg text-neutral-900">{scoreData.profile.displayName}</div>
                      <div className="text-sm text-neutral-500">@{scoreData.profile.handle} on {scoreData.profile.platform}</div>
                    </div>
                  </div>

                  {scoreData.profile.bio && (
                    <p className="text-sm text-neutral-600 mb-4">{scoreData.profile.bio}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50/50 rounded-xl p-4">
                      <div className="text-xs text-neutral-500 mb-1">Followers</div>
                      <div className="text-lg font-bold text-neutral-900">{formatFollowers(scoreData.profile.followerCount)}</div>
                    </div>
                    <div className="bg-blue-50/50 rounded-xl p-4">
                      <div className="text-xs text-neutral-500 mb-1">Niche</div>
                      <div className="text-lg font-bold text-neutral-900 capitalize">{scoreData.detectedNiche}</div>
                    </div>
                    <div className="bg-blue-50/50 rounded-xl p-4">
                      <div className="text-xs text-neutral-500 mb-1">Estimated Rate</div>
                      <div className="text-lg font-bold text-neutral-900">
                        {formatCents(scoreData.estimatedPostRange[0])} - {formatCents(scoreData.estimatedPostRange[1])}
                      </div>
                    </div>
                    <div className="bg-blue-50/50 rounded-xl p-4">
                      <div className="text-xs text-neutral-500 mb-1">Matching Campaigns</div>
                      <div className="text-lg font-bold text-neutral-900">{scoreData.matchingCampaigns}</div>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mb-3">
                    <div className="text-xs text-white/70 mb-1">Your posts are worth approximately</div>
                    <div className="text-2xl font-bold text-white">
                      {formatCents(scoreData.estimatedPostRange[0])} - {formatCents(scoreData.estimatedPostRange[1])}/post
                    </div>
                  </div>
                </div>

                {!scoreData.isClaimed && (
                  <a
                    href={scoreData.profileUrl.replace("https://hireacreator.ai", "")}
                    className="block w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold text-center text-sm hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 transition-all mb-3"
                  >
                    Claim Your Profile — Get Matched With Brands
                  </a>
                )}

                <button
                  onClick={copyShareUrl}
                  className="w-full py-3 border border-neutral-200 text-neutral-700 rounded-full font-medium text-sm hover:bg-neutral-50 transition-colors"
                >
                  {copied ? "Link copied!" : "Share Your Score"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-24 px-6 bg-slate-50/80">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12" style={{ fontFamily: "var(--font-outfit)" }}>
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Tag", desc: "Tag @hireacreator on any platform, or enter your handle above." },
              { step: "2", title: "Score", desc: "Our AI analyzes your profile, scores your brand deal potential, and builds your page." },
              { step: "3", title: "Earn", desc: "Brands find your profile and send deals. You get paid." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center text-lg font-bold mx-auto mb-4">{s.step}</div>
                <h3 className="font-bold text-lg text-neutral-900 mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12" style={{ fontFamily: "var(--font-outfit)" }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: "What is a creator score?", a: "A 0-100 rating based on your profile quality, reach, engagement, niche demand, and content consistency. Brands use it to find the right creators." },
              { q: "How do brand deals work?", a: "Brands post campaigns with budgets and requirements. If your score and niche match, you can apply. Deals are managed and paid through the platform." },
              { q: "Is it free?", a: "Checking your score and claiming your profile is completely free. We take a small percentage of brand deals completed through the platform." },
              { q: "How do I get paid?", a: "Through Stripe. Once you complete a brand deal, payment is released from escrow directly to your bank account." },
              { q: "Can I claim a profile someone else tagged?", a: "Only the real account owner can claim a profile. We verify ownership through email or social login." },
            ].map((faq) => (
              <details key={faq.q} className="group border border-neutral-200 rounded-xl">
                <summary className="px-6 py-4 cursor-pointer font-medium text-neutral-900 flex justify-between items-center hover:bg-neutral-50 rounded-xl transition-colors">
                  {faq.q}
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                </summary>
                <div className="px-6 pb-4 text-sm text-neutral-500 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ClaimPageInner />
    </Suspense>
  );
}
