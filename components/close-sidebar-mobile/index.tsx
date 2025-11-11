import { useState } from "react";

export default function CloseSidebarMobile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className={`fixed inset-0 z-30 md:hidden transition-opacity duration-300 ${
        sidebarOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      } bg-black/50`}
      onClick={() => setSidebarOpen(false)}
    />
  );
}
