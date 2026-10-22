import Link from "next/link";
import { ProductWithMeta } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { MessageSquare, ArrowRight } from "lucide-react";

interface ProductCardProps {
  product: ProductWithMeta;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-xl hover:shadow-black/30"
    >
      {/* Subtle gradient glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/0 to-purple-600/0 opacity-0 group-hover:from-violet-600/5 group-hover:to-purple-600/5 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-lg font-bold shadow-lg shadow-violet-900/40">
          {product.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.logo} alt={product.name} className="h-full w-full rounded-xl object-cover" />
          ) : (
            product.name[0].toUpperCase()
          )}
        </div>
        <ArrowRight className="h-4 w-4 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
      </div>

      <h3 className="font-semibold text-zinc-100 group-hover:text-white mb-1.5 transition-colors">
        {product.name}
      </h3>
      <p className="text-sm text-zinc-500 line-clamp-2 flex-1 mb-4">{product.description}</p>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <Avatar src={product.owner.image} name={product.owner.name} size="sm" />
          <span className="text-xs text-zinc-500">{product.owner.name}</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          <MessageSquare className="h-3.5 w-3.5" />
          {product._count.features}
        </span>
      </div>
    </Link>
  );
}
