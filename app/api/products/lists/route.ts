import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

/**
 * GET /api/products
 * Returns: id, sku(productCode), name(title), price, category(name), slug
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category");

    const skip = (page - 1) * limit;

    // ⛔ FIXED: no any, fully typed
    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { productCode: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

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
