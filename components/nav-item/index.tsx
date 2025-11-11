export default function NavItem({
  icon,
  label,
  badge,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent"
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
      {badge && (
        <span className="ml-auto text-xs bg-sidebar-accent-foreground text-sidebar-accent px-2 py-1 rounded">
          {badge}
        </span>
      )}
    </button>
  );
}
