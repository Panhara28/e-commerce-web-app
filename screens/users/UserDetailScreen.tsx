"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AdminUser, formatDate, initials } from "./types";
import { getApiErrorMessage } from "@/lib/api-error";

type UserResponse = {
  success: boolean;
  data: AdminUser;
};

type Props = {
  slug: string;
};

function formatPermissionName(name: string) {
  return name.replace(/[:_]/g, " ");
}

export default function UserDetailScreen({ slug }: Props) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/${slug}`, { cache: "no-store" });
        const json = (await res.json()) as UserResponse;
        if (!res.ok || !json.success) throw new Error(getApiErrorMessage(json, "Failed to load user"));
        setUser(json.data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load user.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [slug]);

  if (loading) return <div className="py-10 text-center">Loading user...</div>;

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline">
          <Link href="/users">
            <ArrowLeft className="h-4 w-4" />
            Back to users
          </Link>
        </Button>
        <div className="py-10 text-center text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/users">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted font-semibold">
              {initials(user.name)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{user.name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        <Button asChild>
          <Link href={`/users/${user.slug}/edit`}>
            <Edit className="h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Info label="Name" value={user.name} />
            <Info label="Email" value={user.email} />
            <Info label="Role" value={user.role || "-"} />
            <Info label="Uploaded media" value={String(user.mediaCount || 0)} />
            <Separator />
            <Info label="Created" value={formatDate(user.createdAt)} />
            <Info label="Updated" value={formatDate(user.updatedAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.permissions?.length ? (
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission) => (
                  <Badge key={permission.id} variant="outline">
                    {formatPermissionName(permission.name)}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                This user role has no permissions assigned.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
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
