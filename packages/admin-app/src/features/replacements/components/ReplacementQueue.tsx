import { useState, useEffect } from "react";
import { RequestCard } from "./RequestCard";
import type { ReplacementRequest, ReplacementStatus } from "../types";

interface ReplacementQueueProps {
  requests: ReplacementRequest[];
  selectedRequests: string[];
  onSelectRequest: (id: string) => void;
  onDeselectRequest: (id: string) => void;
  onRequestClick: (request: ReplacementRequest) => void;
  activeTab: ReplacementStatus | "All";
  onTabChange: (tab: ReplacementStatus | "All") => void;
}

const tabs: Array<{ id: ReplacementStatus | "All"; label: string }> = [
  { id: "Pending", label: "Pending" },
  { id: "Approved", label: "Approved" },
  { id: "Rejected", label: "Rejected" },
  { id: "Implemented", label: "Implemented" },
  { id: "All", label: "All" },
];

export function ReplacementQueue({
  requests,
  selectedRequests,
  onSelectRequest,
  onDeselectRequest,
  onRequestClick,
  activeTab,
  onTabChange,
}: ReplacementQueueProps) {
  const [counts, setCounts] = useState<
    Record<ReplacementStatus | "All", number>
  >({
    Pending: 0,
    Approved: 0,
    Rejected: 0,
    Implemented: 0,
    All: 0,
  });

  useEffect(() => {
    setCounts({
      Pending: requests.filter((r) => r.status === "Pending").length,
      Approved: requests.filter((r) => r.status === "Approved").length,
      Rejected: requests.filter((r) => r.status === "Rejected").length,
      Implemented: requests.filter((r) => r.status === "Implemented").length,
      All: requests.length,
    });
  }, [requests]);

  const filteredRequests =
    activeTab === "All"
      ? requests
      : requests.filter((r) => r.status === activeTab);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 min-w-[120px] px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50"
              }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <p className="text-muted-foreground">No requests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              isSelected={selectedRequests.includes(request.id)}
              onSelect={onSelectRequest}
              onDeselect={onDeselectRequest}
              onClick={() => onRequestClick(request)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
