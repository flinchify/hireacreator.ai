import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/client-layout";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "HireACreator.ai - The Creator Marketplace with 0% Fees",
    template: "%s | HireACreator.ai",
  },
  description:
    "The creator marketplace where creators keep 100% of their earnings. Find and book verified creators for UGC, video, photography, design, and more.",
  keywords: ["creator marketplace", "hire creators", "UGC", "influencer marketing", "0% fees", "book creators", "creator economy"],
  authors: [{ name: "HireACreator.ai" }],
  openGraph: {
    title: "HireACreator.ai - The Creator Marketplace with 0% Fees",
    description: "Find and book verified creators. 0% platform fees for creators. Always.",
    url: "https://hireacreator.ai",
    siteName: "HireACreator.ai",
    type: "website",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "HireACreator.ai - 0% Fees Creator Marketplace",
    description: "Book verified creators for UGC, video, photography, and more. Creators keep 100%.",
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

  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </head>
      <body className="min-h-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
