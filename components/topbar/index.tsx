import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PanelLeftClose, PanelLeftOpen, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type TopbarProfile = {
  success: boolean;
  data?: {
    name: string;
    profilePicture: string;
  };
};

export default function Topbar({
  sidebarCollapsed,
  onToggleSidebar,
}: {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("User");
  const [profilePicture, setProfilePicture] = useState("");

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error(err);
    } finally {
      router.push("/views/signin");
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/settings/profile", { cache: "no-store" });
        const json = (await res.json()) as TopbarProfile;
        if (res.ok && json.success && json.data) {
          if (json.data.name) {
            setName(json.data.name);
          }
          setProfilePicture(json.data.profilePicture || "");
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="hidden shrink-0 items-center justify-between border-b border-border bg-[#fff] px-6 py-4 md:flex">
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-secondary"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
        <div className="text-xl font-semibold text-foreground">
          Tsportcambodia
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* USER DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors flex items-center gap-2">
              <span>{name}</span>
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted">
                {profilePicture ? (
                  <Image
                    src={profilePicture}
                    alt={name}
                    width={32}
                    height={32}
                    className="h-8 w-8 object-cover"
                  />
                ) : (
                  <User size={20} />
                )}
              </span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-40" align="end">
            <DropdownMenuItem asChild>
              <Link href="/settings/profile">Profile</Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
