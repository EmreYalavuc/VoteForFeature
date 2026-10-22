export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { FeatureCard } from "@/components/features/feature-card";
import { NewFeatureDialog } from "@/components/features/new-feature-dialog";
import { FeatureFilters } from "@/components/features/feature-filters";
import { Badge } from "@/components/ui/badge";
import { FeatureStatus, FeatureWithMeta } from "@/types";
import { STATUS_COLORS, STATUS_LABELS, CATEGORIES } from "@/lib/utils";
import { Map, Globe } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string; category?: string; sort?: string }>;
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { owner: { select: { id: true, name: true, image: true } } },
  });
  if (!product) notFound();

  const session = await auth();
  const status = (sp.status && sp.status !== "all" ? sp.status : undefined) as FeatureStatus | undefined;
  const category = sp.category && sp.category !== "all" ? sp.category : undefined;
  const sort = sp.sort ?? "newest";

  const features = await prisma.featureRequest.findMany({
    where: { productId: product.id, ...(status ? { status } : {}), ...(category ? { category } : {}) },
    include: {
      author: { select: { id: true, name: true, image: true } },
      votes: true,
      _count: { select: { comments: true } },
    },
    orderBy: sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" },
  });

  const withMeta = features
    .map((f) => ({
      ...f,
      upvotes: f.votes.filter((v) => v.type === "UP").length,
      downvotes: f.votes.filter((v) => v.type === "DOWN").length,
      userVote: session?.user ? f.votes.find((v) => v.userId === session.user.id) ?? null : null,
    }))
    .sort((a, b) => {
      if (sort === "top") return b.upvotes - a.upvotes;
      if (sort === "trending") return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      return 0;
    });

  const pinnedFeatures = withMeta.filter((f) => f.pinned);
  const normalFeatures = withMeta.filter((f) => !f.pinned);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xl font-bold shadow-lg shadow-violet-900/40 shrink-0">
              {product.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.logo} alt={product.name} className="h-full w-full rounded-xl object-cover" />
              ) : (
                product.name[0].toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-50">{product.name}</h1>
              <p className="text-sm text-zinc-500 mt-0.5">{product.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            {product.website && (
              <a href={product.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors">
                <Globe className="h-3.5 w-3.5" />Website
              </a>
            )}
            <Link href={`/products/${slug}/roadmap`}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors">
              <Map className="h-3.5 w-3.5" />Roadmap
            </Link>
            <NewFeatureDialog productId={product.id} />
          </div>
        </div>

        {/* Status summary pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(STATUS_LABELS) as FeatureStatus[]).map((s) => {
            const count = features.filter((f) => f.status === s).length;
            if (count === 0) return null;
            return (
              <span key={s} className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[s]}`}>
                {STATUS_LABELS[s]} <span className="opacity-60">·</span> {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <FeatureFilters categories={CATEGORIES} />

      {/* Pinned */}
      {pinnedFeatures.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-600">Pinned</p>
          <div className="space-y-3">
            {pinnedFeatures.map((f) => (
              <FeatureCard key={f.id} feature={f} productSlug={slug} />
            ))}
          </div>
        </div>
      )}

      {/* Main list */}
      {normalFeatures.length === 0 && pinnedFeatures.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-800 py-20 text-center">
          <p className="text-zinc-500 mb-1">No feature requests yet.</p>
          <p className="text-sm text-zinc-600">Submit the first one and get the ball rolling!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {normalFeatures.map((f) => (
            <FeatureCard key={f.id} feature={f} productSlug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}
