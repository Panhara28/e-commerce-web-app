// /app/api/cart/clear/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { customerSlug } = await req.json();

    const customer = await prisma.customer.findUnique({
      where: { slug: customerSlug },
    });

    if (!customer) return NextResponse.json({ error: "Customer not found" });

    const cart = await prisma.cart.findFirst({
      where: { customerId: customer.id },
    });

    if (!cart) return NextResponse.json({ message: "Cart is empty" });

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return NextResponse.json({ message: "Cart cleared" });
  } catch (e) {
    console.error("Clear cart error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
