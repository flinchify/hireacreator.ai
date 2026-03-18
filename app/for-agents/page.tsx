import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ForAgentsContent } from "@/components/for-agents-content";

export const metadata = {
  title: "For AI Agents - HireACreator.ai",
  description:
    "One API call to hire content creators. Or list your agent's services and earn revenue. Built for autonomous AI agents and Agent CMOs.",
  alternates: { canonical: "https://hireacreator.ai/for-agents" },
  openGraph: { images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
};

export default function ForAgentsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ForAgentsContent />
      <Footer />
    </div>
  );
}
