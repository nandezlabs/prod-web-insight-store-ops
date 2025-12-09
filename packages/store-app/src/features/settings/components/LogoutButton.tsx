// LogoutButton Component - Logout with confirmation
// CONTEXT: Handle logout with pending items warning

import { LogOut, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Modal } from "../../../components/Modal";
import { useSyncStore } from "../../offline/stores/syncStore";

interface LogoutButtonProps {
  onLogout: () => void;
}

/**
 * Logout button with confirmation modal
 * Shows warning if items are pending sync
 */
export function LogoutButton({ onLogout }: LogoutButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const pendingCount = useSyncStore((state) => state.getPendingCount());

  const handleConfirmLogout = () => {
    setShowConfirm(false);
    onLogout();
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium"
        aria-label="Logout"
      >
        <LogOut className="w-5 h-5" aria-hidden="true" />
        Logout
      </button>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Logout"
        size="sm"
      >
        <div className="space-y-4">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Are you sure you want to logout?
            </h3>
            {pendingCount > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <span className="font-medium">{pendingCount}</span>{" "}
                  {pendingCount === 1 ? "item" : "items"} waiting to sync
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                  Your offline data will be kept and synced when you log back
                  in.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLogout}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
