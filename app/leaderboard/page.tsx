export const revalidate = 0;

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LeaderboardContent } from "@/components/leaderboard-content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Creator Rankings | HireACreator",
  description: "See the top-ranked creators on HireACreator, ranked by Creator Rating across all categories.",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24">
        {/* Blue gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,theme(colors.blue.100),transparent_25%)] opacity-60" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,theme(colors.blue.100),transparent_25%)] opacity-60" />
          {/* Dot grid pattern */}
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0)_1px,transparent_0)] bg-[length:32px_32px]" />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight mb-6">
            Creator Rankings
          </h1>
          <p style={{ fontFamily: "var(--font-display)" }} className="text-lg sm:text-xl text-neutral-600 max-w-3xl mx-auto">
            Top creators ranked by Creator Rating — a composite of profile quality, social reach, reputation, and experience.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <LeaderboardContent />
      </div>
      <Footer />
    </div>
  );
}
