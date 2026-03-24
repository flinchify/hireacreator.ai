"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-context";

export function ClaimBanner({ platform, handle }: { platform: string; handle: string }) {
  const { openSignup } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4">
      <div className="max-w-lg mx-auto bg-white/95 backdrop-blur-xl border border-blue-200 rounded-2xl shadow-2xl shadow-black/10 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900">
              Auto-generated profile
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Claim it to customize and start earning from brand deals.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => openSignup("creator")}
          className="mt-3 w-full px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          Claim Your Profile
        </button>
      </div>
    </div>
  );
}
