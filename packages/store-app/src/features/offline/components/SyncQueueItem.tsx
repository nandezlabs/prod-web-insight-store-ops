// SyncQueueItem Component - Individual pending item card
// CONTEXT: Display sync item with status, actions, and error details

import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  RotateCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { useSyncStore } from "../stores/syncStore";
import { retryItem } from "../services/syncService";
import type { SyncQueueItem as SyncQueueItemType } from "../types";

interface SyncQueueItemProps {
  item: SyncQueueItemType;
}

/**
 * Individual queue item card showing:
 * - Type icon and title
 * - Status badge and timestamp
 * - Actions (retry, view, delete)
 * - Expandable error message
 */
export function SyncQueueItem({ item }: SyncQueueItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const removeFromQueue = useSyncStore((state) => state.removeFromQueue);

  // Format timestamp
  const createdAgo = formatTimeAgo(item.createdAt);

  // Get type icon and color
  const typeConfig = getTypeConfig(item.type);

  // Get status config
  const statusConfig = getStatusConfig(item.status);

  const handleRetry = async () => {
    await retryItem(item.id);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this item from the sync queue?"
      )
    ) {
      setIsDeleting(true);
      removeFromQueue(item.id);
    }
  };

  const handleViewDetails = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all">
      <div className="flex items-start gap-3">
        {/* Type Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-lg ${typeConfig.bgColor} flex items-center justify-center`}
        >
          <typeConfig.icon className={`w-5 h-5 ${typeConfig.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Status */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {getItemTitle(item)}
            </h3>
            <span
              className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
            >
              <statusConfig.icon className="w-3 h-3" />
              {statusConfig.label}
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {statusConfig.subtitle} • {createdAgo}
            {item.attempts > 0 &&
              ` • ${item.attempts} ${
                item.attempts === 1 ? "retry" : "retries"
              }`}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {item.status === "failed" && (
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                aria-label="Retry sync"
              >
                <RotateCw className="w-3 h-3" />
                Retry
              </button>
            )}

            <button
              onClick={handleViewDetails}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              aria-label="View details"
              aria-expanded={isExpanded}
            >
              <Eye className="w-3 h-3" />
              Details
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
              aria-label="Delete from queue"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <dl className="space-y-2 text-xs">
                <div>
                  <dt className="font-medium text-gray-700 dark:text-gray-300">
                    Type:
                  </dt>
                  <dd className="text-gray-600 dark:text-gray-400 capitalize">
                    {item.type}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700 dark:text-gray-300">
                    Created:
                  </dt>
                  <dd className="text-gray-600 dark:text-gray-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </dd>
                </div>
                {item.lastAttempt && (
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300">
                      Last Attempt:
                    </dt>
                    <dd className="text-gray-600 dark:text-gray-400">
                      {new Date(item.lastAttempt).toLocaleString()}
                    </dd>
                  </div>
                )}
                {item.error && (
                  <div>
                    <dt className="font-medium text-red-700 dark:text-red-400">
                      Error:
                    </dt>
                    <dd className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded mt-1">
                      {item.error}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="font-medium text-gray-700 dark:text-gray-300">
                    Data:
                  </dt>
                  <dd className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded mt-1 overflow-auto max-h-40">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(item.data, null, 2)}
                    </pre>
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* Syncing Spinner */}
        {item.status === "syncing" && (
          <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
        )}
      </div>
    </div>
  );
}

// Helper functions

function getTypeConfig(type: string) {
  const configs = {
    checklist: {
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    replacement: {
      icon: RotateCw,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    photo: {
      icon: Eye,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  };

  return configs[type as keyof typeof configs] || configs.checklist;
}

function getStatusConfig(status: string) {
  const configs = {
    pending: {
      icon: AlertCircle,
      label: "Pending",
      subtitle: "Waiting to sync",
      color: "text-yellow-700 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    syncing: {
      icon: Loader2,
      label: "Syncing",
      subtitle: "Syncing now",
      color: "text-blue-700 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    failed: {
      icon: AlertCircle,
      label: "Failed",
      subtitle: "Failed to sync",
      color: "text-red-700 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
    synced: {
      icon: CheckCircle2,
      label: "Synced",
      subtitle: "Successfully synced",
      color: "text-green-700 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
  };

  return configs[status as keyof typeof configs] || configs.pending;
}

function getItemTitle(item: SyncQueueItemType): string {
  // Extract meaningful title from data
  const { type, data } = item;

  if (type === "checklist" && data.checklistType) {
    const date = new Date(item.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${data.checklistType} Checklist - ${date}`;
  }

  if (type === "replacement" && data.itemName) {
    return `${data.itemName} Replacement`;
  }

  if (type === "photo" && data.parentType) {
    return `Photo for ${data.parentType}`;
  }

  return `${type.charAt(0).toUpperCase() + type.slice(1)} Item`;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
