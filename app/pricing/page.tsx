import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PricingContent } from "@/components/pricing-content";

export const metadata = {
  title: "Pricing - HireACreator.ai",
  description:
    "Free for creators. Transparent pricing for brands and API users. The cheapest creator marketplace.",
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
