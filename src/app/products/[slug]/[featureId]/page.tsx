export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { VoteButton } from "@/components/features/vote-button";
import { Avatar } from "@/components/ui/avatar";
import { CommentSection } from "@/components/features/comment-section";
import { StatusChanger } from "@/components/features/status-changer";
import { STATUS_COLORS, STATUS_LABELS, timeAgo } from "@/lib/utils";
import { ArrowLeft, Pin } from "lucide-react";

interface Props {
  params: Promise<{ slug: string; featureId: string }>;
}

export default async function FeatureDetailPage({ params }: Props) {
  const { slug, featureId } = await params;
  const session = await auth();

  const feature = await prisma.featureRequest.findUnique({
    where: { id: featureId },
    include: {
      author: { select: { id: true, name: true, image: true } },
      product: true,
      votes: true,
      comments: {
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!feature || feature.product.slug !== slug) notFound();

  const upvotes = feature.votes.filter((v) => v.type === "UP").length;
  const downvotes = feature.votes.filter((v) => v.type === "DOWN").length;
  const userVote = session?.user ? feature.votes.find((v) => v.userId === session.user.id) ?? null : null;
  const isProductOwner = feature.product.ownerId === session?.user?.id;
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link href={`/products/${slug}`}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-200 transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" />Back to {feature.product.name}
        </Link>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex gap-4">
          <VoteButton
            featureId={feature.id}
            initialUpvotes={upvotes}
            initialDownvotes={downvotes}
            initialUserVote={userVote}
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-xl font-bold text-zinc-50">
                {feature.pinned && <Pin className="mr-1.5 inline h-4 w-4 text-violet-400" />}
                {feature.title}
              </h1>
              <div className="flex items-center gap-2">
                {(isProductOwner || isAdmin) ? (
                  <StatusChanger featureId={feature.id} currentStatus={feature.status} />
                ) : (
                  <Badge className={STATUS_COLORS[feature.status]}>
                    {STATUS_LABELS[feature.status]}
                  </Badge>
                )}
              </div>
            </div>

            <p className="mt-3 text-zinc-400 leading-relaxed">{feature.description}</p>

            <div className="mt-4 flex items-center gap-3 text-sm text-zinc-600">
              <div className="flex items-center gap-2">
                <Avatar src={feature.author.image} name={feature.author.name} size="sm" />
                <span>{feature.author.name}</span>
              </div>
              <span>·</span>
              <span>{timeAgo(new Date(feature.createdAt))}</span>
              {feature.category !== "general" && (
                <>
                  <span>·</span>
                  <Badge variant="outline">{feature.category}</Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <CommentSection featureId={feature.id} initialComments={feature.comments} />
    </div>
  );
}
