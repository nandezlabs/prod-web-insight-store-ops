import { useEffect, useState } from "react";
import { CheckSquare, Square } from "lucide-react";
import { ReplacementQueue } from "../components/ReplacementQueue";
import { ReplacementFiltersComponent } from "../components/ReplacementFilters";
import { RequestDetail } from "../components/RequestDetail";
import { useReplacementStore } from "../stores/replacementStore";
import type { ReplacementStatus, ApprovalAction } from "../types";

export function ReplacementsPage() {
  const {
    requests,
    isLoading,
    error,
    filters,
    selectedRequests,
    currentRequest,
    fetchRequests,
    setFilters,
    clearFilters,
    selectRequest,
    deselectRequest,
    selectAll,
    deselectAll,
    setCurrentRequest,
    approveRequest,
    rejectRequest,
    addAdminNote,
    getFilteredRequests,
  } = useReplacementStore();

  const [activeTab, setActiveTab] = useState<ReplacementStatus | "All">(
    "Pending"
  );

  // Fetch requests on mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger shortcuts when detail modal is closed
      if (currentRequest) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault();
        const filtered = getFilteredRequests();
        selectAll(filtered);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentRequest, getFilteredRequests, selectAll]);

  const filteredRequests = getFilteredRequests();

  // Get unique stores for filter dropdown
  const stores = Array.from(
    new Map(
      requests.map((r) => [r.storeId, { id: r.storeId, name: r.storeName }])
    ).values()
  );

  const handleTabChange = (tab: ReplacementStatus | "All") => {
    setActiveTab(tab);
    setFilters({ status: tab });
  };

  const handleApprove = async (action: ApprovalAction) => {
    await approveRequest(action);
  };

  const handleReject = async (action: ApprovalAction) => {
    await rejectRequest(action);
  };

  const handleAddNote = async (note: string) => {
    if (currentRequest) {
      await addAdminNote(currentRequest.id, note);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) return;

    const note = prompt(
      `Approve ${selectedRequests.length} requests?\n\nEnter approval note (optional):`
    );
    if (note === null) return; // Cancelled

    try {
      await useReplacementStore
        .getState()
        .bulkApprove(selectedRequests, note || "Bulk approved");
      alert(`Successfully approved ${selectedRequests.length} requests`);
    } catch (error) {
      alert("Failed to bulk approve requests");
    }
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      deselectAll();
    } else {
      selectAll(filteredRequests);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Replacement Requests</h1>
            <p className="text-muted-foreground mt-1">
              Review and approve replacement requests from stores
            </p>
          </div>

          {/* Bulk Actions */}
          {selectedRequests.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {selectedRequests.length} selected
              </span>
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Bulk Approve
              </button>
              <button
                onClick={() => deselectAll()}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Filters */}
        <ReplacementFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          stores={stores}
        />

        {/* Select All */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
          >
            {selectedRequests.length === filteredRequests.length &&
            filteredRequests.length > 0 ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {selectedRequests.length === filteredRequests.length &&
            filteredRequests.length > 0
              ? "Deselect All"
              : "Select All"}
          </button>
          <span className="text-sm text-muted-foreground">
            ({filteredRequests.length} total)
          </span>
        </div>

        {/* Loading State */}
        {isLoading && requests.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-muted-foreground">Loading requests...</p>
          </div>
        ) : (
          <ReplacementQueue
            requests={filteredRequests}
            selectedRequests={selectedRequests}
            onSelectRequest={selectRequest}
            onDeselectRequest={deselectRequest}
            onRequestClick={setCurrentRequest}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        )}

        {/* Detail Modal */}
        {currentRequest && (
          <RequestDetail
            request={currentRequest}
            onClose={() => setCurrentRequest(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            onAddNote={handleAddNote}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
