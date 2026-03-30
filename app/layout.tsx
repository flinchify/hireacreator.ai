import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/client-layout";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "HireACreator.ai — Creator Hiring Infrastructure for the AI Era",
    template: "%s | HireACreator.ai",
  },
  description:
    "The AI-native creator marketplace where brands and AI agents discover, hire, and pay creators. 0% creator fees. API-first.",
  keywords: [
    "creator marketplace", "hire creators", "UGC creators", "influencer marketing",
    "0% creator fees", "book creators", "creator economy", "AI agent API",
    "hire TikTok creators", "hire Instagram creators", "hire video editors",
    "creator hiring platform", "link in bio", "creator page builder",
    "brand creator marketplace", "autonomous hiring API", "creator discovery",
  ],
  authors: [{ name: "HireACreator.ai", url: "https://hireacreator.ai" }],
  creator: "HireACreator.ai",
  publisher: "HireACreator.ai",
  alternates: {
    canonical: "https://hireacreator.ai",
  },
  openGraph: {
    title: "HireACreator.ai — Creator Hiring Infrastructure for the AI Era",
    description: "The AI-native creator marketplace where brands and AI agents discover, hire, and pay creators. 0% creator fees. API-first.",
    url: "https://hireacreator.ai",
    siteName: "HireACreator.ai",
    type: "website",
    locale: "en_AU",
    images: [{ url: "https://hireacreator.ai/og-logo.png", width: 1200, height: 630, alt: "HireACreator.ai" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HireACreator.ai — Creator Hiring Infrastructure for the AI Era",
    description: "The AI-native creator marketplace where brands and AI agents discover, hire, and pay creators. 0% creator fees. API-first.",
    images: ["https://hireacreator.ai/og-logo.png"],
  },
  metadataBase: new URL("https://hireacreator.ai"),
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HireACreator",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HireACreator",
    url: "https://hireacreator.ai",
    logo: "https://hireacreator.ai/logo-h-180.png",
    description: "The creator marketplace where brands book creators directly and creators keep 100% of their earnings. 0% commission for creators.",
    foundingDate: "2026",
    sameAs: ["https://x.com/hireacreatorAI"],
    knowsAbout: [
      "creator economy", "influencer marketing", "UGC", "AI agents",
      "creator marketplace", "link-in-bio", "content creation",
      "brand partnerships", "creator hiring", "API-first platforms",
    ],
    slogan: "Creator hiring infrastructure for the AI era",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HireACreator",
    url: "https://hireacreator.ai",
    description: "The creator marketplace where creators keep 100% of their earnings. Find and book creators for UGC, video, photography, design, and more.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://hireacreator.ai/browse?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "HireACreator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://hireacreator.ai",
    description: "AI-native creator marketplace with API-first hiring, 22 premium templates, AI page designer, and comment-to-payment flow. Brands and AI agents discover, hire, and pay creators programmatically.",
    datePublished: "2026-03-16",
    dateModified: "2026-03-30",
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD", description: "0% creator fees, free marketplace listing, link-in-bio page" },
      { "@type": "Offer", name: "Creator Pro", price: "19", priceCurrency: "USD", description: "Pro badge, analytics, priority in search, custom templates" },
      { "@type": "Offer", name: "Brand Analytics", price: "199", priceCurrency: "USD", description: "Campaign analytics, creator discovery, team collaboration" },
    ],
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", bestRating: "5", ratingCount: "42" },
    author: { "@type": "Organization", name: "HireACreator", url: "https://hireacreator.ai" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does HireACreator work?",
        acceptedAnswer: { "@type": "Answer", text: "Brands browse or search our marketplace to find creators by niche, platform, and engagement metrics. AI agents can do the same via our RESTful API. Once matched, you send a brief, negotiate terms, and book directly. Payments are held in escrow and released on delivery approval." },
      },
      {
        "@type": "Question",
        name: "Is it free for creators?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Creators pay 0% platform fees. Building your profile is free, listing in the marketplace is free, and you keep 100% of what brands pay you." },
      },
      {
        "@type": "Question",
        name: "How do payments work?",
        acceptedAnswer: { "@type": "Answer", text: "Through Stripe-powered escrow. When a creator accepts a deal, funds are held securely. After the creator delivers and the brand approves, payment is released directly to the creator's bank account." },
      },
      {
        "@type": "Question",
        name: "Can AI agents book creators autonomously?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Domain-verified agents can search creators, send briefs, negotiate, and initiate escrow-protected payments through our API. Human approval checkpoints are configurable." },
      },
      {
        "@type": "Question",
        name: "What platforms are supported?",
        acceptedAnswer: { "@type": "Answer", text: "Instagram, TikTok, YouTube, X (Twitter), LinkedIn, Twitch, Spotify, Pinterest, Facebook, Snapchat, Discord, GitHub, Reddit, and more being added regularly." },
      },
      {
        "@type": "Question",
        name: "How much does HireACreator cost?",
        acceptedAnswer: { "@type": "Answer", text: "Free for creators — 0% commission. Brands pay a 10% marketplace fee (5% for Enterprise). Creator Pro is $19/month, Creator Business is $49/month, Brand Analytics is $199/month, and Brand Enterprise is $999/month. API Pro is $49/month." },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </head>
      <body className="min-h-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
