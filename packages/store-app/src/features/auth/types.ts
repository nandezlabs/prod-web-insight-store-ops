// Re-export auth types from shared package
export type {
  AuthUser,
  PinLoginCredentials,
  AuthResponse,
  GeolocationCoordinates,
} from "@insight/shared-types";

// Legacy type alias for compatibility
export type User = import("@insight/shared-types").AuthUser;

// App-specific extensions
export interface LoginRequest {
  storeId: string;
  pin: string;
  latitude: number;
  longitude: number;
}

export interface LoginResponse {
  success: boolean;
  sessionToken?: string;
  user?: User;
  error?: string;
  attemptsRemaining?: number;
  lockedUntil?: number; // Unix timestamp
}

export interface LogoutResponse {
  success: boolean;
}

export interface ValidateSessionResponse {
  valid: boolean;
  user?: User;
}

// Local AuthState (different from shared package's AuthState)
export interface StoreAuthState {
  user: User | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  attempts: number;
  lockedUntil: number | null;
  isLoading: boolean;
  error: string | null;
  login: (storeId: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  incrementAttempts: () => void;
  resetAttempts: () => void;
  clearError: () => void;
}

export interface GeofenceStatus {
  isWithinBoundary: boolean;
  latitude: number | null;
  longitude: number | null;
  error?: string;
}
