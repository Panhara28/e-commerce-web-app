// /app/api/cart/checkout/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, OrderStatus } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { customerSlug } = await req.json();

    const customer = await prisma.customer.findUnique({
      where: { slug: customerSlug },
    });

    if (!customer)
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );

    const cart = await prisma.cart.findFirst({
      where: { customerId: customer.id },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0)
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    let subtotal = 0;

    cart.items.forEach((item) => {
      subtotal += item.total;
    });

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        status: OrderStatus.PENDING,
        subtotal,
        totalAmount: subtotal,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });

    // Clear cart after checkout
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return NextResponse.json({
      message: "Checkout successful",
      order,
    });
  } catch (e) {
    console.error("Checkout error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
