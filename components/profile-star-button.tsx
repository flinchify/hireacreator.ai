"use client";

import { useState, useEffect } from "react";
import { StarButton } from "./star-button";

export function ProfileStarButton({ creatorId }: { creatorId: string }) {
  const [data, setData] = useState<{ starred: boolean; starCount: number } | null>(null);

  useEffect(() => {
    fetch(`/api/stars/${creatorId}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData({ starred: false, starCount: 0 }));
  }, [creatorId]);

  if (!data) return null;

  return (
    <StarButton
      creatorId={creatorId}
      initialStarred={data.starred}
      initialCount={data.starCount}
      size="md"
    />
  );
}
