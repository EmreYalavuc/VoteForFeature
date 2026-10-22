export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { NewProductButton } from "@/components/products/new-product-button";
import { ProductWithMeta } from "@/types";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { isPublic: true },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      _count: { select: { features: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      {/* Hero */}
      <div className="mb-14 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400 mb-5">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          Community-driven product development
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-zinc-50 mb-4">
          Vote for what gets{" "}
          <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            built next
          </span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-xl mx-auto">
          Submit feature requests, vote on ideas, and help product teams prioritize what matters most.
        </p>
      </div>

      {/* Products header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Products</h2>
          <p className="text-sm text-zinc-500">{products.length} product{products.length !== 1 ? "s" : ""} accepting feedback</p>
        </div>
        <NewProductButton />
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-800 py-20 text-center">
          <p className="text-zinc-500 mb-3">No products yet.</p>
          <p className="text-sm text-zinc-600">Be the first to add one and start collecting feedback.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p as ProductWithMeta} />
          ))}
        </div>
      )}
    </div>
  );
}
