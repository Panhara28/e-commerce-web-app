import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import OrderTrackingScreen from "@/screens/orders-tracking/OrderTrackingScreen";

export const metadata: Metadata = {
  title: "Order Tracking",
};

export default function OrderTrackingPage() {
  return (
    <LayoutWrapper>
      <OrderTrackingScreen />
    </LayoutWrapper>
  );
}
