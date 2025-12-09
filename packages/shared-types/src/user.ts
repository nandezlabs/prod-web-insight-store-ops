/**
 * User Types
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "super_admin" | "store_user";
  status: "active" | "inactive" | "locked";
  createdAt: string;
  updatedAt: string;
}

export interface StoreUser extends User {
  storeId: string;
  storeName: string;
  pin: string;
  geofenceEnabled: boolean;
  geofenceRadius?: number;
  geofenceCenter?: {
    latitude: number;
    longitude: number;
  };
}

export interface AdminUser extends User {
  permissions: string[];
  avatar?: string;
  lastLogin?: string;
}
