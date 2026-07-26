"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  PackageCheck,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Truck,
  Plus,
  Loader2,
  Trash2
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import {
  PrintableInvoice,
  type OrderInvoiceData,
} from "@/screens/orders/components/invoice";
import { formatStatus, type OrderStatus } from "@/screens/orders/OrderListScreen";
import { getApiErrorMessage } from "@/lib/api-error";

type TrackingStatus =
  | "ORDER_RECEIVED"
  | "ORDER_PROCESSING"
  | "READY_TO_DELIVERY"
  | "ORDER_DELIVERY"
  | "CONFIRM_PICK_UP"
  | "RETURN";
type TrackingTab = TrackingStatus | "DELIVERY";

type TrackingOrder = {
  id: number;
  slug: string;
  status: OrderStatus;
  trackingStatus: TrackingStatus;
  trackingLabel: string;
  customerName: string;
  customer: {
    fullname: string;
    email: string;
    phone: string | null;
  };
  address: string;
  quantity: number;
  amount: number;
  discount: number;
  deliveryFee: number;
  total: number;
  note: string;
  returnReason: string;
  orderedAt: string;
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    total: number;
    product: { title: string; productCode: string | null; slug: string; image?: string | null } | null;
    variant: {
      size: string | null;
      color: string | null;
      barcode: string | null;
      imageVariant: string | null;
    } | null;
  }>;
  timeline: Array<{
    status: TrackingStatus;
    date: string;
    description: string;
    note?: string;
  }>;
};

type TrackingResponse = {
  status: "ok" | "error";
  activeStatus: TrackingTab;
  tabs: Array<{ status: TrackingTab; label: string; count: number }>;
  total: number;
  data: TrackingOrder[];
};

const tabs: Array<{ status: TrackingTab; label: string; icon: React.ReactNode }> = [
  { status: "ORDER_RECEIVED", label: "Received", icon: <Clock3 className="h-4 w-4" /> },
  { status: "ORDER_PROCESSING", label: "Processing", icon: <PackageCheck className="h-4 w-4" /> },
  { status: "DELIVERY", label: "Delivery", icon: <Truck className="h-4 w-4" /> },
  { status: "CONFIRM_PICK_UP", label: "Confirm", icon: <CheckCircle2 className="h-4 w-4" /> },
  { status: "RETURN", label: "Return", icon: <RotateCcw className="h-4 w-4" /> },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function nextAction(status: TrackingStatus) {
  if (status === "ORDER_RECEIVED") return { label: "Order Processing", status: "ORDER_PROCESSING" as TrackingStatus };
  if (status === "ORDER_PROCESSING") return { label: "Ready to Delivery", status: "READY_TO_DELIVERY" as TrackingStatus };
  if (status === "READY_TO_DELIVERY") return { label: "Process Delivery", status: "ORDER_DELIVERY" as TrackingStatus };
  if (status === "ORDER_DELIVERY") return { label: "Confirm Pick Up", status: "CONFIRM_PICK_UP" as TrackingStatus };
  if (status === "CONFIRM_PICK_UP") return { label: "Return", status: "RETURN" as TrackingStatus };
  return null;
}

function trackingClass(status: TrackingStatus) {
  if (status === "ORDER_RECEIVED") return "border-slate-200 bg-slate-50 text-slate-700";
  if (status === "ORDER_PROCESSING") return "border-sky-200 bg-sky-50 text-sky-700";
  if (status === "READY_TO_DELIVERY") return "border-yellow-200 bg-yellow-50 text-yellow-700";
  if (status === "ORDER_DELIVERY") return "border-orange-200 bg-orange-50 text-orange-700";
  if (status === "CONFIRM_PICK_UP") return "border-green-200 bg-green-50 text-green-700";
  return "border-red-200 bg-red-50 text-red-700";
}

type AddOnItem = {
    barcode: string;
    description: string;
    size: string;
    color: string;
    qty: string;
    unitPrice: string;
    discount: string;
};

export default function OrderTrackingScreen() {
  const [activeTab, setActiveTab] = useState<TrackingTab>("ORDER_RECEIVED");
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState<TrackingStatus | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [exchangeRate, setExchangeRate] = useState(4000);

  // Add-on product state
  const [isAddOnOpen, setIsAddOnOpen] = useState(false);
  const [isAddingItems, setIsAddingItems] = useState(false);
  const [addOnItems, setAddOnItems] = useState<AddOnItem[]>([
    { barcode: "", description: "", size: "", color: "", qty: "1", unitPrice: "", discount: "0" }
  ]);

  const selectedOrder = orders[selectedIndex] || null;

  const loadOrders = useCallback(async () => {
    const params = new URLSearchParams({ status: activeTab });
    if (search.trim()) params.set("search", search.trim());

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/orders/tracking?${params.toString()}`, { cache: "no-store" });
      const json = (await res.json()) as TrackingResponse;
      if (!res.ok || json.status !== "ok") throw new Error(getApiErrorMessage(json, "Failed to load tracking orders"));
      setOrders(json.data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load tracking orders.");
      setOrders([]);
      setSelectedIndex(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const fetchCounts = async () => {
        try {
            const res = await fetch("/api/orders/tracking?status=ORDER_RECEIVED", { cache: "no-store" });
            const json = (await res.json()) as TrackingResponse;
            if (res.ok && json.tabs) {
                setTabCounts(
                    json.tabs.reduce<Record<string, number>>((acc, tab) => {
                      acc[tab.status] = tab.count;
                      return acc;
                    }, {}),
                );
            }
        } catch (err) { console.error(err); }
    };
    fetchCounts();
  }, [orders]);

  useEffect(() => {
    const loadExchangeRate = async () => {
      try {
        const res = await fetch("/api/settings/store", { cache: "no-store" });
        const json = (await res.json()) as { success: boolean; data?: { exchangeRate?: number } };
        if (res.ok && json.success && json.data?.exchangeRate) {
          setExchangeRate(json.data.exchangeRate);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadExchangeRate();
  }, []);

  const totalWithDelivery = useMemo(() => {
    if (!selectedOrder) return 0;
    return selectedOrder.total + selectedOrder.deliveryFee;
  }, [selectedOrder]);

  const openAction = (status: TrackingStatus) => {
    setActionStatus(status);
    setActionNote("");
    setDeliveryFee("");
  };

  const printInvoice = () => {
    window.print();
  };

  const submitAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOrder || !actionStatus) return;
    if (actionStatus === "RETURN" && !actionNote.trim()) {
      setError("Return reason is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const res = await fetch(`/api/orders/tracking/${selectedOrder.slug}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionStatus,
          note: actionNote,
          fee: deliveryFee,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(getApiErrorMessage(json, "Failed to change status"));
      }
      setActionStatus(null);
      await loadOrders();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to change order status.");
    } finally {
      setSaving(false);
    }
  };

  const addMoreRow = () => {
    setAddOnItems([...addOnItems, { barcode: "", description: "", size: "", color: "", qty: "1", unitPrice: "", discount: "0" }]);
  };

  const removeRow = (index: number) => {
    if (addOnItems.length <= 1) return;
    setAddOnItems(addOnItems.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof AddOnItem, value: string) => {
    const newItems = [...addOnItems];
    newItems[index][field] = value;
    setAddOnItems(newItems);
  };

  const handleBarcodeBlur = async (index: number) => {
      const barcode = addOnItems[index].barcode.trim();
      if (!barcode) return;
      try {
          const res = await fetch(`/api/products/search?barcode=${barcode}`);
          if (res.ok) {
              const json = await res.json();
              if (json.success && json.data) {
                  const variant = json.data;
                  const newItems = [...addOnItems];
                  newItems[index] = {
                      ...newItems[index],
                      description: variant.product?.title || "",
                      size: variant.size || "",
                      color: variant.color || "",
                      unitPrice: String(variant.price),
                  };
                  setAddOnItems(newItems);
              }
          }
      } catch (err) { console.error(err); }
  };

  const handleAddOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
        setIsAddingItems(true);
        const res = await fetch(`/api/orders/${selectedOrder.slug}/add-item`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: addOnItems }),
        });

        if (!res.ok) {
            const json = await res.json().catch(() => null);
            throw new Error(getApiErrorMessage(json, "Failed to add items"));
        }

        setIsAddOnOpen(false);
        setAddOnItems([{ barcode: "", description: "", size: "", color: "", qty: "1", unitPrice: "", discount: "0" }]);
        await loadOrders();
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to add items");
    } finally {
        setIsAddingItems(false);
    }
  };

  const action = selectedOrder ? nextAction(selectedOrder.trackingStatus) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order Tracking</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Move orders through received, processing, delivery, confirmation, and return.
          </p>
        </div>
        <Button variant="outline" onClick={loadOrders} disabled={loading}>
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          Refresh
        </Button>
      </div>

      <Card className="rounded-lg">
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-2 border-b pb-4">
            {tabs.map((tab) => (
              <Button
                key={tab.status}
                variant={activeTab === tab.status ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.status)}
                className="gap-2"
              >
                {tab.icon}
                {tab.label}
                <Badge variant="secondary" className="ml-1">
                  {tabCounts[tab.status] || 0}
                </Badge>
              </Button>
            ))}
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer, email, or phone"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="rounded-lg h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? <div className="py-6 text-center text-muted-foreground">Loading orders...</div> : null}
            {!loading && orders.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">No orders in this tracking status.</div>
            ) : null}
            {orders.map((order, index) => (
              <button
                key={order.slug}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`w-full rounded-lg border bg-card p-4 text-left transition hover:border-primary ${
                  selectedIndex === index ? "border-primary shadow-sm ring-1 ring-primary/20" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">Order #{order.id}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Customer: {order.customerName || "Unknown"}
                    </p>
                  </div>
                  <Badge variant="outline" className={trackingClass(order.trackingStatus)}>
                    {order.trackingLabel}
                  </Badge>
                </div>
                <div className="mt-4 space-y-1 text-sm">
                  <SummaryLine label="Order Date" value={formatDate(order.orderedAt)} />
                  <SummaryLine label="Quantity" value={String(order.quantity)} />
                  <SummaryLine label="Amount" value={formatMoney(order.amount)} strong />
                  <SummaryLine label="Delivery Fee" value={formatMoney(order.deliveryFee)} strong />
                  <SummaryLine label="Total Price" value={formatMoney(order.total + order.deliveryFee)} strong />
                  {order.note ? <SummaryLine label="Note Order" value={order.note} strong /> : null}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {selectedOrder ? (
            <>
              <Card className="rounded-lg">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-semibold">{selectedOrder.address || "No address"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/orders/${selectedOrder.slug}`}>Order Detail</Link>
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddOnOpen(true)} className="gap-2">
                      <Plus size={16} />
                      Add-on Product
                    </Button>
                    <Button variant="outline" onClick={printInvoice}>
                      <Printer className="h-4 w-4" />
                      Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Order #{selectedOrder.id}</CardTitle>
                  {action ? (
                    <Button onClick={() => openAction(action.status)}>
                      {action.label}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : null}
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="text-right">Total Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className="h-14 w-14 rounded-md bg-muted bg-cover bg-center border"
                                  style={{
                                    backgroundImage:
                                      item.variant?.imageVariant || item.product?.image
                                        ? `url(${item.variant?.imageVariant || item.product?.image})`
                                        : undefined,
                                  }}
                                />
                                <div>
                                  <p className="font-medium text-sm">{item.product?.title || "Unknown product"}</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {[item.product?.productCode, item.variant?.color, item.variant?.size, item.variant?.barcode]
                                      .filter(Boolean)
                                      .join(" · ") || "Item"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={trackingClass(selectedOrder.trackingStatus)}>
                                {selectedOrder.trackingLabel}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{item.quantity}</TableCell>
                            <TableCell className="text-sm">{formatMoney(item.price)}</TableCell>
                            <TableCell className="text-right text-sm font-medium">{formatMoney(item.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 flex justify-end text-sm">
                    <div className="w-full max-w-xs space-y-1">
                      <SummaryLine label="Subtotal" value={formatMoney(selectedOrder.total)} />
                      <SummaryLine label="Delivery Fee" value={formatMoney(selectedOrder.deliveryFee)} />
                      <SummaryLine label="Grand Total" value={formatMoney(totalWithDelivery)} strong />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedOrder.timeline.length ? (
                    selectedOrder.timeline.map((event, index) => (
                      <div key={`${event.status}-${event.date}-${index}`} className="flex gap-3 border-l-2 border-primary/20 pl-4 relative">
                        <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-primary" />
                        <div className="pb-4">
                          <p className="font-medium text-sm">{formatStatus(event.status)}</p>
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                          <p className="text-[10px] text-muted-foreground italic">{formatDate(event.date)}</p>
                          {event.note ? <p className="text-xs mt-1 bg-muted p-2 rounded">{event.note}</p> : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tracking movement yet.</p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">Select an order to manage tracking.</Card>
          )}
        </div>
      </div>

      {/* Change Status Dialog */}
      <Dialog open={Boolean(actionStatus)} onOpenChange={(open) => !open && setActionStatus(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Tracking Status</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitAction} className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">New status</p>
              <Badge variant="outline" className={actionStatus ? trackingClass(actionStatus) : ""}>
                {actionStatus ? formatStatus(actionStatus) : "-"}
              </Badge>
            </div>
            {actionStatus === "ORDER_DELIVERY" ? (
              <label className="grid gap-2">
                <span className="text-sm font-medium">Delivery fee</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  autoFocus
                  value={deliveryFee}
                  onChange={(event) =>
                    setDeliveryFee(event.target.value.replace(/[^0-9.]/g, ""))
                  }
                  placeholder="0.00"
                />
              </label>
            ) : null}
            <label className="grid gap-2">
              <span className="text-sm font-medium">
                {actionStatus === "RETURN" ? "Return reason" : "Note"}
              </span>
              <Textarea
                value={actionNote}
                onChange={(event) => setActionNote(event.target.value)}
                placeholder={actionStatus === "RETURN" ? "Why is this order returned?" : "Optional note"}
              />
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setActionStatus(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add-on Product Dialog */}
      <Dialog open={isAddOnOpen} onOpenChange={setIsAddOnOpen}>
          <DialogContent className="!max-w-[99vw] w-[1800px] !max-h-[98vh] flex flex-col p-6 bg-white">
              <DialogHeader className="px-2 mb-4">
                  <DialogTitle className="text-2xl font-bold tracking-tight">Add-on Products</DialogTitle>
                  <DialogDescription className="text-sm mt-1">
                      Add multiple items to order #{selectedOrder?.id}. Enter barcode to auto-fill details.
                  </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddOnSubmit} className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto py-2">
                      <Table>
                          <TableHeader>
                              <TableRow className="hover:bg-transparent border-b-2">
                                  <TableHead className="w-[200px] text-sm font-bold text-foreground">Barcode</TableHead>
                                  <TableHead className="min-w-[350px] text-sm font-bold text-foreground">Description</TableHead>
                                  <TableHead className="w-[120px] text-sm font-bold text-foreground text-center">Size</TableHead>
                                  <TableHead className="w-[150px] text-sm font-bold text-foreground text-center">Color</TableHead>
                                  <TableHead className="w-[100px] text-sm font-bold text-foreground text-center">Qty</TableHead>
                                  <TableHead className="w-[180px] text-sm font-bold text-foreground">Unit Price</TableHead>
                                  <TableHead className="w-[150px] text-sm font-bold text-foreground">Discount</TableHead>
                                  <TableHead className="w-[60px]"></TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {addOnItems.map((item, index) => (
                                  <TableRow key={index} className="hover:bg-transparent border-none">
                                      <TableCell className="py-2">
                                          <Input 
                                            value={item.barcode}
                                            onChange={e => updateRow(index, "barcode", e.target.value)}
                                            onBlur={() => handleBarcodeBlur(index)}
                                            placeholder="Barcode"
                                            className="h-10 text-sm px-3"
                                            required
                                          />
                                      </TableCell>
                                      <TableCell className="py-2">
                                          <Input 
                                            value={item.description}
                                            onChange={e => updateRow(index, "description", e.target.value)}
                                            placeholder="Product title"
                                            className="h-10 text-sm px-3"
                                          />
                                      </TableCell>
                                      <TableCell className="py-2 text-center">
                                          <Input 
                                            value={item.size}
                                            onChange={e => updateRow(index, "size", e.target.value)}
                                            placeholder="Size"
                                            className="h-10 text-sm px-2 text-center"
                                          />
                                      </TableCell>
                                      <TableCell className="py-2 text-center">
                                          <Input 
                                            value={item.color}
                                            onChange={e => updateRow(index, "color", e.target.value)}
                                            placeholder="Color"
                                            className="h-10 text-sm px-2 text-center"
                                          />
                                      </TableCell>
                                      <TableCell className="py-2 text-center">
                                          <Input 
                                            type="number"
                                            min="1"
                                            value={item.qty}
                                            onChange={e => updateRow(index, "qty", e.target.value)}
                                            className="h-10 text-sm px-2 text-center"
                                            required
                                          />
                                      </TableCell>
                                      <TableCell className="py-2">
                                          <Input 
                                            type="number"
                                            step="0.01"
                                            value={item.unitPrice}
                                            onChange={e => updateRow(index, "unitPrice", e.target.value)}
                                            placeholder="0.00"
                                            className="h-10 text-sm px-3 font-medium text-emerald-600"
                                            required
                                          />
                                      </TableCell>
                                      <TableCell className="py-2">
                                          <Input 
                                            type="number"
                                            step="0.01"
                                            value={item.discount}
                                            onChange={e => updateRow(index, "discount", e.target.value)}
                                            placeholder="0.00"
                                            className="h-10 text-sm px-3"
                                          />
                                      </TableCell>
                                      <TableCell className="py-2 text-center">
                                          <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-10 w-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => removeRow(index)}
                                            disabled={addOnItems.length <= 1}
                                          >
                                              <Trash2 size={18} />
                                          </Button>
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                      <Button type="button" variant="outline" size="sm" onClick={addMoreRow} className="mt-4 gap-2 text-sm h-10 px-4">
                          <Plus size={16} /> Add more product
                      </Button>
                  </div>
                  <DialogFooter className="pt-6 border-t">
                      <Button type="button" variant="outline" size="default" className="h-10 px-6 text-sm" onClick={() => setIsAddOnOpen(false)}>Cancel</Button>
                      <Button type="submit" size="default" className="h-10 px-6 text-sm font-bold" disabled={isAddingItems}>
                          {isAddingItems ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : "Add to Order"}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>

      {selectedOrder ? (
        <PrintableInvoice
          order={toInvoiceOrder(selectedOrder)}
          exchangeRate={exchangeRate}
        />
      ) : null}
    </div>
  );
}

function SummaryLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-muted-foreground">:</span>
      <span className={`min-w-0 text-right ${strong ? "font-semibold text-foreground" : ""}`}>{value}</span>
    </div>
  );
}

function toInvoiceOrder(order: TrackingOrder): OrderInvoiceData {
  const subtotal =
    order.amount || order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const afterDiscount = order.total || subtotal - order.discount;

  return {
    id: order.id,
    customerName: order.customerName,
    customerPhone: order.customer.phone,
    address: order.address,
    orderedAt: order.orderedAt,
    subtotal,
    discount: order.discount,
    afterDiscount,
    deliveryFee: order.deliveryFee,
    note: order.note,
    trackingLabel: order.trackingLabel,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      // The backend already resolves manual (non-catalog) line items into
      // `product`/`variant` shape, so no client-side fallback is needed here.
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
