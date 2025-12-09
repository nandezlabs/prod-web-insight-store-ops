// SyncStatus Component - Global sync indicator in app header
// CONTEXT: Show online/offline status with pending count badge

import { Wifi, Cloud, CloudOff } from "lucide-react";
import { useSyncStore } from "../stores/syncStore";

interface SyncStatusProps {
  onClick?: () => void;
}

/**
 * Small sync status indicator showing:
 * - Green: online & synced
 * - Yellow: online, syncing
 * - Red: offline
 * - Badge with pending count
 */
export function SyncStatus({ onClick }: SyncStatusProps) {
  const { isOnline, isSyncing, getPendingCount } = useSyncStore();
  const pendingCount = getPendingCount();

  // Determine status color and icon
  let statusColor = "bg-green-500";
  let Icon = Cloud;
  let statusText = "Online & synced";

  if (!isOnline) {
    statusColor = "bg-red-500";
    Icon = CloudOff;
    statusText = "Offline";
  } else if (isSyncing) {
    statusColor = "bg-yellow-500";
    Icon = Wifi;
    statusText = "Syncing...";
  } else if (pendingCount > 0) {
    statusColor = "bg-yellow-500";
    Icon = Cloud;
    statusText = `${pendingCount} pending`;
  }

  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={statusText}
      title={statusText}
    >
      {/* Status indicator dot */}
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${statusColor}`} />
        {isSyncing && (
          <div
            className={`absolute inset-0 w-2 h-2 rounded-full ${statusColor} animate-ping`}
          />
        )}
      </div>

      {/* Icon */}
      <Icon
        className="w-4 h-4 text-gray-600 dark:text-gray-400"
        aria-hidden="true"
      />

      {/* Pending count badge */}
      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-blue-600 rounded-full">
          {pendingCount > 99 ? "99+" : pendingCount}
        </span>
      )}

      {/* Screen reader only text */}
      <span className="sr-only">{statusText}</span>
    </button>
  );
}
