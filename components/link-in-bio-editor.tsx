"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

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

/* ── Constants ── */
const TEMPLATES = [
  { id: "minimal", name: "Minimal", desc: "Clean white card on grey", dark: false },
  { id: "glass", name: "Glass", desc: "Frosted on blurred background", dark: true },
  { id: "bold", name: "Bold", desc: "Dark with accent color", dark: true },
  { id: "showcase", name: "Showcase", desc: "2-column media grid", dark: false },
  { id: "neon", name: "Neon", desc: "Futuristic neon glow", dark: true },
  { id: "collage", name: "Collage", desc: "Portfolio images as background", dark: true },
  { id: "bento", name: "Bento", desc: "Apple-style grid boxes", dark: true },
  { id: "split", name: "Split", desc: "Magazine hero layout", dark: false },
];

const BG_TYPES = [
  { id: "gradient", name: "Gradient", icon: "◐" },
  { id: "solid", name: "Solid Color", icon: "■" },
  { id: "image", name: "Image", icon: "🖼" },
  { id: "collage", name: "Photo Collage", icon: "⊞" },
  { id: "video", name: "Video", icon: "▶" },
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

const SOLID_COLORS = [
  "#ffffff", "#f5f5f5", "#e5e5e5", "#171717", "#0a0a0a",
  "#1e293b", "#0f172a", "#fef3c7", "#ecfdf5", "#eff6ff",
  "#fdf2f8", "#f5f3ff", "#dc2626", "#2563eb", "#16a34a",
];

const ACCENT_COLORS = [
  "#171717", "#6366f1", "#22d3ee", "#ef4444", "#f97316",
  "#22c55e", "#a855f7", "#ec4899", "#eab308", "#14b8a6",
];

const BUTTON_SHAPES = [
  { id: "rounded", name: "Rounded", radius: "16px", preview: "rounded-2xl" },
  { id: "pill", name: "Pill", radius: "9999px", preview: "rounded-full" },
  { id: "square", name: "Square", radius: "0px", preview: "rounded-none" },
  { id: "soft", name: "Soft", radius: "8px", preview: "rounded-lg" },
  { id: "blob", name: "Blob", radius: "30% 70% 70% 30% / 30% 30% 70% 70%", preview: "rounded-3xl" },
];

const BUTTON_ANIMS = [
  { id: "none", name: "None" },
  { id: "bounce", name: "Bounce" },
  { id: "pulse", name: "Pulse" },
  { id: "shake", name: "Shake" },
  { id: "scale", name: "Scale Up" },
  { id: "slide", name: "Slide Right" },
  { id: "glow", name: "Glow" },
];

/* ── Editor ── */
export function LinkInBioEditorContent({ user }: { user: any }) {
  const [settings, setSettings] = useState<Settings>({
    template: user.link_bio_template || "minimal",
    accent: user.link_bio_accent || "#171717",
    bgType: user.link_bio_bg_type || "gradient",
    bgValue: user.link_bio_bg_value || "",
    bgVideo: user.link_bio_bg_video || "",
    buttonShape: user.link_bio_button_shape || "rounded",
    buttonAnim: user.link_bio_button_anim || "none",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("template");
  const [previewAnim, setPreviewAnim] = useState<string | null>(null);

  const save = useCallback(async (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        link_bio_template: newSettings.template,
        link_bio_accent: newSettings.accent,
        link_bio_bg_type: newSettings.bgType,
        link_bio_bg_value: newSettings.bgValue,
        link_bio_bg_video: newSettings.bgVideo,
        link_bio_button_shape: newSettings.buttonShape,
        link_bio_button_anim: newSettings.buttonAnim,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [settings]);

  function triggerPreviewAnim(animId: string) {
    setPreviewAnim(null);
    requestAnimationFrame(() => setPreviewAnim(animId));
    setTimeout(() => setPreviewAnim(null), 800);
  }

  const sections = [
    { id: "template", name: "Template", icon: "⊞" },
    { id: "background", name: "Background", icon: "◐" },
    { id: "buttons", name: "Buttons", icon: "▭" },
    { id: "colors", name: "Colors", icon: "◉" },
  ];

  const showAccent = ["bold", "neon", "bento"].includes(settings.template);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-500"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <h1 className="font-display font-bold text-neutral-900">Edit Link in Bio</h1>
          </div>
          <div className="flex items-center gap-3">
            {saving && <span className="text-xs text-neutral-400">Saving...</span>}
            {saved && <span className="text-xs text-emerald-600 font-medium">Saved</span>}
            {user.slug && (
              <Link href={`/u/${user.slug}`} target="_blank" className="px-4 py-2 text-xs font-medium bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors">
                Preview
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left — Editor panels */}
          <div className="lg:w-[55%] space-y-4">

            {/* Section tabs */}
            <div className="flex gap-1 p-1 bg-white rounded-2xl border border-neutral-200 overflow-x-auto">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                    activeSection === s.id ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <span>{s.icon}</span> {s.name}
                </button>
              ))}
            </div>

            {/* ── Template Section ── */}
            {activeSection === "template" && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                <h2 className="font-display font-bold text-neutral-900 text-sm mb-4">Choose a Template</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => save({ template: t.id })}
                      className={`relative rounded-2xl overflow-hidden transition-all ${
                        settings.template === t.id ? "ring-2 ring-neutral-900 ring-offset-2" : "hover:ring-1 hover:ring-neutral-300 ring-offset-1"
                      }`}
                    >
                      <div className={`aspect-[3/4] ${t.dark ? "bg-neutral-900" : "bg-neutral-100"} flex flex-col items-center justify-center gap-1.5 p-3`}>
                        <div className={`w-8 h-8 rounded-full ${t.dark ? "bg-white/20" : "bg-neutral-300"}`} />
                        <div className={`w-12 h-1 rounded-full ${t.dark ? "bg-white/15" : "bg-neutral-200"}`} />
                        <div className={`w-16 h-3 rounded-md mt-1 ${t.dark ? "bg-white/10" : "bg-neutral-200/80"}`} />
                        <div className={`w-16 h-3 rounded-md ${t.dark ? "bg-white/10" : "bg-neutral-200/80"}`} />
                      </div>
                      <div className="px-2.5 py-2 bg-white">
                        <div className="text-[10px] font-bold text-neutral-900">{t.name}</div>
                        <div className="text-[9px] text-neutral-400 leading-snug">{t.desc}</div>
                      </div>
                      {settings.template === t.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center shadow-md">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Background Section ── */}
            {activeSection === "background" && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-5">
                <div>
                  <h2 className="font-display font-bold text-neutral-900 text-sm mb-3">Background Type</h2>
                  <div className="flex flex-wrap gap-2">
                    {BG_TYPES.map(bg => (
                      <button
                        key={bg.id}
                        onClick={() => save({ bgType: bg.id })}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          settings.bgType === bg.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        <span>{bg.icon}</span> {bg.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gradient picker */}
                {settings.bgType === "gradient" && (
                  <div>
                    <h3 className="text-xs font-medium text-neutral-500 mb-2">Choose Gradient</h3>
                    <div className="grid grid-cols-6 gap-2">
                      {GRADIENTS.map((g, i) => (
                        <button
                          key={i}
                          onClick={() => save({ bgValue: g })}
                          className={`aspect-square rounded-xl transition-all hover:scale-105 ${settings.bgValue === g ? "ring-2 ring-neutral-900 ring-offset-2" : ""}`}
                          style={{ background: g }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Solid color */}
                {settings.bgType === "solid" && (
                  <div>
                    <h3 className="text-xs font-medium text-neutral-500 mb-2">Background Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {SOLID_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => save({ bgValue: c })}
                          className={`w-9 h-9 rounded-xl border transition-all hover:scale-105 ${
                            settings.bgValue === c ? "ring-2 ring-neutral-900 ring-offset-2" : "border-neutral-200"
                          }`}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <label className="text-[10px] text-neutral-400">Custom:</label>
                      <input type="color" value={settings.bgValue || "#ffffff"} onChange={e => save({ bgValue: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                      <input type="text" value={settings.bgValue || ""} onChange={e => save({ bgValue: e.target.value })} placeholder="#hex" className="text-xs px-3 py-1.5 border border-neutral-200 rounded-lg w-24" />
                    </div>
                  </div>
                )}

                {/* Image upload */}
                {settings.bgType === "image" && (
                  <div>
                    <h3 className="text-xs font-medium text-neutral-500 mb-2">Background Image</h3>
                    <p className="text-[11px] text-neutral-400 mb-3">Upload a background image or paste a URL. Your portfolio images and cover photo also work as backgrounds in the Collage and Glass templates.</p>
                    <input
                      type="text"
                      value={settings.bgValue || ""}
                      onChange={e => save({ bgValue: e.target.value })}
                      placeholder="Paste image URL..."
                      className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                )}

                {/* Photo collage */}
                {settings.bgType === "collage" && (
                  <div>
                    <h3 className="text-xs font-medium text-neutral-500 mb-2">Photo Collage Background</h3>
                    <p className="text-[11px] text-neutral-400 mb-3">
                      Uses your portfolio images as a tiled mosaic background. Add more portfolio images in your profile to make the collage richer. Works best with the <strong>Collage</strong> template.
                    </p>
                    <button onClick={() => save({ template: "collage", bgType: "collage" })} className="px-4 py-2.5 bg-neutral-900 text-white text-xs font-medium rounded-xl hover:bg-neutral-800 transition-colors">
                      Switch to Collage Template
                    </button>
                  </div>
                )}

                {/* Video background */}
                {settings.bgType === "video" && (
                  <div>
                    <h3 className="text-xs font-medium text-neutral-500 mb-2">Video Background</h3>
                    <p className="text-[11px] text-neutral-400 mb-3">Paste a direct video URL (MP4). The video will loop silently behind your content. Works best with the Glass template.</p>
                    <input
                      type="text"
                      value={settings.bgVideo || ""}
                      onChange={e => save({ bgVideo: e.target.value })}
                      placeholder="https://example.com/video.mp4"
                      className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                    {settings.bgVideo && (
                      <div className="mt-3 aspect-video rounded-xl overflow-hidden bg-black">
                        <video src={settings.bgVideo} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Buttons Section ── */}
            {activeSection === "buttons" && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-5">
                <div>
                  <h2 className="font-display font-bold text-neutral-900 text-sm mb-3">Button Shape</h2>
                  <div className="grid grid-cols-5 gap-2">
                    {BUTTON_SHAPES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => save({ buttonShape: s.id })}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                          settings.buttonShape === s.id ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        <div
                          className={`w-full h-8 border-2 ${settings.buttonShape === s.id ? "border-white/40 bg-white/10" : "border-neutral-300 bg-neutral-200/50"}`}
                          style={{ borderRadius: s.radius }}
                        />
                        <span className="text-[9px] font-bold">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-display font-bold text-neutral-900 text-sm mb-3">Click Animation</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BUTTON_ANIMS.map(a => (
                      <button
                        key={a.id}
                        onClick={() => { save({ buttonAnim: a.id }); triggerPreviewAnim(a.id); }}
                        className={`relative px-4 py-3 text-xs font-medium transition-all ${
                          settings.buttonAnim === a.id ? "bg-neutral-900 text-white rounded-xl" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 rounded-xl"
                        }`}
                        style={previewAnim === a.id ? getAnimStyle(a.id) : undefined}
                      >
                        {a.name}
                        {settings.buttonAnim === a.id && (
                          <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-400 flex items-center justify-center">
                            <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Live preview button */}
                  <div className="mt-4 p-4 bg-neutral-50 rounded-xl">
                    <p className="text-[10px] text-neutral-400 mb-2 text-center">Click to preview animation</p>
                    <button
                      onClick={() => triggerPreviewAnim(settings.buttonAnim)}
                      className="w-full py-3.5 bg-neutral-900 text-white text-sm font-medium transition-all"
                      style={{
                        borderRadius: BUTTON_SHAPES.find(s => s.id === settings.buttonShape)?.radius || "16px",
                        ...(previewAnim ? getAnimStyle(previewAnim) : {}),
                      }}
                    >
                      Example Button
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Colors Section ── */}
            {activeSection === "colors" && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-5">
                <div>
                  <h2 className="font-display font-bold text-neutral-900 text-sm mb-1">Accent Color</h2>
                  <p className="text-[11px] text-neutral-400 mb-3">Used by Bold, Neon, and Bento templates for highlights and glows.{!showAccent && " Switch to one of those templates to see the effect."}</p>
                  <div className="flex flex-wrap gap-2.5">
                    {ACCENT_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => save({ accent: c })}
                        className={`w-9 h-9 rounded-xl transition-all hover:scale-110 ${
                          settings.accent === c ? "ring-2 ring-offset-2 ring-neutral-900 scale-110" : ""
                        }`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <label className="text-[10px] text-neutral-400">Custom:</label>
                    <input type="color" value={settings.accent} onChange={e => save({ accent: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                    <input type="text" value={settings.accent} onChange={e => save({ accent: e.target.value })} className="text-xs px-3 py-1.5 border border-neutral-200 rounded-lg w-24" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right — Live preview in phone frame */}
          <div className="lg:w-[45%] lg:sticky lg:top-20 lg:self-start">
            <div className="bg-white rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-neutral-500">Live Preview</span>
                {user.slug && (
                  <Link href={`/u/${user.slug}`} target="_blank" className="text-[11px] text-blue-600 hover:text-blue-800 font-medium">
                    Open full page →
                  </Link>
                )}
              </div>
              {/* Phone frame */}
              <div className="mx-auto w-[280px] h-[560px] bg-black rounded-[2.5rem] shadow-xl border-[5px] border-neutral-800 overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90px] h-[22px] bg-black rounded-b-xl z-50" />
                <div className="w-full h-full overflow-hidden rounded-[2rem]">
                  {user.slug ? (
                    <iframe
                      key={JSON.stringify(settings)}
                      src={`/u/${user.slug}?t=${Date.now()}`}
                      className="w-[390px] h-[844px] origin-top-left border-0"
                      style={{ transform: "scale(0.718)", transformOrigin: "top left" }}
                      title="Preview"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">No slug set</div>
                  )}
                </div>
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-white/30 rounded-full z-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes previewBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes previewPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes previewShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        @keyframes previewScale { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        @keyframes previewSlide { 0% { transform: translateX(0); } 50% { transform: translateX(8px); } 100% { transform: translateX(0); } }
        @keyframes previewGlow { 0%,100% { box-shadow: 0 0 0 transparent; } 50% { box-shadow: 0 0 20px rgba(99,102,241,0.5); } }
      `}</style>
    </div>
  );
}

function getAnimStyle(animId: string): React.CSSProperties {
  const anims: Record<string, string> = {
    bounce: "previewBounce 0.5s ease",
    pulse: "previewPulse 0.4s ease",
    shake: "previewShake 0.3s ease",
    scale: "previewScale 0.4s ease",
    slide: "previewSlide 0.4s ease",
    glow: "previewGlow 0.6s ease",
  };
  return anims[animId] ? { animation: anims[animId] } : {};
}
