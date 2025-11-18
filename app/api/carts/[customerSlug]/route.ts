// /app/api/cart/[customerSlug]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { customerSlug: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { slug: params.customerSlug },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const cart = await prisma.cart.findFirst({
      where: { customerId: customer.id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return NextResponse.json({ cart });
  } catch (e) {
    console.error("Get cart error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
