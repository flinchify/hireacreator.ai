import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnimationsContent } from "@/components/animations-content";

export const metadata = {
  title: "Animations Marketplace - HireACreator.ai",
  description: "Custom intro animations for your link in bio. Make your page unforgettable when someone visits.",
};

export default function AnimationsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <AnimationsContent />
      <Footer />
    </div>
  );
}
