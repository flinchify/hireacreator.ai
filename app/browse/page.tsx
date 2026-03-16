import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getCreators } from "@/lib/queries";
import { CATEGORIES } from "@/lib/types";
import type { Creator } from "@/lib/types";
import { BrowseContent } from "@/components/browse-content";
import { BrowseEmptyState } from "@/components/browse-empty-state";

export default async function BrowsePage() {
  let creators: Creator[] = [];
  try {
    creators = await getCreators();
  } catch {
    creators = [];
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-neutral-900">
            Browse Creators
          </h1>
          <p className="mt-2 text-neutral-600">
            {creators.length > 0
              ? "Discover and book creative talent for your next project."
              : "Creators are joining soon. Check back shortly."}
          </p>
        </div>

        {creators.length > 0 ? (
          <BrowseContent creators={creators} categories={[...CATEGORIES]} />
        ) : (
          <BrowseEmptyState />
        )}
      </div>
      <Footer />
    </div>
  );
}
