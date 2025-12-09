import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, X } from "lucide-react";
import { useDashboardStore } from "../stores/dashboardStore";

export function OfflineBanner() {
  const { isOnline, showOfflineBanner, dismissOfflineBanner, syncQueue } =
    useDashboardStore();

  const shouldShow = !isOnline && showOfflineBanner;
  const queueCount = syncQueue.length;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-40 bg-amber-500 text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              {/* Icon and message */}
              <div className="flex items-center gap-3 flex-1">
                <WifiOff className="flex-shrink-0" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-sm">You're offline</p>
                  {queueCount > 0 && (
                    <p className="text-xs opacity-90 mt-0.5">
                      {queueCount} {queueCount === 1 ? "item" : "items"} waiting
                      to sync
                    </p>
                  )}
                </div>
              </div>

              {/* Dismiss button */}
              <button
                onClick={dismissOfflineBanner}
                className="p-2 rounded-full hover:bg-amber-600 transition-colors"
                aria-label="Dismiss offline banner"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
