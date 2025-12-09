import { Clock, Store, AlertCircle, Image as ImageIcon } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { ReplacementRequest, ReplacementPriority } from "../types";
import { formatDistanceToNow } from "date-fns";

interface RequestCardProps {
  request: ReplacementRequest;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDeselect: (id: string) => void;
  onClick: () => void;
}

const priorityColors: Record<ReplacementPriority, string> = {
  Urgent: "bg-red-100 text-red-800 border-red-300",
  High: "bg-orange-100 text-orange-800 border-orange-300",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Low: "bg-gray-100 text-gray-800 border-gray-300",
};

export function RequestCard({
  request,
  isSelected,
  onSelect,
  onDeselect,
  onClick,
}: RequestCardProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelect(request.id);
    } else {
      onDeselect(request.id);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              aria-label={`Select ${request.originalItem} replacement request`}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">
                  {request.originalItem}
                </h3>
                <StatusBadge status={request.status} />
              </div>
              {request.suggestedReplacement && (
                <p className="text-sm text-muted-foreground">
                  → {request.suggestedReplacement}
                </p>
              )}
            </div>
          </div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-md border ${
              priorityColors[request.priority]
            }`}
          >
            {request.priority}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Store className="w-4 h-4" />
            <span>{request.storeName}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {formatDistanceToNow(new Date(request.requestDate), {
                addSuffix: true,
              })}
            </span>
          </div>

          {request.reasons.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-muted-foreground font-medium mb-1">
                  Reasons:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  {request.reasons.slice(0, 2).map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
                {request.reasons.length > 2 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    +{request.reasons.length - 2} more
                  </p>
                )}
              </div>
            </div>
          )}

          {request.photoUrls.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="w-4 h-4" />
              <span>
                {request.photoUrls.length} photo
                {request.photoUrls.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <span>Requested by {request.requestedBy}</span>
          {request.adminNotes && request.adminNotes.length > 0 && (
            <span>
              {request.adminNotes.length} admin note
              {request.adminNotes.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
