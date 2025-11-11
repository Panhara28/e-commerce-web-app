"use client";
import LayoutWrapper from "@/components/layout-wrapper";
import Table from "@/components/table";
import { products } from "@/data";

export default function ProductListScreen() {
  type ProductRow = { id: number; name: string; age: number; role: string };

  const filters: {
    key: string;
    type: "input" | "select";
    options?: string[];
    placeholder: string;
  }[] = [
    { key: "name", type: "input", placeholder: "Search by name" },
    {
      key: "category",
      type: "select",
      options: ["Electronics", "Furniture", "Home", "Accessories"],
      placeholder: "Select role",
    },
  ];

  return (
    <>
      <LayoutWrapper>
        <Table
          data={products}
          columns={["id", "sku", "name", "price", "stock", "category"]}
          filters={filters}
          pageSize={10}
          onView={(row) => alert(`Viewing ${(row as ProductRow).name}`)}
          onEdit={(row) => alert(`Editing ${(row as ProductRow).name}`)}
          onDelete={(row) => alert(`Deleting ${(row as ProductRow).name}`)}
        />
      </LayoutWrapper>
    </>
  );
}
