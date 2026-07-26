"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

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
import { AdminUser, RoleOption } from "./types";
import { getApiErrorMessage } from "@/lib/api-error";

type Props = {
  mode: "create" | "edit";
  slug?: string;
};

type UserResponse = {
  success: boolean;
  data: AdminUser;
};

type RoleListResponse = {
  status: "ok" | "error";
  data: RoleOption[];
};

export default function UserFormScreen({ mode, slug }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRoles = async () => {
      const res = await fetch("/api/roles/lists?limit=100", { cache: "no-store" });
      const json = (await res.json()) as RoleListResponse;
      if (res.ok && json.status === "ok") setRoles(json.data);
    };

    loadRoles();
  }, []);

  useEffect(() => {
    if (!isEdit || !slug) return;

    const loadUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/${slug}`, { cache: "no-store" });
        const json = (await res.json()) as UserResponse;
        if (!res.ok || !json.success) throw new Error(getApiErrorMessage(json, "Failed to load user"));

        setName(json.data.name);
        setEmail(json.data.email);
        setRoleId(String(json.data.roleId));
        setProfilePicture(json.data.profilePicture || "");
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load user.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [isEdit, slug]);

  const saveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload: Record<string, string | number> = {
      name,
      email,
      roleId: Number(roleId),
      profilePicture,
    };

    if (password) payload.password = password;

    try {
      const res = await fetch(
        isEdit ? `/api/users/${slug}/update` : "/api/users/create",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = (await res.json()) as UserResponse;

      if (!res.ok || !json.success) throw new Error(getApiErrorMessage(json, "Failed to save user"));

      if (isEdit) {
        const roleRes = await fetch(`/api/users/${json.data.slug}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roleId: Number(roleId) }),
        });
        if (!roleRes.ok) {
          const roleJson = await roleRes.json().catch(() => null);
          throw new Error(getApiErrorMessage(roleJson, "Failed to assign role"));
        }
      }

      router.push(`/users/${json.data.slug}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-10 text-center">Loading user...</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/users">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {isEdit ? "Edit User" : "Add User"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? "Update an admin account and role." : "Create an admin account with a role."}
          </p>
        </div>
      </div>

      <form onSubmit={saveUser}>
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {error && <div className="text-sm text-destructive">{error}</div>}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name" required>
                <Input value={name} onChange={(event) => setName(event.target.value)} required />
              </Field>
              <Field label="Email" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>
              <Field label={isEdit ? "New password" : "Password"} required={!isEdit}>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required={!isEdit}
                />
              </Field>
              <Field label="Role" required>
                <Select value={roleId} onValueChange={setRoleId} required>
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
                <Input
                  value={profilePicture}
                  onChange={(event) => setProfilePicture(event.target.value)}
                />
              </Field>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving || !roleId}>
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save User"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-muted-foreground">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
