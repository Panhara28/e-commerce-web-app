import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import SalesReportScreen, { type ReportType } from "@/screens/reports/SalesReportScreen";

const allowedTypes: ReportType[] = ["daily", "weekly", "monthly", "yearly"];
const titleByType: Record<ReportType, string> = {
  daily: "Daily Report",
  weekly: "Weekly Report",
  monthly: "Monthly Report",
  yearly: "Yearly Report",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const reportType = allowedTypes.includes(type as ReportType)
    ? (type as ReportType)
    : "daily";

  return {
    title: titleByType[reportType],
  };
}

export default async function ReportTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const reportType = allowedTypes.includes(type as ReportType)
    ? (type as ReportType)
    : "daily";

  return (
    <LayoutWrapper>
      <SalesReportScreen type={reportType} />
    </LayoutWrapper>
  );
}
