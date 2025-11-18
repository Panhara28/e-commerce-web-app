"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function MobileHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-border sticky top-0 z-50 bg-background">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
          ✨
        </div>
        <span className="font-semibold text-foreground">Tsportcambodia</span>
      </div>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 hover:bg-secondary rounded-lg transition-colors"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  );
}
