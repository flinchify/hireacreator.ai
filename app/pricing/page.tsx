import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PricingContent } from "@/components/pricing-content";

export const metadata = {
  title: "Pricing - HireACreator.ai",
  description:
    "Free for creators. Transparent pricing for brands and API users. The cheapest creator marketplace.",
  alternates: { canonical: "https://hireacreator.ai/pricing" },
  openGraph: { images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PricingContent />
      <Footer />
    </div>
  );
}
