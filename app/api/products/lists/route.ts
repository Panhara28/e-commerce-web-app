import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const search = searchParams.get("search") || "";
    const sku = searchParams.get("sku") || "";
    const categoryId = searchParams.get("category");

    const skip = (page - 1) * limit;

    // 🔍 WHERE CLAUSE
    const where: Prisma.ProductWhereInput = {
      // ⛔ EXCLUDE DELETED
      status: {
        in: ["DRAFT", "PUBLISHED", "RECOVERED"],
      },
    };

    const orFilters: Prisma.ProductWhereInput[] = [];

    if (search) {
      orFilters.push({
        title: { contains: search },
      });
    }

    if (sku) {
      orFilters.push({
        productCode: { contains: sku },
      });
    }

    // Attach OR search filters
    if (orFilters.length > 0) {
      where.OR = orFilters;
    }

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    // 🛢 Fetch data
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        productCode: true,
        title: true,
        price: true,
        Category: { select: { name: true } },
      },
    });

    const total = await prisma.product.count({ where });

    return NextResponse.json({
      status: "ok",
      page,
      limit,
      total,
      data: products.map((p) => ({
        id: p.id,
        sku: p.productCode,
        name: p.title,
        price: p.price,
        category: p.Category?.name ?? null,
        slug: p.slug,
      })),
    });
  } catch (err) {
    console.error("❌ Failed to load products list:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to load product list" },
      { status: 500 }
    );
  }
}
