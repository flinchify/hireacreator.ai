"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./auth-context";

export function BrowseEmptyState() {
  const { openSignup } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    fetch("/api/waitlist").then(r => r.json()).then(d => setWaitlistCount(d.count || 0)).catch(() => {});
  }, []);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role: "brand" }),
    });
    const data = await res.json();
    if (data.success) {
      setSubmitted(true);
      setWaitlistCount(data.position || waitlistCount + 1);
    }
    setLoading(false);
  }

  return (
    <div className="text-center py-16 max-w-lg mx-auto">
      {/* Animated pulse icon */}
      <div className="relative w-20 h-20 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="relative w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-500">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <h3 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">
        Marketplace launching soon
      </h3>
      <p className="text-neutral-500 mb-2 leading-relaxed max-w-md mx-auto">
        We're onboarding the first wave of verified creators.
        Join the waitlist to get early access when we go live.
      </p>

      {/* Waitlist counter */}
      {waitlistCount > 0 && !submitted && (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-8">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-medium text-blue-700">
            {waitlistCount.toLocaleString()} {waitlistCount === 1 ? "person" : "people"} on the waitlist
          </span>
        </div>
      )}

      {submitted ? (
        <div className="bg-neutral-950 text-white rounded-2xl px-6 py-5 max-w-sm mx-auto">
          <div className="font-display font-bold text-lg">You're on the list!</div>
          <p className="text-sm text-neutral-400 mt-1">Position #{waitlistCount}. We'll email you when creators are live.</p>
        </div>
      ) : (
        <form onSubmit={handleWaitlist} className="flex gap-2 mb-4 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="flex-1 px-4 py-3 rounded-full border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-neutral-900"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-sm font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {loading ? "..." : "Join Waitlist"}
          </button>
        </form>
      )}

      <div className="flex flex-col items-center gap-3 mt-6">
        <button
          onClick={() => openSignup("creator")}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
        >
          I'm a creator — claim my profile now
        </button>
        <p className="text-xs text-neutral-400">
          First 500 creators get a permanent Founding Creator badge
        </p>
      </div>
    </div>
  );
}
