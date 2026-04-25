"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Search, Users, Plus, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type CustomerListItem = {
  id: number;
  slug: string;
  username: string;
  fullname: string;
  email: string | null;
  phone: string | null;
  profilePicture: string | null;
  status: CustomerStatus;
  type: string;
  createdAt: string;
};

type CustomerListResponse = {
  status: "ok" | "error";
  page: number;
  limit: number;
  total: number;
  data: CustomerListItem[];
};

const pageSize = 10;

function formatDate(value: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatus(status: CustomerStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function statusClass(status: CustomerStatus) {
  if (status === "ACTIVE") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "INACTIVE") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

export default function CustomerListScreen() {
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullname: "",
    email: "",
    phone: "",
    address: "",
    type: "DEFAULT",
    profilePicture: "",
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const activeCount = useMemo(
    () => customers.filter((customer) => customer.status === "ACTIVE").length,
    [customers],
  );

  const loadCustomers = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    });

    if (search.trim()) params.set("search", search.trim());

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/customers/lists?${params.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as CustomerListResponse;

      if (!res.ok || json.status !== "ok") {
        throw new Error("Failed to load customers");
      }

      setCustomers(json.data);
      setTotal(json.total);
    } catch (err) {
      console.error(err);
      setError("Failed to load customers.");
      setCustomers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.includes("@")) {
      alert("Username must contain @ (Ex: @tsport.com)");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/customers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to create customer");
      }

      setIsDialogOpen(false);
      setFormData({
        username: "",
        password: "",
        fullname: "",
        email: "",
        phone: "",
        address: "",
        type: "DEFAULT",
        profilePicture: "",
      });
      loadCustomers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse store customers and manage profiles.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus size={18} />
          Add Customer
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Metric title="Total Customers" value={String(total)} />
        <Metric title="Active On This Page" value={String(activeCount)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full max-w-sm">
            <label className="mb-1 block text-sm text-muted-foreground">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Name, username, or phone"
                className="pl-9"
              />
            </div>
          </div>

          {error ? <div className="text-sm text-destructive">{error}</div> : null}

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      Loading customers...
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No customers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.slug}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                           {customer.profilePicture ? (
                             <img src={customer.profilePicture} alt="" className="h-8 w-8 rounded-full object-cover border" />
                           ) : (
                             <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                                {(customer.fullname || "??").substring(0, 2).toUpperCase()}
                             </div>
                           )}
                           <div>
                            <div className="font-medium">{customer.fullname}</div>
                            <div className="text-xs text-muted-foreground">{customer.phone || "-"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.username}</TableCell>
                      <TableCell>
                         <Badge variant="secondary" className="capitalize">
                            {customer.type.toLowerCase().replace("_", " ")}
                         </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusClass(customer.status)}>
                          {formatStatus(customer.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(customer.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/customers/${customer.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {total} customer{total === 1 ? "" : "s"}
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateCustomer}>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Register a new customer following the old system fields.
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
                    <label className="text-sm font-medium">Password</label>
                    <Input 
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      required 
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
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Customer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
