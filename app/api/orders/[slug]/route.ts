import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const order = await prisma.order.findUnique({
      where: { slug },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { status: "error", message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "ok",
      data: order,
    });
  } catch (error: any) {
    console.error("GET ORDER DETAIL ERROR:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
