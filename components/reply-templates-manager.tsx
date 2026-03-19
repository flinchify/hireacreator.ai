"use client";

import { useState, useEffect } from "react";

const icons = {
  pencil: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
};

export function ReplyTemplatesManager() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "custom" });
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const inp = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 bg-white";

  useEffect(() => { loadTemplates(); }, []);

  async function loadTemplates() {
    const res = await fetch("/api/profile/reply-templates");
    if (res.ok) { const d = await res.json(); setTemplates(d.templates || []); }
    setLoading(false);
  }

  async function saveTemplate() {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    if (editingId) {
      await fetch("/api/profile/reply-templates", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, ...form }) });
    } else {
      await fetch("/api/profile/reply-templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setForm({ title: "", content: "", category: "custom" }); setShowForm(false); setEditingId(null);
    await loadTemplates();
    setSaving(false);
  }

  async function deleteTemplate(id: string) {
    await fetch(`/api/profile/reply-templates?id=${id}`, { method: "DELETE" });
    setTemplates(t => t.filter(x => x.id !== id));
    setDeleteConfirm(null);
  }

  function copyContent(t: any) {
    navigator.clipboard?.writeText(t.content);
    setCopiedId(t.id);
    setTimeout(() => setCopiedId(null), 1500);
    fetch("/api/profile/reply-templates", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: t.id, increment_use: true }) });
  }

  function startEdit(t: any) {
    setForm({ title: t.title, content: t.content, category: t.category || "custom" });
    setEditingId(t.id);
    setShowForm(true);
  }

  const categories = ["intro", "pricing", "availability", "decline", "custom"];
  const categoryLabels: Record<string, string> = { intro: "Intro", pricing: "Pricing", availability: "Availability", decline: "Decline", custom: "Custom" };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Reply Templates</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Pre-saved responses for common enquiries</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: "", content: "", category: "custom" }); }} className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors">
          {showForm ? "Cancel" : "+ New Template"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 mb-5 space-y-3">
          <div><label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Title</label><input className={inp} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Template name" /></div>
          <div><label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Category</label>
            <select className={inp} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {categories.map(c => <option key={c} value={c}>{categoryLabels[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Content</label>
            <textarea className={`${inp} resize-y`} rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder={"Hi {name},\n\nThanks for reaching out about {service}..."} />
            <p className="text-[10px] text-neutral-400 mt-1">Use {"{name}"}, {"{service}"} as placeholders</p>
          </div>
          <button onClick={saveTemplate} disabled={saving || !form.title.trim() || !form.content.trim()} className="w-full py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-40">{saving ? "Saving..." : editingId ? "Update Template" : "Create Template"}</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" /></div>
      ) : templates.length > 0 ? (
        <div className="space-y-3">
          {templates.map((t: any) => (
            <div key={t.id} className="bg-white rounded-2xl border border-neutral-200/60 p-5 hover:border-neutral-300 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-neutral-900 text-sm">{t.title}</h3>
                    {t.category && <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] font-semibold rounded-full uppercase">{t.category}</span>}
                  </div>
                  {t.use_count > 0 && <span className="text-[10px] text-neutral-400">Used {t.use_count} time{t.use_count !== 1 ? "s" : ""}</span>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => copyContent(t)} className="px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
                    {copiedId === t.id ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={() => startEdit(t)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors">
                    {icons.pencil}
                  </button>
                  {deleteConfirm === t.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => deleteTemplate(t.id)} className="px-2 py-1 text-[10px] font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100">Delete</button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-[10px] font-bold text-neutral-500 bg-neutral-50 rounded-lg hover:bg-neutral-100">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(t.id)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round"/></svg>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-neutral-500 whitespace-pre-line line-clamp-3">{t.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-10 text-center">
          <p className="text-sm text-neutral-400 mb-3">No templates yet.</p>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-800 transition-colors">Create Template</button>
        </div>
      )}
    </div>
  );
}
