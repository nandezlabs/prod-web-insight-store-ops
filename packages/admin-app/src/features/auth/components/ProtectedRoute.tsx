import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requireSuperAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requireSuperAdmin = false,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user, loading, checkAuth } = useAuthStore();

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-slate-600">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check super admin requirement
  if (requireSuperAdmin && user.role !== "super_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600">
            This page requires super admin privileges. Contact your
            administrator for access.
          </p>
        </div>
      </div>
    );
  }

  // Check specific permissions
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.every((permission) =>
      user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="max-w-md p-6 bg-white rounded-lg shadow-lg border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Insufficient Permissions
            </h2>
            <p className="text-slate-600 mb-4">
              You don't have the required permissions to access this page.
            </p>
            <p className="text-sm text-slate-500">
              Required: {requiredPermissions.join(", ")}
            </p>
          </div>
        </div>
      );
    }
  }

  // Render protected content
  return <>{children}</>;
}
