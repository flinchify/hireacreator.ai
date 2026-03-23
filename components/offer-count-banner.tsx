"use client";

import { useEffect, useState } from "react";

interface OfferCountBannerProps {
  platform: string;
  handle: string;
}

export function OfferCountBanner({ platform, handle }: OfferCountBannerProps) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOfferCount() {
      if (!platform || !handle) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/offers/count?platform=${encodeURIComponent(platform)}&handle=${encodeURIComponent(handle)}`
        );
        if (res.ok) {
          const data = await res.json();
          setCount(data.count || 0);
        } else {
          setCount(0);
        }
      } catch {
        setCount(0);
      }
      setLoading(false);
    }

    fetchOfferCount();
  }, [platform, handle]);

  if (loading || count === null || count === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          🔥
        </div>
        <div>
          <h4 className="font-semibold text-white">
            You have {count} brand deal offer{count !== 1 ? 's' : ''} waiting!
          </h4>
          <p className="text-white/90 text-sm">
            Claim your profile to view {count !== 1 ? 'them' : 'it'}.
          </p>
        </div>
      </div>
    </div>
  );
}