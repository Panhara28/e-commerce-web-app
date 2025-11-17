import { PrismaClient } from "@/lib/generated/prisma";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params; // 👈 FIX HERE
  const params = { slug };
  try {
    const productSlug = params.slug;
    const payload = await req.json();
    // ---------------------
    // Validate Required Fields
    // ---------------------
    if (!productSlug || !payload.title) {
      return NextResponse.json(
        { message: "Missing required fields: slug or title" },
        { status: 400 }
      );
    }

    // ---------------------
    // Find Product by Slug
    // ---------------------
    const existingProduct = await prisma.product.findUnique({
      where: { slug: productSlug },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const productId = existingProduct.id;

    // ---------------------
    // Update Product
    // ---------------------
    const updatedProduct = await prisma.product.update({
      where: { slug: productSlug },
      data: {
        title: payload.title,

        // ✅ Save HTML + text exactly as provided
        description: payload.description ?? {},
        categoryId: payload.categoryId ? Number(payload.categoryId) : null,

        productCode: payload.productCode || null,
        status: payload.status || "DRAFT",

        price: payload.price ?? 0,

        salePriceHold: payload.salePriceHold ?? 0,
        discountHold: payload.discountHold ?? 0,
        salePricePremium: payload.salePricePremium ?? 0,
        discountPremium: payload.discountPremium ?? 0,
        discount: payload.discount ?? 0,
      },
    });

    // ---------------------
    // Reset Variants (delete then recreate)
    // ---------------------
    await prisma.variant.deleteMany({
      where: { productId },
    });

    if (payload.variants?.length) {
      const flatVariants = [];

      for (const v of payload.variants) {
        // parent variant (no sub variants)
        if (!v.sub_variants?.length) {
          flatVariants.push({
            slug: uuidv4(),
            productId,
            size: v.size ?? "",
            color: v.color ?? "",
            material: v.material ?? "",
            price: v.price ?? 0,
            stock: v.stock ?? 0,
            imageVariant: v.imageVariant ?? "",
            barcode: v.barcode ?? "",
          });
        } else {
          // sub variants
          for (const sub of v.sub_variants) {
            flatVariants.push({
              slug: uuidv4(),
              productId,
              size: v.size ?? "",
              color: sub.color ?? "",
              material: sub.material ?? "",
              price: sub.price ?? 0,
              stock: sub.stock ?? 0,
              imageVariant: sub.imageVariant ?? "",
              barcode: sub.sku ?? "",
            });
          }
        }
      }

      await prisma.variant.createMany({
        data: flatVariants,
      });
    }

    // ---------------------
    // Reset Media URLs (delete then recreate)
    // ---------------------
    await prisma.mediaProductDetails.deleteMany({
      where: { productId },
    });

    if (payload.mediaUrls?.length) {
      await prisma.mediaProductDetails.createMany({
        data: payload.mediaUrls.map((m: any) => ({
          slug: uuidv4(),
          productId,
          url: m.url,
        })),
      });
    }

    // ---------------------
    // Response
    // ---------------------
    return NextResponse.json(
      {
        status: "ok",
        message: "Product updated successfully.",
        productSlug,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to update product.",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
