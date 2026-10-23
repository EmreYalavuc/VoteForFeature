import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (session.user.id !== id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { image } = await req.json();
  if (typeof image !== "string" || image.length > 500) {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { image: image || null },
    select: { id: true, image: true },
  });

  return NextResponse.json(user);
}
