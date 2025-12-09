import { ReactNode } from "react";
import { useAuthStore } from "../store/authStore";
import { Shield, AlertTriangle } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  permissions?: string[];
  roles?: ("admin" | "super_admin")[];
  fallback?: ReactNode;
}

/**
 * AuthGuard - Check permissions without redirecting
 * Use for conditional UI elements within a page
 */
export function AuthGuard({
  children,
  permissions = [],
  roles = [],
  fallback,
}: AuthGuardProps) {
  const { user, isAuthenticated } = useAuthStore();

  // Not authenticated
  if (!isAuthenticated || !user) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-2 text-slate-600">
          <Shield className="w-5 h-5" />
          <span className="text-sm">Authentication required</span>
        </div>
      </div>
    );
  }

  // Check role requirement
  if (roles.length > 0 && !roles.includes(user.role)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm">Insufficient role permissions</span>
        </div>
      </div>
    );
  }

  // Check specific permissions
  if (permissions.length > 0) {
    const hasAllPermissions = permissions.every((permission) =>
      user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return fallback ? (
        <>{fallback}</>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">Missing required permissions</span>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

/**
 * Hook to check if user has specific permissions
 */
export function usePermissions() {
  const { user } = useAuthStore();

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) ?? false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  const hasRole = (role: "admin" | "super_admin"): boolean => {
    return user?.role === role;
  };

  const isSuperAdmin = (): boolean => {
    return user?.role === "super_admin";
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isSuperAdmin,
  };
}
