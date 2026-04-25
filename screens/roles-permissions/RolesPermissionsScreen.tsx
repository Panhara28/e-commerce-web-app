"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  Edit,
  Eye,
  KeyRound,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type PermissionAction = "create" | "read" | "update" | "delete";
type PermissionModule = { id: number; name: string; label: string; description: string | null };
type RolePermission = {
  moduleId: number;
  moduleName: string;
  moduleLabel: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
};
type Role = {
  id: number;
  slug: string;
  name: string;
  userCount: number;
  permissionCount: number;
  permissions: RolePermission[];
  createdAt: string;
};
type RolesResponse = { status: "ok" | "error"; page: number; limit: number; total: number; data: Role[] };
type PermissionsResponse = { status: "ok" | "error"; modules: PermissionModule[] };
type RolePermissionsResponse = {
  role: { id: number; name: string; slug: string };
  permissions: Array<RolePermission & { module: PermissionModule }>;
};

const pageSize = 10;
const actions: PermissionAction[] = ["create", "read", "update", "delete"];

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function titleize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function RolesPermissionsScreen() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<PermissionModule[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissionState, setPermissionState] = useState<Record<string, RolePermission>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [roleName, setRoleName] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [isViewRoleOpen, setIsViewRoleOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isModuleOpen, setIsModuleOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const buildPermissionState = useCallback((rolePermissions: RolePermission[] = []) => {
    const byModule = new Map(rolePermissions.map((item) => [item.moduleName, item]));
    return modules.reduce<Record<string, RolePermission>>((acc, module) => {
      const existing = byModule.get(module.name);
      acc[module.name] = {
        moduleId: module.id,
        moduleName: module.name,
        moduleLabel: module.label || titleize(module.name),
        create: existing?.create ?? false,
        read: existing?.read ?? false,
        update: existing?.update ?? false,
        delete: existing?.delete ?? false,
      };
      return acc;
    }, {});
  }, [modules]);

  const loadModules = useCallback(async () => {
    const res = await fetch("/api/permissions/lists", { cache: "no-store" });
    const json = (await res.json()) as PermissionsResponse;
    if (!res.ok || json.status !== "ok") throw new Error("Failed to load permission modules");
    setModules(json.modules || []);
  }, []);

  const loadRoles = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search.trim()) params.set("search", search.trim());
    const res = await fetch(`/api/roles/lists?${params.toString()}`, { cache: "no-store" });
    const json = (await res.json()) as RolesResponse;
    if (!res.ok || json.status !== "ok") throw new Error("Failed to load roles");
    setRoles(json.data);
    setTotal(json.total);
  }, [page, search]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([loadModules(), loadRoles()]);
    } catch (err) {
      console.error(err);
      setError("Failed to load roles and permissions.");
    } finally {
      setLoading(false);
    }
  }, [loadModules, loadRoles]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openPermissions = async (role: Role) => {
    setSelectedRole(role);
    setIsPermissionsOpen(true);
    setPermissionState(buildPermissionState(role.permissions));
    try {
      const res = await fetch(`/api/roles/permissions/${role.slug}`, { cache: "no-store" });
      const json = (await res.json()) as RolePermissionsResponse;
      setPermissionState(buildPermissionState(json.permissions || []));
    } catch {
      setPermissionState(buildPermissionState(role.permissions));
    }
  };

  const createRole = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!roleName.trim()) return;
    try {
      setSaving(true);
      const res = await fetch("/api/roles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roleName }),
      });
      if (!res.ok) throw new Error("Failed to create role");
      setRoleName("");
      setIsAddRoleOpen(false);
      setNotice("Role created.");
      await loadRoles();
    } catch (err) {
      console.error(err);
      setError("Failed to create role. The name may already exist.");
    } finally {
      setSaving(false);
    }
  };

  const updateRole = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!selectedRole || !roleName.trim()) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/roles/${selectedRole.slug}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roleName }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      setIsEditRoleOpen(false);
      setNotice("Role updated.");
      await loadRoles();
    } catch (err) {
      console.error(err);
      setError("Failed to update role.");
    } finally {
      setSaving(false);
    }
  };

  const createModule = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!moduleName.trim()) return;
    try {
      setSaving(true);
      const res = await fetch("/api/permissions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleName, label: titleize(moduleName), description: moduleDescription }),
      });
      if (!res.ok) throw new Error("Failed to create permission module");
      setModuleName("");
      setModuleDescription("");
      setIsModuleOpen(false);
      setNotice("Permission module created.");
      await loadModules();
    } catch (err) {
      console.error(err);
      setError("Failed to create permission module.");
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (moduleNameValue: string, action: PermissionAction) => {
    setPermissionState((current) => ({
      ...current,
      [moduleNameValue]: {
        ...current[moduleNameValue],
        [action]: !current[moduleNameValue]?.[action],
      },
    }));
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    try {
      setSaving(true);
      const permissions = Object.values(permissionState).map((permission) => ({
        moduleName: permission.moduleName,
        create: permission.create,
        read: permission.read,
        update: permission.update,
        delete: permission.delete,
      }));
      const res = await fetch(`/api/roles/${selectedRole.slug}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      });
      if (!res.ok) throw new Error("Failed to save permissions");
      setIsPermissionsOpen(false);
      setNotice("Permissions updated.");
      await loadRoles();
    } catch (err) {
      console.error(err);
      setError("Failed to save role permissions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage roles and permissions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsModuleOpen(true)}>
            <KeyRound className="h-4 w-4" />
            Add Module
          </Button>
          <Button onClick={() => { setRoleName(""); setIsAddRoleOpen(true); }}>
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        </div>
      </div>

      {(error || notice) && <div className={error ? "text-sm text-destructive" : "text-sm text-emerald-700"}>{error || notice}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <Metric title="Total Roles" value={String(total)} icon={<Shield className="h-5 w-5" />} />
        <Metric title="With Users" value={String(roles.filter((role) => role.userCount > 0).length)} icon={<Users className="h-5 w-5" />} />
        <Metric title="Permission Modules" value={String(modules.length)} icon={<KeyRound className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search roles..." className="pl-9" />
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Role Name</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center">Loading roles...</TableCell></TableRow>
                ) : roles.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No roles found.</TableCell></TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.slug}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <Shield className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{role.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{role.userCount || <span className="text-muted-foreground">No users</span>}</TableCell>
                      <TableCell><Badge variant="outline">{role.permissionCount} modules</Badge></TableCell>
                      <TableCell>{formatDate(role.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setSelectedRole(role); setIsViewRoleOpen(true); }}>
                              <Eye className="h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedRole(role); setRoleName(role.name); setIsEditRoleOpen(true); }}>
                              <Edit className="h-4 w-4" /> Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPermissions(role)}>
                              <Lock className="h-4 w-4" /> Assign Permissions
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
            <div className="text-sm text-muted-foreground">Showing {roles.length} of {total} roles</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1 || loading} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages || loading} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RoleDialog open={isAddRoleOpen} title="Add New Role" roleName={roleName} saving={saving} onRoleNameChange={setRoleName} onOpenChange={setIsAddRoleOpen} onSubmit={createRole} />
      <RoleDialog open={isEditRoleOpen} title="Edit Role" roleName={roleName} saving={saving} onRoleNameChange={setRoleName} onOpenChange={setIsEditRoleOpen} onSubmit={updateRole} />

      <Dialog open={isViewRoleOpen} onOpenChange={setIsViewRoleOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Role Details</DialogTitle></DialogHeader>
          {selectedRole && (
            <div className="space-y-3 text-sm">
              <Info label="Name" value={selectedRole.name} />
              <Info label="Users" value={String(selectedRole.userCount)} />
              <Info label="Permission modules" value={String(selectedRole.permissionCount)} />
              <Info label="Created" value={formatDate(selectedRole.createdAt)} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isModuleOpen} onOpenChange={setIsModuleOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Permission Module</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={createModule}>
            <Input value={moduleName} onChange={(event) => setModuleName(event.target.value)} placeholder="Module name, e.g. products" />
            <Textarea value={moduleDescription} onChange={(event) => setModuleDescription(event.target.value)} placeholder="Description" />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModuleOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>Create Module</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Assign Permissions{selectedRole ? `: ${selectedRole.name}` : ""}</DialogTitle></DialogHeader>
          <div className="max-h-[65vh] overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Module</TableHead>
                  {actions.map((action) => <TableHead key={action} className="text-center capitalize">{action}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((module) => {
                  const permission = permissionState[module.name];
                  return (
                    <TableRow key={module.name}>
                      <TableCell className="font-medium">{module.label || titleize(module.name)}</TableCell>
                      {actions.map((action) => (
                        <TableCell key={action} className="text-center">
                          <Checkbox checked={Boolean(permission?.[action])} onCheckedChange={() => togglePermission(module.name, action)} />
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsOpen(false)}>Cancel</Button>
            <Button onClick={savePermissions} disabled={saving}><Lock className="h-4 w-4" /> Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RoleDialog({ open, title, roleName, saving, onRoleNameChange, onOpenChange, onSubmit }: {
  open: boolean;
  title: string;
  roleName: string;
  saving: boolean;
  onRoleNameChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input value={roleName} onChange={(event) => onRoleNameChange(event.target.value)} placeholder="Role name" />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>Save Role</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
