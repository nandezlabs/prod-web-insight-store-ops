import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

/**
 * Empty state component for displaying when no data is available.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Inbox}
 *   title="No messages"
 *   description="You don't have any messages yet."
 *   action={{
 *     label: "Compose Message",
 *     onClick: handleCompose
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon */}
      <div className="w-16 h-16 mb-4 text-slate-400">
        <Icon size={64} strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-base text-slate-600 max-w-md mb-6">{description}</p>

      {/* Action button */}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}

      {/* Custom content */}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
