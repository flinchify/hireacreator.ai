"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";

type ProfileData = {
  platform: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  postCount: number;
  niche: string;
  score: number;
  breakdown: Record<string, number>;
  estimatedPostValue: number;
  slug: string;
};

type Campaign = {
  id: string;
  title: string;
  niche: string;
  budgetPerCreator: number;
};

const BREAKDOWN_LABELS: Record<string, string> = {
  profile: "Profile Quality",
  reach: "Reach",
  engagement: "Engagement",
  nicheValue: "Niche Demand",
  consistency: "Consistency",
  platformBonus: "Platform Value",
};

const BREAKDOWN_MAX: Record<string, number> = {
  profile: 15,
  reach: 25,
  engagement: 20,
  nicheValue: 15,
  consistency: 15,
  platformBonus: 10,
};

function platformLabel(p: string) {
  switch (p) {
    case "instagram": return "Instagram";
    case "tiktok": return "TikTok";
    case "youtube": return "YouTube";
    case "x": return "X";
    default: return p;
  }
}

function ScoreGauge({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [score]);

  const scoreColor =
    displayScore >= 75 ? "#22c55e" : displayScore >= 60 ? "#eab308" : displayScore >= 30 ? "#f97316" : "#ef4444";
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (circumference * displayScore) / 100;

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r="90" fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="100" cy="100" r="90" fill="none" stroke={scoreColor} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold" style={{ color: scoreColor }}>{displayScore}</span>
        <span className="text-sm text-neutral-500 mt-1">out of 100</span>
      </div>
    </div>
  );
}

export function UnclaimedProfile({
  profile,
  campaigns,
}: {
  profile: ProfileData;
  campaigns: Campaign[];
}) {
  const { openSignup } = useAuth();
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const profileUrl = `${baseUrl}/u/${profile.slug}`;

  function copyLink() {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareToX() {
    const text = `Check out my creator profile on HireACreator — Score: ${profile.score}/100`;
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`,
      "_blank"
    );
  }

  const minRate = Math.round(profile.estimatedPostValue * 0.7 / 100);
  const maxRate = Math.round(profile.estimatedPostValue * 1.3 / 100);

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-8 sm:pt-12 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Claim Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-2xl p-5 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">
                  This is an auto-generated profile.
                </h2>
                <p className="text-sm text-neutral-600 mt-1">
                  Is this you? Claim it to customize and start receiving brand deals.
                </p>
              </div>
              <button
                onClick={() => openSignup("creator")}
                className="shrink-0 px-6 py-3 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 active:scale-[0.98] transition-all"
              >
                Claim This Profile
              </button>
            </div>
          </div>

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center text-3xl font-bold text-blue-700 shrink-0 overflow-hidden">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                profile.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                {profile.displayName}
              </h1>
              <p className="text-neutral-500 mt-1">
                @{profile.handle} on {platformLabel(profile.platform)}
              </p>
              {profile.bio && (
                <p className="text-neutral-600 mt-3 leading-relaxed max-w-xl">
                  {profile.bio}
                </p>
              )}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-neutral-500">
                {profile.followerCount > 0 && (
                  <span><span className="font-semibold text-neutral-900">{profile.followerCount.toLocaleString()}</span> followers</span>
                )}
                {profile.followingCount > 0 && (
                  <span><span className="font-semibold text-neutral-900">{profile.followingCount.toLocaleString()}</span> following</span>
                )}
                {profile.postCount > 0 && (
                  <span><span className="font-semibold text-neutral-900">{profile.postCount.toLocaleString()}</span> posts</span>
                )}
                <span className="capitalize font-medium text-blue-600">{profile.niche}</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Score Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6 text-center">Creator Rating</h3>
              <ScoreGauge score={profile.score} />

              <div className="mt-6 text-center">
                <p className="text-sm text-neutral-500">Estimated earning per post</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  ${minRate.toLocaleString()} &ndash; ${maxRate.toLocaleString()}
                </p>
              </div>

              <div className="mt-4 text-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-50 border border-neutral-100">
                  <span className="text-xs text-neutral-500">Niche:</span>
                  <span className="text-sm font-semibold text-neutral-900 capitalize">{profile.niche}</span>
                </span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">Score Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(profile.breakdown).map(([key, value], i) => {
                  const max = BREAKDOWN_MAX[key] || 25;
                  const pct = Math.round(((value as number) / max) * 100);
                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">{BREAKDOWN_LABELS[key] || key}</span>
                        <span className="font-semibold text-neutral-900">{value as number}/{max}</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 70 ? "linear-gradient(90deg, #22c55e, #16a34a)" : pct >= 40 ? "linear-gradient(90deg, #eab308, #ca8a04)" : "linear-gradient(90deg, #f97316, #ea580c)",
                            transitionDelay: `${i * 150}ms`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Matching Campaigns */}
          {campaigns.length > 0 && (
            <div className="mt-8 bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Matching Brand Campaigns
              </h3>
              <p className="text-sm text-neutral-500 mb-6">
                {campaigns.length} active campaign{campaigns.length !== 1 ? "s" : ""} match this profile. Claim to apply.
              </p>
              <div className="space-y-3">
                {campaigns.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{c.title}</p>
                      <p className="text-xs text-neutral-500 capitalize mt-0.5">{c.niche}</p>
                    </div>
                    {c.budgetPerCreator > 0 && (
                      <p className="text-sm font-semibold text-neutral-900">
                        ${(c.budgetPerCreator / 100).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <Link
                href="/campaigns"
                className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Browse all campaigns
              </Link>
            </div>
          )}

          {/* Share + CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openSignup("creator")}
              className="px-10 py-4 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-lg shadow-neutral-900/20"
            >
              Claim Your Profile
            </button>
            <button
              onClick={copyLink}
              className="px-6 py-4 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors text-sm"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button
              onClick={shareToX}
              className="px-6 py-4 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors text-sm"
            >
              Share to X
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-neutral-400">
            Free to join. No commission on bookings.
          </p>
        </div>
      </main>
    </div>
  );
}
