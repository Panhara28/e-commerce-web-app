import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import ProductEditForm from "@/components/products/ProductEditForm";

export const metadata: Metadata = {
  title: "Edit Product",
};

export default function EditProductPage() {
  return (
    <LayoutWrapper>
      <ProductEditForm />
    </LayoutWrapper>
  );
}
