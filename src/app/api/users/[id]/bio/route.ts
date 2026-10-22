import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (session.user.id !== id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { bio } = await req.json();
  if (typeof bio !== "string") return NextResponse.json({ error: "Invalid bio" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id },
    data: { bio: bio.trim().slice(0, 500) },
    select: { id: true, bio: true },
  });

  return NextResponse.json(user);
}
