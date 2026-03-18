"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/components/auth-context";

function StarSvg({ filled, size = 16 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function StarButton({
  creatorId,
  initialStarred,
  initialCount,
  size = "sm",
}: {
  creatorId: string;
  initialStarred: boolean;
  initialCount: number;
  size?: "sm" | "md";
}) {
  const { user, openLogin } = useAuth();
  const [starred, setStarred] = useState(initialStarred);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);

  const toggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        openLogin();
        return;
      }

      // Optimistic update
      const wasStarred = starred;
      setStarred(!wasStarred);
      setCount((c) => (wasStarred ? c - 1 : c + 1));
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);

      try {
        const res = await fetch("/api/stars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ creatorId }),
        });
        if (res.ok) {
          const data = await res.json();
          setStarred(data.starred);
          setCount(data.starCount);
        } else {
          // Revert on error
          setStarred(wasStarred);
          setCount((c) => (wasStarred ? c + 1 : c - 1));
        }
      } catch {
        // Revert on error
        setStarred(wasStarred);
        setCount((c) => (wasStarred ? c + 1 : c - 1));
      }
    },
    [user, starred, creatorId, openLogin]
  );

  const isSm = size === "sm";

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1 transition-all duration-200 ${
        isSm
          ? "px-2 py-1 rounded-lg text-xs"
          : "px-3 py-1.5 rounded-xl text-sm"
      } ${
        starred
          ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
          : "text-neutral-400 bg-neutral-50 hover:bg-neutral-100 hover:text-neutral-500"
      }`}
      aria-label={starred ? "Unstar creator" : "Star creator"}
    >
      <span
        className={`inline-flex transition-transform duration-300 ${
          animating ? "scale-125" : "scale-100"
        }`}
      >
        <StarSvg filled={starred} size={isSm ? 14 : 18} />
      </span>
      {count > 0 && (
        <span className="font-medium tabular-nums">{count}</span>
      )}
    </button>
  );
}

/**
 * Provider that fetches all starred creator IDs for the logged-in user
 * and passes them down so each card knows its initial state.
 */
export function useStarredCreators() {
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/stars");
      if (res.ok) {
        const data = await res.json();
        setStarredIds(new Set(data.starredCreatorIds));
      }
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  return { starredIds, loaded, loadStars: load };
}
