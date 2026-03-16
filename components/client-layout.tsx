"use client";

import { AuthProvider } from "./auth-context";
import { AuthModal } from "./auth-modal";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <main className="page-fade-in">
        {children}
      </main>
      <AuthModal />
    </AuthProvider>
  );
}
