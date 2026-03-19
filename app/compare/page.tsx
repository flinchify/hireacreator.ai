import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare HireACreator vs Fiverr, Upwork, Linktree",
  description: "See how HireACreator compares to Fiverr, Upwork, and Linktree. 0% creator commission, free link-in-bio, direct booking, and AI agent API.",
};

const COMPARISONS = [
  { slug: "fiverr", name: "Fiverr", tagline: "0% fees vs 20% commission", color: "bg-emerald-50 border-emerald-100" },
  { slug: "upwork", name: "Upwork", tagline: "Built for creators, not generic freelancers", color: "bg-blue-50 border-blue-100" },
  { slug: "linktree", name: "Linktree", tagline: "Link-in-bio that makes money", color: "bg-purple-50 border-purple-100" },
];

export default function ComparePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-20">
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
        How HireACreator compares
      </h1>
      <p className="mt-3 text-lg text-neutral-500">
        See why creators and brands are choosing HireACreator over the alternatives.
      </p>

      <div className="mt-10 space-y-4">
        {COMPARISONS.map(c => (
          <Link key={c.slug} href={`/compare/${c.slug}`} className={`block p-6 rounded-2xl border ${c.color} hover:shadow-md transition-all group`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-neutral-900 group-hover:text-neutral-700">HireACreator vs {c.name}</h2>
                <p className="mt-1 text-sm text-neutral-500">{c.tagline}</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400 group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </Link>
        ))}
      </div>
      <p className="text-xs text-neutral-400 text-center max-w-2xl mx-auto mt-12 px-4">
        Fiverr is a registered trademark of Fiverr International Ltd. Upwork is a registered trademark of Upwork Inc. Linktree is a registered trademark of Linktree Pty Ltd. HireACreator is not affiliated with, endorsed by, or sponsored by any of these companies. Comparisons are based on publicly available information as of March 2026.
      </p>
    </main>
  );
}
