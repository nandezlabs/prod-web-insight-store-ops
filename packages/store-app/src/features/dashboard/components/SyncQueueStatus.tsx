import { useState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "../stores/dashboardStore";
import { Modal, Button } from "@/components";

export function SyncQueueStatus() {
  const { syncQueue, isSyncing, lastSyncTime, isOnline } = useDashboardStore();
  const [showDetail, setShowDetail] = useState(false);

  const queueCount = syncQueue.length;
  const hasItems = queueCount > 0;
  const failedItems = syncQueue.filter((item) => item.status === "failed");
  const hasFailed = failedItems.length > 0;

  // Don't show if online and no queue
  if (isOnline && !hasItems && !isSyncing) {
    return null;
  }

  const formatTime = (date: Date | null) => {
    if (!date) return "";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <motion.button
        onClick={() => hasItems && setShowDetail(true)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          transition-colors
          ${hasItems ? "cursor-pointer hover:bg-slate-100" : "cursor-default"}
          ${hasFailed ? "text-red-600 bg-red-50" : "text-slate-700"}
        `}
        whileTap={hasItems ? { scale: 0.95 } : undefined}
      >
        {/* Status icon */}
        <AnimatePresence mode="wait">
          {isSyncing && (
            <motion.div
              key="syncing"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.3,
                rotate: { duration: 1, repeat: Infinity, ease: "linear" },
              }}
            >
              <Loader2 size={16} />
            </motion.div>
          )}

          {!isSyncing && hasItems && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              {hasFailed ? <AlertCircle size={16} /> : <Loader2 size={16} />}
            </motion.div>
          )}

          {!isSyncing && !hasItems && lastSyncTime && (
            <motion.div
              key="synced"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <CheckCircle2 size={16} className="text-emerald-600" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status text */}
        <span>
          {isSyncing && "Syncing..."}
          {!isSyncing && hasItems && (
            <>
              {queueCount} pending {hasFailed && "(failed)"}
            </>
          )}
          {!isSyncing && !hasItems && lastSyncTime && (
            <span className="text-emerald-600">
              Synced {formatTime(lastSyncTime)}
            </span>
          )}
        </span>
      </motion.button>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title="Sync Queue"
        size="md"
      >
        <div className="space-y-4">
          {syncQueue.length === 0 ? (
            <p className="text-slate-600 text-center py-4">No items in queue</p>
          ) : (
            <div className="space-y-2">
              {syncQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  {item.status === "failed" && (
                    <AlertCircle
                      className="text-red-600 flex-shrink-0 mt-0.5"
                      size={20}
                    />
                  )}
                  {item.status === "syncing" && (
                    <Loader2
                      className="text-blue-600 flex-shrink-0 mt-0.5 animate-spin"
                      size={20}
                    />
                  )}
                  {item.status === "pending" && (
                    <Loader2
                      className="text-slate-400 flex-shrink-0 mt-0.5"
                      size={20}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                    {item.retryCount > 0 && (
                      <p className="text-xs text-slate-500">
                        Retry attempt {item.retryCount}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowDetail(false)}
              fullWidth
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
