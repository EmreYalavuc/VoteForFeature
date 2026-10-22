export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { FeatureStatus, FeatureWithMeta } from "@/types";
import { STATUS_COLORS, STATUS_DOT, STATUS_LABELS, timeAgo } from "@/lib/utils";
import { ArrowLeft, ChevronUp } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

const ROADMAP_COLUMNS: FeatureStatus[] = ["PLANNED", "IN_PROGRESS", "DONE"];

export default async function RoadmapPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const session = await auth();

  const features = await prisma.featureRequest.findMany({
    where: { productId: product.id, status: { in: ROADMAP_COLUMNS } },
    include: {
      author: { select: { id: true, name: true, image: true } },
      votes: true,
      _count: { select: { comments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const withMeta = features.map((f) => ({
    ...f,
    upvotes: f.votes.filter((v) => v.type === "UP").length,
    downvotes: f.votes.filter((v) => v.type === "DOWN").length,
    userVote: session?.user ? f.votes.find((v) => v.userId === session.user.id) ?? null : null,
  }));

  const byStatus = (status: FeatureStatus) => withMeta.filter((f) => f.status === status);

  return (
    <div>
      <div className="mb-6">
        <Link href={`/products/${slug}`}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-200 transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" />Back to {product.name}
        </Link>
      </div>

      <h1 className="mb-1 text-2xl font-bold text-zinc-50">{product.name} <span className="text-zinc-600">— Roadmap</span></h1>
      <p className="mb-8 text-sm text-zinc-500">Track what&apos;s planned, in progress, and shipped.</p>

      <div className="grid gap-4 md:grid-cols-3">
        {ROADMAP_COLUMNS.map((status) => {
          const items = byStatus(status);
          return (
            <div key={status} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[status]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
                  {STATUS_LABELS[status]}
                </span>
                <span className="text-xs text-zinc-600 font-medium">{items.length}</span>
              </div>

              <div className="space-y-3">
                {items.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-zinc-800 p-5 text-center text-xs text-zinc-600">
                    Nothing here yet
                  </div>
                ) : (
                  items.map((f) => (
                    <Link
                      key={f.id}
                      href={`/products/${slug}/${f.id}`}
                      className="block rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
                    >
                      <p className="font-medium text-zinc-200 text-sm line-clamp-2">{f.title}</p>
                      <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{f.description}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
                        <span>{timeAgo(new Date(f.updatedAt))}</span>
                        <span className="flex items-center gap-1 text-violet-400">
                          <ChevronUp className="h-3.5 w-3.5" />
                          {f.upvotes}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
