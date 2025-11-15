import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
const prisma: any = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params; // 👈 FIX HERE

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        Category: true,
        variants: true,
        media: true,
        MediaProductDetails: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...product,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET PRODUCT DETAIL ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
