import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "HireACreator privacy policy. Learn how we collect, use, store, and protect your personal information.",
  alternates: { canonical: "https://hireacreator.ai/privacy" },
  openGraph: { images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-neutral-400 mb-10">Last updated: 17 March 2026</p>

        <div className="prose prose-neutral prose-sm max-w-none [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-neutral-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-neutral-600 [&_p]:leading-relaxed [&_li]:text-neutral-600">

          <h2>1. Introduction</h2>
          <p>HireACreator.ai ("we", "us", "the Platform") is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights regarding your data. We comply with the Australian Privacy Act 1988 and the Australian Privacy Principles (APPs).</p>

          <h2>2. Information We Collect</h2>
          <p><strong>Account information:</strong> Name, email address, profile photo, and social media handles you choose to connect.</p>
          <p><strong>Profile information:</strong> Bio, portfolio images, videos, service listings, pricing, location, and other content you add to your profile.</p>
          <p><strong>Payment information:</strong> Processed and stored by Stripe. We do not store credit card numbers, bank account details, or full payment credentials on our servers.</p>
          <p><strong>Usage data:</strong> Pages visited, features used, device type, browser, IP address, and referral source. Collected via server logs and analytics.</p>
          <p><strong>Communications:</strong> Messages sent through the Platform between creators and brands.</p>

          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To create and manage your account</li>
            <li>To display your public profile and portfolio to other users</li>
            <li>To process payments and payouts via Stripe</li>
            <li>To send transactional emails (booking confirmations, payment receipts, verification codes)</li>
            <li>To improve the Platform and fix bugs</li>
            <li>To prevent fraud and enforce our Terms of Service</li>
            <li>To respond to support requests</li>
          </ul>

          <h2>4. Information Sharing</h2>
          <p>We do not sell your personal information. We share data only in these circumstances:</p>
          <ul>
            <li><strong>Public profiles:</strong> Creator profiles are visible to other users and search engines (unless you disable this in Privacy settings).</li>
            <li><strong>Stripe:</strong> Payment data is shared with Stripe for processing transactions. Stripe's privacy policy applies.</li>
            <li><strong>Google:</strong> If you sign in with Google OAuth, we receive your name, email, and profile photo from Google.</li>
            <li><strong>Resend:</strong> We use Resend to send transactional emails. Your email address is shared with Resend for delivery purposes only.</li>
            <li><strong>Vercel:</strong> The Platform is hosted on Vercel. Server logs may include IP addresses and request metadata.</li>
            <li><strong>Legal requirements:</strong> We may disclose information if required by law, regulation, or legal process.</li>
          </ul>

          <h2>5. Data Storage and Security</h2>
          <p>Your data is stored on Neon (PostgreSQL database) and Vercel (hosting and blob storage), both hosted in the United States. We use encrypted connections (TLS/SSL), hashed passwords (PBKDF2-SHA512), and secure session tokens. We do not store payment card details.</p>

          <h2>6. Cookies</h2>
          <p>We use essential cookies for:</p>
          <ul>
            <li><strong>session_token:</strong> Keeps you logged in. HttpOnly, secure, expires when your session ends.</li>
            <li><strong>hca_ref:</strong> Tracks referral attribution. Expires after 30 days.</li>
          </ul>
          <p>We do not use third-party tracking cookies or advertising cookies.</p>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access</strong> your personal data via your dashboard and settings page</li>
            <li><strong>Correct</strong> inaccurate information by editing your profile</li>
            <li><strong>Delete</strong> your account and all associated data through Settings &gt; Account &gt; Danger Zone</li>
            <li><strong>Control visibility</strong> of your profile, email, location, and earnings via Privacy settings</li>
            <li><strong>Withdraw consent</strong> for marketing communications at any time</li>
            <li><strong>Request a copy</strong> of your data by contacting us</li>
          </ul>

          <h2>8. Data Retention</h2>
          <p>We retain your account data for as long as your account is active. If you delete your account, we remove your personal data within 30 days, except where retention is required by law (e.g., payment records for tax compliance, which are retained for 7 years).</p>

          <h2>9. Children's Privacy</h2>
          <p>The Platform is not intended for users under 18. We do not knowingly collect information from minors. If we become aware that a user is under 18, we will delete their account.</p>

          <h2>10. International Data Transfers</h2>
          <p>Your data may be transferred to and stored in the United States (where our hosting providers operate). By using the Platform, you consent to this transfer. We ensure appropriate safeguards are in place as required by the Australian Privacy Act.</p>

          <h2>11. Changes to This Policy</h2>
          <p>We may update this policy from time to time. We will notify you of material changes via email or a notice on the Platform. Your continued use after changes constitutes acceptance.</p>

          <h2>12. Contact</h2>
          <p>For privacy-related questions or data requests, contact us at <a href="mailto:hello@hireacreator.ai" className="text-neutral-900 underline">hello@hireacreator.ai</a>.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
