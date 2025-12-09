/**
 * Authentication Types
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "super_admin" | "store_user";
  storeId?: string;
  storeName?: string;
  permissions?: string[];
  avatar?: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface PinLoginCredentials {
  pin: string;
  storeId: string;
  geolocation?: GeolocationCoordinates;
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
  expiresAt: string;
}

export interface JWTPayload {
  id: string;
  storeId: string;
  storeName: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  rememberMe?: boolean;
}
