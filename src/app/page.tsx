export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { NewProductButton } from "@/components/products/new-product-button";
import { CategoryFilter } from "@/components/products/category-filter";
import { UrlBar } from "@/components/products/url-bar";
import { ProductWithMeta } from "@/types";
import { PRODUCT_CATEGORIES } from "@/lib/utils";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
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
      {/* Hero */}
      <div className="mb-14 text-center">
        <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-violet-600/25 bg-violet-700/10 px-4 py-1.5 text-xs font-semibold text-violet-300 mb-6 tracking-widest uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          Topluluk Platformu
        </div>
        <h1 className="animate-fade-up-delay-1 text-5xl sm:text-6xl font-extrabold tracking-tight text-zinc-50 mb-5 leading-[1.1]">
          Bir site{" "}
          <span className="galaxy-gradient">araştır</span>
          ,{" "}
          <br className="hidden sm:block" />
          topluluğa katıl
        </h1>
        <p className="animate-fade-up-delay-2 text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed font-light">
          Herhangi bir sitenin URL&apos;sini gir — aynı domain için yapılan tüm
          istekler ve yorumlar tek bir topluluk havuzunda buluşur.
        </p>
        <div className="animate-fade-up-delay-3">
          <UrlBar />
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
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">⭐ Öne Çıkan</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* All / filtered */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">
            {category ? (PRODUCT_CATEGORIES.find((c) => c.value === category)?.label ?? "Siteler") : "Tüm siteler"}
          </h2>
          <p className="text-sm text-zinc-500">{rest.length} site topluluk alanı</p>
        </div>
        <NewProductButton />
      </div>

      {rest.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-800 py-20 text-center">
          <p className="text-zinc-500 mb-3">Bu kategoride henüz site yok.</p>
          <p className="text-sm text-zinc-600">İlk URL'yi ekleyen sen ol!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
