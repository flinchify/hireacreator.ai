"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";

export default function ClaimPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading, openSignup } = useAuth();
  const slug = params.slug as string;

  useEffect(() => {
    if (loading) return;

    // If already logged in, try to claim directly
    if (user) {
      const intent = { platform: "", handle: "", slug };
      // Try to extract platform info from the page — fallback to slug-based lookup
      claimViaApi(intent.slug).then((ok) => {
        router.replace(ok ? "/dashboard?claimed=true" : `/u/${slug}`);
      });
      return;
    }

    // Store claim intent and open signup
    try {
      localStorage.setItem("hac_claim_intent", JSON.stringify({ slug }));
    } catch {}
    openSignup("creator");
  }, [loading, user, slug, openSignup, router]);

  async function claimViaApi(profileSlug: string): Promise<boolean> {
    try {
      const res = await fetch("/api/claim-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: profileSlug }),
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-sm text-neutral-500">Setting up your profile...</p>
      </div>
    </div>
  );
}
