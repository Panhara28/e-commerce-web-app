import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import ProductDetailScreen from "@/screens/products/ProductDetailScreen";

export const metadata: Metadata = {
  title: "Product Detail",
};

export default function ProductsDetail() {
  return (
    <LayoutWrapper>
      <ProductDetailScreen />
    </LayoutWrapper>
  );
}
