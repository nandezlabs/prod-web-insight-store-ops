import type { LucideIcon } from "lucide-react";

export interface DashboardCard {
  id: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: number;
  route: string;
  requiresOnline?: boolean;
  disabled?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
}

export interface SyncQueueItem {
  id: string;
  type: "form" | "checklist";
  title: string;
  timestamp: number;
  retryCount: number;
  status: "pending" | "syncing" | "failed";
}

export interface DashboardState {
  isOnline: boolean;
  syncQueue: SyncQueueItem[];
  isSyncing: boolean;
  lastSyncTime: Date | null;
  showOfflineBanner: boolean;
  dismissOfflineBanner: () => void;
  syncQueueItems: () => Promise<void>;
}
