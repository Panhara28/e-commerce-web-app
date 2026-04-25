import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import OrderListScreen from "@/screens/orders/OrderListScreen";

export const metadata: Metadata = {
  title: "Orders",
};

export default function OrderPage() {
  return (
    <LayoutWrapper>
      <OrderListScreen />
    </LayoutWrapper>
  );
}
