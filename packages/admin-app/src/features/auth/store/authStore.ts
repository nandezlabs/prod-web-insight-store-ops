import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authService";
import type { AuthState, LoginRequest } from "../types";

interface AuthStore extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      rememberMe: false,

      /**
       * Login user
       */
      login: async (credentials: LoginRequest) => {
        set({ loading: true, error: null });

        try {
          const response = await authService.login(credentials);

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            loading: false,
            error: null,
            rememberMe: credentials.rememberMe || false,
          });
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: error.message || "Login failed",
          });
          throw error;
        }
      },

      /**
       * Logout user
       */
      logout: async () => {
        set({ loading: true });

        try {
          await authService.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,
            rememberMe: false,
          });
        }
      },

      /**
       * Refresh authentication token
       */
      refreshToken: async () => {
        try {
          const token = await authService.refreshToken();
          const user = authService.getCurrentUser();

          set({
            token,
            user,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Token refresh failed:", error);
          get().logout();
        }
      },

      /**
       * Check authentication status
       */
      checkAuth: () => {
        const isValid = authService.isSessionValid();
        const user = authService.getCurrentUser();
        const token = authService.getToken();

        if (isValid && user && token) {
          set({
            user,
            token,
            isAuthenticated: true,
          });

          // Auto-refresh if needed
          if (authService.needsRefresh()) {
            get().refreshToken();
          }
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "admin-auth-storage",
      partialize: (state) => ({
        user: state.rememberMe ? state.user : null,
        token: state.rememberMe ? state.token : null,
        isAuthenticated: state.rememberMe ? state.isAuthenticated : false,
        rememberMe: state.rememberMe,
      }),
    }
  )
);

// Auto-check auth on load
if (typeof window !== "undefined") {
  useAuthStore.getState().checkAuth();

  // Set up auto-refresh interval (every 5 minutes)
  setInterval(() => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated && authService.needsRefresh()) {
      useAuthStore.getState().refreshToken();
    }
  }, 5 * 60 * 1000);
}
