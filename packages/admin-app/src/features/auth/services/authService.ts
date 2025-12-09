import axios from "axios";
import type { LoginRequest, LoginResponse, AdminUser, Session } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const TOKEN_KEY = "admin_auth_token";
const SESSION_KEY = "admin_session";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Mock mode for development/testing
const MOCK_MODE = import.meta.env.DEV || import.meta.env.MODE === "test";

// Rate limiting
let loginAttempts = 0;
let lockoutUntil: number | null = null;

class AuthService {
  /**
   * Mock login for development/testing
   */
  private async mockLogin(credentials: LoginRequest): Promise<LoginResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check credentials
    const validEmail = import.meta.env.VITE_TEST_EMAIL || "admin@test.com";
    const validPassword = import.meta.env.VITE_TEST_PASSWORD || "Test123!";

    if (
      credentials.email !== validEmail ||
      credentials.password !== validPassword
    ) {
      throw {
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      };
    }

    const mockUser: AdminUser = {
      id: "mock-admin-1",
      email: credentials.email,
      name: "Test Admin",
      role: "admin",
      permissions: [
        "view_analytics",
        "manage_forms",
        "manage_inventory",
        "manage_stores",
      ],
      createdAt: new Date().toISOString(),
    };

    const mockResponse: LoginResponse = {
      success: true,
      token: "mock-jwt-token-" + Date.now(),
      user: mockUser,
      expiresIn: 28800, // 8 hours
    };

    // Store session
    const session: Session = {
      token: mockResponse.token,
      user: mockResponse.user,
      expiresAt: Date.now() + mockResponse.expiresIn * 1000,
    };

    this.storeSession(session, credentials.rememberMe);

    return mockResponse;
  }

  /**
   * Login admin user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Use mock login in development/test mode
    if (MOCK_MODE) {
      return this.mockLogin(credentials);
    }

    // Check if account is locked
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
      throw {
        message: `Account locked. Try again in ${remainingSeconds} seconds.`,
        code: "ACCOUNT_LOCKED",
        retryAfter: remainingSeconds,
      };
    }

    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/admin/auth.php`,
        {
          email: credentials.email,
          password: credentials.password,
          action: "login",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      // Reset login attempts on success
      loginAttempts = 0;
      lockoutUntil = null;

      // Validate admin role
      if (!["admin", "super_admin"].includes(response.data.user.role)) {
        throw {
          message: "Unauthorized: Admin access required",
          code: "UNAUTHORIZED",
        };
      }

      // Store session
      const session: Session = {
        token: response.data.token,
        user: response.data.user,
        expiresAt: Date.now() + response.data.expiresIn * 1000,
      };

      this.storeSession(session, credentials.rememberMe);

      return response.data;
    } catch (error: any) {
      // Increment login attempts
      loginAttempts++;

      if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        lockoutUntil = Date.now() + LOCKOUT_DURATION;
        throw {
          message: `Too many failed attempts. Account locked for 15 minutes.`,
          code: "ACCOUNT_LOCKED",
          retryAfter: LOCKOUT_DURATION / 1000,
        };
      }

      if (error.code) {
        throw error;
      }

      throw {
        message: error.response?.data?.message || "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      };
    }
  }

  /**
   * Logout admin user
   */
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await axios.post(
          `${API_URL}/admin/auth.php`,
          { action: "logout" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Refresh session token
   */
  async refreshToken(): Promise<string> {
    const session = this.getSession();
    if (!session?.token) {
      throw new Error("No session found");
    }

    try {
      const response = await axios.post<{ token: string; expiresIn: number }>(
        `${API_URL}/admin/auth.php`,
        { action: "refresh" },
        {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
          withCredentials: true,
        }
      );

      // Update session with new token
      const updatedSession: Session = {
        ...session,
        token: response.data.token,
        expiresAt: Date.now() + response.data.expiresIn * 1000,
      };

      this.storeSession(updatedSession, this.isRemembered());

      return response.data.token;
    } catch (error) {
      this.clearSession();
      throw error;
    }
  }

  /**
   * Get current user from session
   */
  getCurrentUser(): AdminUser | null {
    const session = this.getSession();
    return session?.user || null;
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    const session = this.getSession();
    return session?.token || null;
  }

  /**
   * Check if session is valid
   */
  isSessionValid(): boolean {
    const session = this.getSession();
    if (!session) return false;

    // Check if token expired
    if (Date.now() >= session.expiresAt) {
      this.clearSession();
      return false;
    }

    return true;
  }

  /**
   * Check if session needs refresh (within 30 minutes of expiry)
   */
  needsRefresh(): boolean {
    const session = this.getSession();
    if (!session) return false;

    const timeUntilExpiry = session.expiresAt - Date.now();
    return timeUntilExpiry < 30 * 60 * 1000; // Less than 30 minutes
  }

  /**
   * Store session in localStorage/sessionStorage
   */
  private storeSession(session: Session, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(SESSION_KEY, JSON.stringify(session));
    storage.setItem(TOKEN_KEY, session.token);

    if (rememberMe) {
      localStorage.setItem("admin_remember_me", "true");
    }
  }

  /**
   * Get session from storage
   */
  private getSession(): Session | null {
    const sessionData =
      localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);

    if (!sessionData) return null;

    try {
      return JSON.parse(sessionData);
    } catch {
      return null;
    }
  }

  /**
   * Check if "remember me" was enabled
   */
  private isRemembered(): boolean {
    return localStorage.getItem("admin_remember_me") === "true";
  }

  /**
   * Clear session from storage
   */
  private clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("admin_remember_me");
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain an uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain a lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain a number");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const authService = new AuthService();
