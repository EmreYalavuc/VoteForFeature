export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_COLORS, STATUS_LABELS, timeAgo } from "@/lib/utils";
import { Plus, ExternalLink, ChevronUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const products = await prisma.product.findMany({
    where: { ownerId: session.user.id! },
    include: {
      _count: { select: { features: true } },
      features: {
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          votes: true,
          _count: { select: { comments: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const myRequests = await prisma.featureRequest.findMany({
    where: { authorId: session.user.id! },
    include: {
      product: { select: { name: true, slug: true } },
      votes: true,
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-50">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your products and track your requests.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* My Products */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-300">My Products <span className="text-zinc-600">({products.length})</span></h2>
            <Link href="/">
              <Button size="sm"><Plus className="h-3.5 w-3.5" />Add product</Button>
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-zinc-800 py-12 text-center">
              <p className="text-sm text-zinc-500">No products yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((p) => (
                <div key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold shadow-sm">
                        {p.name[0].toUpperCase()}
                      </div>
                      <span className="font-semibold text-zinc-100">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-600">{p._count.features} requests</span>
                      <Link href={`/products/${p.slug}`} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  {p.features.length > 0 && (
                    <div className="space-y-1 border-t border-zinc-800 pt-2 mt-2">
                      {p.features.map((f) => {
                        const upvotes = f.votes.filter((v) => v.type === "UP").length;
                        return (
                          <Link
                            key={f.id}
                            href={`/products/${p.slug}/${f.id}`}
                            className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-zinc-800 transition-colors text-sm"
                          >
                            <span className="text-zinc-400 line-clamp-1">{f.title}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge className={`text-xs ${STATUS_COLORS[f.status]}`}>
                                {STATUS_LABELS[f.status]}
                              </Badge>
                              <span className="flex items-center gap-0.5 text-xs text-zinc-600">
                                <ChevronUp className="h-3.5 w-3.5" />{upvotes}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Requests */}
        <div>
          <h2 className="mb-4 font-semibold text-zinc-300">My Requests <span className="text-zinc-600">({myRequests.length})</span></h2>
          {myRequests.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-zinc-800 py-12 text-center">
              <p className="text-sm text-zinc-500">You haven&apos;t submitted any requests yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myRequests.map((f) => {
                const upvotes = f.votes.filter((v) => v.type === "UP").length;
                return (
                  <Link
                    key={f.id}
                    href={`/products/${f.product.slug}/${f.id}`}
                    className="block rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
                  >
                    <p className="text-sm font-medium text-zinc-200 line-clamp-1">{f.title}</p>
                    <div className="mt-1.5 flex items-center justify-between text-xs text-zinc-500">
                      <span>{f.product.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={`${STATUS_COLORS[f.status]}`}>
                          {STATUS_LABELS[f.status]}
                        </Badge>
                        <span className="flex items-center gap-0.5">
                          <ChevronUp className="h-3 w-3" />{upvotes}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
