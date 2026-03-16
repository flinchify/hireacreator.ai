"use client";

import { AuthProvider } from "./auth-context";
import { AuthModal } from "./auth-modal";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <AuthModal />
    </AuthProvider>
  );
}
