"use client";

import { useState, useEffect } from "react";

interface EarningsData {
  totalEarned: number;
  thisMonth: number;
  pending: number;
  available: number;
  monthlyData: { month: string; amount: number }[];
  recentBookings: {
    id: string;
    clientName: string;
    service: string;
    amount: number;
    status: string;
    payoutStatus: string;
    date: string;
  }[];
}

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-700",
    paid: "bg-neutral-900 text-white",
    pending: "bg-amber-50 text-amber-700",
    cancelled: "bg-red-50 text-red-600",
    processing: "bg-blue-50 text-blue-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[status] || "bg-neutral-100 text-neutral-500"}`}>
      {status}
    </span>
  );
}

export function EarningsContent() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/earnings")
      .then(r => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Failed to load earnings"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-neutral-900">Earnings</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Track your income and payouts</p>
        </div>
        <div className="bg-neutral-900 rounded-2xl p-6 mb-6 animate-pulse">
          <div className="h-4 w-24 bg-neutral-700 rounded mb-3" />
          <div className="h-8 w-20 bg-neutral-700 rounded" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-neutral-900">Earnings</h2>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-8 text-center">
          <p className="text-sm text-neutral-500">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  const maxMonthly = Math.max(...data.monthlyData.map(m => m.amount), 1);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-neutral-900">Earnings</h2>
        <p className="text-xs text-neutral-400 mt-0.5">Track your income and payouts</p>
      </div>

      {/* Total earned hero */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 mb-6">
        <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Total Earned</p>
        <p className="text-3xl font-display font-bold text-white mt-1">{fmt(data.totalEarned)}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">This Month</p>
          <p className="text-2xl font-display font-bold text-neutral-900 mt-1">{fmt(data.thisMonth)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-display font-bold text-amber-600 mt-1">{fmt(data.pending)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Available</p>
          <p className="text-2xl font-display font-bold text-emerald-600 mt-1">{fmt(data.available)}</p>
        </div>
      </div>

      {/* Monthly chart */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 mb-6">
        <p className="text-sm font-bold text-neutral-900 mb-4">Earnings — Last 6 Months</p>
        <div className="flex items-end gap-3 h-36">
          {data.monthlyData.map((m, i) => {
            const monthLabel = new Date(m.month + "-01").toLocaleDateString("en", { month: "short" });
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {fmt(m.amount)}
                </div>
                <div
                  className="w-full bg-neutral-900 rounded-md min-h-[2px] transition-all hover:bg-neutral-700"
                  style={{ height: `${(m.amount / maxMonthly) * 100}%` }}
                />
                <span className="text-[10px] text-neutral-400">{monthLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden">
        <div className="p-5 border-b border-neutral-100">
          <p className="text-sm font-bold text-neutral-900">Recent Transactions</p>
        </div>
        {data.recentBookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs text-neutral-400">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {data.recentBookings.map(b => (
              <div key={b.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{b.clientName}</p>
                  <p className="text-xs text-neutral-400 truncate">{b.service}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-display font-bold text-neutral-900">{fmt(b.amount)}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {new Date(b.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
