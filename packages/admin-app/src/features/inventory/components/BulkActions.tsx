import React from "react";
import { Trash2, Download, MoreVertical } from "lucide-react";
import { useInventoryStore } from "../store/inventoryStore";
import type { InventoryStatus } from "../types";

export const BulkActions: React.FC = () => {
  const {
    selectedItems,
    toggleSelectAll,
    clearSelection,
    bulkDelete,
    bulkUpdateStatus,
    bulkExport,
    getPaginatedItems,
  } = useInventoryStore();

  const [showActions, setShowActions] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const paginatedItems = getPaginatedItems();
  const allSelected =
    paginatedItems.length > 0 &&
    paginatedItems.every((item) => selectedItems.includes(item.id));

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedItems.length} item(s)?`)) return;

    setIsDeleting(true);
    try {
      await bulkDelete();
    } catch (error) {
      console.error("Bulk delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkStatus = async (status: InventoryStatus) => {
    if (
      !confirm(`Change status of ${selectedItems.length} item(s) to ${status}?`)
    )
      return;

    try {
      await bulkUpdateStatus(status);
      setShowActions(false);
    } catch (error) {
      console.error("Bulk status update failed:", error);
    }
  };

  const handleBulkExport = () => {
    bulkExport();
    setShowActions(false);
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
      <input
        type="checkbox"
        checked={allSelected}
        onChange={toggleSelectAll}
        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        aria-label="Select all items"
      />

      <span className="text-sm font-medium text-blue-900">
        {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""}{" "}
        selected
      </span>

      <div className="flex-1" />

      <button
        onClick={clearSelection}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        Clear
      </button>

      <button
        onClick={handleBulkDelete}
        disabled={isDeleting}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        <Trash2 size={16} />
        Delete
      </button>

      <div className="relative">
        <button
          onClick={() => setShowActions(!showActions)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <MoreVertical size={16} />
          Actions
        </button>

        {showActions && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowActions(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <div className="py-1">
                <button
                  onClick={() => handleBulkStatus("Active")}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mark as Active
                </button>
                <button
                  onClick={() => handleBulkStatus("Discontinued")}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mark as Discontinued
                </button>
                <div className="border-t border-gray-200 my-1" />
                <button
                  onClick={handleBulkExport}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Download size={14} />
                  Export Selected
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
