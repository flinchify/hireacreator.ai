"use client";

import { useEffect, useState } from "react";

function getScoreColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 30) return "#f97316";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Exceptional";
  if (score >= 75) return "Excellent";
  if (score >= 60) return "Strong";
  if (score >= 40) return "Growing";
  if (score >= 20) return "Emerging";
  return "New";
}

export function ScoreGauge({ score, size = 200 }: { score: number; size?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1500;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f5f5f5"
          strokeWidth="10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-outfit)", color }}>
          {animatedScore}
        </span>
        <span className="text-sm text-neutral-500 font-medium mt-1">{label}</span>
      </div>
    </div>
  );
}

export function BreakdownBars({
  breakdown,
}: {
  breakdown: { profile: number; reach: number; engagement: number; nicheValue: number; consistency: number; platformBonus: number };
}) {
  const bars = [
    { label: "Profile", value: breakdown.profile, max: 15 },
    { label: "Reach", value: breakdown.reach, max: 25 },
    { label: "Engagement", value: breakdown.engagement, max: 20 },
    { label: "Niche Demand", value: breakdown.nicheValue, max: 15 },
    { label: "Consistency", value: breakdown.consistency, max: 15 },
    { label: "Platform", value: breakdown.platformBonus, max: 10 },
  ];

  return (
    <div className="space-y-3 w-full">
      {bars.map((bar) => {
        const pct = Math.round((bar.value / bar.max) * 100);
        return (
          <div key={bar.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-neutral-600 font-medium">{bar.label}</span>
              <span className="text-neutral-900 font-semibold">{bar.value}/{bar.max}</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${pct}%`,
                  backgroundColor: pct >= 80 ? "#22c55e" : pct >= 50 ? "#eab308" : "#f97316",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
