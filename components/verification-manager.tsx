"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./auth-context";

export function VerificationManager() {
  const { user, refreshUser } = useAuth();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ verified: boolean; missing: string[] } | null>(null);

  async function verify() {
    setChecking(true);
    const res = await fetch("/api/profile/verify", { method: "POST" });
    const data = await res.json();
    setResult(data);
    if (data.verified) refreshUser();
    setChecking(false);
  }

  useEffect(() => { verify(); }, []);

  if (!user) return null;

  const isVerified = user.isVerified || result?.verified;

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-neutral-900">Creator Verification</h2>
        <p className="text-xs text-neutral-400 mt-0.5">Prove you own your social accounts and get a verified badge. Listing services is separate — you do not need services to be verified.</p>
      </div>

      {isVerified ? (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#10b981"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-1">Verified Creator</h3>
          <p className="text-sm text-neutral-500">Your profile displays the verified badge. Brands can trust your identity.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
          <h3 className="text-sm font-bold text-neutral-900 mb-4">Verification Requirements</h3>
          <div className="space-y-3 mb-6">
            {[
              { label: "Email verified", met: user.emailVerified },
              { label: "Social account with 100+ followers", met: result ? !result.missing.some(m => m.includes("social")) : null },
              { label: "Profile photo uploaded", met: !!user.avatar },
              { label: "Bio written (50+ characters)", met: !!user.bio && user.bio.length >= 50 },
            ].map((req, i) => (
              <div key={i} className="flex items-center gap-3">
                {req.met === null ? (
                  <div className="w-5 h-5 rounded-full bg-neutral-100 shrink-0" />
                ) : req.met ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-neutral-300" />
                  </div>
                )}
                <span className={`text-sm ${req.met ? "text-neutral-900" : "text-neutral-400"}`}>{req.label}</span>
              </div>
            ))}
          </div>

          {result && result.missing.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl mb-4">
              <p className="text-xs text-amber-700 font-medium">Complete the requirements above to get verified.</p>
            </div>
          )}

          <button onClick={verify} disabled={checking} className="w-full py-3 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50">
            {checking ? "Checking..." : "Get Verified"}
          </button>
        </div>
      )}
    </div>
  );
}
