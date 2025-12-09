/**
 * Example: Integrating the authentication system into your app
 *
 * This file demonstrates how to use the PIN authentication system
 * with routing and session persistence.
 */

import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginScreen, useAuthStore } from "@/features/auth";
import { Dashboard } from "@/features/dashboard/Dashboard";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { checkSession, isAuthenticated } = useAuthStore();

  // Check for existing session on app load
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginScreen
                storeId="STORE-001"
                storeName="Downtown Store"
                logoUrl="/logo.png"
              />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect root to appropriate page */}
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

/**
 * Example: Using auth state in a component
 */
function UserProfile() {
  const { user, logout } = useAuthStore();

  return (
    <div className="p-4">
      <h2>Store Information</h2>
      <p>Store ID: {user?.storeId}</p>
      <p>Store Name: {user?.storeName}</p>
      <p>Role: {user?.role}</p>

      <button
        onClick={logout}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}

/**
 * Example: Manually checking authentication status
 */
function AdminPanel() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "admin" && user?.role !== "super_admin") {
    return <div>Access denied. Admin role required.</div>;
  }

  return <div>Admin Panel</div>;
}

/**
 * Example: Using auth service directly
 */
import { authService } from "@/features/auth";

export async function manualLogin() {
  try {
    const response = await authService.login("STORE-001", "1234");

    if (response.success) {
      console.log("Login successful!", response.user);
    } else {
      console.error("Login failed:", response.error);
    }
  } catch (error) {
    console.error("Login error:", error);
  }
}

/**
 * Example: Custom error handling
 */
export function CustomLoginScreen() {
  const { error, clearError } = useAuthStore();

  useEffect(() => {
    // Custom logic when errors occur
    if (error) {
      console.log("Authentication error:", error);

      // Clear error after custom timeout
      const timer = setTimeout(() => {
        clearError();
      }, 3000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error, clearError]);

  return <LoginScreen storeId="STORE-001" storeName="My Store" />;
}

export { ProtectedRoute, UserProfile, AdminPanel };
