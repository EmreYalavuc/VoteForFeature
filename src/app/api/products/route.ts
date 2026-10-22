import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractDomain, domainToSlug, domainToName } from "@/lib/utils";

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
      ? p.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / p.reviews.length
      : null,
    reviews: undefined,
  }));

  return NextResponse.json(withRating);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { url, listInCommunity = false } = body as { url?: string; listInCommunity?: boolean };

  if (!url) return NextResponse.json({ error: "url gerekli" }, { status: 400 });

  const domain = extractDomain(url);
  if (!domain || domain.length < 3) {
    return NextResponse.json({ error: "Geçersiz URL" }, { status: 400 });
  }

  const slug = domainToSlug(domain);
  const name = domainToName(domain);
  const logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  // Zaten varsa: eğer listInCommunity true ise ve sahibiyse isPublic'i güncelle
  const existing = await prisma.product.findFirst({
    where: { OR: [{ domain }, { slug }] },
  });

  if (existing) {
    if (listInCommunity && existing.ownerId === session.user.id && !existing.isPublic) {
      await prisma.product.update({
        where: { id: existing.id },
        data: { isPublic: true },
      });
    }
    return NextResponse.json({ slug: existing.slug, existing: true });
  }

  // isPublic: sadece developer bilinçli olarak community'ye eklemek isterse true
  const product = await prisma.product.create({
    data: {
      name,
      slug,
      domain,
      description: `${name} hakkında community talepleri ve geri bildirimleri.`,
      logo,
      website: `https://${domain}`,
      category: "WEB",
      techStack: [],
      screenshots: [],
      isPublic: Boolean(listInCommunity),
      ownerId: session.user.id!,
    },
  });

  return NextResponse.json({ slug: product.slug, existing: false }, { status: 201 });
}
