import { PrismaClient } from "@/lib/generated/prisma";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // ---------------------
    // Validate Required Fields
    // ---------------------
    if (!payload.title) {
      return NextResponse.json(
        { message: "Missing required fields: title or vendor" },
        { status: 400 }
      );
    }

    // ---------------------
    // Create Product
    // ---------------------
    const product = await prisma.product.create({
      data: {
        slug: uuidv4(),
        title: payload.title,
        description: payload.description ?? {},
        categoryId: payload.categoryId ? Number(payload.categoryId) : null,

        productCode: payload.productCode || null,
        status: payload.status || "draft",

        // Prices
        price: payload.price ?? 0,

        // Additional UI Pricing
        salePriceHold: payload.salePriceHold ?? 0,
        discountHold: payload.discountHold ?? 0,
        salePricePremium: payload.salePricePremium ?? 0,
        discountPremium: payload.discountPremium ?? 0,

        // Variants created later
      },
    });

    // ---------------------
    // Create Variants
    // ---------------------
    if (payload.variants?.length) {
      await prisma.variant.createMany({
        data: payload.variants.map((v: any) => ({
          slug: uuidv4(),
          productId: product.id,

          size: v.size ?? "",
          color: v.color ?? "",
          material: v.material ?? "",

          price: v.price ?? 0,
          stock: v.stock ?? 0,
          imageVariant: v.imageVariant ?? "",
          barcode: v.barcode ?? "",

          // Sub-variants must be created separately
        })),
      });
    }

    // ---------------------
    // Media URLs
    // ---------------------
    if (payload.mediaUrls?.length) {
      await prisma.mediaProductDetails.createMany({
        data: payload.mediaUrls.map((m: any) => ({
          slug: uuidv4(),
          productId: product.id,
          url: m.url,
        })),
      });
    }

    return NextResponse.json(
      {
        status: "ok",
        message: "Product created successfully.",
        productId: product.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to create product.",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
