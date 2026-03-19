"use client";

import { useAuth } from "./auth-context";
import { Button } from "./ui/button";
import { useState, useEffect, useRef, FormEvent } from "react";

const BUDGET_OPTIONS = [
  "Select budget",
  "Under $500",
  "$500 - $1,000",
  "$1,000 - $5,000",
  "$5,000 - $10,000",
  "$10,000+",
];

const PROJECT_TYPE_OPTIONS = [
  "Select type",
  "UGC Content",
  "Social Media Management",
  "Video Editing",
  "Photography",
  "Voiceover",
  "Graphic Design",
  "Web Development",
  "Other",
];

// ─── Enquire Modal ──────────────────────────────────────────────────
function EnquireModal({
  creatorName,
  creatorId,
  open,
  onClose,
}: {
  creatorName: string;
  creatorId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const backdropRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("Select budget");
  const [projectType, setProjectType] = useState("Select type");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill from auth
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setSent(false);
      setError("");
      setMessage("");
      setBudget("Select budget");
      setProjectType("Select type");
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId,
          name: name.trim(),
          email: email.trim(),
          budget: budget === "Select budget" ? undefined : budget,
          projectType: projectType === "Select type" ? undefined : projectType,
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="font-display text-lg font-semibold text-neutral-900">
            {sent ? "Enquiry sent" : `Enquire about working with ${creatorName.split(" ")[0]}`}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-neutral-500"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
          </button>
        </div>

        {sent ? (
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              Your enquiry has been sent to {creatorName.split(" ")[0]}. They&apos;ll reply directly to your email.
            </p>
            <Button onClick={onClose} variant="outline" size="sm">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-neutral-700">Your name *</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-0 focus:outline-none transition-colors"
                  placeholder="Jane Smith"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-neutral-700">Your email *</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-0 focus:outline-none transition-colors"
                  placeholder="jane@company.com"
                  required
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-neutral-700">Budget range</span>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:ring-0 focus:outline-none transition-colors bg-white"
                >
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-neutral-700">Project type</span>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:ring-0 focus:outline-none transition-colors bg-white"
                >
                  {PROJECT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">Message *</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-0 focus:outline-none transition-colors resize-none"
                placeholder="Tell them about your project, timeline, and what you're looking for..."
                required
              />
            </label>

            <Button type="submit" className="w-full" size="lg" disabled={sending}>
              {sending ? "Sending..." : "Send Enquiry"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Hero action buttons ────────────────────────────────────────────
export function CreatorHeroActions({
  hasServices,
  creatorName,
  creatorId,
}: {
  hasServices: boolean;
  creatorName: string;
  creatorId: string;
}) {
  const [enquireOpen, setEnquireOpen] = useState(false);

  function handleBook() {
    document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <div className="mt-4 sm:mt-0 sm:pb-2 flex gap-3">
        {hasServices && (
          <Button size="lg" className="shadow-lg shadow-neutral-900/20 hover:scale-105 transition-transform" onClick={handleBook}>
            Book Now
          </Button>
        )}
        <Button variant="outline" size="lg" className="hover:scale-105 transition-transform" onClick={() => setEnquireOpen(true)}>
          Enquire
        </Button>
      </div>
      <EnquireModal creatorName={creatorName} creatorId={creatorId} open={enquireOpen} onClose={() => setEnquireOpen(false)} />
    </>
  );
}

// Service card book/contact button — auth-gated
export function ServiceAction({ serviceId, price, creatorId }: { serviceId: string; price: number; creatorId?: string }) {
  const { user, openLogin } = useAuth();

  async function handleBook() {
    if (!user) {
      openLogin();
      return;
    }

    if (price === 0 && creatorId) {
      window.location.href = "/contact";
      return;
    }

    const res = await fetch("/api/checkout/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else if (data.error === "unauthorized") {
      openLogin();
    } else if (data.error) {
      alert(data.message || "Something went wrong.");
    }
  }

  return (
    <Button
      onClick={handleBook}
      className="w-full mt-3 hover:scale-[1.02] transition-transform"
      size="sm"
    >
      {price === 0 ? "Contact Creator" : `Book — $${price.toLocaleString()}`}
    </Button>
  );
}

// Service card with tiered packages — tabbed interface
export function ServiceCardWithPackages({ service }: { service: { id: string; title: string; description: string; price: number; deliveryDays: number; category?: string; packages?: { id: string; tier: string; title: string; price: number; deliveryDays: number; revisions: number; features: string[] }[] } }) {
  const { user, openLogin } = useAuth();
  const pkgs = service.packages || [];
  const tiers = ["basic", "standard", "premium"] as const;
  const availableTiers = tiers.filter(t => pkgs.some(p => p.tier === t));
  const [activeTier, setActiveTier] = useState(availableTiers[0] || "basic");

  const activePkg = pkgs.find(p => p.tier === activeTier);

  async function handleBook() {
    if (!user) { openLogin(); return; }
    const price = activePkg ? activePkg.price : service.price;
    if (price === 0) { window.location.href = "/contact"; return; }

    const res = await fetch("/api/checkout/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId: service.id, packageId: activePkg?.id }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else if (data.error === "unauthorized") openLogin();
    else if (data.error) alert(data.message || "Something went wrong.");
  }

  if (pkgs.length === 0) return null; // fallback to default rendering

  const displayPrice = activePkg?.price ?? service.price;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-0 overflow-hidden hover:border-neutral-300 hover:shadow-sm transition-all">
      <h3 className="font-semibold text-neutral-900 px-5 pt-5 pb-2">{service.title}</h3>
      {service.category && <span className="inline-block mx-5 mb-2 text-[10px] font-medium text-neutral-400 uppercase tracking-wider">{service.category}</span>}

      {/* Tier tabs */}
      <div className="flex border-b border-neutral-100 mx-5">
        {availableTiers.map(tier => (
          <button
            key={tier}
            onClick={() => setActiveTier(tier)}
            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${activeTier === tier ? "text-neutral-900 border-neutral-900" : "text-neutral-400 border-transparent hover:text-neutral-600"}`}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* Active package details */}
      {activePkg && (
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-xl font-bold text-neutral-900">
              {activePkg.price === 0 ? "Open to offers" : `$${activePkg.price.toLocaleString()}`}
            </span>
          </div>
          <p className="text-sm font-medium text-neutral-700">{activePkg.title}</p>
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg>
              {activePkg.deliveryDays} day delivery
            </span>
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {activePkg.revisions} revision{activePkg.revisions !== 1 ? "s" : ""}
            </span>
          </div>
          {activePkg.features.length > 0 && (
            <ul className="space-y-1.5">
              {activePkg.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500 shrink-0 mt-0.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="px-5 pb-5">
        <Button onClick={handleBook} className="w-full hover:scale-[1.02] transition-transform" size="sm">
          {displayPrice === 0 ? "Contact Creator" : `Book — $${displayPrice.toLocaleString()}`}
        </Button>
      </div>
    </div>
  );
}

// Contact button when no services listed — opens Enquire modal
export function ContactCreatorButton({ creatorName, creatorId }: { creatorName: string; creatorId: string }) {
  const [enquireOpen, setEnquireOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setEnquireOpen(true)} variant="outline" className="w-full" size="sm">
        Enquire with {creatorName.split(" ")[0]}
      </Button>
      <EnquireModal creatorName={creatorName} creatorId={creatorId} open={enquireOpen} onClose={() => setEnquireOpen(false)} />
    </>
  );
}

// Boost Profile button — only shows on own profile
export function BoostProfileButton({ creatorId }: { creatorId: string }) {
  const { user } = useAuth();

  if (!user || user.id !== creatorId) return null;

  async function handleBoost() {
    const res = await fetch("/api/checkout/boost", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else if (data.error) alert(data.message || "Could not start checkout.");
  }

  return (
    <button
      onClick={handleBoost}
      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
      style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/></svg>
      Boost Profile — $4.99/week
    </button>
  );
}

// 18+ content warning overlay
export function AgeWarningOverlay({ creatorName, onAccept }: { creatorName: string; onAccept: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-black text-amber-600">18+</span>
        </div>
        <h2 className="text-lg font-bold text-neutral-900 mb-2">Mature Content Warning</h2>
        <p className="text-sm text-neutral-500 mb-6">
          {creatorName} has indicated their profile may contain content or links
          not intended for users under 18. By continuing, you confirm you are 18
          years or older.
        </p>
        <div className="flex gap-3">
          <a href="/" className="flex-1 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-full text-center hover:bg-neutral-200">Go Back</a>
          <button onClick={onAccept} className="flex-1 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800">
            I am 18+, Continue
          </button>
        </div>
      </div>
    </div>
  );
}
