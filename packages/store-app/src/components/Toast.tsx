import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

export interface ToastProps {
  message: string;
  variant?: "success" | "error" | "info" | "warning";
  duration?: number;
  onClose?: () => void;
  position?: "top-center" | "bottom-right";
}

/**
 * Toast notification component with auto-dismiss and animations.
 *
 * @example
 * ```tsx
 * <Toast
 *   message="Changes saved successfully"
 *   variant="success"
 *   onClose={() => setToast(null)}
 * />
 * ```
 */
export function Toast({
  message,
  variant = "info",
  duration = 4000,
  onClose,
  position = "bottom-right",
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  // Variant styles
  const variantConfig = {
    success: {
      icon: CheckCircle2,
      bgColor: "bg-emerald-600",
      textColor: "text-white",
    },
    error: {
      icon: AlertCircle,
      bgColor: "bg-red-600",
      textColor: "text-white",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-600",
      textColor: "text-white",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-amber-500",
      textColor: "text-white",
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  // Position styles
  const positionStyles = {
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
  };

  // Animation variants
  const animationVariants = {
    "top-center": {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    "bottom-right": {
      initial: { opacity: 0, x: 100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 100 },
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`
            fixed z-50
            ${positionStyles[position]}
          `}
          {...animationVariants[position]}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`
              flex items-center gap-3
              min-w-[300px] max-w-md
              px-4 py-3 rounded-lg shadow-lg
              ${config.bgColor} ${config.textColor}
            `}
            role="status"
            aria-live="polite"
          >
            {/* Icon */}
            <Icon className="flex-shrink-0" size={20} />

            {/* Message */}
            <p className="flex-1 text-sm font-medium">{message}</p>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="
                flex-shrink-0 p-1 rounded-full
                hover:bg-white/20
                transition-colors
              "
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Toast container for managing multiple toasts.
 * Use this to stack multiple toast notifications.
 */
export interface ToastContainerProps {
  toasts: Array<ToastProps & { id: string }>;
  position?: "top-center" | "bottom-right";
}

export function ToastContainer({
  toasts,
  position = "bottom-right",
}: ToastContainerProps) {
  const positionStyles = {
    "top-center": "top-4 left-1/2 -translate-x-1/2 flex-col-reverse",
    "bottom-right": "bottom-4 right-4 flex-col",
  };

  return (
    <div className={`fixed z-50 flex gap-2 ${positionStyles[position]}`}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} position={position} />
      ))}
    </div>
  );
}
