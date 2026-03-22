"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CreatorScoreBadge } from "./creator-score-badge";
import { getScoreTier } from "@/lib/creator-score";

type LeaderboardCreator = {
  rank: number;
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  headline: string | null;
  category: string | null;
  location: string | null;
  score: number;
  scoreBreakdown: Record<string, number>;
  nicheRank: number;
  rating: number;
  reviewCount: number;
  totalProjects: number;
  profileViews: number;
  totalFollowers: number;
  isVerified: boolean;
  isPro: boolean;
};

type CategoryInfo = { name: string; count: number };

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K`;
  return String(count);
}

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">&#x1F947;</span>;
  if (rank === 2) return <span className="text-lg">&#x1F948;</span>;
  if (rank === 3) return <span className="text-lg">&#x1F949;</span>;
  return <span className="text-sm font-bold text-neutral-400 w-5 text-center">{rank}</span>;
}

function ScoreBreakdownTooltip({ breakdown }: { breakdown: Record<string, number> }) {
  const items = [
    { key: "profile", label: "Profile", max: 20 },
    { key: "reach", label: "Reach", max: 20 },
    { key: "engagement", label: "Engagement", max: 15 },
    { key: "reputation", label: "Reputation", max: 20 },
    { key: "experience", label: "Experience", max: 15 },
    { key: "trust", label: "Trust", max: 10 },
  ];

  return (
    <div className="space-y-1.5">
      {items.map(({ key, label, max }) => {
        const val = breakdown[key] || 0;
        const pct = (val / max) * 100;
        return (
          <div key={key}>
            <div className="flex items-center justify-between text-[10px] mb-0.5">
              <span className="text-neutral-500">{label}</span>
              <span className="font-bold text-neutral-700">{val}/{max}</span>
            </div>
            <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-neutral-900 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LeaderboardContent() {
  const [creators, setCreators] = useState<LeaderboardCreator[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    params.set("limit", "50");
    fetch(`/api/leaderboard?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setCreators(data.creators || []);
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <div>
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory("")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            !selectedCategory
              ? "bg-neutral-900 text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === cat.name
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {cat.name}
            <span className="ml-1.5 text-xs opacity-60">{cat.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : creators.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="font-semibold text-neutral-900 mb-1">No rankings yet</h3>
          <p className="text-sm text-neutral-500">Creator Ratings are being calculated. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[3rem_1fr_5rem_5rem_5rem_4rem] gap-4 px-4 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            <div>#</div>
            <div>Creator</div>
            <div className="text-center">Rating</div>
            <div className="text-center">Reviews</div>
            <div className="text-center">Followers</div>
            <div className="text-center">Projects</div>
          </div>

          {/* Creator rows */}
          {creators.map((creator) => {
            const tier = getScoreTier(creator.score);
            const isExpanded = expandedId === creator.id;

            return (
              <div key={creator.id}>
                <div
                  onClick={() => setExpandedId(isExpanded ? null : creator.id)}
                  className={`group grid grid-cols-[3rem_1fr_auto] sm:grid-cols-[3rem_1fr_5rem_5rem_5rem_4rem] gap-4 items-center px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    creator.rank <= 3
                      ? "bg-gradient-to-r from-amber-50/50 to-transparent border border-amber-100 hover:border-amber-200 hover:shadow-md hover:shadow-blue-500/5"
                      : "bg-white border border-neutral-100 hover:border-neutral-200 hover:shadow-md hover:shadow-blue-500/10"
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center">
                    <MedalIcon rank={creator.rank} />
                  </div>

                  {/* Creator info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Link href={`/creators/${creator.slug}`} className="shrink-0">
                      {creator.avatar ? (
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                          <span className="text-sm font-semibold text-neutral-500">{creator.name.charAt(0)}</span>
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0">
                      <Link href={`/creators/${creator.slug}`} className="flex items-center gap-1.5 hover:underline">
                        <span className="font-semibold text-neutral-900 truncate text-sm">{creator.name}</span>
                        {creator.isVerified && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-blue-500 shrink-0">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {creator.isPro && (
                          <span className="inline-flex items-center px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-bold uppercase tracking-wider rounded-full">PRO</span>
                        )}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        {creator.category && (
                          <span className="text-xs text-neutral-400">{creator.category}</span>
                        )}
                        {creator.nicheRank > 0 && creator.nicheRank <= 3 && creator.category && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${creator.nicheRank === 1 ? "bg-amber-400" : creator.nicheRank === 2 ? "bg-neutral-400" : "bg-amber-600"}`}>
                            #{creator.nicheRank}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating - always visible */}
                  <div className="flex justify-center sm:justify-center">
                    <CreatorScoreBadge score={creator.score} size="sm" />
                  </div>

                  {/* Reviews - desktop only */}
                  <div className="hidden sm:flex items-center justify-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-sm font-medium text-neutral-900">{creator.rating}</span>
                    <span className="text-xs text-neutral-400">({creator.reviewCount})</span>
                  </div>

                  {/* Followers - desktop only */}
                  <div className="hidden sm:flex justify-center">
                    <span className="text-sm text-neutral-600">{formatFollowers(creator.totalFollowers)}</span>
                  </div>

                  {/* Projects - desktop only */}
                  <div className="hidden sm:flex justify-center">
                    <span className="text-sm text-neutral-600">{creator.totalProjects}</span>
                  </div>
                </div>

                {/* Expanded rating breakdown */}
                {isExpanded && (
                  <div className="mx-4 mt-1 mb-2 p-4 bg-neutral-50 rounded-xl border border-neutral-100 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Rating Breakdown</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tier.color }}>{tier.label}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                      <ScoreBreakdownTooltip breakdown={creator.scoreBreakdown} />
                    </div>
                    <div className="mt-3 flex items-center gap-2 sm:hidden text-xs text-neutral-500">
                      <span>Rating: {creator.rating} ({creator.reviewCount})</span>
                      <span>|</span>
                      <span>Followers: {formatFollowers(creator.totalFollowers)}</span>
                      <span>|</span>
                      <span>Projects: {creator.totalProjects}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* How ratings work */}
      <div className="mt-12 p-8 bg-blue-50 rounded-3xl border border-blue-100 shadow-md shadow-blue-500/5">
        <h3 style={{ fontFamily: "var(--font-serif)" }} className="text-xl font-bold text-neutral-900 mb-4">How Ratings Work</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold text-neutral-900 mb-1">Profile Quality (20pts)</div>
            <p className="text-neutral-500 text-xs">Avatar, bio, headline, location, category, and cover image completeness.</p>
          </div>
          <div>
            <div className="font-semibold text-neutral-900 mb-1">Social Reach (20pts)</div>
            <p className="text-neutral-500 text-xs">Total follower count across connected platforms, with multi-platform bonuses.</p>
          </div>
          <div>
            <div className="font-semibold text-neutral-900 mb-1">Engagement (15pts)</div>
            <p className="text-neutral-500 text-xs">Profile views and link clicks from your HireACreator presence.</p>
          </div>
          <div>
            <div className="font-semibold text-neutral-900 mb-1">Reputation (20pts)</div>
            <p className="text-neutral-500 text-xs">Average client rating and total number of reviews received.</p>
          </div>
          <div>
            <div className="font-semibold text-neutral-900 mb-1">Experience (15pts)</div>
            <p className="text-neutral-500 text-xs">Completed projects, active services, and portfolio size.</p>
          </div>
          <div>
            <div className="font-semibold text-neutral-900 mb-1">Trust (10pts)</div>
            <p className="text-neutral-500 text-xs">Verification status and Pro subscription tier.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
