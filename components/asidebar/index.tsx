"use client";

import {
  BarChart3,
  Contact,
  Grid3x3,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  ShoppingCart,
  Users,
  Settings,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import NavItem from "@/components/nav-item";
import NavDropdownItem from "@/components/nav-dropdown-item";

type SidebarProfile = {
  success: boolean;
  data?: {
    name: string;
    profilePicture: string;
    role: string | null;
  };
};

type PendingOrdersResponse = {
  status: "ok" | "error";
  total: number;
};

export default function Asidebar({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<SidebarProfile["data"] | null>(null);
  const [pendingOrders, setPendingOrders] = useState(0);

  const toggleExpanded = (item: string) => {
    const next = new Set(expandedItems);
    if (next.has(item)) {
      next.delete(item);
    } else {
      next.add(item);
    }
    setExpandedItems(next);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/settings/profile", { cache: "no-store" });
        const json = (await res.json()) as SidebarProfile;
        if (res.ok && json.success && json.data) {
          setProfile(json.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadPendingOrders = async () => {
      try {
        const res = await fetch("/api/orders/lists?page=1&limit=1&status=PENDING", {
          cache: "no-store",
        });
        const json = (await res.json()) as PendingOrdersResponse;
        if (res.ok && json.status === "ok") {
          setPendingOrders(json.total || 0);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadPendingOrders();
  }, []);

  const initials = useMemo(() => {
    const name = profile?.name?.trim() || "User";
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [profile?.name]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 h-screen -translate-x-full overflow-hidden border-r border-sidebar-border bg-sidebar bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 pt-16 text-sidebar-foreground transition-[width,transform] duration-300 md:static md:z-0 md:translate-x-0 md:pt-0 ${
        collapsed ? "w-[88px]" : "w-64"
      }`}
    >
      {/* soft light blooms, echoing the sign-in panel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(147,197,253,0.16),transparent_42%),radial-gradient(circle_at_bottom,rgba(37,99,235,0.22),transparent_45%)]"
      />
      <div className="relative z-10 flex h-full flex-col">
        {/* Logo */}
        <div
          className={`hidden border-b border-sidebar-border md:flex ${
            collapsed
              ? "justify-center px-3 py-6"
              : "items-center gap-3 px-4 py-6"
          }`}
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-lg">
            <Image
              src="/logo.png"
              alt="Tsportcambodia"
              fill
              className="object-cover"
              priority
            />
          </div>
          {!collapsed ? (
            <div>
              <div className="font-bold text-sidebar-foreground">Tsportcambodia</div>
              <div className="text-xs text-sidebar-foreground/60">
                Provide Sport Suite
              </div>
            </div>
          ) : null}
        </div>

        {/* Search */}
        <div className={`hidden md:block ${collapsed ? "px-3 py-3" : "px-4 py-4"}`}>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={`flex h-10 items-center rounded-lg border border-sidebar-border bg-white/10 text-sidebar-foreground transition-colors hover:bg-white/15 ${
              collapsed ? "w-full justify-center" : "w-full justify-start px-3"
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span className="ml-2 text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>

        {!collapsed ? (
          <div className="hidden px-4 pb-4 md:block">
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-lg border border-sidebar-border bg-white/10 px-3 py-2 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
            />
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-1">
          <nav className={`space-y-1 py-4 ${collapsed ? "px-2" : "px-3"}`}>
            {/* Home */}
            <NavItem icon={<Home size={18} />} label="Home" href="/" collapsed={collapsed} />

            {/* Products */}
            <NavDropdownItem
              icon={<Grid3x3 size={18} />}
              label="Products"
              isExpanded={expandedItems.has("products")}
              onToggle={() => toggleExpanded("products")}
              collapsed={collapsed}
              onExpandSidebar={() => {
                if (collapsed) onToggleCollapsed();
              }}
              items={[
                { label: "All Products", href: "/products" },
                { label: "Add Products", href: "/products/add" },
                { label: "Categories", href: "/categories" },
              ]}
            />

            {/* Orders */}
            <NavDropdownItem
              icon={<ShoppingCart size={18} />}
              label="Orders"
              isExpanded={expandedItems.has("orders")}
              onToggle={() => toggleExpanded("orders")}
              collapsed={collapsed}
              onExpandSidebar={() => {
                if (collapsed) onToggleCollapsed();
              }}
              items={[
                { label: "All Orders", href: "/orders" },
                { label: "Order Tracking", href: "/orders/tracking" },
                {
                  label: "Pending Orders",
                  href: "/orders/pending",
                  badge: pendingOrders > 0 ? String(pendingOrders) : undefined,
                },
                { label: "Completed Orders", href: "/orders/completed" },
                { label: "Cancelled Orders", href: "/orders/cancelled" },
              ]}
            />

            <NavItem
              icon={<Contact size={18} />}
              label="Customers"
              href="/customers"
              collapsed={collapsed}
            />

            {/* Reports */}
            <NavDropdownItem
              icon={<BarChart3 size={18} />}
              label="Reports"
              isExpanded={expandedItems.has("reports")}
              onToggle={() => toggleExpanded("reports")}
              collapsed={collapsed}
              onExpandSidebar={() => {
                if (collapsed) onToggleCollapsed();
              }}
              items={[
                { label: "Daily Report", href: "/reports/daily" },
                { label: "Weekly Report", href: "/reports/weekly" },
                { label: "Monthly Report", href: "/reports/monthly" },
                { label: "Yearly Report", href: "/reports/yearly" },
              ]}
            />

            {/* Users */}
            <NavDropdownItem
              icon={<Users size={18} />}
              label="Users"
              isExpanded={expandedItems.has("users")}
              onToggle={() => toggleExpanded("users")}
              collapsed={collapsed}
              onExpandSidebar={() => {
                if (collapsed) onToggleCollapsed();
              }}
              items={[
                { label: "User List", href: "/users" },
                { label: "Create User", href: "/users/create" },
                { label: "Role & Permission", href: "/roles-permissions" },
              ]}
            />

            {/* Settings */}
            <NavDropdownItem
              icon={<Settings size={18} />}
              label="Settings"
              isExpanded={expandedItems.has("settings")}
              onToggle={() => toggleExpanded("settings")}
              collapsed={collapsed}
              onExpandSidebar={() => {
                if (collapsed) onToggleCollapsed();
              }}
              items={[
                { label: "Profile", href: "/settings/profile" },
                { label: "Change Password", href: "/settings/change-password" },
                { label: "Exchange Rate", href: "/settings/exchange-rate" },
                { label: "Banners", href: "/settings/banners" },
              ]}
            />
          </nav>
        </div>

        <div className={`border-t border-sidebar-border ${collapsed ? "p-3" : "p-4"}`}>
          <NavItem
            icon={<Settings size={18} />}
            label="Settings"
            href="/settings"
            collapsed={collapsed}
          />
          <Link
            href="/settings/profile"
            title={collapsed ? profile?.name || "User" : undefined}
            className={`mt-2 flex rounded-lg transition-colors hover:bg-sidebar-accent ${
              collapsed
                ? "justify-center px-0 py-2"
                : "items-center gap-3 px-3 py-2"
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/15 text-xs font-semibold text-sidebar-foreground">
              {profile?.profilePicture ? (
                <Image
                  src={profile.profilePicture}
                  alt={profile?.name || "User"}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-cover"
                />
              ) : (
                initials
              )}
            </div>
            {!collapsed ? (
              <div className="flex-1">
                <div className="text-sm font-medium text-sidebar-foreground">
                  {profile?.name || "User"}
                </div>
                <div className="text-xs text-sidebar-foreground/60">
                  {profile?.role || "Admin"}
                </div>
              </div>
            ) : null}
          </Link>
        </div>
      </div>
    </aside>
  );
}
