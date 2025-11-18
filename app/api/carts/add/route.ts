// /app/api/cart/add/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

/*
  Body:
  {
    "customerSlug": "",
    "productId": 1,
    "variantId": 2,
    "quantity": 1
  }
*/

export async function POST(req: Request) {
  try {
    const { customerSlug, productId, variantId, quantity } = await req.json();

    if (!customerSlug || !productId || !quantity) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // find customer
    const customer = await prisma.customer.findUnique({
      where: { slug: customerSlug },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // find/create a cart
    let cart = await prisma.cart.findFirst({
      where: { customerId: customer.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          customerId: customer.id,
        },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || undefined,
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQty,
          total: existingItem.price * newQty,
        },
      });

      return NextResponse.json({ message: "Quantity updated" });
    }

    // find price (product or variant)
    let price = 0;

    if (variantId) {
      const variant = await prisma.variant.findUnique({
        where: { id: variantId },
      });
      if (variant) price = variant.price;
    } else {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (product) price = product.price;
    }

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
        price,
        total: price * quantity,
      },
    });

    return NextResponse.json({ message: "Added to cart" });
  } catch (e) {
    console.error("Add to cart error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
