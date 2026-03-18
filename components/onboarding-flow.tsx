"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "./auth-context";
import { PlatformIcon } from "./icons/platforms";
import { useRouter } from "next/navigation";

type Step = "profile" | "socials" | "about" | "design" | "animation" | "done";

const PLATFORMS = [
  "instagram", "tiktok", "youtube", "twitter", "linkedin",
  "twitch", "kick", "snapchat", "pinterest", "dribbble",
  "behance", "github", "spotify", "soundcloud", "website",
];

const ONBOARDING_ANIMATIONS = [
  { id: "none", name: "None", desc: "No intro animation", free: true },
  { id: "fade-up", name: "Fade Up", desc: "Content slides up smoothly", free: true },
  { id: "fade-scale", name: "Scale In", desc: "Grows from center", free: true },
  { id: "spotlight", name: "Spotlight", desc: "Light reveals your page", free: false },
  { id: "glitch", name: "Glitch", desc: "Digital glitch effect", free: false },
  { id: "particle-burst", name: "Particle Burst", desc: "Particles explode then settle", free: false },
  { id: "typewriter", name: "Typewriter", desc: "Name types itself", free: false },
  { id: "wave", name: "Wave", desc: "Content ripples into view", free: false },
  { id: "neon", name: "Neon Flicker", desc: "Neon sign turning on", free: false },
  { id: "cinema", name: "Cinema", desc: "Cinematic letterbox reveal", free: false },
  { id: "morph", name: "Morph", desc: "Shapes morph into your page", free: false },
  { id: "trading-candles", name: "Trading Candles", desc: "Candlestick chart rises up", free: false },
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
  { id: "aurora", name: "Aurora", dark: true },
  { id: "brutalist", name: "Brutalist", dark: false },
  { id: "sunset", name: "Sunset", dark: true },
  { id: "terminal", name: "Terminal", dark: true },
  { id: "pastel", name: "Pastel", dark: false },
  { id: "magazine", name: "Magazine", dark: false },
  { id: "retro", name: "Retro", dark: true },
  { id: "midnight", name: "Midnight", dark: true },
  { id: "clay", name: "Clay", dark: false },
  { id: "gradient-mesh", name: "Gradient Mesh", dark: true },
];

export function OnboardingFlow() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Error state
  const [saveError, setSaveError] = useState("");

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

  // Animation
  const [introAnim, setIntroAnim] = useState("none");

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
    { id: "animation", label: "Animation", num: 5 },
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
    setSaveError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: displayName }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setSaveError(d.error === "unauthorized" ? "Session expired. Please refresh and log in again." : (d.message || "Failed to save profile. Try again."));
        setSaving(false);
        return;
      }
      setSaving(false);
      setStep("socials");
    } catch {
      setSaveError("Network error. Check your connection and try again.");
      setSaving(false);
    }
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
    setSaveError("");
    try {
      for (const s of socials) {
        if (!s.url) continue;
        const handle = extractHandle(s.url, s.platform);
        const res = await fetch("/api/profile/socials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform: s.platform, handle: handle, url: s.url }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          if (d.error === "unauthorized") {
            setSaveError("Session expired. Please refresh and log in again.");
            setSaving(false);
            return;
          }
          // Non-critical — skip this social but continue
          console.warn(`Failed to save ${s.platform}:`, d);
        }
      }
      setSaving(false);
      setStep("about");
    } catch {
      setSaveError("Network error. Check your connection and try again.");
      setSaving(false);
    }
  }

  async function saveAbout() {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline, bio, location }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setSaveError(d.error === "unauthorized" ? "Session expired. Please refresh and log in again." : (d.message || "Failed to save. Try again."));
        setSaving(false);
        return;
      }
      setSaving(false);
      setStep("design");
    } catch {
      setSaveError("Network error. Check your connection and try again.");
      setSaving(false);
    }
  }

  async function saveDesign() {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link_bio_template: template }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setSaveError(d.error === "unauthorized" ? "Session expired. Please refresh and log in again." : (d.message || "Failed to save. Try again."));
        setSaving(false);
        return;
      }
      setSaving(false);
      setStep("animation");
    } catch {
      setSaveError("Network error. Check your connection and try again.");
      setSaving(false);
    }
  }

  async function saveAnimation() {
    setSaving(true);
    setSaveError("");
    try {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        link_bio_intro_anim: introAnim,
        onboarding_complete: true,
      }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setSaveError(d.error === "unauthorized" ? "Session expired. Please refresh and log in again." : (d.message || "Failed to save. Try again."));
      setSaving(false);
      return;
    }
    await refreshUser();
    setSaving(false);
    setStep("done");
    } catch {
      setSaveError("Network error. Check your connection and try again.");
      setSaving(false);
    }
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
            <a href="/dashboard" className="w-full py-3.5 bg-neutral-900 text-white font-semibold text-sm rounded-full hover:bg-neutral-800 transition-colors text-center block">
              Go to Dashboard
            </a>
            {user?.slug && (
              <a href={`/u/${user.slug}`} className="w-full py-3.5 bg-neutral-100 text-neutral-900 font-semibold text-sm rounded-full hover:bg-neutral-200 transition-colors text-center block">
                View My Link in Bio
              </a>
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

        {/* Error banner */}
        {saveError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" strokeLinecap="round"/></svg>
            <div className="flex-1">
              <p className="text-xs font-medium text-red-700">{saveError}</p>
            </div>
            <button onClick={() => setSaveError("")} className="text-red-400 hover:text-red-600 shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg></button>
          </div>
        )}

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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {ONBOARDING_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`relative rounded-2xl overflow-hidden transition-all active:scale-95 ${template === t.id ? "ring-2 ring-neutral-900 ring-offset-2" : "hover:ring-1 hover:ring-neutral-300"}`}
                >
                  <TemplateMiniPreview id={t.id} />
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
                {saving ? "Saving..." : "Continue"}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Animation ── */}
        {step === "animation" && (
          <div className="flex-1 flex flex-col">
            <h1 className="font-display text-2xl font-bold text-neutral-900 mb-1">Add an intro animation</h1>
            <p className="text-sm text-neutral-500 mb-6">Plays once when someone visits your link in bio. Pick a free one now, or browse premium animations later.</p>

            <div className="space-y-2 mb-4">
              {ONBOARDING_ANIMATIONS.map(a => {
                const selectable = a.free;
                const selected = introAnim === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => selectable ? setIntroAnim(a.id) : undefined}
                    className={`flex items-center gap-3 p-3.5 rounded-xl text-left transition-all w-full ${
                      selected ? "bg-neutral-900 text-white" :
                      selectable ? "bg-neutral-50 text-neutral-600 hover:bg-neutral-100" :
                      "bg-neutral-50/60 text-neutral-400"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{a.name}</span>
                        {a.free && a.id !== "none" && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-bold rounded-full">FREE</span>
                        )}
                        {!a.free && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-bold rounded-full">$4.99</span>
                        )}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${selected ? "text-white/50" : "text-neutral-400"}`}>{a.desc}</div>
                    </div>
                    {selected && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg>
                    )}
                  </button>
                );
              })}
            </div>

            <a href="/animations" target="_blank" className="text-center text-xs text-blue-600 font-medium hover:text-blue-800 mb-4 block">
              Browse all premium animations in the store →
            </a>

            <div className="mt-auto pt-6 flex gap-3">
              <button onClick={() => setStep("design")} className="px-6 py-3.5 bg-neutral-100 text-neutral-700 font-semibold text-sm rounded-full hover:bg-neutral-200 transition-colors">
                Back
              </button>
              <button
                onClick={saveAnimation}
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

/* ── Template mini previews with distinctive shapes ── */
function TemplateMiniPreview({ id }: { id: string }) {
  const s = "aspect-[3/5] overflow-hidden relative";

  /* MINIMAL — White card, wavy cover edge, round avatar */
  if (id === "minimal") return (
    <div className={`${s} bg-neutral-200 flex items-center justify-center p-2`}>
      <div className="w-full h-full bg-white rounded-xl flex flex-col items-center overflow-hidden relative">
        <div className="w-full h-10 bg-gradient-to-br from-neutral-100 to-neutral-200 relative">
          <svg viewBox="0 0 100 14" className="absolute -bottom-[1px] left-0 w-full" preserveAspectRatio="none"><path d="M0 14 Q25 0 50 10 Q75 20 100 5 L100 14 Z" fill="white"/></svg>
        </div>
        <div className="w-10 h-10 rounded-full bg-neutral-300 -mt-5 border-[3px] border-white z-10 shrink-0" />
        <div className="w-12 h-1.5 rounded-full bg-neutral-800 mt-1.5" />
        <div className="w-8 h-1 rounded-full bg-neutral-300 mt-1" />
        <div className="flex gap-1.5 mt-2">{[1,2,3].map(i=><div key={i} className="w-5 h-5 rounded-full bg-neutral-100"/>)}</div>
        <div className="w-full px-2 mt-2 space-y-1.5">
          <div className="h-6 rounded-xl bg-neutral-50 border border-neutral-200" />
          <div className="h-6 rounded-xl bg-neutral-50 border border-neutral-200" />
        </div>
        <div className="w-[calc(100%-16px)] h-5 rounded-full bg-neutral-900 mt-2 mb-2" />
      </div>
    </div>
  );

  /* GLASS — Gradient with floating orbs */
  if (id === "glass") return (
    <div className={`${s} flex flex-col items-center justify-center px-3`} style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <div className="absolute top-3 right-2 w-10 h-10 rounded-full bg-pink-400/30 blur-md" />
      <div className="absolute bottom-5 left-1 w-12 h-12 rounded-full bg-blue-400/20 blur-lg" />
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="w-11 h-11 rounded-full bg-white/20 border-[3px] border-white/25 shadow-xl" />
        <div className="w-12 h-1.5 rounded-full bg-white/40 mt-2" />
        <div className="w-8 h-1 rounded-full bg-white/20 mt-1" />
        <div className="flex gap-1.5 mt-2">{[1,2,3].map(i=><div key={i} className="w-5 h-5 rounded-full bg-white/10 border border-white/15"/>)}</div>
        <div className="w-full space-y-1.5 mt-3">
          <div className="h-6 rounded-xl bg-white/[0.08] border border-white/[0.12]" />
          <div className="h-6 rounded-xl bg-white/[0.08] border border-white/[0.12]" />
        </div>
        <div className="w-full h-5 rounded-full bg-white mt-2" />
      </div>
    </div>
  );

  /* BOLD — Dark, hexagonal avatar, accent diagonal stripe */
  if (id === "bold") return (
    <div className={`${s} bg-neutral-950 flex flex-col items-center pt-3 px-3`}>
      <div className="absolute top-0 right-0 w-14 h-full bg-indigo-500/[0.07] -skew-x-12 translate-x-4" />
      <div className="relative z-10 flex flex-col items-center w-full">
        <svg viewBox="0 0 44 48" className="w-12 h-14 shrink-0">
          <polygon points="22,2 42,14 42,34 22,46 2,34 2,14" fill="#1a1a1a" stroke="#6366f1" strokeWidth="2.5"/>
          <circle cx="22" cy="24" r="9" fill="#6366f1" opacity="0.2"/>
        </svg>
        <div className="w-14 h-2 rounded-full bg-white mt-1.5" />
        <div className="w-6 h-1 rounded-full bg-indigo-400 mt-1" />
        <div className="flex gap-1.5 mt-2">{[1,2,3].map(i=><div key={i} className="w-5 h-5 rounded-lg bg-neutral-900 border border-neutral-800"/>)}</div>
        <div className="w-10 h-[2px] bg-indigo-500 mt-3 mb-2" />
        <div className="w-full space-y-1.5">
          <div className="h-6 rounded-xl bg-neutral-900 border border-neutral-800" />
          <div className="h-6 rounded-xl bg-neutral-900 border border-neutral-800" />
        </div>
        <div className="w-full h-5 rounded-full bg-indigo-500 mt-2" />
      </div>
    </div>
  );

  /* NEON — Black, double-ring avatar, scanlines, corner brackets */
  if (id === "neon") return (
    <div className={`${s} bg-black flex flex-col items-center pt-4 px-3`}>
      <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:"repeating-linear-gradient(0deg, #22d3ee 0px, transparent 1px, transparent 4px)"}}/>
      <div className="absolute top-1.5 left-1.5 w-3 h-[1px] bg-cyan-400/40"/><div className="absolute top-1.5 left-1.5 w-[1px] h-3 bg-cyan-400/40"/>
      <div className="absolute bottom-1.5 right-1.5 w-3 h-[1px] bg-cyan-400/40"/><div className="absolute bottom-1.5 right-1.5 w-[1px] h-3 bg-cyan-400/40"/>
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="relative w-11 h-11">
          <div className="absolute inset-0 rounded-full border border-cyan-400/20 scale-[1.35]" />
          <div className="w-full h-full rounded-full border-2 border-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.5)]" />
        </div>
        <div className="w-12 h-1.5 rounded-full bg-white mt-2" />
        <div className="w-6 h-1 rounded-full bg-cyan-400 mt-1" />
        <div className="flex gap-1.5 mt-2">{[1,2,3].map(i=><div key={i} className="w-5 h-5 rounded-full border border-cyan-400/30 bg-cyan-400/10"/>)}</div>
        <div className="w-full space-y-1.5 mt-3">
          <div className="h-6 rounded-xl border border-cyan-400/25 bg-cyan-400/[0.06] shadow-[0_0_10px_rgba(34,211,238,0.1)]" />
          <div className="h-6 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04]" />
        </div>
        <div className="w-full h-5 rounded-full bg-cyan-400 mt-2 shadow-[0_0_16px_rgba(34,211,238,0.4)]" />
      </div>
    </div>
  );

  /* COLLAGE — Tilted photo mosaic, diamond avatar, frosted card */
  if (id === "collage") return (
    <div className={`${s}`}>
      <div className="absolute inset-[-10%] grid grid-cols-3 grid-rows-3 gap-[2px] rotate-[-6deg] scale-[1.15]">
        <div className="bg-rose-400 rounded-sm"/><div className="bg-sky-300 rounded-sm"/><div className="bg-amber-300 rounded-sm"/>
        <div className="bg-emerald-300 rounded-sm"/><div className="bg-violet-400 rounded-sm"/><div className="bg-orange-300 rounded-sm"/>
        <div className="bg-teal-300 rounded-sm"/><div className="bg-pink-300 rounded-sm"/><div className="bg-indigo-300 rounded-sm"/>
      </div>
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-3">
        <div className="w-full bg-black/40 rounded-2xl p-3 border border-white/10 flex flex-col items-center" style={{backdropFilter:"blur(8px)"}}>
          <div className="w-9 h-9 rotate-45 rounded-lg bg-white/20 border border-white/25 overflow-hidden flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-white/15 -rotate-45"/>
          </div>
          <div className="w-12 h-1.5 rounded-full bg-white/40 mt-2" />
          <div className="w-7 h-1 rounded-full bg-white/20 mt-1" />
          <div className="flex gap-1 mt-1.5">{[1,2,3].map(i=><div key={i} className="w-4 h-4 rounded-md bg-white/10"/>)}</div>
        </div>
        <div className="w-full space-y-1.5 mt-2">
          <div className="h-5 rounded-xl bg-black/40 border border-white/10" />
          <div className="h-5 rounded-xl bg-black/40 border border-white/10" />
        </div>
        <div className="w-full h-5 rounded-full bg-white/90 mt-2" />
      </div>
    </div>
  );

  /* BENTO — Dark, grid boxes, violet portfolio tiles */
  if (id === "bento") return (
    <div className={`${s} bg-neutral-950 p-2`}>
      <div className="w-full h-full grid grid-cols-4 gap-1 auto-rows-fr">
        <div className="col-span-4 row-span-2 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2 px-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-700 shrink-0" />
          <div><div className="w-10 h-1.5 bg-white/50 rounded-full"/><div className="w-6 h-1 bg-white/20 rounded-full mt-1"/></div>
        </div>
        <div className="col-span-2 row-span-1 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center gap-1">
          {[1,2,3].map(i=><div key={i} className="w-4 h-4 rounded bg-neutral-800"/>)}
        </div>
        <div className="col-span-2 row-span-1 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
          <div className="w-8 h-1 bg-neutral-600 rounded-full"/>
        </div>
        <div className="col-span-2 row-span-2 rounded-xl bg-gradient-to-br from-violet-900/40 to-violet-800/20 border border-violet-500/20" />
        <div className="col-span-2 row-span-2 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-800" />
        <div className="col-span-4 row-span-1 rounded-xl bg-neutral-200 flex items-center justify-center">
          <div className="w-10 h-1 bg-neutral-700 rounded-full"/>
        </div>
      </div>
    </div>
  );

  /* SHOWCASE — Light, rounded-xl avatar, 2-col masonry portfolio */
  if (id === "showcase") return (
    <div className={`${s} bg-neutral-100 flex items-center justify-center p-2`}>
      <div className="w-full h-full bg-white rounded-xl flex flex-col items-center overflow-hidden px-2 pt-3 pb-2">
        <div className="flex items-center gap-2 w-full mb-2">
          <div className="w-9 h-9 rounded-xl bg-neutral-200 shrink-0" />
          <div><div className="w-10 h-1.5 bg-neutral-800 rounded-full"/><div className="w-6 h-1 bg-neutral-300 rounded-full mt-1"/></div>
        </div>
        <div className="flex gap-1.5 mb-2">{[1,2,3].map(i=><div key={i} className="w-5 h-5 rounded-lg bg-neutral-100 border border-neutral-200"/>)}</div>
        <div className="w-full grid grid-cols-2 gap-1 mb-2">
          <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200"/>
          <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100"/>
        </div>
        <div className="w-full grid grid-cols-2 gap-1 mb-2">
          <div className="h-6 rounded-xl bg-neutral-50 border border-neutral-200" />
          <div className="h-6 rounded-xl bg-neutral-50 border border-neutral-200" />
        </div>
        <div className="w-full h-5 rounded-full bg-neutral-900 mt-auto" />
      </div>
    </div>
  );

  /* SPLIT — Diagonal cut between hero and content, overlapping avatar */
  if (id === "split") return (
    <div className={`${s}`}>
      <div className="flex w-full h-full">
        <div className="w-[43%] bg-gradient-to-b from-neutral-300 to-neutral-400 relative">
          <svg viewBox="0 0 12 100" className="absolute top-0 -right-[1px] h-full w-3" preserveAspectRatio="none"><polygon points="0,0 12,6 12,94 0,100" fill="white"/></svg>
        </div>
        <div className="w-[57%] bg-white flex flex-col justify-center gap-1.5 px-2.5 py-3 relative">
          <div className="absolute -left-3.5 top-4 w-7 h-7 rounded-full bg-neutral-300 border-[3px] border-white shadow-lg z-10"/>
          <div className="ml-3">
            <div className="w-10 h-1.5 bg-neutral-800 rounded-full"/>
            <div className="w-6 h-1 bg-neutral-300 rounded-full mt-1"/>
          </div>
          <div className="flex gap-1 mt-1">{[1,2].map(i=><div key={i} className="px-2 py-1 rounded-full bg-neutral-50 border border-neutral-200"><div className="w-4 h-0.5 bg-neutral-400 rounded-full"/></div>)}</div>
          <div className="space-y-1 mt-1">
            <div className="h-6 rounded-xl bg-neutral-50 border border-neutral-200" />
            <div className="h-6 rounded-xl bg-neutral-50 border border-neutral-200" />
          </div>
          <div className="w-full h-5 rounded-full bg-neutral-900 mt-auto" />
        </div>
      </div>
    </div>
  );

  /* AURORA — Dark with colorful blurred orbs */
  if (id === "aurora") return (
    <div className={`${s}`} style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <div className="absolute top-1 left-2 w-8 h-8 rounded-full bg-purple-500/30 blur-lg" />
      <div className="absolute bottom-3 right-1 w-10 h-10 rounded-full bg-teal-400/20 blur-xl" />
      <div className="absolute top-1/2 left-0 w-6 h-6 rounded-full bg-pink-500/20 blur-lg" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-2">
        <div className="w-9 h-9 rounded-full bg-white/15 border-2 border-purple-400/30" />
        <div className="w-11 h-1.5 rounded-full bg-white/30 mt-1.5" />
        <div className="w-full space-y-1.5 mt-2 px-1">
          <div className="h-5 rounded-lg bg-white/[0.06] border border-purple-400/15" />
          <div className="h-5 rounded-lg bg-white/[0.06] border border-purple-400/15" />
        </div>
        <div className="w-full h-4 rounded-full mt-2 mx-1" style={{ background: "linear-gradient(135deg, #a78bfa, #818cf8)" }} />
      </div>
    </div>
  );

  /* BRUTALIST — White, thick black borders */
  if (id === "brutalist") return (
    <div className={`${s} bg-white flex flex-col items-center pt-4 px-2`}>
      <div className="w-10 h-10 border-[2px] border-black bg-neutral-100" />
      <div className="w-14 h-2 bg-black mt-2" />
      <div className="w-8 h-0.5 bg-neutral-400 mt-1" />
      <div className="flex gap-1 mt-2">{[1,2,3].map(i=><div key={i} className="w-5 h-5 border-[1.5px] border-black"/>)}</div>
      <div className="w-full space-y-1.5 mt-3 px-1">
        <div className="h-6 border-[2px] border-black" />
        <div className="h-6 border-[2px] border-black" />
      </div>
      <div className="w-full h-5 bg-black mt-2 mx-1" />
    </div>
  );

  /* SUNSET — Warm gradient */
  if (id === "sunset") return (
    <div className={`${s} flex flex-col items-center justify-center px-2`} style={{ background: "linear-gradient(180deg, #ff6b6b 0%, #ee5a24 40%, #f39c12 100%)" }}>
      <div className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/30" />
      <div className="w-11 h-1.5 rounded-full bg-white/40 mt-1.5" />
      <div className="w-full space-y-1.5 mt-3">
        <div className="h-5 rounded-full bg-white/20 border border-white/15" />
        <div className="h-5 rounded-full bg-white/20 border border-white/15" />
      </div>
      <div className="w-full h-4 rounded-full bg-white mt-2" />
    </div>
  );

  /* TERMINAL — Green on black */
  if (id === "terminal") return (
    <div className={`${s} bg-[#0a0a0a] flex flex-col items-center pt-3 px-2`}>
      <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:"repeating-linear-gradient(0deg, #00ff00 0px, transparent 1px, transparent 3px)"}}/>
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="w-full h-1.5 bg-green-500/20 rounded-full mb-2" />
        <div className="w-9 h-9 rounded border border-green-500/40 bg-green-500/5" />
        <div className="w-11 h-1.5 rounded-full bg-green-400/40 mt-1.5" />
        <div className="w-full space-y-1.5 mt-3">
          <div className="h-5 rounded-sm border border-green-500/20 bg-green-500/5 flex items-center px-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1"/><div className="w-8 h-0.5 bg-green-400/30 rounded-full"/></div>
          <div className="h-5 rounded-sm border border-green-500/20 bg-green-500/5 flex items-center px-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1"/><div className="w-10 h-0.5 bg-green-400/30 rounded-full"/></div>
        </div>
        <div className="w-full h-4 bg-green-500 rounded-sm mt-2" />
      </div>
    </div>
  );

  /* PASTEL — Soft gradient */
  if (id === "pastel") return (
    <div className={`${s} flex flex-col items-center justify-center px-2`} style={{ background: "linear-gradient(180deg, #fce4ec 0%, #e8eaf6 50%, #e0f7fa 100%)" }}>
      <div className="w-9 h-9 rounded-full bg-white/80 border-2 border-white shadow-sm" />
      <div className="w-11 h-1.5 rounded-full bg-neutral-700/30 mt-1.5" />
      <div className="w-full space-y-1.5 mt-3">
        <div className="h-5 rounded-2xl bg-white/70 border border-white shadow-sm" />
        <div className="h-5 rounded-2xl bg-white/70 border border-white shadow-sm" />
      </div>
      <div className="w-full h-4 rounded-full mt-2" style={{ background: "#6c5ce7" }} />
    </div>
  );

  /* MAGAZINE — Editorial, left-aligned */
  if (id === "magazine") return (
    <div className={`${s} bg-[#fafaf8] flex flex-col pt-4 px-2`}>
      <div className="flex items-start gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-neutral-200 shrink-0" />
        <div className="pt-0.5"><div className="w-12 h-1.5 bg-neutral-800 rounded-full"/><div className="w-7 h-0.5 bg-neutral-300 rounded-full mt-1"/></div>
      </div>
      <div className="w-full h-[1px] bg-neutral-200 my-1.5" />
      <div className="space-y-0">
        <div className="flex items-center justify-between py-2 border-b border-neutral-200"><div className="w-12 h-0.5 bg-neutral-600 rounded-full"/><div className="w-4 h-0.5 bg-neutral-400 rounded-full"/></div>
        <div className="flex items-center justify-between py-2 border-b border-neutral-200"><div className="w-10 h-0.5 bg-neutral-600 rounded-full"/><div className="w-4 h-0.5 bg-neutral-400 rounded-full"/></div>
        <div className="flex items-center justify-between py-2 border-b border-neutral-200"><div className="w-14 h-0.5 bg-neutral-600 rounded-full"/><div className="w-4 h-0.5 bg-neutral-400 rounded-full"/></div>
      </div>
      <div className="w-full h-5 rounded-full bg-neutral-900 mt-3" />
    </div>
  );

  /* RETRO — Synthwave */
  if (id === "retro") return (
    <div className={`${s}`} style={{ background: "linear-gradient(180deg, #1a0533 0%, #2d1b69 50%, #0f0c29 100%)" }}>
      <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-20" style={{backgroundImage:"linear-gradient(rgba(236,72,153,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.4) 1px, transparent 1px)", backgroundSize:"12px 12px", transform:"perspective(100px) rotateX(30deg)", transformOrigin:"bottom"}}/>
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-2">
        <div className="w-9 h-9 rounded-full border-2 border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]" />
        <div className="w-11 h-1.5 rounded-full bg-pink-400/50 mt-1.5" />
        <div className="w-full space-y-1.5 mt-3">
          <div className="h-5 rounded-lg border border-pink-500/20 bg-pink-500/5" />
          <div className="h-5 rounded-lg border border-pink-500/20 bg-pink-500/5" />
        </div>
        <div className="w-full h-4 rounded-full mt-2" style={{ background: "linear-gradient(90deg, #ec4899, #a855f7)" }} />
      </div>
    </div>
  );

  /* MIDNIGHT — Navy + gold */
  if (id === "midnight") return (
    <div className={`${s} bg-[#0a1628] flex flex-col items-center justify-center px-2`}>
      <div className="w-9 h-9 rounded-full border-2 border-amber-600/50 bg-amber-600/5" />
      <div className="w-11 h-1.5 rounded-full bg-amber-100/40 mt-1.5" />
      <div className="w-full space-y-1.5 mt-3">
        <div className="h-5 rounded-lg bg-white/[0.04] border border-amber-600/15" />
        <div className="h-5 rounded-lg bg-white/[0.04] border border-amber-600/15" />
      </div>
      <div className="w-full h-4 rounded-full mt-2" style={{ background: "linear-gradient(135deg, #d4a574, #b8860b)" }} />
    </div>
  );

  /* CLAY — Neumorphic */
  if (id === "clay") return (
    <div className={`${s} bg-[#e8e4df] flex flex-col items-center justify-center px-2`}>
      <div className="w-9 h-9 rounded-xl bg-[#e8e4df]" style={{ boxShadow: "3px 3px 6px #c5c1bc, -3px -3px 6px #fff" }} />
      <div className="w-11 h-1.5 rounded-full bg-neutral-500/30 mt-2" />
      <div className="w-full space-y-2 mt-3">
        <div className="h-6 rounded-xl bg-[#e8e4df]" style={{ boxShadow: "2px 2px 5px #c5c1bc, -2px -2px 5px #fff" }} />
        <div className="h-6 rounded-xl bg-[#e8e4df]" style={{ boxShadow: "2px 2px 5px #c5c1bc, -2px -2px 5px #fff" }} />
      </div>
      <div className="w-full h-5 rounded-xl bg-neutral-600 mt-2" style={{ boxShadow: "2px 2px 5px #c5c1bc, -2px -2px 5px #fff" }} />
    </div>
  );

  /* GRADIENT MESH — Colorful blobs on black */
  if (id === "gradient-mesh") return (
    <div className={`${s} bg-black overflow-hidden`}>
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[40%] rounded-full bg-purple-600/40 blur-xl" />
      <div className="absolute top-[30%] right-[-5%] w-[40%] h-[30%] rounded-full bg-blue-500/30 blur-xl" />
      <div className="absolute bottom-[-5%] left-[20%] w-[40%] h-[30%] rounded-full bg-emerald-500/25 blur-xl" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-2">
        <div className="w-9 h-9 rounded-full bg-white/15 border border-white/20" />
        <div className="w-11 h-1.5 rounded-full bg-white/30 mt-1.5" />
        <div className="w-full space-y-1.5 mt-3">
          <div className="h-5 rounded-lg bg-white/[0.08] border border-white/10" />
          <div className="h-5 rounded-lg bg-white/[0.08] border border-white/10" />
        </div>
        <div className="w-full h-4 rounded-full bg-white/15 border border-white/20 mt-2" />
      </div>
    </div>
  );

  return <div className={`${s} bg-neutral-100 flex items-center justify-center`}><div className="w-10 h-10 rounded-full bg-neutral-300/50" /></div>;
}
