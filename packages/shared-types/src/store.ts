/**
 * Store Types
 */

export interface Store {
  id: string;
  name: string;
  location: string;
  manager: string;
  status: "active" | "inactive";
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreProfile extends Store {
  geofence?: {
    enabled: boolean;
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
  operatingHours?: {
    open: string;
    close: string;
  };
  timezone?: string;
}
