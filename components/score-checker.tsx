"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "x", label: "X" },
  { value: "youtube", label: "YouTube" },
];

export function ScoreChecker({
  variant = "default",
  onResult,
}: {
  variant?: "default" | "hero" | "dark" | "compact";
  onResult?: (data: Record<string, unknown>) => void;
}) {
  const [platform, setPlatform] = useState("instagram");
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!handle.trim()) return;
    setLoading(true);

    if (onResult) {
      try {
        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform, handle: handle.trim() }),
        });
        const data = await res.json();
        onResult(data);
      } catch {
        onResult({ error: "Something went wrong. Try again." });
      }
      setLoading(false);
    } else {
      router.push(`/claim?platform=${platform}&handle=${encodeURIComponent(handle.trim())}`);
    }
  }

  const isDark = variant === "dark";
  const isCompact = variant === "compact";

  return (
    <form onSubmit={handleSubmit} className={`flex ${isCompact ? "flex-row gap-2" : "flex-col sm:flex-row gap-3"} w-full max-w-2xl`}>
      <div className={`relative ${isCompact ? "w-32" : "w-full sm:w-40"}`}>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className={`w-full h-12 px-4 rounded-xl border appearance-none text-sm font-medium transition-all cursor-pointer ${
            isDark
              ? "bg-white/10 border-white/20 text-white"
              : "bg-white border-neutral-200 text-neutral-900 hover:border-neutral-400"
          } focus:outline-none focus:ring-2 focus:ring-neutral-900/20`}
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value} className="text-neutral-900">
              {p.label}
            </option>
          ))}
        </select>
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/60" : "text-neutral-400"}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>

      <div className="relative flex-1">
        <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-white/40" : "text-neutral-400"}`}>@</span>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="username"
          className={`w-full h-12 pl-8 pr-4 rounded-xl border text-sm transition-all ${
            isDark
              ? "bg-white/10 border-white/20 text-white placeholder:text-white/40"
              : "bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-400"
          } focus:outline-none focus:ring-2 focus:ring-neutral-900/20`}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !handle.trim()}
        className={`h-12 px-8 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
          isDark
            ? "bg-white text-neutral-900 hover:bg-neutral-100 disabled:bg-white/20 disabled:text-white/40"
            : "bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500"
        } ${loading ? "animate-pulse" : ""}`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Scoring...
          </span>
        ) : (
          "Get My Score"
        )}
      </button>
    </form>
  );
}
