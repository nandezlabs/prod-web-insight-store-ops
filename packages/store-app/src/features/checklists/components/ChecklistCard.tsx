/**
 * ChecklistCard Component
 *
 * Summary card displaying a checklist in the history list.
 * Shows type, title, completion info, and photo count.
 */

import { motion } from "framer-motion";
import { Clock, User, Camera, CheckCircle2, AlertCircle } from "lucide-react";
import type { Checklist } from "../types";

interface ChecklistCardProps {
  checklist: Checklist;
  onClick: () => void;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get badge color based on checklist type
 */
function getTypeBadgeColor(type: Checklist["type"]): string {
  switch (type) {
    case "Opening":
      return "bg-blue-100 text-blue-700";
    case "Daily":
      return "bg-green-100 text-green-700";
    case "Weekly":
      return "bg-purple-100 text-purple-700";
    case "Period":
      return "bg-orange-100 text-orange-700";
    case "Custom":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function ChecklistCard({ checklist, onClick }: ChecklistCardProps) {
  const isOverdue = checklist.status === "Overdue";
  const isCompleted = checklist.status === "Completed";
  const photoCount = checklist.photoUrls.length;

  return (
    <motion.button
      onClick={onClick}
      className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-left hover:shadow-md transition-shadow"
      whileTap={{ scale: 0.98 }}
      aria-label={`View ${checklist.title} details`}
    >
      {/* Header: Type badge and status */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(
            checklist.type
          )}`}
        >
          {checklist.type}
        </span>

        {isOverdue && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Overdue
          </span>
        )}

        {isCompleted && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
        {checklist.title}
      </h3>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
        <span className="inline-flex items-center gap-1">
          <Clock className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only">Completed </span>
          {formatRelativeTime(checklist.completedDate)}
        </span>

        <span className="inline-flex items-center gap-1">
          <User className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only">Completed by </span>
          {checklist.completedBy}
        </span>

        {photoCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <Camera className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">
              {photoCount} photo{photoCount > 1 ? "s" : ""}
            </span>
            {photoCount}
          </span>
        )}
      </div>

      {/* Completion percentage bar */}
      <div className="w-full">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Completion</span>
          <span className="font-medium">
            {Math.round(checklist.completionPercentage)}%
          </span>
        </div>
        <div
          className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={checklist.completionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Checklist completion progress"
        >
          <div
            className={`h-full transition-all duration-300 ${
              checklist.completionPercentage === 100
                ? "bg-green-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${checklist.completionPercentage}%` }}
          />
        </div>
      </div>
    </motion.button>
  );
}
