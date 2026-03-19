"use client";

import { useState, useEffect } from "react";

interface AnalyticsData {
  views: { total: number; daily: { date: string; count: number }[] };
  clicks: { total: number; byType: { type: string; count: number }[] };
  enquiries: { total: number; daily: { date: string; count: number }[] };
  topReferrers: { domain: string; count: number }[];
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-display font-bold text-neutral-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function BarChart({ data, label }: { data: { label: string; value: number }[]; label: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
      <p className="text-sm font-bold text-neutral-900 mb-4">{label}</p>
      <div className="flex items-end gap-[3px] h-32">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {d.label}: {d.value}
            </div>
            <div
              className="w-full bg-neutral-900 rounded-sm min-h-[2px] transition-all hover:bg-neutral-700"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-neutral-400">{data[0]?.label}</span>
        <span className="text-[10px] text-neutral-400">{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function HorizontalBarChart({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
      <p className="text-sm font-bold text-neutral-900 mb-4">{label}</p>
      {data.length === 0 ? (
        <p className="text-xs text-neutral-400">No data yet</p>
      ) : (
        <div className="space-y-2.5">
          {data.map((d, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-neutral-600 truncate max-w-[200px]">{d.name}</span>
                <span className="text-xs font-medium text-neutral-900">{d.value}</span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-900 rounded-full transition-all"
                  style={{ width: `${(d.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClicksByType({ data }: { data: { type: string; count: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const typeLabels: Record<string, string> = {
    social: "Social Links",
    bio_link: "Bio Links",
    service: "Services",
    website: "Website",
  };
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
      <p className="text-sm font-bold text-neutral-900 mb-4">Clicks by Type</p>
      {data.length === 0 ? (
        <p className="text-xs text-neutral-400">No clicks yet</p>
      ) : (
        <div className="space-y-3">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                <span className="text-[10px] font-bold text-neutral-500">{d.count}</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-neutral-700">{typeLabels[d.type] || d.type}</p>
                <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-neutral-800 rounded-full"
                    style={{ width: total > 0 ? `${(d.count / total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AnalyticsContent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/analytics")
      .then(r => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-neutral-900">Analytics</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Track your profile performance</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200/60 p-5 animate-pulse">
              <div className="h-3 w-16 bg-neutral-100 rounded mb-3" />
              <div className="h-7 w-12 bg-neutral-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-neutral-900">Analytics</h2>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-8 text-center">
          <p className="text-sm text-neutral-500">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  const viewsChartData = data.views.daily.map(d => ({
    label: new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    value: d.count,
  }));

  const enquiriesChartData = data.enquiries.daily.map(d => ({
    label: new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    value: d.count,
  }));

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-neutral-900">Analytics</h2>
        <p className="text-xs text-neutral-400 mt-0.5">Track your profile performance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatCard label="Profile Views" value={data.views.total} sub="All time" />
        <StatCard label="Link Clicks" value={data.clicks.total} sub="All time" />
        <StatCard label="Enquiries" value={data.enquiries.total} sub="All time" />
      </div>

      {/* Views chart */}
      <div className="mb-4">
        <BarChart data={viewsChartData} label="Profile Views — Last 30 Days" />
      </div>

      {/* Enquiries chart */}
      <div className="mb-4">
        <BarChart data={enquiriesChartData} label="Enquiries — Last 30 Days" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <ClicksByType data={data.clicks.byType} />
        <HorizontalBarChart
          data={data.topReferrers.map(r => ({ name: r.domain, value: r.count }))}
          label="Top Referrers"
        />
      </div>
    </div>
  );
}
