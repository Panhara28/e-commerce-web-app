"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Clock3,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatStatus,
  getOrderStatusClass,
  type OrderStatus,
} from "@/screens/orders/OrderListScreen";

type DashboardResponse = {
  success: boolean;
  generatedAt: string;
  summary: {
    totalRevenue: number;
    todayRevenue: number;
    monthRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalProducts: number;
    totalCustomers: number;
  };
  salesTrend: Array<{
    label: string;
    month: string;
    revenue: number;
    orders: number;
  }>;
  orderStatuses: Array<{
    status: OrderStatus;
    count: number;
  }>;
  recentOrders: Array<{
    id: number;
    slug: string;
    status: OrderStatus;
    customerName: string;
    totalAmount: number;
    itemCount: number;
    orderedAt: string;
  }>;
  topProducts: Array<{
    productId: number;
    title: string;
    slug: string;
    productCode: string | null;
    quantity: number;
    revenue: number;
  }>;
  lowStockVariants: Array<{
    id: number;
    slug: string;
    stock: number;
    size: string | null;
    color: string | null;
    barcode: string | null;
    product: {
      title: string;
      slug: string;
      productCode: string | null;
    };
  }>;
  recentCustomers: Array<{
    id: number;
    slug: string;
    name: string;
    email: string;
    createdAt: string;
  }>;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStockLabel(stock: number) {
  if (stock <= 0) return "Out";
  if (stock <= 2) return "Critical";
  return "Low";
}

export default function DashboardScreen() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/dashboard/overview", { cache: "no-store" });
      const json = (await res.json()) as DashboardResponse & { error?: string };
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Failed to load dashboard (${res.status})`);
      }
      setDashboard(json);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const maxTrendRevenue = useMemo(
    () => Math.max(1, ...(dashboard?.salesTrend.map((item) => item.revenue) || [1])),
    [dashboard],
  );

  const totalStatusOrders = useMemo(
    () => dashboard?.orderStatuses.reduce((sum, item) => sum + item.count, 0) || 1,
    [dashboard],
  );

  const generatedAt = dashboard?.generatedAt ? formatDate(dashboard.generatedAt) : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live store performance from products, customers, orders, and reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {generatedAt ? (
            <Badge variant="outline" className="px-3 py-1">
              Updated {generatedAt}
            </Badge>
          ) : null}
          <Button variant="outline" onClick={loadDashboard} disabled={loading}>
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatMoney(dashboard?.summary.totalRevenue || 0)}
          subtitle={`${formatMoney(dashboard?.summary.todayRevenue || 0)} today`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          title="Orders"
          value={formatNumber(dashboard?.summary.totalOrders || 0)}
          subtitle={`${formatNumber(dashboard?.summary.pendingOrders || 0)} pending`}
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <MetricCard
          title="Products"
          value={formatNumber(dashboard?.summary.totalProducts || 0)}
          subtitle={`${dashboard?.lowStockVariants.length || 0} low stock variants`}
          icon={<Boxes className="h-5 w-5" />}
        />
        <MetricCard
          title="Customers"
          value={formatNumber(dashboard?.summary.totalCustomers || 0)}
          subtitle={`${formatNumber(dashboard?.summary.completedOrders || 0)} completed orders`}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <Card className="rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sales Trend
            </CardTitle>
            <Badge variant="outline">
              {dashboard?.summary.revenueGrowth || 0}% vs last month
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end gap-3">
              {(dashboard?.salesTrend || []).map((item) => {
                const height = Math.max(8, Math.round((item.revenue / maxTrendRevenue) * 100));
                return (
                  <div key={item.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className="flex h-48 w-full items-end rounded-md bg-muted">
                      <div
                        className="w-full rounded-md bg-primary transition-all"
                        style={{ height: `${height}%` }}
                        title={`${item.label}: ${formatMoney(item.revenue)}`}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.orders} orders</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(dashboard?.orderStatuses || []).map((item) => {
              const percent = Math.round((item.count / totalStatusOrders) * 100);
              return (
                <div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <Badge variant="outline" className={getOrderStatusClass(item.status)}>
                      {formatStatus(item.status)}
                    </Badge>
                    <span className="font-medium">{formatNumber(item.count)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr]">
        <Card className="rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/orders">
                View Orders
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(dashboard?.recentOrders || []).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link href={`/orders/${order.slug}`} className="font-medium hover:underline">
                        {order.customerName || "Unknown"}
                      </Link>
                      <p className="text-xs text-muted-foreground">{formatDate(order.orderedAt)}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getOrderStatusClass(order.status)}>
                        {formatStatus(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.itemCount}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(order.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Products</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/products">
                Products
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {(dashboard?.topProducts || []).map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <Link href={`/products/${product.slug}`} className="truncate font-medium hover:underline">
                      {product.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {product.productCode || "No SKU"} · {product.quantity} sold
                    </p>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-semibold">{formatMoney(product.revenue)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(dashboard?.lowStockVariants || []).map((variant) => (
              <div key={variant.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div className="min-w-0">
                  <Link href={`/products/${variant.product.slug}`} className="font-medium hover:underline">
                    {variant.product.title}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {[variant.product.productCode, variant.size, variant.color, variant.barcode]
                      .filter(Boolean)
                      .join(" · ") || "Variant"}
                  </p>
                </div>
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  {getStockLabel(variant.stock)} · {variant.stock}
                </Badge>
              </div>
            ))}
            {!dashboard?.lowStockVariants.length && !loading ? (
              <div className="flex items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                No low stock variants.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              New Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(dashboard?.recentCustomers || []).map((customer) => (
              <div key={customer.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{customer.name || "Customer"}</p>
                  <p className="truncate text-xs text-muted-foreground">{customer.email}</p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">{formatDate(customer.createdAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-lg">
      <CardContent className="flex items-center justify-between gap-4 pt-6">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 truncate text-2xl font-semibold">{value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
