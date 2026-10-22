"use client";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommentWithAuthor } from "@/types";
import { timeAgo } from "@/lib/utils";
import { MessageSquare, Send } from "lucide-react";

interface CommentSectionProps {
  featureId: string;
  initialComments: CommentWithAuthor[];
}

export function CommentSection({ featureId, initialComments }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) { signIn(); return; }
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/features/${featureId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments([...comments, comment]);
        setText("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="border-t border-zinc-800 pt-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300 mb-5">
          <MessageSquare className="h-4 w-4 text-zinc-500" />
          Discussion
          <span className="ml-1 rounded-md bg-zinc-800 px-1.5 py-0.5 text-xs font-medium text-zinc-400">
            {comments.length}
          </span>
        </h2>

        <div className="space-y-4 mb-6">
          {comments.length === 0 ? (
            <p className="text-sm text-zinc-600 italic">No comments yet — start the discussion.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar src={c.author.image} name={c.author.name} size="sm" className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-zinc-200">{c.author.name}</span>
                    <span className="text-xs text-zinc-600">{timeAgo(new Date(c.createdAt))}</span>
                  </div>
                  <div className="rounded-xl rounded-tl-sm border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Compose */}
        <div className="flex gap-3">
          {session && (
            <Avatar src={session.user?.image} name={session.user?.name} size="sm" className="mt-2 shrink-0" />
          )}
          <form onSubmit={submit} className="flex-1 flex gap-2 items-end">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e); }}
              placeholder={session ? "Add a comment... (Ctrl+Enter to send)" : "Sign in to join the discussion"}
              disabled={!session}
              rows={2}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors resize-none disabled:opacity-40"
            />
            {session ? (
              <Button type="submit" size="icon" disabled={loading || !text.trim()} className="shrink-0 mb-0.5">
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" size="sm" onClick={() => signIn()} className="shrink-0">Sign in</Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
