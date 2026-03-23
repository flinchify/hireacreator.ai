"use client";

import { useState } from "react";
import { PlatformIcon } from "./icons/platforms";

interface SendOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultCreatorHandle?: string;
  defaultPlatform?: string;
}

export function SendOfferModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  defaultCreatorHandle = "",
  defaultPlatform = "instagram" 
}: SendOfferModalProps) {
  const [form, setForm] = useState({
    creator_handle: defaultCreatorHandle,
    creator_platform: defaultPlatform,
    budget: "",
    brief: "",
    deliverables: "",
    timeline_days: "14"
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.creator_handle || !form.budget || !form.brief || !form.deliverables) {
      setError("All fields are required");
      return;
    }

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({
          creator_handle: "",
          creator_platform: "instagram",
          budget: "",
          brief: "",
          deliverables: "",
          timeline_days: "14"
        });
        onClose();
        onSuccess?.();
      } else {
        setError(data.error || "Failed to send offer");
      }
    } catch (err) {
      setError("Network error - please try again");
    }
    setSending(false);
  };

  const inp = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 bg-white";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="font-display font-bold text-neutral-900">Send Offer</h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Platform and Handle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">
                Platform
              </label>
              <select
                value={form.creator_platform}
                onChange={(e) => setForm({ ...form, creator_platform: e.target.value })}
                className={inp}
                required
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="x">X (Twitter)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">
                Handle
              </label>
              <div className="relative">
                <input
                  value={form.creator_handle}
                  onChange={(e) => setForm({ ...form, creator_handle: e.target.value })}
                  className={inp}
                  placeholder="@username"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <PlatformIcon platform={form.creator_platform} size={16} className="text-neutral-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Budget and Timeline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">
                Budget ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="99999.99"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className={inp}
                placeholder="500"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">
                Timeline (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={form.timeline_days}
                onChange={(e) => setForm({ ...form, timeline_days: e.target.value })}
                className={inp}
                placeholder="14"
                required
              />
            </div>
          </div>

          {/* Brief */}
          <div>
            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">
              Brief
            </label>
            <textarea
              value={form.brief}
              onChange={(e) => setForm({ ...form, brief: e.target.value })}
              className={`${inp} resize-y`}
              rows={3}
              placeholder="Describe your campaign, target audience, key messages, brand guidelines..."
              required
            />
          </div>

          {/* Deliverables */}
          <div>
            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">
              Deliverables
            </label>
            <textarea
              value={form.deliverables}
              onChange={(e) => setForm({ ...form, deliverables: e.target.value })}
              className={`${inp} resize-y`}
              rows={3}
              placeholder="3x Instagram posts, 1x reel, story mentions, usage rights for 6 months..."
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={sending}
            className="w-full py-3 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {sending ? "Sending Offer..." : "Send Offer"}
          </button>

          {/* Terms */}
          <p className="text-xs text-neutral-400 text-center leading-relaxed">
            By sending this offer, you agree to our Terms of Service. The creator will receive your offer and can accept, decline, or counter.
          </p>
        </form>
      </div>
    </div>
  );
}