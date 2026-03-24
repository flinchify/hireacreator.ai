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
        <p className="text-sm text-neutral-400 mb-10">Last updated: 24 March 2026</p>

        <div className="prose prose-neutral prose-sm max-w-none [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-neutral-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-neutral-600 [&_p]:leading-relaxed [&_li]:text-neutral-600">

          <h2>1. Introduction</h2>
          <p>HireACreator.ai (&quot;we&quot;, &quot;us&quot;, &quot;the Platform&quot;) is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights regarding your data. We comply with the Australian Privacy Act 1988 and the Australian Privacy Principles (APPs).</p>

          <h2>2. Information We Collect</h2>
          <p>We collect the following categories of information:</p>
          <ul>
            <li><strong>Account information:</strong> Name, email address, and profile photo (provided via Google OAuth sign-in or direct upload).</li>
            <li><strong>Social media handles and public profile URLs:</strong> Instagram, TikTok, YouTube, and Twitter accounts you connect to your profile.</li>
            <li><strong>Public social media data:</strong> Follower counts, engagement metrics, and audience demographics scraped from your public profiles via ScrapingBee.</li>
            <li><strong>Avatar images:</strong> Profile images retrieved from connected social media platforms.</li>
            <li><strong>Profile content:</strong> Bio, portfolio content, service listings, pricing, and location information you add to your profile.</li>
            <li><strong>Payment information:</strong> Processed and stored by Stripe. We do not store credit card numbers, bank account details, or full payment credentials on our servers.</li>
            <li><strong>Usage data:</strong> Pages visited, features used, device type, browser, IP address, and referral source.</li>
            <li><strong>Communications:</strong> Messages sent through the Platform between creators and brands.</li>
          </ul>

          <h2>3. Why We Collect Your Information (Lawful Basis)</h2>
          <p>We rely on the following lawful bases for collecting and processing your personal information:</p>
          <ul>
            <li><strong>Consent (on signup):</strong> Account creation, profile building, and marketing communications. You provide consent when you create an account and agree to this policy.</li>
            <li><strong>Legitimate interest:</strong> Scraping publicly available social media data to build and maintain accurate marketplace profiles, and improving the Platform{"'"}s features and user experience.</li>
            <li><strong>Contractual necessity:</strong> Processing payments, managing bookings, and facilitating creator-brand relationships as part of the services we provide.</li>
            <li><strong>Legal obligation:</strong> Retaining payment records for tax compliance as required by Australian law.</li>
          </ul>

          <h2>4. How We Use Your Information</h2>
          <ul>
            <li>To create and manage your account</li>
            <li>To display your public profile and portfolio to other users</li>
            <li>To process payments and payouts via Stripe</li>
            <li>To send transactional emails (booking confirmations, payment receipts, verification codes)</li>
            <li>To match creators with brands using AI-assisted marketplace matching</li>
            <li>To improve the Platform and fix bugs</li>
            <li>To prevent fraud and enforce our Terms of Service</li>
            <li>To respond to support requests</li>
          </ul>

          <h2>5. AI and Public Data Usage</h2>
          <p>Public social media data — including follower counts, bio information, posts, and engagement metrics — is scraped using ScrapingBee to build and update creator profiles on the Platform. This data is used for:</p>
          <ul>
            <li><strong>Profile creation:</strong> Automatically populating your creator profile with publicly available information.</li>
            <li><strong>Marketplace matching:</strong> Connecting creators with relevant brands based on audience data and content style.</li>
            <li><strong>Pricing suggestions:</strong> Providing data-informed pricing recommendations based on audience size and engagement.</li>
            <li><strong>Quality scoring:</strong> Assessing profile completeness and engagement quality to help brands find the right creators.</li>
          </ul>
          <p>You can opt out of public data scraping at any time via your Settings page. Please note that opting out will limit your profile completeness and matching accuracy.</p>
          <p>We do not use creator content for AI or machine learning model training.</p>

          <h2>6. Information Sharing</h2>
          <p>We do not sell your personal information. We share data only in the following circumstances:</p>
          <ul>
            <li><strong>Public profiles:</strong> Creator profiles are visible to other users and search engines unless you disable this in your Privacy settings.</li>
            <li><strong>Stripe:</strong> Payment data is shared with Stripe for processing transactions. Stripe{"'"}s privacy policy applies.</li>
            <li><strong>ScrapingBee:</strong> Public social profile URLs are shared with ScrapingBee for the purpose of collecting publicly available profile data.</li>
            <li><strong>Google:</strong> If you sign in with Google OAuth, we receive your name, email, and profile photo from Google.</li>
            <li><strong>Resend:</strong> We use Resend to send transactional emails. Your email address is shared with Resend for delivery purposes only.</li>
            <li><strong>Vercel:</strong> The Platform is hosted on Vercel. Server logs may include IP addresses and request metadata.</li>
            <li><strong>Legal requirements:</strong> We may disclose information if required by law, regulation, or legal process.</li>
          </ul>

          <h2>7. Data Storage and Security</h2>
          <p>Your data is stored on Neon (PostgreSQL database) and Vercel (hosting and blob storage), both hosted in the United States. We use encrypted connections (TLS/SSL), hashed passwords (PBKDF2-SHA512), and secure session tokens to protect your data. We do not store payment card details on our servers.</p>

          <h2>8. Data Retention</h2>
          <ul>
            <li><strong>Active accounts:</strong> Your data is retained for as long as your account remains active.</li>
            <li><strong>Deleted accounts:</strong> Personal data is removed within 30 days of account deletion.</li>
            <li><strong>Payment records:</strong> Retained for 7 years for tax compliance as required by the Australian Taxation Office.</li>
            <li><strong>Usage logs:</strong> Retained for 12 months.</li>
            <li><strong>Messages:</strong> Retained for 30 days after account deletion, then permanently removed.</li>
          </ul>

          <h2>9. Cookies</h2>
          <p>We use essential cookies only:</p>
          <ul>
            <li><strong>session_token:</strong> Keeps you logged in. HttpOnly, secure, expires when your session ends.</li>
            <li><strong>hca_ref:</strong> Tracks referral attribution. Expires after 30 days.</li>
          </ul>
          <p>We do not use third-party tracking cookies or advertising cookies. We do not currently have a separate cookie policy page — all cookie information is covered in this section.</p>

          <h2>10. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access</strong> your personal data via your dashboard and settings page.</li>
            <li><strong>Correct</strong> inaccurate information by editing your profile.</li>
            <li><strong>Delete</strong> your account and all associated data through Settings &gt; Account &gt; Danger Zone.</li>
            <li><strong>Data portability:</strong> Request a machine-readable copy of your data by contacting us.</li>
            <li><strong>Control visibility</strong> of your profile, email, location, and earnings via Privacy settings.</li>
            <li><strong>Opt out</strong> of public data scraping via your Settings page.</li>
            <li><strong>Withdraw consent</strong> for marketing communications at any time.</li>
          </ul>

          <h2>11. Children{"'"}s Privacy</h2>
          <p>The Platform is not intended for users under 18. We do not knowingly collect information from minors. If we become aware that a user is under 18, we will delete their account and associated data.</p>

          <h2>12. International Data Transfers</h2>
          <p>Your data may be transferred to and stored in the United States, where our hosting providers operate. By using the Platform, you consent to this transfer. We ensure appropriate safeguards are in place as required by the Australian Privacy Act.</p>

          <h2>13. Changes to This Policy</h2>
          <p>We may update this policy from time to time. We will notify you of material changes via email or a notice on the Platform. Your continued use of the Platform after changes are posted constitutes acceptance of the updated policy.</p>

          <h2>14. Contact</h2>
          <p>For privacy-related questions or data requests, contact us at <a href="mailto:hello@hireacreator.ai" className="text-neutral-900 underline">hello@hireacreator.ai</a>.</p>
          <p>Or write to: HireACreator.ai, Sydney, NSW, Australia.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
