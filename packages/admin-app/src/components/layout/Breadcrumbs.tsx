import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  forms: "Form Builder",
  inventory: "Inventory",
  replacements: "Replacement Requests",
  analytics: "Analytics",
  stores: "Stores",
  reports: "P&L Reports",
  settings: "Settings",
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Don't show breadcrumbs on home/dashboard
  if (
    pathnames.length === 0 ||
    (pathnames.length === 1 && pathnames[0] === "dashboard")
  ) {
    return (
      <div className="flex items-center gap-2">
        <Home className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">Dashboard</span>
      </div>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2">
      {/* Home link */}
      <Link
        to="/dashboard"
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {/* Path segments */}
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const label =
          routeLabels[value] || value.charAt(0).toUpperCase() + value.slice(1);

        return (
          <div key={to} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-slate-300" />
            {last ? (
              <span className="text-sm font-medium text-slate-700">
                {label}
              </span>
            ) : (
              <Link
                to={to}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
