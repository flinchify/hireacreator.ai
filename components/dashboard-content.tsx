"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, User } from "./auth-context";
import { CalendarManager } from "./calendar-manager";
import { LinkManager } from "./link-manager";
import { PlatformIcon } from "./icons/platforms";
import Link from "next/link";

/* ───── Icons ───── */
function PencilIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
}

/* ───── Bottom Sheet ───── */
function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" style={{ animation: "sheetFadeIn 0.15s ease-out" }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-white rounded-t-2xl shadow-2xl overflow-y-auto sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full sm:rounded-2xl sm:max-h-[85vh]" style={{ animation: "sheetSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-5 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <h3 className="font-display font-bold text-neutral-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg></button>
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
  const inp = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-400 text-neutral-900 bg-neutral-50";

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

/* ───── Social Links Sheet ───── */
function SocialsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [socials, setSocials] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ platform: "", handle: "", url: "" });
  const inp = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 text-neutral-900 bg-neutral-50";

  useEffect(() => { if (open) fetch("/api/profile").then(r => r.json()).then(d => setSocials(d.socials || [])).catch(() => {}); }, [open]);

  async function add() {
    if (!form.platform || !form.handle) return;
    setAdding(true);
    const res = await fetch("/api/profile/socials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.id) { setSocials([...socials, { ...form, id: data.id }]); setForm({ platform: "", handle: "", url: "" }); }
    setAdding(false);
  }

  async function remove(id: string) {
    await fetch(`/api/profile/socials?id=${id}`, { method: "DELETE" });
    setSocials(socials.filter(s => s.id !== id));
  }

  const platforms = ["instagram","tiktok","youtube","twitter","linkedin","twitch","spotify","pinterest","snapchat","kick","discord","github","website"];

  return (
    <Sheet open={open} onClose={onClose} title="Social Links">
      <div className="space-y-3">
        {socials.map((s: any) => (
          <div key={s.id} className="flex items-center gap-3 bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
            <PlatformIcon platform={s.platform} size={20} className="text-neutral-500 shrink-0" />
            <div className="flex-1 min-w-0"><div className="text-sm font-medium text-neutral-900 capitalize">{s.platform}</div><div className="text-xs text-neutral-500 truncate">{s.handle}</div></div>
            <button onClick={() => remove(s.id)} className="text-xs text-red-500 hover:text-red-700 shrink-0">Remove</button>
          </div>
        ))}
        {socials.length === 0 && <p className="text-sm text-neutral-400 text-center py-4">No social links yet.</p>}
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

/* ───── Services Sheet ───── */
function ServicesSheet({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  const [services, setServices] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: "", delivery_days: "7", category: "" });
  const [error, setError] = useState("");
  const inp = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 text-neutral-900 bg-neutral-50";

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

/* ───── Image Upload Button ───── */
function ImageUploadButton({ type, onUploaded }: { type: "avatar" | "cover"; onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false);
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append("file", file); fd.append("type", type);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) onUploaded();
    setUploading(false);
  }
  return (
    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-black/40 backdrop-blur-sm border border-white/20 rounded-full hover:bg-black/60 transition-all cursor-pointer active:scale-95">
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />
      {uploading ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>}
      {uploading ? "..." : type === "cover" ? "Change" : "Photo"}
    </label>
  );
}

/* ───── Tab definitions ───── */
type Tab = "overview" | "links" | "services" | "calendar" | "settings";

const TABS: { id: Tab; label: string; icon: JSX.Element }[] = [
  { id: "overview", label: "Overview", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { id: "links", label: "Links", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round"/></svg> },
  { id: "services", label: "Services", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: "calendar", label: "Calendar", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg> },
  { id: "settings", label: "Settings", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/><circle cx="12" cy="12" r="3"/></svg> },
];

/* ───── Main Dashboard ───── */
export function DashboardContent() {
  const { user, loading, refreshUser } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [editProfile, setEditProfile] = useState(false);
  const [editSocials, setEditSocials] = useState(false);
  const [editServices, setEditServices] = useState(false);
  const [socials, setSocials] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(() => {
    fetch("/api/profile").then(r => r.json()).then(d => { if (d.socials) setSocials(d.socials); if (d.services) setServices(d.services); }).catch(() => {});
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);
  useEffect(() => { if (!editSocials && !editServices && user) loadData(); }, [editSocials, editServices, user, loadData]);

  function copyLink(url: string) {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) return <div className="min-h-screen bg-neutral-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" /></div>;
  if (!user) return <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4"><div className="text-center"><h2 className="font-display text-xl font-bold text-neutral-900 mb-3">Sign in to continue</h2><p className="text-sm text-neutral-500 mb-6">You need an account to access the dashboard.</p><Link href="/" className="px-6 py-3 bg-neutral-900 text-white text-sm font-semibold rounded-full">Go Home</Link></div></div>;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ─── Compact header ─── */}
      <div className="bg-white border-b border-neutral-200">
        {/* Cover */}
        <div className="relative h-32 sm:h-40">
          {user.cover ? <img src={user.cover} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-300" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-3 right-3"><ImageUploadButton type="cover" onUploaded={() => refreshUser()} /></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Profile row */}
          <div className="flex items-end gap-4 -mt-10 pb-4">
            {/* Avatar */}
            <div className="relative group shrink-0">
              {user.avatar ? <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl border-4 border-white object-cover shadow-lg" /> : <div className="w-20 h-20 rounded-2xl border-4 border-white bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center shadow-lg"><span className="text-xl font-bold text-neutral-400">{user.name?.charAt(0) || "?"}</span></div>}
              <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 rounded-2xl cursor-pointer transition-all opacity-0 group-hover:opacity-100">
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const fd = new FormData(); fd.append("file", file); fd.append("type", "avatar"); await fetch("/api/upload", { method: "POST", body: fd }); refreshUser(); }} />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
              </label>
              {user.isOnline && <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" /></span>}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 pb-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-lg sm:text-xl font-bold text-neutral-900 truncate">{user.name}</h1>
                {user.isPro && <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-full">PRO</span>}
              </div>
              {user.headline && <p className="text-neutral-500 text-sm truncate">{user.headline}</p>}
            </div>

            {/* Actions */}
            <div className="hidden sm:flex items-center gap-2 pb-0.5 shrink-0">
              <button onClick={() => setEditProfile(true)} className="px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors flex items-center gap-1.5"><PencilIcon /> Edit</button>
              {user.slug && <a href={`/u/${user.slug}`} className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors">View Link in Bio</a>}
            </div>
          </div>

          {/* Share link bar */}
          {user.slug && (
            <div className="flex items-center gap-2 pb-4">
              <div className="flex-1 flex items-center bg-neutral-50 rounded-xl border border-neutral-200 px-3 py-2">
                <span className="text-xs text-neutral-400 truncate">hireacreator.ai/u/{user.slug}</span>
              </div>
              <button onClick={() => copyLink(`https://hireacreator.ai/u/${user.slug}`)} className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${copied ? "bg-emerald-500 text-white" : "bg-neutral-900 text-white hover:bg-neutral-800"}`}>{copied ? "Copied!" : "Copy"}</button>
              <a href={`/u/${user.slug}`} target="_blank" className="px-3 py-2 text-xs font-medium text-neutral-500 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>
          )}

          {/* Tab navigation */}
          <div className="flex gap-1 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-0 scrollbar-hide">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap rounded-t-xl transition-colors border-b-2 ${tab === t.id ? "text-neutral-900 border-neutral-900 bg-neutral-50" : "text-neutral-400 border-transparent hover:text-neutral-600 hover:bg-neutral-50"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Tab content ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Overview ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Eligibility banner */}
            {(() => {
              const hasAvatar = !!user.avatar;
              const hasEmail = !!(user as any).emailVerified;
              const hasSocials = socials.length > 0;
              if (hasAvatar && hasEmail && hasSocials) return null;
              const missing: string[] = [];
              if (!hasAvatar) missing.push("profile picture");
              if (!hasEmail) missing.push("verified email");
              if (!hasSocials) missing.push("social media link");
              return (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div><h3 className="text-sm font-semibold text-neutral-900">Not visible on marketplace yet</h3><p className="text-xs text-neutral-500 mt-0.5">Add: <strong>{missing.join(", ")}</strong></p></div>
                </div>
              );
            })()}

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Projects", value: user.totalProjects },
                { label: "Rating", value: user.rating > 0 ? user.rating.toFixed(1) : "--" },
                { label: "Reviews", value: user.reviewCount },
                { label: "Per hour", value: user.hourlyRate ? `$${user.hourlyRate}` : "--" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-neutral-200 p-4 text-center">
                  <div className="font-display text-xl font-bold text-neutral-900">{s.value}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

            {/* About + Socials */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-neutral-900">About</h2>
                  <button onClick={() => setEditProfile(true)} className="text-[11px] text-neutral-400 hover:text-neutral-600 font-medium">Edit</button>
                </div>
                {user.bio ? <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{user.bio}</p> : <p className="text-sm text-neutral-300 italic">Add a bio to tell brands about yourself...</p>}
                {user.location && <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>{user.location}</div>}
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-neutral-900">Socials</h2>
                  <button onClick={() => setEditSocials(true)} className="text-[11px] text-neutral-400 hover:text-neutral-600 font-medium">Edit</button>
                </div>
                {socials.length > 0 ? (
                  <div className="space-y-2">
                    {socials.map((s: any) => (
                      <a key={s.id} href={s.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-50 transition-colors">
                        <PlatformIcon platform={s.platform} size={18} className="text-neutral-500 shrink-0" />
                        <span className="text-xs text-neutral-700 truncate capitalize">{s.handle}</span>
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
              <div className="bg-white rounded-2xl border border-purple-200 p-5">
                <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 mb-3"><span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-bold rounded-full uppercase">Admin</span></h2>
                <div className="flex gap-3">
                  <Link href="/dashboard/settings?tab=admin" className="flex-1 py-2.5 text-xs font-medium text-center bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors">Users & Orders</Link>
                  <Link href="/dashboard/settings?tab=admin" className="flex-1 py-2.5 text-xs font-medium text-center bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors">Marketplace Toggle</Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Links ── */}
        {tab === "links" && (
          <div className="max-w-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Your Links</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Add links to your link-in-bio page. Drag to reorder.</p>
              </div>
              <Link href="/dashboard/link-in-bio" className="px-3 py-1.5 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-full hover:bg-neutral-50 transition-colors">Open Editor</Link>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <LinkManager />
            </div>
          </div>
        )}

        {/* ── Services ── */}
        {tab === "services" && (
          <div className="max-w-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Services</h2>
                <p className="text-xs text-neutral-400 mt-0.5">{user.isPro ? "Unlimited services with Pro." : `Free: ${services.length}/3 services.`}</p>
              </div>
              <button onClick={() => setEditServices(true)} className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors">+ Add Service</button>
            </div>
            {services.length > 0 ? (
              <div className="space-y-3">
                {services.map((s: any) => (
                  <div key={s.id} className="bg-white rounded-2xl border border-neutral-200 p-5 flex items-start justify-between gap-4">
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
              <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center">
                <p className="text-sm text-neutral-400 mb-3">No services yet. Add your first one to start getting bookings.</p>
                <button onClick={() => setEditServices(true)} className="px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-800 transition-colors">Add Service</button>
              </div>
            )}
          </div>
        )}

        {/* ── Calendar ── */}
        {tab === "calendar" && (
          <div className="max-w-xl">
            <div className="mb-4">
              <h2 className="text-base font-bold text-neutral-900">Calendar</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Manage bookable sessions and availability</p>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <CalendarManager />
            </div>
          </div>
        )}

        {/* ── Settings redirect ── */}
        {tab === "settings" && (
          <div className="max-w-xl space-y-3">
            {[
              { href: "/dashboard/settings", label: "Account & Security", desc: "Email, password, 2FA, sessions", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
              { href: "/dashboard/settings?tab=privacy", label: "Privacy", desc: "Profile visibility, messaging, content warnings", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> },
              { href: "/dashboard/settings?tab=plan", label: "Plan & Billing", desc: "Subscription, upgrade, payment history", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg> },
              { href: "/dashboard/link-in-bio", label: "Link in Bio Editor", desc: "Templates, backgrounds, buttons, colors", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" /></svg> },
              { href: "/animations", label: "Animations Store", desc: "Premium intro effects for your link in bio", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg> },
            ].map(item => (
              <Link key={item.href} href={item.href} className="flex items-center gap-4 bg-white rounded-2xl border border-neutral-200 p-4 hover:border-neutral-300 hover:shadow-sm transition-all group">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-500 group-hover:bg-neutral-200 transition-colors">{item.icon}</div>
                <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-neutral-900">{item.label}</div><div className="text-xs text-neutral-400 mt-0.5">{item.desc}</div></div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-300 shrink-0"><path d="M9 18l6-6-6-6" strokeLinecap="round" /></svg>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Mobile bottom action bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 px-4 py-2 flex items-center gap-2 z-40" style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}>
        <button onClick={() => setEditProfile(true)} className="flex-1 py-2.5 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-xl">Edit Profile</button>
        {user.slug && <a href={`/u/${user.slug}`} className="flex-1 py-2.5 text-xs font-medium text-white bg-neutral-900 rounded-xl text-center">View Link in Bio</a>}
      </div>

      {/* Sheets */}
      <EditProfileSheet user={user} open={editProfile} onClose={() => setEditProfile(false)} />
      <SocialsSheet open={editSocials} onClose={() => setEditSocials(false)} />
      <ServicesSheet user={user} open={editServices} onClose={() => setEditServices(false)} />

      <style>{`
        @keyframes sheetFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sheetSlideUp { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
        @media (min-width: 640px) { @keyframes sheetSlideUp { from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } } }
        .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
