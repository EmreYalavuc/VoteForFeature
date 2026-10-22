"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, Clock, ArrowUp } from "lucide-react";

const SORTS = [
  { value: "newest", label: "Newest", icon: Clock },
  { value: "top", label: "Top", icon: ArrowUp },
  { value: "trending", label: "Trending", icon: TrendingUp },
];

const STATUSES = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "PLANNED", label: "Planned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Shipped" },
  { value: "REJECTED", label: "Rejected" },
];

interface FeatureFiltersProps {
  categories: string[];
}

export function FeatureFilters({ categories }: FeatureFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const set = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const current = {
    sort: searchParams.get("sort") ?? "newest",
    status: searchParams.get("status") ?? "all",
    category: searchParams.get("category") ?? "all",
  };

  return (
    <div className="mb-6 space-y-3">
      {/* Sort pills */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-fit">
        {SORTS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.value}
              onClick={() => set("sort", s.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                current.sort === s.value
                  ? "bg-zinc-700 text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => set("status", s.value)}
            className={cn(
              "rounded-lg border px-3 py-1 text-xs font-medium transition-all",
              current.status === s.value
                ? "border-violet-500/50 bg-violet-500/10 text-violet-400"
                : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-2">
        {["all", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => set("category", c)}
            className={cn(
              "rounded-lg border px-3 py-1 text-xs font-medium transition-all capitalize",
              current.category === c
                ? "border-violet-500/50 bg-violet-500/10 text-violet-400"
                : "border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
