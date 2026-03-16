"use client";

import { useState } from "react";
import { useAuth } from "./auth-context";

export function BrowseEmptyState() {
  const { openSignup } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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
    if (data.success) setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="text-center py-20 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400">
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h3 className="font-display text-xl font-bold text-neutral-900 mb-2">Launching soon</h3>
      <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
        We're onboarding our first wave of verified creators.
        Join the waitlist to get notified when the marketplace opens,
        or sign up now to claim your profile and get featured early.
      </p>

      {submitted ? (
        <div className="bg-neutral-950 text-white rounded-2xl px-6 py-4">
          <div className="font-display font-bold">You're on the list.</div>
          <p className="text-sm text-neutral-400 mt-1">We'll email you when creators are live.</p>
        </div>
      ) : (
        <form onSubmit={handleWaitlist} className="flex gap-2 mb-4">
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
            {loading ? "..." : "Notify Me"}
          </button>
        </form>
      )}

      <button
        onClick={() => openSignup("creator")}
        className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors underline underline-offset-4"
      >
        I'm a creator — let me sign up now
      </button>
    </div>
  );
}
