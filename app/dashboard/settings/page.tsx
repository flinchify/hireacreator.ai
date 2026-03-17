import { Suspense } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SettingsContent } from "@/components/settings-content";

export const metadata = {
  title: "Settings - HireACreator.ai",
};

export default function SettingsPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" /></div>}>
        <SettingsContent />
      </Suspense>
      <Footer />
    </>
  );
}
