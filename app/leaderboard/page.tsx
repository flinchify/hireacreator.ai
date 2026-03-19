export const revalidate = 0;

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LeaderboardContent } from "@/components/leaderboard-content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Creator Leaderboard | HireACreator",
  description: "See the top-ranked creators on HireACreator, ranked by Creator Score across all categories.",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-neutral-900">
            Creator Leaderboard
          </h1>
          <p className="mt-2 text-neutral-600">
            Top creators ranked by Creator Score — a composite of profile quality, social reach, reputation, and experience.
          </p>
        </div>
        <LeaderboardContent />
      </div>
      <Footer />
    </div>
  );
}
