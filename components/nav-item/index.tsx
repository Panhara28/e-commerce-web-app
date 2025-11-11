"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItemProps = {
  icon?: ReactNode;
  label: string;
  href?: string;
};

export default function NavItem({ icon, label, href = "#" }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
        isActive
          ? "bg-sidebar-primary text-white font-medium"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
      )}
    >
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
}
