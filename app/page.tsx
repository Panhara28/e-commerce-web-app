import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import DashboardScreen from "@/screens/dashboard/DashboardScreen";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Page() {
  return (
    <LayoutWrapper>
      <DashboardScreen />
    </LayoutWrapper>
  );
}
