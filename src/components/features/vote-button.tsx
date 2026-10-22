"use client";
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Vote, VoteType } from "@prisma/client";
import { useSession, signIn } from "next-auth/react";

interface VoteButtonProps {
  featureId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote?: Vote | null;
}

export function VoteButton({ featureId, initialUpvotes, initialDownvotes, initialUserVote }: VoteButtonProps) {
  const { data: session } = useSession();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<Vote | null>(initialUserVote ?? null);
  const [loading, setLoading] = useState(false);

  async function vote(type: VoteType) {
    if (!session) { signIn(); return; }
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/features/${featureId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
      setUserVote(data.userVote);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <button
        onClick={() => vote("UP")}
        disabled={loading}
        className={cn(
          "group flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-all duration-200",
          userVote?.type === "UP"
            ? "bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30"
            : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
        )}
      >
        <ChevronUp className={cn("h-4 w-4 transition-transform", userVote?.type === "UP" && "scale-110")} />
        <span className="text-xs font-semibold tabular-nums leading-none">{upvotes}</span>
      </button>

      <button
        onClick={() => vote("DOWN")}
        disabled={loading}
        className={cn(
          "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all duration-200",
          userVote?.type === "DOWN"
            ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
            : "text-zinc-700 hover:bg-zinc-800 hover:text-zinc-500"
        )}
      >
        <ChevronDown className="h-3.5 w-3.5" />
        <span className="text-[10px] tabular-nums leading-none">{downvotes}</span>
      </button>
    </div>
  );
}
