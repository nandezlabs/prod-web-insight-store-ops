import { Search, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Breadcrumbs } from "./Breadcrumbs";
import { NotificationCenter } from "./NotificationCenter";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm">
      {/* Left side - Breadcrumbs */}
      <div className="flex items-center gap-4 flex-1">
        <Breadcrumbs />
      </div>

      {/* Right side - Search, Notifications, User Menu */}
      <div className="flex items-center gap-3">
        {/* Search - Desktop only */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-48"
          />
          <kbd className="hidden lg:inline-block px-2 py-0.5 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <NotificationCenter />

        {/* User Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-slate-700">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.role || "Administrator"}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] bg-white rounded-lg shadow-lg border border-slate-200 p-1 z-50"
              sideOffset={5}
              align="end"
            >
              <DropdownMenu.Item className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer outline-none">
                <User className="w-4 h-4 text-slate-400" />
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer outline-none">
                <Settings className="w-4 h-4 text-slate-400" />
                Settings
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-slate-200 my-1" />
              <DropdownMenu.Item
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 cursor-pointer outline-none"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
