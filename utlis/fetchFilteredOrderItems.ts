import { PrismaClient } from "@/lib/generated/prisma";
const prisma = new PrismaClient();

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  productId?: number;
  customerId?: number;
}

/**
 * Shared query to fetch filtered order items with relations
 */
export async function fetchFilteredOrderItems(filters: ReportFilters) {
  const { startDate, endDate, productId, customerId } = filters;

  const where: any = {
    order: {
      ...(customerId ? { customerId } : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    },
    ...(productId ? { productId } : {}),
  };

  const items = await prisma.orderItem.findMany({
    where,
    include: {
      order: {
        include: {
          customer: true,
        },
      },
      product: true,
      variant: true,
    },
  });

  return items;
}
