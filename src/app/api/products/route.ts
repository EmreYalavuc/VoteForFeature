import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { ProductCategory } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().min(10).max(500),
  website: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
  category: z.nativeEnum(ProductCategory).default("OTHER"),
  techStack: z.array(z.string()).max(10).default([]),
  isPublic: z.boolean().default(true),
});

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isPublic: true },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      _count: { select: { features: true, reviews: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const withRating = products.map((p) => ({
    ...p,
    avgRating: p.reviews.length
      ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
      : null,
    reviews: undefined,
  }));

  return NextResponse.json(withRating);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, description, website, demoUrl, category, techStack, isPublic } = parsed.data;
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let i = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const product = await prisma.product.create({
    data: {
      name, slug, description,
      website: website || null,
      demoUrl: demoUrl || null,
      category,
      techStack,
      isPublic,
      ownerId: session.user.id!,
    },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      _count: { select: { features: true, reviews: true } },
    },
  });

  return NextResponse.json(product, { status: 201 });
}
