import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HireACreator.ai - The Premium Creator Marketplace",
  description:
    "Connect with world-class creators for UGC, video production, photography, design, and more. Trusted by leading brands worldwide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
