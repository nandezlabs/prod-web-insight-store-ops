// SyncQueue Component - Full queue management UI
// CONTEXT: Display all pending items with sync controls

import { CheckCircle2, RefreshCw, X, Inbox } from "lucide-react";
import { useSyncStore } from "../stores/syncStore";
import { startSync } from "../services/syncService";
import { SyncQueueItem } from "./SyncQueueItem";
import { Modal } from "../../../components/Modal";

interface SyncQueueProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full-screen queue management modal showing:
 * - Header with pending count
 * - Sync All Now button
 * - List of items grouped by type
 * - Empty state when all synced
 */
export function SyncQueue({ isOpen, onClose }: SyncQueueProps) {
  const { queue, isSyncing, isOnline, getPendingCount, clearQueue } =
    useSyncStore();
  const pendingCount = getPendingCount();

  // Group items by type
  const groupedItems = queue.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type]!.push(item);
    return acc;
  }, {} as Record<string, typeof queue>);

  const handleSyncAll = async () => {
    if (!isOnline) {
      alert(
        "Cannot sync while offline. Please check your internet connection."
      );
      return;
    }
    await startSync();
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all items from the sync queue? This cannot be undone."
      )
    ) {
      clearQueue();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sync Queue" size="lg">
      <div className="flex flex-col h-full max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Sync Queue
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {pendingCount === 0 ? (
                "All items synced"
              ) : (
                <>
                  <span className="font-medium">{pendingCount}</span> item
                  {pendingCount !== 1 ? "s" : ""} pending
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <>
                <button
                  onClick={handleSyncAll}
                  disabled={!isOnline || isSyncing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Sync all items now"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  {isSyncing ? "Syncing..." : "Sync All Now"}
                </button>

                <button
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-2 px-4 py-2 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  aria-label="Clear all items"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {pendingCount === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                All Synced!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                There are no pending items in your sync queue. All your data is
                up to date.
              </p>
            </div>
          ) : (
            /* Queue Items */
            <div className="space-y-6">
              {!isOnline && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Inbox className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        You're offline
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                        Items will automatically sync when you're back online.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {Object.entries(groupedItems).map(([type, items]) => (
                <div key={type}>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                    {type}s ({items.length})
                  </h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <SyncQueueItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span>{isOnline ? "Online" : "Offline"}</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
