/**
 * Store Management Page - Admin interface for managing stores
 */

import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, MapPin } from "lucide-react";
import { CreateStoreModal } from "../components/CreateStoreModal";
import { EditStoreModal } from "../components/EditStoreModal";
import { BulkStoreActionsToolbar } from "../components/BulkStoreActionsToolbar";

interface Store {
  id: string;
  storeId: string;
  storeName: string;
  region?: string;
  status: "Active" | "Inactive" | "Closed";
  latitude?: number;
  longitude?: number;
  geofenceRadius?: number;
  operatingHours?: Record<
    string,
    { open: string; close: string; closed?: boolean }
  >;
  createdAt?: string;
  updatedAt?: string;
}

export function StoreManagementPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/stores`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStores(data.stores || []);
      }
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (storeId: string) => {
    if (!confirm("Are you sure you want to close this store?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/stores?id=${storeId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        fetchStores();
      }
    } catch (error) {
      console.error("Failed to delete store:", error);
    }
  };

  const handleBulkAction = async (
    action: "activate" | "deactivate" | "close"
  ) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/stores/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action,
            storeIds: Array.from(selectedStores),
          }),
        }
      );

      if (response.ok) {
        setSelectedStores(new Set());
        fetchStores();
      }
    } catch (error) {
      console.error("Bulk action failed:", error);
    }
  };

  const handleToggleSelect = (storeId: string) => {
    const newSelected = new Set(selectedStores);
    if (newSelected.has(storeId)) {
      newSelected.delete(storeId);
    } else {
      newSelected.add(storeId);
    }
    setSelectedStores(newSelected);
  };

  const handleToggleSelectAll = () => {
    if (selectedStores.size === filteredStores.length) {
      setSelectedStores(new Set());
    } else {
      setSelectedStores(new Set(filteredStores.map((s) => s.id)));
    }
  };

  const filteredStores = stores.filter(
    (store) =>
      store.storeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-yellow-100 text-yellow-800";
      case "Closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">Loading...</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Store Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Store
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {selectedStores.size > 0 && (
        <BulkStoreActionsToolbar
          selectedCount={selectedStores.size}
          onActivate={() => handleBulkAction("activate")}
          onDeactivate={() => handleBulkAction("deactivate")}
          onClose={() => handleBulkAction("close")}
          onClear={() => setSelectedStores(new Set())}
        />
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedStores.size === filteredStores.length &&
                    filteredStores.length > 0
                  }
                  onChange={handleToggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Store ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Store Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Region
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Geofence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStores.map((store) => (
              <tr key={store.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedStores.has(store.id)}
                    onChange={() => handleToggleSelect(store.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {store.storeId}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {store.storeName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {store.region || "-"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      store.status
                    )}`}
                  >
                    {store.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {store.latitude && store.longitude ? (
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      {store.geofenceRadius}m
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingStore(store)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(store.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStores.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm
              ? "No stores match your search"
              : 'No stores yet. Click "Add Store" to create one.'}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateStoreModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchStores();
          }}
        />
      )}

      {editingStore && (
        <EditStoreModal
          store={editingStore}
          onClose={() => setEditingStore(null)}
          onSuccess={() => {
            setEditingStore(null);
            fetchStores();
          }}
        />
      )}
    </div>
  );
}
