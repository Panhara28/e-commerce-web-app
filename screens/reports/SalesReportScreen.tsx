"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  Download,
  Package,
  RefreshCw,
  ShoppingBag,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrderStatusClass, formatStatus, type OrderStatus } from "@/screens/orders/OrderListScreen";
import { getApiErrorMessage } from "@/lib/api-error";

export type ReportType = "daily" | "weekly" | "monthly" | "yearly";

type ProductSummary = {
  productId: number;
  productTitle: string;
  quantity: number;
  revenue: number;
};

type CustomerSummary = {
  customerId: number;
  name: string;
  totalSpent: number;
  orders: number;
};

type ReportOrder = {
  id: number;
  slug: string;
  status: OrderStatus;
  totalAmount: number;
  orderedAtFormatted: string;
  customer: {
    fullname: string;
    email: string;
  };
  items: Array<{
    quantity: number;
    total: number;
    product: {
      title: string;
    };
  }>;
};

type SalesReportResponse = {
  success: boolean;
  reportType: ReportType;
  dateRange: {
    formatted: {
      start: string;
      end: string;
    };
  };
  summary: {
    totalOrders: number;
    totalQuantity: number;
    totalRevenue: number;
    products: ProductSummary[];
    customers: CustomerSummary[];
  };
  orders: ReportOrder[];
};

type Props = {
  type: ReportType;
};

const reportTypes: ReportType[] = ["daily", "weekly", "monthly", "yearly"];
const statuses: OrderStatus[] = [
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

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function customerName(order: ReportOrder) {
  return order.customer.fullname;
}

export default function SalesReportScreen({ type }: Props) {
  const [report, setReport] = useState<SalesReportResponse | null>(null);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const title = useMemo(() => `${titleCase(type)} Sales Report`, [type]);

  const loadReport = useCallback(async () => {
    const params = new URLSearchParams({ type });

    if (status) params.set("status", status);
    if (startDate && endDate) {
      params.set("startDate", startDate);
      params.set("endDate", endDate);
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/reports/sales?${params.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as SalesReportResponse;

      if (!res.ok || !json.success) {
        throw new Error(getApiErrorMessage(json, "Failed to load report"));
      }

      setReport(json);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load sales report.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate, status, type]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const clearDateRange = () => {
    setStartDate("");
    setEndDate("");
  };

  const downloadExcel = async () => {
    if (!report?.orders.length) return;

    const rows = report.orders.map((order) => ({
      "Order #": order.id,
      Customer: customerName(order),
      Email: order.customer.email,
      Status: formatStatus(order.status),
      Items: order.items.reduce((total, item) => total + item.quantity, 0),
      Date: order.orderedAtFormatted,
      Total: order.totalAmount,
    }));

    const xlsx = await import("xlsx");
    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Report");
    xlsx.writeFile(workbook, `${type}-sales-report.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Sales, products, customers, and matching orders from the report API.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={downloadExcel}
            disabled={loading || !report?.orders.length}
          >
            <Download className="h-4 w-4" />
            Download Excel
          </Button>
          <Button variant="outline" onClick={loadReport} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="gap-4 px-6 py-5">
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((item) => (
            <Button
              key={item}
              asChild
              variant={item === type ? "default" : "outline"}
              size="sm"
            >
              <Link href={`/reports/${item}`}>{titleCase(item)}</Link>
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              Status
            </label>
            <Select
              value={status || "ALL"}
              onValueChange={(value) =>
                setStatus(value === "ALL" ? "" : (value as OrderStatus))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {statuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {formatStatus(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              Start date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              End date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>

          <Button variant="outline" onClick={clearDateRange}>
            Clear dates
          </Button>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        {report?.dateRange && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {report.dateRange.formatted.start} to {report.dateRange.formatted.end}
          </div>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Revenue"
          value={formatMoney(report?.summary.totalRevenue || 0)}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <MetricCard
          title="Orders"
          value={String(report?.summary.totalOrders || 0)}
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <MetricCard
          title="Items Sold"
          value={String(report?.summary.totalQuantity || 0)}
          icon={<Package className="h-5 w-5" />}
        />
        <MetricCard
          title="Customers"
          value={String(report?.summary.customers.length || 0)}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <LoadingRow colSpan={3} />
                  ) : report?.summary.products.length ? (
                    report.summary.products.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell className="font-medium">
                          {product.productTitle}
                        </TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatMoney(product.revenue)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <EmptyRow colSpan={3} />
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <LoadingRow colSpan={3} />
                  ) : report?.summary.customers.length ? (
                    report.summary.customers.map((customer) => (
                      <TableRow key={customer.customerId}>
                        <TableCell className="font-medium">
                          {customer.name}
                        </TableCell>
                        <TableCell>{customer.orders}</TableCell>
                        <TableCell className="text-right">
                          {formatMoney(customer.totalSpent)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <EmptyRow colSpan={3} />
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <LoadingRow colSpan={6} />
                ) : report?.orders.length ? (
                  report.orders.map((order) => (
                    <TableRow key={order.slug}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/orders/${order.slug}`}
                          className="hover:underline"
                        >
                          #{order.id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>{customerName(order)}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.customer.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getOrderStatusClass(order.status)}
                        >
                          {formatStatus(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.items.reduce(
                          (total, item) => total + item.quantity,
                          0,
                        )}
                      </TableCell>
                      <TableCell>{order.orderedAtFormatted}</TableCell>
                      <TableCell className="text-right">
                        {formatMoney(order.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyRow colSpan={6} />
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
        </div>
        <div className="rounded-md bg-muted p-3 text-muted-foreground">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingRow({ colSpan }: { colSpan: number }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-8 text-center">
        Loading report...
      </TableCell>
    </TableRow>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="py-8 text-center text-muted-foreground"
      >
        No report data found.
      </TableCell>
    </TableRow>
  );
}
