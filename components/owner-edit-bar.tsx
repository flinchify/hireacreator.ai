"use client";

import { useState } from "react";
import Link from "next/link";

export function OwnerEditBar({ slug }: { slug: string }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-xl border border-neutral-200 rounded-full shadow-lg shadow-black/10" style={{ animation: "slideDown 0.3s ease-out" }}>
      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
        Viewing as owner
      </div>
      <div className="w-px h-4 bg-neutral-200" />
      <Link
        href={`/u/${slug}/edit`}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Edit Page
      </Link>
      <Link href="/dashboard" className="px-2.5 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors">
        Dashboard
      </Link>
      <button onClick={() => setDismissed(true)} className="p-1 text-neutral-300 hover:text-neutral-500 rounded-full" aria-label="Dismiss">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
      </button>
      <style>{`@keyframes slideDown { from { opacity: 0; transform: translate(-50%, -10px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
    </div>
  );
}
