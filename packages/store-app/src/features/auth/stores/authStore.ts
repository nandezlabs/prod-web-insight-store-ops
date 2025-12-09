import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StoreAuthState } from "../types";
import * as authService from "../services/authService";
import type { StateCreator } from "zustand";

const STORAGE_KEY = "auth-storage";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

const authStoreImpl: StateCreator<StoreAuthState> = (set, get) => ({
  user: null,
  sessionToken: null,
  isAuthenticated: false,
  attempts: 0,
  lockedUntil: null,
  isLoading: false,
  error: null,

  login: async (storeId: string, pin: string) => {
    const state = get();

    // Check if account is locked
    if (state.lockedUntil && Date.now() < state.lockedUntil) {
      const remainingMinutes = Math.ceil(
        (state.lockedUntil - Date.now()) / 60000
      );
      set({
        error: `Too many attempts. Try again in ${remainingMinutes} minute${
          remainingMinutes > 1 ? "s" : ""
        }.`,
      });
      return;
    }

    // Reset lock if expired
    if (state.lockedUntil && Date.now() >= state.lockedUntil) {
      set({ lockedUntil: null, attempts: 0 });
    }

    set({ isLoading: true, error: null });

    try {
      const response = await authService.login(storeId, pin);

      if (response.success && response.sessionToken && response.user) {
        // Encrypt and store session token
        const encryptedToken = authService.encryptToken(response.sessionToken);

        set({
          user: response.user,
          sessionToken: encryptedToken,
          isAuthenticated: true,
          attempts: 0,
          lockedUntil: null,
          isLoading: false,
          error: null,
        });
      } else {
        // Handle failed login
        const newAttempts = state.attempts + 1;
        const attemptsRemaining = MAX_ATTEMPTS - newAttempts;

        // Lock account after max attempts
        if (newAttempts >= MAX_ATTEMPTS) {
          const lockoutTime = Date.now() + LOCKOUT_DURATION;
          set({
            attempts: newAttempts,
            lockedUntil: lockoutTime,
            isLoading: false,
            error: `Too many attempts. Try again in 15 minutes.`,
          });
        } else {
          set({
            attempts: newAttempts,
            isLoading: false,
            error: response.error || "Invalid PIN",
          });

          // Show attempts remaining if getting close to lockout
          if (attemptsRemaining <= 2) {
            set({
              error: `Invalid PIN. ${attemptsRemaining} attempt${
                attemptsRemaining > 1 ? "s" : ""
              } remaining.`,
            });
          }
        }
      }
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      });
    }
  },

  logout: async () => {
    const state = get();
    set({ isLoading: true });

    try {
      if (state.sessionToken) {
        const decryptedToken = authService.decryptToken(state.sessionToken);
        await authService.logout(decryptedToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear state regardless of API response
      set({
        user: null,
        sessionToken: null,
        isAuthenticated: false,
        attempts: 0,
        lockedUntil: null,
        isLoading: false,
        error: null,
      });
    }
  },

  checkSession: async () => {
    const state = get();

    if (!state.sessionToken) {
      set({ isAuthenticated: false });
      return;
    }

    try {
      const decryptedToken = authService.decryptToken(state.sessionToken);
      const response = await authService.validateSession(decryptedToken);

      if (response.valid && response.user) {
        set({
          user: response.user,
          isAuthenticated: true,
        });
      } else {
        // Session invalid, clear state
        set({
          user: null,
          sessionToken: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      // On error, clear session
      set({
        user: null,
        sessionToken: null,
        isAuthenticated: false,
      });
    }
  },

  incrementAttempts: () => {
    const state = get();
    const newAttempts = state.attempts + 1;

    if (newAttempts >= MAX_ATTEMPTS) {
      const lockoutTime = Date.now() + LOCKOUT_DURATION;
      set({
        attempts: newAttempts,
        lockedUntil: lockoutTime,
      });
    } else {
      set({ attempts: newAttempts });
    }
  },

  resetAttempts: () => {
    set({ attempts: 0, lockedUntil: null });
  },

  clearError: () => {
    set({ error: null });
  },
});

export const useAuthStore = create<StoreAuthState>()(
  persist(authStoreImpl, {
    name: STORAGE_KEY,
    partialize: (state: StoreAuthState) => ({
      // Only persist these fields
      sessionToken: state.sessionToken,
      user: state.user,
      attempts: state.attempts,
      lockedUntil: state.lockedUntil,
    }),
  })
);
