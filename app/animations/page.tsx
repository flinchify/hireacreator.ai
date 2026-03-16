import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnimationsContent } from "@/components/animations-content";

export const metadata = {
  title: "Animations Marketplace - HireACreator.ai",
  description: "Custom AI-generated intro animations for your creator profile. Make your profile unforgettable.",
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
