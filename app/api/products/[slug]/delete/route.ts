// /app/api/products/[slug]/delete/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, ProductStatus } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function DELETE(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params; // 👈 FIX HERE

    const product = await prisma.product.update({
      where: { slug },
      data: { status: ProductStatus.DELETED },
    });

    return NextResponse.json({
      status: "ok",
      message: "Product moved to DELETED state.",
      slug: product.slug,
    });
  } catch (error) {
    console.error("❌ DELETE product failed:", error);

    return NextResponse.json(
      { status: "error", message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
