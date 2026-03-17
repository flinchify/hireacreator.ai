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
  click_count: number;
  schedule_start: string | null;
  schedule_end: string | null;
}

export function LinkManager() {
  const [links, setLinks] = useState<BioLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

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

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      if (data.links) setLinks(data.links);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addLink() {
    if (!newTitle.trim()) { setAddError("Title is required"); return; }
    if (!newUrl.trim()) { setAddError("URL is required"); return; }
    // Auto-prefix https
    let url = newUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;
    try { new URL(url); } catch { setAddError("Enter a valid URL"); return; }

    setAdding(true); setAddError("");
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), url }),
    });
    const data = await res.json();
    if (!res.ok) { setAddError(data.error || "Failed to add"); setAdding(false); return; }
    setLinks([...links, data.link]);
    setNewTitle(""); setNewUrl(""); setShowAdd(false); setAdding(false);
  }

  async function saveEdit() {
    if (!editingId || !editTitle.trim()) { setEditError("Title is required"); return; }
    let url = editUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;
    try { new URL(url); } catch { setEditError("Enter a valid URL"); return; }

    setEditSaving(true); setEditError("");
    const res = await fetch("/api/links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, title: editTitle.trim(), url }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setEditError(d.error || "Save failed"); setEditSaving(false); return; }
    setLinks(links.map(l => l.id === editingId ? { ...l, title: editTitle.trim(), url } : l));
    setEditingId(null); setEditSaving(false);
  }

  async function toggleVisibility(id: string, current: boolean) {
    setLinks(links.map(l => l.id === id ? { ...l, is_visible: !current } : l));
    await fetch("/api/links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isVisible: !current }),
    });
  }

  async function deleteLink(id: string) {
    setLinks(links.filter(l => l.id !== id));
    setDeleteConfirm(null);
    await fetch(`/api/links?id=${id}`, { method: "DELETE" });
  }

  async function handleDragEnd() {
    if (dragIdx === null || dragOverIdx === null || dragIdx === dragOverIdx) {
      setDragIdx(null); setDragOverIdx(null); return;
    }
    const reordered = [...links];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(dragOverIdx, 0, moved);
    setLinks(reordered);
    setDragIdx(null); setDragOverIdx(null);

    // Save new order
    await fetch("/api/links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: reordered.map(l => l.id) }),
    });
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

  if (loading) return <div className="py-8 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin" /></div>;

  return (
    <div>
      {/* Link list */}
      <div className="space-y-2">
        {links.map((link, idx) => (
          <div
            key={link.id}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={e => { e.preventDefault(); setDragOverIdx(idx); }}
            onDragEnd={handleDragEnd}
            className={`group bg-white rounded-2xl border transition-all ${
              dragOverIdx === idx && dragIdx !== idx ? "border-neutral-900 shadow-lg" :
              !link.is_visible ? "border-neutral-200 opacity-60" :
              "border-neutral-200 hover:border-neutral-300 hover:shadow-sm"
            }`}
          >
            {editingId === link.id ? (
              /* ── Edit mode ── */
              <div className="p-4 space-y-3">
                <input
                  type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  placeholder="Link title"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:bg-white"
                  autoFocus
                />
                <input
                  type="url" value={editUrl} onChange={e => setEditUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:bg-white"
                />
                {editError && <p className="text-xs text-red-600">{editError}</p>}
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(null)} className="flex-1 py-2 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors">Cancel</button>
                  <button onClick={saveEdit} disabled={editSaving} className="flex-1 py-2 text-xs font-medium text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50">{editSaving ? "Saving..." : "Save"}</button>
                </div>
              </div>
            ) : (
              /* ── View mode ── */
              <div className="flex items-center gap-3 p-3 sm:p-4">
                {/* Drag handle */}
                <div className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500 touch-none shrink-0" title="Drag to reorder">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
                </div>

                {/* Link info */}
                <div className="flex-1 min-w-0" onClick={() => startEdit(link)} role="button" tabIndex={0}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900 truncate">{link.title}</span>
                    {link.is_pinned && <span className="text-[8px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase shrink-0">Pinned</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-neutral-400 truncate">{getDomain(link.url)}</span>
                    {link.click_count > 0 && (
                      <span className="text-[10px] text-neutral-400 shrink-0 flex items-center gap-0.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round"/></svg>
                        {link.click_count}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Visibility toggle */}
                  <button
                    onClick={() => toggleVisibility(link.id, link.is_visible)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${link.is_visible ? "bg-emerald-500" : "bg-neutral-300"}`}
                    title={link.is_visible ? "Visible — click to hide" : "Hidden — click to show"}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${link.is_visible ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>

                  {/* Delete */}
                  {deleteConfirm === link.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => deleteLink(link.id)} className="px-2 py-1 text-[10px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600">Delete</button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-[10px] font-medium text-neutral-500 bg-neutral-100 rounded-lg">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(link.id)} className="p-1.5 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete link">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" strokeLinecap="round"/></svg>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {links.length === 0 && !showAdd && (
        <div className="text-center py-8 px-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round"/></svg>
          </div>
          <p className="text-sm font-semibold text-neutral-900">No links yet</p>
          <p className="text-xs text-neutral-400 mt-1">Add your first link to get started</p>
        </div>
      )}

      {/* Add link form */}
      {showAdd ? (
        <div className="mt-3 bg-white rounded-2xl border border-neutral-200 p-4 space-y-3">
          <input
            type="text" value={newTitle} onChange={e => { setNewTitle(e.target.value); setAddError(""); }}
            placeholder="Link title (e.g. My YouTube Channel)"
            className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:bg-white"
            autoFocus
            onKeyDown={e => e.key === "Enter" && document.getElementById("add-url-input")?.focus()}
          />
          <input
            id="add-url-input"
            type="url" value={newUrl} onChange={e => { setNewUrl(e.target.value); setAddError(""); }}
            placeholder="https://youtube.com/@yourchannel"
            className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:bg-white"
            onKeyDown={e => e.key === "Enter" && addLink()}
          />
          {addError && <p className="text-xs text-red-600">{addError}</p>}
          <div className="flex gap-2">
            <button onClick={() => { setShowAdd(false); setAddError(""); setNewTitle(""); setNewUrl(""); }} className="flex-1 py-2.5 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors">Cancel</button>
            <button onClick={addLink} disabled={adding} className="flex-1 py-2.5 text-xs font-medium text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50">{adding ? "Adding..." : "Add Link"}</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="w-full mt-3 py-3 text-sm font-semibold text-neutral-900 bg-white border-2 border-dashed border-neutral-300 rounded-2xl hover:border-neutral-400 hover:bg-neutral-50 transition-all flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
          Add Link
        </button>
      )}
    </div>
  );
}
