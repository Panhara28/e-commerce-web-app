"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, ShoppingBag, User, Pencil, UserMinus, UserCheck, Loader2, MapPin, Phone } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SingleImageUpload } from "@/components/common/single-image-upload";

type CustomerStatus = "ACTIVE" | "INACTIVE" | "DELETED";
type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "REFUNDED";

type CustomerDetail = {
  id: number;
  slug: string;
  username: string;
  fullname: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  type: string;
  status: CustomerStatus;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
  orders: Array<{
    id: number;
    slug: string;
    status: OrderStatus;
    totalAmount: number;
    createdAt: string;
    items: Array<{ id: number; quantity: number }>;
  }>;
};

type CustomerResponse = {
  success: boolean;
  data: CustomerDetail;
};

type Props = {
  slug: string;
};

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function badgeClass(status: CustomerStatus | OrderStatus) {
  if (status === "ACTIVE" || status === "COMPLETED") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "INACTIVE" || status === "PENDING") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "PROCESSING") return "border-sky-200 bg-sky-50 text-sky-700";
  if (status === "CANCELLED" || status === "DELETED" || status === "REFUNDED") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  return "border-muted bg-muted text-muted-foreground";
}

export default function CustomerDetailScreen({ slug }: Props) {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    username: "",
    address: "",
    type: "DEFAULT",
    profilePicture: "",
  });

  const loadCustomer = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/customers/${slug}`, { cache: "no-store" });
      const json = (await res.json()) as CustomerResponse;

      if (!res.ok || !json.success) {
        throw new Error("Failed to load customer");
      }

      setCustomer(json.data);
      setFormData({
        fullname: json.data.fullname,
        email: json.data.email || "",
        phone: json.data.phone || "",
        username: json.data.username,
        address: json.data.address || "",
        type: json.data.type || "DEFAULT",
        profilePicture: json.data.profilePicture || "",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load customer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, [slug]);

  const totalSpent = useMemo(
    () => customer?.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0,
    [customer],
  );

  const handleUpdateStatus = async (newStatus: CustomerStatus) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/customers/${slug}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      loadCustomer();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.includes("@")) {
      alert("Username must contain @ (Ex: @tsport.com)");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/customers/${slug}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to update customer");
      }
      setIsEditDialogOpen(false);
      loadCustomer();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !customer) return <div className="py-10 text-center text-muted-foreground">Loading customer details...</div>;

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline">
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to customers
          </Link>
        </Button>
        <div className="py-10 text-center text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/customers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-4">
             {customer.profilePicture ? (
               <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-primary/10 shadow-sm">
                 <Image src={customer.profilePicture} alt={customer.fullname || "Customer Profile"} fill className="object-cover" />
               </div>
             ) : (
               <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center text-xl font-bold text-primary border-2 border-primary/10">
                 {(customer.fullname || "??").substring(0, 2).toUpperCase()}
               </div>
             )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {customer.fullname}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">@{customer.username}</span>
                <Badge variant="outline" className={badgeClass(customer.status)}>
                  {formatStatus(customer.status)}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                   {customer.type.toLowerCase().replace("_", " ")}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)} className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
          {customer.status === "ACTIVE" ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
              onClick={() => handleUpdateStatus("INACTIVE")}
              disabled={isSubmitting}
            >
              <UserMinus className="h-4 w-4" />
              Disable Account
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              onClick={() => handleUpdateStatus("ACTIVE")}
              disabled={isSubmitting}
            >
              <UserCheck className="h-4 w-4" />
              Enable Account
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Orders" value={String(customer.orders.length)} icon={<ShoppingBag className="h-5 w-5" />} />
        <SummaryCard title="Total Spent" value={formatMoney(totalSpent)} icon={<User className="h-5 w-5" />} />
        <SummaryCard title="Joined" value={formatDate(customer.createdAt)} icon={<Mail className="h-5 w-5" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                 <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                 <div>
                   <p className="text-xs font-medium text-muted-foreground">Email</p>
                   <p className="text-sm">{customer.email || "No email provided"}</p>
                 </div>
              </div>
              <div className="flex items-start gap-3">
                 <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                 <div>
                   <p className="text-xs font-medium text-muted-foreground">Phone</p>
                   <p className="text-sm">{customer.phone || "-"}</p>
                 </div>
              </div>
              <div className="flex items-start gap-3">
                 <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                 <div>
                   <p className="text-xs font-medium text-muted-foreground">Address</p>
                   <p className="text-sm whitespace-pre-wrap">{customer.address || "No address provided"}</p>
                 </div>
              </div>
              <Separator />
              <div className="flex flex-col gap-1">
                 <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDate(customer.createdAt)}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Last Update</span>
                    <span>{formatDate(customer.updatedAt)}</span>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.orders.length ? (
                    customer.orders.map((order) => (
                      <TableRow key={order.slug}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={badgeClass(order.status)}>
                            {formatStatus(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.items.length}</TableCell>
                        <TableCell>{formatMoney(order.totalAmount)}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/orders/${order.slug}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        No orders for this customer.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEditCustomer}>
            <DialogHeader>
              <DialogTitle>Edit Customer Profile</DialogTitle>
              <DialogDescription>
                Update the customer's personal information following the old system fields.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2">Information</h3>
                <SingleImageUpload 
                  value={formData.profilePicture}
                  onChange={url => setFormData({ ...formData, profilePicture: url })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fullname</label>
                    <Input 
                      value={formData.fullname}
                      onChange={e => setFormData({ ...formData, fullname: e.target.value })}
                      placeholder="Enter your name"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phonenumber</label>
                    <Input 
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phonenumber"
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <Textarea 
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2">Authentication</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Username (@)</label>
                    <Input 
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      required 
                    />
                    <small className="text-xs text-destructive">Username required @ (Ex: @tsport.com)</small>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground italic">Password (Leave empty to keep current)</label>
                    <Input 
                      type="password"
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2">Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Customer Type</label>
                    <Select 
                      value={formData.type} 
                      onValueChange={val => setFormData({ ...formData, type: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DEFAULT">Default</SelectItem>
                        <SelectItem value="HOLD_SALE">Hold Sale</SelectItem>
                        <SelectItem value="PREMIUM">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email (Optional)</label>
                    <Input 
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({
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
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
