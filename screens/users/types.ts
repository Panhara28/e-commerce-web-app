export type AdminUser = {
  id: number;
  slug: string;
  name: string;
  email: string;
  profilePicture: string;
  roleId: number;
  role: string | null;
  roleSlug: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: Array<{
    id: number;
    name: string;
    description: string | null;
  }>;
  mediaCount?: number;
};

export type RoleOption = {
  id: number;
  slug: string;
  name: string;
};

export function formatDate(value: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}
