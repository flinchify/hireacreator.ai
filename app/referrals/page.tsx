"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { useAuth } from "@/components/auth-context";
import Link from "next/link";

export default function ReferralsPage() {
  const { user, loading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) fetch("/api/referrals").then(r => r.json()).then(setData).catch(() => {});
  }, [user]);

  function copy() {
    if (!data?.referralLink) return;
    navigator.clipboard?.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareTwitter() {
    if (!data?.referralLink) return;
    const text = encodeURIComponent(`Join me on HireACreator — the platform connecting creators with brands. Sign up with my link: ${data.referralLink}`);
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank");
  }

  if (loading) return <div className="min-h-screen bg-neutral-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" /></div>;
  if (!user) return <div className="min-h-screen bg-neutral-50 flex items-center justify-center"><p className="text-neutral-500">Sign in to access referrals.</p></div>;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50 pt-24 pb-20 px-4">
        <div className="max-w-xl mx-auto">
          <h1 className="font-display text-2xl font-bold text-neutral-900 mb-1">Referral Program</h1>
          <p className="text-sm text-neutral-500 mb-8">Earn 20% of every subscription payment as platform credits for 12 months.</p>

          {data?.referralCode ? (
            <div className="space-y-6">
              {/* Referral link */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Your Referral Link</label>
                <div className="flex items-center gap-2 mt-2">
                  <input readOnly value={data.referralLink} className="flex-1 text-sm bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-600 truncate" />
                  <button onClick={copy} className={`px-5 py-3 text-sm font-semibold rounded-xl transition-all ${copied ? "bg-emerald-500 text-white" : "bg-neutral-900 text-white hover:bg-neutral-800"}`}>{copied ? "Copied!" : "Copy"}</button>
                </div>
                {/* Share buttons */}
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={copy} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round"/></svg>
                    Copy Link
                  </button>
                  <button onClick={shareTwitter} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    Share on X
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white rounded-2xl border border-neutral-200 p-4 text-center">
                  <div className="font-display text-2xl font-bold text-neutral-900">{data.stats.totalReferrals}</div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Referred</div>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200 p-4 text-center">
                  <div className="font-display text-2xl font-bold text-amber-600">{data.stats.pending || 0}</div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Pending</div>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200 p-4 text-center">
                  <div className="font-display text-2xl font-bold text-emerald-600">{data.stats.activePaying}</div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Paying</div>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200 p-4 text-center">
                  <div className="font-display text-2xl font-bold text-emerald-600">${((data.stats.creditBalanceCents || 0) / 100).toFixed(2)}</div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Credits</div>
                </div>
              </div>

              {data.stats.monthlyEstimateCents > 0 && (
                <div className="text-center py-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="text-sm text-emerald-700 font-medium">Estimated monthly: <span className="font-bold">${(data.stats.monthlyEstimateCents / 100).toFixed(2)}/mo</span></div>
                </div>
              )}

              {data.stats.rewardsEarned > 0 && (
                <div className="text-center py-3 bg-amber-50 border border-amber-200 rounded-2xl">
                  <div className="text-sm text-amber-700 font-medium">{data.stats.rewardsEarned} reward{data.stats.rewardsEarned !== 1 ? "s" : ""} earned</div>
                </div>
              )}

              {/* How it works */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                <h2 className="text-sm font-bold text-neutral-900 mb-4">How it works</h2>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Share your link", desc: "Send your referral link to friends, followers, or anyone who could benefit from HireACreator." },
                    { step: "2", title: "They sign up", desc: "When they create an account using your link, they're tracked as your referral." },
                    { step: "3", title: "They subscribe", desc: "When they upgrade to any paid plan, you earn 20% of their subscription as platform credits." },
                    { step: "4", title: "Earn for 12 months", desc: "You keep earning on every payment they make for a full year. Credits can be used for Pro, animations, or boosted listings." },
                  ].map(s => (
                    <div key={s.step} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold shrink-0">{s.step}</div>
                      <div><div className="text-sm font-semibold text-neutral-900">{s.title}</div><div className="text-xs text-neutral-500 mt-0.5">{s.desc}</div></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referral list */}
              {data.referrals?.length > 0 && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Your referrals</h2>
                  <div className="space-y-2">
                    {data.referrals.map((r: any) => (
                      <div key={r.id} className="flex items-center gap-3 py-2 border-b border-neutral-100 last:border-0">
                        {r.avatar ? <img src={r.avatar} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center"><span className="text-[10px] font-bold text-neutral-400">{(r.name || "?")[0]}</span></div>}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-neutral-900 truncate">{r.name}</div>
                          <div className="text-[10px] text-neutral-400">{r.tier === "free" ? "Free" : r.tier} — ${((r.totalEarnedCents || 0) / 100).toFixed(2)} credited — {r.joinedAt ? new Date(r.joinedAt).toLocaleDateString() : ""}</div>
                        </div>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${r.status === "active" ? "bg-emerald-100 text-emerald-700" : r.status === "churned" ? "bg-red-100 text-red-700" : "bg-neutral-100 text-neutral-500"}`}>{r.status === "signed_up" ? "Pending" : r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-neutral-300 leading-relaxed text-center">
                Credits are non-transferable, non-refundable, and have no cash value. Referral program terms are subject to change. See <Link href="/terms" className="underline">Terms</Link> for details.
              </p>
            </div>
          ) : (
            <div className="text-center py-10"><p className="text-sm text-neutral-400">Loading referral data...</p></div>
          )}
        </div>
      </div>
    </>
  );
}
