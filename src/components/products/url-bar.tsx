"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Search, ArrowRight, Loader2 } from "lucide-react";

export function UrlBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) { signIn(); return; }
    if (!url.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Geçersiz URL."); setLoading(false); return; }
      router.push(`/products/${data.slug}`);
    } catch {
      setError("Bağlantı hatası.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={submit}>
        <div className="group relative flex items-center gap-0 rounded-full border border-white/10 bg-[#0d1020] p-1.5 shadow-2xl shadow-black/60 transition-all duration-300 focus-within:border-violet-700/60 focus-within:shadow-violet-900/20">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center text-zinc-600 group-focus-within:text-violet-400 transition-colors duration-300">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            placeholder="figma.com, notion.so, github.com..."
            className="flex-1 bg-transparent py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none tracking-wide"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="flex h-10 items-center gap-2 rounded-full bg-violet-700 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition-all duration-300 hover:bg-violet-500 hover:-translate-y-px disabled:opacity-50 disabled:pointer-events-none tracking-wide"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>Araştır <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-3 text-center text-xs text-red-400">{error}</p>
      )}

      <p className="mt-4 text-center text-xs text-zinc-600 tracking-wide">
        Aynı domain için yapılan tüm istekler ortak havuzda toplanır
      </p>
    </div>
  );
}
