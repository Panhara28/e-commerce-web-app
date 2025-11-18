// /app/api/cart/update/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const { cartItemId, quantity } = await req.json();

    if (!cartItemId || !quantity) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const newTotal = item.price * quantity;

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity, total: newTotal },
    });

    return NextResponse.json({ message: "Quantity updated" });
  } catch (e) {
    console.error("Update cart error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
