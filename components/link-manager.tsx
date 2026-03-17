"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface BioLink {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  icon: string | null;
  position: number;
  is_visible: boolean;
  is_pinned: boolean;
  is_archived: boolean;
  click_count: number;
  schedule_start: string | null;
  schedule_end: string | null;
}

/* ── Toast ── */
function Toast({ message, type, onDone }: { message: string; type: "success" | "error"; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg animate-[slideUp_0.3s_ease] ${type === "success" ? "bg-neutral-900 text-white" : "bg-red-600 text-white"}`} role="alert">
      {type === "success" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="inline mr-1.5 -mt-0.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg>}
      {message}
    </div>
  );
}

export function LinkManager() {
  const [links, setLinks] = useState<BioLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Add form
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit form
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const addTitleRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      if (data.links) setLinks(data.links);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
  }

  function normalizeUrl(raw: string): string {
    let url = raw.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;
    return url;
  }

  function validateUrl(url: string): string | null {
    if (!url.trim()) return "URL is required. Paste your link here.";
    const normalized = normalizeUrl(url);
    try { new URL(normalized); return null; }
    catch { return "Invalid URL format. It should start with https:// (e.g. https://youtube.com/@you)"; }
  }

  async function addLink() {
    if (!newTitle.trim()) { setAddError("Title is required. Give your link a name people will recognize."); return; }
    const urlErr = validateUrl(newUrl);
    if (urlErr) { setAddError(urlErr); return; }
    const url = normalizeUrl(newUrl);

    setAdding(true); setAddError("");
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), url }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error || "Failed to add link. Check your connection."); setAdding(false); return; }
      setLinks([...links, data.link]);
      setNewTitle(""); setNewUrl(""); setShowAdd(false);
      showToast("Link added");
    } catch { setAddError("Network error. Check your connection and try again."); }
    setAdding(false);
  }

  async function saveEdit() {
    if (!editingId || !editTitle.trim()) { setEditError("Title is required."); return; }
    const urlErr = validateUrl(editUrl);
    if (urlErr) { setEditError(urlErr); return; }
    const url = normalizeUrl(editUrl);

    setEditSaving(true); setEditError("");
    try {
      const res = await fetch("/api/links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, title: editTitle.trim(), url }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setEditError(d.error || "Save failed."); setEditSaving(false); return; }
      setLinks(links.map(l => l.id === editingId ? { ...l, title: editTitle.trim(), url } : l));
      setEditingId(null);
      showToast("Link updated");
    } catch { setEditError("Network error. Try again."); }
    setEditSaving(false);
  }

  async function toggleVisibility(id: string, current: boolean) {
    setLinks(links.map(l => l.id === id ? { ...l, is_visible: !current } : l));
    await fetch("/api/links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isVisible: !current }),
    });
    showToast(current ? "Link hidden from visitors" : "Link is now visible");
  }

  async function archiveLink(id: string) {
    setLinks(links.map(l => l.id === id ? { ...l, is_archived: true } : l));
    setDeleteConfirm(null);
    await fetch("/api/links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isArchived: true }),
    });
    showToast("Link archived. Analytics preserved.");
  }

  async function restoreLink(id: string) {
    setLinks(links.map(l => l.id === id ? { ...l, is_archived: false } : l));
    await fetch("/api/links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isArchived: false }),
    });
    showToast("Link restored");
  }

  async function deleteLink(id: string) {
    setLinks(links.filter(l => l.id !== id));
    setDeleteConfirm(null);
    await fetch(`/api/links?id=${id}`, { method: "DELETE" });
    showToast("Link permanently deleted");
  }

  async function handleDragEnd() {
    if (dragIdx === null || dragOverIdx === null || dragIdx === dragOverIdx) {
      setDragIdx(null); setDragOverIdx(null); return;
    }
    const active = links.filter(l => !l.is_archived);
    const reordered = [...active];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(dragOverIdx, 0, moved);
    const archived = links.filter(l => l.is_archived);
    setLinks([...reordered, ...archived]);
    setDragIdx(null); setDragOverIdx(null);

    await fetch("/api/links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: reordered.map(l => l.id) }),
    });
  }

  // Keyboard reorder
  function handleKeyReorder(idx: number, e: React.KeyboardEvent) {
    const active = links.filter(l => !l.is_archived);
    if (e.key === "ArrowUp" && idx > 0) {
      e.preventDefault();
      const reordered = [...active];
      [reordered[idx], reordered[idx - 1]] = [reordered[idx - 1], reordered[idx]];
      const archived = links.filter(l => l.is_archived);
      setLinks([...reordered, ...archived]);
      fetch("/api/links", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: reordered.map(l => l.id) }) });
    }
    if (e.key === "ArrowDown" && idx < active.length - 1) {
      e.preventDefault();
      const reordered = [...active];
      [reordered[idx], reordered[idx + 1]] = [reordered[idx + 1], reordered[idx]];
      const archived = links.filter(l => l.is_archived);
      setLinks([...reordered, ...archived]);
      fetch("/api/links", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: reordered.map(l => l.id) }) });
    }
  }

  function startEdit(link: BioLink) {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditError("");
  }

  function getDomain(url: string): string {
    try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
  }

  function copyUrl(url: string) {
    navigator.clipboard?.writeText(url);
    showToast("Link URL copied");
  }

  const activeLinks = links.filter(l => !l.is_archived);
  const archivedLinks = links.filter(l => l.is_archived);

  if (loading) return <div className="py-8 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin" /></div>;

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {/* Active link list */}
      <div className="space-y-2" role="list" aria-label="Your links">
        {activeLinks.map((link, idx) => (
          <div
            key={link.id}
            role="listitem"
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={e => { e.preventDefault(); setDragOverIdx(idx); }}
            onDragEnd={handleDragEnd}
            className={`group bg-white rounded-2xl border transition-all ${
              dragOverIdx === idx && dragIdx !== idx ? "border-neutral-900 shadow-lg scale-[1.01]" :
              !link.is_visible ? "border-neutral-200 opacity-50" :
              "border-neutral-200 hover:border-neutral-300 hover:shadow-sm"
            }`}
          >
            {editingId === link.id ? (
              /* ── Edit mode ── */
              <div className="p-4 space-y-3">
                <div>
                  <label htmlFor={`edit-title-${link.id}`} className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Title</label>
                  <input
                    id={`edit-title-${link.id}`}
                    type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    placeholder="My Portfolio, YouTube Channel, etc."
                    className="w-full mt-1 px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:bg-white transition-all"
                    autoFocus
                    aria-required="true"
                    aria-describedby={editError ? `edit-err-${link.id}` : undefined}
                  />
                </div>
                <div>
                  <label htmlFor={`edit-url-${link.id}`} className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">URL</label>
                  <input
                    id={`edit-url-${link.id}`}
                    type="url" value={editUrl} onChange={e => setEditUrl(e.target.value)}
                    placeholder="https://your-link-here"
                    className="w-full mt-1 px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:bg-white transition-all"
                    aria-required="true"
                    aria-describedby={editError ? `edit-err-${link.id}` : undefined}
                    onKeyDown={e => e.key === "Enter" && saveEdit()}
                  />
                </div>
                {editError && <p id={`edit-err-${link.id}`} className="text-xs text-red-600 flex items-center gap-1" role="alert"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>{editError}</p>}
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(null)} className="flex-1 py-2.5 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900/20">Cancel</button>
                  <button onClick={saveEdit} disabled={editSaving} className="flex-1 py-2.5 text-xs font-medium text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral-900/20">{editSaving ? "Saving..." : "Update Link"}</button>
                </div>
              </div>
            ) : (
              /* ── View mode ── */
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
                {/* Drag handle — keyboard accessible */}
                <button
                  className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500 shrink-0 p-1 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                  title="Drag to reorder links"
                  aria-label={`Reorder ${link.title}. Use arrow keys to move.`}
                  tabIndex={0}
                  onKeyDown={e => handleKeyReorder(idx, e)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
                </button>

                {/* Link info — click to edit */}
                <button className="flex-1 min-w-0 text-left focus:outline-none focus:ring-2 focus:ring-neutral-900/20 rounded-lg p-1 -m-1" onClick={() => startEdit(link)} aria-label={`Edit ${link.title}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900 truncate">{link.title}</span>
                    {link.is_pinned && <span className="text-[8px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase shrink-0">Pinned</span>}
                    {!link.is_visible && <span className="text-[8px] font-bold bg-neutral-200 text-neutral-500 px-1.5 py-0.5 rounded-full uppercase shrink-0">Hidden</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-neutral-400 truncate">{getDomain(link.url)}</span>
                    {link.click_count > 0 && (
                      <span className="text-[10px] text-neutral-400 shrink-0 flex items-center gap-0.5" title={`${link.click_count} clicks`}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round"/></svg>
                        {link.click_count}
                      </span>
                    )}
                  </div>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Copy URL */}
                  <button onClick={() => copyUrl(link.url)} className="p-2 rounded-lg text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900/20" title="Copy link URL" aria-label={`Copy URL for ${link.title}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" /></svg>
                  </button>

                  {/* Open link */}
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900/20" title="Open link in new tab" aria-label={`Test ${link.title} link`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </a>

                  {/* Visibility toggle */}
                  <button
                    onClick={() => toggleVisibility(link.id, link.is_visible)}
                    className={`relative w-9 h-5 rounded-full transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 ${link.is_visible ? "bg-emerald-500" : "bg-neutral-300"}`}
                    title={link.is_visible ? "Visible to visitors. Click to hide." : "Hidden from visitors. Click to show."}
                    aria-label={link.is_visible ? `Hide ${link.title}` : `Show ${link.title}`}
                    role="switch"
                    aria-checked={link.is_visible}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${link.is_visible ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>

                  {/* Delete/Archive */}
                  {deleteConfirm === link.id ? (
                    <div className="flex items-center gap-1 ml-1">
                      <button onClick={() => archiveLink(link.id)} className="px-2 py-1.5 text-[10px] font-bold text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/20" title="Archive keeps analytics">Archive</button>
                      <button onClick={() => deleteLink(link.id)} className="px-2 py-1.5 text-[10px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-neutral-900/20">Delete</button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1.5 text-[10px] font-medium text-neutral-400 focus:outline-none" aria-label="Cancel delete">X</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(link.id)} className="p-2 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900/20" title="Delete or archive this link" aria-label={`Delete ${link.title}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" strokeLinecap="round"/></svg>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state with onboarding */}
      {activeLinks.length === 0 && !showAdd && (
        <div className="text-center py-10 px-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round"/></svg>
          </div>
          <p className="text-base font-bold text-neutral-900">Add your first link</p>
          <p className="text-sm text-neutral-400 mt-1.5 max-w-[280px] mx-auto">Share your content, products, and socials. Add a link and drag to reorder anytime.</p>
          <button onClick={() => { setShowAdd(true); setTimeout(() => addTitleRef.current?.focus(), 100); }} className="mt-4 px-6 py-3 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900/20">
            + Add Your First Link
          </button>
        </div>
      )}

      {/* Add link form */}
      {showAdd && (
        <div className="mt-3 bg-white rounded-2xl border border-neutral-200 p-4 space-y-3">
          <div>
            <label htmlFor="add-title" className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Title</label>
            <input
              ref={addTitleRef}
              id="add-title"
              type="text" value={newTitle} onChange={e => { setNewTitle(e.target.value); setAddError(""); }}
              placeholder="My Portfolio, YouTube Channel, etc."
              className="w-full mt-1 px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:bg-white transition-all"
              autoFocus
              aria-required="true"
              aria-describedby={addError ? "add-error" : undefined}
              onKeyDown={e => e.key === "Enter" && document.getElementById("add-url")?.focus()}
            />
          </div>
          <div>
            <label htmlFor="add-url" className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">URL</label>
            <input
              id="add-url"
              type="url" value={newUrl} onChange={e => { setNewUrl(e.target.value); setAddError(""); }}
              placeholder="https://your-link-here"
              className="w-full mt-1 px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:bg-white transition-all"
              aria-required="true"
              aria-describedby={addError ? "add-error" : undefined}
              onKeyDown={e => e.key === "Enter" && addLink()}
            />
          </div>
          {addError && <p id="add-error" className="text-xs text-red-600 flex items-center gap-1" role="alert"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>{addError}</p>}
          <div className="flex gap-2">
            <button onClick={() => { setShowAdd(false); setAddError(""); setNewTitle(""); setNewUrl(""); }} className="flex-1 py-2.5 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900/20">Cancel</button>
            <button onClick={addLink} disabled={adding} className="flex-1 py-2.5 text-xs font-medium text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral-900/20">{adding ? "Adding..." : "Add Link"}</button>
          </div>
        </div>
      )}

      {/* Add button (when links exist) */}
      {activeLinks.length > 0 && !showAdd && (
        <button onClick={() => { setShowAdd(true); setTimeout(() => addTitleRef.current?.focus(), 100); }} className="w-full mt-3 py-3 text-sm font-semibold text-neutral-900 bg-white border-2 border-dashed border-neutral-300 rounded-2xl hover:border-neutral-400 hover:bg-neutral-50 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 min-h-[48px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
          Add Link
        </button>
      )}

      {/* Archived links section */}
      {archivedLinks.length > 0 && (
        <div className="mt-6">
          <button onClick={() => setShowArchived(!showArchived)} className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showArchived ? "rotate-90" : ""}`}><path d="M9 18l6-6-6-6" strokeLinecap="round" /></svg>
            Archived ({archivedLinks.length})
          </button>
          {showArchived && (
            <div className="mt-2 space-y-2">
              {archivedLinks.map(link => (
                <div key={link.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 opacity-60">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-neutral-600 truncate block">{link.title}</span>
                    <span className="text-xs text-neutral-400">{getDomain(link.url)} — {link.click_count} clicks</span>
                  </div>
                  <button onClick={() => restoreLink(link.id)} className="px-3 py-1.5 text-[10px] font-bold text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900/20">Restore</button>
                  <button onClick={() => deleteLink(link.id)} className="px-3 py-1.5 text-[10px] font-bold text-red-500 hover:text-red-700 focus:outline-none" title="Permanently delete">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes slideUp { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }`}</style>
    </div>
  );
}
