// ConflictResolver Component - Handle sync conflicts
// CONTEXT: Allow users to resolve conflicts between local and server versions

import { AlertTriangle, Check, X } from "lucide-react";
import { useState } from "react";
import { useSyncStore } from "../stores/syncStore";
import { Modal } from "../../../components/Modal";

interface ConflictResolverProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Conflict resolution modal showing:
 * - Side-by-side comparison of local vs server
 * - Resolution options: Keep local, Keep server, Merge
 * - Resolve or Skip actions
 */
export function ConflictResolver({ isOpen, onClose }: ConflictResolverProps) {
  const { conflicts, resolveConflict } = useSyncStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resolution, setResolution] = useState<"local" | "server" | "merge">(
    "local"
  );
  const [mergedData, setMergedData] = useState<any>(null);

  const currentConflict = conflicts[currentIndex];
  const hasMore = currentIndex < conflicts.length - 1;

  if (!isOpen || conflicts.length === 0 || !currentConflict) {
    return null;
  }

  const handleResolve = () => {
    if (!currentConflict) return;

    resolveConflict(
      currentConflict.itemId,
      resolution,
      resolution === "merge" ? mergedData : undefined
    );

    // Move to next conflict or close
    if (hasMore) {
      setCurrentIndex(currentIndex + 1);
      setResolution("local");
      setMergedData(null);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    if (hasMore) {
      setCurrentIndex(currentIndex + 1);
      setResolution("local");
      setMergedData(null);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentIndex(0);
    setResolution("local");
    setMergedData(null);
    onClose();
  };

  const handleMergeDataChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      setMergedData(parsed);
    } catch (e) {
      // Invalid JSON, keep current state
    }
  };

  // Guard for type narrowing
  if (!currentConflict) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Resolve Sync Conflict"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              Sync Conflict Detected
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              This {currentConflict.type} has conflicting changes. Choose which
              version to keep.
            </p>
            {conflicts.length > 1 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                Conflict {currentIndex + 1} of {conflicts.length}
              </p>
            )}
          </div>
        </div>

        {/* Resolution Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Choose resolution:
          </label>

          <div className="space-y-2">
            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
              <input
                type="radio"
                name="resolution"
                value="local"
                checked={resolution === "local"}
                onChange={(e) => setResolution(e.target.value as "local")}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Keep Local Version
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Use the data stored on this device
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
              <input
                type="radio"
                name="resolution"
                value="server"
                checked={resolution === "server"}
                onChange={(e) => setResolution(e.target.value as "server")}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Keep Server Version
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Use the data from the server
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
              <input
                type="radio"
                name="resolution"
                value="merge"
                checked={resolution === "merge"}
                onChange={(e) => setResolution(e.target.value as "merge")}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Merge Manually
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Combine both versions manually
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Local Version */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Local Version
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-64 overflow-auto">
              <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {JSON.stringify(currentConflict.localVersion, null, 2)}
              </pre>
            </div>
          </div>

          {/* Server Version */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Server Version
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-64 overflow-auto">
              <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {JSON.stringify(currentConflict.serverVersion, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Merge Editor (shown when merge is selected) */}
        {resolution === "merge" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Merged Data (JSON):
            </label>
            <textarea
              className="w-full h-48 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              defaultValue={JSON.stringify(
                mergedData || currentConflict.localVersion,
                null,
                2
              )}
              onChange={(e) => handleMergeDataChange(e.target.value)}
              placeholder="Edit the merged JSON data here..."
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Edit the JSON above to create your merged version
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSkip}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
            Skip
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleResolve}
              disabled={resolution === "merge" && !mergedData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="w-4 h-4" />
              Resolve
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
