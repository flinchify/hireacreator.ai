"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { PlatformIcon } from "./icons/platforms";

/* ── Types ── */
type Settings = {
  template: string;
  accent: string;
  bgType: string;
  bgValue: string;
  bgVideo: string;
  bgImages: string[]; // multiple photo URLs
  buttonShape: string;
  buttonAnim: string;
  font: string;
  textColor: string;
  introAnim: string;
  cardStyle: string;
};

/* ── Constants ── */
const TEMPLATES = [
  { id: "minimal", name: "Minimal", dark: false, preview: "bg-neutral-200" },
  { id: "glass", name: "Glass", dark: true, preview: "bg-gradient-to-br from-neutral-800 to-neutral-950" },
  { id: "bold", name: "Bold", dark: true, preview: "bg-neutral-950" },
  { id: "showcase", name: "Showcase", dark: false, preview: "bg-neutral-100" },
  { id: "neon", name: "Neon", dark: true, preview: "bg-black" },
  { id: "collage", name: "Collage", dark: true, preview: "bg-gradient-to-br from-neutral-700 to-neutral-900" },
  { id: "bento", name: "Bento", dark: true, preview: "bg-neutral-950" },
  { id: "split", name: "Split", dark: false, preview: "bg-white" },
];

const FONTS = [
  { id: "jakarta", name: "Jakarta", css: "'Plus Jakarta Sans', sans-serif" },
  { id: "outfit", name: "Outfit", css: "'Outfit', sans-serif" },
  { id: "inter", name: "Inter", css: "'Inter', sans-serif" },
  { id: "dm-sans", name: "DM Sans", css: "'DM Sans', sans-serif" },
  { id: "poppins", name: "Poppins", css: "'Poppins', sans-serif" },
  { id: "space-grotesk", name: "Space Grotesk", css: "'Space Grotesk', sans-serif" },
  { id: "sora", name: "Sora", css: "'Sora', sans-serif" },
  { id: "manrope", name: "Manrope", css: "'Manrope', sans-serif" },
  { id: "clash", name: "Clash Display", css: "'Clash Display', sans-serif" },
  { id: "satoshi", name: "Satoshi", css: "'Satoshi', sans-serif" },
  { id: "cabinet", name: "Cabinet Grotesk", css: "'Cabinet Grotesk', sans-serif" },
  { id: "general-sans", name: "General Sans", css: "'General Sans', sans-serif" },
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
  "#a855f7", "#ec4899", "#eab308", "#14b8a6", "#171717", "#ffffff",
];

const TEXT_COLORS = [
  { id: "", name: "Auto", color: "" },
  { id: "#ffffff", name: "White", color: "#ffffff" },
  { id: "#f5f5f5", name: "Light", color: "#f5f5f5" },
  { id: "#171717", name: "Dark", color: "#171717" },
  { id: "#0a0a0a", name: "Black", color: "#0a0a0a" },
  { id: "#6366f1", name: "Indigo", color: "#6366f1" },
  { id: "#ec4899", name: "Pink", color: "#ec4899" },
  { id: "#22d3ee", name: "Cyan", color: "#22d3ee" },
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

const INTRO_ANIMS = [
  { id: "none", name: "None", desc: "No animation", free: true },
  { id: "fade-up", name: "Fade Up", desc: "Content slides up smoothly", free: true },
  { id: "fade-scale", name: "Scale In", desc: "Grows from center", free: true },
  { id: "spotlight", name: "Spotlight", desc: "Light reveals your page", free: false },
  { id: "glitch", name: "Glitch", desc: "Digital glitch effect", free: false },
  { id: "particle-burst", name: "Particle Burst", desc: "Particles explode then settle", free: false },
  { id: "typewriter", name: "Typewriter", desc: "Name types itself letter by letter", free: false },
  { id: "wave", name: "Wave", desc: "Content ripples into view", free: false },
  { id: "neon", name: "Neon Flicker", desc: "Neon sign turning on", free: false },
  { id: "cinema", name: "Cinema", desc: "Cinematic letterbox reveal", free: false },
  { id: "morph", name: "Morph", desc: "Shapes morph into your profile", free: false },
  { id: "trading-candles", name: "Trading Candles", desc: "Candlestick chart rises up", free: false },
];

const CARD_STYLES = [
  { id: "default", name: "Default" },
  { id: "outlined", name: "Outlined" },
  { id: "filled", name: "Filled" },
  { id: "shadow", name: "Shadow" },
  { id: "glass", name: "Glass" },
];

/* ── Mini Preview ── */
function MiniPreview({ settings, creator }: { settings: Settings; creator: any }) {
  const [animKey, setAnimKey] = useState(0);
  const dark = TEMPLATES.find(t => t.id === settings.template)?.dark ?? false;
  const accent = settings.accent || "#6366f1";
  const btnRadius = BUTTON_SHAPES.find(s => s.id === settings.buttonShape)?.radius || "16px";
  const fontFamily = FONTS.find(f => f.id === settings.font)?.css || "'Plus Jakarta Sans', sans-serif";
  const textCol = settings.textColor || (dark ? "#ffffff" : "#171717");

  function getBgStyle(): React.CSSProperties {
    if (settings.bgType === "gradient" && settings.bgValue) return { background: settings.bgValue };
    if (settings.bgType === "solid" && settings.bgValue) return { background: settings.bgValue };
    if (settings.bgType === "image" && settings.bgValue) return { backgroundImage: `url(${settings.bgValue})`, backgroundSize: "cover", backgroundPosition: "center" };
    if (settings.bgType === "photos" && settings.bgImages.length > 0) return {};
    if (dark) return { background: "#0a0a0a" };
    return { background: "#e5e5e5" };
  }

  const name = creator.full_name || creator.name || "Your Name";
  const headline = creator.headline || "Creator / Content Maker";
  const avatar = creator.avatar_url || creator.avatar;

  return (
    <div className="relative w-full min-h-full overflow-hidden" style={{ ...getBgStyle(), fontFamily }}>
      {settings.bgType === "video" && settings.bgVideo && (
        <video src={settings.bgVideo} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
      )}
      {/* Multi-photo collage background */}
      {settings.bgType === "photos" && settings.bgImages.length > 0 && (
        <div className="absolute inset-0 grid grid-cols-2 gap-0.5 opacity-30">
          {settings.bgImages.slice(0, 10).map((img, i) => (
            <div key={i} className="overflow-hidden">
              <img src={img} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
            </div>
          ))}
        </div>
      )}
      {(settings.bgType === "video" || settings.bgType === "image" || settings.bgType === "photos") && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      <div className="relative z-10 flex flex-col items-center pt-10 px-4 pb-8">
        <div className={`w-16 h-16 rounded-full overflow-hidden border-2 shadow-lg`} style={{ borderColor: dark ? "rgba(255,255,255,0.2)" : "#fff" }}>
          {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center text-xl font-bold ${dark ? "bg-white/10 text-white/60" : "bg-neutral-200 text-neutral-400"}`}>{name[0]}</div>}
        </div>
        <h2 className="mt-3 text-sm font-bold" style={{ color: textCol }}>{name}</h2>
        <p className="text-[10px] mt-0.5" style={{ color: textCol, opacity: 0.5 }}>{headline}</p>
        {/* Socials */}
        <div className="flex gap-1.5 mt-3">
          {(creator.socials || []).length > 0
            ? (creator.socials || []).slice(0, 6).map((s: any, i: number) => (
                <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center ${dark ? "bg-white/10" : "bg-neutral-200/80"}`}>
                  <PlatformIcon platform={s.platform} size={14} className={dark ? "text-white/60" : "text-neutral-500"} />
                </div>
              ))
            : ["instagram", "tiktok", "youtube"].map(p => (
                <div key={p} className={`w-7 h-7 rounded-full flex items-center justify-center ${dark ? "bg-white/10" : "bg-neutral-200/80"}`}>
                  <PlatformIcon platform={p} size={14} className={dark ? "text-white/60" : "text-neutral-500"} />
                </div>
              ))
          }
        </div>
        {/* Buttons */}
        <div className="w-full mt-4 space-y-2 px-2">
          {(creator.services?.length > 0 ? creator.services.slice(0, 3) : [
            { title: "UGC Video Package", price: 299 },
            { title: "Product Photography", price: 199 },
            { title: "Social Media Audit", price: 99 },
          ]).map((s: any, i: number) => {
            const cardBg = settings.cardStyle === "filled" ? (dark ? "rgba(255,255,255,0.12)" : accent) :
                           settings.cardStyle === "glass" ? (dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.8)") :
                           settings.cardStyle === "shadow" ? (dark ? "rgba(255,255,255,0.08)" : "#fff") :
                           dark ? "rgba(255,255,255,0.08)" : "#fff";
            const cardBorder = settings.cardStyle === "outlined" ? `1px solid ${dark ? "rgba(255,255,255,0.15)" : accent}` :
                               settings.cardStyle === "shadow" ? "none" : `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`;
            const cardShadow = settings.cardStyle === "shadow" ? "0 4px 20px rgba(0,0,0,0.12)" : "none";
            return (
              <button key={i} onClick={() => setAnimKey(k => k + 1)} className="w-full py-2.5 px-3 text-[11px] font-medium transition-all text-left" style={{
                borderRadius: btnRadius,
                background: cardBg,
                border: cardBorder,
                boxShadow: cardShadow,
                color: settings.cardStyle === "filled" && !dark ? "#fff" : textCol,
                backdropFilter: settings.cardStyle === "glass" ? "blur(10px)" : undefined,
                animation: animKey > 0 ? getAnim(settings.buttonAnim) : undefined,
              }}>
                <div className="flex items-center justify-between">
                  <span>{s.title}</span>
                  <span style={{ opacity: 0.4 }}>${s.price}</span>
                </div>
              </button>
            );
          })}
        </div>
        <button className="mt-4 px-6 py-2.5 text-[11px] font-bold" style={{
          borderRadius: btnRadius,
          background: settings.template === "bold" || settings.template === "neon" ? accent : dark ? "#fff" : "#171717",
          color: settings.template === "bold" || settings.template === "neon" ? "#fff" : dark ? "#171717" : "#fff",
        }}>View Full Profile</button>
      </div>
    </div>
  );
}

function getAnim(id: string): string | undefined {
  const m: Record<string, string> = { bounce: "edBounce 0.4s ease", pulse: "edPulse 0.35s ease", shake: "edShake 0.3s ease", scale: "edScale 0.35s ease", glow: "edGlow 0.5s ease" };
  return m[id];
}

/* ── Main Editor ── */
export function LinkInBioEditorContent({ user }: { user: any }) {
  const parseBgImages = (v: string): string[] => { try { return JSON.parse(v || "[]"); } catch { return []; } };

  const [settings, setSettings] = useState<Settings>({
    template: user.link_bio_template || "minimal",
    accent: user.link_bio_accent || "#6366f1",
    bgType: user.link_bio_bg_type || "gradient",
    bgValue: (user.link_bio_bg_value?.startsWith("http") || user.link_bio_bg_value?.startsWith("linear")) ? user.link_bio_bg_value : "",
    bgVideo: user.link_bio_bg_video || "",
    bgImages: parseBgImages(user.link_bio_bg_images),
    buttonShape: user.link_bio_button_shape || "rounded",
    buttonAnim: user.link_bio_button_anim || "none",
    font: user.link_bio_font || "jakarta",
    textColor: user.link_bio_text_color || "",
    introAnim: user.link_bio_intro_anim || "none",
    cardStyle: user.link_bio_card_style || "default",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState("template");
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<HTMLInputElement>(null);

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
        link_bio_bg_images: JSON.stringify(next.bgImages),
        link_bio_button_shape: next.buttonShape,
        link_bio_button_anim: next.buttonAnim,
        link_bio_font: next.font,
        link_bio_text_color: next.textColor,
        link_bio_intro_anim: next.introAnim,
        link_bio_card_style: next.cardStyle,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, [settings]);

  async function uploadImage(file: File, purpose: "bg" | "photos") {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", "cover");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) {
      if (purpose === "bg") save({ bgType: "image", bgValue: data.url });
      else save({ bgImages: [...settings.bgImages, data.url] });
    } else alert(data.message || "Upload failed");
  }

  async function uploadVideo(file: File) {
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

  function removePhoto(idx: number) {
    const next = settings.bgImages.filter((_, i) => i !== idx);
    save({ bgImages: next });
  }

  const sections = [
    { id: "template", name: "Template" },
    { id: "background", name: "Background" },
    { id: "typography", name: "Typography" },
    { id: "buttons", name: "Buttons" },
    { id: "animation", name: "Animation" },
    { id: "colors", name: "Colors" },
  ];

  return (
    <div className="min-h-screen bg-neutral-100">
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0], "bg"); }} />
      <input ref={videoRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadVideo(e.target.files[0]); }} />
      <input ref={photosRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={e => { if (e.target.files) Array.from(e.target.files).forEach(f => uploadImage(f, "photos")); }} />

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
            {/* Section tabs — scrollable */}
            <div className="flex gap-1 p-1 bg-white rounded-2xl border border-neutral-200/60 overflow-x-auto">
              {sections.map(s => (
                <button key={s.id} onClick={() => setSection(s.id)} className={`flex-shrink-0 py-2.5 px-4 rounded-xl text-xs font-semibold text-center transition-all whitespace-nowrap ${section === s.id ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-700"}`}>
                  {s.name}
                </button>
              ))}
            </div>

            {/* ─── TEMPLATE ─── */}
            {section === "template" && (
              <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
                <h2 className="text-sm font-bold text-neutral-900 mb-4">Choose Template</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => save({ template: t.id })} className={`relative rounded-2xl overflow-hidden transition-all active:scale-95 ${settings.template === t.id ? "ring-2 ring-neutral-900 ring-offset-2" : "hover:ring-1 hover:ring-neutral-300"}`}>
                      <EditorTemplateMini id={t.id} />
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

            {/* ─── BACKGROUND ─── */}
            {section === "background" && (
              <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-5">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Background</h2>
                  <div className="flex flex-wrap gap-2">
                    {["gradient", "solid", "image", "photos", "video"].map(t => (
                      <button key={t} onClick={() => save({ bgType: t })} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${settings.bgType === t ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                        {t === "photos" ? "Photo Collage" : t[0].toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {settings.bgType === "gradient" && (
                  <div className="grid grid-cols-6 gap-2">
                    {GRADIENTS.map((g, i) => (
                      <button key={i} onClick={() => save({ bgValue: g })} className={`aspect-square rounded-xl transition-all hover:scale-105 ${settings.bgValue === g ? "ring-2 ring-neutral-900 ring-offset-2" : ""}`} style={{ background: g }} />
                    ))}
                  </div>
                )}

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

                {settings.bgType === "image" && (
                  <div className="space-y-3">
                    <button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full py-8 border-2 border-dashed border-neutral-300 rounded-2xl text-center hover:border-neutral-400 hover:bg-neutral-50 transition-all">
                      {uploading ? <Spinner /> : (
                        <>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-neutral-300 mb-2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                          <div className="text-xs font-medium text-neutral-500">Upload background image</div>
                          <div className="text-[10px] text-neutral-400 mt-1">JPG, PNG, WebP, GIF up to 5MB</div>
                        </>
                      )}
                    </button>
                    {settings.bgValue && settings.bgValue.startsWith("http") && (
                      <div className="relative rounded-xl overflow-hidden aspect-video">
                        <img src={settings.bgValue} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                        <button onClick={() => save({ bgValue: "" })} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Photo collage — multiple uploads */}
                {settings.bgType === "photos" && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-neutral-400">Upload up to 10 photos. They'll tile as your background collage.</p>
                    <button onClick={() => photosRef.current?.click()} disabled={uploading || settings.bgImages.length >= 10} className="w-full py-6 border-2 border-dashed border-neutral-300 rounded-2xl text-center hover:border-neutral-400 hover:bg-neutral-50 transition-all disabled:opacity-50">
                      {uploading ? <Spinner /> : (
                        <>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-neutral-300 mb-1.5"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
                          <div className="text-xs font-medium text-neutral-500">Add photos ({settings.bgImages.length}/10)</div>
                        </>
                      )}
                    </button>
                    {settings.bgImages.length > 0 && (
                      <div className="grid grid-cols-5 gap-2">
                        {settings.bgImages.map((img, i) => (
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => removePhoto(i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {settings.bgType === "video" && (
                  <div className="space-y-3">
                    <button onClick={() => videoRef.current?.click()} disabled={uploading} className="w-full py-8 border-2 border-dashed border-neutral-300 rounded-2xl text-center hover:border-neutral-400 hover:bg-neutral-50 transition-all">
                      {uploading ? <Spinner /> : (
                        <>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-neutral-300 mb-2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                          <div className="text-xs font-medium text-neutral-500">Upload background video</div>
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

            {/* ─── TYPOGRAPHY ─── */}
            {section === "typography" && (
              <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-6">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Font</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {FONTS.map(f => (
                      <button key={f.id} onClick={() => save({ font: f.id })} className={`p-3 rounded-xl text-left transition-all ${settings.font === f.id ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"}`}>
                        <div className="text-base font-bold" style={{ fontFamily: f.css }}>{f.name}</div>
                        <div className="text-[10px] mt-0.5 opacity-50" style={{ fontFamily: f.css }}>The quick brown fox</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Text Color</h2>
                  <div className="flex flex-wrap gap-2">
                    {TEXT_COLORS.map(c => (
                      <button key={c.id || "auto"} onClick={() => save({ textColor: c.id })} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${settings.textColor === c.id ? "ring-2 ring-neutral-900 ring-offset-1" : "bg-neutral-50 hover:bg-neutral-100"}`}>
                        {c.id ? <div className="w-4 h-4 rounded-full border border-neutral-200" style={{ background: c.color }} /> : <div className="w-4 h-4 rounded-full bg-gradient-to-r from-neutral-900 to-neutral-200 border border-neutral-200" />}
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input type="color" value={settings.textColor || "#171717"} onChange={e => save({ textColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0" />
                    <span className="text-xs text-neutral-400">Custom text color</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-3">Card Style</h2>
                  <div className="grid grid-cols-5 gap-2">
                    {CARD_STYLES.map(c => (
                      <button key={c.id} onClick={() => save({ cardStyle: c.id })} className={`py-2.5 rounded-xl text-[10px] font-semibold transition-all ${settings.cardStyle === c.id ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── BUTTONS ─── */}
            {section === "buttons" && (
              <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-6">
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
                <div className="p-4 bg-neutral-50 rounded-xl text-center">
                  <p className="text-[10px] text-neutral-400 mb-2">Tap to preview</p>
                  <AnimTestButton shape={settings.buttonShape} anim={settings.buttonAnim} />
                </div>
              </div>
            )}

            {/* ─── ANIMATION ─── */}
            {section === "animation" && (
              <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
                <h2 className="text-sm font-bold text-neutral-900 mb-1">Intro Animation</h2>
                <p className="text-[11px] text-neutral-400 mb-4">Plays once when someone visits your link in bio. Premium animations are $4.99 each from the <Link href="/animations" className="text-blue-600 hover:underline">animations store</Link>.</p>
                <div className="space-y-1.5">
                  {INTRO_ANIMS.map(a => {
                    const owned = a.free || (user.owned_animations || []).includes?.(a.id) || user.role === "admin";
                    const isActive = settings.introAnim === a.id;
                    return (
                      <button
                        key={a.id}
                        onClick={() => owned ? save({ introAnim: a.id }) : undefined}
                        className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all w-full ${
                          isActive ? "bg-neutral-900 text-white" :
                          owned ? "bg-neutral-50 text-neutral-600 hover:bg-neutral-100" :
                          "bg-neutral-50/50 text-neutral-400 cursor-default"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{a.name}</span>
                            {!a.free && !owned && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-bold rounded-full">$4.99</span>
                            )}
                            {!a.free && owned && (
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-bold rounded-full">OWNED</span>
                            )}
                          </div>
                          <div className={`text-[10px] ${isActive ? "text-white/50" : "text-neutral-400"}`}>{a.desc}</div>
                        </div>
                        {isActive && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg>
                        )}
                        {!a.free && !owned && (
                          <Link href="/animations" className="px-3 py-1.5 bg-neutral-900 text-white text-[10px] font-bold rounded-full shrink-0 hover:bg-neutral-800" onClick={e => e.stopPropagation()}>
                            Get
                          </Link>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── COLORS ─── */}
            {section === "colors" && (
              <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
                <h2 className="text-sm font-bold text-neutral-900 mb-1">Accent Color</h2>
                <p className="text-[11px] text-neutral-400 mb-4">Used by Bold, Neon, and Bento templates. Also used for Filled and Outlined card styles.</p>
                <div className="flex flex-wrap gap-2.5">
                  {ACCENT_COLORS.map(c => (
                    <button key={c} onClick={() => save({ accent: c })} className={`w-10 h-10 rounded-xl transition-all hover:scale-110 active:scale-95 ${settings.accent === c ? "ring-2 ring-offset-2 ring-neutral-900 scale-110" : ""} ${c === "#ffffff" ? "border border-neutral-200" : ""}`} style={{ background: c }} />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <input type="color" value={settings.accent} onChange={e => save({ accent: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                  <span className="text-xs text-neutral-400">Custom accent</span>
                </div>
              </div>
            )}
          </div>

          {/* Right — Live preview */}
          <div className="lg:w-[45%] lg:sticky lg:top-20 lg:self-start">
            <div className="bg-white rounded-2xl border border-neutral-200/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-lg">
                  <button onClick={() => setPreviewMode("mobile")} className={`p-1.5 rounded-md transition-all ${previewMode === "mobile" ? "bg-white shadow-sm" : "hover:bg-neutral-200/50"}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={previewMode === "mobile" ? "text-neutral-900" : "text-neutral-400"}><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" /></svg>
                  </button>
                  <button onClick={() => setPreviewMode("desktop")} className={`p-1.5 rounded-md transition-all ${previewMode === "desktop" ? "bg-white shadow-sm" : "hover:bg-neutral-200/50"}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={previewMode === "desktop" ? "text-neutral-900" : "text-neutral-400"}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                  </button>
                </div>
                {user.slug && <Link href={`/u/${user.slug}`} target="_blank" className="text-[11px] text-blue-600 font-medium hover:text-blue-800">Open →</Link>}
              </div>
              {previewMode === "mobile" && (
                <div className="mx-auto w-[280px] h-[560px] bg-black rounded-[2.5rem] shadow-2xl border-[6px] border-neutral-800 overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90px] h-[22px] bg-black rounded-b-2xl z-50" />
                  <div className="w-full h-full overflow-y-auto rounded-[2rem]"><MiniPreview settings={settings} creator={user} /></div>
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-white/30 rounded-full z-50" />
                </div>
              )}
              {previewMode === "desktop" && (
                <div className="mx-auto">
                  <div className="bg-neutral-200 rounded-t-xl px-3 py-2 flex items-center gap-2">
                    <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><div className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>
                    <div className="flex-1 bg-white rounded-md px-2 py-1 text-[8px] text-neutral-400 truncate">hireacreator.ai/u/{user.slug || "yourname"}</div>
                  </div>
                  <div className="w-full h-[450px] border border-t-0 border-neutral-200 rounded-b-xl overflow-y-auto bg-neutral-100">
                    <div className="flex items-start justify-center py-6 min-h-full">
                      <div className="w-[400px] bg-white rounded-2xl shadow-lg overflow-hidden"><MiniPreview settings={settings} creator={user} /></div>
                    </div>
                  </div>
                </div>
              )}
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

function Spinner() {
  return <div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" /><span className="text-xs text-neutral-400">Uploading...</span></div>;
}

function AnimTestButton({ shape, anim }: { shape: string; anim: string }) {
  const [key, setKey] = useState(0);
  const radius = BUTTON_SHAPES.find(s => s.id === shape)?.radius || "16px";
  return (
    <button key={key} onClick={() => setKey(k => k + 1)} className="w-full py-3 bg-neutral-900 text-white text-sm font-semibold" style={{ borderRadius: radius, animation: key > 0 ? getAnim(anim) : undefined }}>
      Example Button
    </button>
  );
}

function EditorTemplateMini({ id }: { id: string }) {
  const c = "aspect-[3/4] overflow-hidden relative";

  /* MINIMAL — White card on grey, wavy cover edge, round avatar */
  if (id === "minimal") return (
    <div className={`${c} bg-neutral-200 flex items-center justify-center p-1.5`}>
      <div className="w-full h-full bg-white rounded-lg flex flex-col items-center overflow-hidden relative">
        <div className="w-full h-8 bg-gradient-to-br from-neutral-100 to-neutral-200 relative">
          <svg viewBox="0 0 100 12" className="absolute -bottom-[1px] left-0 w-full" preserveAspectRatio="none"><path d="M0 12 Q25 0 50 8 Q75 16 100 4 L100 12 Z" fill="white"/></svg>
        </div>
        <div className="w-8 h-8 rounded-full bg-neutral-300 -mt-4 border-[3px] border-white z-10 shrink-0" />
        <div className="w-10 h-1 rounded-full bg-neutral-800 mt-1" />
        <div className="w-7 h-0.5 rounded-full bg-neutral-300 mt-0.5" />
        <div className="flex gap-1 mt-1.5">{[1,2,3].map(i=><div key={i} className="w-4 h-4 rounded-full bg-neutral-100"/>)}</div>
        <div className="w-full px-1.5 mt-1.5 space-y-1">
          <div className="h-5 rounded-xl bg-neutral-50 border border-neutral-200" />
          <div className="h-5 rounded-xl bg-neutral-50 border border-neutral-200" />
        </div>
        <div className="w-[calc(100%-12px)] h-4 rounded-full bg-neutral-900 mt-1.5 mb-1.5" />
      </div>
    </div>
  );

  /* GLASS — Gradient with floating blurred orbs, frosted cards */
  if (id === "glass") return (
    <div className={`${c} flex flex-col items-center justify-center px-2`} style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      {/* Floating orbs */}
      <div className="absolute top-2 right-1 w-8 h-8 rounded-full bg-pink-400/30 blur-md" />
      <div className="absolute bottom-4 left-0 w-10 h-10 rounded-full bg-blue-400/20 blur-lg" />
      <div className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full bg-white/10 blur-md" />
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/25 shadow-lg" />
        <div className="w-10 h-1 rounded-full bg-white/40 mt-1.5" />
        <div className="w-7 h-0.5 rounded-full bg-white/20 mt-0.5" />
        <div className="flex gap-1 mt-1.5">{[1,2,3].map(i=><div key={i} className="w-4 h-4 rounded-full bg-white/10 border border-white/15"/>)}</div>
        <div className="w-full space-y-1 mt-2">
          <div className="h-5 rounded-xl bg-white/[0.08] border border-white/[0.12]" />
          <div className="h-5 rounded-xl bg-white/[0.08] border border-white/[0.12]" />
        </div>
        <div className="w-full h-4 rounded-full bg-white mt-1.5" />
      </div>
    </div>
  );

  /* BOLD — Dark, hexagonal avatar frame, accent stripe, chunky cards */
  if (id === "bold") return (
    <div className={`${c} bg-neutral-950 flex flex-col items-center pt-2.5 px-2`}>
      {/* Diagonal accent stripe */}
      <div className="absolute top-0 right-0 w-12 h-full bg-indigo-500/[0.07] -skew-x-12 translate-x-3" />
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Hexagonal avatar */}
        <svg viewBox="0 0 40 44" className="w-11 h-12 shrink-0">
          <polygon points="20,2 38,12 38,32 20,42 2,32 2,12" fill="#1a1a1a" stroke="#6366f1" strokeWidth="2.5"/>
          <circle cx="20" cy="22" r="8" fill="#6366f1" opacity="0.2"/>
        </svg>
        <div className="w-12 h-1.5 rounded-full bg-white mt-1.5" />
        <div className="w-5 h-0.5 rounded-full bg-indigo-400 mt-0.5" />
        <div className="flex gap-1 mt-1.5">{[1,2,3].map(i=><div key={i} className="w-4 h-4 rounded bg-neutral-900 border border-neutral-800"/>)}</div>
        <div className="w-8 h-[2px] bg-indigo-500 mt-2 mb-1.5" />
        <div className="w-full space-y-1">
          <div className="h-5 rounded-lg bg-neutral-900 border border-neutral-800" />
          <div className="h-5 rounded-lg bg-neutral-900 border border-neutral-800" />
        </div>
        <div className="w-full h-4 rounded-full bg-indigo-500 mt-1.5" />
      </div>
    </div>
  );

  /* NEON — Black, ring avatar with animated glow, scanline overlay */
  if (id === "neon") return (
    <div className={`${c} bg-black flex flex-col items-center pt-3 px-2`}>
      {/* Scanlines */}
      <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:"repeating-linear-gradient(0deg, #22d3ee 0px, transparent 1px, transparent 3px)"}}/>
      {/* Corner accents */}
      <div className="absolute top-1 left-1 w-3 h-[1px] bg-cyan-400/40"/><div className="absolute top-1 left-1 w-[1px] h-3 bg-cyan-400/40"/>
      <div className="absolute bottom-1 right-1 w-3 h-[1px] bg-cyan-400/40"/><div className="absolute bottom-1 right-1 w-[1px] h-3 bg-cyan-400/40"/>
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Double-ring avatar */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border border-cyan-400/20 scale-[1.3]" />
          <div className="w-full h-full rounded-full border-2 border-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.5)]" />
        </div>
        <div className="w-10 h-1 rounded-full bg-white mt-1.5" />
        <div className="w-5 h-0.5 rounded-full bg-cyan-400 mt-0.5" />
        <div className="flex gap-1 mt-1.5">{[1,2,3].map(i=><div key={i} className="w-4 h-4 rounded-full border border-cyan-400/30 bg-cyan-400/10"/>)}</div>
        <div className="w-full space-y-1 mt-2">
          <div className="h-5 rounded-lg border border-cyan-400/25 bg-cyan-400/[0.06] shadow-[0_0_8px_rgba(34,211,238,0.08)]" />
          <div className="h-5 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.04]" />
        </div>
        <div className="w-full h-4 rounded-full bg-cyan-400 mt-1.5 shadow-[0_0_14px_rgba(34,211,238,0.4)]" />
      </div>
    </div>
  );

  /* COLLAGE — Tilted photo grid, film grain, frosted badge card */
  if (id === "collage") return (
    <div className={`${c}`}>
      <div className="absolute inset-[-10%] grid grid-cols-3 grid-rows-3 gap-[2px] rotate-[-6deg] scale-[1.15]">
        <div className="bg-rose-400 rounded-sm"/><div className="bg-sky-300 rounded-sm"/><div className="bg-amber-300 rounded-sm"/>
        <div className="bg-emerald-300 rounded-sm"/><div className="bg-violet-400 rounded-sm"/><div className="bg-orange-300 rounded-sm"/>
        <div className="bg-teal-300 rounded-sm"/><div className="bg-pink-300 rounded-sm"/><div className="bg-indigo-300 rounded-sm"/>
      </div>
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-2">
        <div className="w-full bg-black/40 rounded-2xl p-2.5 border border-white/10 flex flex-col items-center" style={{backdropFilter:"blur(8px)"}}>
          {/* Diamond avatar */}
          <div className="w-8 h-8 rotate-45 rounded-md bg-white/20 border border-white/25 overflow-hidden flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-white/15 -rotate-45"/>
          </div>
          <div className="w-10 h-1 rounded-full bg-white/40 mt-1.5" />
          <div className="w-6 h-0.5 rounded-full bg-white/20 mt-0.5" />
          <div className="flex gap-1 mt-1">{[1,2,3].map(i=><div key={i} className="w-3.5 h-3.5 rounded-md bg-white/10"/>)}</div>
        </div>
        <div className="w-full space-y-1 mt-1.5">
          <div className="h-4 rounded-xl bg-black/40 border border-white/10" style={{backdropFilter:"blur(4px)"}} />
          <div className="h-4 rounded-xl bg-black/40 border border-white/10" style={{backdropFilter:"blur(4px)"}} />
        </div>
        <div className="w-full h-4 rounded-full bg-white/90 mt-1.5" />
      </div>
    </div>
  );

  /* BENTO — Dark, varied box sizes, rounded avatar in pill card, staggered grid */
  if (id === "bento") return (
    <div className={`${c} bg-neutral-950 p-1.5`}>
      <div className="w-full h-full grid grid-cols-4 gap-[3px] auto-rows-fr">
        <div className="col-span-4 row-span-2 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center gap-2 px-2">
          <div className="w-7 h-7 rounded-lg bg-neutral-700 shrink-0" />
          <div><div className="w-10 h-1.5 bg-white/50 rounded-full"/><div className="w-6 h-1 bg-white/20 rounded-full mt-1"/></div>
        </div>
        <div className="col-span-2 row-span-1 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center gap-1">
          {[1,2,3].map(i=><div key={i} className="w-3.5 h-3.5 rounded bg-neutral-800"/>)}
        </div>
        <div className="col-span-2 row-span-1 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
          <div className="w-8 h-1 bg-neutral-600 rounded-full"/>
        </div>
        <div className="col-span-2 row-span-2 rounded-lg bg-gradient-to-br from-violet-900/40 to-violet-800/20 border border-violet-500/20" />
        <div className="col-span-2 row-span-2 rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-800" />
        <div className="col-span-2 row-span-1 rounded-lg bg-violet-600/15 border border-violet-500/25 flex items-center justify-center">
          <div className="w-8 h-0.5 bg-white/30 rounded-full"/>
        </div>
        <div className="col-span-2 row-span-1 rounded-lg bg-neutral-200 flex items-center justify-center">
          <div className="w-6 h-0.5 bg-neutral-700 rounded-full"/>
        </div>
      </div>
    </div>
  );

  /* SHOWCASE — Light, rounded square avatar, staggered 2-col masonry feel */
  if (id === "showcase") return (
    <div className={`${c} bg-neutral-100 flex items-center justify-center p-1.5`}>
      <div className="w-full h-full bg-white rounded-lg flex flex-col items-center overflow-hidden px-1.5 pt-2 pb-1.5">
        <div className="flex items-center gap-1.5 w-full mb-1.5">
          <div className="w-7 h-7 rounded-xl bg-neutral-200 shrink-0" />
          <div><div className="w-8 h-1 bg-neutral-800 rounded-full"/><div className="w-5 h-0.5 bg-neutral-300 rounded-full mt-0.5"/></div>
        </div>
        <div className="flex gap-1 mb-1.5">{[1,2,3].map(i=><div key={i} className="w-4 h-4 rounded-lg bg-neutral-100 border border-neutral-200"/>)}</div>
        {/* 2-col masonry */}
        <div className="w-full grid grid-cols-2 gap-[3px] mb-1.5">
          <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200">
            <div className="w-full h-full rounded-lg flex items-end p-1"><div className="w-6 h-0.5 bg-neutral-400 rounded-full"/></div>
          </div>
          <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-neutral-200 to-neutral-100">
            <div className="w-full h-full rounded-lg flex items-end p-1"><div className="w-4 h-0.5 bg-neutral-400 rounded-full"/></div>
          </div>
        </div>
        <div className="w-full grid grid-cols-2 gap-[3px] mb-1.5">
          <div className="h-5 rounded-lg bg-neutral-50 border border-neutral-200" />
          <div className="h-5 rounded-lg bg-neutral-50 border border-neutral-200" />
        </div>
        <div className="w-full h-4 rounded-full bg-neutral-900 mt-auto" />
      </div>
    </div>
  );

  /* SPLIT — Diagonal cut between image and content, overlapping avatar */
  if (id === "split") return (
    <div className={`${c}`}>
      <div className="flex w-full h-full">
        <div className="w-[42%] bg-gradient-to-b from-neutral-300 to-neutral-400 relative">
          {/* Diagonal edge */}
          <svg viewBox="0 0 10 100" className="absolute top-0 -right-[1px] h-full w-2" preserveAspectRatio="none"><polygon points="0,0 10,5 10,95 0,100" fill="white"/></svg>
        </div>
        <div className="w-[58%] bg-white flex flex-col justify-center gap-1 px-2 py-2 relative">
          {/* Avatar overlapping the split */}
          <div className="absolute -left-3 top-3 w-6 h-6 rounded-full bg-neutral-300 border-2 border-white shadow-md z-10"/>
          <div className="ml-2">
            <div className="w-10 h-1.5 bg-neutral-800 rounded-full"/>
            <div className="w-6 h-0.5 bg-neutral-300 rounded-full mt-0.5"/>
          </div>
          <div className="flex gap-0.5 mt-0.5 ml-2">{[1,2].map(i=><div key={i} className="px-1.5 py-0.5 rounded-full bg-neutral-50 border border-neutral-200"><div className="w-4 h-0.5 bg-neutral-400 rounded-full"/></div>)}</div>
          <div className="space-y-0.5 mt-1">
            <div className="h-4 rounded-lg bg-neutral-50 border border-neutral-200" />
            <div className="h-4 rounded-lg bg-neutral-50 border border-neutral-200" />
          </div>
          <div className="w-full h-3.5 rounded-full bg-neutral-900 mt-auto" />
        </div>
      </div>
    </div>
  );

  return <div className={`${c} bg-neutral-100 flex items-center justify-center`}><div className="w-8 h-8 rounded-full bg-neutral-300/50" /></div>;
}
