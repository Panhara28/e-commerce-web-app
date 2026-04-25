import type { Metadata } from "next";
import ProductListScreen from "@/screens/products/ProductListScreen";

export const metadata: Metadata = {
  title: "Products",
};

export default function ProductsPage() {
  return <ProductListScreen />;
}
