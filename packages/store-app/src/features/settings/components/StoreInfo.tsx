// StoreInfo Component - Display store details
// CONTEXT: Show store information, sync status, and connection state

import { MapPin, Wifi, WifiOff, Clock, Map } from "lucide-react";
import type { StoreInfoData } from "../types";

interface StoreInfoProps {
  storeInfo: StoreInfoData;
}

/**
 * Store information card displaying:
 * - Store name and ID
 * - Address and geofence info
 * - Connection status
 * - Last sync time
 * - View on map button
 */
export function StoreInfo({ storeInfo }: StoreInfoProps) {
  const {
    storeName,
    storeId,
    userName,
    address,
    geofenceRadius,
    coordinates,
    lastSyncTime,
    isOnline,
  } = storeInfo;

  const handleViewOnMap = () => {
    if (coordinates) {
      const mapUrl = `https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}`;
      window.open(mapUrl, "_blank");
    }
  };

  const formatLastSync = (timestamp?: number) => {
    if (!timestamp) return "Never";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      {/* Store Name */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {storeName}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          ID: {storeId}
        </p>
      </div>

      {/* User Name */}
      {userName && (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Logged in as{" "}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {userName}
            </span>
          </p>
        </div>
      )}

      {/* Address */}
      {address && (
        <div className="flex items-start gap-2">
          <MapPin
            className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">{address}</p>
        </div>
      )}

      {/* Geofence Info */}
      {geofenceRadius && (
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border-2 border-blue-500 flex-shrink-0"
            aria-hidden="true"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Geofence: <span className="font-medium">{geofenceRadius}m</span>{" "}
            radius
          </p>
        </div>
      )}

      {/* Status Row */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi
              className="w-4 h-4 text-green-600 dark:text-green-400"
              aria-hidden="true"
            />
          ) : (
            <WifiOff
              className="w-4 h-4 text-red-600 dark:text-red-400"
              aria-hidden="true"
            />
          )}
          <span
            className={`text-sm font-medium ${
              isOnline
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {/* Last Sync */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" aria-hidden="true" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Synced {formatLastSync(lastSyncTime)}
          </span>
        </div>
      </div>

      {/* View on Map Button */}
      {coordinates && (
        <button
          onClick={handleViewOnMap}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          aria-label="View store location on map"
        >
          <Map className="w-4 h-4" aria-hidden="true" />
          View on Map
        </button>
      )}
    </div>
  );
}
