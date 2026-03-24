"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-context";

export function ClaimBanner({ platform, handle, slug }: { platform: string; handle: string; slug: string }) {
  const { openSignup } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  function handleClaim() {
    try {
      localStorage.setItem("hac_claim_intent", JSON.stringify({ platform, handle, slug }));
    } catch {}
    openSignup("creator");
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4">
      <div className="max-w-lg mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl shadow-blue-900/30 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              This page was made for you
            </p>
            <p className="text-xs text-blue-100 mt-0.5">
              Sign up to customize it and start earning from brand deals.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1 text-blue-200 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          onClick={handleClaim}
          className="mt-3 w-full px-5 py-3 rounded-xl bg-white text-blue-700 text-sm font-bold hover:bg-blue-50 active:scale-[0.98] transition-all shadow-lg"
        >
          Claim & Customize
        </button>
      </div>
    </div>
  );
}
