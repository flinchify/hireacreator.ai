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
        <section className="pt-32 pb-20 px-5">
          <div className="max-w-3xl mx-auto text-center">
            <h1
              className="text-3xl sm:text-4xl lg:text-6xl text-neutral-800 leading-tight mb-6 font-serif"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Claim your creator profile
            </h1>
            <p className="text-base text-neutral-500 max-w-xl mx-auto mb-10">
              Enter your social handle. We build your profile, show you what brands will pay, and list you in our marketplace.
            </p>
            <div className="flex justify-center px-0 sm:px-0">
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
        <section className="pb-16 px-5">
          <div className="max-w-lg mx-auto">
            <div className="bg-white border border-neutral-100 rounded-2xl p-8 shadow-md shadow-neutral-900/5">
              <h3 className="font-semibold text-lg text-neutral-800 mb-2">We could not auto-detect your profile</h3>
              <p className="text-sm text-neutral-500 mb-6">Enter your details manually so we can build your profile.</p>
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
                <button type="submit" className="w-full min-h-[48px] bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 transition-all">
                  Build My Profile
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Score Results */}
      {scoreData?.score && !scoreData.error && (
        <section className="pt-24 pb-16 px-5">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left: Score Gauge */}
              <div className="flex flex-col items-center bg-blue-50 rounded-2xl p-8">
                <ScoreGauge score={scoreData.score} size={220} />
                <div className="mt-8 w-full max-w-sm">
                  <BreakdownBars breakdown={scoreData.breakdown} />
                </div>
              </div>

              {/* Right: Profile Preview + Actions */}
              <div>
                <div className="bg-white border border-neutral-100 rounded-2xl p-8 shadow-md shadow-neutral-900/5 mb-6">
                  <div className="flex items-center gap-4 mb-6">
                    {scoreData.profile.avatarUrl ? (
                      <img src={scoreData.profile.avatarUrl} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center text-2xl font-bold text-blue-600">
                        {scoreData.profile.displayName[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-lg text-neutral-800">{scoreData.profile.displayName}</div>
                      <div className="text-sm text-neutral-500">@{scoreData.profile.handle} on {scoreData.profile.platform}</div>
                    </div>
                  </div>

                  {scoreData.profile.bio && (
                    <p className="text-sm text-neutral-600 mb-4">{scoreData.profile.bio}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-xs text-neutral-500 mb-1">Followers</div>
                      <div className="text-lg font-bold text-neutral-800">{formatFollowers(scoreData.profile.followerCount)}</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-xs text-neutral-500 mb-1">Niche</div>
                      <div className="text-lg font-bold text-neutral-800 capitalize">{scoreData.detectedNiche}</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-xs text-neutral-500 mb-1">Estimated Rate</div>
                      <div className="text-lg font-bold text-neutral-800">
                        {formatCents(scoreData.estimatedPostRange[0])} - {formatCents(scoreData.estimatedPostRange[1])}
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-xs text-neutral-500 mb-1">Matching Campaigns</div>
                      <div className="text-lg font-bold text-neutral-800">{scoreData.matchingCampaigns}</div>
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
                    className="block w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold text-center text-sm hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 transition-all mb-3"
                  >
                    Claim Your Profile — Get Matched With Brands
                  </a>
                )}

                <button
                  onClick={copyShareUrl}
                  className="w-full py-3 border border-neutral-200 text-neutral-700 rounded-lg font-medium text-sm hover:bg-neutral-50 transition-colors"
                >
                  {copied ? "Link copied!" : "Share Your Profile"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="my-4">
        <div className="bg-blue-50 py-16 sm:py-24 rounded-3xl mx-4 sm:mx-6">
          <div className="max-w-4xl mx-auto px-5">
            <h2
              className="text-2xl sm:text-3xl text-neutral-800 text-center mb-12 font-serif"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              How it works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "1", title: "Claim", desc: "Enter your handle above or tag @hireacreator on any platform." },
                { step: "2", title: "Profile", desc: "We build your page with your content, stats, and estimated brand deal rate." },
                { step: "3", title: "Earn", desc: "Brands discover you in our marketplace and send deals. You get paid." },
              ].map((s) => (
                <div key={s.step} className="bg-white rounded-2xl p-6 sm:p-8 shadow-md shadow-neutral-900/5 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center text-sm font-bold mx-auto mb-4">{s.step}</div>
                  <h3 className="font-semibold text-neutral-800 text-base mb-2">{s.title}</h3>
                  <p className="text-sm text-neutral-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 px-5">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl text-neutral-800 text-center mb-12 font-serif"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {[
              { q: "What happens when I claim my profile?", a: "We build a professional creator page with your content, audience stats, niche, and estimated brand deal rate. You go live in our marketplace for brands to discover." },
              { q: "How do brand deals work?", a: "Brands browse creators by niche and audience. If you match their campaign, they send you an offer. Deals are managed and paid through the platform." },
              { q: "Is it free?", a: "Completely free to join. We only take a small percentage when you complete a paid brand deal through the platform." },
              { q: "How do I get paid?", a: "Through Stripe. Once you complete a brand deal, payment is released from escrow directly to your bank account." },
              { q: "Can someone else claim my profile?", a: "No. Only the real account owner can claim a profile. We verify ownership through email or social login." },
            ].map((faq) => (
              <details key={faq.q} className="group border border-neutral-100 rounded-xl">
                <summary className="px-5 py-4 cursor-pointer font-medium text-neutral-800 text-sm flex justify-between items-center hover:bg-neutral-50 rounded-xl transition-colors">
                  {faq.q}
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform shrink-0 ml-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                </summary>
                <div className="faq-content px-5 pb-4 text-sm text-neutral-500 leading-relaxed">{faq.a}</div>
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
