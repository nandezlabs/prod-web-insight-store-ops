import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  ValidateSessionResponse,
} from "../types";

const API_BASE_URL = "/api";

// Mock mode for development/testing
const MOCK_MODE = import.meta.env.DEV || import.meta.env.MODE === "test";

/**
 * Mock login for development/testing
 */
async function mockLogin(storeId: string, pin: string): Promise<LoginResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Check PIN
  const validPin = import.meta.env.VITE_TEST_PIN || "1234";

  if (pin !== validPin) {
    return {
      success: false,
      error: "Invalid PIN",
      attemptsRemaining: 4,
    };
  }

  return {
    success: true,
    sessionToken: "mock-session-token-" + Date.now(),
    user: {
      id: "mock-user-1",
      storeId: storeId,
      storeName: "Test Store",
      role: "manager",
      permissions: ["inventory", "checklist", "replacement"],
    },
  };
}

/**
 * Get current geolocation coordinates
 */
async function getGeolocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        reject(new Error("Unable to retrieve your location"));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Authenticate user with PIN and geolocation
 */
export async function login(
  storeId: string,
  pin: string
): Promise<LoginResponse> {
  // Use mock login in development/test mode
  if (MOCK_MODE) {
    return mockLogin(storeId, pin);
  }

  try {
    // Get current location
    const { latitude, longitude } = await getGeolocation();

    const requestData: LoginRequest = {
      storeId,
      pin,
      latitude,
      longitude,
    };

    const response = await fetch(`${API_BASE_URL}/auth.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "login",
        ...requestData,
      }),
    });

    // Handle rate limiting
    if (response.status === 423) {
      const data = await response.json();
      return {
        success: false,
        error: "Too many attempts. Please try again later.",
        lockedUntil: data.lockedUntil,
        attemptsRemaining: 0,
      };
    }

    if (!response.ok) {
      throw new Error("Network error. Please check your connection.");
    }

    const data: LoginResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      // Geolocation errors
      if (error.message.includes("location")) {
        return {
          success: false,
          error: "Location verification failed. Are you at the store?",
        };
      }

      // Network errors
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Logout user and invalidate session
 */
export async function logout(sessionToken: string): Promise<LogoutResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        action: "logout",
      }),
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    const data: LogoutResponse = await response.json();
    return data;
  } catch (error) {
    // Even if logout fails, we'll clear local state
    return { success: false };
  }
}

/**
 * Validate existing session token
 */
export async function validateSession(
  sessionToken: string
): Promise<ValidateSessionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        action: "validateSession",
      }),
    });

    if (!response.ok) {
      return { valid: false };
    }

    const data: ValidateSessionResponse = await response.json();
    return data;
  } catch (error) {
    return { valid: false };
  }
}

/**
 * Simple encryption for localStorage (basic obfuscation)
 * Note: For production, consider using a more robust encryption method
 */
export function encryptToken(token: string): string {
  return btoa(token);
}

/**
 * Simple decryption for localStorage
 */
export function decryptToken(encryptedToken: string): string {
  try {
    return atob(encryptedToken);
  } catch {
    return "";
  }
}
