import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HomepageStatic } from "@/components/homepage-static";
import { getFeaturedCreatorsRotation, getCreatorCount } from "@/lib/queries";

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getFeaturedCreatorsRotation>> = [];
  let creatorCount = 0;
  try {
    [featured, creatorCount] = await Promise.all([
      getFeaturedCreatorsRotation(),
      getCreatorCount(),
    ]);
  } catch {
    featured = [];
    creatorCount = 0;
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <HomepageStatic featured={featured} creatorCount={creatorCount} />
      <Footer />
    </div>
  );
}
