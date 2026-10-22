"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, X, Package, ChevronDown, Check } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { PRODUCT_CATEGORIES, TECH_STACK_OPTIONS } from "@/lib/utils";

const inputCls =
  "w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors";

interface Form {
  name: string;
  description: string;
  website: string;
  demoUrl: string;
  category: string;
  techStack: string[];
}

export function NewProductButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [techOpen, setTechOpen] = useState(false);
  const [form, setForm] = useState<Form>({
    name: "", description: "", website: "", demoUrl: "", category: "OTHER", techStack: [],
  });

  function toggleTech(t: string) {
    setForm((f) => ({
      ...f,
      techStack: f.techStack.includes(t)
        ? f.techStack.filter((x) => x !== t)
        : f.techStack.length < 8 ? [...f.techStack, t] : f.techStack,
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isPublic: true }),
      });
      if (res.ok) {
        setOpen(false);
        setForm({ name: "", description: "", website: "", demoUrl: "", category: "OTHER", techStack: [] });
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  function close() { setOpen(false); setTechOpen(false); }

  return (
    <>
      <Button onClick={() => session ? setOpen(true) : signIn()}>
        <Plus className="h-4 w-4" />
        Add your app
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={close} />
          <div className="relative z-10 w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/80 mb-10">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/20">
                  <Package className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <h2 className="font-semibold text-zinc-100">Showcase your app</h2>
              </div>
              <button onClick={close} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">App name</label>
                <input type="text" required minLength={2} maxLength={60} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="My Awesome App" className={inputCls} />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Description</label>
                <textarea required minLength={10} rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What does your app do? What problem does it solve?"
                  className={`${inputCls} resize-none`} />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Category</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {PRODUCT_CATEGORIES.map((c) => (
                    <button key={c.value} type="button"
                      onClick={() => setForm({ ...form, category: c.value })}
                      className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs transition-all ${
                        form.category === c.value
                          ? "border-violet-500/60 bg-violet-500/10 text-violet-300"
                          : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                      }`}>
                      <span className="text-base">{c.emoji}</span>
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tech stack */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Tech stack <span className="text-zinc-600 font-normal">(up to 8)</span>
                </label>
                <button type="button" onClick={() => setTechOpen(!techOpen)}
                  className={`${inputCls} flex items-center justify-between`}>
                  <span className={form.techStack.length ? "text-zinc-300" : "text-zinc-600"}>
                    {form.techStack.length ? form.techStack.join(", ") : "Select technologies..."}
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${techOpen ? "rotate-180" : ""}`} />
                </button>
                {techOpen && (
                  <div className="mt-1 rounded-lg border border-zinc-800 bg-zinc-900 p-3 grid grid-cols-3 gap-1">
                    {TECH_STACK_OPTIONS.map((t) => (
                      <button key={t} type="button" onClick={() => toggleTech(t)}
                        className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-all ${
                          form.techStack.includes(t)
                            ? "bg-violet-500/15 text-violet-300"
                            : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                        }`}>
                        {t}
                        {form.techStack.includes(t) && <Check className="h-3 w-3" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* URLs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Website <span className="text-zinc-600 font-normal">(optional)</span>
                  </label>
                  <input type="url" value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://yourapp.com" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Live demo <span className="text-zinc-600 font-normal">(optional)</span>
                  </label>
                  <input type="url" value={form.demoUrl}
                    onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
                    placeholder="https://demo.yourapp.com" className={inputCls} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Listing..." : "List on showcase"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
