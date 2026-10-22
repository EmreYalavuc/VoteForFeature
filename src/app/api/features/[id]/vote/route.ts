import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VoteType } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: featureId } = await params;
  const { type }: { type: VoteType } = await req.json();

  if (!["UP", "DOWN"].includes(type)) {
    return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
  }

  const existing = await prisma.vote.findUnique({
    where: { featureId_userId: { featureId, userId: session.user.id! } },
  });

  if (existing) {
    if (existing.type === type) {
      // retract vote
      await prisma.vote.delete({ where: { id: existing.id } });
    } else {
      // change vote type
      await prisma.vote.update({ where: { id: existing.id }, data: { type } });
    }
  } else {
    await prisma.vote.create({ data: { featureId, userId: session.user.id!, type } });
  }

  const votes = await prisma.vote.findMany({ where: { featureId } });
  return NextResponse.json({
    upvotes: votes.filter((v) => v.type === "UP").length,
    downvotes: votes.filter((v) => v.type === "DOWN").length,
    userVote: votes.find((v) => v.userId === session.user.id!) ?? null,
  });
}
