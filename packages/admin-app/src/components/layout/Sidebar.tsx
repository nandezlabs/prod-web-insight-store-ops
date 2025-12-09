import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Package,
  RefreshCw,
  Store,
  DollarSign,
  BarChart3,
  Settings,
  Home,
  MessageSquare,
  ListTodo,
  Users,
} from "lucide-react";
import { cn } from "@/utils";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
}

const navigation: NavItem[] = [
  { id: "dashboard", path: "/dashboard", label: "Dashboard", icon: Home },
  { id: "forms", path: "/forms", label: "Form Builder", icon: FileText },
  { id: "inventory", path: "/inventory", label: "Inventory", icon: Package },
  {
    id: "replacements",
    path: "/replacements",
    label: "Replacement Requests",
    icon: RefreshCw,
    badge: 3,
  },
  { id: "analytics", path: "/analytics", label: "Analytics", icon: BarChart3 },
  { id: "stores", path: "/stores", label: "Stores", icon: Store },
  { id: "users", path: "/users", label: "Users", icon: Users },
  { id: "reports", path: "/reports", label: "P&L Reports", icon: DollarSign },
  { id: "tasks", path: "/tasks", label: "Tasks", icon: ListTodo },
  { id: "messages", path: "/messages", label: "Messages", icon: MessageSquare },
];

const bottomNavigation: NavItem[] = [
  { id: "settings", path: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <div className="h-full bg-white border-r border-slate-200 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Admin</h1>
            <p className="text-xs text-slate-500">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="mb-2">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-blue-600" : "text-slate-400"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-slate-200 space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
