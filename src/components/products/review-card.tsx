"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ThumbsUp, ThumbsDown, Lock, Unlock } from "lucide-react";
import { Stars } from "@/components/ui/stars";
import { Avatar } from "@/components/ui/avatar";
import { RankBadge } from "@/components/ui/rank-badge";
import { ReviewWithAuthor } from "@/types";
import { calculateRank } from "@/lib/utils";

const TRUNCATE_LEN = 150;

interface ReviewCardProps {
  review: ReviewWithAuthor;
  isOwner: boolean;
  authorStats: { likes: number; dislikes: number; reviewCount: number };
}

export function ReviewCard({ review, isOwner, authorStats }: ReviewCardProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [likes, setLikes] = useState(review.likes);
  const [unlocked, setUnlocked] = useState(
    () => review.unlocks.some((u) => u.userId === userId) || review.authorId === userId
  );
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const likeCount = likes.filter((l) => l.type === "LIKE").length;
  const dislikeCount = likes.filter((l) => l.type === "DISLIKE").length;
  const myLike = likes.find((l) => l.userId === userId);
  const rank = calculateRank(authorStats);

  const content = review.content ?? "";
  const isTruncated = isOwner && !unlocked && content.length > TRUNCATE_LEN;
  const displayContent = isTruncated ? content.slice(0, TRUNCATE_LEN) : content;

  async function handleLike(type: "LIKE" | "DISLIKE") {
    if (!userId || likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.action === "removed") {
        setLikes((prev) => prev.filter((l) => l.userId !== userId));
      } else if (data.action === "switched") {
        setLikes((prev) => prev.map((l) => l.userId === userId ? { ...l, type } : l));
      } else {
        setLikes((prev) => [...prev, data.like]);
      }
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleUnlock() {
    if (!userId || unlockLoading) return;
    setUnlockLoading(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/unlock`, { method: "POST" });
      if (res.ok) setUnlocked(true);
    } finally {
      setUnlockLoading(false);
    }
  }

  const isOwnReview = review.authorId === userId;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href={`/profile/${review.author.id}`}>
            <Avatar src={review.author.image} name={review.author.name} size="sm" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/profile/${review.author.id}`}
                className="text-sm font-medium text-zinc-200 hover:text-violet-300 transition-colors truncate">
                {review.author.name}
              </Link>
              <RankBadge rank={rank} size="sm" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Stars rating={review.rating} />
          <span className="text-xs text-zinc-600">
            {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Content */}
      {content && (
        <div className="relative">
          <p className={`text-sm text-zinc-400 leading-relaxed ${isTruncated ? "select-none" : ""}`}>
            {displayContent}
            {isTruncated && <span className="text-zinc-700">...</span>}
          </p>
          {isTruncated && (
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-zinc-900/80 to-transparent" />
          )}
        </div>
      )}

      {/* Unlock button (owner only) */}
      {isOwner && !unlocked && content.length > TRUNCATE_LEN && (
        <button
          onClick={handleUnlock}
          disabled={unlockLoading}
          className="flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-400 hover:bg-violet-500/20 hover:text-violet-300 transition-all disabled:opacity-50"
        >
          <Lock className="h-3.5 w-3.5" />
          {unlockLoading ? "Unlocking..." : "Tam metni gör"}
        </button>
      )}
      {isOwner && unlocked && content.length > TRUNCATE_LEN && (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-500/60">
          <Unlock className="h-3 w-3" /> Açıldı
        </span>
      )}

      {/* Like / dislike */}
      {!isOwnReview && userId && (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleLike("LIKE")}
            disabled={likeLoading}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-all ${
              myLike?.type === "LIKE"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <button
            onClick={() => handleLike("DISLIKE")}
            disabled={likeLoading}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-all ${
              myLike?.type === "DISLIKE"
                ? "bg-red-500/15 text-red-400 border border-red-500/30"
                : "text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
            }`}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            {dislikeCount > 0 && <span>{dislikeCount}</span>}
          </button>
        </div>
      )}
    </div>
  );
}
