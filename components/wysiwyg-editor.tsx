"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { LinkManager } from "./link-manager";

/* ══════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════ */
interface EditorData {
  user: Record<string, any>;
  socials: Record<string, any>[];
  services: Record<string, any>[];
  bioLinks: Record<string, any>[];
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface Block {
  id: string;
  type: string;
  config: Record<string, any>;
  visible: boolean;
  order: number;
}

/* ══════════════════════════════════════════════════════
   AUTOSAVE HOOK
   ══════════════════════════════════════════════════════ */
function useAutosave(delay = 800) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const pendingRef = useRef<Record<string, any>>({});

  const save = useCallback(async (fields: Record<string, any>) => {
    pendingRef.current = { ...pendingRef.current, ...fields };
    const toSave = { ...pendingRef.current };
    const key = JSON.stringify(toSave);
    if (key === lastSavedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setStatus("saving");
      setErrorMsg("");
      try {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toSave),
        });
        if (res.ok) {
          lastSavedRef.current = key;
          pendingRef.current = {};
          setStatus("saved");
          setTimeout(() => setStatus("idle"), 2000);
        } else {
          const data = await res.json().catch(() => ({}));
          setErrorMsg(data.error === "unauthorized" ? "Session expired — please sign in again" : data.message || `Save failed (${res.status})`);
          setStatus("error");
        }
      } catch (e: any) {
        setErrorMsg("Network error — check your connection");
        setStatus("error");
      }
    }, delay);
  }, [delay]);

  const saveNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const toSave = { ...pendingRef.current };
    if (Object.keys(toSave).length === 0) {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
      return;
    }
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      });
      if (res.ok) {
        lastSavedRef.current = JSON.stringify(toSave);
        pendingRef.current = {};
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error === "unauthorized" ? "Session expired — please sign in again" : data.message || `Save failed (${res.status})`);
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error — check your connection");
      setStatus("error");
    }
  }, []);

  return { status, errorMsg, save, saveNow };
}

/* ══════════════════════════════════════════════════════
   INLINE EDITABLE TEXT
   ══════════════════════════════════════════════════════ */
function InlineText({
  value, onChange, placeholder, className, tag = "span", multiline = false,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  className?: string; tag?: "span" | "h1" | "p"; multiline?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);

  function handleBlur() {
    setEditing(false);
    const text = ref.current?.innerText?.trim() || "";
    if (text !== value) onChange(text);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      ref.current?.blur();
    }
  }

  const Tag = tag as any;
  const isEmpty = !value;

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => setEditing(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-none cursor-text transition-all ${editing ? "ring-2 ring-blue-400/50 rounded-lg px-1 -mx-1" : "hover:ring-1 hover:ring-neutral-300/50 hover:rounded-lg"} ${isEmpty && !editing ? "opacity-40" : ""} ${className || ""}`}
      data-placeholder={placeholder}
      dangerouslySetInnerHTML={{ __html: value || placeholder }}
    />
  );
}

/* ══════════════════════════════════════════════════════
   TOOLBAR (floating top bar)
   ══════════════════════════════════════════════════════ */
function EditorToolbar({ status, errorMsg, slug, onSave }: {
  status: SaveStatus; errorMsg: string; slug: string;
  onSave: () => void;
}) {
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-3 md:px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <a href="/dashboard" className="p-2 rounded-xl hover:bg-neutral-100 transition-colors text-neutral-500 shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <div className="hidden md:block">
            <span className="text-sm font-semibold text-neutral-900">Editing Link in Bio</span>
            <span className="text-xs text-neutral-400 ml-2">hireacreator.ai/u/{slug}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {status === "saving" && <><div className="w-3 h-3 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" /><span className="text-xs text-neutral-400 hidden sm:inline">Saving...</span></>}
            {status === "saved" && <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg><span className="text-xs text-emerald-600">Saved</span></>}
            {status === "error" && <span className="text-xs text-red-500 max-w-[120px] md:max-w-[180px] truncate" title={errorMsg}>{errorMsg || "Save failed"}</span>}
          </div>
          <button onClick={onSave} disabled={status === "saving"} className="px-3 md:px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm">
            Save
          </button>
          <a href={`/u/${slug}`} target="_blank" className="hidden md:inline-flex px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors">
            View Live
          </a>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SHARED UI HELPERS
   ══════════════════════════════════════════════════════ */
const LABEL = "text-[10px] font-bold text-neutral-400 uppercase tracking-wider";
const SECTION_LABEL = "text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2";

function ColorPickerRow({ label, value, onChange, swatches }: { label: string; value: string; onChange: (v: string) => void; swatches?: string[] }) {
  return (
    <div>
      <h4 className={SECTION_LABEL}>{label}</h4>
      <div className="flex items-center gap-2 flex-wrap">
        <input type="color" value={value || "#171717"} onChange={e => onChange(e.target.value)} className="w-7 h-7 rounded-lg border border-neutral-200 cursor-pointer shrink-0" />
        <span className="text-[10px] text-neutral-500 font-mono">{value || "#171717"}</span>
        {swatches && swatches.map(s => (
          <button key={s} onClick={() => onChange(s)} className={`w-5 h-5 rounded-full border-2 transition-all ${value === s ? "border-neutral-900 scale-110" : "border-transparent hover:border-neutral-300"}`} style={{ background: s }} />
        ))}
      </div>
    </div>
  );
}

function SliderRow({ label, value, onChange, min, max, unit = "px" }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; unit?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h4 className={LABEL}>{label}</h4>
        <span className="text-[10px] text-neutral-400">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-neutral-900" />
    </div>
  );
}

function OptionButtons({ value, options, onChange }: { value: string; options: { id: string; name: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} className={`py-2 text-[10px] font-medium rounded-lg transition-all ${value === o.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{o.name}</button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════ */
const FREE_ANIMS = ["none", "fade-up", "scale-in"];
const PREMIUM_ANIMS = [
  { id: "spotlight", name: "Spotlight" },
  { id: "glitch", name: "Glitch" },
  { id: "particle-burst", name: "Particle Burst" },
  { id: "typewriter", name: "Typewriter" },
  { id: "wave", name: "Wave" },
  { id: "neon", name: "Neon" },
  { id: "cinema", name: "Cinema" },
  { id: "morph", name: "Morph" },
  { id: "trading-candles", name: "Trading Candles" },
];

const TEMPLATES = [
  { id: "minimal", name: "Minimal" }, { id: "glass", name: "Glass" },
  { id: "bold", name: "Bold" }, { id: "showcase", name: "Showcase" },
  { id: "neon", name: "Neon" }, { id: "collage", name: "Collage" },
  { id: "bento", name: "Bento" }, { id: "split", name: "Split" },
  { id: "aurora", name: "Aurora" }, { id: "brutalist", name: "Brutalist" },
  { id: "sunset", name: "Sunset" }, { id: "terminal", name: "Terminal" },
  { id: "pastel", name: "Pastel" }, { id: "magazine", name: "Magazine" },
  { id: "retro", name: "Retro" }, { id: "midnight", name: "Midnight" },
  { id: "clay", name: "Clay" }, { id: "gradient-mesh", name: "Gradient Mesh" },
  { id: "trader", name: "Trader" }, { id: "educator", name: "Educator" },
  { id: "developer", name: "Developer" }, { id: "executive", name: "Executive" },
];

const GRADIENT_PRESETS = [
  { label: "None", value: "" },
  { label: "Sunset", value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  { label: "Ocean", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { label: "Forest", value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
  { label: "Night", value: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" },
  { label: "Peach", value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
  { label: "Sky", value: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)" },
  { label: "Berry", value: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" },
  { label: "Fire", value: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)" },
  { label: "Mint", value: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)" },
  { label: "Dark", value: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" },
  { label: "Coral", value: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
];

const FONTS = [
  { id: "inter", name: "Inter" }, { id: "outfit", name: "Outfit" },
  { id: "jakarta", name: "Jakarta" }, { id: "poppins", name: "Poppins" },
  { id: "space-grotesk", name: "Space Grotesk" }, { id: "sora", name: "Sora" },
  { id: "manrope", name: "Manrope" }, { id: "dm-sans", name: "DM Sans" },
];

const ACCENT_SWATCHES = ["#6366f1", "#22d3ee", "#ef4444", "#f97316", "#22c55e", "#a855f7", "#ec4899", "#eab308", "#14b8a6", "#171717"];
const TEXT_COLOR_PRESETS = [
  { id: "#ffffff", name: "White" }, { id: "#e5e5e5", name: "Light" },
  { id: "#404040", name: "Dark" }, { id: "#000000", name: "Black" },
  { id: "#6366f1", name: "Indigo" }, { id: "#ec4899", name: "Pink" }, { id: "#22d3ee", name: "Cyan" },
];

const BG_SWATCHES = ["#ffffff", "#f5f5f5", "#171717", "#0a0a0a", "#1e1b4b", "#0c4a6e", "#14532d", "#7c2d12"];

const GRADIENT_DIRECTIONS = [
  { deg: "0deg", label: "Up" }, { deg: "45deg", label: "Up-Right" },
  { deg: "90deg", label: "Right" }, { deg: "135deg", label: "Down-Right" },
  { deg: "180deg", label: "Down" }, { deg: "225deg", label: "Down-Left" },
  { deg: "270deg", label: "Left" }, { deg: "315deg", label: "Up-Left" },
];

const BUTTON_SHAPES = [
  { id: "rounded", name: "Rounded" }, { id: "pill", name: "Pill" },
  { id: "square", name: "Square" }, { id: "soft", name: "Soft" },
];

const SHADOW_OPTIONS = [
  { id: "none", name: "None" }, { id: "subtle", name: "Subtle" },
  { id: "medium", name: "Medium" }, { id: "lifted", name: "Lifted" },
];

const BUTTON_WIDTH_OPTIONS = [
  { id: "compact", name: "Compact" }, { id: "standard", name: "Standard" }, { id: "full", name: "Full Width" },
];

const BUTTON_ANIM_OPTIONS = [
  { id: "none", name: "None" }, { id: "bounce", name: "Bounce" },
  { id: "pulse", name: "Pulse" }, { id: "shake", name: "Shake" },
  { id: "scale", name: "Scale" }, { id: "glow", name: "Glow" },
];

const PROFILE_SHAPES = [
  { id: "circle", name: "Circle" }, { id: "rounded", name: "Rounded" },
  { id: "square", name: "Square" }, { id: "hexagon", name: "Hexagon" },
];

const CONTAINER_OPTIONS = [
  { id: "compact", name: "Compact" }, { id: "standard", name: "Standard" },
  { id: "wide", name: "Wide" }, { id: "full", name: "Full" },
];

const HOVER_OPTIONS = [
  { id: "none", name: "None" }, { id: "lift", name: "Lift" },
  { id: "glow", name: "Glow" }, { id: "scale", name: "Scale" }, { id: "shadow", name: "Shadow" },
];

const ANIM_SPEED_OPTIONS = [
  { id: "instant", name: "Instant" }, { id: "fast", name: "Fast" },
  { id: "normal", name: "Normal" }, { id: "slow", name: "Slow" },
];

const BLOCK_TYPES = [
  { type: "hero", name: "Hero", desc: "Hero header section" },
  { type: "cta", name: "CTA", desc: "Call-to-action button" },
  { type: "links", name: "Links", desc: "Bio links list" },
  { type: "socials", name: "Socials", desc: "Social icons grid" },
  { type: "video", name: "Video", desc: "Video embed" },
  { type: "testimonial", name: "Testimonial", desc: "Quote block" },
  { type: "contact", name: "Contact", desc: "Contact card" },
  { type: "gallery", name: "Gallery", desc: "Image gallery" },
  { type: "product", name: "Product", desc: "Product card" },
  { type: "booking", name: "Booking", desc: "Booking section" },
  { type: "divider", name: "Divider", desc: "Visual separator" },
  { type: "text", name: "Text", desc: "Custom text block" },
];

const DEFAULT_BLOCKS: Block[] = [
  { id: "hero", type: "hero", config: {}, visible: true, order: 0 },
  { id: "links", type: "links", config: {}, visible: true, order: 1 },
  { id: "socials", type: "socials", config: {}, visible: true, order: 2 },
  { id: "cta", type: "cta", config: {}, visible: true, order: 3 },
];

/* ══════════════════════════════════════════════════════
   AI DESIGN SECTION
   ══════════════════════════════════════════════════════ */
function AIDesignSection({ onDesignApplied }: { onDesignApplied: () => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  async function runAIDesign() {
    if (!url.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/profile/ai-design-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceUrls: [url.trim()] }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult("Design applied!");
        onDesignApplied();
        if (data.design?.suggestedLogo) {
          setResult("Design applied! Logo suggestion found.");
        }
      } else {
        setResult("Failed to generate design");
      }
    } catch {
      setResult("Network error");
    }
    setLoading(false);
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-3 border border-indigo-100">
      <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2">AI Design</h4>
      <p className="text-[10px] text-neutral-500 mb-2">Paste a website or social URL to match your brand</p>
      <div className="flex gap-1.5">
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="flex-1 px-2.5 py-2 rounded-lg border border-indigo-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400/30 bg-white" onKeyDown={e => e.key === "Enter" && runAIDesign()} />
        <button onClick={runAIDesign} disabled={loading || !url.trim()} className="px-3 py-2 text-[10px] font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 whitespace-nowrap">
          {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mx-2" /> : "AI Design"}
        </button>
      </div>
      {result && <p className="text-[10px] mt-1.5 text-indigo-600 font-medium">{result}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   DESIGN PANEL — FULL (Advanced)
   ══════════════════════════════════════════════════════ */
function DesignPanelFull({ data, onUpdate, ownedAnimations, onRefreshPreview }: {
  data: Record<string, any>;
  onUpdate: (fields: Record<string, any>) => void;
  ownedAnimations: string[];
  onRefreshPreview: () => void;
}) {
  const [bgTab, setBgTab] = useState<string>(data.link_bio_bg_type || "solid");
  const [openSection, setOpenSection] = useState<string>("template");

  function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    const isOpen = openSection === id;
    return (
      <div className="border border-neutral-200 rounded-xl overflow-hidden">
        <button onClick={() => setOpenSection(isOpen ? "" : id)} className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
          {title}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isOpen ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6" strokeLinecap="round" /></svg>
        </button>
        {isOpen && <div className="px-3 pb-3 space-y-4">{children}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* AI Design */}
      <AIDesignSection onDesignApplied={onRefreshPreview} />

      {/* Template */}
      <Section id="template" title="Template">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 max-h-[280px] overflow-y-auto pr-1">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => onUpdate({ link_bio_template: t.id })} className={`py-2 text-[10px] font-medium rounded-lg transition-all ${data.link_bio_template === t.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{t.name}</button>
          ))}
        </div>
      </Section>

      {/* Typography */}
      <Section id="typography" title="Typography">
        <div>
          <h4 className={SECTION_LABEL}>Font Family</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {FONTS.map(f => (
              <button key={f.id} onClick={() => onUpdate({ link_bio_font: f.id })} className={`py-2 text-[10px] font-medium rounded-lg transition-all ${data.link_bio_font === f.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{f.name}</button>
            ))}
          </div>
        </div>
        <div>
          <h4 className={SECTION_LABEL}>Font Size</h4>
          <OptionButtons value={data.link_bio_font_size || "medium"} options={[{ id: "small", name: "Small" }, { id: "medium", name: "Medium" }, { id: "large", name: "Large" }, { id: "xl", name: "XL" }]} onChange={v => onUpdate({ link_bio_font_size: v })} />
        </div>
        <div>
          <h4 className={SECTION_LABEL}>Font Weight</h4>
          <OptionButtons value={String(data.link_bio_font_weight || "400")} options={[{ id: "300", name: "Light" }, { id: "400", name: "Regular" }, { id: "500", name: "Medium" }, { id: "600", name: "Semi" }, { id: "700", name: "Bold" }]} onChange={v => onUpdate({ link_bio_font_weight: Number(v) })} />
        </div>
        <div>
          <h4 className={SECTION_LABEL}>Letter Spacing</h4>
          <OptionButtons value={data.link_bio_letter_spacing || "normal"} options={[{ id: "tight", name: "Tight" }, { id: "normal", name: "Normal" }, { id: "wide", name: "Wide" }]} onChange={v => onUpdate({ link_bio_letter_spacing: v })} />
        </div>
        <ColorPickerRow label="Accent Color" value={data.link_bio_accent || "#171717"} onChange={v => onUpdate({ link_bio_accent: v })} swatches={ACCENT_SWATCHES} />
        <div>
          <h4 className={SECTION_LABEL}>Text Color</h4>
          <div className="flex items-center gap-2 flex-wrap">
            <input type="color" value={data.link_bio_text_color || "#171717"} onChange={e => onUpdate({ link_bio_text_color: e.target.value })} className="w-7 h-7 rounded-lg border border-neutral-200 cursor-pointer shrink-0" />
            {TEXT_COLOR_PRESETS.map(p => (
              <button key={p.id} onClick={() => onUpdate({ link_bio_text_color: p.id })} className={`px-2 py-1 text-[9px] font-medium rounded-md transition-all ${data.link_bio_text_color === p.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{p.name}</button>
            ))}
          </div>
        </div>
      </Section>

      {/* Background */}
      <Section id="background" title="Background">
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
          {["solid", "gradient", "image", "video"].map(t => (
            <button key={t} onClick={() => { setBgTab(t); onUpdate({ link_bio_bg_type: t }); }} className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all capitalize ${bgTab === t ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}>{t}</button>
          ))}
        </div>

        {bgTab === "solid" && (
          <ColorPickerRow label="Color" value={data.link_bio_bg_value || "#ffffff"} onChange={v => onUpdate({ link_bio_bg_value: v })} swatches={BG_SWATCHES} />
        )}

        {bgTab === "gradient" && (
          <div className="space-y-3">
            <div>
              <h4 className={SECTION_LABEL}>Direction</h4>
              <div className="grid grid-cols-4 gap-1">
                {GRADIENT_DIRECTIONS.map(d => {
                  const current = data.link_bio_gradient_direction || "135deg";
                  return (
                    <button key={d.deg} onClick={() => {
                      const c1 = data.link_bio_gradient_color1 || "#6366f1";
                      const c2 = data.link_bio_gradient_color2 || "#a855f7";
                      onUpdate({ link_bio_gradient_direction: d.deg, link_bio_bg_value: `linear-gradient(${d.deg}, ${c1} 0%, ${c2} 100%)` });
                    }} title={d.label}
                      className={`py-1.5 text-[9px] font-medium rounded-md transition-all ${current === d.deg ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                      {d.label.split("-").map(w => w[0]).join("")}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <h4 className={SECTION_LABEL}>Color 1</h4>
                <input type="color" value={data.link_bio_gradient_color1 || "#6366f1"} onChange={e => {
                  const dir = data.link_bio_gradient_direction || "135deg";
                  const c2 = data.link_bio_gradient_color2 || "#a855f7";
                  onUpdate({ link_bio_gradient_color1: e.target.value, link_bio_bg_value: `linear-gradient(${dir}, ${e.target.value} 0%, ${c2} 100%)` });
                }} className="w-full h-7 rounded-lg border border-neutral-200 cursor-pointer" />
              </div>
              <div className="flex-1">
                <h4 className={SECTION_LABEL}>Color 2</h4>
                <input type="color" value={data.link_bio_gradient_color2 || "#a855f7"} onChange={e => {
                  const dir = data.link_bio_gradient_direction || "135deg";
                  const c1 = data.link_bio_gradient_color1 || "#6366f1";
                  onUpdate({ link_bio_gradient_color2: e.target.value, link_bio_bg_value: `linear-gradient(${dir}, ${c1} 0%, ${e.target.value} 100%)` });
                }} className="w-full h-7 rounded-lg border border-neutral-200 cursor-pointer" />
              </div>
            </div>
            <div>
              <h4 className={SECTION_LABEL}>Presets</h4>
              <div className="grid grid-cols-4 gap-1.5">
                {GRADIENT_PRESETS.map(g => (
                  <button key={g.label} onClick={() => onUpdate({ link_bio_bg_value: g.value })} className="h-8 rounded-lg border border-neutral-200 hover:border-neutral-400 transition-all text-[8px] font-medium text-neutral-500" style={{ background: g.value || "#fff" }} title={g.label} />
                ))}
              </div>
            </div>
          </div>
        )}

        {bgTab === "image" && (
          <div className="space-y-3">
            <label className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-neutral-200 cursor-pointer text-xs font-medium text-neutral-500 hover:border-neutral-400 transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={async e => {
                const file = e.target.files?.[0]; if (!file) return;
                const fd = new FormData(); fd.append("file", file); fd.append("type", "background");
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                if (res.ok) { const d = await res.json(); if (d.url) onUpdate({ link_bio_bg_value: d.url }); }
              }} />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Upload Background
            </label>
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className={LABEL}>Overlay</h4>
                <button onClick={() => onUpdate({ link_bio_bg_overlay: data.link_bio_bg_overlay === "dark" ? "light" : "dark" })} className="text-[10px] text-neutral-500 font-medium">{data.link_bio_bg_overlay === "light" ? "Light" : "Dark"}</button>
              </div>
              <SliderRow label="Overlay Opacity" value={data.link_bio_bg_overlay_opacity ?? 40} onChange={v => onUpdate({ link_bio_bg_overlay_opacity: v })} min={0} max={100} unit="%" />
            </div>
          </div>
        )}

        {bgTab === "video" && (
          <div className="space-y-3">
            <div>
              <h4 className={SECTION_LABEL}>Video URL</h4>
              <input value={data.link_bio_bg_video || ""} onChange={e => onUpdate({ link_bio_bg_video: e.target.value })} placeholder="https://..." className="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/10" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className={LABEL}>Overlay</h4>
                <button onClick={() => onUpdate({ link_bio_bg_overlay: data.link_bio_bg_overlay === "dark" ? "light" : "dark" })} className="text-[10px] text-neutral-500 font-medium">{data.link_bio_bg_overlay === "light" ? "Light" : "Dark"}</button>
              </div>
              <SliderRow label="Overlay Opacity" value={data.link_bio_bg_overlay_opacity ?? 40} onChange={v => onUpdate({ link_bio_bg_overlay_opacity: v })} min={0} max={100} unit="%" />
            </div>
          </div>
        )}

        {/* Blur / Glass */}
        <div>
          <div className="flex items-center justify-between">
            <h4 className={LABEL}>Glass / Blur</h4>
            <button onClick={() => onUpdate({ link_bio_glass_enabled: !data.link_bio_glass_enabled })} className={`relative w-8 h-4.5 rounded-full transition-colors ${data.link_bio_glass_enabled ? "bg-emerald-500" : "bg-neutral-300"}`}>
              <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${data.link_bio_glass_enabled ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
          {data.link_bio_glass_enabled && (
            <SliderRow label="Blur Intensity" value={data.link_bio_glass_intensity ?? 8} onChange={v => onUpdate({ link_bio_glass_intensity: v })} min={0} max={20} />
          )}
        </div>
      </Section>

      {/* Buttons */}
      <Section id="buttons" title="Buttons">
        <div>
          <h4 className={SECTION_LABEL}>Shape</h4>
          <OptionButtons value={data.link_bio_button_shape || "rounded"} options={BUTTON_SHAPES} onChange={v => onUpdate({ link_bio_button_shape: v })} />
        </div>
        <ColorPickerRow label="Fill Color" value={data.link_bio_button_fill || "#171717"} onChange={v => onUpdate({ link_bio_button_fill: v })} swatches={ACCENT_SWATCHES} />
        <ColorPickerRow label="Text Color" value={data.link_bio_button_text_color || "#ffffff"} onChange={v => onUpdate({ link_bio_button_text_color: v })} />
        <div>
          <div className="flex items-center justify-between">
            <h4 className={LABEL}>Border</h4>
            <button onClick={() => onUpdate({ link_bio_button_border: !data.link_bio_button_border })} className={`relative w-8 h-4.5 rounded-full transition-colors ${data.link_bio_button_border ? "bg-emerald-500" : "bg-neutral-300"}`}>
              <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${data.link_bio_button_border ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
          {data.link_bio_button_border && (
            <div className="space-y-2 mt-2">
              <SliderRow label="Width" value={data.link_bio_button_border_width ?? 1} onChange={v => onUpdate({ link_bio_button_border_width: v })} min={1} max={4} />
              <ColorPickerRow label="Border Color" value={data.link_bio_button_border_color || "#e5e5e5"} onChange={v => onUpdate({ link_bio_button_border_color: v })} />
            </div>
          )}
        </div>
        <div>
          <h4 className={SECTION_LABEL}>Shadow</h4>
          <OptionButtons value={data.link_bio_button_shadow || "none"} options={SHADOW_OPTIONS} onChange={v => onUpdate({ link_bio_button_shadow: v })} />
        </div>
        <div>
          <h4 className={SECTION_LABEL}>Width</h4>
          <OptionButtons value={data.link_bio_button_width || "standard"} options={BUTTON_WIDTH_OPTIONS} onChange={v => onUpdate({ link_bio_button_width: v })} />
        </div>
        <div>
          <h4 className={SECTION_LABEL}>Animation</h4>
          <OptionButtons value={data.link_bio_button_anim || "none"} options={BUTTON_ANIM_OPTIONS} onChange={v => onUpdate({ link_bio_button_anim: v })} />
        </div>
      </Section>

      {/* Spacing */}
      <Section id="spacing" title="Spacing">
        <SliderRow label="Page Padding" value={data.link_bio_page_padding ?? 16} onChange={v => onUpdate({ link_bio_page_padding: v })} min={0} max={48} />
        <SliderRow label="Section Gap" value={data.link_bio_section_gap ?? 16} onChange={v => onUpdate({ link_bio_section_gap: v })} min={0} max={32} />
        <div>
          <h4 className={SECTION_LABEL}>Container Width</h4>
          <OptionButtons value={data.link_bio_container_width || "standard"} options={CONTAINER_OPTIONS} onChange={v => onUpdate({ link_bio_container_width: v })} />
        </div>
      </Section>

      {/* Profile Image */}
      <Section id="profile-image" title="Profile Image">
        <div>
          <h4 className={SECTION_LABEL}>Mode</h4>
          <OptionButtons value={data.link_bio_avatar_mode || "photo"} options={[{ id: "photo", name: "Photo" }, { id: "logo", name: "Logo" }]} onChange={v => onUpdate({ link_bio_avatar_mode: v })} />
        </div>
        <div>
          <h4 className={SECTION_LABEL}>Shape</h4>
          <OptionButtons value={data.link_bio_avatar_shape || "circle"} options={PROFILE_SHAPES} onChange={v => onUpdate({ link_bio_avatar_shape: v })} />
        </div>
        <SliderRow label="Size" value={data.link_bio_avatar_size ?? 96} onChange={v => onUpdate({ link_bio_avatar_size: v })} min={48} max={200} />
        <SliderRow label="Border Width" value={data.link_bio_avatar_border_width ?? 0} onChange={v => onUpdate({ link_bio_avatar_border_width: v })} min={0} max={8} />
        {(data.link_bio_avatar_border_width ?? 0) > 0 && (
          <ColorPickerRow label="Border Color" value={data.link_bio_avatar_border_color || "#e5e5e5"} onChange={v => onUpdate({ link_bio_avatar_border_color: v })} />
        )}
        <div>
          <h4 className={SECTION_LABEL}>Shadow</h4>
          <OptionButtons value={data.link_bio_avatar_shadow || "none"} options={[{ id: "none", name: "None" }, { id: "soft", name: "Soft" }, { id: "medium", name: "Medium" }, { id: "dramatic", name: "Dramatic" }]} onChange={v => onUpdate({ link_bio_avatar_shadow: v })} />
        </div>
      </Section>

      {/* Animation */}
      <Section id="animation" title="Animation">
        <div>
          <h4 className={SECTION_LABEL}>Intro Animation</h4>
          <p className="text-[10px] text-neutral-400 mb-2">Plays when someone visits your page</p>
          <div className="space-y-1.5 mb-3">
            {[
              { id: "none", name: "None" },
              { id: "fade-up", name: "Fade Up" },
              { id: "scale-in", name: "Scale In" },
            ].map(a => (
              <button key={a.id} onClick={() => onUpdate({ link_bio_intro_anim: a.id })}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${data.link_bio_intro_anim === a.id ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200/60"}`}>
                <span>{a.name}</span>
                <span className="text-[9px] text-emerald-500 font-semibold">FREE</span>
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            {PREMIUM_ANIMS.map(a => {
              const owned = ownedAnimations.includes(a.id);
              return (
                <div key={a.id}>
                  {owned ? (
                    <button onClick={() => onUpdate({ link_bio_intro_anim: a.id })}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${data.link_bio_intro_anim === a.id ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200/60"}`}>
                      <span>{a.name}</span>
                      <span className="text-[9px] text-emerald-500 font-semibold">OWNED</span>
                    </button>
                  ) : (
                    <a href="/animations" className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium bg-neutral-50 text-neutral-400 border border-neutral-200/60 hover:border-neutral-300 transition-all">
                      <span>{a.name}</span>
                      <span className="text-[9px] font-bold text-amber-500">$4.99</span>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <h4 className={SECTION_LABEL}>Hover Effect</h4>
          <OptionButtons value={data.link_bio_hover_effect || "none"} options={HOVER_OPTIONS} onChange={v => onUpdate({ link_bio_hover_effect: v })} />
        </div>
        <div>
          <h4 className={SECTION_LABEL}>Animation Speed</h4>
          <OptionButtons value={data.link_bio_anim_speed || "normal"} options={ANIM_SPEED_OPTIONS} onChange={v => onUpdate({ link_bio_anim_speed: v })} />
        </div>
      </Section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   DESIGN PANEL — QUICK (Simplified)
   ══════════════════════════════════════════════════════ */
function DesignPanelQuick({ data, onUpdate, onRefreshPreview }: {
  data: Record<string, any>;
  onUpdate: (fields: Record<string, any>) => void;
  onRefreshPreview: () => void;
}) {
  return (
    <div className="space-y-5">
      <AIDesignSection onDesignApplied={onRefreshPreview} />

      <div>
        <h3 className={SECTION_LABEL}>Template</h3>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 max-h-[280px] overflow-y-auto pr-1">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => onUpdate({ link_bio_template: t.id })} className={`py-2 text-[10px] font-medium rounded-lg transition-all ${data.link_bio_template === t.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{t.name}</button>
          ))}
        </div>
      </div>

      <ColorPickerRow label="Accent Color" value={data.link_bio_accent || "#171717"} onChange={v => onUpdate({ link_bio_accent: v })} swatches={ACCENT_SWATCHES} />

      <div>
        <h3 className={SECTION_LABEL}>Font</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {FONTS.map(f => (
            <button key={f.id} onClick={() => onUpdate({ link_bio_font: f.id })} className={`py-2 text-[10px] font-medium rounded-lg transition-all ${data.link_bio_font === f.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{f.name}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   BLOCKS PANEL
   ══════════════════════════════════════════════════════ */
function BlocksPanel({ blocks, onBlocksChange }: { blocks: Block[]; onBlocksChange: (blocks: Block[]) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  function addBlock(type: string) {
    const id = type + "-" + Date.now();
    const newBlock: Block = { id, type, config: {}, visible: true, order: blocks.length };
    onBlocksChange([...blocks, newBlock]);
    setShowAdd(false);
  }

  function removeBlock(id: string) {
    onBlocksChange(blocks.filter(b => b.id !== id));
  }

  function duplicateBlock(id: string) {
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    const dup: Block = { ...block, id: block.type + "-" + Date.now(), order: blocks.length };
    onBlocksChange([...blocks, dup]);
  }

  function toggleVisibility(id: string) {
    onBlocksChange(blocks.map(b => b.id === id ? { ...b, visible: !b.visible } : b));
  }

  function moveBlock(from: number, to: number) {
    const next = [...blocks];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onBlocksChange(next.map((b, i) => ({ ...b, order: i })));
  }

  function updateBlockConfig(id: string, config: Record<string, any>) {
    onBlocksChange(blocks.map(b => b.id === id ? { ...b, config: { ...b.config, ...config } } : b));
  }

  const blockName = (type: string) => BLOCK_TYPES.find(bt => bt.type === type)?.name || type;

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-neutral-400">Manage content blocks on your page. Drag to reorder.</p>

      {blocks.map((block, i) => (
        <div key={block.id} draggable onDragStart={() => setDragIdx(i)} onDragOver={e => e.preventDefault()} onDrop={() => { if (dragIdx !== null && dragIdx !== i) moveBlock(dragIdx, i); setDragIdx(null); }}
          className="border border-neutral-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-neutral-300 cursor-grab shrink-0"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
            <button onClick={() => setEditingBlock(editingBlock === block.id ? null : block.id)} className="flex-1 text-left text-xs font-medium text-neutral-700">{blockName(block.type)}</button>
            <div className="flex items-center gap-1">
              {i > 0 && <button onClick={() => moveBlock(i, i - 1)} className="p-1 text-neutral-400 hover:text-neutral-600"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" strokeLinecap="round"/></svg></button>}
              {i < blocks.length - 1 && <button onClick={() => moveBlock(i, i + 1)} className="p-1 text-neutral-400 hover:text-neutral-600"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round"/></svg></button>}
              <button onClick={() => duplicateBlock(block.id)} className="p-1 text-neutral-400 hover:text-neutral-600" title="Duplicate"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></button>
              <button onClick={() => toggleVisibility(block.id)} className={`p-1 transition-colors ${block.visible ? "text-emerald-500" : "text-neutral-300"}`} title={block.visible ? "Hide" : "Show"}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button onClick={() => removeBlock(block.id)} className="p-1 text-neutral-400 hover:text-red-500" title="Delete"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg></button>
            </div>
          </div>

          {/* Inline config */}
          {editingBlock === block.id && (
            <div className="px-3 py-2.5 border-t border-neutral-200 space-y-2">
              {block.type === "video" && (
                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase">Video URL</label>
                  <input value={block.config.url || ""} onChange={e => updateBlockConfig(block.id, { url: e.target.value })} placeholder="https://youtube.com/..." className="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-xs mt-1" />
                </div>
              )}
              {block.type === "testimonial" && (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-500 uppercase">Quote</label>
                    <textarea value={block.config.text || ""} onChange={e => updateBlockConfig(block.id, { text: e.target.value })} rows={2} className="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-xs mt-1 resize-y" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-500 uppercase">Author</label>
                    <input value={block.config.author || ""} onChange={e => updateBlockConfig(block.id, { author: e.target.value })} className="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-xs mt-1" />
                  </div>
                </>
              )}
              {block.type === "contact" && (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-500 uppercase">Email</label>
                    <input value={block.config.email || ""} onChange={e => updateBlockConfig(block.id, { email: e.target.value })} className="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-xs mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-500 uppercase">Phone</label>
                    <input value={block.config.phone || ""} onChange={e => updateBlockConfig(block.id, { phone: e.target.value })} className="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-xs mt-1" />
                  </div>
                </>
              )}
              {block.type === "product" && (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-500 uppercase">Title</label>
                    <input value={block.config.title || ""} onChange={e => updateBlockConfig(block.id, { title: e.target.value })} className="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-xs mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-500 uppercase">Price</label>
                    <input value={block.config.price || ""} onChange={e => updateBlockConfig(block.id, { price: e.target.value })} placeholder="$29.99" className="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-xs mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-500 uppercase">URL</label>
                    <input value={block.config.url || ""} onChange={e => updateBlockConfig(block.id, { url: e.target.value })} className="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-xs mt-1" />
                  </div>
                </>
              )}
              {block.type === "text" && (
                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase">Content</label>
                  <textarea value={block.config.content || ""} onChange={e => updateBlockConfig(block.id, { content: e.target.value })} rows={3} className="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-xs mt-1 resize-y" />
                </div>
              )}
              {["hero", "cta", "links", "socials", "gallery", "booking", "divider"].includes(block.type) && (
                <p className="text-[10px] text-neutral-400">This block uses your profile data automatically.</p>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add Block */}
      {showAdd ? (
        <div className="border border-neutral-200 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-neutral-700">Add Block</h4>
            <button onClick={() => setShowAdd(false)} className="text-neutral-400 hover:text-neutral-600"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg></button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {BLOCK_TYPES.map(bt => (
              <button key={bt.type} onClick={() => addBlock(bt.type)} className="text-left px-2.5 py-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 transition-colors">
                <div className="text-[10px] font-semibold text-neutral-700">{bt.name}</div>
                <div className="text-[9px] text-neutral-400">{bt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="w-full py-2.5 text-xs font-semibold text-neutral-500 bg-neutral-50 border border-dashed border-neutral-300 rounded-xl hover:bg-neutral-100 hover:border-neutral-400 transition-colors">
          + Add Block
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTIONS PANEL
   ══════════════════════════════════════════════════════ */
function SectionsPanel({ sections, onToggle, onReorder }: {
  sections: { id: string; label: string; enabled: boolean }[];
  onToggle: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-neutral-400 mb-3">Toggle sections on/off. Drag to reorder.</p>
      {sections.map((s, i) => (
        <div key={s.id} draggable onDragStart={() => setDragIdx(i)} onDragOver={e => e.preventDefault()} onDrop={() => { if (dragIdx !== null && dragIdx !== i) onReorder(dragIdx, i); setDragIdx(null); }}
          className="flex items-center gap-3 bg-neutral-50 rounded-xl px-3 py-2.5 border border-neutral-200">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-neutral-300 cursor-grab"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
          <span className="flex-1 text-xs font-medium text-neutral-700">{s.label}</span>
          <button onClick={() => onToggle(s.id)} className={`relative w-8 h-4.5 rounded-full transition-colors ${s.enabled ? "bg-emerald-500" : "bg-neutral-300"}`}>
            <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${s.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN WYSIWYG EDITOR
   ══════════════════════════════════════════════════════ */
export function WysiwygEditor({ initialData, slug }: { initialData: EditorData; slug: string }) {
  const { status, errorMsg, save, saveNow } = useAutosave();
  const [data, setData] = useState(initialData.user);
  const [panel, setPanel] = useState<string>("design");
  const [ownedAnimations, setOwnedAnimations] = useState<string[]>([]);
  const [editorMode, setEditorMode] = useState<"quick" | "advanced">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("wysiwyg_mode") as "quick" | "advanced") || "quick";
    }
    return "quick";
  });
  const [blocks, setBlocks] = useState<Block[]>(() => {
    try {
      const saved = initialData.user.link_bio_blocks;
      if (saved) return typeof saved === "string" ? JSON.parse(saved) : saved;
    } catch {}
    return DEFAULT_BLOCKS;
  });
  const [sections, setSections] = useState([
    { id: "profile", label: "Profile", enabled: true },
    { id: "socials", label: "Social Links", enabled: true },
    { id: "bio", label: "Bio", enabled: true },
    { id: "links", label: "Links", enabled: true },
    { id: "services", label: "Services", enabled: initialData.services.length > 0 },
    { id: "calendar", label: "Calendar", enabled: !!initialData.user.calendar_enabled },
  ]);

  // Fetch owned animations
  useEffect(() => {
    fetch("/api/animations/owned").then(r => r.json()).then(d => {
      if (d.animations) setOwnedAnimations(d.animations);
    }).catch(() => {});
  }, []);

  // Persist editor mode
  function toggleEditorMode() {
    const next = editorMode === "quick" ? "advanced" : "quick";
    setEditorMode(next);
    localStorage.setItem("wysiwyg_mode", next);
  }

  // Update field + autosave
  function updateField(fields: Record<string, any>) {
    setData((prev: any) => ({ ...prev, ...fields }));
    save(fields);
  }

  // Update text fields (from inline editing)
  function updateText(field: string, value: string) {
    setData((prev: any) => ({ ...prev, [field]: value }));
    save({ [field]: value });
  }

  // Update blocks + autosave
  function handleBlocksChange(newBlocks: Block[]) {
    setBlocks(newBlocks);
    save({ link_bio_blocks: JSON.stringify(newBlocks) });
  }

  function toggleSection(id: string) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  }

  function reorderSections(from: number, to: number) {
    setSections(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  // Refresh iframe after save
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current === "saving" && status === "saved" && iframeRef.current) {
      iframeRef.current.src = `/u/${slug}?t=${Date.now()}&preview=true`;
    }
    prevStatus.current = status;
  }, [status, slug]);

  function refreshPreview() {
    if (iframeRef.current) iframeRef.current.src = `/u/${slug}?t=${Date.now()}&preview=true`;
  }

  // Panel tabs depend on mode
  const panelTabs = editorMode === "quick"
    ? [{ id: "design", label: "Design" }, { id: "links", label: "Links" }, { id: "profile", label: "Profile" }]
    : [{ id: "design", label: "Design" }, { id: "links", label: "Links" }, { id: "blocks", label: "Blocks" }, { id: "profile", label: "Profile" }];

  return (
    <div className="min-h-screen bg-[#f8f8fa]">
      <EditorToolbar status={status} errorMsg={errorMsg} slug={slug} onSave={saveNow} />

      <div className="flex flex-col md:flex-row pt-14 min-h-screen">
        {/* ═══ LEFT SIDEBAR — Controls ═══ */}
        <div className="w-full md:w-80 shrink-0 bg-white md:border-r border-neutral-200 overflow-y-auto pb-20 md:pb-0 md:sticky md:top-[56px] md:max-h-[calc(100vh-56px)]">
          <div className="p-4 md:p-5">
            {/* Quick / Advanced toggle */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{editorMode === "quick" ? "Quick Edit" : "Advanced Edit"}</span>
              <button onClick={toggleEditorMode} className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                {editorMode === "quick" ? "Advanced" : "Quick"} Mode
              </button>
            </div>

            {/* Panel selector tabs */}
            <div className="flex gap-1 mb-4 md:mb-5 bg-neutral-100 rounded-xl p-1 overflow-x-auto">
              {panelTabs.map(p => (
                <button key={p.id} onClick={() => setPanel(p.id)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${panel === p.id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>
                  {p.label}
                </button>
              ))}
            </div>

            {/* Panel content */}
            {panel === "design" && editorMode === "quick" && <DesignPanelQuick data={data} onUpdate={updateField} onRefreshPreview={refreshPreview} />}
            {panel === "design" && editorMode === "advanced" && <DesignPanelFull data={data} onUpdate={updateField} ownedAnimations={ownedAnimations} onRefreshPreview={refreshPreview} />}
            {panel === "links" && <LinkManager />}
            {panel === "blocks" && <BlocksPanel blocks={blocks} onBlocksChange={handleBlocksChange} />}
            {panel === "profile" && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Profile Info</h3>
                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Name</label>
                  <input value={data.full_name || ""} onChange={e => updateText("full_name", e.target.value)} placeholder="Your Name" className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 bg-white mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Headline</label>
                  <input value={data.headline || ""} onChange={e => updateText("headline", e.target.value)} placeholder="UGC Creator & Photographer" className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 bg-white mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Bio</label>
                  <textarea value={data.bio || ""} onChange={e => updateText("bio", e.target.value)} placeholder="Tell people about yourself..." rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 bg-white mt-1 resize-y" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Location</label>
                  <input value={data.location || ""} onChange={e => updateText("location", e.target.value)} placeholder="Sydney, AU" className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 bg-white mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Avatar</label>
                  <label className="flex items-center justify-center gap-2 py-2.5 mt-1 rounded-xl border-2 border-dashed border-neutral-200 cursor-pointer text-xs font-medium text-neutral-500 hover:border-neutral-400 transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={async e => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const fd = new FormData(); fd.append("file", file); fd.append("type", "avatar");
                      const res = await fetch("/api/upload", { method: "POST", body: fd });
                      if (res.ok) { const d = await res.json(); if (d.url) { setData((prev: any) => ({ ...prev, avatar_url: d.url })); saveNow(); } }
                    }} />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Upload Photo
                  </label>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Cover Image</label>
                  <label className="flex items-center justify-center gap-2 py-2.5 mt-1 rounded-xl border-2 border-dashed border-neutral-200 cursor-pointer text-xs font-medium text-neutral-500 hover:border-neutral-400 transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={async e => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const fd = new FormData(); fd.append("file", file); fd.append("type", "cover");
                      const res = await fetch("/api/upload", { method: "POST", body: fd });
                      if (res.ok) { const d = await res.json(); if (d.url) { setData((prev: any) => ({ ...prev, cover_url: d.url })); saveNow(); } }
                    }} />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Upload Cover
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT — Live Preview (iframe, hidden on mobile) ═══ */}
        <div className="hidden md:flex flex-1 items-start justify-center py-8 px-4">
          <div className="w-full max-w-[420px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-900">Live Preview</h3>
              <button onClick={refreshPreview} className="text-[11px] text-neutral-400 hover:text-neutral-600 font-medium flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Refresh
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-200">
              <iframe
                ref={iframeRef}
                src={`/u/${slug}?t=${Date.now()}&preview=true`}
                className="w-full border-0"
                style={{ height: "calc(100vh - 160px)", minHeight: "600px" }}
                title="Live Preview"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE BOTTOM BAR ═══ */}
      <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-t border-neutral-200 p-3">
        <a href={`/u/${slug}`} target="_blank" className="flex items-center justify-center gap-2 w-full py-3 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Preview Page
        </a>
      </div>
    </div>
  );
}
