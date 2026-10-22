"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, X, Lightbulb } from "lucide-react";
import { CATEGORIES } from "@/lib/utils";
import { useSession, signIn } from "next-auth/react";

interface NewFeatureDialogProps {
  productId: string;
}

export function NewFeatureDialog({ productId }: NewFeatureDialogProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "general" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) { signIn(); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productId }),
      });
      if (res.ok) {
        setOpen(false);
        setForm({ title: "", description: "", category: "general" });
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => session ? setOpen(true) : signIn()}>
        <Plus className="h-4 w-4" />
        New request
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/60">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/20">
                  <Lightbulb className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <h2 className="font-semibold text-zinc-100">Submit a feature request</h2>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submit} className="p-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Title</label>
                <input
                  type="text"
                  required
                  minLength={5}
                  maxLength={120}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Short, descriptive title for the feature..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Description</label>
                <textarea
                  required
                  minLength={10}
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the feature and why it would be valuable..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-zinc-900">{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" size="md" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
