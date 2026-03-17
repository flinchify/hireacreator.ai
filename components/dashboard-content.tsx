"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, User } from "./auth-context";
import { Button } from "./ui/button";
import { CalendarManager } from "./calendar-manager";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { PlatformIcon } from "./icons/platforms";
import Link from "next/link";

/* ───── helpers ───── */

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function StarIcon({ filled = true }: { filled?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={filled ? "text-amber-400" : "text-neutral-300"}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-500 shrink-0">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
      PRO
    </span>
  );
}

function OnlineIndicator() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      Online now
    </span>
  );
}

/* ───── Bottom Sheet / Panel for mobile ───── */
function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" style={{ animation: "sheetFadeIn 0.15s ease-out" }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-white rounded-t-2xl shadow-2xl overflow-y-auto sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full sm:rounded-2xl sm:max-h-[85vh]"
        style={{ animation: "sheetSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-5 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <h3 className="font-display font-bold text-neutral-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ───── Edit Profile Sheet ───── */
function EditProfileSheet({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  const { refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    full_name: user.name || "",
    slug: user.slug || "",
    headline: user.headline || "",
    bio: user.bio || "",
    location: user.location || "",
    category: user.category || "",
    hourly_rate: user.hourlyRate?.toString() || "",
    website_url: user.websiteUrl || "",
    business_name: user.businessName || "",
    business_url: user.businessUrl || "",
    is_online: user.isOnline,
  });

  async function save() {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null }),
    });
    if (res.ok) {
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  const categories = [
    "UGC Creator","Video Editor","Photographer","Graphic Designer",
    "Social Media Manager","Copywriter","Brand Strategist","Motion Designer",
    "Consultant","Automotive","Education / Tech","Influencer","Developer","Music Producer",
  ];

  return (
    <Sheet open={open} onClose={onClose} title="Edit Profile">
      <div className="space-y-4">
        <Input label="Display Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
        <Input label="Username" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="your-name" />
        <Input label="Headline" value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })} placeholder="UGC Creator & Photographer" />
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Bio</label>
          <textarea
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-y text-neutral-900"
            rows={4}
            placeholder="Tell brands about yourself..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Sydney, AU" />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900">
              <option value="">Select</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <Input label="Hourly Rate ($)" type="number" value={form.hourly_rate} onChange={e => setForm({ ...form, hourly_rate: e.target.value })} placeholder="150" />
        <Input label="Website" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} placeholder="https://yoursite.com" />
        <Input label="Business Name" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} placeholder="My Agency" />
        <Input label="Business URL" value={form.business_url} onChange={e => setForm({ ...form, business_url: e.target.value })} placeholder="https://mybusiness.com" />
        <div className="flex items-center gap-3 py-2">
          <button
            onClick={() => setForm({ ...form, is_online: !form.is_online })}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.is_online ? "bg-emerald-500" : "bg-neutral-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_online ? "translate-x-5" : ""}`} />
          </button>
          <span className="text-sm text-neutral-700">Show as online</span>
        </div>
        <Button onClick={save} disabled={saving} className="w-full">
          {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </Sheet>
  );
}

/* ───── Social Links Sheet ───── */
function SocialsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [socials, setSocials] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ platform: "", handle: "", url: "" });

  useEffect(() => {
    if (open) {
      fetch("/api/profile").then(r => r.json()).then(d => setSocials(d.socials || [])).catch(() => {});
    }
  }, [open]);

  async function add() {
    if (!form.platform || !form.handle) return;
    setAdding(true);
    const res = await fetch("/api/profile/socials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.id) {
      setSocials([...socials, { ...form, id: data.id }]);
      setForm({ platform: "", handle: "", url: "" });
    }
    setAdding(false);
  }

  async function remove(id: string) {
    await fetch(`/api/profile/socials?id=${id}`, { method: "DELETE" });
    setSocials(socials.filter(s => s.id !== id));
  }

  const platforms = ["instagram","tiktok","youtube","twitter","linkedin","twitch","spotify","pinterest","facebook","snapchat","discord","github","reddit","website","other"];

  return (
    <Sheet open={open} onClose={onClose} title="Social Links">
      <div className="space-y-4">
        {socials.map((s: any) => (
          <div key={s.id} className="flex items-center gap-3 bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
            <PlatformIcon platform={s.platform} size={20} className="text-neutral-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-neutral-900 capitalize">{s.platform}</div>
              <div className="text-xs text-neutral-500 truncate">{s.handle}</div>
            </div>
            <button onClick={() => remove(s.id)} className="text-xs text-red-500 hover:text-red-700 shrink-0">Remove</button>
          </div>
        ))}
        {socials.length === 0 && <p className="text-sm text-neutral-400 text-center py-4">No social links yet. Add your first one below.</p>}

        <div className="border-t border-neutral-100 pt-4 space-y-3">
          <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900">
            <option value="">Choose platform...</option>
            {platforms.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <Input placeholder="@handle or username" value={form.handle} onChange={e => setForm({ ...form, handle: e.target.value })} />
          <Input placeholder="Profile URL (optional)" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
          <Button onClick={add} disabled={adding || !form.platform || !form.handle} className="w-full" variant="outline">
            {adding ? "Adding..." : "Add Link"}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

/* ───── Services Sheet ───── */
function ServicesSheet({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  const [services, setServices] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: "", delivery_days: "7", category: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      fetch("/api/profile").then(r => r.json()).then(d => setServices(d.services || [])).catch(() => {});
    }
  }, [open]);

  async function add() {
    if (!form.title || !form.price) return;
    setAdding(true);
    setError("");
    const res = await fetch("/api/profile/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        delivery_days: Number(form.delivery_days) || 7,
        category: form.category || null,
      }),
    });
    const data = await res.json();
    if (data.id) {
      setServices([...services, { ...form, id: data.id, price: Number(form.price) }]);
      setForm({ title: "", description: "", price: "", delivery_days: "7", category: "" });
    } else if (data.error) {
      setError(data.message || "Error adding service");
    }
    setAdding(false);
  }

  async function remove(id: string) {
    await fetch(`/api/profile/services?id=${id}`, { method: "DELETE" });
    setServices(services.filter(s => s.id !== id));
  }

  return (
    <Sheet open={open} onClose={onClose} title="Manage Services">
      <div className="space-y-4">
        <p className="text-xs text-neutral-500">
          {user.isPro ? "Unlimited services with Pro." : `Free: ${services.length}/3 services. Upgrade to Pro for unlimited.`}
        </p>

        {services.map((s: any) => (
          <div key={s.id} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-neutral-900 text-sm">{s.title}</div>
                {s.description && <div className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{s.description}</div>}
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-neutral-900 text-sm">{Number(s.price) === 0 ? "Open" : `$${Number(s.price).toLocaleString()}`}</div>
                <div className="text-[10px] text-neutral-400">{s.delivery_days || 7}d</div>
              </div>
            </div>
            <button onClick={() => remove(s.id)} className="text-xs text-red-500 hover:text-red-700 mt-2">Delete</button>
          </div>
        ))}

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <div className="border-t border-neutral-100 pt-4 space-y-3">
          <h4 className="text-sm font-medium text-neutral-900">Add Service</h4>
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="UGC Video Package" />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-y text-neutral-900"
              rows={2}
              placeholder="What's included..."
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Price ($)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="500" />
            <Input label="Days" type="number" value={form.delivery_days} onChange={e => setForm({ ...form, delivery_days: e.target.value })} />
            <Input label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="UGC" />
          </div>
          <Button onClick={add} disabled={adding || !form.title || !form.price} className="w-full">
            {adding ? "Adding..." : "Add Service"}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

/* ───── Image Upload Button ───── */
function ImageUploadButton({ type, onUploaded }: { type: "avatar" | "cover"; onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) onUploaded();
    setUploading(false);
  }

  return (
    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-full hover:bg-neutral-100 hover:border-neutral-300 transition-all shadow-sm cursor-pointer active:scale-95">
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />
      {uploading ? (
        <div className="w-3.5 h-3.5 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
      )}
      {uploading ? "Uploading..." : type === "cover" ? "Upload Banner" : "Upload Photo"}
    </label>
  );
}

/* ───── Edit Button ───── */
function EditButton({ onClick, label }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-full hover:bg-neutral-100 hover:border-neutral-300 transition-all shadow-sm active:scale-95"
    >
      <PencilIcon />
      {label || "Edit"}
    </button>
  );
}

/* ───── Referral Program ───── */
function ReferralSection() {
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referrals").then(r => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data || !data.referralCode) return null;

  function copy() {
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-base sm:text-lg font-semibold text-neutral-900">Referral Program</h2>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">20% recurring</span>
      </div>

      <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
        Earn 20% of every subscription payment as platform credits from people you refer — for 12 months. Use credits toward your own Pro plan, animations, or boosted listings.
      </p>

      {/* Referral link */}
      <div className="flex items-center gap-2 mb-4">
        <input readOnly value={data.referralLink} className="flex-1 text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-neutral-600 truncate" />
        <Button onClick={copy} size="sm" variant={copied ? "secondary" : "primary"}>
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center py-2.5 bg-neutral-50 rounded-xl">
          <div className="font-display text-lg font-bold text-neutral-900">{data.stats.totalReferrals}</div>
          <div className="text-[10px] text-neutral-500">Referred</div>
        </div>
        <div className="text-center py-2.5 bg-neutral-50 rounded-xl">
          <div className="font-display text-lg font-bold text-emerald-600">{data.stats.activePaying}</div>
          <div className="text-[10px] text-neutral-500">Paying</div>
        </div>
        <div className="text-center py-2.5 bg-neutral-50 rounded-xl">
          <div className="font-display text-lg font-bold text-emerald-600">${((data.stats.creditBalanceCents || 0) / 100).toFixed(2)}</div>
          <div className="text-[10px] text-neutral-500">Credits</div>
        </div>
      </div>

      {data.stats.monthlyEstimateCents > 0 && (
        <div className="text-center py-2 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
          <div className="text-xs text-emerald-700 font-medium">Estimated monthly: <span className="font-bold">${(data.stats.monthlyEstimateCents / 100).toFixed(2)}/mo</span></div>
        </div>
      )}

      {/* Referral list */}
      {data.referrals.length > 0 && (
        <div className="border-t border-neutral-100 pt-3 space-y-2">
          <h3 className="text-xs font-medium text-neutral-500 mb-2">Your referrals</h3>
          {data.referrals.slice(0, 5).map((r: any) => (
            <div key={r.id} className="flex items-center gap-2.5 py-1.5">
              {r.avatar ? <img src={r.avatar} alt="" className="w-7 h-7 rounded-full object-cover" /> : <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center"><span className="text-[10px] font-bold text-neutral-400">{(r.name || "?")[0]}</span></div>}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-neutral-900 truncate">{r.name}</div>
                <div className="text-[10px] text-neutral-400">{r.tier === "free" ? "Free" : r.tier} · ${(r.totalEarnedCents / 100).toFixed(2)} credited</div>
              </div>
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${r.status === "active" ? "bg-emerald-100 text-emerald-700" : r.status === "churned" ? "bg-red-100 text-red-700" : "bg-neutral-100 text-neutral-500"}`}>
                {r.status === "signed_up" ? "Free" : r.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="text-[9px] text-neutral-300 mt-4 leading-relaxed">
        Referral credits can be applied to subscriptions, animations, and boosted listings. Credits are non-transferable and have no cash value. Referral program terms are subject to change.
      </p>
    </Card>
  );
}

/* ───── Main Dashboard ───── */
export function DashboardContent() {
  const { user, loading, refreshUser } = useAuth();
  const [editProfile, setEditProfile] = useState(false);
  const [editSocials, setEditSocials] = useState(false);
  const [editServices, setEditServices] = useState(false);
  const [socials, setSocials] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const loadData = useCallback(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => {
        if (d.socials) setSocials(d.socials);
        if (d.services) setServices(d.services);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // Refresh data when sheets close
  useEffect(() => {
    if (!editSocials && !editServices && user) loadData();
  }, [editSocials, editServices, user, loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold text-neutral-900 mb-3">Sign in to continue</h2>
          <p className="text-sm text-neutral-500 mb-6">You need an account to access the dashboard.</p>
          <Link href="/"><Button>Go Home</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Cover with upload */}
      <div className="relative h-40 sm:h-64">
        {user.cover ? (
          <img src={user.cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-20 sm:top-24 right-4">
          <ImageUploadButton type="cover" onUploaded={() => refreshUser()} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Avatar + Name Row */}
        <div className="relative -mt-14 sm:-mt-18 flex flex-col sm:flex-row sm:items-end sm:gap-5 pb-6">
          <div className="relative group">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white object-cover shadow-lg" />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center shadow-lg">
                <span className="text-2xl sm:text-3xl font-bold text-neutral-400">{user.name?.charAt(0) || "?"}</span>
              </div>
            )}
            {/* Avatar upload overlay */}
            <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 rounded-2xl cursor-pointer transition-all opacity-0 group-hover:opacity-100">
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("file", file);
                fd.append("type", "avatar");
                await fetch("/api/upload", { method: "POST", body: fd });
                refreshUser();
              }} />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
            </label>
            {user.isOnline && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 sm:h-5 sm:w-5 bg-emerald-500 border-2 border-white" />
              </span>
            )}
          </div>

          <div className="mt-3 sm:mt-0 sm:pb-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 truncate">{user.name}</h1>
              {user.isVerified && <VerifiedBadge />}
              {user.isPro && <ProBadge />}
            </div>
            {user.headline && <p className="text-neutral-600 text-sm mt-0.5">{user.headline}</p>}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {user.category && <Badge>{user.category}</Badge>}
              {user.location && (
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {user.location}
                </span>
              )}
              {user.isOnline && <OnlineIndicator />}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 sm:mt-0 sm:pb-1 flex gap-2 flex-wrap">
            <EditButton onClick={() => setEditProfile(true)} label="Edit Profile" />
            {user.slug && (
              <>
                <Link href={`/u/${user.slug}`}>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-full hover:bg-neutral-100 transition-all shadow-sm active:scale-95">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Link in Bio
                  </button>
                </Link>
                <Link href={`/creators/${user.slug}`}>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-full hover:bg-neutral-100 transition-all shadow-sm active:scale-95">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    Full Profile
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Main grid — mirrors the creator profile layout */}
        <div className="grid lg:grid-cols-3 gap-6 pb-20">
          {/* Left column (main) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Marketplace eligibility banner */}
            {(() => {
              const hasAvatar = !!user.avatar;
              const hasEmail = !!(user as any).emailVerified;
              const hasSocials = socials && socials.length > 0;
              const eligible = hasAvatar && hasEmail && hasSocials;
              if (eligible) return null;
              const missing: string[] = [];
              if (!hasAvatar) missing.push("profile picture");
              if (!hasEmail) missing.push("verified email");
              if (!hasSocials) missing.push("social media link");
              return (
                <Card className="p-4 border-amber-200 bg-amber-50/50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900">Not visible on marketplace yet</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">To be discoverable by brands, add: <strong>{missing.join(", ")}</strong></p>
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* Stats */}
            <Card className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="font-display text-xl sm:text-2xl font-bold text-neutral-900">{user.totalProjects}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">Projects</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <StarIcon />
                    <span className="font-display text-xl sm:text-2xl font-bold text-neutral-900">{user.rating > 0 ? user.rating.toFixed(1) : "—"}</span>
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">Rating</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-xl sm:text-2xl font-bold text-neutral-900">{user.reviewCount}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-xl sm:text-2xl font-bold text-neutral-900">
                    {user.hourlyRate ? `$${user.hourlyRate}` : "—"}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">Per hour</div>
                </div>
              </div>
            </Card>

            {/* About section */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base sm:text-lg font-semibold text-neutral-900">About</h2>
                <EditButton onClick={() => setEditProfile(true)} />
              </div>
              {user.bio ? (
                <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line">{user.bio}</p>
              ) : (
                <p className="text-neutral-400 text-sm italic">Add a bio to tell brands about yourself...</p>
              )}

              {/* Social links */}
              <div className="mt-5 pt-5 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-neutral-700">Social Links</h3>
                  <EditButton onClick={() => setEditSocials(true)} />
                </div>
                {socials.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {socials.map((s: any) => (
                      <div key={s.id} className="flex items-center gap-2 bg-neutral-50 rounded-xl px-3 py-2 border border-neutral-100 text-sm">
                        <PlatformIcon platform={s.platform} size={18} className="text-neutral-500" />
                        <span className="text-neutral-700 text-xs">{s.handle}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button onClick={() => setEditSocials(true)} className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">
                    + Add your social links
                  </button>
                )}
              </div>
            </Card>

            {/* Pro upsell */}
            {!user.isPro && (
              <Card className="p-4 sm:p-6 border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-neutral-900 text-sm">Upgrade to Pro</h3>
                    <p className="text-xs text-neutral-600 mt-1">Unlimited services, custom domain, priority search, advanced analytics, verified badge priority.</p>
                    <Link href="/pricing" className="inline-block mt-3">
                      <Button size="sm">View Plans — from $19/mo</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* Analytics preview */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base sm:text-lg font-semibold text-neutral-900">Analytics</h2>
                {!user.isPro && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">PRO</span>
                )}
              </div>
              {user.isPro ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center py-3 bg-neutral-50 rounded-xl">
                    <div className="font-display text-lg font-bold text-neutral-900">—</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Views (30d)</div>
                  </div>
                  <div className="text-center py-3 bg-neutral-50 rounded-xl">
                    <div className="font-display text-lg font-bold text-neutral-900">—</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Inquiries</div>
                  </div>
                  <div className="text-center py-3 bg-neutral-50 rounded-xl">
                    <div className="font-display text-lg font-bold text-neutral-900">—</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Conversion</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-neutral-400 mb-3">Upgrade to Pro to see who's viewing your profile and how they find you.</p>
                  <Link href="/pricing"><Button size="sm" variant="outline">Unlock Analytics</Button></Link>
                </div>
              )}
            </Card>

            {/* Referral Program */}
            <ReferralSection />
          </div>

          {/* Right column (sidebar) — services + quick actions */}
          <div className="space-y-6">
            {/* Services */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-base sm:text-lg font-semibold text-neutral-900">Services</h2>
                <EditButton onClick={() => setEditServices(true)} label="Manage" />
              </div>
              {services.length > 0 ? (
                <div className="space-y-3">
                  {services.map((s: any) => (
                    <Card key={s.id} className="p-4">
                      <h3 className="font-semibold text-neutral-900 text-sm">{s.title}</h3>
                      {s.category && <span className="inline-block mt-0.5 text-[10px] font-medium text-neutral-400 uppercase tracking-wider">{s.category}</span>}
                      {s.description && <p className="text-xs text-neutral-500 mt-1.5 line-clamp-2">{s.description}</p>}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-100">
                        <span className="font-display font-bold text-neutral-900 text-sm">
                          {Number(s.price) === 0 ? "Open to offers" : `$${Number(s.price).toLocaleString()}`}
                        </span>
                        <span className="text-[10px] text-neutral-400">{s.delivery_days || 7}d delivery</span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-5 text-center">
                  <p className="text-sm text-neutral-400 mb-3">No services yet.</p>
                  <Button onClick={() => setEditServices(true)} size="sm" variant="outline">Add Your First Service</Button>
                </Card>
              )}
            </div>

            {/* Link in Bio — quick access */}
            <Card className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-neutral-900 text-sm">Link in Bio</h3>
                <Link href="/dashboard/link-in-bio" className="text-[11px] text-blue-600 hover:text-blue-800 font-medium">Edit →</Link>
              </div>
              <p className="text-xs text-neutral-400 mb-3">Template, background, button style, colors</p>
              <Link href="/dashboard/link-in-bio" className="block w-full py-2.5 bg-neutral-900 text-white text-xs font-medium text-center rounded-xl hover:bg-neutral-800 transition-colors">
                Open Editor
              </Link>
            </Card>

            {/* Calendar */}
            <Card className="p-4 sm:p-5">
              <CalendarManager />
            </Card>

            {/* Quick actions */}
            <Card className="p-4 sm:p-5">
              <h3 className="font-display font-semibold text-neutral-900 text-sm mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/dashboard/link-in-bio" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 group-hover:bg-neutral-200 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Edit Link in Bio</div>
                    <div className="text-[10px] text-neutral-400">Templates, backgrounds, buttons</div>
                  </div>
                </Link>
                <Link href="/animations" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 group-hover:bg-neutral-200 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Profile Animations</div>
                    <div className="text-[10px] text-neutral-400">Stand out with effects</div>
                  </div>
                </Link>
                <Link href="/pricing" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 group-hover:bg-neutral-200 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Upgrade Plan</div>
                    <div className="text-[10px] text-neutral-400">Unlock Pro features</div>
                  </div>
                </Link>
                <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 group-hover:bg-neutral-200 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Settings</div>
                    <div className="text-[10px] text-neutral-400">Account, security, privacy</div>
                  </div>
                </Link>
              </div>
            </Card>

            {/* Admin — only for admin role */}
            {user.role === "admin" && (
              <Card className="p-4 sm:p-5 border-purple-200 bg-purple-50/30">
                <h3 className="font-display font-semibold text-neutral-900 text-sm mb-3 flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-bold rounded-full uppercase">Admin</span>
                  Admin Panel
                </h3>
                <div className="space-y-2">
                  <Link href="/dashboard/settings?tab=admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-900">Users</div>
                      <div className="text-[10px] text-neutral-400">Manage, ban, export CSV</div>
                    </div>
                  </Link>
                  <Link href="/dashboard/settings?tab=admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-900">Marketplace Toggle</div>
                      <div className="text-[10px] text-neutral-400">Open/close the marketplace</div>
                    </div>
                  </Link>
                </div>
              </Card>
            )}

            {/* Your Links */}
            {user.slug && (
              <Card className="p-4 sm:p-5">
                <h3 className="font-display font-semibold text-neutral-900 text-sm mb-3">Your Links</h3>
                <div className="space-y-3">
                  {/* Link in Bio */}
                  <div>
                    <label className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Link in Bio</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input readOnly value={`hireacreator.ai/u/${user.slug}`} className="flex-1 text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-neutral-600 truncate" />
                      <Button variant="secondary" size="sm" onClick={() => navigator.clipboard?.writeText(`https://hireacreator.ai/u/${user.slug}`)}>Copy</Button>
                    </div>
                    <Link href={`/u/${user.slug}`} className="inline-block mt-1.5 text-[11px] text-blue-600 hover:text-blue-800 transition-colors">Preview your link in bio →</Link>
                  </div>
                  {/* Full Profile */}
                  <div>
                    <label className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Full Profile</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input readOnly value={`hireacreator.ai/creators/${user.slug}`} className="flex-1 text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-neutral-600 truncate" />
                      <Button variant="secondary" size="sm" onClick={() => navigator.clipboard?.writeText(`https://hireacreator.ai/creators/${user.slug}`)}>Copy</Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Connected socials summary */}
            {socials.length > 0 && (
              <Card className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-neutral-900 text-sm">Connected</h3>
                  <EditButton onClick={() => setEditSocials(true)} label="Edit" />
                </div>
                <div className="space-y-2">
                  {socials.map((s: any) => (
                    <a key={s.id} href={s.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-50 transition-colors">
                      <PlatformIcon platform={s.platform} size={18} className="text-neutral-500 shrink-0" />
                      <span className="text-xs text-neutral-700 truncate">{s.handle}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-300 shrink-0 ml-auto"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </a>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit sheets */}
      <EditProfileSheet user={user} open={editProfile} onClose={() => setEditProfile(false)} />
      <SocialsSheet open={editSocials} onClose={() => setEditSocials(false)} />
      <ServicesSheet user={user} open={editServices} onClose={() => setEditServices(false)} />

      <style>{`
        @keyframes sheetFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sheetSlideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 640px) {
          @keyframes sheetSlideUp {
            from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
        }
      `}</style>
    </div>
  );
}
