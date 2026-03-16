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
      <SettingsContent />
      <Footer />
    </>
  );
}
