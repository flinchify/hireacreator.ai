"use client";

import { useState } from "react";

export type AIDesignResult = {
  template: string;
  bgType: string;
  bgValue: string;
  textColor: string;
  buttonShape: string;
  font: string;
  accent: string;
  suggestedHeadline?: string;
};

interface AiDesignModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (design: AIDesignResult) => void;
  targetUserId?: string; // Admin mode: design for another user
}

export function AiDesignModal({ open, onClose, onApply, targetUserId }: AiDesignModalProps) {
  const [urls, setUrls] = useState(["", "", ""]);
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  if (!open) return null;

  function updateUrl(index: number, value: string) {
    const next = [...urls];
    next[index] = value;
    setUrls(next);
  }

  async function generate() {
    setGenerating(true);
    setError("");
    setResult(null);
    try {
      const referenceUrls = urls.filter(u => u.trim());
      const res = await fetch("/api/profile/ai-design-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceUrls,
          brandDescription: description.trim() || undefined,
          targetUserId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Design generation failed");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    }
    setGenerating(false);
  }

  function apply() {
    if (!result?.design) return;
    onApply(result.design);
    handleClose();
  }

  function handleClose() {
    setUrls(["", "", ""]);
    setDescription("");
    setResult(null);
    setError("");
    onClose();
  }

  const inp = "w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 text-neutral-900 bg-white placeholder:text-neutral-400 min-h-[48px]";

  return (
    <div className="fixed inset-0 z-[60]" style={{ animation: "fadeIn .15s ease-out" }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[92vh] bg-white rounded-t-2xl shadow-2xl overflow-y-auto sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full sm:rounded-2xl sm:max-h-[85vh]"
        style={{ animation: "slideUp .2s cubic-bezier(.16,1,.3,1)" }}
      >
        {/* Mobile handle */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-10 h-1 rounded-full bg-neutral-300" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-5 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div>
            <h3 className="font-bold text-neutral-900">AI Page Designer</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Add references for a custom-branded design</p>
          </div>
          <button onClick={handleClose} className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {!result ? (
            <>
              {/* Reference URLs */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block mb-2">Reference URLs</label>
                <p className="text-xs text-neutral-400 mb-3">Add your brand website, social profiles, or pages that inspire you. We extract colors, fonts, and style.</p>
                <div className="space-y-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
                    </span>
                    <input
                      value={urls[0]}
                      onChange={e => updateUrl(0, e.target.value)}
                      placeholder="Brand website (e.g. nike.com)"
                      className={`${inp} pl-10`}
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                    </span>
                    <input
                      value={urls[1]}
                      onChange={e => updateUrl(1, e.target.value)}
                      placeholder="Social profile URL (optional)"
                      className={`${inp} pl-10`}
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    </span>
                    <input
                      value={urls[2]}
                      onChange={e => updateUrl(2, e.target.value)}
                      placeholder="Inspiration page (optional)"
                      className={`${inp} pl-10`}
                    />
                  </div>
                </div>
              </div>

              {/* Brand description */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block mb-2">Describe your style (optional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Dark and minimal with blue accents, professional but creative..."
                  rows={3}
                  className={`${inp} resize-none`}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">{error}</div>
              )}

              {/* Generate button */}
              <button
                onClick={generate}
                disabled={generating}
                className="w-full py-3.5 font-semibold text-sm text-white rounded-xl transition-all hover:scale-[1.01] disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)" }}
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing references and generating design...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
                    Generate Custom Design
                  </>
                )}
              </button>

              {/* Quick design option */}
              <p className="text-xs text-neutral-400 text-center">
                No references? We will design based on your profile and social data.
              </p>
            </>
          ) : (
            <>
              {/* Design Preview */}
              <div className="bg-neutral-50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" /><path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span className="text-sm font-semibold text-emerald-700">Design generated</span>
                  {result.extractedFrom > 0 && (
                    <span className="text-xs text-neutral-400">from {result.extractedFrom} reference{result.extractedFrom > 1 ? "s" : ""}</span>
                  )}
                </div>

                {/* Preview card */}
                <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
                  <div className="h-32 relative" style={{ background: result.design.bgValue || "#f5f5f5" }}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm border border-white/40" />
                      <div className="mt-2 text-xs font-semibold" style={{ color: result.design.textColor || "#171717" }}>Preview</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                        Template: {result.design.template}
                      </span>
                      <span className="text-[10px] font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                        Font: {result.design.font}
                      </span>
                      <span className="text-[10px] font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                        Buttons: {result.design.buttonShape}
                      </span>
                      {result.niche && (
                        <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          {result.niche}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-lg border border-neutral-200" style={{ background: result.design.accent || "#3b82f6" }} title="Brand color" />
                      <div className="w-6 h-6 rounded-lg border border-neutral-200" style={{ background: result.design.textColor || "#171717" }} title="Text color" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={apply}
                  className="flex-1 py-3 font-semibold text-sm text-white rounded-xl transition-all hover:scale-[1.01]"
                  style={{ background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)" }}
                >
                  Apply This Design
                </button>
                <button
                  onClick={() => { setResult(null); setError(""); }}
                  className="px-5 py-3 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Regenerate
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(100%) } to { opacity: 1; transform: translateY(0) } }
        @media (min-width: 640px) { @keyframes slideUp { from { opacity: 0; transform: translate(-50%, -48%) scale(.97) } to { opacity: 1; transform: translate(-50%, -50%) scale(1) } } }
      `}</style>
    </div>
  );
}
