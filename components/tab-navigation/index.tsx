import { Download, Plus } from "lucide-react";
import { Button } from "../ui/button";

export default function TabNavigation() {
  return (
    <div className="flex items-center justify-between px-20 md:px-20 py-4 border-b border-border bg-background overflow-x-auto">
      <div className="flex gap-6 text-sm md:text-base">
        <Tab label="Home" active />
        <Tab label="Apps" />
        <Tab label="Files" />
        <Tab label="Projects" />
        <Tab label="Learn" />
      </div>
      <div className="flex gap-2 ml-4 md:ml-0">
        <Button
          variant="outline"
          size="sm"
          className="text-xs md:text-sm flex items-center gap-2 bg-transparent"
        >
          <Download size={16} /> Install App
        </Button>
        <Button
          size="sm"
          className="text-xs md:text-sm flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          <Plus size={16} /> New Project
        </Button>
      </div>
    </div>
  );
}

function Tab({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      className={`pb-3 px-1 border-b-2 font-medium transition-colors whitespace-nowrap ${
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
