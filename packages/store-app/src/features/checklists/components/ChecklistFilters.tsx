/**
 * ChecklistFilters Component
 *
 * Filter panel for checklist history with type, date, status filters.
 * Displays active filter count and provides apply/reset actions.
 */

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/Button";
import type {
  ChecklistFilters as Filters,
  ChecklistType,
  ChecklistStatus,
  DateRangeFilter,
} from "../types";

interface ChecklistFiltersProps {
  filters: Filters;
  onApply: (filters: Filters) => void;
  onReset: () => void;
  onClose: () => void;
}

const CHECKLIST_TYPES: ChecklistType[] = [
  "Opening",
  "Daily",
  "Weekly",
  "Period",
  "Custom",
];
const CHECKLIST_STATUSES: ChecklistStatus[] = [
  "Completed",
  "Overdue",
  "In Progress",
  "Not Started",
];
const DATE_RANGES: DateRangeFilter[] = [
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "All",
];

export function ChecklistFilters({
  filters,
  onApply,
  onReset,
  onClose,
}: ChecklistFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  // Sync with external filters when they change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleType = (type: ChecklistType) => {
    setLocalFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  };

  const toggleStatus = (status: ChecklistStatus) => {
    setLocalFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const setDateRange = (range: DateRangeFilter) => {
    setLocalFilters((prev) => ({ ...prev, dateRange: range }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white w-full sm:max-w-lg sm:rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="filter-title"
          aria-modal="true"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2
              id="filter-title"
              className="text-lg font-semibold text-gray-900"
            >
              Filter Checklists
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Filter sections */}
          <div className="px-6 py-4 space-y-6">
            {/* Checklist Type */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Checklist Type
              </h3>
              <div className="flex flex-wrap gap-2">
                {CHECKLIST_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors min-h-[48px] ${
                      localFilters.types.includes(type)
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-pressed={localFilters.types.includes(type)}
                  >
                    {localFilters.types.includes(type) && (
                      <Check className="w-4 h-4" aria-hidden="true" />
                    )}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Date Range
              </h3>
              <div className="space-y-2">
                {DATE_RANGES.map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors min-h-[48px] ${
                      localFilters.dateRange === range
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-pressed={localFilters.dateRange === range}
                  >
                    <span>{range}</span>
                    {localFilters.dateRange === range && (
                      <Check className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Status</h3>
              <div className="flex flex-wrap gap-2">
                {CHECKLIST_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors min-h-[48px] ${
                      localFilters.statuses.includes(status)
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-pressed={localFilters.statuses.includes(status)}
                  >
                    {localFilters.statuses.includes(status) && (
                      <Check className="w-4 h-4" aria-hidden="true" />
                    )}
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
            <div className="flex-1">
              <Button variant="secondary" size="lg" onClick={handleReset}>
                Reset
              </Button>
            </div>
            <div className="flex-1">
              <Button variant="primary" size="lg" onClick={handleApply}>
                Apply Filters
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
