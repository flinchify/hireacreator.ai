"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { LinkManager } from "./link-manager";
import { PlatformIcon } from "./icons/platforms";

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  const save = useCallback(async (fields: Record<string, any>) => {
    const key = JSON.stringify(fields);
    if (key === lastSavedRef.current) return; // No change

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setStatus("saving");
      try {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        });
        if (res.ok) {
          lastSavedRef.current = key;
          setStatus("saved");
          setTimeout(() => setStatus("idle"), 2000);
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    }, delay);
  }, [delay]);

  return { status, save };
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
function EditorToolbar({ status, slug, onOpenPanel, activePanel }: {
  status: SaveStatus; slug: string;
  onOpenPanel: (p: string | null) => void; activePanel: string | null;
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

        {/* Right: save status + view live */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {status === "saving" && <><div className="w-3 h-3 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" /><span className="text-xs text-neutral-400">Saving...</span></>}
            {status === "saved" && <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg><span className="text-xs text-emerald-600">Saved</span></>}
            {status === "error" && <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" /></svg><span className="text-xs text-red-500">Save failed</span></>}
          </div>
          <a href={`/u/${slug}`} target="_blank" className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors">
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
        <div className="grid grid-cols-4 gap-1.5">
          {gradients.map(g => (
            <button key={g.label} onClick={() => onUpdate({ link_bio_bg_type: g.value ? "gradient" : "", link_bio_bg_value: g.value })} className={`h-10 rounded-lg border-2 transition-all ${data.link_bio_bg_value === g.value ? "border-neutral-900 scale-105" : "border-transparent hover:border-neutral-300"}`} style={{ background: g.value || "#f5f5f5" }} title={g.label} />
          ))}
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
  const { status, save } = useAutosave();
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

  // Background style
  const bgStyle: React.CSSProperties = {};
  if (data.link_bio_bg_type === "gradient" && data.link_bio_bg_value) {
    bgStyle.background = data.link_bio_bg_value;
  } else if (data.link_bio_bg_type === "solid" && data.link_bio_bg_value) {
    bgStyle.background = data.link_bio_bg_value;
  } else if (data.link_bio_bg_type === "image" && data.link_bio_bg_value) {
    bgStyle.backgroundImage = `url(${data.link_bio_bg_value})`;
    bgStyle.backgroundSize = "cover";
    bgStyle.backgroundPosition = "center";
  }

  const isDark = data.link_bio_bg_type === "gradient" && data.link_bio_bg_value?.includes("#0f") ||
    data.link_bio_bg_type === "gradient" && data.link_bio_bg_value?.includes("#1a") ||
    data.link_bio_bg_type === "video" || data.link_bio_bg_type === "image";

  const textColor = isDark ? "text-white" : "text-neutral-900";
  const subColor = isDark ? "text-white/60" : "text-neutral-500";
  const accent = data.link_bio_accent || "#171717";

  return (
    <div className="min-h-screen" style={bgStyle}>
      <EditorToolbar status={status} slug={slug} onOpenPanel={setPanel} activePanel={panel} />

      {/* Side panel */}
      {panel && (
        <div className="fixed top-14 right-0 bottom-0 w-80 bg-white border-l border-neutral-200 z-40 overflow-y-auto shadow-xl">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-neutral-900 capitalize">{panel}</h2>
              <button onClick={() => setPanel(null)} className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
              </button>
            </div>
            {panel === "design" && <DesignPanel data={data} onUpdate={updateField} />}
            {panel === "links" && <LinkManager />}
            {panel === "sections" && <SectionsPanel sections={sections} onToggle={toggleSection} onReorder={reorderSections} />}
          </div>
        </div>
      )}

      {/* ─── THE PAGE (editable) ─── */}
      <div className={`max-w-[480px] mx-auto px-5 pt-20 pb-10 min-h-screen flex flex-col ${panel ? "mr-80" : ""}`}>
        {sections.filter(s => s.enabled).map(section => {
          switch (section.id) {
            case "profile":
              return (
                <div key="profile" className="text-center mb-6">
                  {/* Avatar */}
                  <div className="relative group inline-block">
                    {data.avatar_url ? (
                      <img src={data.avatar_url} alt="" className="w-24 h-24 rounded-full object-cover shadow-lg" />
                    ) : (
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg ${isDark ? "bg-white/10" : "bg-neutral-100"}`}>
                        <span className={`text-3xl font-bold ${isDark ? "text-white/60" : "text-neutral-400"}`}>{(data.full_name || "?")[0]}</span>
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 rounded-full cursor-pointer transition-all opacity-0 group-hover:opacity-100">
                      <input type="file" accept="image/*" className="hidden" onChange={async e => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const fd = new FormData(); fd.append("file", file); fd.append("type", "avatar");
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        const d = await res.json();
                        if (d.url) setData((prev: any) => ({ ...prev, avatar_url: d.url }));
                      }} />
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
                    </label>
                  </div>

                  {/* Name — inline editable */}
                  <div className="mt-4">
                    <InlineText
                      value={data.full_name || ""}
                      onChange={v => updateText("full_name", v)}
                      placeholder="Your Name"
                      className={`font-display text-xl font-bold ${textColor} block`}
                      tag="h1"
                    />
                  </div>

                  {/* Headline — inline editable */}
                  <InlineText
                    value={data.headline || ""}
                    onChange={v => updateText("headline", v)}
                    placeholder="Click to add headline"
                    className={`text-sm mt-1 block ${subColor}`}
                  />

                  {/* Location — inline editable */}
                  <InlineText
                    value={data.location || ""}
                    onChange={v => updateText("location", v)}
                    placeholder="Click to add location"
                    className={`text-xs mt-1 block ${isDark ? "text-white/40" : "text-neutral-400"}`}
                  />
                </div>
              );

            case "socials":
              return initialData.socials.length > 0 ? (
                <div key="socials" className="flex items-center justify-center gap-2.5 mb-5 flex-wrap">
                  {initialData.socials.map((s: any) => (
                    <a key={s.platform} href={s.url || "#"} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${s.platform}`} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-neutral-100 hover:bg-neutral-200"}`}>
                      <PlatformIcon platform={s.platform} size={18} className={isDark ? "text-white/70" : "text-neutral-500"} />
                    </a>
                  ))}
                  <button onClick={() => setPanel("links")} className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed transition-all hover:scale-110 ${isDark ? "border-white/20 text-white/30 hover:border-white/40" : "border-neutral-300 text-neutral-300 hover:border-neutral-400"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
                  </button>
                </div>
              ) : (
                <div key="socials" className="text-center mb-5">
                  <button onClick={() => setPanel("links")} className={`text-xs ${subColor} hover:underline`}>+ Add social links</button>
                </div>
              );

            case "bio":
              return (
                <div key="bio" className="mb-6">
                  <InlineText
                    value={data.bio || ""}
                    onChange={v => updateText("bio", v)}
                    placeholder="Click to write your bio. Tell people who you are and what you do."
                    className={`text-sm text-center leading-relaxed block ${subColor}`}
                    tag="p"
                    multiline
                  />
                </div>
              );

            case "links":
              return (
                <div key="links" className="mb-6">
                  {initialData.bioLinks.length > 0 ? (
                    <div className="space-y-2.5">
                      {initialData.bioLinks.map((link: any) => (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className={`block w-full px-5 py-3.5 text-center font-medium text-sm transition-all hover:scale-[1.02] rounded-xl ${isDark ? "bg-white/10 text-white hover:bg-white/15" : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"}`}>
                          {link.title}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <button onClick={() => setPanel("links")} className={`w-full py-4 border-2 border-dashed rounded-xl text-sm font-medium transition-all hover:scale-[1.01] ${isDark ? "border-white/20 text-white/40 hover:border-white/30" : "border-neutral-300 text-neutral-400 hover:border-neutral-400"}`}>
                      + Add your first link
                    </button>
                  )}
                </div>
              );

            case "services":
              return initialData.services.length > 0 ? (
                <div key="services" className="space-y-2.5 mb-6">
                  {initialData.services.map((s: any) => (
                    <div key={s.id} className={`px-5 py-4 rounded-xl ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-neutral-200"}`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium text-sm ${isDark ? "text-white" : "text-neutral-900"}`}>{s.title}</span>
                        <span className={`text-sm font-bold ${isDark ? "text-white" : "text-neutral-900"}`}>{Number(s.price) === 0 ? "Free" : `$${s.price}`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null;

            case "calendar":
              return (
                <div key="calendar" className={`mb-6 px-5 py-4 rounded-xl text-center ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-neutral-200"}`}>
                  <p className={`text-sm font-medium ${isDark ? "text-white" : "text-neutral-900"}`}>Book a session</p>
                  <p className={`text-xs mt-1 ${subColor}`}>Calendar booking widget appears here</p>
                </div>
              );

            default: return null;
          }
        })}

        {/* Branding */}
        <div className="mt-auto pt-8 text-center">
          <a href="/" className={`text-[10px] font-medium ${isDark ? "text-white/20" : "text-neutral-300"}`}>
            Powered by HireACreator.ai
          </a>
        </div>
      </div>
    </div>
  );
}
