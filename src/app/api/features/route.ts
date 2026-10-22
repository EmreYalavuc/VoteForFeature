import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FeatureStatus } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(10).max(1000),
  category: z.string().default("general"),
  productId: z.string(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const statusParam = searchParams.get("status");
  const status = statusParam && statusParam !== "all" ? (statusParam as FeatureStatus) : null;
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") ?? "newest";
  const session = await auth();

  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const where = {
    productId,
    ...(status ? { status } : {}),
    ...(category && category !== "all" ? { category } : {}),
  };

  const features = await prisma.featureRequest.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, image: true } },
      votes: true,
      _count: { select: { comments: true } },
    },
    orderBy:
      sort === "newest"
        ? { createdAt: "desc" }
        : sort === "oldest"
        ? { createdAt: "asc" }
        : { createdAt: "desc" },
  });

  const withMeta = features
    .map((f) => ({
      ...f,
      upvotes: f.votes.filter((v) => v.type === "UP").length,
      downvotes: f.votes.filter((v) => v.type === "DOWN").length,
      userVote: session?.user ? f.votes.find((v) => v.userId === session.user.id) ?? null : null,
    }))
    .sort((a, b) => {
      if (sort === "top") return b.upvotes - a.upvotes;
      if (sort === "trending") {
        const aScore = a.upvotes - a.downvotes;
        const bScore = b.upvotes - b.downvotes;
        return bScore - aScore;
      }
      return 0;
    });

  return NextResponse.json(withMeta);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const feature = await prisma.featureRequest.create({
    data: { ...parsed.data, authorId: session.user.id! },
    include: {
      author: { select: { id: true, name: true, image: true } },
      votes: true,
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json(feature, { status: 201 });
}
