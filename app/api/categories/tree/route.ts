import { PrismaClient } from "@/lib/generated/prisma";
import { NextResponse } from "next/server";

const prisma: any = new PrismaClient();

async function getCategoryTree(parentId: number | null = null) {
  const categories = await prisma.category.findMany({
    where: { parentId },
    orderBy: { name: "asc" },
  });

  const result = await Promise.all(
    categories.map(async (category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      children: await getCategoryTree(category.id),
    }))
  );

  return result;
}

export async function GET() {
  try {
    const tree = await getCategoryTree(null);
    return NextResponse.json(tree);
  } catch (error) {
    console.error("Category Tree Error:", error);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}
