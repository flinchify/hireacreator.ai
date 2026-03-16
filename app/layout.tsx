import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/client-layout";

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
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
