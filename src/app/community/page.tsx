export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { CategoryFilter } from "@/components/products/category-filter";
import { CommunitySubmitButton } from "@/components/products/community-submit-button";
import { ProductWithMeta } from "@/types";
import { PRODUCT_CATEGORIES } from "@/lib/utils";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function CommunityPage({ searchParams }: Props) {
  const sp = await searchParams;
  const category = sp.category && sp.category !== "all" ? sp.category : undefined;

  const products = await prisma.product.findMany({
    where: { isPublic: true, ...(category ? { category: category as never } : {}) },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      _count: { select: { features: true, reviews: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const withRating: ProductWithMeta[] = products.map((p) => ({
    ...p,
    avgRating: p.reviews.length
      ? p.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / p.reviews.length
      : undefined,
    reviews: undefined as never,
  }));

  const featured = withRating.filter((p) => p.featured);
  const rest = withRating.filter((p) => !p.featured);

  const counts = await prisma.product.groupBy({
    by: ["category"],
    where: { isPublic: true },
    _count: true,
  });
  const categoryCounts = Object.fromEntries(counts.map((c) => [c.category, c._count]));
  const totalCount = counts.reduce((s, c) => s + c._count, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-600/25 bg-violet-700/10 px-4 py-1.5 text-xs font-semibold text-violet-300 mb-4 tracking-widest uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          Community
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-50 mb-2">
              Geliştirici <span className="galaxy-gradient">vitrin</span>
            </h1>
            <p className="text-zinc-400 max-w-lg leading-relaxed">
              Geliştiricilerin topluluk geri bildirimi için listelediği uygulamalar.
              Test et, yorum bırak, feature request ekle.
            </p>
          </div>
          <CommunitySubmitButton />
        </div>
      </div>

      {/* Category filters */}
      <CategoryFilter
        categories={PRODUCT_CATEGORIES}
        counts={categoryCounts}
        totalCount={totalCount}
        activeCategory={sp.category ?? "all"}
      />

      {/* Featured */}
      {!category && featured.length > 0 && (
        <div className="mb-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-amber-400">⭐ Öne Çıkan</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* All apps */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">
            {category ? (PRODUCT_CATEGORIES.find((c) => c.value === category)?.label ?? "Uygulamalar") : "Tüm uygulamalar"}
          </h2>
          <p className="text-sm text-zinc-500">{rest.length} uygulama geri bildirim bekliyor</p>
        </div>
      </div>

      {rest.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-700/50 py-24 text-center">
          <p className="text-zinc-400 mb-2 font-medium">Henüz listelenmiş uygulama yok.</p>
          <p className="text-sm text-zinc-600">İlk uygulamanı ekleyerek topluluğu başlat.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
