import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trust & Safety",
  description: "How HireACreator protects payments, verifies creators, resolves disputes, and ensures a safe marketplace for brands and creators.",
  alternates: { canonical: "https://hireacreator.ai/trust" },
  openGraph: { images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
};

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">Trust &amp; Safety</h1>
        <p className="text-sm text-neutral-400 mb-10">Last updated: 24 March 2026</p>

        <div className="prose prose-neutral prose-sm max-w-none [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-neutral-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-neutral-600 [&_p]:leading-relaxed [&_li]:text-neutral-600">

          <h2>1. Our Commitment</h2>
          <p>HireACreator is committed to maintaining a safe, trustworthy marketplace where brands and creators can collaborate with confidence. This page outlines how we protect payments, verify creators, resolve disputes, moderate content, and safeguard our community.</p>

          <h2>2. Payment Protection</h2>
          <p>All booking payments are held in escrow via Stripe until work is delivered and approved. Stripe is PCI-DSS Level 1 compliant, the highest level of payment security certification.</p>
          <ul>
            <li>Funds are only released to the creator when the brand reviews and approves the deliverables.</li>
            <li>If the brand does not respond within 7 days of delivery, funds are automatically released to the creator.</li>
            <li>Creator commission is 0% — there are no hidden fee deductions from creator earnings.</li>
            <li>All payment data is processed and stored by Stripe. We do not store credit card numbers or bank account details on our servers.</li>
          </ul>

          <h2>3. Creator Verification</h2>
          <p>Creators are verified through social account ownership confirmation to ensure authenticity and protect both brands and creators.</p>
          <ul>
            <li>Creators connect their social accounts (Instagram, TikTok, YouTube, Twitter) during the verification process.</li>
            <li>We confirm ownership via OAuth or profile matching.</li>
            <li>Only verified creators can accept offers and receive payments through the Platform.</li>
            <li>Unverified profiles are marked as &quot;Unclaimed&quot; and cannot transact.</li>
          </ul>

          <h2>4. Dispute Resolution</h2>
          <p>We provide a structured dispute resolution process with a 14-day dispute window from the delivery date.</p>
          <ul>
            <li><strong>Raising a dispute:</strong> Either party can raise a dispute via support by providing a booking ID, description, and supporting evidence.</li>
            <li><strong>Admin mediation:</strong> Our team reviews evidence submitted by both parties.</li>
            <li><strong>Timeline:</strong> Disputes are resolved within 10 business days.</li>
            <li><strong>Possible outcomes:</strong> Full refund, partial refund, payment release to the creator, or mutual agreement between the parties.</li>
            <li>All dispute decisions are final.</li>
          </ul>

          <h2>5. Anti-Impersonation Measures</h2>
          <p>We take impersonation seriously and have multiple safeguards in place to protect the identity of creators on our platform.</p>
          <ul>
            <li>Only verified account holders can accept offers and receive payments.</li>
            <li>AI-generated profiles built from public data are marked as &quot;Unclaimed&quot; until the real person verifies ownership.</li>
            <li>Impersonation of another person or entity is strictly prohibited and results in immediate account termination.</li>
            <li>Users can report suspected impersonation via the reporting system.</li>
          </ul>

          <h2>6. Content Moderation</h2>
          <p>We maintain content standards across the Platform to ensure a professional and safe environment for all users.</p>
          <ul>
            <li>All messages are subject to automated content moderation.</li>
            <li>Prohibited content includes hate speech, threats, explicit material, and spam.</li>
            <li>User-reported content is reviewed by our moderation team.</li>
            <li>Creator profiles, portfolios, and listings are subject to quality and content standards.</li>
            <li>Content that violates our standards is removed, and repeated violations result in account suspension.</li>
          </ul>

          <h2>7. AI Guardrails</h2>
          <p>Our AI agent assists with profile building, matching, and communication. We{"'"}ve established clear boundaries for what the AI can and cannot do.</p>
          <p><strong>What the AI CAN do:</strong></p>
          <ul>
            <li>Build profiles from publicly available data</li>
            <li>Suggest creator-brand matches based on relevance</li>
            <li>Send templated outreach messages on behalf of users</li>
            <li>Manage booking workflows and notifications</li>
          </ul>
          <p><strong>What the AI CANNOT do:</strong></p>
          <ul>
            <li>Agree to deals or accept offers on behalf of users</li>
            <li>Send or receive money</li>
            <li>Impersonate users in conversations</li>
            <li>Access private data beyond what is needed for its functions</li>
          </ul>
          <p>All AI actions are logged. Users can review AI activity in their dashboard. AI suggestions are recommendations only, not guarantees of outcomes.</p>

          <h2>8. Reporting Abuse</h2>
          <p>To report abuse, impersonation, or safety concerns, email us at <a href="mailto:hello@hireacreator.ai" className="text-neutral-900 underline">hello@hireacreator.ai</a> with the following details:</p>
          <ul>
            <li>Relevant booking IDs, usernames, or profile links</li>
            <li>Screenshots or other supporting evidence</li>
            <li>A description of the issue</li>
          </ul>
          <p>We aim to respond to all reports within 48 hours. Serious safety concerns — including threats, harassment, or illegal activity — are prioritised and may be reported to law enforcement.</p>

          <h2>9. Accessibility Statement</h2>
          <p>HireACreator is committed to making our platform accessible to all users. We follow WCAG 2.1 guidelines where practicable to ensure an inclusive experience.</p>
          <p>If you experience accessibility issues, please contact us at <a href="mailto:hello@hireacreator.ai" className="text-neutral-900 underline">hello@hireacreator.ai</a>. We welcome feedback on how we can improve accessibility across the Platform.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
