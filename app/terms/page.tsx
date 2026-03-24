import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "HireACreator terms of service. Read our terms covering platform use, payments, creator rights, brand obligations, AI agent terms, and referral program.",
  alternates: { canonical: "https://hireacreator.ai/terms" },
  openGraph: { images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-neutral-400 mb-10">Last updated: 24 March 2026</p>

        <div className="prose prose-neutral prose-sm max-w-none [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-neutral-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-neutral-600 [&_p]:leading-relaxed [&_li]:text-neutral-600">

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using HireACreator.ai (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. We may update these terms at any time; continued use constitutes acceptance of the revised terms.</p>

          <h2>2. Eligibility</h2>
          <p>You must be at least 18 years old (or the age of majority in your jurisdiction) to create an account. By registering, you represent that the information you provide is accurate and complete.</p>

          <h2>3. Account Types</h2>
          <p><strong>Creators</strong> list services, set their own prices, and receive bookings from brands. Creators pay 0% commission on all earnings.</p>
          <p><strong>Brands</strong> search, discover, and book creators. Brands pay a service fee on bookings (10% standard, 5% for Enterprise plans).</p>
          <p><strong>Agents</strong> access the Platform programmatically via API. Agent accounts must verify domain ownership before performing write operations.</p>

          <h2>4. Creator Onboarding and Vetting</h2>
          <p>Creators can sign up directly or be discovered via publicly available social data. Profiles built from public information are provisional until claimed and verified by the creator.</p>
          <ul>
            <li>Verification requires confirmation of social account ownership.</li>
            <li>Creators must review and approve their profile before it becomes active on the Platform.</li>
            <li>HireACreator reserves the right to reject or remove profiles that do not meet our quality or content standards.</li>
          </ul>

          <h2>5. Matching Logic</h2>
          <p>The Platform uses algorithmic and AI-assisted matching to connect brands with relevant creators based on category, niche, audience size, engagement metrics, location, pricing, and availability.</p>
          <p>Matching suggestions are recommendations only and do not guarantee suitability. Brands are responsible for reviewing creator profiles before making offers.</p>

          <h2>6. Communication Workflow</h2>
          <ul>
            <li>All business communications should occur through the Platform messaging system.</li>
            <li>Initial outreach from brands may be facilitated by the AI agent on behalf of the brand.</li>
            <li>Creators must respond to or acknowledge offers within their messaging dashboard.</li>
            <li>Off-platform communication is permitted, but any transactions conducted outside the Platform escrow system are not covered by our dispute resolution or payment protection.</li>
            <li>Messages are subject to content moderation.</li>
          </ul>

          <h2>7. Creator Terms</h2>
          <ul>
            <li>Creators retain full ownership of their intellectual property unless explicitly transferred in a booking agreement.</li>
            <li>Creators set their own prices. HireACreator does not set, suggest, or cap pricing.</li>
            <li>Creators are responsible for delivering work as described in their service listings.</li>
            <li>Creators must not misrepresent their skills, portfolio, or availability.</li>
            <li>Creators receive payouts via Stripe Connect. By using the Platform, creators agree to Stripe{"'"}s terms of service.</li>
            <li>Creators must offer at least one (1) revision on paid deals unless otherwise agreed in writing.</li>
            <li>Creators must deliver work within the timeframe agreed in the booking.</li>
          </ul>

          <h2>8. Brand Terms</h2>
          <ul>
            <li>Brands agree to pay the listed price plus applicable service fees at the time of booking.</li>
            <li>Payments are held in escrow via Stripe. Funds are only released to the creator after the brand reviews and approves the deliverables.</li>
            <li>Brands must not request work outside the scope of the original booking without a new agreement.</li>
            <li>Brands are responsible for providing clear briefs and timely feedback.</li>
            <li>Brands must review deliverables within 7 days of submission. Failure to respond within 7 days results in automatic approval and fund release.</li>
          </ul>

          <h2>9. Revision Policy</h2>
          <ul>
            <li>Creators must offer at least one (1) free revision on all paid bookings.</li>
            <li>Additional revisions may be negotiated between the parties.</li>
            <li>Revision requests must be specific and within the original scope of work.</li>
            <li>Revision requests must be submitted within 7 days of delivery.</li>
          </ul>

          <h2>10. Payments and Fees</h2>
          <p>All payments are processed through Stripe. By using the Platform, you agree to Stripe{"'"}s terms of service and privacy policy.</p>
          <ul>
            <li><strong>Creator commission:</strong> 0% — creators keep 100% of their earnings.</li>
            <li><strong>Brand service fee:</strong> 10% on top of the creator{"'"}s price (5% for Enterprise plan subscribers).</li>
            <li><strong>Subscriptions:</strong> Creator Pro ($19/mo), Creator Business ($49/mo), Brand Analytics ($199/mo), Brand Enterprise ($999/mo), API Pro ($49/mo).</li>
            <li><strong>Boosted Listings:</strong> $10/week, optional, auto-renewing.</li>
            <li><strong>Profile Animations:</strong> $4.99 per animation, one-time purchase.</li>
          </ul>

          <h2>11. Payment Flow and Escrow</h2>
          <p>Booking payments are held in escrow via Stripe until work is delivered and approved.</p>
          <ul>
            <li>Brand submits payment — funds are held in escrow.</li>
            <li>Creator delivers work.</li>
            <li>Brand reviews and approves the deliverables.</li>
            <li>Funds are released to the creator.</li>
          </ul>
          <p>If the brand does not respond within 7 days of delivery, funds are automatically released to the creator. Creators receive payouts to their connected Stripe account. Payout timing depends on Stripe processing (typically 2–7 business days).</p>

          <h2>12. Cancellation Policy</h2>
          <ul>
            <li><strong>Before payment:</strong> Either party may cancel without penalty.</li>
            <li><strong>After payment, before delivery:</strong> The brand may cancel and receive a full refund minus processing fees. The creator may cancel and must provide a reason; the brand receives a full refund.</li>
            <li><strong>During delivery:</strong> If the creator has begun work, cancellation requires mutual agreement. Partial refunds may be issued based on work completed.</li>
            <li><strong>After delivery:</strong> Cancellation is not available. Disputes should be raised through the dispute process outlined in Section 13.</li>
          </ul>

          <h2>13. Refund and Dispute Handling</h2>
          <p>Refunds are available in limited circumstances, including non-delivery, work significantly different from the agreed scope, or creator cancellation.</p>
          <ul>
            <li><strong>Dispute window:</strong> 14 days from the delivery date.</li>
            <li><strong>To raise a dispute:</strong> Contact support with your booking ID, a description of the issue, and supporting evidence.</li>
            <li><strong>Admin mediation:</strong> HireACreator will review evidence from both parties and make a determination within 10 business days.</li>
            <li>Decisions are final.</li>
            <li>Refund amounts are at HireACreator{"'"}s discretion and may be partial or full.</li>
          </ul>

          <h2>14. Usage Rights and Licensing</h2>
          <ul>
            <li>Ownership of deliverables transfers to the brand upon payment completion.</li>
            <li>The creator retains portfolio rights and may display the work in their portfolio, case studies, and social media.</li>
            <li>The brand receives a perpetual, worldwide, commercial usage license for all delivered content.</li>
            <li>No party may use delivered content for AI/ML training purposes without explicit written consent from the other party.</li>
            <li>If payment is not completed, no usage rights transfer; the creator retains full ownership.</li>
            <li><strong>Takedown requests:</strong> Either party may request content removal by contacting support with evidence of rights violation.</li>
            <li>Disputes over usage rights follow the standard dispute process.</li>
          </ul>

          <h2>15. AI Agent Terms</h2>
          <p>HireACreator uses AI agents to assist with platform operations. By using the Platform, you grant the AI agent authority to:</p>
          <ul>
            <li>Build and update creator profiles from public social data.</li>
            <li>Send automated replies and outreach messages on behalf of brands.</li>
            <li>Suggest matches and pricing recommendations.</li>
            <li>Manage booking workflows.</li>
          </ul>
          <p>The AI agent <strong>cannot</strong>:</p>
          <ul>
            <li>Agree to deals or binding commitments on behalf of any user.</li>
            <li>Send or receive money.</li>
            <li>Impersonate any real person.</li>
            <li>Access private accounts or non-public data without authorization.</li>
          </ul>
          <p><strong>Approval requirements:</strong> Creators must claim and verify their profile before any deals involving them become binding. AI-generated offers require creator acceptance before they are confirmed.</p>
          <p><strong>Liability:</strong> AI suggestions, recommendations, and auto-generated content are provided as-is. HireACreator is not liable for decisions made based on AI suggestions. All AI actions are logged and auditable. Users are responsible for reviewing and approving AI-assisted actions on their account.</p>

          <h2>16. Acceptable Use Policy</h2>
          <p>You may not:</p>
          <ul>
            <li>Use the Platform for any unlawful purpose.</li>
            <li>Circumvent Platform fees by arranging off-platform payments for services booked through the Platform.</li>
            <li>Create fake accounts, fake reviews, or manipulate search rankings.</li>
            <li>Harass, abuse, threaten, or send unsolicited explicit content to other users.</li>
            <li>Scrape, crawl, or collect data from the Platform without authorization.</li>
            <li>Upload malicious content, malware, nudity, or infringing material.</li>
            <li>Use the messaging system to solicit off-platform payments or share illegal content.</li>
            <li>Impersonate another user or entity.</li>
            <li>Use the AI agent to send spam or misleading messages.</li>
            <li>Attempt to manipulate AI matching or scoring systems.</li>
          </ul>

          <h2>17. Influencer and Creator Disclosure Requirements</h2>
          <ul>
            <li>Creators must comply with all applicable advertising disclosure laws, including Australian Competition and Consumer Commission (ACCC) guidelines and US Federal Trade Commission (FTC) guidelines where applicable.</li>
            <li>All sponsored content, gifted products, and paid partnerships must be clearly disclosed using appropriate labels (#ad, #sponsored, #gifted, or platform-specific disclosure tools).</li>
            <li>The Platform is not responsible for individual creator non-compliance with disclosure laws but reserves the right to suspend or remove creators who repeatedly fail to disclose.</li>
            <li>Brands are responsible for ensuring creators they work with through the Platform properly disclose the commercial nature of the relationship.</li>
          </ul>

          <h2>18. Misuse, Abuse, and Impersonation</h2>
          <ul>
            <li>Impersonating another person or entity on the Platform is strictly prohibited.</li>
            <li>Only verified account holders may accept offers and receive payments.</li>
            <li>Abuse of the AI agent, messaging system, or any Platform feature may result in immediate suspension.</li>
            <li>Repeated violations will result in permanent account termination.</li>
            <li>HireACreator reserves the right to report illegal activity to law enforcement.</li>
          </ul>

          <h2>19. Referral Program</h2>
          <ul>
            <li>Referrers earn 20% of each subscription payment made by their referred users, credited as platform credits.</li>
            <li>Credits are earned for up to 12 months from the date the referred user signs up.</li>
            <li>Platform credits can be used toward subscriptions, animations, boosted listings, and other platform services.</li>
            <li>Credits are non-transferable, non-refundable, and hold no cash value.</li>
            <li>Self-referrals, fraudulent signups, or referral manipulation will result in forfeiture of all earned credits and potential account suspension.</li>
            <li>HireACreator reserves the right to modify, suspend, or discontinue the referral program at any time.</li>
            <li>Existing earned credits will be honored for 90 days following any program changes, unless forfeited due to policy violations.</li>
          </ul>

          <h2>20. Messaging and Communication Standards</h2>
          <ul>
            <li>Users must confirm they are 18 years or older before accessing the messaging feature.</li>
            <li>All messages are subject to automated content moderation. Messages containing prohibited language, hate speech, threats, or explicit content will be blocked.</li>
            <li>Users may report messages that violate our guidelines. Reported messages will be reviewed by our moderation team.</li>
            <li>HireACreator administrators reserve the right to view all reported conversations for safety and moderation purposes.</li>
            <li><strong>No liability for messages:</strong> HireACreator is not liable for any information shared, leaked, or stolen through in-platform messaging. Users are responsible for the content they share.</li>
            <li>We strongly recommend that all business transactions be conducted through our escrow system. Any deals conducted outside of escrow are between the parties involved and are outside of HireACreator{"'"}s control.</li>
            <li>Images shared in messages are the responsibility of the sender. Sharing explicit, illegal, or non-consensual content is strictly prohibited and will result in immediate account termination.</li>
          </ul>

          <h2>21. Content Standards and Age Restrictions</h2>
          <ul>
            <li><strong>No nudity:</strong> Nudity is strictly prohibited on the Platform, including in profiles, portfolios, link-in-bio pages, services, and messaging.</li>
            <li>Creators may mark their profile as containing 18+ content if their services or redirected links involve mature themes. An age warning will be displayed to visitors.</li>
            <li>Creators may include links to external sites in their profiles. Users who follow these links do so at their own risk. HireACreator is not responsible for content on external websites.</li>
            <li>Users acknowledge that external links leave the Platform and that HireACreator has no control over third-party content, services, or transactions conducted off-site.</li>
            <li>Any off-site transactions, losses, disputes, or damages resulting from interactions initiated through the Platform but conducted externally are solely between the parties involved.</li>
          </ul>

          <h2>22. Intellectual Property</h2>
          <p>The HireACreator name, logo, and platform design are the property of HireACreator. You may not use our branding without written permission. User-generated content (profiles, portfolios, reviews) remains the property of the respective users. The Platform does not claim ownership of creator content.</p>

          <h2>23. Account Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraud, or harm the Platform community. You may delete your account at any time through your Settings page.</p>
          <ul>
            <li>Upon termination, pending escrow payments will be handled according to the dispute process.</li>
            <li>Account data is retained for 30 days after deletion for recovery purposes, then permanently removed.</li>
            <li>Payment records are retained for 7 years for tax compliance purposes.</li>
          </ul>

          <h2>24. Limitation of Liability</h2>
          <p>HireACreator is provided &quot;as is&quot; without warranty. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Platform, including but not limited to:</p>
          <ul>
            <li>Information shared, leaked, or stolen through messaging or any other Platform feature.</li>
            <li>Financial losses from transactions conducted off-platform or without using our escrow system.</li>
            <li>Content on external websites linked from creator profiles.</li>
            <li>Disputes between users arising from off-platform dealings.</li>
            <li>Decisions made based on AI suggestions or matching.</li>
            <li>Any loss or damage resulting from reliance on content posted by other users.</li>
          </ul>
          <p>Our total liability is limited to the amount you have paid to us in the 12 months preceding the claim.</p>

          <h2>25. Governing Law</h2>
          <p>These terms are governed by the laws of New South Wales, Australia. Any disputes will be resolved in the courts of New South Wales. Nothing in these terms excludes or limits consumer guarantees under the Australian Consumer Law.</p>

          <h2>26. Contact</h2>
          <p>Questions about these terms? Contact us at <a href="mailto:hello@hireacreator.ai" className="text-neutral-900 underline">hello@hireacreator.ai</a>.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
