"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import type { Creator } from "@/lib/types";

/* ── Types ── */
type Settings = {
  template: string;
  accent: string;
  bgType: string;
  bgValue: string;
  bgVideo: string;
  buttonShape: string;
  buttonAnim: string;
};

/* ── Templates ── */
const TEMPLATES: { id: string; name: string; desc: string; dark: boolean; preview: string }[] = [
  { id: "minimal", name: "Minimal", desc: "Clean white card", dark: false, preview: "bg-neutral-200" },
  { id: "glass", name: "Glass", desc: "Frosted blur", dark: true, preview: "bg-gradient-to-br from-neutral-800 to-neutral-950" },
  { id: "bold", name: "Bold", desc: "Dark + accent", dark: true, preview: "bg-neutral-950" },
  { id: "showcase", name: "Showcase", desc: "Media grid", dark: false, preview: "bg-neutral-100" },
  { id: "neon", name: "Neon", desc: "Futuristic glow", dark: true, preview: "bg-black" },
  { id: "collage", name: "Collage", desc: "Photo mosaic", dark: true, preview: "bg-gradient-to-br from-neutral-700 to-neutral-900" },
  { id: "bento", name: "Bento", desc: "Grid boxes", dark: true, preview: "bg-neutral-950" },
  { id: "split", name: "Split", desc: "Magazine layout", dark: false, preview: "bg-white" },
];

const GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
  "linear-gradient(180deg, #0c0c0c 0%, #1a1a2e 100%)",
  "linear-gradient(135deg, #232526 0%, #414345 100%)",
  "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  "linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)",
];

const ACCENT_COLORS = [
  "#6366f1", "#22d3ee", "#ef4444", "#f97316", "#22c55e",
  "#a855f7", "#ec4899", "#eab308", "#14b8a6", "#171717",
];

const BUTTON_SHAPES = [
  { id: "rounded", name: "Rounded", radius: "16px" },
  { id: "pill", name: "Pill", radius: "9999px" },
  { id: "square", name: "Square", radius: "0px" },
  { id: "soft", name: "Soft", radius: "8px" },
];

const BUTTON_ANIMS = [
  { id: "none", name: "None" },
  { id: "bounce", name: "Bounce" },
  { id: "pulse", name: "Pulse" },
  { id: "shake", name: "Shake" },
  { id: "scale", name: "Scale Up" },
  { id: "glow", name: "Glow" },
];

/* ── Mini preview component (renders inline, not iframe) ── */
function MiniPreview({ settings, creator }: { settings: Settings; creator: any }) {
  const [animKey, setAnimKey] = useState(0);
  const dark = TEMPLATES.find(t => t.id === settings.template)?.dark ?? false;
  const accent = settings.accent || "#6366f1";
  const btnRadius = BUTTON_SHAPES.find(s => s.id === settings.buttonShape)?.radius || "16px";

  /* Background style */
  function getBgStyle(): React.CSSProperties {
    if (settings.bgType === "gradient" && settings.bgValue) return { background: settings.bgValue };
    if (settings.bgType === "solid" && settings.bgValue) return { background: settings.bgValue };
    if (settings.bgType === "image" && settings.bgValue) return { backgroundImage: `url(${settings.bgValue})`, backgroundSize: "cover", backgroundPosition: "center" };
    if (settings.template === "glass" || settings.template === "collage") return { background: "linear-gradient(135deg, #1a1a2e, #16213e)" };
    if (dark) return { background: "#0a0a0a" };
    return { background: "#e5e5e5" };
  }

  const name = creator.name || "Your Name";
  const headline = creator.headline || "Creator / Content Maker";
  const avatar = creator.avatar_url || creator.avatar;

  return (
    <div className="relative w-full h-full overflow-hidden" style={getBgStyle()}>
      {/* Video bg */}
      {settings.bgType === "video" && settings.bgVideo && (
        <video src={settings.bgVideo} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
      )}
      {/* Overlay for dark templates */}
      {(settings.bgType === "video" || settings.bgType === "image") && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-10 px-4 h-full">
        {/* Avatar */}
        <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${dark ? "border-white/20" : "border-white"} shadow-lg`}>
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-xl font-bold ${dark ? "bg-white/10 text-white/60" : "bg-neutral-200 text-neutral-400"}`}>{name[0]}</div>
          )}
        </div>
        {/* Name */}
        <h2 className={`mt-3 text-sm font-bold ${dark ? "text-white" : "text-neutral-900"}`}>{name}</h2>
        <p className={`text-[10px] mt-0.5 ${dark ? "text-white/50" : "text-neutral-500"}`}>{headline}</p>

        {/* Socials */}
        <div className="flex gap-1.5 mt-3">
          {["instagram", "tiktok", "youtube"].map(p => (
            <div key={p} className={`w-7 h-7 rounded-full flex items-center justify-center ${dark ? "bg-white/10" : "bg-neutral-200/80"}`}>
              <div className={`w-3 h-3 rounded-sm ${dark ? "bg-white/30" : "bg-neutral-400"}`} />
            </div>
          ))}
        </div>

        {/* Service buttons */}
        <div className="w-full mt-4 space-y-2 px-2">
          {(creator.services?.length > 0 ? creator.services.slice(0, 3) : [
            { title: "UGC Video Package", price: 299 },
            { title: "Product Photography", price: 199 },
            { title: "Social Media Audit", price: 99 },
          ]).map((s: any, i: number) => (
            <button
              key={i}
              onClick={() => setAnimKey(k => k + 1)}
              className={`w-full py-2.5 px-3 text-[11px] font-medium transition-all ${
                dark
                  ? settings.template === "bold" || settings.template === "neon"
                    ? "bg-white/[0.08] border border-white/[0.08] text-white hover:bg-white/[0.14]"
                    : "bg-white/10 text-white hover:bg-white/20"
                  : "bg-white border border-neutral-200 text-neutral-900 hover:bg-neutral-50 shadow-sm"
              }`}
              style={{
                borderRadius: btnRadius,
                animation: animKey > 0 ? getAnim(settings.buttonAnim) : undefined,
              }}
            >
              <div className="flex items-center justify-between">
                <span>{s.title}</span>
                <span className={dark ? "text-white/40" : "text-neutral-400"}>${s.price}</span>
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          className="mt-4 px-6 py-2.5 text-[11px] font-bold transition-all"
          style={{
            borderRadius: btnRadius,
            background: settings.template === "bold" || settings.template === "neon" ? accent : dark ? "#fff" : "#171717",
            color: settings.template === "bold" || settings.template === "neon" ? "#fff" : dark ? "#171717" : "#fff",
          }}
        >
          View Full Profile
        </button>
      </div>
    </div>
  );
}

function getAnim(id: string): string | undefined {
  const anims: Record<string, string> = {
    bounce: "edBounce 0.4s ease",
    pulse: "edPulse 0.35s ease",
    shake: "edShake 0.3s ease",
    scale: "edScale 0.35s ease",
    glow: "edGlow 0.5s ease",
  };
  return anims[id];
}

/* ── Main Editor ── */
export function LinkInBioEditorContent({ user }: { user: any }) {
  const [settings, setSettings] = useState<Settings>({
    template: user.link_bio_template || "minimal",
    accent: user.link_bio_accent || "#6366f1",
    bgType: user.link_bio_bg_type || "gradient",
    bgValue: user.link_bio_bg_value || "",
    bgVideo: user.link_bio_bg_video || "",
    buttonShape: user.link_bio_button_shape || "rounded",
    buttonAnim: user.link_bio_button_anim || "none",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState("template");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const save = useCallback(async (updates: Partial<Settings>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        link_bio_template: next.template,
        link_bio_accent: next.accent,
        link_bio_bg_type: next.bgType,
        link_bio_bg_value: next.bgValue,
        link_bio_bg_video: next.bgVideo,
        link_bio_button_shape: next.buttonShape,
        link_bio_button_anim: next.buttonAnim,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, [settings]);

  /* Image upload for background */
  async function uploadBgImage(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", "cover");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) save({ bgType: "image", bgValue: data.url });
    else alert(data.message || "Upload failed");
  }

  /* Video upload for background */
  async function uploadBgVideo(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", "cover");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) save({ bgType: "video", bgVideo: data.url });
    else alert(data.message || "Upload failed");
  }

  const sections = [
    { id: "template", name: "Template" },
    { id: "background", name: "Background" },
    { id: "buttons", name: "Buttons" },
    { id: "colors", name: "Colors" },
  ];

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Hidden file inputs */}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadBgImage(e.target.files[0]); }} />
      <input ref={videoRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadBgVideo(e.target.files[0]); }} />

      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-600"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <h1 className="font-display font-bold text-neutral-900 text-base">Edit Link in Bio</h1>
          </div>
          <div className="flex items-center gap-2">
            {saving && <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />}
            {saved && <span className="text-xs text-emerald-600 font-medium">Saved</span>}
            {user.slug && (
              <Link href={`/u/${user.slug}`} target="_blank" className="px-4 py-1.5 text-xs font-semibold bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors">
                View Live
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Left — Editor */}
          <div className="lg:w-[55%] space-y-4">

            {/* Section tabs */}
            <div className="flex gap-1 p-1 bg-white rounded-2xl border border-neutral-200/60">
              {sections.map(s => (
                <button key={s.id} onClick={() => setSection(s.id)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold text-center transition-all ${section === s.id ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-700"}`}>
                  {s.name}
                </button>
              ))}
            </div>

            {/* ── Template ── */}
            {section === "template" && (
              <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
                <h2 className="text-sm font-bold text-neutral-900 mb-4">Choose Template</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => save({ template: t.id })} className={`relative rounded-2xl overflow-hidden transition-all active:scale-95 ${settings.template === t.id ? "ring-2 ring-neutral-900 ring-offset-2" : "hover:ring-1 hover:ring-neutral-300"}`}>
                      {/* Mini visual preview */}
                      <div className={`aspect-[3/4] ${t.preview} flex flex-col items-center justify-center gap-1 p-2`}>
                        <div className={`w-8 h-8 rounded-full ${t.dark ? "bg-white/20" : "bg-neutral-300/60"}`} />
                        <div className={`w-14 h-1 rounded-full ${t.dark ? "bg-white/15" : "bg-neutral-300/40"}`} />
                        <div className={`w-full h-2.5 rounded-md mt-1 ${t.dark ? "bg-white/10" : "bg-neutral-200/60"}`} />
                        <div className={`w-full h-2.5 rounded-md ${t.dark ? "bg-white/10" : "bg-neutral-200/60"}`} />
                        <div className={`w-full h-2.5 rounded-md ${t.dark ? "bg-white/10" : "bg-neutral-200/60"}`} />
                      </div>
                      <div className="p-2 bg-white text-center">
                        <div className="text-[10px] font-bold text-neutral-900">{t.name}</div>
                      </div>
                      {settings.template === t.id && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Background ── */}
            {section === "background" && (
              <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-5">
                {/* Type selector */}
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Background</h2>
                  <div className="flex flex-wrap gap-2">
                    {["gradient", "solid", "image", "video"].map(t => (
                      <button key={t} onClick={() => save({ bgType: t })} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${settings.bgType === t ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                        {t[0].toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gradient */}
                {settings.bgType === "gradient" && (
                  <div className="grid grid-cols-6 gap-2">
                    {GRADIENTS.map((g, i) => (
                      <button key={i} onClick={() => save({ bgValue: g })} className={`aspect-square rounded-xl transition-all hover:scale-105 active:scale-95 ${settings.bgValue === g ? "ring-2 ring-neutral-900 ring-offset-2" : ""}`} style={{ background: g }} />
                    ))}
                  </div>
                )}

                {/* Solid */}
                {settings.bgType === "solid" && (
                  <div>
                    <div className="flex flex-wrap gap-2.5">
                      {["#ffffff", "#f5f5f5", "#171717", "#0a0a0a", "#1e293b", "#fef3c7", "#ecfdf5", "#eff6ff", "#fdf2f8", "#f5f3ff", "#dc2626", "#2563eb", "#16a34a"].map(c => (
                        <button key={c} onClick={() => save({ bgValue: c })} className={`w-9 h-9 rounded-xl border transition-all hover:scale-105 ${settings.bgValue === c ? "ring-2 ring-neutral-900 ring-offset-2" : "border-neutral-200"}`} style={{ background: c }} />
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <input type="color" value={settings.bgValue || "#ffffff"} onChange={e => save({ bgValue: e.target.value })} className="w-9 h-9 rounded-lg cursor-pointer border-0" />
                      <span className="text-xs text-neutral-400">Custom color</span>
                    </div>
                  </div>
                )}

                {/* Image upload */}
                {settings.bgType === "image" && (
                  <div className="space-y-3">
                    <button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full py-8 border-2 border-dashed border-neutral-300 rounded-2xl text-center hover:border-neutral-400 hover:bg-neutral-50 transition-all">
                      {uploading ? (
                        <div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" /><span className="text-xs text-neutral-400">Uploading...</span></div>
                      ) : (
                        <>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-neutral-300 mb-2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                          <div className="text-xs font-medium text-neutral-500">Click to upload image</div>
                          <div className="text-[10px] text-neutral-400 mt-1">JPG, PNG, WebP, GIF up to 5MB</div>
                        </>
                      )}
                    </button>
                    {settings.bgValue && settings.bgType === "image" && (
                      <div className="relative rounded-xl overflow-hidden aspect-video">
                        <img src={settings.bgValue} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => save({ bgValue: "" })} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Video upload */}
                {settings.bgType === "video" && (
                  <div className="space-y-3">
                    <button onClick={() => videoRef.current?.click()} disabled={uploading} className="w-full py-8 border-2 border-dashed border-neutral-300 rounded-2xl text-center hover:border-neutral-400 hover:bg-neutral-50 transition-all">
                      {uploading ? (
                        <div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" /><span className="text-xs text-neutral-400">Uploading...</span></div>
                      ) : (
                        <>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-neutral-300 mb-2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                          <div className="text-xs font-medium text-neutral-500">Click to upload video</div>
                          <div className="text-[10px] text-neutral-400 mt-1">MP4, WebM up to 5MB</div>
                        </>
                      )}
                    </button>
                    {settings.bgVideo && (
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
                        <video src={settings.bgVideo} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                        <button onClick={() => save({ bgVideo: "" })} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Buttons ── */}
            {section === "buttons" && (
              <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-6">
                {/* Shape */}
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Button Shape</h2>
                  <div className="grid grid-cols-4 gap-2">
                    {BUTTON_SHAPES.map(s => (
                      <button key={s.id} onClick={() => save({ buttonShape: s.id })} className={`py-3 text-xs font-semibold transition-all ${settings.buttonShape === s.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`} style={{ borderRadius: s.radius }}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animation */}
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Click Animation</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {BUTTON_ANIMS.map(a => (
                      <button key={a.id} onClick={() => save({ buttonAnim: a.id })} className={`py-2.5 text-xs font-semibold rounded-xl transition-all ${settings.buttonAnim === a.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                        {a.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live test */}
                <div className="p-4 bg-neutral-50 rounded-xl text-center">
                  <p className="text-[10px] text-neutral-400 mb-2">Tap to preview animation</p>
                  <AnimTestButton shape={settings.buttonShape} anim={settings.buttonAnim} accent={settings.accent} />
                </div>
              </div>
            )}

            {/* ── Colors ── */}
            {section === "colors" && (
              <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
                <h2 className="text-sm font-bold text-neutral-900 mb-1">Accent Color</h2>
                <p className="text-[11px] text-neutral-400 mb-4">Used by Bold, Neon, and Bento templates for highlights.</p>
                <div className="flex flex-wrap gap-2.5">
                  {ACCENT_COLORS.map(c => (
                    <button key={c} onClick={() => save({ accent: c })} className={`w-10 h-10 rounded-xl transition-all hover:scale-110 active:scale-95 ${settings.accent === c ? "ring-2 ring-offset-2 ring-neutral-900 scale-110" : ""}`} style={{ background: c }} />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <input type="color" value={settings.accent} onChange={e => save({ accent: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                  <span className="text-xs text-neutral-400">Custom color</span>
                </div>
              </div>
            )}
          </div>

          {/* Right — Live preview in phone */}
          <div className="lg:w-[45%] lg:sticky lg:top-20 lg:self-start">
            <div className="bg-white rounded-2xl border border-neutral-200/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-400">Live Preview</span>
                {user.slug && (
                  <Link href={`/u/${user.slug}`} target="_blank" className="text-[11px] text-blue-600 font-medium hover:text-blue-800">Open →</Link>
                )}
              </div>
              {/* Phone frame */}
              <div className="mx-auto w-[280px] h-[560px] bg-black rounded-[2.5rem] shadow-2xl border-[6px] border-neutral-800 overflow-hidden relative">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90px] h-[22px] bg-black rounded-b-2xl z-50" />
                {/* Content */}
                <div className="w-full h-full overflow-y-auto rounded-[2rem]">
                  <MiniPreview settings={settings} creator={user} />
                </div>
                {/* Home indicator */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-white/30 rounded-full z-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes edBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes edPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes edShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        @keyframes edScale { 0% { transform: scale(1); } 50% { transform: scale(1.12); } 100% { transform: scale(1); } }
        @keyframes edGlow { 0%,100% { box-shadow: 0 0 0 transparent; } 50% { box-shadow: 0 0 20px rgba(99,102,241,0.5); } }
      `}</style>
    </div>
  );
}

/* Button animation test */
function AnimTestButton({ shape, anim, accent }: { shape: string; anim: string; accent: string }) {
  const [key, setKey] = useState(0);
  const radius = BUTTON_SHAPES.find(s => s.id === shape)?.radius || "16px";
  return (
    <button
      key={key}
      onClick={() => setKey(k => k + 1)}
      className="w-full py-3 bg-neutral-900 text-white text-sm font-semibold transition-all"
      style={{
        borderRadius: radius,
        animation: key > 0 ? getAnim(anim) : undefined,
      }}
    >
      Example Button
    </button>
  );
}
