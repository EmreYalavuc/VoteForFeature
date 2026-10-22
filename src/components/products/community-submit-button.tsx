"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, X, Globe } from "lucide-react";
import { useSession, signIn } from "next-auth/react";

export function CommunitySubmitButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) { signIn(); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, listInCommunity: true }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Bir hata oluştu."); return; }
      setOpen(false);
      setUrl("");
      router.push(`/products/${data.slug}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => session ? setOpen(true) : signIn()}>
        <Plus className="h-4 w-4" />
        Uygulamanı Ekle
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/8 bg-[#141b2e] shadow-2xl shadow-black/80">
            <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-700/25">
                  <Globe className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <h2 className="font-semibold text-zinc-100">Community&apos;ye Ekle</h2>
              </div>
              <button onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 pt-5 pb-2">
              <p className="text-sm text-zinc-400 leading-relaxed">
                Kendi geliştirdiğin sitenin URL&apos;sini gir. Uygulaman community vitrininde listelenir,
                diğer geliştiriciler test edip yorum bırakabilir.
              </p>
            </div>

            <form onSubmit={submit} className="px-6 pb-6 pt-3 space-y-4">
              <input
                type="text"
                required
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(""); }}
                placeholder="https://benim-uygulama.com"
                className="w-full rounded-full border border-white/8 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-colors"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>İptal</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Ekleniyor..." : "Community'ye Ekle"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
