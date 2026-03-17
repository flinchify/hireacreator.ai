import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-display text-3xl font-bold text-neutral-900 mb-8">
          Terms of Service
        </h1>
        <div className="prose prose-neutral max-w-none">
          <p className="text-neutral-600 leading-relaxed">
            These terms of service will be updated before launch. By using HireACreator, you agree to abide by the terms outlined here once published.
          </p>

          <h2 className="font-display text-xl font-bold text-neutral-900 mt-10 mb-4">Referral Program</h2>
          <div className="text-neutral-600 leading-relaxed space-y-3 text-sm">
            <p>HireACreator offers a referral program that allows users to earn platform credits by referring new users to the platform.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Referrers earn 20% of each subscription payment made by their referred users, credited as platform credits.</li>
              <li>Credits are earned for up to 12 months from the date the referred user signs up.</li>
              <li>Platform credits can be used toward HireACreator subscriptions, profile animations, boosted listings, and other platform services.</li>
              <li>Credits are non-transferable, non-refundable, and hold no cash value. Credits cannot be withdrawn as cash or converted to any form of currency.</li>
              <li>Self-referrals, fraudulent signups, or any form of referral manipulation will result in forfeiture of all earned credits and potential account suspension.</li>
              <li>HireACreator reserves the right to modify, suspend, or discontinue the referral program at any time, with or without notice. Changes may include adjustments to commission rates, credit terms, eligibility criteria, or program structure.</li>
              <li>Existing earned credits will be honored for 90 days following any program changes, unless forfeited due to policy violations.</li>
            </ul>
          </div>

          <p className="text-neutral-500 text-sm mt-8">
            Last updated: March 2026
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
