// /app/api/views/products/lists/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch products with needed fields only (optimized)
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        productCode: true,
        slug: true,

        // One preview image (or null)
        media: {
          select: {
            url: true,
          },
          where: {
            isDeleted: false,
          },
          take: 1,
        },

        // Variants
        variants: {
          select: {
            id: true,
            color: true,
            size: true,
            imageVariant: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error("❌ Product List Error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product list",
      },
      { status: 500 }
    );
  }
}
