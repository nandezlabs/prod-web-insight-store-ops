// Sync Store - Manages offline sync state
// CONTEXT: Track pending submissions, sync status, and conflicts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SyncQueueItem, SyncStoreState } from "../types";

export const useSyncStore = create<SyncStoreState>()(
  persist(
    (set, get) => ({
      queue: [],
      isOnline: navigator.onLine,
      isSyncing: false,
      conflicts: [],

      addToQueue: (item) => {
        const newItem: SyncQueueItem = {
          ...item,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          attempts: 0,
          status: "pending",
        };

        set((state) => ({
          queue: [...state.queue, newItem],
        }));

        // Trigger sync if online
        if (get().isOnline && !get().isSyncing) {
          // Import and call sync service (will be handled by service)
          import("../services/syncService")
            .then((module) => {
              module.startSync();
            })
            .catch(console.error);
        }
      },

      removeFromQueue: (itemId) => {
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== itemId),
        }));
      },

      updateItemStatus: (itemId, status, error) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === itemId
              ? { ...item, status, error, lastAttempt: Date.now() }
              : item
          ),
        }));
      },

      incrementAttempts: (itemId) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  attempts: item.attempts + 1,
                  lastAttempt: Date.now(),
                }
              : item
          ),
        }));
      },

      clearQueue: () => {
        set({ queue: [] });
      },

      setOnlineStatus: (isOnline) => {
        set({ isOnline });

        // Trigger sync when coming back online
        if (isOnline && !get().isSyncing && get().queue.length > 0) {
          import("../services/syncService")
            .then((module) => {
              module.startSync();
            })
            .catch(console.error);
        }
      },

      setSyncing: (isSyncing) => {
        set({ isSyncing });
      },

      addConflict: (conflict) => {
        set((state) => ({
          conflicts: [...state.conflicts, conflict],
        }));
      },

      resolveConflict: (itemId, resolution, mergedData) => {
        const conflict = get().conflicts.find((c) => c.itemId === itemId);
        if (!conflict) return;

        // Update queue item with resolved data
        let resolvedData;
        if (resolution === "local") {
          resolvedData = conflict.localVersion;
        } else if (resolution === "server") {
          resolvedData = conflict.serverVersion;
        } else {
          resolvedData = mergedData;
        }

        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  data: resolvedData,
                  status: "pending",
                  error: undefined,
                }
              : item
          ),
          conflicts: state.conflicts.filter((c) => c.itemId !== itemId),
        }));

        // Retry sync
        if (get().isOnline) {
          import("../services/syncService")
            .then((module) => {
              module.startSync();
            })
            .catch(console.error);
        }
      },

      getPendingCount: () => {
        return get().queue.filter((item) => item.status !== "synced").length;
      },

      getFailedItems: () => {
        return get().queue.filter((item) => item.status === "failed");
      },
    }),
    {
      name: "sync-store",
      partialize: (state) => ({
        queue: state.queue,
        conflicts: state.conflicts,
      }),
    }
  )
);

// Listen for online/offline events
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    useSyncStore.getState().setOnlineStatus(true);
  });

  window.addEventListener("offline", () => {
    useSyncStore.getState().setOnlineStatus(false);
  });
}
