"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  slug: string;
  isPublic: boolean;
}

export function ProductVisibilityToggle({ slug, isPublic: initialPublic }: Props) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${slug}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      if (res.ok) {
        setIsPublic(!isPublic);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={toggle} disabled={loading}
      title={isPublic ? "Community'den kaldır" : "Community'ye ekle"}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
        isPublic
          ? "border-zinc-700 text-zinc-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
          : "border-violet-700/40 bg-violet-700/10 text-violet-400 hover:bg-violet-700/20"
      }`}>
      {isPublic
        ? <><EyeOff className="h-3.5 w-3.5" /> Community&apos;den Kaldır</>
        : <><Eye className="h-3.5 w-3.5" /> Community&apos;ye Ekle</>
      }
    </button>
  );
}
