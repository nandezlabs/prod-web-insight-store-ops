/**
 * RequestHistory Component
 *
 * List of user's past replacement requests with status badges and filtering.
 */

import { useEffect, useState } from "react";
import { Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useReplacementStore } from "../stores/replacementStore";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { EmptyState } from "../../../components/EmptyState";
import type { RequestStatus, ReplacementRequest as Request } from "../types";

/**
 * Get badge color based on status
 */
function getStatusColor(status: RequestStatus): string {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    case "Approved":
      return "bg-green-100 text-green-700";
    case "Rejected":
      return "bg-red-100 text-red-700";
    case "Implemented":
      return "bg-blue-100 text-blue-700";
    case "Draft":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

/**
 * Format relative date
 */
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface RequestCardProps {
  request: Request;
  onClick: () => void;
}

function RequestCard({ request, onClick }: RequestCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full bg-white rounded-lg border border-gray-200 p-4 text-left hover:shadow-md transition-shadow"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">
            {request.originalItem}
            {request.suggestedReplacement && (
              <span className="text-gray-600">
                {" "}
                → {request.suggestedReplacement}
              </span>
            )}
          </h3>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>{formatRelativeDate(request.requestDate)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              request.status
            )}`}
          >
            {request.status}
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
        </div>
      </div>

      {/* Reasons */}
      <div className="flex flex-wrap gap-1.5">
        {request.reasons.map((reason) => (
          <span
            key={reason}
            className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
          >
            {reason}
          </span>
        ))}
      </div>
    </motion.button>
  );
}

interface RequestDetailProps {
  request: Request;
  onClose: () => void;
}

function RequestDetail({ request, onClose }: RequestDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="min-h-screen bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${getStatusColor(
                  request.status
                )}`}
              >
                {request.status}
              </span>
              <h2 className="text-xl font-bold text-gray-900">
                {request.originalItem}
              </h2>
              {request.suggestedReplacement && (
                <p className="text-gray-600 mt-1">
                  Suggested: {request.suggestedReplacement}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Request info */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Request Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Requested</span>
                <span className="font-medium text-gray-900">
                  {new Date(request.requestDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Priority</span>
                <span className="font-medium text-gray-900">
                  {request.priority}
                </span>
              </div>
              {request.reviewedBy && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reviewed By</span>
                    <span className="font-medium text-gray-900">
                      {request.reviewedBy}
                    </span>
                  </div>
                  {request.reviewedDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reviewed</span>
                      <span className="font-medium text-gray-900">
                        {new Date(request.reviewedDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Reasons */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Reasons for Replacement
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {request.reasons.map((reason) => (
                <span
                  key={reason}
                  className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {reason}
                </span>
              ))}
            </div>
            {request.additionalNotes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {request.additionalNotes}
                </p>
              </div>
            )}
          </div>

          {/* Photos */}
          {request.photoUrls.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Photos ({request.photoUrls.length})
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {request.photoUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="aspect-square rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Admin notes */}
          {request.adminNotes && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Admin Notes
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {request.adminNotes}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

const STATUS_FILTERS: (RequestStatus | "All")[] = [
  "All",
  "Pending",
  "Approved",
  "Rejected",
  "Implemented",
];

export function RequestHistory() {
  const {
    userRequests,
    selectedRequest,
    isLoading,
    fetchUserRequests,
    selectRequest,
  } = useReplacementStore();

  const [statusFilter, setStatusFilter] = useState<RequestStatus | "All">(
    "All"
  );

  useEffect(() => {
    fetchUserRequests();
  }, [fetchUserRequests]);

  const filteredRequests =
    statusFilter === "All"
      ? userRequests
      : userRequests.filter((req) => req.status === statusFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Request History
        </h1>

        {/* Status filter */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg border whitespace-nowrap transition-colors min-h-[48px] ${
                  statusFilter === status
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                aria-pressed={statusFilter === status}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {!isLoading && filteredRequests.length === 0 && (
          <EmptyState
            icon={Clock}
            title="No requests found"
            description={
              statusFilter === "All"
                ? "Your replacement requests will appear here"
                : `No ${statusFilter.toLowerCase()} requests`
            }
            action={
              statusFilter !== "All"
                ? {
                    label: "Show all requests",
                    onClick: () => setStatusFilter("All"),
                  }
                : undefined
            }
          />
        )}

        {!isLoading && filteredRequests.length > 0 && (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onClick={() => selectRequest(request)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedRequest && (
        <RequestDetail
          request={selectedRequest}
          onClose={() => selectRequest(null)}
        />
      )}
    </div>
  );
}
