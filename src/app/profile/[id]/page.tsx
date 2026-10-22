export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { RankBadge } from "@/components/ui/rank-badge";
import { Stars } from "@/components/ui/stars";
import { BioEditor } from "@/components/profile/bio-editor";
import { calculateRank, PRODUCT_CATEGORIES } from "@/lib/utils";
import { Globe, ExternalLink } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      createdAt: true,
      ownedProducts: {
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, slug: true, logo: true, description: true, category: true, website: true, demoUrl: true, reviews: { select: { rating: true } } },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          rating: true,
          content: true,
          createdAt: true,
          product: { select: { name: true, slug: true, logo: true } },
          likes: { select: { type: true } },
        },
      },
    },
  });
  if (!user) notFound();

  const isSelf = session?.user?.id === id;

  // Rank stats from all received likes on this user's reviews
  const allLikes = await prisma.reviewLike.findMany({
    where: { review: { authorId: id } },
    select: { type: true },
  });
  const reviewCount = await prisma.review.count({ where: { authorId: id } });
  const rankStats = {
    likes: allLikes.filter((l) => l.type === "LIKE").length,
    dislikes: allLikes.filter((l) => l.type === "DISLIKE").length,
    reviewCount,
  };
  const rank = calculateRank(rankStats);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Profile header */}
      <div className="samsung-card p-6">
        <div className="flex items-start gap-5">
          <Avatar src={user.image} name={user.name} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-zinc-50">{user.name}</h1>
              <RankBadge rank={rank} showScore size="md" />
            </div>
            <p className="text-xs text-zinc-600 mb-3">
              Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>

            {/* Bio */}
            {isSelf ? (
              <BioEditor initialBio={user.bio ?? ""} userId={id} />
            ) : (
              user.bio && (
                <p className="text-sm text-zinc-400 leading-relaxed">{user.bio}</p>
              )
            )}
          </div>
        </div>

        {/* Rank progress bar */}
        {rank.next !== null && (
          <div className="mt-5 border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-zinc-500">Progress to next rank</span>
              <span className="text-xs text-zinc-500">{rankStats.likes * 3 - rankStats.dislikes + rankStats.reviewCount} / {rank.next} pts</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all"
                style={{ width: `${Math.min(100, (rank.score / rank.next) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-zinc-600 mt-1.5">
              {rank.next - rank.score} pts needed for {
                rank.label === "Newcomer" ? "Reviewer" :
                rank.label === "Reviewer" ? "Trusted" :
                rank.label === "Trusted" ? "Expert" : "Elite"
              }
            </p>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Reviews Written", value: reviewCount },
          { label: "Helpful Votes", value: rankStats.likes },
          { label: "Listed Apps", value: user.ownedProducts.length },
        ].map((s) => (
          <div key={s.label} className="samsung-card p-4 text-center">
            <p className="text-2xl font-bold text-zinc-50">{s.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Listed apps */}
      {user.ownedProducts.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600 mb-3">Apps</h2>
          <div className="space-y-3">
            {user.ownedProducts.map((p) => {
              const cat = PRODUCT_CATEGORIES.find((c) => c.value === p.category);
              const avg = p.reviews.length
                ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
                : null;
              return (
                <Link key={p.id} href={`/products/${p.slug}`} className="samsung-card p-4 flex items-center gap-3 block hover:no-underline">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold shrink-0">
                    {p.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.logo} alt={p.name} className="h-full w-full rounded-xl object-cover" />
                    ) : p.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-zinc-200">{p.name}</span>
                      {cat && <span className="text-xs text-zinc-600">{cat.emoji} {cat.label}</span>}
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{p.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {avg !== null && (
                      <div className="flex items-center gap-1 justify-end">
                        <Stars rating={avg} />
                        <span className="text-xs text-zinc-500">({p.reviews.length})</span>
                      </div>
                    )}
                    <div className="flex gap-1 mt-1 justify-end">
                      {p.website && <Globe className="h-3.5 w-3.5 text-zinc-600" />}
                      {p.demoUrl && <ExternalLink className="h-3.5 w-3.5 text-zinc-600" />}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Reviews written */}
      {user.reviews.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600 mb-3">Reviews Written</h2>
          <div className="space-y-3">
            {user.reviews.map((r) => {
              const myLikeCount = r.likes.filter((l) => l.type === "LIKE").length;
              return (
                <Link key={r.id} href={`/products/${r.product.slug}`} className="samsung-card p-4 block hover:no-underline">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400 shrink-0">
                        {r.product.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.product.logo} alt={r.product.name} className="h-full w-full rounded-lg object-cover" />
                        ) : r.product.name[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-zinc-300 hover:text-violet-300 transition-colors">{r.product.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stars rating={r.rating} />
                      {myLikeCount > 0 && (
                        <span className="text-xs text-emerald-500">+{myLikeCount} helpful</span>
                      )}
                    </div>
                  </div>
                  {r.content && (
                    <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">{r.content}</p>
                  )}
                  <p className="text-xs text-zinc-700 mt-2">
                    {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
