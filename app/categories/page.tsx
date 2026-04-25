import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import CategoryListScreen from "@/screens/categories/CategoryListScreen";

export const metadata: Metadata = {
  title: "Categories",
};

export default function CategoriesPage() {
  return (
    <LayoutWrapper>
      <CategoryListScreen />
    </LayoutWrapper>
  );
}
