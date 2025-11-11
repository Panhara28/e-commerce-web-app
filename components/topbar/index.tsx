import { Bell, Download, MessageCircle, User } from "lucide-react";

export default function Topbar() {
  return (
    <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-border bg-background sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <div className="w-8 h-8" />
        <div className="text-xl font-semibold text-foreground">
          Designali Creative
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <Download size={20} />
        </button>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            5
          </span>
        </button>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <MessageCircle size={20} />
        </button>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <User size={20} />
        </button>
      </div>
    </div>
  );
}
