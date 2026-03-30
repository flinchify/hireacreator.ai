"use client";

import { useState } from "react";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-neutral-100 rounded-xl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 font-medium text-neutral-800 text-sm flex justify-between items-center hover:bg-neutral-50 rounded-xl transition-colors min-h-[48px] text-left"
      >
        {q}
        <svg
          className={`w-5 h-5 text-neutral-400 transition-transform shrink-0 ml-2 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-neutral-500 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

export function FaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <FaqItem key={faq.q} q={faq.q} a={faq.a} />
      ))}
    </div>
  );
}
