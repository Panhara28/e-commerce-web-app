"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavDropdownItemProps = {
  icon?: ReactNode;
  label: string;
  badge?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  collapsed?: boolean;
  onExpandSidebar?: () => void;
  items?: { label: string; href: string; badge?: string }[];
};

export default function NavDropdownItem({
  icon,
  label,
  badge,
  isExpanded = false,
  onToggle,
  collapsed = false,
  onExpandSidebar,
  items = [],
}: NavDropdownItemProps) {
  const pathname = usePathname();

  // Auto-expand if one of its children matches current route
  const hasActiveChild = items.some((item) => pathname === item.href);

  useEffect(() => {
    if (hasActiveChild && onToggle) {
      onToggle(); // ensure expanded if active child
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveChild]);

  return (
    <div className="space-y-1">
      {/* Main dropdown header */}
      <button
        onClick={() => {
          if (collapsed) {
            onExpandSidebar?.();
          }
          onToggle?.();
        }}
        title={collapsed ? label : undefined}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
          collapsed && "justify-center px-0",
          hasActiveChild
            ? "bg-sidebar-primary text-white font-medium"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
        )}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {!collapsed ? <span>{label}</span> : null}
          {!collapsed && badge ? (
            <span className="ml-2 text-xs bg-sidebar-accent text-foreground rounded-md px-1.5 py-0.5">
              {badge}
            </span>
          ) : null}
        </div>
        {!collapsed ? (
          isExpanded ? (
            <ChevronDown size={16} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={16} className="text-muted-foreground" />
          )
        ) : null}
      </button>

      {/* Dropdown content */}
      {!collapsed && isExpanded && items.length > 0 && (
        <div className="ml-8 flex flex-col gap-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="rounded-md bg-sidebar-accent px-1.5 py-0.5 text-xs text-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
