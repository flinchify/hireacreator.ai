export const revalidate = 0;

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getCreators } from "@/lib/queries";
import { getDb } from "@/lib/db";
import { CATEGORIES } from "@/lib/types";
import type { Creator } from "@/lib/types";
import { BrowseContent } from "@/components/browse-content";
import { BrowseEmptyState } from "@/components/browse-empty-state";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  // Check if marketplace is open
  let marketplaceOpen = true;
  try {
    const sql = getDb();
    const rows = await sql`SELECT value FROM site_settings WHERE key = 'marketplace_open'`;
    if (rows.length > 0) marketplaceOpen = rows[0].value === "true";
  } catch {}

  let creators: Creator[] = [];
  if (marketplaceOpen) {
    try {
      creators = await getCreators();
    } catch {
      creators = [];
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/30" />
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0)_1px,transparent_0)] bg-[length:32px_32px]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl sm:text-5xl font-bold text-neutral-900 mb-6">
            Browse Creators
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {creators.length > 0
              ? "Discover and book creative talent for your next project."
              : "Creators are joining soon. Check back shortly."}
          </p>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">

        {!marketplaceOpen ? (
          <BrowseEmptyState />
        ) : creators.length > 0 ? (
          <BrowseContent creators={creators} categories={[...CATEGORIES]} />
        ) : (
          <BrowseEmptyState />
        )}
      </div>
      <Footer />
    </div>
  );
}
