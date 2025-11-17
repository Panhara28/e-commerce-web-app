"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Table as ShadTable,
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Eye, Edit, Trash2 } from "lucide-react";

/* --------------------------------------------------------
   TYPES
-------------------------------------------------------- */
export type FilterType = "input" | "select";

export interface FilterConfig {
  key: string;
  label?: string;
  type: FilterType;
  placeholder?: string;
  options?: string[];
}

export interface DynamicTableProps {
  data: Record<string, unknown>[];
  columns: string[];

  filters?: FilterConfig[];

  pageSize: number;
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;

  onFiltersChange: (filters: Record<string, unknown>) => void;

  onView?: (row: Record<string, unknown>) => void;
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (row: Record<string, unknown>) => Promise<void>;

  /** ✅ Added fix */
  onDeleteComplete?: () => void;
}

/* --------------------------------------------------------
   COMPONENT
-------------------------------------------------------- */
export default function DynamicTable({
  data,
  columns,
  filters = [],
  pageSize,
  total,
  currentPage,
  onPageChange,
  onFiltersChange,
  onView,
  onEdit,
  onDelete,
  onDeleteComplete,
}: DynamicTableProps) {
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Record<
    string,
    unknown
  > | null>(null);

  /* ---------------- HANDLE DELETE CLICK ---------------- */
  const confirmDelete = (row: Record<string, unknown>) => {
    setSelectedRow(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRow && onDelete) {
      await onDelete(selectedRow);
      onDeleteComplete?.(); // 🔥 refresh parent UI
    }
    setDeleteDialogOpen(false);
  };

  /* ---------------- FILTER CHANGE ---------------- */
  const handleFilterChange = (key: string, value: string) => {
    const updated = { ...filterValues, [key]: value };
    setFilterValues(updated);
    onFiltersChange(updated);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  /* --------------------------------------------------------
     RENDER
  -------------------------------------------------------- */
  return (
    <div className="space-y-4">
      {/* FILTERS */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <div key={filter.key} className="flex flex-col">
              <label className="text-sm text-muted-foreground mb-1">
                {filter.label ||
                  filter.key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (c) => c.toUpperCase())}
              </label>

              {filter.type === "input" ? (
                <Input
                  placeholder={filter.placeholder}
                  className="w-48"
                  value={filterValues[filter.key] || ""}
                  onChange={(e) =>
                    handleFilterChange(filter.key, e.target.value)
                  }
                />
              ) : (
                <Select
                  value={filterValues[filter.key] || "__all__"}
                  onValueChange={(v) =>
                    handleFilterChange(filter.key, v === "__all__" ? "" : v)
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={filter.placeholder} />
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

      {/* TABLE */}
      <div className="border rounded-lg overflow-hidden">
        <ShadTable>
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
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center text-muted-foreground py-6"
                >
                  No data found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={String(row.id) || index}>
                  {columns.map((col) => (
                    <TableCell key={col}>{String(row[col] ?? "")}</TableCell>
                  ))}

                  <TableCell className="flex justify-end gap-2">
                    <Link href={`/products/${row.slug}`} passHref>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Link href={`/products/edit/${row.slug}`} passHref>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmDelete(row)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </ShadTable>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
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
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{String(selectedRow?.name)}</span>?
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
