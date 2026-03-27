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

function ColorPicker({ label, value, onChange, swatches }: { label: string; value: string; onChange: (v: string) => void; swatches?: string[] }) {
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

function OptionGrid({ value, options, onChange, cols = 4 }: { value: string; options: { id: string; name: string }[]; onChange: (v: string) => void; cols?: number }) {
  return (
    <div className={`grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} className={`py-2 text-[10px] font-medium rounded-lg transition-all ${value === o.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{o.name}</button>
      ))}
    </div>
  );
}

function UploadBox({ label, accept, uploadType, onUploaded }: { label: string; accept: string; uploadType: string; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  return (
    <label className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-neutral-200 cursor-pointer text-xs font-medium text-neutral-500 hover:border-neutral-400 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
      <input type="file" accept={accept} className="hidden" onChange={async e => {
        const file = e.target.files?.[0]; if (!file) return;
        setUploading(true);
        try {
          const fd = new FormData(); fd.append("file", file); fd.append("type", uploadType);
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          if (res.ok) { const d = await res.json(); if (d.url) onUploaded(d.url); }
        } finally { setUploading(false); }
      }} />
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {uploading ? "Uploading..." : label}
    </label>
  );
}

/* ══════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════ */
const TEMPLATES = [
  { id: "minimal", name: "Minimal", color: "#f5f5f5" }, { id: "glass", name: "Glass", color: "#e0e7ff" },
  { id: "bold", name: "Bold", color: "#171717" }, { id: "showcase", name: "Showcase", color: "#fef3c7" },
  { id: "neon", name: "Neon", color: "#0f172a" }, { id: "collage", name: "Collage", color: "#fce7f3" },
  { id: "bento", name: "Bento", color: "#ecfccb" }, { id: "split", name: "Split", color: "#e0f2fe" },
  { id: "aurora", name: "Aurora", color: "#1e1b4b" }, { id: "brutalist", name: "Brutalist", color: "#fef08a" },
  { id: "sunset", name: "Sunset", color: "#fed7aa" }, { id: "terminal", name: "Terminal", color: "#022c22" },
  { id: "pastel", name: "Pastel", color: "#fae8ff" }, { id: "magazine", name: "Magazine", color: "#f1f5f9" },
  { id: "retro", name: "Retro", color: "#fef9c3" }, { id: "midnight", name: "Midnight", color: "#0f172a" },
  { id: "clay", name: "Clay", color: "#fde68a" }, { id: "gradient-mesh", name: "Gradient Mesh", color: "#c4b5fd" },
  { id: "trader", name: "Trader", color: "#064e3b" }, { id: "educator", name: "Educator", color: "#dbeafe" },
  { id: "developer", name: "Developer", color: "#1e293b" }, { id: "executive", name: "Executive", color: "#f8fafc" },
  { id: "automotive", name: "Automotive", color: "linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%)" },
];

const GRADIENT_PRESETS = [
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
  { label: "Aurora", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
];

const FONTS = [
  { id: "inter", name: "Inter" }, { id: "outfit", name: "Outfit" },
  { id: "jakarta", name: "Jakarta" }, { id: "poppins", name: "Poppins" },
  { id: "space-grotesk", name: "Space Grotesk" }, { id: "sora", name: "Sora" },
  { id: "manrope", name: "Manrope" }, { id: "dm-sans", name: "DM Sans" },
];

const ACCENT_SWATCHES = ["#6366f1", "#22d3ee", "#ef4444", "#f97316", "#22c55e", "#a855f7", "#ec4899", "#eab308"];
const BG_SWATCHES = ["#ffffff", "#f5f5f5", "#171717", "#0a0a0a", "#1e1b4b", "#0c4a6e", "#14532d", "#7c2d12"];

/* ══════════════════════════════════════════════════════
   TAB DEFINITIONS
   ══════════════════════════════════════════════════════ */
type TabId = "ai-design" | "header" | "theme" | "wallpaper" | "text" | "buttons" | "colors" | "footer" | "links" | "portfolio" | "mods" | "profile";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "ai-design", label: "AI Design", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" },
  { id: "header", label: "Header", icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" },
  { id: "theme", label: "Theme", icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" },
  { id: "wallpaper", label: "Wallpaper", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { id: "text", label: "Text", icon: "M4 6h16M4 12h8m-8 6h16" },
  { id: "buttons", label: "Buttons", icon: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" },
  { id: "colors", label: "Colors", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485" },
  { id: "footer", label: "Footer", icon: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2zM3 17h18" },
  { id: "links", label: "Links", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
  { id: "portfolio", label: "Portfolio", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { id: "mods", label: "Mods", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

/* ══════════════════════════════════════════════════════
   SECTION: HEADER
   ══════════════════════════════════════════════════════ */
function HeaderSection({ data, onUpdate, onSaveNow }: { data: Record<string, any>; onUpdate: (f: Record<string, any>) => void; onSaveNow: () => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className={SECTION_LABEL}>Profile Image</h4>
        <UploadBox label="Upload Photo" accept="image/*" uploadType="avatar" onUploaded={url => { onUpdate({ avatar_url: url }); onSaveNow(); }} />
        {data.avatar_url && <div className="mt-2 flex items-center gap-2"><img src={data.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="" /><span className="text-[10px] text-neutral-400">Current photo</span></div>}
      </div>

      <div>
        <h4 className={SECTION_LABEL}>Logo</h4>
        <UploadBox label="Upload Logo" accept="image/*" uploadType="logo" onUploaded={url => { onUpdate({ logo_url: url }); onSaveNow(); }} />
        {data.logo_url && <div className="mt-2 flex items-center gap-2"><img src={data.logo_url} className="h-8 object-contain" alt="" /><span className="text-[10px] text-neutral-400">Current logo</span></div>}
      </div>

      <div>
        <h4 className={SECTION_LABEL}>Display Mode</h4>
        <OptionGrid value={data.link_bio_avatar_mode || "photo"} options={[{ id: "photo", name: "Profile Photo" }, { id: "logo", name: "Logo" }]} onChange={v => onUpdate({ link_bio_avatar_mode: v })} cols={2} />
      </div>

      <div>
        <h4 className={SECTION_LABEL}>Image Shape</h4>
        <OptionGrid value={data.link_bio_avatar_shape || "circle"} options={[{ id: "circle", name: "Circle" }, { id: "rounded", name: "Rounded" }, { id: "square", name: "Square" }]} onChange={v => onUpdate({ link_bio_avatar_shape: v })} cols={3} />
      </div>

      <div>
        <h4 className={SECTION_LABEL}>Image Size</h4>
        <OptionGrid value={data.link_bio_avatar_size || "medium"} options={[{ id: "small", name: "Small" }, { id: "medium", name: "Medium" }, { id: "large", name: "Large" }]} onChange={v => onUpdate({ link_bio_avatar_size: v })} cols={3} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION: THEME
   ══════════════════════════════════════════════════════ */
function ThemeSection({ data, onUpdate }: { data: Record<string, any>; onUpdate: (f: Record<string, any>) => void }) {
  const current = data.link_bio_template || "minimal";
  return (
    <div className="space-y-3">
      <h4 className={SECTION_LABEL}>Choose Template</h4>
      <div className="grid grid-cols-3 gap-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
        {TEMPLATES.map(t => (
          <button key={t.id} onClick={() => onUpdate({ link_bio_template: t.id })}
            className={`relative rounded-xl overflow-hidden border-2 transition-all ${current === t.id ? "border-neutral-900 ring-2 ring-neutral-900/20" : "border-neutral-200 hover:border-neutral-400"}`}>
            <div className="h-14 w-full" style={{ background: t.color }} />
            <div className="px-1.5 py-1.5 bg-white">
              <span className="text-[9px] font-semibold text-neutral-700 leading-none">{t.name}</span>
            </div>
            {current === t.id && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-neutral-900 rounded-full flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION: WALLPAPER (Background)
   ══════════════════════════════════════════════════════ */
function WallpaperSection({ data, onUpdate, onSaveNow }: { data: Record<string, any>; onUpdate: (f: Record<string, any>) => void; onSaveNow: () => void }) {
  const [bgTab, setBgTab] = useState<string>(data.link_bio_bg_type || "solid");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
        {["solid", "gradient", "image", "video"].map(t => (
          <button key={t} onClick={() => { setBgTab(t); onUpdate({ link_bio_bg_type: t }); }} className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all capitalize ${bgTab === t ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}>{t}</button>
        ))}
      </div>

      {bgTab === "solid" && (
        <div className="space-y-3">
          <ColorPicker label="Background Color" value={data.link_bio_bg_value || "#ffffff"} onChange={v => onUpdate({ link_bio_bg_value: v })} swatches={BG_SWATCHES} />
        </div>
      )}

      {bgTab === "gradient" && (
        <div className="space-y-3">
          <div>
            <h4 className={SECTION_LABEL}>Presets</h4>
            <div className="grid grid-cols-3 gap-1.5">
              {GRADIENT_PRESETS.map(g => (
                <button key={g.label} onClick={() => onUpdate({ link_bio_bg_value: g.value })}
                  className={`h-10 rounded-lg border-2 transition-all text-[8px] font-medium text-white/80 flex items-end justify-center pb-0.5 ${data.link_bio_bg_value === g.value ? "border-neutral-900 ring-1 ring-neutral-900/20" : "border-transparent hover:border-neutral-400"}`}
                  style={{ background: g.value }}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className={SECTION_LABEL}>Custom Gradient</h4>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[9px] text-neutral-400 mb-1 block">Color 1</label>
                <input type="color" value={data.link_bio_gradient_color1 || "#6366f1"} onChange={e => {
                  const dir = data.link_bio_gradient_direction || "135deg";
                  const c2 = data.link_bio_gradient_color2 || "#a855f7";
                  onUpdate({ link_bio_gradient_color1: e.target.value, link_bio_bg_value: `linear-gradient(${dir}, ${e.target.value} 0%, ${c2} 100%)` });
                }} className="w-full h-8 rounded-lg border border-neutral-200 cursor-pointer" />
              </div>
              <div className="flex-1">
                <label className="text-[9px] text-neutral-400 mb-1 block">Color 2</label>
                <input type="color" value={data.link_bio_gradient_color2 || "#a855f7"} onChange={e => {
                  const dir = data.link_bio_gradient_direction || "135deg";
                  const c1 = data.link_bio_gradient_color1 || "#6366f1";
                  onUpdate({ link_bio_gradient_color2: e.target.value, link_bio_bg_value: `linear-gradient(${dir}, ${c1} 0%, ${e.target.value} 100%)` });
                }} className="w-full h-8 rounded-lg border border-neutral-200 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      )}

      {bgTab === "image" && (
        <div className="space-y-3">
          <UploadBox label="Upload Background" accept="image/*" uploadType="background" onUploaded={url => { onUpdate({ link_bio_bg_value: url }); onSaveNow(); }} />
          {data.link_bio_bg_value && data.link_bio_bg_type === "image" && (
            <div className="h-20 rounded-lg bg-cover bg-center border border-neutral-200" style={{ backgroundImage: `url(${data.link_bio_bg_value})` }} />
          )}
        </div>
      )}

      {bgTab === "video" && (
        <div>
          <h4 className={SECTION_LABEL}>Video URL</h4>
          <input value={data.link_bio_bg_video || ""} onChange={e => onUpdate({ link_bio_bg_video: e.target.value })} placeholder="https://..." className="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/10" />
        </div>
      )}

      {(bgTab === "image" || bgTab === "video") && (
        <div className="space-y-3 pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <h4 className={LABEL}>Overlay</h4>
            <OptionGrid value={data.link_bio_bg_overlay || "dark"} options={[{ id: "dark", name: "Dark" }, { id: "light", name: "Light" }]} onChange={v => onUpdate({ link_bio_bg_overlay: v })} cols={2} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className={LABEL}>Opacity</h4>
              <span className="text-[10px] text-neutral-400">{data.link_bio_bg_overlay_opacity ?? 40}%</span>
            </div>
            <input type="range" min={0} max={100} value={data.link_bio_bg_overlay_opacity ?? 40} onChange={e => onUpdate({ link_bio_bg_overlay_opacity: Number(e.target.value) })} className="w-full h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-neutral-900" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION: TEXT
   ══════════════════════════════════════════════════════ */
function TextSection({ data, onUpdate }: { data: Record<string, any>; onUpdate: (f: Record<string, any>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className={SECTION_LABEL}>Page Font</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {FONTS.map(f => (
            <button key={f.id} onClick={() => onUpdate({ link_bio_font: f.id })} className={`py-2.5 text-[10px] font-medium rounded-lg transition-all ${data.link_bio_font === f.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{f.name}</button>
          ))}
        </div>
      </div>

      <ColorPicker label="Page Text Color" value={data.link_bio_text_color || ""} onChange={v => onUpdate({ link_bio_text_color: v })} swatches={["#ffffff", "#e5e5e5", "#404040", "#000000", "#6366f1", "#ec4899"]} />

      <div>
        <h4 className={SECTION_LABEL}>Font Size</h4>
        <OptionGrid value={data.link_bio_font_size || "medium"} options={[{ id: "small", name: "Small" }, { id: "medium", name: "Medium" }, { id: "large", name: "Large" }, { id: "xl", name: "XL" }]} onChange={v => onUpdate({ link_bio_font_size: v })} cols={4} />
      </div>

      <div>
        <h4 className={SECTION_LABEL}>Font Weight</h4>
        <OptionGrid value={String(data.link_bio_font_weight || 400)} options={[{ id: "300", name: "Light" }, { id: "400", name: "Regular" }, { id: "500", name: "Medium" }, { id: "600", name: "Semi" }, { id: "700", name: "Bold" }]} onChange={v => onUpdate({ link_bio_font_weight: Number(v) })} cols={3} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION: BUTTONS
   ══════════════════════════════════════════════════════ */
function ButtonsSection({ data, onUpdate }: { data: Record<string, any>; onUpdate: (f: Record<string, any>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className={SECTION_LABEL}>Style</h4>
        <OptionGrid value={data.link_bio_button_style || "solid"} options={[{ id: "solid", name: "Solid" }, { id: "outline", name: "Outline" }, { id: "glass", name: "Glass" }]} onChange={v => onUpdate({ link_bio_button_style: v })} cols={3} />
      </div>

      <div>
        <h4 className={SECTION_LABEL}>Shape</h4>
        <OptionGrid value={data.link_bio_button_shape || "rounded"} options={[{ id: "rounded", name: "Rounded" }, { id: "pill", name: "Pill" }, { id: "square", name: "Square" }, { id: "soft", name: "Soft" }]} onChange={v => onUpdate({ link_bio_button_shape: v })} cols={4} />
      </div>

      <ColorPicker label="Button Color" value={data.link_bio_button_fill || "#171717"} onChange={v => onUpdate({ link_bio_button_fill: v })} swatches={ACCENT_SWATCHES} />
      <ColorPicker label="Button Text Color" value={data.link_bio_button_text_color || "#ffffff"} onChange={v => onUpdate({ link_bio_button_text_color: v })} swatches={["#ffffff", "#000000", "#171717", "#f5f5f5"]} />

      <div>
        <h4 className={SECTION_LABEL}>Shadow</h4>
        <OptionGrid value={data.link_bio_button_shadow || "none"} options={[{ id: "none", name: "None" }, { id: "subtle", name: "Subtle" }, { id: "medium", name: "Medium" }, { id: "lifted", name: "Lifted" }]} onChange={v => onUpdate({ link_bio_button_shadow: v })} cols={4} />
      </div>

      <div>
        <h4 className={SECTION_LABEL}>Animation</h4>
        <OptionGrid value={data.link_bio_button_anim || "none"} options={[{ id: "none", name: "None" }, { id: "bounce", name: "Bounce" }, { id: "pulse", name: "Pulse" }, { id: "scale", name: "Scale" }, { id: "glow", name: "Glow" }]} onChange={v => onUpdate({ link_bio_button_anim: v })} cols={3} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION: COLORS (centralized shortcut)
   ══════════════════════════════════════════════════════ */
function ColorsSection({ data, onUpdate }: { data: Record<string, any>; onUpdate: (f: Record<string, any>) => void }) {
  return (
    <div className="space-y-5">
      <p className="text-[10px] text-neutral-400">Quick access to all color settings in one place.</p>
      <ColorPicker label="Accent Color" value={data.link_bio_accent || "#171717"} onChange={v => onUpdate({ link_bio_accent: v })} swatches={ACCENT_SWATCHES} />
      <ColorPicker label="Page Text Color" value={data.link_bio_text_color || ""} onChange={v => onUpdate({ link_bio_text_color: v })} swatches={["#ffffff", "#e5e5e5", "#404040", "#000000", "#6366f1", "#ec4899"]} />
      <ColorPicker label="Button Color" value={data.link_bio_button_fill || "#171717"} onChange={v => onUpdate({ link_bio_button_fill: v })} swatches={ACCENT_SWATCHES} />
      <ColorPicker label="Button Text Color" value={data.link_bio_button_text_color || "#ffffff"} onChange={v => onUpdate({ link_bio_button_text_color: v })} swatches={["#ffffff", "#000000", "#171717", "#f5f5f5"]} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION: FOOTER
   ══════════════════════════════════════════════════════ */
function FooterSection({ data, onUpdate }: { data: Record<string, any>; onUpdate: (f: Record<string, any>) => void }) {
  const hidden = !!data.hide_branding;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-200">
        <div>
          <h4 className="text-xs font-semibold text-neutral-700">Show HireACreator Branding</h4>
          <p className="text-[10px] text-neutral-400 mt-0.5">Display &quot;Powered by HireACreator&quot; in your page footer</p>
        </div>
        <button onClick={() => onUpdate({ hide_branding: !hidden })} className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${!hidden ? "bg-emerald-500" : "bg-neutral-300"}`}>
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${!hidden ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION: PROFILE
   ══════════════════════════════════════════════════════ */
function ProfileSection({ data, onUpdate }: { data: Record<string, any>; onUpdate: (f: Record<string, any>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Name</label>
        <input value={data.full_name || ""} onChange={e => onUpdate({ full_name: e.target.value })} placeholder="Your Name" className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 bg-white mt-1" />
      </div>
      <div>
        <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Headline</label>
        <input value={data.headline || ""} onChange={e => onUpdate({ headline: e.target.value })} placeholder="UGC Creator & Photographer" className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 bg-white mt-1" />
      </div>
      <div>
        <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Bio</label>
        <textarea value={data.bio || ""} onChange={e => onUpdate({ bio: e.target.value })} placeholder="Tell people about yourself..." rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 bg-white mt-1 resize-y" />
      </div>
      <div>
        <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Location</label>
        <input value={data.location || ""} onChange={e => onUpdate({ location: e.target.value })} placeholder="Sydney, AU" className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 bg-white mt-1" />
      </div>
      <div className="pt-2 border-t border-neutral-100">
        <p className="text-[9px] text-neutral-400 mb-3">Optional — shown on your link-in-bio page if filled in</p>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Contact Email</label>
            <input value={data.contact_email || ""} onChange={e => onUpdate({ contact_email: e.target.value })} placeholder="you@email.com" type="email" className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 bg-white mt-1" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Phone Number</label>
            <input value={data.contact_phone || ""} onChange={e => onUpdate({ contact_phone: e.target.value })} placeholder="+61 400 000 000" type="tel" className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 bg-white mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION: AI DESIGN
   ══════════════════════════════════════════════════════ */
function AIDesignSection({ data, onUpdate, onSaveNow, refreshPreview }: {
  data: Record<string, any>;
  onUpdate: (f: Record<string, any>) => void;
  onSaveNow: () => void;
  refreshPreview: () => void;
}) {
  const [urls, setUrls] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandDesc, setBrandDesc] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [variations, setVariations] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState<string | null>(null);

  async function handleGenerate() {
    const urlList = urls.split(/[,\n]/).map(u => u.trim()).filter(u => u.startsWith("http"));
    if (urlList.length === 0) { setError("Enter at least 1 URL"); return; }
    if (urlList.length > 5) { setError("Maximum 5 URLs"); return; }

    setLoading(true);
    setError("");
    setVariations([]);
    setApplied(null);

    try {
      // Step 1: Analyze
      setStep("Analyzing reference sites...");
      const analyzeRes = await fetch("/api/ai-designer/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceUrls: urlList,
          brandName: brandName || undefined,
          brandDescription: brandDesc || undefined,
          audience: audience || undefined,
          goal: goal || undefined,
        }),
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json().catch(() => ({}));
        throw new Error(err.error || "Analysis failed");
      }

      const { brandDna } = await analyzeRes.json();

      // Step 2: Generate
      setStep("Generating design variations...");
      const generateRes = await fetch("/api/ai-designer/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandDna,
          mode: "hireacreator",
          variationCount: 3,
        }),
      });

      if (!generateRes.ok) {
        const err = await generateRes.json().catch(() => ({}));
        throw new Error(err.error || "Generation failed");
      }

      const result = await generateRes.json();
      setVariations(result.variations);
      setStep("");
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      setStep("");
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(pageSpec: any) {
    setLoading(true);
    setStep("Applying design...");
    try {
      const res = await fetch("/api/ai-designer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageSpec }),
      });
      if (!res.ok) throw new Error("Apply failed");
      setApplied(pageSpec.pageId);
      // Force a full data refresh by updating local state with the design tokens
      const t = pageSpec.designTokens;
      onUpdate({
        link_bio_template: t.layout.template,
        link_bio_font: t.typography.family,
        link_bio_text_color: t.colors.textPrimary,
        link_bio_accent: t.colors.accent,
        link_bio_bg_type: t.background.type,
        link_bio_bg_value: t.background.value,
        link_bio_button_shape: t.components.button.shape,
        link_bio_button_fill: t.colors.buttonBg,
        link_bio_button_text_color: t.colors.buttonText,
        link_bio_button_shadow: t.components.button.shadow,
        link_bio_avatar_shape: t.avatar.shape,
        link_bio_avatar_size: t.avatar.size,
        link_bio_intro_anim: t.motion.introAnimation,
        link_bio_hover_effect: t.motion.hoverEffect,
      });
      onSaveNow();
      setTimeout(() => refreshPreview(), 500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setStep("");
    }
  }

  // Variation name mapping
  const variationNames = ["Clean", "Bold", "Premium", "Playful", "Corporate"];
  const variationDescs = ["Minimal & elegant", "Energetic & vibrant", "Dark & luxurious", "Fun & colorful", "Professional & polished"];

  return (
    <div className="space-y-4">
      {/* Header with gradient */}
      <div className="relative -mx-4 md:-mx-5 -mt-4 md:-mt-5 px-4 md:px-5 pt-4 md:pt-5 pb-4 bg-gradient-to-br from-violet-500/10 via-blue-500/5 to-transparent border-b border-violet-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">AI Page Designer</h3>
            <p className="text-[10px] text-neutral-500">Match any brand in seconds</p>
          </div>
        </div>
      </div>

      {/* URL Input */}
      <div>
        <h4 className={SECTION_LABEL}>Reference URLs</h4>
        <textarea
          value={urls}
          onChange={e => setUrls(e.target.value)}
          placeholder={"Paste 1-5 URLs for brand matching\nhttps://example.com\nhttps://another-site.com"}
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 text-neutral-900 bg-white resize-y placeholder:text-neutral-400"
        />
      </div>

      {/* Advanced options (collapsible) */}
      <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-500 hover:text-neutral-700 transition-colors">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showAdvanced ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Advanced Options
      </button>

      {showAdvanced && (
        <div className="space-y-3 bg-neutral-50 rounded-xl p-3 border border-neutral-100">
          <div>
            <label className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider">Brand Name</label>
            <input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Your brand" className="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 mt-1" />
          </div>
          <div>
            <label className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider">Description</label>
            <input value={brandDesc} onChange={e => setBrandDesc(e.target.value)} placeholder="What you do" className="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 mt-1" />
          </div>
          <div>
            <label className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider">Target Audience</label>
            <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Who you serve" className="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 mt-1" />
          </div>
          <div>
            <label className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider">Goal</label>
            <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 mt-1 bg-white">
              <option value="">Select goal...</option>
              <option value="book-calls">Book calls</option>
              <option value="sell-products">Sell products</option>
              <option value="collect-emails">Collect emails</option>
              <option value="build-audience">Build audience</option>
            </select>
          </div>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {step || "Processing..."}
          </span>
        ) : "Generate Designs"}
      </button>

      {/* Error */}
      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">{error}</div>
      )}

      {/* Results */}
      {variations.length > 0 && (
        <div className="space-y-3">
          <h4 className={SECTION_LABEL}>Design Variations</h4>
          {variations.map((v: any, i: number) => {
            const t = v.designTokens;
            const isApplied = applied === v.pageId;
            const colors = t?.colors || {};
            const paletteColors = [colors.background, colors.accent, colors.buttonBg, colors.textPrimary, colors.surface].filter(Boolean);

            return (
              <div key={v.pageId || i} className={`rounded-xl border-2 overflow-hidden transition-all ${isApplied ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-neutral-200 hover:border-neutral-300"}`}>
                {/* Preview strip */}
                <div className="h-16 relative" style={{ background: t?.background?.value || colors.background || "#f5f5f5" }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-[10px] font-bold" style={{ color: colors.textPrimary || "#171717" }}>{variationNames[i] || `Variation ${i + 1}`}</div>
                      <div className="text-[8px] opacity-60" style={{ color: colors.textSecondary || "#666" }}>{variationDescs[i] || ""}</div>
                    </div>
                  </div>
                </div>

                <div className="px-3 py-2.5 bg-white">
                  {/* Info row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {/* Color palette dots */}
                      <div className="flex gap-0.5">
                        {paletteColors.slice(0, 5).map((c: string, ci: number) => (
                          <div key={ci} className="w-3.5 h-3.5 rounded-full border border-neutral-200" style={{ background: c }} />
                        ))}
                      </div>
                    </div>
                    <div className="text-[9px] text-neutral-400">
                      {t?.layout?.template || "minimal"} &middot; {t?.typography?.family || "inter"}
                    </div>
                  </div>

                  {/* Apply button */}
                  <button
                    onClick={() => handleApply(v)}
                    disabled={loading || isApplied}
                    className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                      isApplied
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-neutral-900 text-white hover:bg-neutral-800"
                    }`}
                  >
                    {isApplied ? "Applied!" : "Apply This Design"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION: MODS (for car/automotive creators)
   ══════════════════════════════════════════════════════ */
const MOD_CATEGORIES = ["Engine", "Suspension", "Exterior", "Interior", "Wheels/Tires", "Electrical", "Armor/Protection", "Other"];

function ModsSection({ data, onUpdate }: { data: Record<string, any>; onUpdate: (f: Record<string, any>) => void }) {
  let parsed: { mods?: any[]; modSheetEnabled?: boolean; modSheetPrice?: number } = {};
  try { if (data.link_bio_blocks) parsed = JSON.parse(data.link_bio_blocks); } catch {}

  const [mods, setMods] = useState<{ name: string; brand: string; price: string; category: string }[]>(parsed.mods || []);
  const [sheetEnabled, setSheetEnabled] = useState(parsed.modSheetEnabled || false);
  const [sheetPrice, setSheetPrice] = useState(String(parsed.modSheetPrice || 0));
  const [newMod, setNewMod] = useState({ name: "", brand: "", price: "", category: "Engine" });

  function saveAll(updatedMods: typeof mods, enabled: boolean, price: string) {
    const payload = JSON.stringify({ mods: updatedMods, modSheetEnabled: enabled, modSheetPrice: Number(price) || 0 });
    onUpdate({ link_bio_blocks: payload });
  }

  function addMod() {
    if (!newMod.name.trim()) return;
    const updated = [...mods, { ...newMod, name: newMod.name.trim(), brand: newMod.brand.trim(), price: newMod.price.trim() }];
    setMods(updated);
    setNewMod({ name: "", brand: "", price: "", category: "Engine" });
    saveAll(updated, sheetEnabled, sheetPrice);
  }

  function removeMod(i: number) {
    const updated = mods.filter((_, idx) => idx !== i);
    setMods(updated);
    saveAll(updated, sheetEnabled, sheetPrice);
  }

  return (
    <div className="space-y-5">
      <div>
        <h4 className={SECTION_LABEL}>Your Modifications</h4>
        <p className="text-[10px] text-neutral-400 mb-3">List the mods on your build. Shows on the Automotive template.</p>
      </div>

      {/* Existing mods */}
      {mods.length > 0 ? (
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
          {mods.map((m, i) => (
            <div key={i} className="flex items-center gap-2 bg-neutral-50 rounded-lg px-3 py-2 text-xs">
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-neutral-800">{m.name}</span>
                {m.brand && <span className="text-neutral-400 ml-1">({m.brand})</span>}
                {m.price && <span className="text-neutral-400 ml-1">${m.price}</span>}
              </div>
              <span className="text-[9px] text-neutral-400 bg-neutral-200 px-1.5 py-0.5 rounded shrink-0">{m.category}</span>
              <button onClick={() => removeMod(i)} className="text-red-400 hover:text-red-600 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-neutral-400 bg-neutral-50 rounded-lg p-4 text-center">No mods added yet.</p>
      )}

      {/* Add mod form */}
      <div className="space-y-2 border-t border-neutral-100 pt-4">
        <input value={newMod.name} onChange={e => setNewMod(p => ({ ...p, name: e.target.value }))} placeholder="Mod name (e.g. 2&quot; Lift Kit)" className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/10" />
        <div className="flex gap-2">
          <input value={newMod.brand} onChange={e => setNewMod(p => ({ ...p, brand: e.target.value }))} placeholder="Brand (optional)" className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/10" />
          <input value={newMod.price} onChange={e => setNewMod(p => ({ ...p, price: e.target.value }))} placeholder="Price $" className="w-20 px-3 py-2 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/10" />
        </div>
        <div className="flex gap-2">
          <select value={newMod.category} onChange={e => setNewMod(p => ({ ...p, category: e.target.value }))} className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10">
            {MOD_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={addMod} className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors shrink-0">Add</button>
        </div>
      </div>

      {/* Mod sheet toggles */}
      <div className="border-t border-neutral-100 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-neutral-700">Show Mod Sheet on Profile</h4>
            <p className="text-[10px] text-neutral-400">Display your full mod list on your page</p>
          </div>
          <button onClick={() => { const v = !sheetEnabled; setSheetEnabled(v); saveAll(mods, v, sheetPrice); }}
            className={`w-10 h-6 rounded-full transition-colors ${sheetEnabled ? "bg-emerald-500" : "bg-neutral-300"}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${sheetEnabled ? "translate-x-4" : "translate-x-0"}`} />
          </button>
        </div>
        {sheetEnabled && (
          <div>
            <h4 className="text-xs font-semibold text-neutral-700 mb-1">Mod Sheet Price</h4>
            <div className="flex items-center gap-2">
              <input value={sheetPrice} onChange={e => { setSheetPrice(e.target.value); saveAll(mods, sheetEnabled, e.target.value); }} placeholder="0" className="w-24 px-3 py-2 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/10" />
              <span className="text-[10px] text-neutral-400">Set to 0 for free</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION: PORTFOLIO
   ══════════════════════════════════════════════════════ */
function PortfolioSection({ userId }: { userId: string }) {
  const [items, setItems] = useState<Array<{ id: string; title: string; description?: string; image_url: string; video_url?: string; link_url?: string; sort_order: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/profile/portfolio");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "portfolio");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const d = await res.json();
        if (d.url) setNewImageUrl(d.url);
      }
    } finally { setUploading(false); }
  };

  const handleAdd = async () => {
    if (!newTitle || !newImageUrl) return;
    setAdding(true);
    try {
      const res = await fetch("/api/profile/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, description: newDescription || undefined, image_url: newImageUrl }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewDescription("");
        setNewImageUrl("");
        fetchItems();
      }
    } finally { setAdding(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch("/api/profile/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {}
  };

  return (
    <div className="space-y-5">
      <h4 className={SECTION_LABEL}>Portfolio Items</h4>

      {loading ? (
        <p className="text-xs text-neutral-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-neutral-400">No portfolio items yet. Add your first one below.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              {item.image_url && (
                <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{item.title}</p>
                {item.description && <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{item.description}</p>}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="shrink-0 p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new item */}
      <div className="space-y-3 pt-3 border-t border-neutral-200">
        <h4 className={SECTION_LABEL}>Add New Item</h4>

        {/* Image upload */}
        {newImageUrl ? (
          <div className="relative">
            <img src={newImageUrl} alt="Preview" className="w-full h-32 rounded-xl object-cover" />
            <button
              onClick={() => setNewImageUrl("")}
              className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        ) : (
          <label className={`flex items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-neutral-200 cursor-pointer text-xs font-medium text-neutral-500 hover:border-neutral-400 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            <input type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {uploading ? "Uploading..." : "Upload Image or Video"}
          </label>
        )}

        <input
          type="text"
          placeholder="Title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newDescription}
          onChange={e => setNewDescription(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
        />
        <button
          onClick={handleAdd}
          disabled={!newTitle || !newImageUrl || adding}
          className="w-full py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          {adding ? "Adding..." : "Add Portfolio Item"}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN WYSIWYG EDITOR
   ══════════════════════════════════════════════════════ */
export function WysiwygEditor({ initialData, slug }: { initialData: EditorData; slug: string }) {
  const { status, errorMsg, save, saveNow } = useAutosave();
  const [data, setData] = useState(initialData.user);
  const [activeTab, setActiveTab] = useState<TabId>("ai-design");

  // Update field + autosave
  function updateField(fields: Record<string, any>) {
    setData((prev: any) => ({ ...prev, ...fields }));
    save(fields);
  }

  // Preview iframe — only refresh on explicit action, not every autosave
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const saveCountRef = useRef(0);
  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current === "saving" && status === "saved") {
      saveCountRef.current += 1;
      // Auto-refresh preview every 5th save to avoid constant reloads
      if (saveCountRef.current % 5 === 0 && iframeRef.current) {
        iframeRef.current.src = `/u/${slug}?t=${Date.now()}&preview=true`;
      }
    }
    prevStatus.current = status;
  }, [status, slug]);

  function refreshPreview() {
    if (iframeRef.current) iframeRef.current.src = `/u/${slug}?t=${Date.now()}&preview=true`;
  }

  return (
    <div className="min-h-screen bg-[#f8f8fa]">
      <EditorToolbar status={status} errorMsg={errorMsg} slug={slug} onSave={saveNow} />

      <div className="flex flex-col md:flex-row pt-14 min-h-screen">
        {/* LEFT SIDEBAR */}
        <div className="w-full md:w-80 shrink-0 bg-white md:border-r border-neutral-200 overflow-y-auto pb-20 md:pb-0 md:sticky md:top-[56px] md:max-h-[calc(100vh-56px)]">
          <div className="flex md:flex-row h-full">
            {/* Vertical tab list */}
            <div className="md:w-[52px] shrink-0 bg-neutral-50 border-r border-neutral-200 overflow-x-auto md:overflow-y-auto flex md:flex-col">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2.5 md:py-3 min-w-[52px] transition-all ${activeTab === tab.id ? "bg-white text-neutral-900 border-b-2 md:border-b-0 md:border-r-2 border-neutral-900" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={tab.icon} /></svg>
                  <span className="text-[8px] font-semibold leading-none mt-0.5">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Section content */}
            <div className="flex-1 p-4 md:p-5 overflow-y-auto">
              {activeTab === "ai-design" && <AIDesignSection data={data} onUpdate={updateField} onSaveNow={saveNow} refreshPreview={refreshPreview} />}
              {activeTab === "header" && <HeaderSection data={data} onUpdate={updateField} onSaveNow={saveNow} />}
              {activeTab === "theme" && <ThemeSection data={data} onUpdate={updateField} />}
              {activeTab === "wallpaper" && <WallpaperSection data={data} onUpdate={updateField} onSaveNow={saveNow} />}
              {activeTab === "text" && <TextSection data={data} onUpdate={updateField} />}
              {activeTab === "buttons" && <ButtonsSection data={data} onUpdate={updateField} />}
              {activeTab === "colors" && <ColorsSection data={data} onUpdate={updateField} />}
              {activeTab === "footer" && <FooterSection data={data} onUpdate={updateField} />}
              {activeTab === "links" && <LinkManager />}
              {activeTab === "portfolio" && <PortfolioSection userId={data.id} />}
              {activeTab === "mods" && <ModsSection data={data} onUpdate={updateField} />}
              {activeTab === "profile" && <ProfileSection data={data} onUpdate={updateField} />}
            </div>
          </div>
        </div>

        {/* RIGHT — Live Preview (iframe, hidden on mobile) */}
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

      {/* MOBILE BOTTOM BAR */}
      <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-t border-neutral-200 p-3">
        <a href={`/u/${slug}`} target="_blank" className="flex items-center justify-center gap-2 w-full py-3 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Preview Page
        </a>
      </div>
    </div>
  );
}
