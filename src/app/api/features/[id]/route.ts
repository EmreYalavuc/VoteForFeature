import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FeatureStatus } from "@prisma/client";
import { z } from "zod";

const updateSchema = z.object({
  status: z.nativeEnum(FeatureStatus).optional(),
  pinned: z.boolean().optional(),
  title: z.string().min(5).max(120).optional(),
  description: z.string().min(10).max(1000).optional(),
  category: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const feature = await prisma.featureRequest.findUnique({ where: { id }, include: { product: true } });
  if (!feature) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = feature.authorId === session.user.id;
  const isProductOwner = feature.product.ownerId === session.user.id;
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";

  if (!isOwner && !isProductOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Only product owners / admins can change status/pinned
  if ((parsed.data.status || parsed.data.pinned !== undefined) && !isProductOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.featureRequest.update({
    where: { id },
    data: parsed.data,
    include: {
      author: { select: { id: true, name: true, image: true } },
      votes: true,
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const feature = await prisma.featureRequest.findUnique({ where: { id }, include: { product: true } });
  if (!feature) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = feature.authorId === session.user.id;
  const isProductOwner = feature.product.ownerId === session.user.id;
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";

  if (!isOwner && !isProductOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.featureRequest.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
