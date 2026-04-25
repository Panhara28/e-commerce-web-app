import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import SalesReportScreen from "@/screens/reports/SalesReportScreen";

export const metadata: Metadata = {
  title: "Daily Report",
};

export default function ReportPage() {
  return (
    <LayoutWrapper>
      <SalesReportScreen type="daily" />
    </LayoutWrapper>
  );
}
