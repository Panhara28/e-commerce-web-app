// /app/api/cart/remove/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  try {
    const { cartItemId } = await req.json();

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({ message: "Item removed" });
  } catch (e) {
    console.error("Remove cart error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
