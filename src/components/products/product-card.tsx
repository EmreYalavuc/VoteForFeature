import Link from "next/link";
import { ProductWithMeta } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Stars } from "@/components/ui/stars";
import { MessageSquare, ArrowUpRight, Zap } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/utils";

interface ProductCardProps {
  product: ProductWithMeta;
}

export function ProductCard({ product }: ProductCardProps) {
  const cat = PRODUCT_CATEGORIES.find((c) => c.value === product.category);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-2xl hover:shadow-violet-900/10"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/0 to-purple-600/0 opacity-0 group-hover:from-violet-600/5 group-hover:to-purple-600/5 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-lg font-bold shadow-lg shadow-violet-900/40">
          {product.logo
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={product.logo} alt={product.name} className="h-full w-full rounded-xl object-cover" />
            : product.name[0].toUpperCase()}
        </div>
        <div className="flex items-center gap-2">
          {cat && (
            <span className="rounded-md border border-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
              {cat.emoji} {cat.label}
            </span>
          )}
          <ArrowUpRight className="h-4 w-4 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      </div>

      <h3 className="font-semibold text-zinc-100 group-hover:text-white mb-1 transition-colors">
        {product.name}
      </h3>
      <p className="text-sm text-zinc-500 line-clamp-2 flex-1 mb-3">{product.description}</p>

      {/* Tech stack */}
      {product.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {product.techStack.slice(0, 4).map((t) => (
            <span key={t} className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{t}</span>
          ))}
          {product.techStack.length > 4 && (
            <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600">+{product.techStack.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <Avatar src={product.owner.image} name={product.owner.name} size="sm" />
          <span className="text-xs text-zinc-500 truncate max-w-[80px]">{product.owner.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-600">
          {product.avgRating ? (
            <div className="flex items-center gap-1">
              <Stars rating={product.avgRating} size="sm" />
              <span className="text-zinc-500">{product.avgRating.toFixed(1)}</span>
            </div>
          ) : null}
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" />
            {product._count.features}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {product._count.reviews}
          </span>
        </div>
      </div>
    </Link>
  );
}
