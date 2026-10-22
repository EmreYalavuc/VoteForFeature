"use client";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarsProps {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function Stars({ rating, max = 5, size = "sm", interactive, onRate }: StarsProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(i + 1)}
          className={cn("transition-all", interactive && "hover:scale-110 cursor-pointer", !interactive && "cursor-default")}
        >
          <Star
            className={cn(
              size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5",
              i < Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-zinc-700"
            )}
          />
        </button>
      ))}
    </div>
  );
}
