import { getScoreTier } from "@/lib/creator-score";

/**
 * Circular score badge showing the Creator Score (0-100).
 * Uses a ring that fills based on score percentage.
 */
export function CreatorScoreBadge({
  score,
  size = "md",
  showLabel = false,
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  const tier = getScoreTier(score);

  const dimensions = {
    sm: { w: 36, r: 14, stroke: 3, font: "text-[10px]" },
    md: { w: 48, r: 18, stroke: 3.5, font: "text-xs" },
    lg: { w: 64, r: 26, stroke: 4, font: "text-base" },
  }[size];

  const circumference = 2 * Math.PI * dimensions.r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative" style={{ width: dimensions.w, height: dimensions.w }}>
        <svg width={dimensions.w} height={dimensions.w} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={dimensions.w / 2}
            cy={dimensions.w / 2}
            r={dimensions.r}
            fill="none"
            stroke="#e5e5e5"
            strokeWidth={dimensions.stroke}
          />
          {/* Score ring */}
          <circle
            cx={dimensions.w / 2}
            cy={dimensions.w / 2}
            r={dimensions.r}
            fill="none"
            stroke={tier.color}
            strokeWidth={dimensions.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center font-bold text-neutral-900 ${dimensions.font}`}>
          {score}
        </div>
      </div>
      {showLabel && (
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: tier.color }}>
          {tier.label}
        </span>
      )}
    </div>
  );
}
