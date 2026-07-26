"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Printer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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
} from "./OrderListScreen";
import {
  OrderInvoicePreview,
  PrintableInvoice,
  type OrderInvoiceData,
} from "@/screens/orders/components/invoice";
import { getApiErrorMessage } from "@/lib/api-error";

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
  createdAt: string;
  customer: {
    fullname: string;
    email: string;
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
      material: string | null;
      barcode: string | null;
      imageVariant: string | null;
    } | null;
  }>;
};

type OrderDetailResponse = {
  status: "ok" | "error";
  data: OrderDetail;
};

type Props = {
  slug: string;
};

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

function fullName(order: OrderDetail) {
  return order.customer.fullname;
}

function address(order: OrderDetail) {
  return [
    order.customer.addressLine1,
    order.customer.addressLine2,
    order.customer.city,
    order.customer.state,
    order.customer.postalCode,
    order.customer.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function OrderDetailScreen({ slug }: Props) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exchangeRate, setExchangeRate] = useState(4000);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/orders/${slug}`, { cache: "no-store" });
        const json = (await res.json()) as OrderDetailResponse;

        if (!res.ok || json.status !== "ok") {
          throw new Error(getApiErrorMessage(json, "Order not found"));
        }

        setOrder(json.data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load order.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [slug]);

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

  if (loading) {
    return <div className="py-10 text-center">Loading order...</div>;
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline">
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
        </Button>
        <div className="py-10 text-center text-destructive">{error}</div>
      </div>
    );
  }

  const shippingAddress = address(order);
  const invoiceOrder = toInvoiceOrder(order);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
            <p className="text-sm text-muted-foreground">
              Placed {formatDate(order.orderedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setInvoiceOpen(true)}>
            <Printer className="h-4 w-4" />
            Invoice
          </Button>
          <Badge variant="outline" className={getOrderStatusClass(order.status)}>
            {formatStatus(order.status)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.variant?.imageVariant && (
                            <Image
                              src={item.variant.imageVariant}
                              alt={item.product?.title || "Order item"}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">
                              {item.product?.title || "Unknown product"}
                            </div>
                            {item.product?.productCode && (
                              <div className="text-xs text-muted-foreground">
                                SKU: {item.product.productCode}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {[item.variant?.size, item.variant?.color, item.variant?.material]
                          .filter(Boolean)
                          .join(" / ") || "-"}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatMoney(item.price)}</TableCell>
                      <TableCell className="text-right">
                        {formatMoney(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="font-medium">{fullName(order)}</div>
              <div className="text-muted-foreground">{order.customer.email}</div>
              {order.customer.phone && (
                <div className="text-muted-foreground">{order.customer.phone}</div>
              )}
              {shippingAddress && (
                <>
                  <Separator className="my-3" />
                  <div className="text-muted-foreground">{shippingAddress}</div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>{formatMoney(order.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatMoney(order.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatMoney(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {order.notes}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="flex h-[98vh] w-[98vw] max-w-[98vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-[98vw]">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-muted/30 px-10 py-8">
            <OrderInvoicePreview order={invoiceOrder} exchangeRate={exchangeRate} />
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setInvoiceOpen(false)}>
              Close
            </Button>
            <Button type="button" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PrintableInvoice order={invoiceOrder} exchangeRate={exchangeRate} />
    </div>
  );
}

function toInvoiceOrder(order: OrderDetail): OrderInvoiceData {
  return {
    id: order.id,
    customerName: fullName(order),
    customerPhone: order.customer.phone,
    address: address(order),
    orderedAt: order.orderedAt,
    subtotal: order.subtotal,
    discount: order.discount,
    afterDiscount: order.totalAmount,
    deliveryFee: order.tax || 0,
    note: extractPublicNote(order.notes),
    trackingLabel: formatStatus(order.status),
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      product: item.product
        ? {
            title: item.product.title,
            productCode: item.product.productCode,
          }
        : null,
      variant: item.variant
        ? {
            size: item.variant.size,
            color: item.variant.color,
            barcode: item.variant.barcode,
          }
        : null,
    })),
  };
}

function extractPublicNote(value: string | null) {
  if (!value) return "";

  const markerIndex = value.indexOf("\n\n__tracking:");
  return markerIndex >= 0 ? value.slice(0, markerIndex) : value;
}
