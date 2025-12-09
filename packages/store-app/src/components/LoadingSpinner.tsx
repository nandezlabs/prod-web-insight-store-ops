import { motion } from "framer-motion";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "white" | "gray";
  center?: boolean;
  label?: string;
}

/**
 * Animated loading spinner with size and color variants.
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" center />
 *
 * <LoadingSpinner size="sm" color="white" label="Loading data..." />
 * ```
 */
export function LoadingSpinner({
  size = "md",
  color = "primary",
  center = false,
  label = "Loading",
}: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4",
  };

  const colorStyles = {
    primary: "border-blue-600 border-t-transparent",
    white: "border-white border-t-transparent",
    gray: "border-slate-600 border-t-transparent",
  };

  const spinner = (
    <motion.div
      className={`
        rounded-full
        ${sizeStyles[size]}
        ${colorStyles[color]}
      `}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </motion.div>
  );

  if (center) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {spinner}
      </div>
    );
  }

  return spinner;
}
