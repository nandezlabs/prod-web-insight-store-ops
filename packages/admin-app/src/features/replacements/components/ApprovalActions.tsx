import { useState } from "react";
import { Check, X } from "lucide-react";
import type { ReplacementRequest, ApprovalAction } from "../types";

interface ApprovalActionsProps {
  request: ReplacementRequest;
  onApprove: (action: ApprovalAction) => Promise<void>;
  onReject: (action: ApprovalAction) => Promise<void>;
  isLoading: boolean;
}

export function ApprovalActions({
  request,
  onApprove,
  onReject,
  isLoading,
}: ApprovalActionsProps) {
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove({
        requestId: request.id,
        action: "approve",
        adminNote: adminNote.trim(),
      });
      setAdminNote("");
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!adminNote.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      await onReject({
        requestId: request.id,
        action: "reject",
        adminNote: adminNote.trim(),
      });
      setAdminNote("");
    } catch (error) {
      console.error("Failed to reject:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Admin Note{" "}
          {!adminNote.trim() && (
            <span className="text-red-500">(required for rejection)</span>
          )}
        </label>
        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="Enter your decision notes..."
          className="w-full min-h-[80px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isSubmitting || isLoading}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={isSubmitting || isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Check className="w-5 h-5" />
          Approve
        </button>
        <button
          onClick={handleReject}
          disabled={isSubmitting || isLoading || !adminNote.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <X className="w-5 h-5" />
          Reject
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Keyboard shortcuts:{" "}
        <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded">A</kbd> to
        approve,
        <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded ml-1">
          R
        </kbd>{" "}
        to reject
      </p>
    </div>
  );
}
