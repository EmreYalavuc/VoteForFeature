import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (product.ownerId === session.user.id) {
    return NextResponse.json({ error: "Cannot review your own product" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const review = await prisma.review.upsert({
    where: { productId_authorId: { productId: product.id, authorId: session.user.id! } },
    update: parsed.data,
    create: { ...parsed.data, productId: product.id, authorId: session.user.id! },
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json(review);
}
