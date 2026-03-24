"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Section = "overview" | "bots" | "offers" | "users" | "profiles" | "import" | "revenue" | "settings";

const NAV_ITEMS: { key: Section; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { key: "bots", label: "Social Bots", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { key: "offers", label: "Offers", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { key: "users", label: "Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { key: "profiles", label: "Creator Profiles", icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "import", label: "Import Profile", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
  { key: "revenue", label: "Revenue", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "settings", label: "Site Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

function fmt(cents: number) {
  return "$" + (cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDateTime(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 sm:p-5">
      <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-neutral-500 mt-1">{sub}</div>}
    </div>
  );
}

function Toggle({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-3 group">
      <div className={`w-11 h-6 rounded-full relative transition-colors ${enabled ? "bg-blue-500" : "bg-neutral-600"}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? "left-[22px]" : "left-0.5"}`} />
      </div>
      <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">{label}</span>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    accepted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    paid: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    delivered: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    disputed: "bg-red-500/10 text-red-400 border-red-500/20",
    declined: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    expired: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full border ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    admin: "bg-red-500/10 text-red-400 border-red-500/20",
    creator: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    brand: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    agent: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full border ${colors[role] || colors.creator}`}>
      {role}
    </span>
  );
}

// ─── Section Components ──────────────────────────────

function OverviewSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard?section=overview")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!data) return <div className="text-neutral-400">Failed to load overview</div>;

  const { users, offers, revenue, newUsers } = data;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Overview</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard label="Total Users" value={Number(users.total).toLocaleString()} />
        <StatCard label="Creators" value={Number(users.creators).toLocaleString()} />
        <StatCard label="Brands" value={Number(users.brands).toLocaleString()} />
        <StatCard label="Admins" value={Number(users.admins).toLocaleString()} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard label="Total Offers" value={Number(offers.total).toLocaleString()} />
        <StatCard label="Pending" value={Number(offers.pending).toLocaleString()} />
        <StatCard label="Accepted" value={Number(offers.accepted).toLocaleString()} />
        <StatCard label="Paid" value={Number(offers.paid).toLocaleString()} />
        <StatCard label="Delivered" value={Number(offers.delivered).toLocaleString()} />
        <StatCard label="Completed" value={Number(offers.completed).toLocaleString()} />
        <StatCard label="Disputed" value={Number(offers.disputed).toLocaleString()} />
        <StatCard label="Declined" value={Number(offers.declined).toLocaleString()} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard label="Total Revenue (Fees)" value={fmt(Number(revenue.total_fees))} />
        <StatCard label="Total GMV" value={fmt(Number(revenue.total_gmv))} />
        <StatCard label="Revenue This Month" value={fmt(Number(revenue.fees_this_month))} />
        <StatCard label="Avg Deal Size" value={fmt(Number(revenue.avg_deal_size))} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="New Today" value={newUsers.today} />
        <StatCard label="New This Week" value={newUsers.thisWeek} />
        <StatCard label="New This Month" value={newUsers.thisMonth} />
      </div>
    </div>
  );
}

function BotsSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/dashboard?section=bots")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleBot = async (bot: "x_bot_enabled" | "ig_bot_enabled", current: boolean) => {
    await fetch("/api/admin/dashboard", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_settings", settings: { [bot]: current ? "false" : "true" } }),
    });
    load();
  };

  if (loading && !data) return <Loader />;
  if (!data) return <div className="text-neutral-400">Failed to load bot status</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Social Media Bot Status</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* X Bot */}
        <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">X</span>
              X / Twitter Bot
            </h3>
            <Toggle enabled={data.x.enabled} onToggle={() => toggleBot("x_bot_enabled", data.x.enabled)} label="" />
          </div>
          <div className="flex gap-4">
            <div>
              <div className="text-2xl font-bold text-white">{data.x.totalReplies}</div>
              <div className="text-xs text-neutral-400">total replies</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-400 mb-2 uppercase tracking-wider">Recent Activity</div>
            {data.x.recentReplies.length === 0 ? (
              <div className="text-sm text-neutral-500">No replies yet</div>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {data.x.recentReplies.map((r: any) => (
                  <div key={r.tweet_id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg bg-neutral-900/50">
                    <span className="text-blue-400 font-medium">@{r.username}</span>
                    <span className="text-neutral-500 text-xs">{fmtDateTime(r.replied_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* IG Bot */}
        <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">IG</span>
              Instagram Bot
            </h3>
            <Toggle enabled={data.ig.enabled} onToggle={() => toggleBot("ig_bot_enabled", data.ig.enabled)} label="" />
          </div>
          <div className="flex gap-4">
            <div>
              <div className="text-2xl font-bold text-white">{data.ig.totalReplies}</div>
              <div className="text-xs text-neutral-400">total replies</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-400 mb-2 uppercase tracking-wider">Recent Activity</div>
            {data.ig.recentReplies.length === 0 ? (
              <div className="text-sm text-neutral-500">No replies yet</div>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {data.ig.recentReplies.map((r: any) => (
                  <div key={r.comment_id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg bg-neutral-900/50">
                    <span className="text-purple-400 font-medium">@{r.username}</span>
                    <span className="text-neutral-500 text-xs">{fmtDateTime(r.replied_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OffersSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ section: "offers", page: String(page) });
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/dashboard?${params}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (action: string, offerId: string) => {
    if (!confirm(`Are you sure you want to ${action.replace(/_/g, " ")} this offer?`)) return;
    setActing(offerId);
    await fetch("/api/admin/dashboard", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, offerId }),
    });
    setActing(null);
    load();
  };

  const statuses = ["", "pending", "accepted", "paid", "delivered", "completed", "disputed", "declined", "expired"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Offers Management</h2>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                statusFilter === s
                  ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                  : "border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? <Loader /> : (
        <>
          <div className="text-xs text-neutral-500">{data?.total || 0} offers total</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-neutral-400 uppercase tracking-wider border-b border-neutral-700/50">
                  <th className="pb-2 pr-3">Brand</th>
                  <th className="pb-2 pr-3">Creator</th>
                  <th className="pb-2 pr-3">Budget</th>
                  <th className="pb-2 pr-3">Fee</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2 pr-3">Date</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.offers || []).map((o: any) => (
                  <tr key={o.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                    <td className="py-2.5 pr-3">
                      <div className="text-white text-sm">{o.brand_name || "—"}</div>
                      <div className="text-neutral-500 text-xs">{o.brand_email}</div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className="text-blue-400">@{o.creator_handle}</span>
                      <span className="text-neutral-500 text-xs ml-1">({o.creator_platform})</span>
                    </td>
                    <td className="py-2.5 pr-3 text-white">{fmt(o.budget_cents)}</td>
                    <td className="py-2.5 pr-3 text-neutral-400">{fmt(o.fee_cents)}</td>
                    <td className="py-2.5 pr-3"><StatusBadge status={o.status} /></td>
                    <td className="py-2.5 pr-3 text-neutral-400 text-xs">{fmtDate(o.created_at)}</td>
                    <td className="py-2.5">
                      <div className="flex gap-1">
                        {["pending", "accepted", "paid", "delivered"].includes(o.status) && (
                          <button
                            onClick={() => doAction("force_complete_offer", o.id)}
                            disabled={acting === o.id}
                            className="px-2 py-1 text-[10px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        {["paid", "delivered", "disputed"].includes(o.status) && (
                          <button
                            onClick={() => doAction("force_refund_offer", o.id)}
                            disabled={acting === o.id}
                            className="px-2 py-1 text-[10px] rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                          >
                            Refund
                          </button>
                        )}
                        {!["disputed", "completed", "declined", "expired"].includes(o.status) && (
                          <button
                            onClick={() => doAction("mark_disputed", o.id)}
                            disabled={acting === o.id}
                            className="px-2 py-1 text-[10px] rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                          >
                            Dispute
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {(data?.offers || []).length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-neutral-500">No offers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {data && data.total > data.limit && (
            <div className="flex gap-2 justify-center pt-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 text-xs rounded border border-neutral-700 text-neutral-400 hover:text-white disabled:opacity-30">Prev</button>
              <span className="px-3 py-1 text-xs text-neutral-400">Page {page} of {Math.ceil(data.total / data.limit)}</span>
              <button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(data.total / data.limit)} className="px-3 py-1 text-xs rounded border border-neutral-700 text-neutral-400 hover:text-white disabled:opacity-30">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function UsersSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ section: "users", page: String(page) });
    if (search) params.set("q", search);
    fetch(`/api/admin/dashboard?${params}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (action: string, userId: string, extra?: any) => {
    setActing(userId);
    await fetch("/api/admin/dashboard", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId, ...extra }),
    });
    setActing(null);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Users Management</h2>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 min-h-[48px] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 w-full sm:w-72"
        />
      </div>

      {loading && !data ? <Loader /> : (
        <>
          <div className="text-xs text-neutral-500">{data?.total || 0} users total</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-neutral-400 uppercase tracking-wider border-b border-neutral-700/50">
                  <th className="pb-2 pr-3">Name</th>
                  <th className="pb-2 pr-3">Email</th>
                  <th className="pb-2 pr-3">Role</th>
                  <th className="pb-2 pr-3">Plan</th>
                  <th className="pb-2 pr-3">Socials</th>
                  <th className="pb-2 pr-3">Joined</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.users || []).map((u: any) => (
                  <tr key={u.id} className={`border-b border-neutral-800/50 hover:bg-neutral-800/30 ${u.is_banned ? "opacity-50" : ""}`}>
                    <td className="py-2.5 pr-3">
                      <span className="text-white">{u.full_name}</span>
                      {u.is_verified && <span className="ml-1 text-blue-400 text-xs" title="Verified">&#10003;</span>}
                      {u.is_banned && <span className="ml-1 text-red-400 text-xs">(banned)</span>}
                    </td>
                    <td className="py-2.5 pr-3 text-neutral-400 text-xs">{u.email}</td>
                    <td className="py-2.5 pr-3"><RoleBadge role={u.role} /></td>
                    <td className="py-2.5 pr-3 text-neutral-400 text-xs">{u.subscription_tier || "free"}</td>
                    <td className="py-2.5 pr-3 text-neutral-400 text-center">{u.social_count}</td>
                    <td className="py-2.5 pr-3 text-neutral-400 text-xs">{fmtDate(u.created_at)}</td>
                    <td className="py-2.5">
                      <div className="flex gap-1">
                        {u.is_banned ? (
                          <button
                            onClick={() => doAction("unban_user", u.id)}
                            disabled={acting === u.id}
                            className="px-2 py-1 text-[10px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const reason = prompt("Ban reason:");
                              if (reason !== null) doAction("ban_user", u.id, { reason });
                            }}
                            disabled={acting === u.id}
                            className="px-2 py-1 text-[10px] rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                          >
                            Ban
                          </button>
                        )}
                        {u.role !== "admin" && (
                          <button
                            onClick={() => { if (confirm("Make this user an admin?")) doAction("change_role", u.id, { role: "admin" }); }}
                            disabled={acting === u.id}
                            className="px-2 py-1 text-[10px] rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                          >
                            Make Admin
                          </button>
                        )}
                        {u.role === "admin" && (
                          <button
                            onClick={() => { if (confirm("Remove admin role?")) doAction("change_role", u.id, { role: "creator" }); }}
                            disabled={acting === u.id}
                            className="px-2 py-1 text-[10px] rounded bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 hover:bg-neutral-500/20 transition-colors"
                          >
                            Remove Admin
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {(data?.users || []).length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-neutral-500">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {data && data.total > data.limit && (
            <div className="flex gap-2 justify-center pt-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 text-xs rounded border border-neutral-700 text-neutral-400 hover:text-white disabled:opacity-30">Prev</button>
              <span className="px-3 py-1 text-xs text-neutral-400">Page {page} of {Math.ceil(data.total / data.limit)}</span>
              <button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(data.total / data.limit)} className="px-3 py-1 text-xs rounded border border-neutral-700 text-neutral-400 hover:text-white disabled:opacity-30">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProfilesSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ section: "profiles", page: String(page) });
    if (search) params.set("q", search);
    fetch(`/api/admin/dashboard?${params}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const deleteProfile = async (profileId: string) => {
    if (!confirm("Delete this creator profile? This cannot be undone.")) return;
    setActing(profileId);
    await fetch("/api/admin/dashboard", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_profile", profileId }),
    });
    setActing(null);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Creator Profiles</h2>
        <input
          type="text"
          placeholder="Search by handle or name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 min-h-[48px] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 w-full sm:w-72"
        />
      </div>

      {loading && !data ? <Loader /> : (
        <>
          <div className="text-xs text-neutral-500">{data?.total || 0} profiles total</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-neutral-400 uppercase tracking-wider border-b border-neutral-700/50">
                  <th className="pb-2 pr-3">Handle</th>
                  <th className="pb-2 pr-3">Platform</th>
                  <th className="pb-2 pr-3">Followers</th>
                  <th className="pb-2 pr-3">Score</th>
                  <th className="pb-2 pr-3">Claimed</th>
                  <th className="pb-2 pr-3">Created</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.profiles || []).map((p: any) => (
                  <tr key={p.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                    <td className="py-2.5 pr-3">
                      <span className="text-blue-400 font-medium">@{p.platform_handle}</span>
                      {p.display_name && <div className="text-xs text-neutral-500">{p.display_name}</div>}
                    </td>
                    <td className="py-2.5 pr-3 text-neutral-400 text-xs">{p.platform}</td>
                    <td className="py-2.5 pr-3 text-white">{Number(p.follower_count).toLocaleString()}</td>
                    <td className="py-2.5 pr-3">
                      <span className="text-amber-400 font-medium">{p.creator_score}</span>
                    </td>
                    <td className="py-2.5 pr-3">
                      {p.claimed_by ? (
                        <span className="text-emerald-400 text-xs">Claimed</span>
                      ) : (
                        <span className="text-neutral-500 text-xs">Unclaimed</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 text-neutral-400 text-xs">{fmtDate(p.created_at)}</td>
                    <td className="py-2.5">
                      <button
                        onClick={() => deleteProfile(p.id)}
                        disabled={acting === p.id}
                        className="px-2 py-1 text-[10px] rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {(data?.profiles || []).length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-neutral-500">No profiles found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {data && data.total > data.limit && (
            <div className="flex gap-2 justify-center pt-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 text-xs rounded border border-neutral-700 text-neutral-400 hover:text-white disabled:opacity-30">Prev</button>
              <span className="px-3 py-1 text-xs text-neutral-400">Page {page} of {Math.ceil(data.total / data.limit)}</span>
              <button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(data.total / data.limit)} className="px-3 py-1 text-xs rounded border border-neutral-700 text-neutral-400 hover:text-white disabled:opacity-30">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RevenueSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard?section=revenue")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!data) return <div className="text-neutral-400">Failed to load revenue</div>;

  const { totals, topCreators } = data;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Revenue</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Fees" value={fmt(Number(totals.total_fees))} />
        <StatCard label="Total GMV" value={fmt(Number(totals.total_gmv))} />
        <StatCard label="This Month" value={fmt(Number(totals.fees_this_month))} />
        <StatCard label="Avg Deal" value={fmt(Number(totals.avg_deal_size))} />
        <StatCard label="Completed Deals" value={Number(totals.completed_count).toLocaleString()} />
      </div>

      <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Top Earning Creators</h3>
        {topCreators.length === 0 ? (
          <div className="text-sm text-neutral-500">No completed deals yet</div>
        ) : (
          <div className="space-y-2">
            {topCreators.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-neutral-900/50">
                <div className="flex items-center gap-3">
                  <span className="text-neutral-500 text-xs w-5">{i + 1}.</span>
                  <div>
                    <span className="text-blue-400 font-medium">@{c.creator_handle}</span>
                    <span className="text-neutral-500 text-xs ml-1">({c.creator_platform})</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{fmt(Number(c.total_earned))}</div>
                  <div className="text-neutral-500 text-xs">{c.deal_count} deal{c.deal_count > 1 ? "s" : ""}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsSection() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/dashboard?section=settings")
      .then((r) => r.json())
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (key: string) => {
    const current = settings[key] !== "false";
    setSaving(true);
    await fetch("/api/admin/dashboard", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_settings", settings: { [key]: current ? "false" : "true" } }),
    });
    setSettings((prev) => ({ ...prev, [key]: current ? "false" : "true" }));
    setSaving(false);
  };

  if (loading) return <Loader />;

  const toggles = [
    { key: "marketplace_open", label: "Marketplace Open", desc: "Allow users to browse and discover creators" },
    { key: "rankings_open", label: "Creator Rankings Open", desc: "Show public leaderboard page" },
    { key: "x_bot_enabled", label: "X Bot Enabled", desc: "Auto-reply to mentions on X / Twitter" },
    { key: "ig_bot_enabled", label: "Instagram Bot Enabled", desc: "Auto-reply to comments on Instagram" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Site Settings</h2>
      <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl divide-y divide-neutral-700/50">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between p-4 sm:p-5">
            <div>
              <div className="text-sm font-medium text-white">{t.label}</div>
              <div className="text-xs text-neutral-400 mt-0.5">{t.desc}</div>
            </div>
            <Toggle
              enabled={settings[t.key] !== "false"}
              onToggle={() => !saving && toggle(t.key)}
              label=""
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ImportProfileSection() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const doImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/admin/import-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const copyClaimLink = () => {
    if (result?.claimUrl) {
      navigator.clipboard.writeText(result.claimUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Import Profile</h2>
      <p className="text-sm text-neutral-400">Import a creator profile from Linktree, Stan Store, or Hoo.be. The page will be scraped and a new creator profile will be created.</p>

      <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            placeholder="Enter Linktree, Stan Store, or Hoo.be URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && doImport()}
            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 min-h-[48px] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={doImport}
            disabled={loading || !url.trim()}
            className="px-6 py-3 min-h-[48px] bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            {loading ? "Importing..." : "Import"}
          </button>
        </div>

        <div className="text-xs text-neutral-500">
          Supported: linktr.ee/username, stan.store/username, hoo.be/username
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-4">
            {result.avatar && (
              <img src={result.avatar} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/30" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-lg">{result.name}</div>
              {result.bio && <div className="text-neutral-400 text-sm mt-1 line-clamp-2">{result.bio}</div>}
              <div className="flex gap-4 mt-2 text-xs text-neutral-500">
                <span>{result.socialsCount} social link{result.socialsCount !== 1 ? "s" : ""}</span>
                <span>{result.bioLinksCount} bio link{result.bioLinksCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-neutral-400">Profile: </span>
              <a href={result.profileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                {result.profileUrl}
              </a>
            </div>
            <div className="text-sm">
              <span className="text-neutral-400">Claim link: </span>
              <span className="text-white font-mono text-xs">{result.claimUrl}</span>
            </div>
          </div>

          <button
            onClick={copyClaimLink}
            className="px-4 py-2 min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {copied ? "Copied!" : "Copy Claim Link"}
          </button>
        </div>
      )}
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ─── Main Page ──────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const [section, setSection] = useState<Section>("overview");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.role === "admin") {
          setAuthed(true);
        } else {
          router.push("/dashboard");
        }
      })
      .catch(() => router.push("/"))
      .finally(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) return null;

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800 sticky top-0 z-40">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 min-h-[48px] min-w-[48px] flex items-center justify-center hover:bg-neutral-800 rounded-lg">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {sidebarOpen ? <path d="M4 4l12 12M4 16L16 4" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
          </svg>
        </button>
        <span className="text-sm font-semibold">Admin Dashboard</span>
        <Link href="/dashboard" className="text-xs text-blue-400 hover:text-blue-300">Back</Link>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 bg-neutral-950 border-r border-neutral-800
          flex flex-col z-50 transition-transform lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="p-5 border-b border-neutral-800">
            <Link href="/dashboard" className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              Back to Dashboard
            </Link>
            <div className="mt-3 text-lg font-bold text-white">Admin</div>
            <div className="text-xs text-neutral-500">HireACreator.ai</div>
          </div>

          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => { setSection(item.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-sm transition-colors ${
                  section === item.key
                    ? "bg-blue-500/10 text-blue-400 font-medium"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-neutral-800">
            <div className="text-[10px] text-neutral-600 uppercase tracking-wider">Admin Panel v1.0</div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen p-4 sm:p-6 lg:p-8 max-w-6xl">
          {section === "overview" && <OverviewSection />}
          {section === "bots" && <BotsSection />}
          {section === "offers" && <OffersSection />}
          {section === "users" && <UsersSection />}
          {section === "profiles" && <ProfilesSection />}
          {section === "import" && <ImportProfileSection />}
          {section === "revenue" && <RevenueSection />}
          {section === "settings" && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}
