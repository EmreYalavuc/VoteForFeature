import Link from "next/link";
import { FeatureWithMeta } from "@/types";
import { Badge } from "@/components/ui/badge";
import { VoteButton } from "./vote-button";
import { Avatar } from "@/components/ui/avatar";
import { MessageSquare, Pin } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, STATUS_DOT, timeAgo } from "@/lib/utils";

interface FeatureCardProps {
  feature: FeatureWithMeta;
  productSlug: string;
}

export function FeatureCard({ feature, productSlug }: FeatureCardProps) {
  return (
    <div className="group flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900">
      <VoteButton
        featureId={feature.id}
        initialUpvotes={feature.upvotes}
        initialDownvotes={feature.downvotes}
        initialUserVote={feature.userVote}
      />

      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex flex-wrap items-start gap-2 mb-1.5">
          <Link
            href={`/products/${productSlug}/${feature.id}`}
            className="font-medium text-zinc-100 hover:text-white transition-colors line-clamp-1 group-hover:text-white"
          >
            {feature.pinned && <Pin className="mr-1 inline h-3.5 w-3.5 text-violet-400 -mt-0.5" />}
            {feature.title}
          </Link>
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[feature.status]}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[feature.status]}`} />
              {STATUS_LABELS[feature.status]}
            </span>
            {feature.category !== "general" && (
              <Badge variant="outline" className="text-xs">{feature.category}</Badge>
            )}
          </div>
        </div>

        <p className="text-sm text-zinc-500 line-clamp-2 mb-2.5">{feature.description}</p>

        <div className="flex items-center gap-3 text-xs text-zinc-600">
          <div className="flex items-center gap-1.5">
            <Avatar src={feature.author.image} name={feature.author.name} size="sm" />
            <span>{feature.author.name}</span>
          </div>
          <span>·</span>
          <span>{timeAgo(new Date(feature.createdAt))}</span>
          <span>·</span>
          <Link href={`/products/${productSlug}/${feature.id}`} className="flex items-center gap-1 hover:text-zinc-400 transition-colors">
            <MessageSquare className="h-3.5 w-3.5" />
            {feature._count.comments}
          </Link>
        </div>
      </div>
    </div>
  );
}
