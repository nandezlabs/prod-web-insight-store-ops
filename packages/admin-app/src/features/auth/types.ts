// Admin User Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
  permissions: string[];
  avatar?: string;
  lastLogin?: string;
}

// Auth State
export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  rememberMe: boolean;
}

// Login Request/Response
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: AdminUser;
  expiresIn: number; // seconds
}

export interface AuthError {
  message: string;
  code:
    | "INVALID_CREDENTIALS"
    | "ACCOUNT_LOCKED"
    | "NETWORK_ERROR"
    | "UNAUTHORIZED";
  retryAfter?: number; // seconds until can retry
}

// Session
export interface Session {
  token: string;
  user: AdminUser;
  expiresAt: number; // timestamp
  refreshToken?: string;
}
