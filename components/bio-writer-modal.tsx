"use client";

import { useState, useEffect } from "react";

const icons = {
  sparkle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" strokeLinecap="round"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>,
};

export function BioWriterModal({ open, onClose, onUseBio }: { open: boolean; onClose: () => void; onUseBio: (bio: string) => void }) {
  const [bios, setBios] = useState<{ label: string; bio: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  async function generate() {
    setLoading(true);
    const res = await fetch("/api/profile/generate-bio", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setBios(data.bios || []);
      setGenerated(true);
    }
    setLoading(false);
  }

  useEffect(() => { if (open && !generated) generate(); }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" style={{ animation: "fadeIn .15s ease-out" }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-white rounded-t-2xl shadow-2xl overflow-y-auto sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full sm:rounded-2xl sm:max-h-[85vh]" style={{ animation: "slideUp .2s cubic-bezier(.16,1,.3,1)" }}>
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-5 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-2">
            {icons.sparkle}
            <h3 className="font-display font-bold text-neutral-900">AI Bio Writer</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400">{icons.close}</button>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
              <p className="text-sm text-neutral-400">Generating bios...</p>
            </div>
          ) : bios.length > 0 ? (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500">Pick a bio style. You can edit it further after selecting.</p>
              {bios.map((b, i) => (
                <div key={i} className="bg-neutral-50 rounded-2xl border border-neutral-200/60 p-4 hover:border-neutral-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{b.label}</span>
                    <button onClick={async () => { await onUseBio(b.bio); onClose(); }} className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
                      Use This
                    </button>
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{b.bio}</p>
                </div>
              ))}
              <button onClick={() => { setGenerated(false); generate(); }} className="w-full py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors">
                Regenerate
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-neutral-400 mb-3">Add some profile details (name, category, services) to generate a bio.</p>
              <button onClick={onClose} className="px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-800 transition-colors">Got it</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
