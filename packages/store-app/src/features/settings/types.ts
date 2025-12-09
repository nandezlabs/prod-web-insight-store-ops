// Settings types
// CONTEXT: App settings, store info, logout, version info

import type { LucideIcon } from "lucide-react";

export type SettingsItemType = "button" | "toggle" | "select" | "info";

export interface SettingsItem {
  id: string;
  label: string;
  value?: string;
  type: SettingsItemType;
  icon?: LucideIcon;
  action?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export interface SettingsSection {
  id: string;
  title: string;
  items: SettingsItem[];
}

export interface StoreInfoData {
  storeName: string;
  storeId: string;
  userName?: string;
  address?: string;
  geofenceRadius?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  lastSyncTime?: number;
  isOnline: boolean;
}

export interface PhotoQuality {
  value: "low" | "medium" | "high";
  label: string;
  description: string;
}

export interface AppSettings {
  photoQuality: PhotoQuality["value"];
  autoSync: boolean;
  notifications: boolean;
}
