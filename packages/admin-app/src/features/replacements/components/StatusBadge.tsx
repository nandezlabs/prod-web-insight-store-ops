import type { ReplacementStatus } from "../types";

interface StatusBadgeProps {
  status: ReplacementStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const variants: Record<ReplacementStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Approved: "bg-green-100 text-green-800 border-green-300",
    Rejected: "bg-red-100 text-red-800 border-red-300",
    Implemented: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-md border ${variants[status]} ${className}`}
    >
      {status}
    </span>
  );
}
