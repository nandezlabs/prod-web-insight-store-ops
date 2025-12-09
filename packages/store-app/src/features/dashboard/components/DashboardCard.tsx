import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: number;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Quick action card for dashboard navigation.
 * Large touch target (120x120px minimum) with icon, title, and optional badge.
 */
import { Card, CardHeader, CardTitle, CardContent } from "@insight/ui";
export function DashboardCard({
  title,
  subtitle,
  icon: Icon,
  badge,
  onClick,
  disabled = false,
}: DashboardCardProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-center
        min-h-[120px] p-4 rounded-xl
        bg-white shadow-md
        transition-all duration-150
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-lg active:shadow-sm cursor-pointer"
        }
      `}
    >
      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <div className="absolute top-2 right-2 min-w-[24px] h-6 px-2 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {badge > 99 ? "99+" : badge}
        </div>
      )}

      {/* Icon */}
      <div className="mb-3">
        <Icon
          size={40}
          className={disabled ? "text-slate-400" : "text-blue-600"}
          strokeWidth={1.5}
        />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-slate-900 text-center mb-1">
        {title}
      </h3>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-slate-600 text-center line-clamp-2">
          {subtitle}
        </p>
      )}
      <Card>
        <CardHeader className="flex flex-col items-center justify-center space-y-2 p-4">
          <Icon className="w-8 h-8 text-blue-600 mb-1" />
          <CardTitle className="text-lg font-semibold text-slate-900 mb-0">
            {title}
          </CardTitle>
          {subtitle && (
            <span className="text-sm text-slate-500">{subtitle}</span>
          )}
          {badge !== undefined && (
            <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
              {badge}
            </span>
          )}
        </CardHeader>
        <CardContent className="p-0" />
      </Card>
    </motion.button>
  );
}
