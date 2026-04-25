import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import CustomerDetailScreen from "@/screens/customers/CustomerDetailScreen";

export const metadata: Metadata = {
  title: "Customer Detail",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <LayoutWrapper>
      <CustomerDetailScreen slug={slug} />
    </LayoutWrapper>
  );
}
