"use client";

import { useCallback, useEffect, useState } from "react";
import LayoutWrapper from "@/components/layout-wrapper";
import Table from "@/components/table";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import PinnedProductsPanel from "./PinnedProductsPanel";

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
  pinned: boolean;
};

type ProductApiItem = {
  id: number;
  slug: string;
  title: string | null;
  productCode: string | null;
  price: number;
  pinOrder?: number | null;
  Category?: {
    name?: string | null;
    title?: string | null;
  } | null;
  variants?: Array<{
    barcode?: string | null;
  }>;
};

type ProductListResponse = {
  status: "ok" | "error";
  total: number;
  data: ProductApiItem[];
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
  const [error, setError] = useState("");
  const [pinnedRefreshKey, setPinnedRefreshKey] = useState(0);

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
  const loadProducts = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
      search: filters.name,
      sku: filters.sku,
      category: filters.category,
    });

    try {
      setError("");
      const res = await fetch(`/api/products/lists?${params.toString()}`);
      const json = (await res.json()) as ProductListResponse;

      if (!res.ok || json.status !== "ok") {
        throw new Error(getApiErrorMessage(json, "Failed to load products"));
      }

      setData(
        json.data.map((item) => ({
          id: item.id,
          slug: item.slug,
          name: item.title || "-",
          sku: item.productCode || item.variants?.[0]?.barcode || "-",
          price: item.price,
          category: item.Category?.name || item.Category?.title || null,
          pinned: item.pinOrder !== null && item.pinOrder !== undefined,
        })),
      );
      setTotal(json.total);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load products.");
      setData([]);
      setTotal(0);
    }
  }, [filters.category, filters.name, filters.sku, page]);

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
  }, [loadProducts]); // dependencies

  /* -------- Delete Product -------- */
  const handleDelete = async (row: Record<string, unknown>) => {
    const item = row as ProductListItem;

    try {
      const res = await fetch(`/api/products/${item.slug}/delete`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(getApiErrorMessage(json, "Failed to delete product"));
      }

      loadProducts();
      setPinnedRefreshKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  /* -------- Pin / Unpin Product -------- */
  const handleTogglePin = async (row: Record<string, unknown>) => {
    const item = row as ProductListItem;
    const pinned = !item.pinned;

    try {
      const res = await fetch(`/api/products/${item.slug}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(
          getApiErrorMessage(json, `Failed to ${pinned ? "pin" : "unpin"} product`),
        );
      }

      toast.success(
        pinned
          ? `"${item.name}" pinned to the top of the storefront`
          : `"${item.name}" unpinned`,
      );
      await loadProducts();
      setPinnedRefreshKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update pin",
      );
    }
  };

  /* -----------------------------------------------------------
     Render
  ----------------------------------------------------------- */
  return (
    <LayoutWrapper>
      <div className="flex items-center justify-between mb-6 px-1">
        <h1 className="text-2xl font-semibold text-foreground">Products</h1>
        <Link href="/products/add">
          <Button className="bg-primary text-white">+ Add Product</Button>
        </Link>
      </div>
      {error ? <div className="mb-4 text-sm text-destructive">{error}</div> : null}
      <PinnedProductsPanel refreshKey={pinnedRefreshKey} onChange={loadProducts} />
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
          isPinned={(row) => Boolean(row.pinned)}
          onTogglePin={handleTogglePin}
        />
      </Card>
    </LayoutWrapper>
  );
}
