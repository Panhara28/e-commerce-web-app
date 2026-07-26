"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Edit,
  Eye,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  UserCog,
  Users,
} from "lucide-react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { AdminUser, RoleOption, formatDate, initials } from "./types";
import { getApiErrorMessage } from "@/lib/api-error";

type UserListResponse = {
  status: "ok" | "error";
  page: number;
  limit: number;
  total: number;
  data: AdminUser[];
};

type RoleListResponse = {
  status: "ok" | "error";
  data: RoleOption[];
};

type UserResponse = {
  success: boolean;
  data: AdminUser;
};

const pageSize = 10;
const emptyForm = { name: "", email: "", password: "", roleId: "", profilePicture: "" };

export default function UserListScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignRoleId, setAssignRoleId] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const usersWithRole = useMemo(() => users.filter((user) => Boolean(user.role)).length, [users]);

  const loadRoles = useCallback(async () => {
    const res = await fetch("/api/roles/lists?limit=100", { cache: "no-store" });
    const json = (await res.json()) as RoleListResponse;
    if (res.ok && json.status === "ok") setRoles(json.data);
  }, []);

  const loadUsers = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search.trim()) params.set("search", search.trim());
    if (roleFilter) params.set("role", roleFilter);

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/users/lists?${params.toString()}`, { cache: "no-store" });
      const json = (await res.json()) as UserListResponse;
      if (!res.ok || json.status !== "ok") throw new Error(getApiErrorMessage(json, "Failed to load users"));
      setUsers(json.data);
      setTotal(json.total);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load users.");
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const resetForm = () => {
    setForm(emptyForm);
    setFormError("");
  };

  const openEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      roleId: String(user.roleId),
      profilePicture: user.profilePicture || "",
    });
    setIsEditOpen(true);
  };

  const openAssignRole = (user: AdminUser) => {
    setSelectedUser(user);
    setAssignRoleId(String(user.roleId));
    setFormError("");
    setIsAssignOpen(true);
  };

  const saveUser = async (mode: "create" | "edit") => {
    if (!form.name || !form.email || !form.roleId || (mode === "create" && !form.password)) {
      setFormError("Name, email, role, and password are required.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      const payload: Record<string, string | number> = {
        name: form.name,
        email: form.email,
        roleId: Number(form.roleId),
        profilePicture: form.profilePicture,
      };
      if (form.password) payload.password = form.password;

      const res = await fetch(
        mode === "edit" && selectedUser
          ? `/api/users/${selectedUser.slug}/update`
          : "/api/users/create",
        {
          method: mode === "edit" ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = (await res.json()) as UserResponse;
      if (!res.ok || !json.success) throw new Error(getApiErrorMessage(json, "Failed to save user"));

      if (mode === "edit") {
        const roleRes = await fetch(`/api/users/${json.data.slug}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roleId: Number(form.roleId) }),
        });
        if (!roleRes.ok) {
          const roleJson = await roleRes.json().catch(() => null);
          throw new Error(getApiErrorMessage(roleJson, "Failed to assign role"));
        }
      }

      setIsAddOpen(false);
      setIsEditOpen(false);
      setSelectedUser(null);
      resetForm();
      loadUsers();
    } catch (err) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : "Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  const saveAssignedRole = async () => {
    if (!selectedUser || !assignRoleId) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/users/${selectedUser.slug}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: Number(assignRoleId) }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(getApiErrorMessage(json, "Failed to assign role"));
      }
      setIsAssignOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : "Failed to assign role.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage admin accounts, roles, and permissions.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric title="Total Users" value={String(total)} icon={<Users className="h-5 w-5" />} />
        <Metric title="With Roles" value={String(usersWithRole)} icon={<Shield className="h-5 w-5" />} />
        <Metric title="Available Roles" value={String(roles.length)} icon={<UserCog className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative min-w-64 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search users..."
                className="pl-9"
              />
            </div>
            <Select
              value={roleFilter || "ALL"}
              onValueChange={(value) => {
                setRoleFilter(value === "ALL" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center">Loading users...</TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.slug}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                            {initials(user.name)}
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <Shield className="h-3 w-3" />
                          {user.role || "No role"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsViewOpen(true); }}>
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(user)}>
                              <Edit className="h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAssignRole(user)}>
                              <UserCog className="h-4 w-4" />
                              Assign Role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {users.length} of {total} users
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1 || loading} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages || loading} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <UserFormDialog
        open={isAddOpen}
        title="Add New User"
        form={form}
        roles={roles}
        saving={saving}
        error={formError}
        requirePassword
        onOpenChange={setIsAddOpen}
        onFormChange={setForm}
        onSubmit={() => saveUser("create")}
      />

      <UserFormDialog
        open={isEditOpen}
        title="Edit User"
        form={form}
        roles={roles}
        saving={saving}
        error={formError}
        onOpenChange={setIsEditOpen}
        onFormChange={setForm}
        onSubmit={() => saveUser("edit")}
      />

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted font-semibold">
                  {initials(selectedUser.name)}
                </div>
                <div>
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                </div>
              </div>
              <div className="grid gap-2 text-sm">
                <Info label="Role" value={selectedUser.role || "-"} />
                <Info label="Created" value={formatDate(selectedUser.createdAt)} />
                <Info label="Updated" value={formatDate(selectedUser.updatedAt)} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
          </DialogHeader>
          {formError && <div className="text-sm text-destructive">{formError}</div>}
          <Select value={assignRoleId} onValueChange={setAssignRoleId}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={String(role.id)}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
            <Button onClick={saveAssignedRole} disabled={saving || !assignRoleId}>Save Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserFormDialog({
  open,
  title,
  form,
  roles,
  saving,
  error,
  requirePassword,
  onOpenChange,
  onFormChange,
  onSubmit,
}: {
  open: boolean;
  title: string;
  form: typeof emptyForm;
  roles: RoleOption[];
  saving: boolean;
  error: string;
  requirePassword?: boolean;
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: typeof emptyForm) => void;
  onSubmit: () => void;
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" required>
              <Input value={form.name} onChange={(event) => onFormChange({ ...form, name: event.target.value })} required />
            </Field>
            <Field label="Email" required>
              <Input type="email" value={form.email} onChange={(event) => onFormChange({ ...form, email: event.target.value })} required />
            </Field>
            <Field label={requirePassword ? "Password" : "New password"} required={requirePassword}>
              <Input type="password" value={form.password} onChange={(event) => onFormChange({ ...form, password: event.target.value })} required={requirePassword} />
            </Field>
            <Field label="Role" required>
              <Select value={form.roleId} onValueChange={(value) => onFormChange({ ...form, roleId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Profile picture URL">
              <Input value={form.profilePicture} onChange={(event) => onFormChange({ ...form, profilePicture: event.target.value })} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save User"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm text-muted-foreground">{label}{required ? " *" : ""}</span>
      {children}
    </label>
  );
}

function Metric({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
        </div>
        <div className="rounded-md bg-muted p-3 text-muted-foreground">{icon}</div>
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
