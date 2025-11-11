import { PrismaClient } from "@/lib/generated/prisma";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// --- DTO Types ---
interface SubVariant {
  color?: string;
  material?: string;
  price: number;
  stock: number;
  sku?: string;
  imageVariant?: string;
}

interface Variant {
  size?: string;
  color?: string;
  material?: string;
  price: number;
  stock: number;
  sku?: string;
  imageVariant?: string;
  sub_variants?: SubVariant[];
}

interface CreateProductDto {
  title: string;
  description?: object;
  categoryId?: number;
  type?: string;
  vendor: string;
  price?: number;
  compareAtPrice?: number;
  costPerItem?: number;
  variants?: Variant[];
  mediaUrls?: Array<{ url: string }>;
}

// -----------------------------------------------------------------------------
// POST /api/products/add
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

    // ✅ Flatten nested sub_variants to a single array
    const flatVariants = payload.variants
      ? payload.variants.flatMap((variant) => {
          if (variant.sub_variants && variant.sub_variants.length > 0) {
            return variant.sub_variants.map((sub) => ({
              slug: uuidv4(),
              size: variant.size ?? "",
              color: sub.color ?? variant.color ?? "",
              material: sub.material ?? variant.material ?? "",
              price: sub.price ?? variant.price ?? 0,
              stock: sub.stock ?? variant.stock ?? 0,
              sku: sub.sku ?? variant.sku ?? "",
              imageVariant: sub.imageVariant ?? variant.imageVariant ?? "",
              compareAtPrice: payload.compareAtPrice,
              costPerItem: payload.costPerItem,
            }));
          }

          // If variant has no sub-variants
          return [
            {
              slug: uuidv4(),
              size: variant.size ?? "",
              color: variant.color ?? "",
              material: variant.material ?? "",
              price: variant.price ?? 0,
              stock: variant.stock ?? 0,
              sku: variant.sku ?? "",
              imageVariant: variant.imageVariant ?? "",
              compareAtPrice: payload.compareAtPrice,
              costPerItem: payload.costPerItem,
            },
          ];
        })
      : [];

    // ✅ Create product
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
        variants: {
          create: flatVariants,
        },
      },
      include: { variants: true },
    });

    // ✅ Optional media URLs
    if (payload.mediaUrls?.length) {
      await prisma.mediaProductDetails.createMany({
        data: payload.mediaUrls.map((media) => ({
          url: media.url,
          productId: createdProduct.id,
          slug: uuidv4(),
        })),
      });
    }

    // ✅ Return clean success response
    return NextResponse.json(
      {
        status: "ok",
        message: "✅ Product has been created successfully.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("❌ Error creating product:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "❌ Failed to create product.",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
