import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  ListTodo,
  Calendar,
  RefreshCw,
  History,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useDashboardStore } from "../stores/dashboardStore";
import { DashboardCard } from "./DashboardCard";
import { BottomNav } from "./BottomNav";
import { OfflineBanner } from "./OfflineBanner";
import { SyncQueueStatus } from "./SyncQueueStatus";
import { formatDateLong } from "@/utils/helpers";
import type { DashboardCard as DashboardCardType } from "../types";

/**
 * Main dashboard screen with quick action cards and navigation.
 * Shows welcome message, current time, and grid of actionable cards.
 */
export function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isOnline = useDashboardStore((state) => state.isOnline);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Quick action cards configuration
  const cards: DashboardCardType[] = [
    {
      id: "opening",
      title: "Opening Checklist",
      subtitle: "Food safety & store prep",
      icon: ClipboardCheck,
      route: "/forms/opening-checklist",
      requiresOnline: false,
    },
    {
      id: "daily",
      title: "Daily Tasks",
      subtitle: "Cleaning & operations",
      icon: ListTodo,
      badge: 3,
      route: "/forms/daily-tasks",
      requiresOnline: false,
    },
    {
      id: "weekly",
      title: "Weekly Tasks",
      subtitle: "Inventory & deep clean",
      icon: Calendar,
      route: "/forms/weekly-tasks",
      requiresOnline: false,
    },
    {
      id: "replacement",
      title: "Request Replacement",
      subtitle: "Menu item changes",
      icon: RefreshCw,
      route: "/replacement",
      requiresOnline: true,
      disabled: !isOnline,
    },
    {
      id: "history",
      title: "View History",
      subtitle: "Completed checklists",
      icon: History,
      route: "/history",
      requiresOnline: true,
      disabled: !isOnline,
    },
    {
      id: "settings",
      title: "Settings",
      subtitle: "Store info & logout",
      icon: Settings,
      route: "/settings",
      requiresOnline: false,
    },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Offline banner */}
      <OfflineBanner />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Welcome message */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back!
              </h1>
              {user?.storeName && (
                <p className="text-sm text-slate-600 mt-1">{user.storeName}</p>
              )}
            </div>

            {/* Sync status */}
            <SyncQueueStatus />
          </div>

          {/* Date and time */}
          <div className="text-sm text-slate-600">
            <p>{formatDateLong(currentTime)}</p>
            <p className="font-medium text-base text-slate-900 mt-1">
              {formatTime(currentTime)}
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick actions grid */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <DashboardCard
                key={card.id}
                title={card.title}
                subtitle={card.subtitle}
                icon={card.icon}
                badge={card.badge}
                onClick={() => navigate(card.route)}
                disabled={card.disabled}
              />
            ))}
          </div>
        </section>

        {/* Offline notice */}
        {!isOnline && (
          <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              <strong>Limited functionality:</strong> Some features require an
              internet connection. Your work will be saved and synced when
              you're back online.
            </p>
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
