"use client";

import { useEffect, useState } from "react";
import LayoutWrapper from "@/components/layout-wrapper";
import Table from "@/components/table";
import { Card } from "@/components/ui/card";

/* -----------------------------------------------------------
   Types
----------------------------------------------------------- */
type ProductListItem = {
  id: number;
  sku: string | null;
  name: string;
  price: number;
  category: string | null;
  slug: string;
};

type FilterType = "input" | "select";

interface FilterConfig {
  key: string;
  type: FilterType;
  placeholder: string;
  options?: string[];
}

/* -----------------------------------------------------------
   Component
----------------------------------------------------------- */
export default function ProductListScreen() {
  const [data, setData] = useState<ProductListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const pageSize = 10;

  const [filters, setFilters] = useState({
    name: "",
    sku: "",
    category: "",
  });

  /* -----------------------------------------------------------
     ⭐ Filter Config
  ----------------------------------------------------------- */
  const filterConfig: FilterConfig[] = [
    { key: "name", type: "input", placeholder: "Search by name" },
    { key: "sku", type: "input", placeholder: "Search by SKU" },
  ];

  /* -----------------------------------------------------------
     Load Products (API call)
  ----------------------------------------------------------- */
  const loadProducts = async () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
      search: filters.name,
      sku: filters.sku,
      category: filters.category,
    });

    const res = await fetch(`/api/products/lists?${params.toString()}`);
    const json = await res.json();

    if (json.status === "ok") {
      setData(json.data);
      setTotal(json.total);
    }
  };

  /* -----------------------------------------------------------
     useEffect (✔ FIXED so no ESLint warning)
  ----------------------------------------------------------- */
  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      if (ignore) return;
      await loadProducts();
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, [page, filters]); // dependencies

  /* -------- Delete Product -------- */
  const handleDelete = async (row: Record<string, unknown>) => {
    const item = row as ProductListItem;

    await fetch(`/api/products/${item.slug}/delete`, {
      method: "DELETE",
    });

    // Refresh after deletion
    loadProducts();
  };

  /* -----------------------------------------------------------
     Render
  ----------------------------------------------------------- */
  return (
    <LayoutWrapper>
      <Card className="px-10 py-6">
        <Table
          data={data}
          columns={["id", "sku", "name", "price"]}
          filters={filterConfig}
          pageSize={pageSize}
          total={total}
          currentPage={page}
          onPageChange={setPage}
          onFiltersChange={(updated: Record<string, unknown>) =>
            setFilters((prev) => ({
              ...prev,
              ...updated,
            }))
          }
          onDelete={handleDelete}
          onDeleteComplete={loadProducts} // 🔥 auto refresh after deletion
        />
      </Card>
    </LayoutWrapper>
  );
}
