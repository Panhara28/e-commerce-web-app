import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import CustomerListScreen from "@/screens/customers/CustomerListScreen";

export const metadata: Metadata = {
  title: "Customers",
};

export default function CustomersPage() {
  return (
    <LayoutWrapper>
      <CustomerListScreen />
    </LayoutWrapper>
  );
}
