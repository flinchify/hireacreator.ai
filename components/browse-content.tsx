"use client";

import { useState, useMemo } from "react";
import { CreatorCard } from "@/components/creator-card";
import { Button } from "@/components/ui/button";
import type { Creator } from "@/lib/types";

const PLATFORMS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitter",
  "LinkedIn",
  "Twitch",
  "Spotify",
  "Pinterest",
  "Facebook",
  "Snapchat",
  "Discord",
  "Dribbble",
  "Behance",
  "GitHub",
];

type SortOption = "relevance" | "rating" | "price-low" | "price-high" | "newest";

export function BrowseContent({
  creators,
  categories,
}: {
  creators: Creator[];
  categories: string[];
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [location, setLocation] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters = selectedCategory || selectedPlatforms.length > 0 || priceMin || priceMax || location || verifiedOnly;

  function togglePlatform(p: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function clearFilters() {
    setSelectedCategory(null);
    setSelectedPlatforms([]);
    setPriceMin("");
    setPriceMax("");
    setLocation("");
    setVerifiedOnly(false);
    setSearch("");
    setSortBy("relevance");
  }

  const filtered = useMemo(() => {
    return creators
      .filter((c) => {
        if (search) {
          const q = search.toLowerCase();
          const matchesSearch =
            c.name.toLowerCase().includes(q) ||
            (c.headline || "").toLowerCase().includes(q) ||
            (c.category || "").toLowerCase().includes(q);
          if (!matchesSearch) return false;
        }
        if (selectedCategory && c.category !== selectedCategory) return false;
        if (selectedPlatforms.length > 0) {
          const creatorPlatforms = c.socials.map((s) => s.platform.toLowerCase());
          const hasPlatform = selectedPlatforms.some((p) =>
            creatorPlatforms.includes(p.toLowerCase())
          );
          if (!hasPlatform) return false;
        }
        if (priceMin && (c.hourlyRate === null || c.hourlyRate < Number(priceMin))) return false;
        if (priceMax && (c.hourlyRate === null || c.hourlyRate > Number(priceMax))) return false;
        if (location) {
          const loc = (c.location || "").toLowerCase();
          if (!loc.includes(location.toLowerCase())) return false;
        }
        if (verifiedOnly && !c.isVerified) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "rating":
            return b.rating - a.rating;
          case "price-low":
            return (a.hourlyRate || 0) - (b.hourlyRate || 0);
          case "price-high":
            return (b.hourlyRate || 0) - (a.hourlyRate || 0);
          case "newest":
            return 0;
          default:
            return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.rating - a.rating;
        }
      });
  }, [creators, search, selectedCategory, selectedPlatforms, priceMin, priceMax, location, verifiedOnly, sortBy]);

  const filterPanel = (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
          Category
        </label>
        <select
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Platform */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
          Platform
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => togglePlatform(p)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${
                selectedPlatforms.includes(p)
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
          Hourly Rate
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
            <input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-full pl-7 pr-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>
          <span className="text-neutral-400 text-sm">to</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
            <input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full pl-7 pr-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
          Location
        </label>
        <input
          type="text"
          placeholder="City, state, or country..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        />
      </div>

      {/* Verified Toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={verifiedOnly}
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
              verifiedOnly ? "bg-neutral-900" : "bg-neutral-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                verifiedOnly ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-sm text-neutral-700">Verified only</span>
        </label>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, skill, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2.5 rounded-full border border-neutral-300 text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          >
            <option value="relevance">Relevance</option>
            <option value="rating">Rating</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden px-4 py-2.5 rounded-full border border-neutral-300 text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="20" y2="12" />
              <line x1="12" y1="18" x2="20" y2="18" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-neutral-900" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile filter panel */}
      {filtersOpen && (
        <div className="lg:hidden mb-6 p-5 rounded-2xl border border-neutral-200 bg-white">
          {filterPanel}
        </div>
      )}

      {/* Results count */}
      <div className="mb-6 text-sm text-neutral-500">
        {filtered.length} creator{filtered.length !== 1 ? "s" : ""} found
        {selectedCategory && ` in ${selectedCategory}`}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-2 text-neutral-900 underline underline-offset-2 hover:no-underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Main layout: sidebar + grid */}
      <div className="flex gap-8">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 p-5 rounded-2xl border border-neutral-200 bg-white">
            <h3 className="font-semibold text-neutral-900 mb-5">Filters</h3>
            {filterPanel}
          </div>
        </aside>

        {/* Creator Grid */}
        <div className="flex-1 min-w-0">
          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-neutral-400 mb-2">
                <svg
                  className="mx-auto"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">
                No creators found
              </h3>
              <p className="text-sm text-neutral-500 mb-4">
                Try adjusting your search or filter criteria.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
