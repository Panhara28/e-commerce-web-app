"use client";

import {
  BarChart3,
  Grid3x3,
  Home,
  ShoppingCart,
  Users,
  Settings,
} from "lucide-react";

import { useState } from "react";
import NavItem from "@/components/nav-item";
import NavDropdownItem from "@/components/nav-dropdown-item";

export default function Asidebar() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleExpanded = (item: string) => {
    const next = new Set(expandedItems);
    next.has(item) ? next.delete(item) : next.add(item);
    setExpandedItems(next);
  };

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 z-40 md:z-0 md:translate-x-0 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:pt-0 pt-16`}
    >
      {/* SIDEBAR WRAPPER — FIXED HEIGHT + SCROLL */}
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="hidden md:flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
            ✨
          </div>
          <div>
            <div className="font-bold text-foreground">Tsportcambodia</div>
            <div className="text-xs text-muted-foreground">
              Provide Sport Suite
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-4 hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-foreground placeholder-muted-foreground border border-border"
          />
        </div>

        {/* MAIN NAVIGATION — ONLY THIS PART SCROLLS */}
        <div className="flex-1 overflow-y-auto px-1">
          <nav className="space-y-1 px-3 py-4">
            {/* Home */}
            <NavItem icon={<Home size={18} />} label="Home" href="/" />

            {/* Products */}
            <NavDropdownItem
              icon={<Grid3x3 size={18} />}
              label="Products"
              isExpanded={expandedItems.has("products")}
              onToggle={() => toggleExpanded("products")}
              items={[
                { label: "All Products", href: "/products" },
                { label: "Add Products", href: "/products/add" },
              ]}
            />

            {/* Orders */}
            <NavDropdownItem
              icon={<ShoppingCart size={18} />}
              label="Orders"
              isExpanded={expandedItems.has("orders")}
              onToggle={() => toggleExpanded("orders")}
              items={[
                { label: "All Orders", href: "/orders" },
                { label: "Pending Orders", href: "/orders/pending" },
                { label: "Completed Orders", href: "/orders/completed" },
                { label: "Cancelled Orders", href: "/orders/cancelled" },
              ]}
            />

            {/* Reports */}
            <NavDropdownItem
              icon={<BarChart3 size={18} />}
              label="Reports"
              isExpanded={expandedItems.has("reports")}
              onToggle={() => toggleExpanded("reports")}
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
              items={[
                { label: "Profile", href: "/settings/profile" },
                { label: "Change Password", href: "/settings/change-password" },
              ]}
            />
          </nav>
        </div>

        {/* BOTTOM SECTION — FIXED, NOT SCROLLING */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar">
          <NavItem
            icon={<Settings size={18} />}
            label="Settings"
            href="/settings"
          />
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">
                John Doe
              </div>
              <div className="text-xs text-muted-foreground">Pro</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
