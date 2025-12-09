/**
 * ChecklistHistory Component
 *
 * Main component for viewing completed checklists.
 * Features infinite scroll, date grouping, filters, and search.
 */

import { useEffect, useRef, useState } from "react";
import { Search, Filter, RefreshCw, ChevronDown } from "lucide-react";
import { useChecklistStore } from "../stores/checklistStore";
import { ChecklistCard } from "./ChecklistCard";
import { ChecklistDetail } from "./ChecklistDetail";
import { ChecklistFilters } from "./ChecklistFilters";
import { EmptyState } from "../../../components/EmptyState";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import type { ChecklistGroup, Checklist } from "../types";

/**
 * Group checklists by date
 */
function groupChecklistsByDate(checklists: Checklist[]): ChecklistGroup[] {
  const groups: ChecklistGroup[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const todayGroup: ChecklistGroup = { label: "Today", checklists: [] };
  const yesterdayGroup: ChecklistGroup = { label: "Yesterday", checklists: [] };
  const lastWeekGroup: ChecklistGroup = {
    label: "Last 7 days",
    checklists: [],
  };
  const olderGroup: ChecklistGroup = { label: "Older", checklists: [] };

  checklists.forEach((checklist) => {
    const date = new Date(checklist.completedDate);
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (dateOnly.getTime() === today.getTime()) {
      todayGroup.checklists.push(checklist);
    } else if (dateOnly.getTime() === yesterday.getTime()) {
      yesterdayGroup.checklists.push(checklist);
    } else if (dateOnly.getTime() > lastWeek.getTime()) {
      lastWeekGroup.checklists.push(checklist);
    } else {
      olderGroup.checklists.push(checklist);
    }
  });

  if (todayGroup.checklists.length > 0) groups.push(todayGroup);
  if (yesterdayGroup.checklists.length > 0) groups.push(yesterdayGroup);
  if (lastWeekGroup.checklists.length > 0) groups.push(lastWeekGroup);
  if (olderGroup.checklists.length > 0) groups.push(olderGroup);

  return groups;
}

/**
 * Loading skeleton for checklist cards
 */
function ChecklistSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
      </div>
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="flex gap-4 mb-3">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
      <div className="h-2 bg-gray-200 rounded-full w-full" />
    </div>
  );
}

export function ChecklistHistory() {
  const {
    checklists,
    selectedChecklist,
    filters,
    pagination,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    activeFilterCount,
    fetchChecklists,
    fetchChecklistDetail,
    loadMore,
    refresh,
    setFilters,
    resetFilters,
    setSearchQuery,
    closeDetail,
  } = useChecklistStore();

  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.searchQuery);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    fetchChecklists(true);
  }, [fetchChecklists]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          pagination.hasMore &&
          !isLoadingMore
        ) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [pagination.hasMore, isLoadingMore, loadMore]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.searchQuery) {
        setSearchQuery(searchValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, filters.searchQuery, setSearchQuery]);

  const handleCardClick = (id: string) => {
    fetchChecklistDetail(id);
  };

  const handleRefresh = async () => {
    await refresh();
  };

  const groups = groupChecklistsByDate(checklists);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-20">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Checklist History
          </h1>

          {/* Search and filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search checklists..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Search checklists"
              />
            </div>

            <button
              onClick={() => setShowFilters(true)}
              className="relative px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[56px] flex items-center justify-center"
              aria-label={`Filter checklists${
                activeFilterCount > 0 ? `, ${activeFilterCount} active` : ""
              }`}
            >
              <Filter className="w-5 h-5 text-gray-600" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 min-w-[56px] flex items-center justify-center"
              aria-label="Refresh checklists"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-600 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Error state */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <ChecklistSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && checklists.length === 0 && (
          <EmptyState
            icon={ChevronDown}
            title="No checklists found"
            description={
              activeFilterCount > 0
                ? "Try adjusting your filters to see more results."
                : "Completed checklists will appear here."
            }
            action={
              activeFilterCount > 0
                ? {
                    label: "Clear filters",
                    onClick: resetFilters,
                  }
                : undefined
            }
          />
        )}

        {/* Checklist groups */}
        {!isLoading && groups.length > 0 && (
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.label}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {group.label}
                </h2>
                <div className="space-y-3">
                  {group.checklists.map((checklist) => (
                    <ChecklistCard
                      key={checklist.id}
                      checklist={checklist}
                      onClick={() => handleCardClick(checklist.id)}
                    />
                  ))}
                </div>
              </section>
            ))}

            {/* Infinite scroll trigger */}
            {pagination.hasMore && (
              <div ref={observerTarget} className="py-4 flex justify-center">
                {isLoadingMore && <LoadingSpinner size="md" />}
              </div>
            )}

            {/* End of list */}
            {!pagination.hasMore && checklists.length > 0 && (
              <p className="text-center text-gray-500 text-sm py-4">
                You've reached the end of the list
              </p>
            )}
          </div>
        )}
      </div>

      {/* Filter modal */}
      {showFilters && (
        <ChecklistFilters
          filters={filters}
          onApply={setFilters}
          onReset={resetFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Detail modal */}
      {selectedChecklist && (
        <ChecklistDetail checklist={selectedChecklist} onClose={closeDetail} />
      )}
    </div>
  );
}
