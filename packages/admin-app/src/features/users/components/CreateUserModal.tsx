import { useState } from "react";
import { X } from "lucide-react";

interface CreateUserModalProps {
  onClose: () => void;
  onCreate: (userData: any) => void;
}

export function CreateUserModal({ onClose, onCreate }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    storeId: "",
    storeName: "",
    pin: "",
    role: "store",
    status: "Active",
    geofenceRadius: "100",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.storeId.trim()) {
      newErrors.storeId = "Store ID is required";
    }

    if (!formData.storeName.trim()) {
      newErrors.storeName = "Store name is required";
    }

    if (!/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = "PIN must be exactly 4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onCreate({
      ...formData,
      geofenceRadius: parseInt(formData.geofenceRadius),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Create New User</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Store ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store ID *
            </label>
            <input
              type="text"
              value={formData.storeId}
              onChange={(e) =>
                setFormData({ ...formData, storeId: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.storeId ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="STORE-001"
            />
            {errors.storeId && (
              <p className="text-sm text-red-600 mt-1">{errors.storeId}</p>
            )}
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store Name *
            </label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) =>
                setFormData({ ...formData, storeName: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.storeName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Main Street Location"
            />
            {errors.storeName && (
              <p className="text-sm text-red-600 mt-1">{errors.storeName}</p>
            )}
          </div>

          {/* PIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN (4 digits) *
            </label>
            <input
              type="text"
              maxLength={4}
              value={formData.pin}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pin: e.target.value.replace(/\D/g, ""),
                })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.pin ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="1234"
            />
            {errors.pin && (
              <p className="text-sm text-red-600 mt-1">{errors.pin}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="store">Store</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Geofence Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geofence Radius (meters)
            </label>
            <input
              type="number"
              value={formData.geofenceRadius}
              onChange={(e) =>
                setFormData({ ...formData, geofenceRadius: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="50"
              max="500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
