import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DashboardContent } from "@/components/dashboard-content";

export const metadata = {
  title: "Dashboard - HireACreator.ai",
};

export default function DashboardPage() {
  return (
    <>
      <Header />
      <DashboardContent />
      <Footer />
    </>
  );
}
