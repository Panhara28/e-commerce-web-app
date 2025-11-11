import { PrismaClient } from "@/lib/generated/prisma";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// --- DTO Type ---
interface CreateProductDto {
  title: string;
  description?: object;
  categoryId?: number;
  type?: string;
  vendor: string;
  price?: number;
  compareAtPrice?: number;
  costPerItem?: number;
  variants?: Array<{
    size?: string;
    color?: string;
    material?: string;
    price: number;
    compareAtPrice?: number;
    costPerItem?: number;
    stock: number;
    sku: string;
    imageVariant?: string;
  }>;
  mediaUrls?: Array<{ url: string }>;
}

// -----------------------------------------------------------------------------
// POST /api/products
// -----------------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const payload: CreateProductDto = await req.json();

    if (!payload.title || !payload.vendor) {
      return NextResponse.json(
        { message: "Missing required fields: title or vendor" },
        { status: 400 }
      );
    }

    const createdProduct = await prisma.product.create({
      data: {
        slug: uuidv4(),
        title: payload.title,
        description: payload.description ?? {},
        categoryId: payload.categoryId ? Number(payload.categoryId) : undefined,
        type: payload.type ?? "",
        vendor: payload.vendor,
        price: payload.price ?? 0,
        compareAtPrice: payload.compareAtPrice,
        costPerItem: payload.costPerItem,
        variants: payload.variants
          ? {
              create: payload.variants.map((variant) => ({
                slug: uuidv4(),
                size: variant.size ?? "",
                color: variant.color ?? "",
                material: variant.material ?? "",
                price: variant.price ?? 0,
                compareAtPrice: variant.compareAtPrice,
                costPerItem: variant.costPerItem,
                stock: variant.stock ?? 0,
                sku: variant.sku ?? "",
                imageVariant: variant.imageVariant ?? "",
              })),
            }
          : undefined,
      },
      include: {
        variants: true,
      },
    });

    // Optional: Create media records if provided
    if (payload.mediaUrls?.length) {
      await prisma.mediaProductDetails.createMany({
        data: payload.mediaUrls.map((media) => ({
          url: media.url,
          productId: createdProduct.id,
          slug: uuidv4(),
        })),
      });
    }

    return NextResponse.json(createdProduct, { status: 201 });
  } catch (error: unknown) {
    console.error("❌ Error creating product:", error);
    return NextResponse.json(
      { message: "Failed to create product", error: String(error) },
      { status: 500 }
    );
  }
}
