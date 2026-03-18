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
    // Accumulate all pending changes
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

  // Force save all pending changes NOW (no debounce)
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
function EditorToolbar({ status, errorMsg, slug, onOpenPanel, activePanel, onSave }: {
  status: SaveStatus; errorMsg: string; slug: string;
  onOpenPanel: (p: string | null) => void; activePanel: string | null;
  onSave: () => void;
}) {
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: back + page name */}
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="p-2 rounded-xl hover:bg-neutral-100 transition-colors text-neutral-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <div>
            <span className="text-sm font-semibold text-neutral-900">Editing Link in Bio</span>
            <span className="text-xs text-neutral-400 ml-2">hireacreator.ai/u/{slug}</span>
          </div>
        </div>

        {/* Center: panel toggles */}
        <div className="hidden sm:flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
          {[
            { id: "design", label: "Design", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg> },
            { id: "links", label: "Links", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" /></svg> },
            { id: "sections", label: "Sections", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg> },
          ].map(p => (
            <button key={p.id} onClick={() => onOpenPanel(activePanel === p.id ? null : p.id)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activePanel === p.id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        {/* Right: save status + save button + view live */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {status === "saving" && <><div className="w-3 h-3 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" /><span className="text-xs text-neutral-400">Saving...</span></>}
            {status === "saved" && <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg><span className="text-xs text-emerald-600">Saved</span></>}
            {status === "error" && <span className="text-xs text-red-500 max-w-[180px] truncate" title={errorMsg}>{errorMsg || "Save failed"}</span>}
          </div>
          <button onClick={onSave} disabled={status === "saving"} className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm">
            Save
          </button>
          <a href={`/u/${slug}`} target="_blank" className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors">
            View Live
          </a>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   DESIGN PANEL (slide-in sidebar)
   ══════════════════════════════════════════════════════ */
function DesignPanel({ data, onUpdate }: { data: Record<string, any>; onUpdate: (fields: Record<string, any>) => void }) {
  const templates = [
    { id: "minimal", name: "Minimal" }, { id: "glass", name: "Glass" },
    { id: "bold", name: "Bold" }, { id: "neon", name: "Neon" },
    { id: "showcase", name: "Showcase" }, { id: "collage", name: "Collage" },
    { id: "bento", name: "Bento" }, { id: "split", name: "Split" },
  ];

  const gradients = [
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

  const fonts = [
    { id: "jakarta", name: "Jakarta" }, { id: "outfit", name: "Outfit" },
    { id: "inter", name: "Inter" }, { id: "poppins", name: "Poppins" },
    { id: "space-grotesk", name: "Space Grotesk" }, { id: "sora", name: "Sora" },
    { id: "manrope", name: "Manrope" }, { id: "dm-sans", name: "DM Sans" },
  ];

  const buttonShapes = [
    { id: "rounded", name: "Rounded" }, { id: "pill", name: "Pill" },
    { id: "square", name: "Square" }, { id: "sharp", name: "Sharp" },
  ];

  return (
    <div className="space-y-6">
      {/* Template */}
      <div>
        <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Template</h3>
        <div className="grid grid-cols-4 gap-1.5">
          {templates.map(t => (
            <button key={t.id} onClick={() => onUpdate({ link_bio_template: t.id })} className={`py-2 text-[10px] font-medium rounded-lg transition-all ${data.link_bio_template === t.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{t.name}</button>
          ))}
        </div>
      </div>

      {/* Background */}
      <div>
        <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Background</h3>
        {/* Gradient presets */}
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {gradients.map(g => (
            <button key={g.label} onClick={() => onUpdate({ link_bio_bg_type: g.value ? "gradient" : "", link_bio_bg_value: g.value })} className={`h-10 rounded-lg border-2 transition-all ${data.link_bio_bg_value === g.value && (data.link_bio_bg_type === "gradient" || !data.link_bio_bg_type) ? "border-neutral-900 scale-105" : "border-transparent hover:border-neutral-300"}`} style={{ background: g.value || "#f5f5f5" }} title={g.label} />
          ))}
        </div>
        {/* Image upload */}
        <div className="space-y-2">
          <label className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed cursor-pointer transition-all text-xs font-medium ${data.link_bio_bg_type === "image" ? "border-neutral-900 bg-neutral-50 text-neutral-900" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              const fd = new FormData(); fd.append("file", file); fd.append("type", "cover");
              const res = await fetch("/api/upload", { method: "POST", body: fd });
              if (res.ok) { const d = await res.json(); if (d.url) onUpdate({ link_bio_bg_type: "image", link_bio_bg_value: d.url }); }
            }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21" /></svg>
            Upload Image
          </label>
          {/* Collage photos upload */}
          <label className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed cursor-pointer transition-all text-xs font-medium ${data.link_bio_bg_type === "collage" ? "border-neutral-900 bg-neutral-50 text-neutral-900" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
            <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              if (files.length === 0) return;
              const urls: string[] = [...(data.link_bio_bg_images || [])];
              for (const file of files) {
                const fd = new FormData(); fd.append("file", file); fd.append("type", "cover");
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                if (res.ok) { const d = await res.json(); if (d.url) urls.push(d.url); }
              }
              onUpdate({ link_bio_bg_type: "collage", link_bio_bg_images: JSON.stringify(urls) });
            }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Upload Photo Collage
          </label>
          {/* Show uploaded collage thumbnails */}
          {data.link_bio_bg_type === "collage" && data.link_bio_bg_images && (() => {
            let imgs: string[] = [];
            try { imgs = typeof data.link_bio_bg_images === "string" ? JSON.parse(data.link_bio_bg_images) : data.link_bio_bg_images; } catch {}
            return imgs.length > 0 ? (
              <div className="grid grid-cols-4 gap-1">
                {imgs.map((url: string, i: number) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-100">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => {
                      const updated = imgs.filter((_: string, idx: number) => idx !== i);
                      onUpdate({ link_bio_bg_images: JSON.stringify(updated), link_bio_bg_type: updated.length > 0 ? "collage" : "" });
                    }} className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 text-white rounded-full text-[8px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">x</button>
                  </div>
                ))}
              </div>
            ) : null;
          })()}
          {/* Show uploaded image preview */}
          {data.link_bio_bg_type === "image" && data.link_bio_bg_value && (
            <div className="relative rounded-lg overflow-hidden h-20 bg-neutral-100">
              <img src={data.link_bio_bg_value} alt="" className="w-full h-full object-cover" />
              <button onClick={() => onUpdate({ link_bio_bg_type: "", link_bio_bg_value: "" })} className="absolute top-1 right-1 px-2 py-0.5 bg-black/60 text-white rounded-full text-[10px] hover:bg-black/80">Remove</button>
            </div>
          )}
        </div>
      </div>

      {/* Font */}
      <div>
        <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Font</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {fonts.map(f => (
            <button key={f.id} onClick={() => onUpdate({ link_bio_font: f.id })} className={`py-2 text-xs font-medium rounded-lg transition-all ${data.link_bio_font === f.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{f.name}</button>
          ))}
        </div>
      </div>

      {/* Button Shape */}
      <div>
        <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Button Shape</h3>
        <div className="grid grid-cols-4 gap-1.5">
          {buttonShapes.map(s => (
            <button key={s.id} onClick={() => onUpdate({ link_bio_button_shape: s.id })} className={`py-2 text-[10px] font-medium rounded-lg transition-all ${data.link_bio_button_shape === s.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{s.name}</button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Accent Color</h3>
        <div className="flex items-center gap-2">
          <input type="color" value={data.link_bio_accent || "#171717"} onChange={e => onUpdate({ link_bio_accent: e.target.value })} className="w-8 h-8 rounded-lg border border-neutral-200 cursor-pointer" />
          <span className="text-xs text-neutral-500">{data.link_bio_accent || "#171717"}</span>
        </div>
      </div>
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
  const [panel, setPanel] = useState<string | null>(null);
  const [sections, setSections] = useState([
    { id: "profile", label: "Profile", enabled: true },
    { id: "socials", label: "Social Links", enabled: true },
    { id: "bio", label: "Bio", enabled: true },
    { id: "links", label: "Links", enabled: true },
    { id: "services", label: "Services", enabled: initialData.services.length > 0 },
    { id: "calendar", label: "Calendar", enabled: !!initialData.user.calendar_enabled },
  ]);

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
      iframeRef.current.src = `/u/${slug}?t=${Date.now()}`;
    }
    prevStatus.current = status;
  }, [status, slug]);

  return (
    <div className="min-h-screen bg-[#f8f8fa]">
      <EditorToolbar status={status} errorMsg={errorMsg} slug={slug} onOpenPanel={setPanel} activePanel={panel} onSave={saveNow} />

      <div className="flex pt-14 min-h-screen">
        {/* ═══ LEFT SIDEBAR — Controls ═══ */}
        <div className="w-80 shrink-0 bg-white border-r border-neutral-200 overflow-y-auto" style={{ height: "calc(100vh - 56px)", position: "sticky", top: 56 }}>
          <div className="p-5">
            {/* Panel selector tabs */}
            <div className="flex gap-1 mb-5 bg-neutral-100 rounded-xl p-1">
              {[
                { id: "design", label: "Design" },
                { id: "links", label: "Links" },
                { id: "profile", label: "Profile" },
              ].map(p => (
                <button key={p.id} onClick={() => setPanel(panel === p.id ? null : p.id)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${panel === p.id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>
                  {p.label}
                </button>
              ))}
            </div>

            {/* Panel content */}
            {(!panel || panel === "design") && <DesignPanel data={data} onUpdate={updateField} />}
            {panel === "links" && <LinkManager />}
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

        {/* ═══ RIGHT — Live Preview (iframe) ═══ */}
        <div className="flex-1 flex items-start justify-center py-8 px-4">
          <div className="w-full max-w-[420px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-900">Live Preview</h3>
              <button onClick={() => { if (iframeRef.current) iframeRef.current.src = `/u/${slug}?t=${Date.now()}`; }} className="text-[11px] text-neutral-400 hover:text-neutral-600 font-medium flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Refresh
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-200">
              <iframe
                ref={iframeRef}
                src={`/u/${slug}?t=${Date.now()}`}
                className="w-full border-0"
                style={{ height: "calc(100vh - 160px)", minHeight: "600px" }}
                title="Live Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
