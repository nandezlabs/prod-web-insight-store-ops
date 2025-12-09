// Settings Component - Main settings screen
// CONTEXT: App settings, store info, logout, version info

import {
  ArrowLeft,
  Store,
  Settings as SettingsIcon,
  HelpCircle,
  Info,
  Image,
  RefreshCw,
  Bell,
  Trash2,
  Mail,
  ExternalLink,
  Shield,
  FileText,
  Code,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StoreInfo } from "./StoreInfo";
import { LogoutButton } from "./LogoutButton";
import { SettingsSection } from "./SettingsSection";
import { Modal } from "../../../components/Modal";
import { useSyncStore } from "../../offline/stores/syncStore";
import { useAuthStore } from "../../auth/stores/authStore";
import { clearDatabase } from "../../../services/db";
import type {
  SettingsSection as SettingsSectionType,
  StoreInfoData,
  AppSettings as AppSettingsType,
} from "../types";

/**
 * Main settings screen with:
 * - Store information
 * - Account settings
 * - App settings
 * - Help & Support
 * - About section
 */
export function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isOnline, getPendingCount } = useSyncStore();

  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettingsType>({
    photoQuality: "medium",
    autoSync: true,
    notifications: false,
  });

  // Mock store info - replace with real data from auth store
  const storeInfo: StoreInfoData = {
    storeName: user?.storeName || "Unknown Store",
    storeId: user?.storeId || "N/A",
    userName: (user as any)?.userName,
    address: (user as any)?.address,
    geofenceRadius: (user as any)?.geofenceRadius,
    coordinates: (user as any)?.coordinates,
    lastSyncTime: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    isOnline,
  };

  const handleToggle = (id: string, value: boolean) => {
    if (id === "autoSync") {
      setAppSettings((prev) => ({ ...prev, autoSync: value }));
    } else if (id === "notifications") {
      setAppSettings((prev) => ({ ...prev, notifications: value }));
    }
  };

  const handleClearCache = () => {
    // Clear cache logic
    localStorage.removeItem("api-cache");
    alert("Cache cleared successfully!");
  };

  const handleClearOfflineData = async () => {
    try {
      await clearDatabase();
      setShowClearDataConfirm(false);
      alert("Offline data cleared successfully!");
    } catch (error) {
      console.error("Error clearing offline data:", error);
      alert("Failed to clear offline data");
    }
  };

  const handleChangePhotoQuality = () => {
    // Cycle through quality options
    const qualities: AppSettingsType["photoQuality"][] = [
      "low",
      "medium",
      "high",
    ];
    const currentIndex = qualities.indexOf(appSettings.photoQuality);
    const nextIndex = (currentIndex + 1) % qualities.length;
    const nextQuality = qualities[nextIndex];
    if (nextQuality) {
      setAppSettings((prev) => ({ ...prev, photoQuality: nextQuality }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Define sections
  const sections: SettingsSectionType[] = [
    // Account Section
    {
      id: "account",
      title: "Account",
      items: [
        {
          id: "logged-in-as",
          label: "Logged in as",
          value: storeInfo.storeName,
          type: "info",
          icon: Store,
        },
        {
          id: "change-pin",
          label: "Change PIN",
          type: "button",
          icon: Shield,
          action: () => alert("Change PIN feature coming soon"),
          disabled: true,
        },
      ],
    },

    // App Settings Section
    {
      id: "app-settings",
      title: "App Settings",
      items: [
        {
          id: "photo-quality",
          label: "Photo Quality",
          value:
            appSettings.photoQuality.charAt(0).toUpperCase() +
            appSettings.photoQuality.slice(1),
          type: "select",
          icon: Image,
          action: handleChangePhotoQuality,
        },
        {
          id: "autoSync",
          label: "Auto-Sync",
          value: appSettings.autoSync.toString(),
          type: "toggle",
          icon: RefreshCw,
        },
        {
          id: "notifications",
          label: "Notifications",
          value: appSettings.notifications.toString(),
          type: "toggle",
          icon: Bell,
          disabled: true,
        },
        {
          id: "clear-cache",
          label: "Clear Cache",
          type: "button",
          icon: Trash2,
          action: handleClearCache,
        },
        {
          id: "clear-offline-data",
          label: "Clear Offline Data",
          type: "button",
          icon: Trash2,
          action: () => setShowClearDataConfirm(true),
          destructive: true,
        },
      ],
    },

    // Help & Support Section
    {
      id: "help-support",
      title: "Help & Support",
      items: [
        {
          id: "help-docs",
          label: "View Help Docs",
          type: "button",
          icon: HelpCircle,
          action: () => window.open("https://help.example.com", "_blank"),
        },
        {
          id: "contact-support",
          label: "Contact Support",
          type: "button",
          icon: Mail,
          action: () => (window.location.href = "mailto:support@example.com"),
        },
        {
          id: "report-bug",
          label: "Report a Bug",
          type: "button",
          icon: ExternalLink,
          action: () =>
            (window.location.href =
              "mailto:bugs@example.com?subject=Bug Report&body=Describe the bug..."),
        },
        {
          id: "request-feature",
          label: "Request a Feature",
          type: "button",
          icon: ExternalLink,
          action: () =>
            (window.location.href =
              "mailto:features@example.com?subject=Feature Request&body=Describe the feature..."),
        },
      ],
    },

    // About Section
    {
      id: "about",
      title: "About",
      items: [
        {
          id: "version",
          label: "App Version",
          value: "1.0.0",
          type: "info",
          icon: Info,
        },
        {
          id: "build",
          label: "Build Number",
          value: "2024.12.07",
          type: "info",
          icon: Code,
        },
        {
          id: "privacy-policy",
          label: "Privacy Policy",
          type: "button",
          icon: Shield,
          action: () => window.open("https://example.com/privacy", "_blank"),
        },
        {
          id: "terms",
          label: "Terms of Service",
          type: "button",
          icon: FileText,
          action: () => window.open("https://example.com/terms", "_blank"),
        },
        {
          id: "licenses",
          label: "Open Source Licenses",
          type: "button",
          icon: Code,
          action: () => window.open("https://example.com/licenses", "_blank"),
        },
      ],
    },
  ];

  const pendingCount = getPendingCount();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <SettingsIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Settings
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Store Information */}
        <StoreInfo storeInfo={storeInfo} />

        {/* Settings Sections */}
        {sections.map((section) => (
          <SettingsSection
            key={section.id}
            section={section}
            onToggle={handleToggle}
          />
        ))}

        {/* Logout Button */}
        <LogoutButton onLogout={handleLogout} />
      </div>

      {/* Clear Offline Data Confirmation Modal */}
      <Modal
        isOpen={showClearDataConfirm}
        onClose={() => setShowClearDataConfirm(false)}
        title="Clear Offline Data"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Clear all offline data?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This will delete all cached data and local storage.
            </p>
            {pendingCount > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-3">
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                  Warning: {pendingCount}{" "}
                  {pendingCount === 1 ? "item is" : "items are"} waiting to sync
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  These submissions will be permanently lost.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setShowClearDataConfirm(false)}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleClearOfflineData}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
