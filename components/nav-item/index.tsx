"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItemProps = {
  icon?: ReactNode;
  label: string;
  href?: string;
  collapsed?: boolean;
};

export default function NavItem({
  icon,
  label,
  href = "#",
  collapsed = false,
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        collapsed && "justify-center px-0",
        isActive
          ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {!collapsed ? <span>{label}</span> : null}
    </Link>
  );
}
