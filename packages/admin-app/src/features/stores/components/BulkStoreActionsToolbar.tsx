/**
 * Bulk Store Actions Toolbar
 */

import { CheckCircle, XCircle, Trash2, X } from "lucide-react";

interface BulkStoreActionsToolbarProps {
  selectedCount: number;
  onActivate: () => void;
  onDeactivate: () => void;
  onClose: () => void;
  onClear: () => void;
}

export function BulkStoreActionsToolbar({
  selectedCount,
  onActivate,
  onDeactivate,
  onClose,
  onClear,
}: BulkStoreActionsToolbarProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
      <span className="text-sm font-medium text-blue-900">
        {selectedCount} store{selectedCount > 1 ? "s" : ""} selected
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={onActivate}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
          <CheckCircle size={16} />
          Activate
        </button>

        <button
          onClick={onDeactivate}
          className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
        >
          <XCircle size={16} />
          Deactivate
        </button>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
        >
          <Trash2 size={16} />
          Close
        </button>

        <button
          onClick={onClear}
          className="ml-2 p-2 text-gray-600 hover:text-gray-800"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
