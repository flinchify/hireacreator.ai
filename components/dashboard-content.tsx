"use client";

import { useState, useEffect } from "react";
import { useAuth, User } from "./auth-context";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import Link from "next/link";

type Tab = "overview" | "profile" | "services" | "messages" | "analytics";

function OverviewTab({ user }: { user: User }) {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-sm text-neutral-500 mb-1">Profile Views</div>
          <div className="font-display text-2xl font-bold text-neutral-900">—</div>
          <div className="text-xs text-neutral-400 mt-1">Coming soon</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-neutral-500 mb-1">Total Projects</div>
          <div className="font-display text-2xl font-bold text-neutral-900">{user.totalProjects}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-neutral-500 mb-1">Rating</div>
          <div className="font-display text-2xl font-bold text-neutral-900">{user.rating > 0 ? user.rating.toFixed(1) : "—"}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-neutral-500 mb-1">Reviews</div>
          <div className="font-display text-2xl font-bold text-neutral-900">{user.reviewCount}</div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-display font-bold text-neutral-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href={user.slug ? `/creators/${user.slug}` : "#"}>
            <Button variant="outline" size="sm">View My Profile</Button>
          </Link>
          <Link href="/browse">
            <Button variant="outline" size="sm">Browse Creators</Button>
          </Link>
          <Link href="/animations">
            <Button variant="outline" size="sm">Get Profile Animation</Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="sm">Upgrade Plan</Button>
          </Link>
        </div>
      </Card>

      {!user.isPro && (
        <Card className="p-6 border-amber-200 bg-amber-50">
          <h3 className="font-display font-bold text-neutral-900 mb-2">Upgrade to Pro</h3>
          <p className="text-sm text-neutral-600 mb-4">Unlimited services, custom domain, priority search, advanced analytics, and premium templates.</p>
          <Link href="/pricing"><Button size="sm">View Plans — from $19/mo</Button></Link>
        </Card>
      )}
    </div>
  );
}

function ProfileTab({ user }: { user: User }) {
  const { refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
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

  const [newSocial, setNewSocial] = useState({ platform: "", handle: "", url: "" });
  const [socials, setSocials] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => {
      if (d.socials) setSocials(d.socials);
    }).catch(() => {});
  }, []);

  async function saveProfile() {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null,
      }),
    });
    await refreshUser();
    setSaving(false);
  }

  async function addSocial() {
    if (!newSocial.platform || !newSocial.handle) return;
    const res = await fetch("/api/profile/socials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSocial),
    });
    const data = await res.json();
    if (data.id) {
      setSocials([...socials, { ...newSocial, id: data.id }]);
      setNewSocial({ platform: "", handle: "", url: "" });
    }
  }

  async function removeSocial(id: string) {
    await fetch(`/api/profile/socials?id=${id}`, { method: "DELETE" });
    setSocials(socials.filter(s => s.id !== id));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="p-6">
        <h3 className="font-display font-bold text-neutral-900 mb-4">Profile Details</h3>
        <div className="space-y-4">
          <Input label="Display Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          <Input label="Username (slug)" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="your-name" />
          <Input label="Headline" value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })} placeholder="UGC Creator & Photographer" />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-y"
              rows={4}
              placeholder="Tell brands about yourself..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Sydney, AU" />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="">Select</option>
                {["UGC Creator","Video Editor","Photographer","Graphic Designer","Social Media Manager","Copywriter","Brand Strategist","Motion Designer","Consultant","Automotive","Education / Tech","Influencer","Developer","Music Producer"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <Input label="Hourly Rate ($)" type="number" value={form.hourly_rate} onChange={e => setForm({ ...form, hourly_rate: e.target.value })} placeholder="150" />
          <Input label="Website URL" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} placeholder="https://yoursite.com" />
          <Input label="Business Name" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} placeholder="My Agency" />
          <Input label="Business URL" value={form.business_url} onChange={e => setForm({ ...form, business_url: e.target.value })} placeholder="https://mybusiness.com" />
          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_online" checked={form.is_online} onChange={e => setForm({ ...form, is_online: e.target.checked })} className="rounded" />
            <label htmlFor="is_online" className="text-sm text-neutral-700">Show as online now</label>
          </div>
          <Button onClick={saveProfile} disabled={saving} className="w-full">{saving ? "Saving..." : "Save Profile"}</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-display font-bold text-neutral-900 mb-4">Social Links</h3>
        {socials.length > 0 && (
          <div className="space-y-2 mb-4">
            {socials.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-100">
                <div className="text-sm">
                  <span className="font-medium text-neutral-900 capitalize">{s.platform}</span>
                  <span className="text-neutral-400 ml-2">{s.handle}</span>
                </div>
                <button onClick={() => removeSocial(s.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          <select value={newSocial.platform} onChange={e => setNewSocial({ ...newSocial, platform: e.target.value })} className="px-3 py-2 rounded-lg border border-neutral-300 text-sm">
            <option value="">Platform</option>
            {["instagram","tiktok","youtube","twitter","linkedin","twitch","spotify","pinterest","facebook","snapchat","discord","github","reddit","website","other"].map(p => (
              <option key={p} value={p} className="capitalize">{p}</option>
            ))}
          </select>
          <Input placeholder="@handle or URL" value={newSocial.handle} onChange={e => setNewSocial({ ...newSocial, handle: e.target.value })} />
          <Button onClick={addSocial} variant="outline" size="sm">Add</Button>
        </div>
      </Card>
    </div>
  );
}

function ServicesTab({ user }: { user: User }) {
  const [services, setServices] = useState<any[]>([]);
  const [newService, setNewService] = useState({ title: "", description: "", price: "", delivery_days: "7", category: "" });

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => {
      if (d.services) setServices(d.services);
    }).catch(() => {});
  }, []);

  async function addService() {
    if (!newService.title || !newService.price) return;
    const res = await fetch("/api/profile/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newService.title,
        description: newService.description,
        price: Number(newService.price),
        delivery_days: Number(newService.delivery_days) || 7,
        category: newService.category || null,
      }),
    });
    const data = await res.json();
    if (data.id) {
      setServices([...services, { ...newService, id: data.id, price: Number(newService.price) }]);
      setNewService({ title: "", description: "", price: "", delivery_days: "7", category: "" });
    } else if (data.error === "max_services") {
      alert(data.message);
    }
  }

  async function deleteService(id: string) {
    await fetch(`/api/profile/services?id=${id}`, { method: "DELETE" });
    setServices(services.filter(s => s.id !== id));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="p-6">
        <h3 className="font-display font-bold text-neutral-900 mb-1">Your Services</h3>
        <p className="text-sm text-neutral-500 mb-4">
          {user.isPro ? "Unlimited services with Pro." : "Free accounts can list up to 3 services."}
        </p>

        {services.length > 0 && (
          <div className="space-y-3 mb-6">
            {services.map((s: any) => (
              <div key={s.id} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900">{s.title}</div>
                    <div className="text-sm text-neutral-500 mt-0.5">{s.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-neutral-900">{Number(s.price) === 0 ? "Open to offers" : `$${Number(s.price).toLocaleString()}`}</div>
                    <div className="text-xs text-neutral-400">{s.delivery_days}d delivery</div>
                  </div>
                </div>
                <button onClick={() => deleteService(s.id)} className="text-xs text-red-500 hover:text-red-700 mt-2">Delete</button>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-neutral-200 pt-4 space-y-3">
          <h4 className="font-medium text-neutral-900 text-sm">Add New Service</h4>
          <Input label="Service Title" value={newService.title} onChange={e => setNewService({ ...newService, title: e.target.value })} placeholder="UGC Video Package" />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
            <textarea
              value={newService.description}
              onChange={e => setNewService({ ...newService, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-y"
              rows={2}
              placeholder="What's included..."
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Price ($)" type="number" value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} placeholder="500" />
            <Input label="Delivery (days)" type="number" value={newService.delivery_days} onChange={e => setNewService({ ...newService, delivery_days: e.target.value })} placeholder="7" />
            <Input label="Category" value={newService.category} onChange={e => setNewService({ ...newService, category: e.target.value })} placeholder="UGC" />
          </div>
          <Button onClick={addService} className="w-full">Add Service</Button>
        </div>
      </Card>
    </div>
  );
}

function MessagesTab() {
  return (
    <Card className="p-8 text-center">
      <div className="text-4xl mb-4">💬</div>
      <h3 className="font-display font-bold text-neutral-900 mb-2">Messages coming soon</h3>
      <p className="text-sm text-neutral-500">Brand-to-creator messaging is being built. You'll be able to receive booking inquiries and negotiate deals here.</p>
    </Card>
  );
}

function AnalyticsTab({ user }: { user: User }) {
  if (!user.isPro) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="font-display font-bold text-neutral-900 mb-2">Upgrade to see analytics</h3>
        <p className="text-sm text-neutral-500 mb-4">Pro creators get profile views, click tracking, referral sources, and conversion analytics.</p>
        <Link href="/pricing"><Button>Upgrade to Pro — $19/mo</Button></Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-sm text-neutral-500 mb-1">Profile Views (30d)</div>
          <div className="font-display text-2xl font-bold text-neutral-900">—</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-neutral-500 mb-1">Booking Inquiries</div>
          <div className="font-display text-2xl font-bold text-neutral-900">—</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-neutral-500 mb-1">Conversion Rate</div>
          <div className="font-display text-2xl font-bold text-neutral-900">—</div>
        </Card>
      </div>
      <Card className="p-6">
        <p className="text-sm text-neutral-500">Detailed analytics data will populate as your profile receives traffic.</p>
      </Card>
    </div>
  );
}

export function DashboardContent() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  if (loading) {
    return <div className="pt-32 text-center text-neutral-400">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="pt-32 text-center">
        <h2 className="font-display text-2xl font-bold text-neutral-900 mb-4">Please sign in</h2>
        <p className="text-neutral-500 mb-6">You need to be logged in to access your dashboard.</p>
        <Link href="/"><Button>Go Home</Button></Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "profile", label: "Edit Profile" },
    { key: "services", label: "Services" },
    { key: "messages", label: "Messages" },
    { key: "analytics", label: "Analytics" },
  ];

  return (
    <div className="pt-28 sm:pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900">
            Welcome back, {user.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-neutral-500 mt-1">
            {user.role === "creator" && "Manage your creator profile, services, and bookings."}
            {user.role === "brand" && "Find creators, manage campaigns, and track ROI."}
            {user.role === "agent" && "Manage your API keys and integrations."}
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                tab === t.key
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              {t.label}
              {t.key === "analytics" && !user.isPro && (
                <span className="ml-1 text-[9px] font-bold uppercase px-1 py-0.5 bg-amber-500 text-white rounded-full">PRO</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "overview" && <OverviewTab user={user} />}
        {tab === "profile" && <ProfileTab user={user} />}
        {tab === "services" && <ServicesTab user={user} />}
        {tab === "messages" && <MessagesTab />}
        {tab === "analytics" && <AnalyticsTab user={user} />}
      </div>
    </div>
  );
}
