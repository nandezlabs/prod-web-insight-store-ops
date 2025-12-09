import { create } from "zustand";
import type { DashboardState } from "../types";

export const useDashboardStore = create<DashboardState>((set, get) => {
  // Online/offline listeners
  const handleOnline = () => {
    set({ isOnline: true, showOfflineBanner: false });
    get().syncQueueItems();
  };

  const handleOffline = () => {
    set({ isOnline: false, showOfflineBanner: true });
  };

  // Set up listeners
  if (typeof window !== "undefined") {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  }

  return {
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    syncQueue: [],
    isSyncing: false,
    lastSyncTime: null,
    showOfflineBanner: false,

    dismissOfflineBanner: () => {
      set({ showOfflineBanner: false });
    },

    syncQueueItems: async () => {
      const { syncQueue, isOnline } = get();

      if (!isOnline || syncQueue.length === 0) return;

      set({ isSyncing: true });

      // Simulate sync process
      // In real app, this would call the forms store sync methods
      try {
        // Process queue items
        await new Promise((resolve) => setTimeout(resolve, 2000));

        set({
          syncQueue: [],
          isSyncing: false,
          lastSyncTime: new Date(),
        });
      } catch (error) {
        console.error("Sync failed:", error);
        set({ isSyncing: false });
      }
    },
  };
});
