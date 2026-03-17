import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "HireACreator terms of service. Read our terms covering platform use, payments, creator rights, brand obligations, and referral program.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-neutral-400 mb-10">Last updated: 17 March 2026</p>

        <div className="prose prose-neutral prose-sm max-w-none [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-neutral-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-neutral-600 [&_p]:leading-relaxed [&_li]:text-neutral-600">

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using HireACreator.ai ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. We may update these terms at any time; continued use constitutes acceptance of the revised terms.</p>

          <h2>2. Eligibility</h2>
          <p>You must be at least 18 years old (or the age of majority in your jurisdiction) to create an account. By registering, you represent that the information you provide is accurate and complete.</p>

          <h2>3. Account Types</h2>
          <p><strong>Creators</strong> list services, set their own prices, and receive bookings from brands. Creators pay 0% commission on all earnings.</p>
          <p><strong>Brands</strong> search, discover, and book creators. Brands pay a service fee on bookings (10% standard, 5% for Enterprise plans).</p>
          <p><strong>Agents</strong> access the Platform programmatically via API. Agent accounts must verify domain ownership before performing write operations.</p>

          <h2>4. Creator Terms</h2>
          <ul>
            <li>Creators retain full ownership of their intellectual property unless explicitly transferred in a booking agreement.</li>
            <li>Creators set their own prices. HireACreator does not set, suggest, or cap pricing.</li>
            <li>Creators are responsible for delivering work as described in their service listings.</li>
            <li>Creators must not misrepresent their skills, portfolio, or availability.</li>
            <li>Creators receive payouts via Stripe Connect. By using the Platform, creators agree to Stripe's terms of service.</li>
          </ul>

          <h2>5. Brand Terms</h2>
          <ul>
            <li>Brands agree to pay the listed price plus applicable service fees at the time of booking.</li>
            <li>Payments are held in escrow via Stripe until the creator delivers the agreed work.</li>
            <li>Brands must not request work outside the scope of the original booking without a new agreement.</li>
            <li>Brands are responsible for providing clear briefs and timely feedback.</li>
          </ul>

          <h2>6. Payments and Fees</h2>
          <p>All payments are processed through Stripe. By using the Platform, you agree to Stripe's terms of service and privacy policy.</p>
          <ul>
            <li><strong>Creator commission:</strong> 0% — creators keep 100% of their earnings.</li>
            <li><strong>Brand service fee:</strong> 10% on top of the creator's price (5% for Enterprise plan subscribers).</li>
            <li><strong>Subscriptions:</strong> Creator Pro ($19/mo), Creator Business ($49/mo), Brand Analytics ($199/mo), Brand Enterprise ($999/mo), API Pro ($49/mo).</li>
            <li><strong>Boosted Listings:</strong> $10/week, optional, auto-renewing.</li>
            <li><strong>Profile Animations:</strong> $4.99 per animation, one-time purchase.</li>
          </ul>
          <p>Refunds are handled on a case-by-case basis. If a creator fails to deliver, the brand may request a refund through the Platform.</p>

          <h2>7. Escrow and Disputes</h2>
          <p>Booking payments are held in escrow until the creator delivers the agreed work and the brand approves it. If a dispute arises, HireACreator will review the case and make a determination. Our decision is final.</p>

          <h2>8. Referral Program</h2>
          <ul>
            <li>Referrers earn 20% of each subscription payment made by their referred users, credited as platform credits.</li>
            <li>Credits are earned for up to 12 months from the date the referred user signs up.</li>
            <li>Platform credits can be used toward subscriptions, animations, boosted listings, and other platform services.</li>
            <li>Credits are non-transferable, non-refundable, and hold no cash value.</li>
            <li>Self-referrals, fraudulent signups, or referral manipulation will result in forfeiture of all earned credits and potential account suspension.</li>
            <li>HireACreator reserves the right to modify, suspend, or discontinue the referral program at any time.</li>
            <li>Existing earned credits will be honored for 90 days following any program changes, unless forfeited due to policy violations.</li>
          </ul>

          <h2>9. Prohibited Conduct</h2>
          <ul>
            <li>You may not use the Platform for any unlawful purpose.</li>
            <li>You may not circumvent Platform fees by arranging off-platform payments.</li>
            <li>You may not create fake accounts, fake reviews, or manipulate search rankings.</li>
            <li>You may not harass, abuse, or threaten other users.</li>
            <li>You may not scrape, crawl, or collect data from the Platform without authorization.</li>
            <li>You may not upload malicious content, malware, or infringing material.</li>
          </ul>

          <h2>10. Intellectual Property</h2>
          <p>The HireACreator name, logo, and platform design are the property of HireACreator. You may not use our branding without written permission. User-generated content (profiles, portfolios, reviews) remains the property of the respective users.</p>

          <h2>11. Account Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraud, or harm the Platform community. You may delete your account at any time through your Settings page.</p>

          <h2>12. Limitation of Liability</h2>
          <p>HireACreator is provided "as is" without warranty. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability is limited to the amount you have paid to us in the 12 months preceding the claim.</p>

          <h2>13. Governing Law</h2>
          <p>These terms are governed by the laws of New South Wales, Australia. Any disputes will be resolved in the courts of New South Wales.</p>

          <h2>14. Contact</h2>
          <p>Questions about these terms? Contact us at <a href="mailto:hello@hireacreator.ai" className="text-neutral-900 underline">hello@hireacreator.ai</a>.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
