"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";

export default function ClaimPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading, openSignup } = useAuth();
  const slug = params.slug as string;
  const [status, setStatus] = useState<"loading" | "redirecting">("loading");

  useEffect(() => {
    if (loading) return;

    if (user) {
      // User is logged in — look up the profile's platform info, then redirect to dashboard for verification
      setStatus("redirecting");
      fetch("/api/claim-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.needs_verification && data.platform && data.handle) {
            // Redirect to dashboard with verify params — user must verify before claim completes
            router.replace(
              `/dashboard?verify=${encodeURIComponent(data.platform)}&handle=${encodeURIComponent(data.handle)}&claim_slug=${encodeURIComponent(slug)}`
            );
          } else if (data.success) {
            // Already verified (e.g. re-visiting) — profile was claimed
            router.replace("/dashboard?claimed=true");
          } else {
            // Error (already claimed by someone else, etc.)
            router.replace(`/u/${slug}`);
          }
        })
        .catch(() => {
          router.replace(`/u/${slug}`);
        });
      return;
    }

    // Not logged in — store claim intent and open signup
    try {
      localStorage.setItem("hac_claim_intent", JSON.stringify({ slug }));
    } catch {}
    openSignup("creator");
  }, [loading, user, slug, openSignup, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-sm text-neutral-500">
          {status === "redirecting" ? "Redirecting to verification..." : "Setting up your profile..."}
        </p>
      </div>
    </div>
  );
}
