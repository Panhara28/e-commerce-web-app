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
  items?: { label: string; href: string }[];
};

export default function NavDropdownItem({
  icon,
  label,
  badge,
  isExpanded = false,
  onToggle,
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
        onClick={onToggle}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors",
          hasActiveChild
            ? "bg-sidebar-primary text-white font-medium"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
        )}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span>{label}</span>
          {badge && (
            <span className="ml-2 text-xs bg-sidebar-accent text-foreground rounded-md px-1.5 py-0.5">
              {badge}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown size={16} className="text-muted-foreground" />
        ) : (
          <ChevronRight size={16} className="text-muted-foreground" />
        )}
      </button>

      {/* Dropdown content */}
      {isExpanded && items.length > 0 && (
        <div className="ml-8 flex flex-col gap-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm px-3 py-1.5 rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
