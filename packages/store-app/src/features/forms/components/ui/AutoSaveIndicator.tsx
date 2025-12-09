import { Check, Cloud, CloudOff, Loader2, AlertCircle } from "lucide-react";
import type { AutoSaveStatus } from "../../types";

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
}

export function AutoSaveIndicator({ status }: AutoSaveIndicatorProps) {
  const { status: saveStatus, lastSaved, error } = status;

  const formatLastSaved = (date?: Date) => {
    if (!date) return "";

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 10) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (saveStatus === "idle" && !lastSaved) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {saveStatus === "saving" && (
        <>
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-gray-600">Saving...</span>
        </>
      )}

      {saveStatus === "saved" && (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-gray-600">
            Saved {formatLastSaved(lastSaved)}
          </span>
        </>
      )}

      {saveStatus === "error" && (
        <>
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-red-600">{error || "Save failed"}</span>
        </>
      )}
    </div>
  );
}

interface OnlineStatusIndicatorProps {
  isOnline: boolean;
  queuedCount?: number;
}

export function OnlineStatusIndicator({
  isOnline,
  queuedCount = 0,
}: OnlineStatusIndicatorProps) {
  if (isOnline && queuedCount === 0) {
    return null;
  }

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
        ${
          isOnline ? "bg-blue-50 text-blue-700" : "bg-yellow-50 text-yellow-800"
        }
      `}
    >
      {isOnline ? (
        <>
          <Cloud className="w-4 h-4" />
          <span>
            Syncing {queuedCount} form{queuedCount !== 1 ? "s" : ""}...
          </span>
        </>
      ) : (
        <>
          <CloudOff className="w-4 h-4" />
          <span>
            Offline - {queuedCount} form{queuedCount !== 1 ? "s" : ""} queued
          </span>
        </>
      )}
    </div>
  );
}
