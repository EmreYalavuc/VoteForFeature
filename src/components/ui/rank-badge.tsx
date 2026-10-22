import { Rank } from "@/lib/utils";

interface RankBadgeProps {
  rank: Rank;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RankBadge({ rank, showScore = false, size = "md" }: RankBadgeProps) {
  const sizes = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  return (
    <span className={`inline-flex items-center rounded-full border font-semibold ${sizes[size]} ${rank.bg} ${rank.color}`}>
      <span>{rank.emoji}</span>
      <span>{rank.label}</span>
      {showScore && <span className="opacity-60 font-normal">· {rank.score} pts</span>}
    </span>
  );
}
