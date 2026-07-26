"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Printer, RefreshCw, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OrderInvoicePreview,
  PrintableInvoice,
  type OrderInvoiceData,
} from "@/screens/orders/components/invoice";
import { getApiErrorMessage } from "@/lib/api-error";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

type OrderListItem = {
  id: number;
  slug: string;
  status: OrderStatus;
  customerName: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
};

type OrdersResponse = {
  status: "ok" | "error";
  page: number;
  limit: number;
  total: number;
  data: OrderListItem[];
};

type OrderDetail = {
  id: number;
  slug: string;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  discount: number;
  tax: number;
  notes: string | null;
  orderedAt: string;
  customer: {
    fullname: string;
    phone: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  };
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    total: number;
    product: {
      title: string;
      productCode: string | null;
    } | null;
    variant: {
      size: string | null;
      color: string | null;
      barcode: string | null;
    } | null;
  }>;
};

type OrderDetailResponse = {
  status: "ok" | "error";
  data: OrderDetail;
};

type Props = {
  status?: OrderStatus;
};

const pageSize = 10;
const orderStatuses: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

function formatDate(value: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getOrderStatusClass(status: OrderStatus | string) {
  switch (status) {
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "PROCESSING":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "CANCELLED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "REFUNDED":
      return "border-violet-200 bg-violet-50 text-violet-700";
    default:
      return "border-muted bg-muted text-muted-foreground";
  }
}

export function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function OrderListScreen({ status }: Props) {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">(
    status || "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exchangeRate, setExchangeRate] = useState(4000);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewOrder, setPreviewOrder] = useState<OrderInvoiceData | null>(null);

  const lockedStatus = Boolean(status);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setSelectedStatus(status || "");
    setPage(1);
  }, [status]);

  const title = useMemo(() => {
    if (!status) return "Orders";
    return `${formatStatus(status)} Orders`;
  }, [status]);

  const loadOrders = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    });

    if (selectedStatus) params.set("status", selectedStatus);
    if (search.trim()) params.set("search", search.trim());

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/orders/lists?${params.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as OrdersResponse;

      if (!res.ok || json.status !== "ok") {
        throw new Error(getApiErrorMessage(json, "Failed to load orders"));
      }

      setOrders(json.data);
      setTotal(json.total);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load orders.");
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedStatus]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const loadExchangeRate = async () => {
      try {
        const res = await fetch("/api/settings/store", { cache: "no-store" });
        const json = (await res.json()) as {
          success: boolean;
          data?: { exchangeRate?: number };
        };
        if (res.ok && json.success && json.data?.exchangeRate) {
          setExchangeRate(json.data.exchangeRate);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadExchangeRate();
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value === "ALL" ? "" : (value as OrderStatus));
    setPage(1);
  };

  const handlePreviewInvoice = async (slug: string) => {
    try {
      setPreviewOpen(true);
      setPreviewLoading(true);
      setPreviewError("");
      setPreviewOrder(null);

      const res = await fetch(`/api/orders/${slug}`, { cache: "no-store" });
      const json = (await res.json()) as OrderDetailResponse;

      if (!res.ok || json.status !== "ok") {
        throw new Error(getApiErrorMessage(json, "Failed to load order"));
      }

      setPreviewOrder(toInvoiceOrder(json.data));
    } catch (err) {
      console.error(err);
      setPreviewError(err instanceof Error ? err.message : "Failed to load invoice preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Review customer orders and open each order for item details.
          </p>
        </div>

        <Button variant="outline" onClick={loadOrders} disabled={loading}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="gap-4 px-6 py-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full max-w-sm">
            <label className="mb-1 block text-sm text-muted-foreground">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Customer name or email"
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              Status
            </label>
            <Select
              value={selectedStatus || "ALL"}
              onValueChange={handleStatusChange}
              disabled={lockedStatus}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {orderStatuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {formatStatus(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.slug}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getOrderStatusClass(order.status)}
                      >
                        {formatStatus(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.itemCount}</TableCell>
                    <TableCell>{formatMoney(order.totalAmount)}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewInvoice(order.slug)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/orders/${order.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {total} order{total === 1 ? "" : "s"}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || loading}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) {
            setPreviewError("");
            setPreviewOrder(null);
          }
        }}
      >
        <DialogContent className="flex h-[98vh] w-[98vw] max-w-[98vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-[98vw]">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-muted/30 px-10 py-8">
            {previewLoading ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Loading invoice...
              </div>
            ) : previewError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {previewError}
              </div>
            ) : previewOrder ? (
              <OrderInvoicePreview
                order={previewOrder}
                exchangeRate={exchangeRate}
              />
            ) : null}
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => window.print()}
              disabled={!previewOrder || previewLoading}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {previewOrder ? (
        <PrintableInvoice order={previewOrder} exchangeRate={exchangeRate} />
      ) : null}
    </div>
  );
}

function toInvoiceOrder(order: OrderDetail): OrderInvoiceData {
  const customerName = order.customer.fullname || "Customer";
  const address = [
    order.customer.addressLine1,
    order.customer.addressLine2,
    order.customer.city,
    order.customer.state,
    order.customer.postalCode,
    order.customer.country,
  ]
    .filter(Boolean)
    .join(", ");
  const note = extractPublicNote(order.notes);

  return {
    id: order.id,
    customerName,
    customerPhone: order.customer.phone,
    address,
    orderedAt: order.orderedAt,
    subtotal: order.subtotal,
    discount: order.discount,
    afterDiscount: order.totalAmount,
    deliveryFee: order.tax || 0,
    note,
    trackingLabel: formatStatus(order.status),
    items: order.items,
  };
}

function extractPublicNote(value: string | null) {
  if (!value) return "";

  const markerIndex = value.indexOf("\n\n__tracking:");
  return markerIndex >= 0 ? value.slice(0, markerIndex) : value;
}
