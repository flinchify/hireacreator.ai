import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
