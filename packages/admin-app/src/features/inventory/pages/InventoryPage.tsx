import React, { useEffect } from "react";
import { Download, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  InventoryTable,
  InventoryFilters,
  AddItemModal,
  EditItemModal,
  DeleteConfirm,
  BulkActions,
  ImportCSV,
} from "../components";
import { useInventoryStore } from "../store/inventoryStore";
import type { InventoryItem } from "../types";

export function InventoryPage() {
  const { fetchItems, deleteItem, bulkExport } = useInventoryStore();

  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(
    null
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleDelete = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedItem) {
      await deleteItem(selectedItem.id);
      setShowDeleteConfirm(false);
      setSelectedItem(null);
    }
  };

  const handleExportAll = () => {
    bulkExport();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Inventory Management"
          description="Manage all inventory items across your stores"
          showAddButton
          addButtonLabel="Add Item"
          onAddClick={() => setShowAddModal(true)}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload size={16} />
            Import CSV
          </button>
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Export All
          </button>
        </div>
      </div>

      <InventoryFilters />

      <BulkActions />

      <InventoryTable onEdit={handleEdit} onDelete={handleDelete} />

      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <EditItemModal
        isOpen={showEditModal}
        item={selectedItem}
        onClose={() => {
          setShowEditModal(false);
          setSelectedItem(null);
        }}
      />

      <DeleteConfirm
        isOpen={showDeleteConfirm}
        item={selectedItem}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedItem(null);
        }}
      />

      <ImportCSV
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
}
