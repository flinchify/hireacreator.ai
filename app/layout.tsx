import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/client-layout";

export const metadata: Metadata = {
  title: "HireACreator.ai - The Premium Creator Marketplace",
  description:
    "Connect with world-class creators for UGC, video production, photography, design, and more. Trusted by leading brands worldwide.",
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
