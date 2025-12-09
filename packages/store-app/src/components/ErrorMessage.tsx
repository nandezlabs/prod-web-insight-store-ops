import { AlertCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

export interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  variant?: "filled" | "outlined";
}

/**
 * Error message component with auto-dismiss and manual close.
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   message="Failed to save data"
 *   onDismiss={() => setError(null)}
 *   autoDismiss
 * />
 * ```
 */
export function ErrorMessage({
  message,
  onDismiss,
  autoDismiss = false,
  autoDismissDelay = 5000,
  variant = "filled",
}: ErrorMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoDismiss) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, autoDismissDelay);

    return () => clearTimeout(timer);
  }, [autoDismiss, autoDismissDelay, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const variantStyles = {
    filled: "bg-red-600 text-white border-transparent",
    outlined: "bg-red-50 text-red-900 border-red-200",
  };

  const iconColor = variant === "filled" ? "text-white" : "text-red-600";
  const buttonColor =
    variant === "filled"
      ? "text-white hover:bg-red-700"
      : "text-red-600 hover:bg-red-100";

  return (
    <div
      className={`
        flex items-start gap-3
        px-4 py-3 rounded-lg border-2
        ${variantStyles[variant]}
      `}
      role="alert"
    >
      {/* Error icon */}
      <AlertCircle className={`flex-shrink-0 mt-0.5 ${iconColor}`} size={20} />

      {/* Error message */}
      <p className="flex-1 text-sm font-medium">{message}</p>

      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className={`
            flex-shrink-0 p-1 rounded-full
            transition-colors
            ${buttonColor}
          `}
          aria-label="Dismiss error"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
