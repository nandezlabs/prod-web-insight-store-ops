import { CheckCircle, XCircle, Trash2, X } from "lucide-react";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function BulkActionsToolbar({
  selectedCount,
  onActivate,
  onDeactivate,
  onDelete,
  onClear,
}: BulkActionsToolbarProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-blue-900">
          {selectedCount} user{selectedCount !== 1 ? "s" : ""} selected
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={onActivate}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            Activate
          </button>

          <button
            onClick={onDeactivate}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
          >
            <XCircle className="w-4 h-4" />
            Deactivate
          </button>

          <button
            onClick={onDelete}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <button
        onClick={onClear}
        className="p-1 hover:bg-blue-100 rounded"
        title="Clear selection"
      >
        <X className="w-5 h-5 text-blue-900" />
      </button>
    </div>
  );
}
