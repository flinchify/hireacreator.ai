"use client";

import { AuthProvider, useAuth } from "./auth-context";
import { AuthModal } from "./auth-modal";
import { OnboardingFlow } from "./onboarding-flow";
import { CodeBackground } from "./code-background";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (loading) return;
    // Show onboarding if: new signup (welcome param) AND user has no headline/bio (hasn't completed setup)
    const isWelcome = searchParams.get("welcome") === "true";
    const needsSetup = user && !user.headline && !user.bio;
    if (isWelcome && needsSetup) {
      setShowOnboarding(true);
    }
  }, [loading, user, searchParams]);

  if (showOnboarding && user) {
    return <OnboardingFlow />;
  }

  return <>{children}</>;
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CodeBackground />
      <Suspense fallback={null}>
        <OnboardingGate>
          <main className="page-fade-in relative z-10">
            {children}
          </main>
        </OnboardingGate>
      </Suspense>
      <AuthModal />
    </AuthProvider>
  );
}
