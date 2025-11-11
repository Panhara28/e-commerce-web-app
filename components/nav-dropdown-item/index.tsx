import { ChevronDown } from "lucide-react";

export default function NavDropdownItem({
  icon,
  label,
  badge,
  isExpanded,
  onToggle,
  items,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  isExpanded: boolean;
  onToggle: () => void;
  items: string[];
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent"
      >
        {icon}
        <span className="font-medium text-sm">{label}</span>
        {badge && (
          <span className="ml-auto text-xs bg-sidebar-accent-foreground text-sidebar-accent px-2 py-1 rounded">
            {badge}
          </span>
        )}
        {!badge && <span className="ml-auto" />}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {isExpanded && (
        <div className="ml-4 space-y-1 mt-1 pl-4 border-l border-sidebar-accent">
          {items.map((item) => (
            <button
              key={item}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent text-sm"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
