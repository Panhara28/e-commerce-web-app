import { PrismaClient } from "@/lib/generated/prisma";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

async function getAllChildCategoryIds(categoryId: number) {
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
  });
const debugProducts = await prisma.product.findMany({
  where: { categoryId: 11 },
});
console.log("DEBUG DIRECT PRODUCTS:", debugProducts);

  const ids = [categoryId];



  for (const child of children) {
    const childIds = await getAllChildCategoryIds(child.id);
    ids.push(...childIds);
  }

  return ids;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params; // 👈 FIX HERE
  const params = { slug };
  try {
    const category = await prisma.category.findUnique({
      where: { slug: params.slug },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // 1. Get all child and sub-child category IDs
    const allCategoryIds = await getAllChildCategoryIds(category.id);

    // 2. Get products under ANY of those categories
    const products = await prisma.product.findMany({
      where: { categoryId: { in: allCategoryIds } },
      include: {
        media: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      category: category,
      products: products,
    });
  } catch (error) {
    console.error("Category Detail Error:", error);
    return NextResponse.json(
      { error: "Failed to load category" },
      { status: 500 }
    );
  }
}
