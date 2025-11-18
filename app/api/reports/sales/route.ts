import { NextResponse } from "next/server";
import { PrismaClient, OrderStatus } from "@/lib/generated/prisma";
import moment from "moment-timezone";

const prisma = new PrismaClient();
const TZ = "Asia/Phnom_Penh"; // 🇰🇭

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type"); // daily | weekly | monthly | yearly
    const productId = searchParams.get("productId");
    const customerId = searchParams.get("customerId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status") as OrderStatus | null;

    if (!type) {
      return NextResponse.json(
        { success: false, message: "Report type is required" },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // 📌 Date range processor
    // -----------------------------------------------------
    let whereDate: any = {};
    let start: Date, end: Date;

    // Custom date range from user
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      whereDate = { gte: start, lte: end };
    } else {
      const now = new Date();
      start = new Date();

      if (type === "daily") {
        start.setHours(0, 0, 0, 0);
      }

      if (type === "weekly") {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
      }

      if (type === "monthly") {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
      }

      if (type === "yearly") {
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
      }

      end = now;
      whereDate = { gte: start, lte: end };
    }

    // -----------------------------------------------------
    // 📌 Query Orders
    // -----------------------------------------------------
    const orders = await prisma.order.findMany({
      where: {
        orderedAt: whereDate,
        ...(customerId && { customerId: Number(customerId) }),
        ...(status && { status }),
        ...(productId && {
          items: { some: { productId: Number(productId) } },
        }),
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
      orderBy: { orderedAt: "asc" },
    });

    // -----------------------------------------------------
    // 📌 Beautify Dates with Moment.js
    // -----------------------------------------------------
    const beautify = (date: Date) =>
      moment(date).tz(TZ).format("YYYY-MM-DD HH:mm:ss");

    const formattedOrders = orders.map((o) => ({
      ...o,
      orderedAtFormatted: beautify(o.orderedAt),
      createdAtFormatted: beautify(o.createdAt),
      updatedAtFormatted: beautify(o.updatedAt),
      customer: {
        ...o.customer,
        createdAtFormatted: beautify(o.customer.createdAt),
        updatedAtFormatted: beautify(o.customer.updatedAt),
      },
    }));

    // -----------------------------------------------------
    // 📌 Summary calculations
    // -----------------------------------------------------
    const summary = {
      totalOrders: orders.length,
      totalQuantity: 0,
      totalRevenue: 0,
      products: new Map<number, any>(),
      customers: new Map<number, any>(),
    };

    orders.forEach((order) => {
      summary.totalRevenue += order.totalAmount ?? 0;

      // Customer summary
      const c = order.customer;
      if (!summary.customers.has(c.id)) {
        summary.customers.set(c.id, {
          customerId: c.id,
          name: `${c.firstName} ${c.lastName}`,
          totalSpent: 0,
          orders: 0,
        });
      }
      const cu = summary.customers.get(c.id);
      cu.totalSpent += order.totalAmount ?? 0;
      cu.orders += 1;

      // Product summary
      order.items.forEach((item) => {
        summary.totalQuantity += item.quantity;

        if (!summary.products.has(item.productId)) {
          summary.products.set(item.productId, {
            productId: item.productId,
            productTitle: item.product.title,
            quantity: 0,
            revenue: 0,
          });
        }

        const prod = summary.products.get(item.productId);
        prod.quantity += item.quantity;
        prod.revenue += item.total;
      });
    });

    return NextResponse.json({
      success: true,
      reportType: type,
      dateRange: {
        start: start,
        end: end,
        formatted: {
          start: beautify(start),
          end: beautify(end),
        },
      },
      summary: {
        totalOrders: summary.totalOrders,
        totalQuantity: summary.totalQuantity,
        totalRevenue: summary.totalRevenue,
        products: Array.from(summary.products.values()),
        customers: Array.from(summary.customers.values()),
      },
      orders: formattedOrders,
    });
  } catch (error: any) {
    console.error("REPORT ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
