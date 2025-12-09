// Offline sync types
// CONTEXT: Manage pending submissions when offline, auto-sync when online

export type SyncItemType = "checklist" | "replacement" | "photo";

export type SyncStatus = "pending" | "syncing" | "failed" | "synced";

export interface SyncQueueItem {
  id: string;
  type: SyncItemType;
  data: any; // Flexible data structure for different item types
  attempts: number;
  status: SyncStatus;
  createdAt: number;
  lastAttempt?: number;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  itemId: string;
  error?: string;
}

export interface SyncConflict {
  itemId: string;
  localVersion: any;
  serverVersion: any;
  type: SyncItemType;
}

export interface SyncStoreState {
  queue: SyncQueueItem[];
  isOnline: boolean;
  isSyncing: boolean;
  conflicts: SyncConflict[];

  // Actions
  addToQueue: (
    item: Omit<SyncQueueItem, "id" | "createdAt" | "attempts" | "status">
  ) => void;
  removeFromQueue: (itemId: string) => void;
  updateItemStatus: (
    itemId: string,
    status: SyncStatus,
    error?: string
  ) => void;
  incrementAttempts: (itemId: string) => void;
  clearQueue: () => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
  addConflict: (conflict: SyncConflict) => void;
  resolveConflict: (
    itemId: string,
    resolution: "local" | "server" | "merge",
    mergedData?: any
  ) => void;
  getPendingCount: () => number;
  getFailedItems: () => SyncQueueItem[];
}
