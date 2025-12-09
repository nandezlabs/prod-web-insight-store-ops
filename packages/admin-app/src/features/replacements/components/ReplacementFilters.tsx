import { useState } from "react";
import { Filter, X } from "lucide-react";
import type {
  ReplacementFilters,
  ReplacementStatus,
  ReplacementPriority,
} from "../types";

interface ReplacementFiltersProps {
  filters: ReplacementFilters;
  onFiltersChange: (filters: Partial<ReplacementFilters>) => void;
  onClearFilters: () => void;
  stores: Array<{ id: string; name: string }>;
}

const statusOptions: Array<ReplacementStatus | "All"> = [
  "All",
  "Pending",
  "Approved",
  "Rejected",
  "Implemented",
];
const priorityOptions: ReplacementPriority[] = [
  "Urgent",
  "High",
  "Medium",
  "Low",
];
const sortByOptions: Array<{
  value: "priority" | "date" | "store";
  label: string;
}> = [
  { value: "priority", label: "Priority" },
  { value: "date", label: "Date" },
  { value: "store", label: "Store" },
];

export function ReplacementFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  stores,
}: ReplacementFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    filters.status !== "All" || filters.storeId || filters.priority;

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
              Active
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status || "All"}
              onChange={(e) =>
                onFiltersChange({
                  status: e.target.value as ReplacementStatus | "All",
                })
              }
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Store Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Store</label>
            <select
              value={filters.storeId || ""}
              onChange={(e) =>
                onFiltersChange({ storeId: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Stores</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={filters.priority || ""}
              onChange={(e) =>
                onFiltersChange({
                  priority: e.target.value as ReplacementPriority | undefined,
                })
              }
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Priorities</option>
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  onFiltersChange({
                    sortBy: e.target.value as "priority" | "date" | "store",
                  })
                }
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {sortByOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  onFiltersChange({
                    sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
                  })
                }
                className="px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                title={`Sort ${
                  filters.sortOrder === "asc" ? "ascending" : "descending"
                }`}
              >
                {filters.sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
