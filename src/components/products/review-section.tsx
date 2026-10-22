"use client";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Stars } from "@/components/ui/stars";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/products/review-card";
import { ReviewWithAuthor } from "@/types";
import { MessageSquare, Star } from "lucide-react";

interface ReviewSectionProps {
  productSlug: string;
  reviews: ReviewWithAuthor[];
  isOwner: boolean;
  authorStatsMap: Record<string, { likes: number; dislikes: number; reviewCount: number }>;
}

export function ReviewSection({ productSlug, reviews: initialReviews, isOwner, authorStatsMap }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userReview = session?.user ? reviews.find((r) => r.authorId === session.user.id) : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) { signIn(); return; }
    if (rating === 0) { setError("Please pick a star rating."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Something went wrong.");
        return;
      }
      const newReview: ReviewWithAuthor = await res.json();
      setReviews((prev) => {
        const without = prev.filter((r) => r.authorId !== session.user.id);
        return [newReview, ...without];
      });
      setRating(0);
      setContent("");
    } finally {
      setLoading(false);
    }
  }

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="mt-10">
      <div className="mb-5 flex items-center gap-3">
        <h2 className="text-lg font-semibold text-zinc-100">Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <Stars rating={avgRating} />
            <span className="text-sm text-zinc-400">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-zinc-600">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Write review */}
      {!isOwner && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">
            {userReview ? "Update your review" : "Write a review"}
          </h3>
          {!session?.user ? (
            <button onClick={() => signIn()}
              className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors">
              <Star className="h-4 w-4" />
              Sign in to leave a review
            </button>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div className="flex items-center gap-2">
                <Stars rating={rating} interactive onRate={setRating} size="md" />
                <span className="text-sm text-zinc-500">{rating > 0 ? `${rating}/5` : "Pick a rating"}</span>
              </div>
              <textarea value={content} onChange={(e) => setContent(e.target.value)}
                rows={3} maxLength={1000}
                placeholder="Share your experience with this product..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors resize-none" />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex justify-end">
                <Button type="submit" disabled={loading} size="sm">
                  {loading ? "Submitting..." : userReview ? "Update review" : "Submit review"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-zinc-800 py-14 text-center">
          <MessageSquare className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No reviews yet.</p>
          <p className="text-zinc-600 text-xs mt-1">Be the first to review this app.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              isOwner={isOwner}
              authorStats={authorStatsMap[r.authorId] ?? { likes: 0, dislikes: 0, reviewCount: 0 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
