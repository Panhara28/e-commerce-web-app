"use client";

import {
  Bookmark,
  BookOpen,
  Files,
  Grid3x3,
  Home,
  LayoutGrid,
  Settings,
  Users,
} from "lucide-react";
import { useState } from "react";
import NavItem from "@/components/nav-item";
import NavDropdownItem from "@/components/nav-dropdown-item";

export default function Asidebar() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleExpanded = (item: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(item)) newExpanded.delete(item);
    else newExpanded.add(item);
    setExpandedItems(newExpanded);
  };

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 w-64 md:w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 z-40 md:z-0 md:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:pt-0 pt-16`}
    >
      {/* Logo */}
      <div className="hidden md:flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
          ✨
        </div>
        <div>
          <div className="font-bold text-foreground">Designali</div>
          <div className="text-xs text-muted-foreground">Creative Suite</div>
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

      {/* Navigation */}
      <nav className="space-y-1 px-3 py-4">
        <NavItem icon={<Home size={18} />} label="Home" href="/" />
        <NavDropdownItem
          icon={<Grid3x3 size={18} />}
          label="Products"
          isExpanded={expandedItems.has("apps")}
          onToggle={() => toggleExpanded("apps")}
          items={[
            { label: "All Products", href: "/products" },
            { label: "Add Products", href: "/products/add" },
          ]}
        />
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4 border-t border-sidebar-border bg-sidebar">
        <NavItem
          icon={<Settings size={18} />}
          label="Settings"
          href="/settings"
        />
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-muted" />
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground">John Doe</div>
            <div className="text-xs text-muted-foreground">Pro</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
