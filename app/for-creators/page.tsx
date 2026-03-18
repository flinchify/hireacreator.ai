import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ForCreatorsContent } from "@/components/for-creators-content";

export const metadata = {
  title: "For Creators - HireACreator.ai",
  description:
    "Build your creator storefront, list services, connect socials, and get booked by brands. Zero platform fees. Always.",
  alternates: { canonical: "https://hireacreator.ai/for-creators" },
  openGraph: { images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
};

export default function ForCreatorsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ForCreatorsContent />
      <Footer />
    </div>
  );
}
