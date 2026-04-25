import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import Variants from "@/components/variants";

export const metadata: Metadata = {
  title: "Add Product",
};

export default function AddProductPage() {
  return (
    <>
      <LayoutWrapper>
        <Variants />
      </LayoutWrapper>
    </>
  );
}
