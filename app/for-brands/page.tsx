import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ForBrandsContent } from "@/components/for-brands-content";

export const metadata = {
  title: "For Brands - HireACreator.ai",
  description:
    "Find, vet, and book verified creators in minutes. Search by niche, audience size, engagement, and budget. No more DM outreach.",
};

export default function ForBrandsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ForBrandsContent />
      <Footer />
    </div>
  );
}
