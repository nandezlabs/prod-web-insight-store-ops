import { useState, useEffect } from "react";
import { X, Check, XCircle, Clock, User, MessageSquare } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { AdminNotes } from "./AdminNotes";
import { ApprovalActions } from "./ApprovalActions";
import type { ReplacementRequest, ApprovalAction } from "../types";
import { format } from "date-fns";

interface RequestDetailProps {
  request: ReplacementRequest;
  onClose: () => void;
  onApprove: (action: ApprovalAction) => Promise<void>;
  onReject: (action: ApprovalAction) => Promise<void>;
  onAddNote: (note: string) => Promise<void>;
  isLoading: boolean;
}

export function RequestDetail({
  request,
  onClose,
  onApprove,
  onReject,
  onAddNote,
  isLoading,
}: RequestDetailProps) {
  const [activeTab, setActiveTab] = useState<"details" | "notes" | "history">(
    "details"
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const priorityColors = {
    Urgent: "bg-red-100 text-red-800 border-red-300",
    High: "bg-orange-100 text-orange-800 border-orange-300",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Low: "bg-gray-100 text-gray-800 border-gray-300",
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{request.originalItem}</h2>
              <StatusBadge status={request.status} />
              <span
                className={`px-2 py-1 text-xs font-medium rounded-md border ${
                  priorityColors[request.priority]
                }`}
              >
                {request.priority}
              </span>
            </div>
            {request.suggestedReplacement && (
              <p className="text-muted-foreground">
                Suggested replacement:{" "}
                <span className="font-semibold">
                  {request.suggestedReplacement}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab("details")}
              className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === "details"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === "notes"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Admin Notes ({request.adminNotes?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === "history"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Status History
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Store & Requester Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Store
                  </label>
                  <p className="mt-1 text-lg">{request.storeName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Requested By
                  </label>
                  <p className="mt-1 text-lg">{request.requestedBy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Request Date
                  </label>
                  <p className="mt-1">
                    {format(new Date(request.requestDate), "PPP")}
                  </p>
                </div>
                {request.reviewedBy && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Reviewed By
                    </label>
                    <p className="mt-1">{request.reviewedBy}</p>
                  </div>
                )}
              </div>

              {/* Reasons */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Reasons for Replacement
                </label>
                <ul className="mt-2 space-y-2">
                  {request.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Additional Notes */}
              {request.additionalNotes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Additional Notes
                  </label>
                  <p className="mt-2 p-4 bg-gray-50 rounded-md">
                    {request.additionalNotes}
                  </p>
                </div>
              )}

              {/* Photos */}
              {request.photoUrls.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Photos
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {request.photoUrls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-md border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <AdminNotes
              notes={request.adminNotes || []}
              onAddNote={onAddNote}
              isLoading={isLoading}
            />
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              {request.statusHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex gap-4 p-4 bg-gray-50 rounded-md"
                >
                  <div className="flex-shrink-0">
                    {entry.status === "Approved" && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                    {entry.status === "Rejected" && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    {entry.status === "Pending" && (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                    {entry.status === "Implemented" && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={entry.status} />
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(entry.changedAt), "PPp")}
                      </span>
                    </div>
                    <p className="text-sm">
                      <User className="w-4 h-4 inline mr-1" />
                      Changed by {entry.changedBy}
                    </p>
                    {entry.note && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        <MessageSquare className="w-4 h-4 inline mr-1" />
                        {entry.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        {request.status === "Pending" && (
          <div className="border-t p-6 bg-gray-50">
            <ApprovalActions
              request={request}
              onApprove={onApprove}
              onReject={onReject}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
