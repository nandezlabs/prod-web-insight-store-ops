import React from "react";
import { AlertTriangle } from "lucide-react";
import type { InventoryItem } from "../types";

interface DeleteConfirmProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirm: React.FC<DeleteConfirmProps> = ({
  isOpen,
  item,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Item?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete <strong>{item.name}</strong>?
                This will mark the item as "Pending Delete" in the system.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
                <span className="font-mono">{item.code}</span>
                <span>•</span>
                <span>{item.category}</span>
                <span>•</span>
                <span>{item.type}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-lg">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Item
          </button>
        </div>
      </div>
    </div>
  );
};
