/**
 * Create Store Modal - Form for creating a new store
 */

import React, { useState } from "react";
import { X, MapPin } from "lucide-react";

interface CreateStoreModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateStoreModal({
  onClose,
  onSuccess,
}: CreateStoreModalProps) {
  const [formData, setFormData] = useState({
    storeId: "",
    storeName: "",
    region: "",
    latitude: "",
    longitude: "",
    geofenceRadius: "100",
    operatingHours: generateDefaultHours(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function generateDefaultHours() {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    return days.reduce((acc, day) => {
      acc[day] = { open: "09:00", close: "17:00", closed: day === "sunday" };
      return acc;
    }, {} as Record<string, { open: string; close: string; closed?: boolean }>);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.storeId || !formData.storeName) {
      setError("Store ID and Store Name are required");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/stores`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            storeId: formData.storeId,
            storeName: formData.storeName,
            region: formData.region || undefined,
            latitude: formData.latitude
              ? parseFloat(formData.latitude)
              : undefined,
            longitude: formData.longitude
              ? parseFloat(formData.longitude)
              : undefined,
            geofenceRadius: parseInt(formData.geofenceRadius),
            operatingHours: formData.operatingHours,
            status: "Active",
          }),
        }
      );

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create store");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateOperatingHours = (
    day: string,
    field: string,
    value: string | boolean
  ) => {
    setFormData({
      ...formData,
      operatingHours: {
        ...formData.operatingHours,
        [day]: {
          ...formData.operatingHours[day],
          [field]: value,
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create New Store</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.storeId}
                onChange={(e) =>
                  setFormData({ ...formData, storeId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) =>
                  setFormData({ ...formData, storeName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region
            </label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) =>
                setFormData({ ...formData, region: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <MapPin size={18} />
              Geofence Configuration
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="40.7128"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="-74.0060"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Radius (meters)
                </label>
                <input
                  type="number"
                  value={formData.geofenceRadius}
                  onChange={(e) =>
                    setFormData({ ...formData, geofenceRadius: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Operating Hours
            </h3>
            <div className="space-y-2">
              {Object.entries(formData.operatingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-24 capitalize">{day}</div>
                  <input
                    type="checkbox"
                    checked={!hours.closed}
                    onChange={(e) =>
                      updateOperatingHours(day, "closed", !e.target.checked)
                    }
                    className="rounded"
                  />
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) =>
                      updateOperatingHours(day, "open", e.target.value)
                    }
                    disabled={hours.closed}
                    className="px-2 py-1 border rounded disabled:bg-gray-100"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) =>
                      updateOperatingHours(day, "close", e.target.value)
                    }
                    disabled={hours.closed}
                    className="px-2 py-1 border rounded disabled:bg-gray-100"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
