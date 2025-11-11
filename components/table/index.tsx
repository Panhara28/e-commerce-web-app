"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";

type FilterType = "input" | "select";

type FilterConfig = {
  key: string;
  label?: string;
  type: FilterType;
  placeholder?: string;
  options?: string[];
};

type DynamicTableProps = {
  data: Record<string, unknown>[];
  columns: string[];
  filters?: FilterConfig[];
  pageSize?: number;
  onView?: (row: Record<string, unknown>) => void;
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (row: Record<string, unknown>) => void;
};

export default function DynamicTable({
  data,
  columns,
  filters = [],
  pageSize = 10,
  onView,
  onEdit,
  onDelete,
}: DynamicTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  // --- Filtering logic ---
  const filteredData = useMemo(() => {
    return data.filter((row) =>
      filters.every((filter) => {
        const value = filterValues[filter.key];
        if (!value) return true;
        return String(row[filter.key])
          .toLowerCase()
          .includes(value.toLowerCase());
      })
    );
  }, [data, filters, filterValues]);

  // --- Pagination logic ---
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // --- Handle filter changes ---
  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <div key={filter.key} className="flex flex-col">
              <label className="text-sm text-muted-foreground mb-1">
                {filter.label || filter.key}
              </label>
              {filter.type === "input" ? (
                <Input
                  placeholder={filter.placeholder || `Filter by ${filter.key}`}
                  value={filterValues[filter.key] || ""}
                  onChange={(e) =>
                    handleFilterChange(filter.key, e.target.value)
                  }
                  className="w-48"
                />
              ) : (
                <Select
                  value={filterValues[filter.key] || "__all__"}
                  onValueChange={(v) =>
                    handleFilterChange(filter.key, v === "__all__" ? "" : v)
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue
                      placeholder={filter.placeholder || `Select ${filter.key}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    {filter.options?.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className="capitalize">
                  {col}
                </TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center text-muted-foreground py-6"
                >
                  No data found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row: Record<string, unknown>, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col}>{String(row[col] ?? "")}</TableCell>
                  ))}
                  <TableCell className="flex justify-end gap-2">
                    {/* View → /products/[slug] */}
                    <Link href={`/products/${row.slug}`} passHref>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView?.(row)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    {/* Edit → /products/edit/[slug] */}
                    <Link href={`/products/edit/${row.slug}`} passHref>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(row)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>

                    {/* Delete stays normal */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete?.(row)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
