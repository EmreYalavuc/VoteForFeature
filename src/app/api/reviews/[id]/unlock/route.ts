import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const review = await prisma.review.findUnique({
    where: { id },
    include: { product: { select: { ownerId: true } } },
  });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only the product owner needs to unlock
  if (review.product.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Only the product owner needs to unlock reviews" }, { status: 403 });
  }

  const unlock = await prisma.reviewUnlock.upsert({
    where: { reviewId_userId: { reviewId: id, userId: session.user.id } },
    create: { reviewId: id, userId: session.user.id },
    update: {},
  });

  return NextResponse.json({ unlock });
}
