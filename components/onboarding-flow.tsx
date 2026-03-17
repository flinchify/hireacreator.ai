"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "./auth-context";
import { PlatformIcon } from "./icons/platforms";
import { useRouter } from "next/navigation";

type Step = "profile" | "socials" | "about" | "design" | "done";

const PLATFORMS = [
  "instagram", "tiktok", "youtube", "twitter", "linkedin",
  "twitch", "kick", "snapchat", "pinterest", "dribbble",
  "behance", "github", "spotify", "soundcloud", "website",
];

const ONBOARDING_TEMPLATES = [
  { id: "minimal", name: "Minimal", dark: false },
  { id: "glass", name: "Glass", dark: true },
  { id: "bold", name: "Bold", dark: true },
  { id: "neon", name: "Neon", dark: true },
  { id: "collage", name: "Collage", dark: true },
  { id: "bento", name: "Bento", dark: true },
  { id: "showcase", name: "Showcase", dark: false },
  { id: "split", name: "Split", dark: false },
];

export function OnboardingFlow() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Profile
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");

  // Socials
  const [socials, setSocials] = useState<{ platform: string; url: string }[]>([]);
  const [addingPlatform, setAddingPlatform] = useState("");

  // About
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  // Design
  const [template, setTemplate] = useState("minimal");

  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
    if (user?.avatar) { setAvatarUrl(user.avatar); setAvatarPreview(user.avatar); }
    if (user?.slug) setUsername(user.slug.split("-")[0]);
  }, [user]);

  const steps: { id: Step; label: string; num: number }[] = [
    { id: "profile", label: "Profile", num: 1 },
    { id: "socials", label: "Socials", num: 2 },
    { id: "about", label: "About", num: 3 },
    { id: "design", label: "Design", num: 4 },
  ];

  const currentIdx = steps.findIndex(s => s.id === step);

  async function uploadAvatar(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", "avatar");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) {
      setAvatarUrl(data.url);
      setAvatarPreview(data.url);
    }
  }

  async function saveProfile() {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: displayName }),
    });
    setSaving(false);
    setStep("socials");
  }

  function extractHandle(url: string, platform: string): string {
    // Try to get handle from URL, fallback to URL or platform
    try {
      const u = new URL(url);
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length > 0) return parts[parts.length - 1].replace("@", "");
    } catch {}
    return url.replace(/^@/, "") || platform;
  }

  async function saveSocials() {
    setSaving(true);
    for (const s of socials) {
      if (!s.url) continue;
      const handle = extractHandle(s.url, s.platform);
      await fetch("/api/profile/socials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: s.platform, handle: handle, url: s.url }),
      });
    }
    setSaving(false);
    setStep("about");
  }

  async function saveAbout() {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headline, bio, location }),
    });
    setSaving(false);
    setStep("design");
  }

  async function saveDesign() {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        link_bio_template: template,
        onboarding_complete: true,
      }),
    });
    await refreshUser();
    setSaving(false);
    setStep("done");
  }

  function addSocial(platform: string) {
    if (!socials.find(s => s.platform === platform)) {
      setSocials([...socials, { platform, url: "" }]);
    }
    setAddingPlatform("");
  }

  function updateSocialUrl(platform: string, url: string) {
    setSocials(socials.map(s => s.platform === platform ? { ...s, url } : s));
  }

  function removeSocial(platform: string) {
    setSocials(socials.filter(s => s.platform !== platform));
  }

  if (step === "done") {
    return (
      <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 mb-2">You're all set</h1>
          <p className="text-neutral-500 mb-8">Your link-in-bio page is live. Share it everywhere.</p>
          {user?.slug && (
            <div className="p-4 bg-neutral-50 rounded-2xl mb-6">
              <p className="text-xs text-neutral-400 mb-1">Your link</p>
              <p className="text-sm font-bold text-neutral-900">hireacreator.ai/u/{user.slug.split("-")[0]}</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push("/dashboard")} className="w-full py-3.5 bg-neutral-900 text-white font-semibold text-sm rounded-full hover:bg-neutral-800 transition-colors">
              Go to Dashboard
            </button>
            {user?.slug && (
              <button onClick={() => router.push(`/u/${user.slug}`)} className="w-full py-3.5 bg-neutral-100 text-neutral-900 font-semibold text-sm rounded-full hover:bg-neutral-200 transition-colors">
                View My Link in Bio
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto">
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]); }} />

      <div className="max-w-lg mx-auto px-5 py-8 min-h-screen flex flex-col">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-neutral-400">Step {currentIdx + 1} of {steps.length}</span>
            <button onClick={() => { setStep("done"); }} className="text-xs text-neutral-400 hover:text-neutral-600">Skip for now</button>
          </div>
          <div className="flex gap-1.5">
            {steps.map((s, i) => (
              <div key={s.id} className={`h-1 flex-1 rounded-full transition-all ${i <= currentIdx ? "bg-neutral-900" : "bg-neutral-200"}`} />
            ))}
          </div>
        </div>

        {/* ── Step 1: Profile ── */}
        {step === "profile" && (
          <div className="flex-1 flex flex-col">
            <h1 className="font-display text-2xl font-bold text-neutral-900 mb-1">Set up your profile</h1>
            <p className="text-sm text-neutral-500 mb-8">This is how creators and brands will see you.</p>

            {/* Avatar upload */}
            <div className="flex justify-center mb-8">
              <button onClick={() => fileRef.current?.click()} className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-100 border-2 border-dashed border-neutral-300 group-hover:border-neutral-400 transition-colors">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
                    </div>
                  )}
                </div>
                {uploading && <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" /></div>}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-neutral-900 rounded-full flex items-center justify-center shadow-md">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
                </div>
              </button>
            </div>
            <p className="text-center text-[11px] text-neutral-400 -mt-4 mb-6">Optional — add a photo later</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900"
                  maxLength={50}
                />
              </div>
            </div>

            <div className="mt-auto pt-8">
              <button
                onClick={saveProfile}
                disabled={!displayName.trim() || saving}
                className="w-full py-3.5 bg-neutral-900 text-white font-semibold text-sm rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-40"
              >
                {saving ? "Saving..." : "Continue"}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Socials ── */}
        {step === "socials" && (
          <div className="flex-1 flex flex-col">
            <h1 className="font-display text-2xl font-bold text-neutral-900 mb-1">Connect your socials</h1>
            <p className="text-sm text-neutral-500 mb-6">Add at least one to be visible on the marketplace.</p>

            {/* Added socials */}
            <div className="space-y-3 mb-5">
              {socials.map(s => (
                <div key={s.platform} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                    <PlatformIcon platform={s.platform} size={20} className="text-neutral-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-neutral-900 capitalize mb-1">{s.platform}</div>
                    <input
                      type="url"
                      value={s.url}
                      onChange={e => updateSocialUrl(s.platform, e.target.value)}
                      placeholder={`https://${s.platform}.com/yourprofile`}
                      className="w-full text-xs px-0 py-0 border-0 bg-transparent focus:outline-none text-neutral-600 placeholder:text-neutral-300"
                    />
                  </div>
                  <button onClick={() => removeSocial(s.platform)} className="p-1 text-neutral-300 hover:text-red-500 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Add platform */}
            <div className="flex flex-wrap gap-2 mb-4">
              {PLATFORMS.filter(p => !socials.find(s => s.platform === p)).map(p => (
                <button
                  key={p}
                  onClick={() => addSocial(p)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-neutral-200 hover:border-neutral-400 transition-colors text-xs font-medium text-neutral-600"
                >
                  <PlatformIcon platform={p} size={14} className="text-neutral-400" />
                  <span className="capitalize">{p}</span>
                </button>
              ))}
            </div>

            <div className="mt-auto pt-8 flex gap-3">
              <button onClick={() => setStep("profile")} className="px-6 py-3.5 bg-neutral-100 text-neutral-700 font-semibold text-sm rounded-full hover:bg-neutral-200 transition-colors">
                Back
              </button>
              <button
                onClick={saveSocials}
                disabled={saving}
                className="flex-1 py-3.5 bg-neutral-900 text-white font-semibold text-sm rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-40"
              >
                {saving ? "Saving..." : socials.length > 0 ? "Continue" : "Skip for now"}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: About ── */}
        {step === "about" && (
          <div className="flex-1 flex flex-col">
            <h1 className="font-display text-2xl font-bold text-neutral-900 mb-1">Tell us about yourself</h1>
            <p className="text-sm text-neutral-500 mb-6">Help brands understand what you do.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  placeholder="UGC Creator | Sydney, AU"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell brands what you do, your niche, and what makes you different..."
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 resize-none h-28"
                  maxLength={500}
                />
                <span className="text-[10px] text-neutral-400">{bio.length}/500</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Sydney, Australia"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900"
                />
              </div>
            </div>

            <div className="mt-auto pt-8 flex gap-3">
              <button onClick={() => setStep("socials")} className="px-6 py-3.5 bg-neutral-100 text-neutral-700 font-semibold text-sm rounded-full hover:bg-neutral-200 transition-colors">
                Back
              </button>
              <button
                onClick={saveAbout}
                disabled={saving}
                className="flex-1 py-3.5 bg-neutral-900 text-white font-semibold text-sm rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-40"
              >
                {saving ? "Saving..." : "Continue"}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Design ── */}
        {step === "design" && (
          <div className="flex-1 flex flex-col">
            <h1 className="font-display text-2xl font-bold text-neutral-900 mb-1">Choose your style</h1>
            <p className="text-sm text-neutral-500 mb-6">Pick a template — you can customize it later.</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {ONBOARDING_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`relative rounded-2xl overflow-hidden transition-all active:scale-95 ${template === t.id ? "ring-2 ring-neutral-900 ring-offset-2" : "hover:ring-1 hover:ring-neutral-300"}`}
                >
                  <div className={`aspect-[3/4] flex flex-col items-center justify-center gap-1.5 p-3 ${t.dark ? "bg-neutral-900" : "bg-neutral-100"}`}>
                    {/* Mini mockup */}
                    <div className={`w-10 h-10 rounded-full ${t.dark ? "bg-white/15" : "bg-neutral-300/50"}`} />
                    <div className={`w-16 h-1.5 rounded-full ${t.dark ? "bg-white/10" : "bg-neutral-200"}`} />
                    <div className="w-full space-y-1.5 mt-2">
                      <div className={`h-7 rounded-lg ${t.dark ? "bg-white/[0.06]" : "bg-white border border-neutral-200/60"}`} />
                      <div className={`h-7 rounded-lg ${t.dark ? "bg-white/[0.06]" : "bg-white border border-neutral-200/60"}`} />
                      <div className={`h-7 rounded-lg ${t.dark ? "bg-white/[0.06]" : "bg-white border border-neutral-200/60"}`} />
                    </div>
                  </div>
                  <div className="p-2 bg-white">
                    <div className="text-[11px] font-bold text-neutral-900">{t.name}</div>
                  </div>
                  {template === t.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-auto pt-6 flex gap-3">
              <button onClick={() => setStep("about")} className="px-6 py-3.5 bg-neutral-100 text-neutral-700 font-semibold text-sm rounded-full hover:bg-neutral-200 transition-colors">
                Back
              </button>
              <button
                onClick={saveDesign}
                disabled={saving}
                className="flex-1 py-3.5 bg-neutral-900 text-white font-semibold text-sm rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-40"
              >
                {saving ? "Creating..." : "Create My Link in Bio"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
