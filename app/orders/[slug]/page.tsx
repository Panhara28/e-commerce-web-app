import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import OrderDetailScreen from "@/screens/orders/OrderDetailScreen";
import OrderListScreen, { type OrderStatus } from "@/screens/orders/OrderListScreen";

const statusBySlug: Record<string, OrderStatus> = {
  pending: "PENDING",
  processing: "PROCESSING",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
  refunded: "REFUNDED",
};

const titleByStatus: Record<string, string> = {
  pending: "Pending Orders",
  processing: "Processing Orders",
  completed: "Completed Orders",
  cancelled: "Cancelled Orders",
  refunded: "Refunded Orders",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();

  return {
    title: titleByStatus[normalizedSlug] || "Order Detail",
  };
}

export default async function OrderRoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const status = statusBySlug[slug.toLowerCase()];

  return (
    <LayoutWrapper>
      {status ? <OrderListScreen status={status} /> : <OrderDetailScreen slug={slug} />}
    </LayoutWrapper>
  );
}
