import { Header } from "@/components/header";
import { DashboardContent } from "@/components/dashboard-content";

export const metadata = {
  title: "Dashboard - HireACreator.ai",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <DashboardContent />
    </div>
  );
}
