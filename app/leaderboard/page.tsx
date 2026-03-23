export const revalidate = 0;

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LeaderboardContent } from "@/components/leaderboard-content";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Creator Rankings | HireACreator",
  description: "See the top-ranked creators on HireACreator, ranked by Creator Rating across all categories.",
};

export default async function LeaderboardPage() {
  let rankingsOpen = true;
  try {
    const sql = getDb();
    const rows = await sql`SELECT value FROM site_settings WHERE key = 'rankings_open'`;
    if (rows.length > 0) rankingsOpen = rows[0].value === "true";
  } catch {}

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,theme(colors.blue.100),transparent_25%)] opacity-60" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,theme(colors.blue.100),transparent_25%)] opacity-60" />
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0)_1px,transparent_0)] bg-[length:32px_32px]" />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight mb-6">
            Creator Rankings
          </h1>
          <p style={{ fontFamily: "var(--font-display)" }} className="text-lg sm:text-xl text-neutral-600 max-w-3xl mx-auto">
            {rankingsOpen
              ? "Top creators ranked by Creator Rating — a composite of profile quality, social reach, reputation, and experience."
              : "Creator Rankings are coming soon. We're onboarding creators now."}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {rankingsOpen ? (
          <LeaderboardContent />
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-500">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold text-neutral-900 mb-3">Coming Soon</h2>
            <p className="text-neutral-500 max-w-md mx-auto mb-8">
              We're onboarding creators and building the ranking system. Claim your profile now to be featured when rankings go live.
            </p>
            <a href="/claim" className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-8 py-3.5 font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all">
              Claim Your Profile
            </a>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
