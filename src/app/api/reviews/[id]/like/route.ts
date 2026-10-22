import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { type } = await req.json(); // "LIKE" | "DISLIKE"

  if (type !== "LIKE" && type !== "DISLIKE") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (review.authorId === session.user.id) {
    return NextResponse.json({ error: "Cannot like your own review" }, { status: 403 });
  }

  const existing = await prisma.reviewLike.findUnique({
    where: { reviewId_userId: { reviewId: id, userId: session.user.id } },
  });

  if (existing) {
    if (existing.type === type) {
      // toggle off
      await prisma.reviewLike.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: "removed" });
    } else {
      // switch like/dislike
      const updated = await prisma.reviewLike.update({
        where: { id: existing.id },
        data: { type },
      });
      return NextResponse.json({ action: "switched", like: updated });
    }
  }

  const like = await prisma.reviewLike.create({
    data: { reviewId: id, userId: session.user.id, type },
  });
  return NextResponse.json({ action: "created", like });
}
