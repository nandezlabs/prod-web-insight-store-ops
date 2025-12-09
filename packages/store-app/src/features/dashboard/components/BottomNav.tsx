import { useLocation, useNavigate } from "react-router-dom";
import { Home, FileText, History, MoreHorizontal } from "lucide-react";
import type { NavItem } from "../types";

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    route: "/dashboard",
  },
  {
    id: "forms",
    label: "Forms",
    icon: FileText,
    route: "/forms",
  },
  {
    id: "history",
    label: "History",
    icon: History,
    route: "/history",
  },
  {
    id: "more",
    label: "More",
    icon: MoreHorizontal,
    route: "/more",
  },
];

/**
 * Bottom navigation bar for main app sections.
 * Fixed at bottom with 56px touch targets and active state indicator.
 */
export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 safe-area-inset-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-4 gap-0">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.route ||
              (item.route !== "/dashboard" &&
                location.pathname.startsWith(item.route));
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.route)}
                className={`
                  relative flex flex-col items-center justify-center
                  min-h-[56px] py-2 px-1
                  transition-colors duration-150
                  ${
                    isActive
                      ? "text-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }
                `}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Icon */}
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="mb-1"
                />

                {/* Label */}
                <span className="text-xs font-medium">{item.label}</span>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 rounded-b-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
