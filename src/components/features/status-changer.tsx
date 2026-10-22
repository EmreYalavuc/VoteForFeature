"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FeatureStatus } from "@prisma/client";
import { STATUS_COLORS, STATUS_DOT, STATUS_LABELS } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusChangerProps {
  featureId: string;
  currentStatus: FeatureStatus;
}

const STATUSES = Object.keys(STATUS_LABELS) as FeatureStatus[];

export function StatusChanger({ featureId, currentStatus }: StatusChangerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<FeatureStatus>(currentStatus);

  async function change(newStatus: FeatureStatus) {
    setOpen(false);
    if (newStatus === status) return;
    setStatus(newStatus);
    await fetch(`/api/features/${featureId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all hover:opacity-80",
          STATUS_COLORS[status]
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
        {STATUS_LABELS[status]}
        <ChevronDown className="h-3 w-3 ml-0.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 shadow-xl shadow-black/50">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => change(s)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-zinc-800",
                  s === status ? "text-zinc-100" : "text-zinc-400"
                )}
              >
                <span className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[s])} />
                {STATUS_LABELS[s]}
                {s === status && <span className="ml-auto text-violet-400 text-xs">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
