import { NextResponse } from "next/server";
import { PrismaClient, OrderStatus } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status") as OrderStatus | null;
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: any = {
      AND: [
        status ? { status } : {},
        search
          ? {
              customer: {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              },
            }
          : {},
      ],
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          items: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      status: "ok",
      page,
      limit,
      total,
      data: orders.map((o) => ({
        id: o.id,
        slug: o.slug,
        status: o.status,
        customerName: `${o.customer.firstName} ${o.customer.lastName}`,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt,
        itemCount: o.items.length,
      })),
    });
  } catch (error: any) {
    console.error("GET ORDERS LIST ERROR:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
