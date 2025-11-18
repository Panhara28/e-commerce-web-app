import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Topbar() {
  return (
    <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-border bg-[#fff] sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <div className="w-8 h-8" />
        <div className="text-xl font-semibold text-foreground">
          Tsportcambodia
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* USER DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors flex items-center gap-2">
              <span>Chhouk Titpanhara</span>
              <User size={20} />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-40" align="end">
            <DropdownMenuItem onClick={() => console.log("Profile clicked")}>
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => console.log("Settings clicked")}>
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive"
              onClick={() => console.log("Logout clicked")}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
