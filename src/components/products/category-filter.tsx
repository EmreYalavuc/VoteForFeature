"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface CategoryFilterProps {
  categories: readonly { readonly value: string; readonly label: string; readonly emoji: string }[];
  counts: Record<string, number>;
  totalCount: number;
  activeCategory: string;
}

export function CategoryFilter({ categories, counts, totalCount, activeCategory }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const set = useCallback((cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "all") params.delete("category");
    else params.set("category", cat);
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const all = [{ value: "all", label: "All", emoji: "✦", count: totalCount }, ...categories.map((c) => ({ ...c, count: counts[c.value] ?? 0 }))];

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {all.filter((c) => c.value === "all" || c.count > 0).map((c) => (
        <button key={c.value} onClick={() => set(c.value)}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
            activeCategory === c.value
              ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
              : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
          }`}>
          <span>{c.emoji}</span>
          <span>{c.label}</span>
          <span className={`text-xs ${activeCategory === c.value ? "text-violet-200" : "text-zinc-600"}`}>
            {c.count}
          </span>
        </button>
      ))}
    </div>
  );
}
