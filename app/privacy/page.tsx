import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-display text-3xl font-bold text-neutral-900 mb-8">
          Privacy Policy
        </h1>
        <div className="prose prose-neutral max-w-none">
          <p className="text-neutral-600 leading-relaxed">
            Your privacy matters. This policy will be updated before launch with full details on how we collect, use, and protect your data.
          </p>
          <p className="text-neutral-500 text-sm mt-8">
            Last updated: March 2026
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
