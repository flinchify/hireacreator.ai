import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Data Deletion - HireACreator.ai",
  description: "Your data has been deleted from HireACreator.",
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-2xl mx-auto px-4 pt-32 pb-20 text-center">
        <h1
          className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-6"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Data Deletion Confirmed
        </h1>
        <p className="text-neutral-600 mb-4">
          Your Instagram-connected data has been removed from HireACreator. This includes any profile information, social connections, and related data that was imported from your Instagram account.
        </p>
        <p className="text-neutral-500 text-sm">
          If you have any questions about data deletion, contact us at{" "}
          <a href="mailto:hello@hireacreator.ai" className="text-blue-600 hover:underline">
            hello@hireacreator.ai
          </a>
        </p>
      </main>
      <Footer />
    </div>
  );
}
