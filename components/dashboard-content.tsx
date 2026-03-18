"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, User } from "./auth-context";
import { CalendarManager } from "./calendar-manager";
import { LinkManager } from "./link-manager";
import { PlatformIcon } from "./icons/platforms";
import { MessagesContent } from "./messages-content";
import { AnimationsContent } from "./animations-content";
import Link from "next/link";

/* ═══ Icons ═══ */
const icons = {
  pencil: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  link: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round"/></svg>,
  services: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg>,
  messages: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  overview: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  external: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round"/></svg>,
  share: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>,
  camera: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>,
  sparkle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" strokeLinecap="round"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>,
};

/* ═══ Bottom Sheet ═══ */
function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" style={{ animation: "fadeIn .15s ease-out" }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-white rounded-t-2xl shadow-2xl overflow-y-auto sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full sm:rounded-2xl sm:max-h-[85vh]" style={{ animation: "slideUp .2s cubic-bezier(.16,1,.3,1)" }}>
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-5 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <h3 className="font-display font-bold text-neutral-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400">{icons.close}</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ═══ Edit Profile Sheet ═══ */
function EditProfileSheet({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  const { refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    full_name: user.name || "", slug: user.slug || "", headline: user.headline || "",
    bio: user.bio || "", location: user.location || "", category: user.category || "",
    hourly_rate: user.hourlyRate?.toString() || "", website_url: user.websiteUrl || "",
    business_name: user.businessName || "", business_url: user.businessUrl || "",
    is_online: user.isOnline,
  });

  async function save() {
    setSaving(true);
    const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null }) });
    if (res.ok) { await refreshUser(); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  }

  const categories = ["UGC Creator","Video Editor","Photographer","Graphic Designer","Social Media Manager","Copywriter","Brand Strategist","Motion Designer","Consultant","Automotive","Education / Tech","Influencer","Developer","Music Producer"];
  const inp = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 text-neutral-900 bg-white";

  return (
    <Sheet open={open} onClose={onClose} title="Edit Profile">
      <div className="space-y-4">
        <div><label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Display Name</label><input className={inp} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
        <div><label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Username</label><input className={inp} value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="your-name" /></div>
        <div><label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Headline</label><input className={inp} value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })} placeholder="UGC Creator & Photographer" /></div>
        <div><label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Bio</label><textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className={`${inp} resize-y`} rows={4} placeholder="Tell brands about yourself..." /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Location</label><input className={inp} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Sydney, AU" /></div>
          <div><label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inp}><option value="">Select</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        </div>
        <div><label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Hourly Rate ($)</label><input type="number" className={inp} value={form.hourly_rate} onChange={e => setForm({ ...form, hourly_rate: e.target.value })} placeholder="150" /></div>
        <div><label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Website</label><input className={inp} value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} placeholder="https://yoursite.com" /></div>
        <div><label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Business Name</label><input className={inp} value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} placeholder="My Agency" /></div>
        <div className="flex items-center gap-3 py-2">
          <button onClick={() => setForm({ ...form, is_online: !form.is_online })} className={`relative w-11 h-6 rounded-full transition-colors ${form.is_online ? "bg-emerald-500" : "bg-neutral-300"}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_online ? "translate-x-5" : ""}`} />
          </button>
          <span className="text-sm text-neutral-700">Show as online</span>
        </div>
        <button onClick={save} disabled={saving} className="w-full py-3 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50">{saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}</button>
      </div>
    </Sheet>
  );
}

/* ═══ Social Links Sheet ═══ */
function SocialsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [socials, setSocials] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");
  const [form, setForm] = useState({ platform: "", handle: "", url: "" });
  const inp = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 bg-white";

  useEffect(() => { if (open) fetch("/api/profile").then(r => r.json()).then(d => setSocials(d.socials || [])).catch(() => {}); }, [open]);

  async function add() {
    if (!form.platform || !form.handle) return;
    setAdding(true);
    const res = await fetch("/api/profile/socials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.id) { setSocials([...socials, { ...form, id: data.id, follower_count: 0 }]); setForm({ platform: "", handle: "", url: "" }); }
    setAdding(false);
  }

  async function remove(id: string) {
    await fetch(`/api/profile/socials?id=${id}`, { method: "DELETE" });
    setSocials(socials.filter(s => s.id !== id));
  }

  async function refreshFollowers() {
    setRefreshing(true);
    setRefreshMsg("");
    try {
      const res = await fetch("/api/profile/refresh-followers", { method: "POST" });
      const data = await res.json();
      if (res.status === 429) { setRefreshMsg(data.message || "Try again later"); return; }
      if (data.updated) {
        setSocials(prev => prev.map(s => {
          const match = data.updated.find((u: any) => u.id === s.id);
          return match && match.follower_count !== null ? { ...s, follower_count: match.follower_count } : s;
        }));
        setRefreshMsg("Followers updated!");
      }
    } catch { setRefreshMsg("Failed to refresh"); }
    finally { setRefreshing(false); }
  }

  const platforms = ["instagram","tiktok","youtube","twitter","linkedin","twitch","spotify","pinterest","snapchat","kick","discord","github","website"];

  return (
    <Sheet open={open} onClose={onClose} title="Social Links">
      <div className="space-y-3">
        {socials.map((s: any) => (
          <div key={s.id} className="flex items-center gap-3 bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
            <PlatformIcon platform={s.platform} size={20} className="text-neutral-500 shrink-0" />
            <div className="flex-1 min-w-0"><div className="text-sm font-medium text-neutral-900 capitalize">{s.platform}</div><div className="text-xs text-neutral-500 truncate">{s.handle}{s.follower_count > 0 ? ` · ${s.follower_count >= 1000000 ? (s.follower_count/1000000).toFixed(1)+'M' : s.follower_count >= 1000 ? Math.round(s.follower_count/1000)+'K' : s.follower_count} followers` : ''}</div></div>
            <button onClick={() => remove(s.id)} className="text-xs text-red-500 hover:text-red-700 shrink-0">Remove</button>
          </div>
        ))}
        {socials.length === 0 && <p className="text-sm text-neutral-400 text-center py-4">No social links yet.</p>}
        {socials.length > 0 && (
          <div className="flex items-center gap-2">
            <button onClick={refreshFollowers} disabled={refreshing} className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-40 flex items-center gap-1">
              <svg className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {refreshing ? "Refreshing..." : "Refresh followers"}
            </button>
            {refreshMsg && <span className="text-xs text-neutral-400">{refreshMsg}</span>}
          </div>
        )}
        <div className="border-t border-neutral-100 pt-4 space-y-3">
          <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className={inp}><option value="">Choose platform...</option>{platforms.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}</select>
          <input placeholder="@handle or username" value={form.handle} onChange={e => setForm({ ...form, handle: e.target.value })} className={inp} />
          <input placeholder="Profile URL (optional)" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className={inp} />
          <button onClick={add} disabled={adding || !form.platform || !form.handle} className="w-full py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-40">{adding ? "Adding..." : "Add Link"}</button>
        </div>
      </div>
    </Sheet>
  );
}

/* ═══ Services Sheet ═══ */
function ServicesSheet({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  const [services, setServices] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: "", delivery_days: "7", category: "" });
  const [error, setError] = useState("");
  const inp = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 bg-white";

  useEffect(() => { if (open) fetch("/api/profile").then(r => r.json()).then(d => setServices(d.services || [])).catch(() => {}); }, [open]);

  async function add() {
    if (!form.title || !form.price) return;
    setAdding(true); setError("");
    const res = await fetch("/api/profile/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: form.title, description: form.description, price: Number(form.price), delivery_days: Number(form.delivery_days) || 7, category: form.category || null }) });
    const data = await res.json();
    if (data.id) { setServices([...services, { ...form, id: data.id, price: Number(form.price) }]); setForm({ title: "", description: "", price: "", delivery_days: "7", category: "" }); }
    else if (data.error) setError(data.message || "Error adding service");
    setAdding(false);
  }

  async function remove(id: string) {
    await fetch(`/api/profile/services?id=${id}`, { method: "DELETE" });
    setServices(services.filter(s => s.id !== id));
  }

  return (
    <Sheet open={open} onClose={onClose} title="Manage Services">
      <div className="space-y-4">
        <p className="text-xs text-neutral-500">{user.isPro ? "Unlimited services with Pro." : `Free: ${services.length}/3 services. Upgrade to Pro for unlimited.`}</p>
        {services.map((s: any) => (
          <div key={s.id} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><div className="font-semibold text-neutral-900 text-sm">{s.title}</div>{s.description && <div className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{s.description}</div>}</div>
              <div className="text-right shrink-0"><div className="font-bold text-neutral-900 text-sm">{Number(s.price) === 0 ? "Open" : `$${Number(s.price).toLocaleString()}`}</div><div className="text-[10px] text-neutral-400">{s.delivery_days || 7}d</div></div>
            </div>
            <button onClick={() => remove(s.id)} className="text-xs text-red-500 hover:text-red-700 mt-2">Delete</button>
          </div>
        ))}
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <div className="border-t border-neutral-100 pt-4 space-y-3">
          <h4 className="text-sm font-medium text-neutral-900">Add Service</h4>
          <input placeholder="Service title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inp} />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={`${inp} resize-y`} rows={2} placeholder="What's included..." />
          <div className="grid grid-cols-3 gap-3">
            <input type="number" placeholder="Price ($)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={inp} />
            <input type="number" placeholder="Days" value={form.delivery_days} onChange={e => setForm({ ...form, delivery_days: e.target.value })} className={inp} />
            <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inp} />
          </div>
          <button onClick={add} disabled={adding || !form.title || !form.price} className="w-full py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-40">{adding ? "Adding..." : "Add Service"}</button>
        </div>
      </div>
    </Sheet>
  );
}

/* ═══ Products Manager ═══ */
function ProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price_cents: "", product_url: "", thumbnail_url: "", product_type: "digital" });
  const [showForm, setShowForm] = useState(false);

  const inp = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 bg-white";

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    const res = await fetch("/api/products");
    if (res.ok) { const d = await res.json(); setProducts(d.products || []); }
    setLoading(false);
  }

  async function addProduct() {
    if (!form.title.trim()) return;
    setAdding(true);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price_cents: form.price_cents ? Math.round(Number(form.price_cents) * 100) : 0 }),
    });
    if (res.ok) { setForm({ title: "", description: "", price_cents: "", product_url: "", thumbnail_url: "", product_type: "digital" }); setShowForm(false); await loadProducts(); }
    setAdding(false);
  }

  async function deleteProduct(id: string) {
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    setProducts(p => p.filter(x => x.id !== id));
  }

  async function uploadThumbnail(file: File) {
    const fd = new FormData(); fd.append("file", file); fd.append("type", "cover");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) { const d = await res.json(); if (d.url) setForm(f => ({ ...f, thumbnail_url: d.url })); }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Products</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Digital products, courses, and external product links</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors">
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 mb-5 space-y-3">
          <div><label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Title</label><input className={inp} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="My Awesome Course" /></div>
          <div><label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Description</label><textarea className={`${inp} resize-y`} rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Price ($)</label><input type="number" step="0.01" className={inp} value={form.price_cents} onChange={e => setForm({ ...form, price_cents: e.target.value })} placeholder="0 for free" /></div>
            <div><label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Type</label><select className={inp} value={form.product_type} onChange={e => setForm({ ...form, product_type: e.target.value })}><option value="digital">Digital</option><option value="course">Course</option><option value="physical">Physical</option><option value="link">External Link</option></select></div>
          </div>
          <div><label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Product URL</label><input className={inp} value={form.product_url} onChange={e => setForm({ ...form, product_url: e.target.value })} placeholder="https://gumroad.com/..." /></div>
          <div>
            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Thumbnail</label>
            {form.thumbnail_url ? (
              <div className="relative rounded-xl overflow-hidden h-24 bg-neutral-100 mt-1">
                <img src={form.thumbnail_url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setForm(f => ({ ...f, thumbnail_url: "" }))} className="absolute top-1 right-1 px-2 py-0.5 bg-black/60 text-white rounded-full text-[10px]">Remove</button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 py-3 mt-1 rounded-xl border-2 border-dashed border-neutral-200 cursor-pointer text-xs text-neutral-500 hover:border-neutral-400 transition-all">
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadThumbnail(f); }} />
                Upload Image
              </label>
            )}
          </div>
          <button onClick={addProduct} disabled={adding || !form.title.trim()} className="w-full py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-40">{adding ? "Adding..." : "Add Product"}</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" /></div>
      ) : products.length > 0 ? (
        <div className="space-y-3">
          {products.map((p: any) => (
            <div key={p.id} className="bg-white rounded-2xl border border-neutral-200/60 p-4 flex items-center gap-4 hover:border-neutral-300 transition-colors">
              {p.thumbnail_url ? (
                <img src={p.thumbnail_url} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-300"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" strokeLinecap="round"/><line x1="7" y1="7" x2="7.01" y2="7" strokeLinecap="round"/></svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900 text-sm truncate">{p.title}</h3>
                <div className="text-xs text-neutral-400 mt-0.5">{p.product_type} &middot; {Number(p.price_cents) === 0 ? "Free" : `$${(Number(p.price_cents) / 100).toFixed(2)}`}</div>
              </div>
              <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition-colors shrink-0" title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round"/></svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-10 text-center">
          <p className="text-sm text-neutral-400 mb-3">No products yet. Add digital products, courses, or external links.</p>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-800 transition-colors">Add Product</button>
        </div>
      )}
    </div>
  );
}

/* ═══ Sidebar nav items ═══ */
type Section = "overview" | "links" | "services" | "products" | "calendar" | "bookings" | "earn" | "messages" | "animations" | "settings";

const NAV_MAIN = [
  { id: "overview" as Section, label: "Overview", icon: icons.overview },
  { id: "links" as Section, label: "My Bio Link", icon: icons.link },
  { id: "services" as Section, label: "Services", icon: icons.services },
  { id: "products" as Section, label: "Products", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" strokeLinecap="round" strokeLinejoin="round"/><line x1="7" y1="7" x2="7.01" y2="7" strokeLinecap="round"/></svg> },
  { id: "calendar" as Section, label: "Calendar", icon: icons.calendar },
  { id: "bookings" as Section, label: "Bookings", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" strokeLinecap="round"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: "earn" as Section, label: "Earn", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: "messages" as Section, label: "Messages", icon: icons.messages },
  { id: "animations" as Section, label: "Animations", icon: icons.sparkle },
];

const NAV_BOTTOM = [
  { id: "settings" as Section, label: "Settings", icon: icons.settings },
];

/* ═══ My Bookings (sessions I've booked with creators) ═══ */
function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings/mine")
      .then(r => r.json())
      .then(d => { setBookings(d.bookings || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      confirmed: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
      completed: "bg-blue-100 text-blue-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${styles[status] || "bg-neutral-100 text-neutral-500"}`}>
        {status}
      </span>
    );
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }

  function formatTime(timeStr: string) {
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${m} ${ampm}`;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-neutral-900">My Bookings</h2>
        <p className="text-xs text-neutral-400 mt-0.5">Sessions you've booked with creators</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" /></div>
      ) : bookings.length > 0 ? (
        <div className="space-y-3">
          {bookings.map((b: any) => (
            <div key={b.id} className="bg-white rounded-2xl border border-neutral-200/60 p-5 hover:border-neutral-300 transition-colors">
              <div className="flex items-start gap-4">
                {/* Creator avatar */}
                {b.creator_avatar ? (
                  <img src={b.creator_avatar} alt={b.creator_name} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-neutral-200 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-neutral-400">{(b.creator_name || "?").charAt(0)}</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {b.creator_slug ? (
                          <Link href={`/creators/${b.creator_slug}`} className="text-sm font-semibold text-neutral-900 hover:underline truncate">{b.creator_name}</Link>
                        ) : (
                          <span className="text-sm font-semibold text-neutral-900 truncate">{b.creator_name}</span>
                        )}
                        {statusBadge(b.status)}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">{b.session_title}</p>
                    </div>
                    {b.price_cents > 0 && (
                      <div className="text-right shrink-0">
                        <div className="font-display font-bold text-neutral-900">${(Number(b.price_cents) / 100).toFixed(2)}</div>
                        <div className="text-[10px] text-neutral-400 uppercase">{b.currency || "AUD"}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg>
                      {formatDate(b.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg>
                      {formatTime(b.start_time)} – {formatTime(b.end_time)}
                    </span>
                    <span>{b.duration_minutes} min</span>
                  </div>

                  {b.notes && (
                    <p className="mt-2 text-xs text-neutral-500 bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-100">{b.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-300"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg>
          </div>
          <p className="text-sm text-neutral-400 mb-1">No bookings yet</p>
          <p className="text-xs text-neutral-300">When you book sessions with creators, they'll appear here.</p>
        </div>
      )}
    </div>
  );
}

/* ═══ Main Dashboard ═══ */
export function DashboardContent() {
  const { user, loading, refreshUser } = useAuth();
  const [section, setSection] = useState<Section>("overview");
  const [editProfile, setEditProfile] = useState(false);
  const [editSocials, setEditSocials] = useState(false);
  const [editServices, setEditServices] = useState(false);
  const [socials, setSocials] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleUpload(file: File, type: "avatar" | "cover") {
    setUploadError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setUploadError(data.message || data.error || `Upload failed (${res.status})`);
        return;
      }
      refreshUser();
    } catch {
      setUploadError("Network error — couldn't upload");
    }
  }

  const loadData = useCallback(() => {
    fetch("/api/profile").then(r => r.json()).then(d => { if (d.socials) setSocials(d.socials); if (d.services) setServices(d.services); setDataLoaded(true); }).catch(() => { setDataLoaded(true); });
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);
  useEffect(() => { if (!editSocials && !editServices && user) loadData(); }, [editSocials, editServices, user, loadData]);

  function copyLink() {
    if (!user?.slug) return;
    navigator.clipboard?.writeText(`https://hireacreator.ai/u/${user.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) return <div className="min-h-screen bg-neutral-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" /></div>;
  if (!user) return <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4"><div className="text-center"><h2 className="font-display text-xl font-bold text-neutral-900 mb-3">Sign in to continue</h2><p className="text-sm text-neutral-500 mb-6">You need an account to access the dashboard.</p><Link href="/" className="px-6 py-3 bg-neutral-900 text-white text-sm font-semibold rounded-full">Go Home</Link></div></div>;

  const bioUrl = `hireacreator.ai/u/${user.slug}`;

  return (
    <div className="min-h-screen bg-[#f8f8fa]">
      <div className="flex">

        {/* ═══ LEFT SIDEBAR (desktop only) ═══ */}
        <aside className="hidden lg:flex flex-col w-[220px] shrink-0 border-r border-neutral-200 bg-white min-h-screen sticky top-0 pt-20">
          <div className="flex-1 px-3 py-6">
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">Main</p>
            {NAV_MAIN.map(n => (
              <button key={n.id} onClick={() => setSection(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 ${section === n.id ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                <span className={section === n.id ? "text-white" : "text-neutral-400"}>{n.icon}</span>
                {n.label}
              </button>
            ))}

          </div>

          <div className="px-3 pb-6">
            {NAV_BOTTOM.map(n => (
              <button key={n.id} onClick={() => setSection(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${section === n.id ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                <span className={section === n.id ? "text-white" : "text-neutral-400"}>{n.icon}</span>
                {n.label}
              </button>
            ))}
          </div>
        </aside>

        {/* ═══ MAIN CONTENT ═══ */}
        <main className="flex-1 min-w-0">

          {/* ─── Profile Header ─── */}
          <div className="bg-white border-b border-neutral-200">
            {/* Cover — extends behind floating header */}
            <div className="relative h-52 sm:h-56">
              {user.cover ? <img src={user.cover} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-300" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <label className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-black/40 backdrop-blur-sm border border-white/20 rounded-full hover:bg-black/60 transition-all cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (file) handleUpload(file, "cover"); }} />
                {icons.camera} Change
              </label>
            </div>

            <div className="max-w-4xl mx-auto px-6">
              {/* Avatar row — avatar overlaps cover by half */}
              <div className="flex items-end gap-5 -mt-10 relative z-10">
                <div className="relative group shrink-0">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl border-[3px] border-white object-cover shadow-lg" />
                    : <div className="w-20 h-20 rounded-2xl border-[3px] border-white bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center shadow-lg"><span className="text-xl font-bold text-neutral-400">{user.name?.charAt(0) || "?"}</span></div>
                  }
                  <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 rounded-2xl cursor-pointer transition-all opacity-0 group-hover:opacity-100">
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (file) handleUpload(file, "avatar"); }} />
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
                  </label>
                  {user.isOnline && <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" /></span>}
                </div>
              </div>

              {/* Name + headline — clearly below cover */}
              <div className="flex items-start justify-between gap-4 mt-3 mb-1">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-display text-xl font-bold text-neutral-900 truncate">{user.name}</h1>
                    {user.isPro && <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm">PRO</span>}
                  </div>
                  {user.headline && <p className="text-sm text-neutral-500 truncate mt-0.5">{user.headline}</p>}
                </div>

                <button onClick={() => setEditProfile(true)} className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors shrink-0">
                  {icons.pencil} Edit Profile
                </button>
              </div>

              {/* Upload/save error banner */}
              {uploadError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3">
                  <p className="text-xs text-red-700 font-medium">{uploadError}</p>
                  <button onClick={() => setUploadError("")} className="text-red-400 hover:text-red-600 shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg></button>
                </div>
              )}

              {/* Share URL bar */}
              {user.slug && (
                <div className="flex items-center gap-2 mt-4 mb-4">
                  <div className="flex-1 flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-300 shrink-0"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round"/></svg>
                    <span className="text-sm text-neutral-500 truncate">{bioUrl}</span>
                  </div>
                  <button onClick={copyLink} className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm ${copied ? "bg-emerald-500 text-white" : "bg-neutral-900 text-white hover:bg-neutral-800"}`}>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <a href={`/u/${user.slug}`} target="_blank" className="p-2.5 text-neutral-400 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:text-neutral-600 transition-colors" title="Open page">
                    {icons.external}
                  </a>
                </div>
              )}

              {/* Tab bar (mobile + tablet, hidden on desktop since sidebar handles it) */}
              <div className="flex lg:hidden gap-1 overflow-x-auto -mx-6 px-6 border-t border-neutral-100 scrollbar-hide">
                {[...NAV_MAIN, ...NAV_BOTTOM].map(n => (
                  <button key={n.id} onClick={() => setSection(n.id)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${section === n.id ? "text-neutral-900 border-neutral-900" : "text-neutral-400 border-transparent hover:text-neutral-600"}`}>
                    {n.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Content area ─── */}
          <div className="max-w-4xl mx-auto px-6 py-8">

            {/* OVERVIEW */}
            {section === "overview" && (
              <div className="grid lg:grid-cols-[1fr,320px] gap-8">
                {/* Left — stats + about + socials */}
                <div className="space-y-6">
                  {/* Eligibility banner — only show after data has loaded to prevent flash */}
                  {dataLoaded && (() => {
                    const missing: string[] = [];
                    if (!user.avatar) missing.push("profile picture");
                    if (!(user as any).emailVerified) missing.push("verified email");
                    if (socials.length === 0) missing.push("social media link");
                    if (missing.length === 0) return null;
                    return (
                      <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-2xl flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        <div><h3 className="text-sm font-semibold text-neutral-900">Not visible on marketplace</h3><p className="text-xs text-neutral-500 mt-0.5">Add: <strong>{missing.join(", ")}</strong></p></div>
                      </div>
                    );
                  })()}

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Projects", value: user.totalProjects || 0 },
                      { label: "Rating", value: user.rating > 0 ? user.rating.toFixed(1) : "--" },
                      { label: "Reviews", value: user.reviewCount || 0 },
                      { label: "Per hour", value: user.hourlyRate ? `$${user.hourlyRate}` : "--" },
                    ].map(s => (
                      <div key={s.label} className="bg-white rounded-2xl border border-neutral-200/60 p-4 text-center">
                        <div className="font-display text-2xl font-bold text-neutral-900">{s.value}</div>
                        <div className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wider font-medium">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* About + Socials */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-neutral-900">About</h2>
                        <button onClick={() => setEditProfile(true)} className="text-[11px] text-neutral-400 hover:text-neutral-600 font-medium">Edit</button>
                      </div>
                      {user.bio ? <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{user.bio}</p> : <p className="text-sm text-neutral-300 italic">Add a bio to tell brands about yourself...</p>}
                      {user.location && <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>{user.location}</div>}
                    </div>

                    <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-neutral-900">Socials</h2>
                        <button onClick={() => setEditSocials(true)} className="text-[11px] text-neutral-400 hover:text-neutral-600 font-medium">Edit</button>
                      </div>
                      {socials.length > 0 ? (
                        <div className="space-y-1.5">
                          {socials.map((s: any) => (
                            <a key={s.id} href={s.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-50 transition-colors">
                              <PlatformIcon platform={s.platform} size={18} className="text-neutral-500 shrink-0" />
                              <span className="text-xs text-neutral-700 truncate">@{s.handle}</span>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <button onClick={() => setEditSocials(true)} className="text-sm text-neutral-300 hover:text-neutral-500">+ Add social links</button>
                      )}
                    </div>
                  </div>

                  {/* Pro upsell */}
                  {!user.isPro && (
                    <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-white text-sm">Upgrade to Pro</h3>
                        <p className="text-xs text-white/50 mt-0.5">Unlimited services, custom domain, analytics, priority search</p>
                      </div>
                      <Link href="/pricing" className="px-4 py-2 bg-white text-neutral-900 text-xs font-semibold rounded-full hover:bg-neutral-100 transition-colors shrink-0">$19/mo</Link>
                    </div>
                  )}

                  {/* Admin */}
                  {user.role === "admin" && (
                    <div className="bg-white rounded-2xl border border-purple-200/60 p-5">
                      <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 mb-3"><span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-bold rounded-full uppercase">Admin</span></h2>
                      <div className="flex gap-3">
                        <Link href="/dashboard/settings?tab=admin" className="flex-1 py-2.5 text-xs font-medium text-center bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors">Users & Orders</Link>
                        <Link href="/dashboard/settings?tab=admin" className="flex-1 py-2.5 text-xs font-medium text-center bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors">Marketplace Toggle</Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right — Quick Actions (desktop only) */}
                <div className="hidden lg:block">
                  <div className="sticky top-24 space-y-3">
                    <h3 className="text-sm font-bold text-neutral-900 mb-3">Quick Actions</h3>
                    {user.slug && (
                      <a href={`/u/${user.slug}`} target="_blank" className="flex items-center gap-3 bg-white rounded-2xl border border-neutral-200/60 p-4 hover:border-neutral-300 hover:shadow-sm transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-500 group-hover:bg-neutral-200 transition-colors">{icons.external}</div>
                        <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-neutral-900">View Link in Bio</div><div className="text-xs text-neutral-400 mt-0.5">See your live page</div></div>
                      </a>
                    )}
                    {user.slug && (
                      <a href={`/u/${user.slug}/edit`} className="flex items-center gap-3 bg-white rounded-2xl border border-neutral-200/60 p-4 hover:border-neutral-300 hover:shadow-sm transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-500 group-hover:bg-neutral-200 transition-colors">{icons.pencil}</div>
                        <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-neutral-900">Edit Page</div><div className="text-xs text-neutral-400 mt-0.5">Templates, links, design</div></div>
                      </a>
                    )}
                    <button onClick={() => setSection("animations")} className="flex items-center gap-3 bg-white rounded-2xl border border-neutral-200/60 p-4 hover:border-neutral-300 hover:shadow-sm transition-all group w-full text-left">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-500 group-hover:bg-neutral-200 transition-colors">{icons.sparkle}</div>
                      <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-neutral-900">Animations</div><div className="text-xs text-neutral-400 mt-0.5">Premium intro effects</div></div>
                    </button>
                    <button onClick={() => setSection("messages")} className="flex items-center gap-3 bg-white rounded-2xl border border-neutral-200/60 p-4 hover:border-neutral-300 hover:shadow-sm transition-all group w-full text-left">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-500 group-hover:bg-neutral-200 transition-colors">{icons.messages}</div>
                      <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-neutral-900">Messages</div><div className="text-xs text-neutral-400 mt-0.5">Chat with brands</div></div>
                    </button>
                    {/* Boost Profile */}
                    {user.slug && (
                      <button onClick={async () => {
                        const res = await fetch("/api/checkout/boost", { method: "POST" });
                        const data = await res.json();
                        if (data.url) window.location.href = data.url;
                        else if (data.error) alert(data.message || "Could not start checkout.");
                      }} className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/60 p-4 hover:border-amber-300 hover:shadow-sm transition-all group w-full text-left">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 text-white">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-neutral-900">Boost Profile</div><div className="text-xs text-amber-600 mt-0.5">$4.99/week — rank higher in search</div></div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* LINKS */}
            {section === "links" && (
              <div className="max-w-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">Your Links</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">Add links to your link-in-bio page. Drag to reorder.</p>
                  </div>
                  {user.slug && <a href={`/u/${user.slug}/edit`} className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors">Open Editor</a>}
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
                  <LinkManager />
                </div>
              </div>
            )}

            {/* SERVICES */}
            {section === "services" && (
              <div className="max-w-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">Services</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">{user.isPro ? "Unlimited services with Pro." : `Free: ${services.length}/3 services.`}</p>
                  </div>
                  <button onClick={() => setEditServices(true)} className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors">+ Add Service</button>
                </div>
                {services.length > 0 ? (
                  <div className="space-y-3">
                    {services.map((s: any) => (
                      <div key={s.id} className="bg-white rounded-2xl border border-neutral-200/60 p-5 flex items-start justify-between gap-4 hover:border-neutral-300 transition-colors">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-neutral-900 text-sm">{s.title}</h3>
                          {s.category && <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">{s.category}</span>}
                          {s.description && <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{s.description}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-display font-bold text-neutral-900">{Number(s.price) === 0 ? "Open" : `$${Number(s.price).toLocaleString()}`}</div>
                          <div className="text-[10px] text-neutral-400">{s.delivery_days || 7}d delivery</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-neutral-200/60 p-10 text-center">
                    <p className="text-sm text-neutral-400 mb-3">No services yet. Add your first one to start getting bookings.</p>
                    <button onClick={() => setEditServices(true)} className="px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-800 transition-colors">Add Service</button>
                  </div>
                )}
              </div>
            )}

            {/* PRODUCTS */}
            {section === "products" && <ProductsManager />}

            {/* CALENDAR */}
            {section === "calendar" && (
              <div className="max-w-2xl">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-neutral-900">Calendar</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Manage bookable sessions and availability</p>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
                  <CalendarManager />
                </div>
              </div>
            )}

            {/* BOOKINGS */}
            {section === "bookings" && <MyBookings />}

            {/* EARN */}
            {section === "earn" && (
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-neutral-900">Earnings</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Track your income across all channels</p>
                </div>

                {/* Total earnings card */}
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 mb-6">
                  <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Total Earned</p>
                  <p className="text-3xl font-display font-bold text-white mt-1">${((user as any).referralEarningsCents || 0) / 100 > 0 ? (((user as any).referralEarningsCents || 0) / 100).toFixed(2) : "0.00"}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-emerald-400 font-medium">Platform credits</span>
                    <span className="text-xs text-white/30">${((user as any).creditBalanceCents || 0) / 100 > 0 ? (((user as any).creditBalanceCents || 0) / 100).toFixed(2) : "0.00"}</span>
                  </div>
                </div>

                {/* Earnings breakdown */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: "Bookings", value: "$0.00", desc: "From calendar sessions", icon: icons.calendar },
                    { label: "Services", value: "$0.00", desc: "Brand deals & projects", icon: icons.services },
                    { label: "Referrals", value: `$${(((user as any).referralEarningsCents || 0) / 100).toFixed(2)}`, desc: "20% commission credits", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                    { label: "Products", value: "$0.00", desc: "Digital products sold", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                  ].map(item => (
                    <div key={item.label} className="bg-white rounded-2xl border border-neutral-200/60 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">{item.icon}</div>
                        <span className="text-xs font-medium text-neutral-500">{item.label}</span>
                      </div>
                      <div className="font-display text-xl font-bold text-neutral-900">{item.value}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{item.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Referral section */}
                <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
                  <h3 className="text-sm font-bold text-neutral-900 mb-1">Refer & Earn</h3>
                  <p className="text-xs text-neutral-400 mb-4">Earn 20% commission in platform credits when your referrals subscribe to a paid plan.</p>
                  {user.slug && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5">
                        <span className="text-xs text-neutral-500 truncate">hireacreator.ai/ref/{(user as any).referralCode || user.slug}</span>
                      </div>
                      <button onClick={() => { navigator.clipboard?.writeText(`https://hireacreator.ai/ref/${(user as any).referralCode || user.slug}`); }} className="px-4 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors">Copy</button>
                    </div>
                  )}
                </div>

                {/* Coming soon */}
                <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200/60 rounded-2xl text-center">
                  <p className="text-xs text-neutral-400">Payout history, analytics graphs, and CSV export coming soon.</p>
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {section === "messages" && (
              <div>
                <MessagesContent />
                <div className="mt-8 p-4 bg-neutral-50 border border-neutral-200/60 rounded-2xl">
                  <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Messaging Terms & Conditions</h4>
                  <ul className="text-[11px] text-neutral-400 space-y-1 list-disc list-inside leading-relaxed">
                    <li>You must be 18 years or older to use the messaging feature.</li>
                    <li>Harassment, threats, hate speech, or abusive language of any kind is strictly prohibited.</li>
                    <li>Sharing or soliciting explicit, illegal, or banned content is not permitted.</li>
                    <li>Do not solicit transactions outside of the HireACreator platform.</li>
                    <li>All messages may be reviewed by platform administrators for safety and compliance.</li>
                    <li>Reports are reviewed by admin — violations may result in account suspension or permanent ban.</li>
                    <li>HireACreator is not liable for any content exchanged between users in messages.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ANIMATIONS */}
            {section === "animations" && (
              <div>
                <AnimationsContent />
                <div className="mt-8 p-4 bg-neutral-50 border border-neutral-200/60 rounded-2xl">
                  <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Animation Purchase Terms</h4>
                  <ul className="text-[11px] text-neutral-400 space-y-1 list-disc list-inside leading-relaxed">
                    <li>All animation purchases are non-refundable once applied to your profile.</li>
                    <li>Animations are a one-time purchase — no recurring charges.</li>
                    <li>Purchased animations are tied to your account and are non-transferable.</li>
                    <li>HireACreator reserves the right to modify or discontinue animations at any time.</li>
                    <li>Use of animations is subject to the HireACreator platform Terms of Service.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {section === "settings" && (
              <div className="max-w-2xl space-y-3">
                {[
                  { href: "/dashboard/settings", label: "Account & Security", desc: "Email, password, 2FA, sessions", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
                  { href: "/dashboard/settings?tab=privacy", label: "Privacy", desc: "Profile visibility, messaging, content warnings", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> },
                  { href: "/dashboard/settings?tab=plan", label: "Plan & Billing", desc: "Subscription, upgrade, payment history", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg> },
                  { href: user.slug ? `/u/${user.slug}/edit` : "/dashboard", label: "Link in Bio Editor", desc: "Templates, backgrounds, buttons, colors", icon: icons.pencil },
                  { href: "#", label: "Animations Store", desc: "Premium intro effects for your link in bio", icon: icons.sparkle, onClick: () => setSection("animations") },
                ].map(item => (
                  item.onClick ? (
                    <button key={item.label} onClick={item.onClick} className="flex items-center gap-4 bg-white rounded-2xl border border-neutral-200/60 p-4 hover:border-neutral-300 hover:shadow-sm transition-all group w-full text-left">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-500 group-hover:bg-neutral-200 transition-colors">{item.icon}</div>
                      <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-neutral-900">{item.label}</div><div className="text-xs text-neutral-400 mt-0.5">{item.desc}</div></div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-300 shrink-0"><path d="M9 18l6-6-6-6" strokeLinecap="round" /></svg>
                    </button>
                  ) : (
                    <Link key={item.href} href={item.href} className="flex items-center gap-4 bg-white rounded-2xl border border-neutral-200/60 p-4 hover:border-neutral-300 hover:shadow-sm transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-500 group-hover:bg-neutral-200 transition-colors">{item.icon}</div>
                      <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-neutral-900">{item.label}</div><div className="text-xs text-neutral-400 mt-0.5">{item.desc}</div></div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-300 shrink-0"><path d="M9 18l6-6-6-6" strokeLinecap="round" /></svg>
                    </Link>
                  )
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ═══ MOBILE BOTTOM NAV ═══ */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 z-40" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-center justify-around px-2 py-1.5">
          {([
            { id: "overview" as Section, label: "Overview", icon: icons.overview },
            { id: "links" as Section, label: "Bio Link", icon: icons.link },
            { id: "earn" as Section, label: "Earn", icon: NAV_MAIN.find(n => n.id === "earn")!.icon },
            { id: "messages" as Section, label: "Messages", icon: icons.messages },
            { id: "settings" as Section, label: "Settings", icon: icons.settings },
          ]).map(n => (
            <button key={n.id} onClick={() => setSection(n.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${section === n.id ? "text-neutral-900" : "text-neutral-400"}`}>
              {n.icon}
              <span className="text-[9px] font-medium">{n.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sheets */}
      <EditProfileSheet user={user} open={editProfile} onClose={() => setEditProfile(false)} />
      <SocialsSheet open={editSocials} onClose={() => setEditSocials(false)} />
      <ServicesSheet user={user} open={editServices} onClose={() => setEditServices(false)} />

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(100%) } to { opacity: 1; transform: translateY(0) } }
        @media (min-width: 640px) { @keyframes slideUp { from { opacity: 0; transform: translate(-50%, -48%) scale(.97) } to { opacity: 1; transform: translate(-50%, -50%) scale(1) } } }
        .scrollbar-hide::-webkit-scrollbar { display: none } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none }
      `}</style>
    </div>
  );
}
