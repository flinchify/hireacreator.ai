import { Suspense } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DashboardContent } from "@/components/dashboard-content";

export const metadata = {
  title: "Dashboard - HireACreator.ai",
};

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f8fa] pt-24 px-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="animate-pulse bg-neutral-100 rounded-2xl h-16" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-neutral-100 rounded-2xl h-24" />
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse bg-neutral-100 rounded-2xl h-40" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
      <Footer />
    </>
  );
}
