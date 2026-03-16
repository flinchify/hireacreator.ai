import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getCreators } from "@/lib/queries";
import { CATEGORIES } from "@/lib/types";
import type { Creator } from "@/lib/types";
import { BrowseContent } from "@/components/browse-content";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-neutral-400"
              >
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-1">
              No creators yet
            </h3>
            <p className="text-sm text-neutral-500 mb-6">
              Be the first to join and get featured to every brand on the platform.
            </p>
            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Join as a Creator
            </a>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
