/**
 * Checklist History Feature - Type Definitions
 *
 * Defines all TypeScript interfaces for viewing completed checklists
 * with photos, signatures, and filtering capabilities.
 */

export type ChecklistType =
  | "Opening"
  | "Daily"
  | "Weekly"
  | "Period"
  | "Custom";
export type ChecklistStatus =
  | "Not Started"
  | "In Progress"
  | "Completed"
  | "Overdue";
export type TaskItemType =
  | "checkbox"
  | "text"
  | "number"
  | "time"
  | "photo"
  | "signature";
export type DateRangeFilter =
  | "Last 7 days"
  | "Last 30 days"
  | "Last 90 days"
  | "Custom"
  | "All";

/**
 * Individual task item within a checklist
 */
export interface TaskItem {
  id: string;
  label: string;
  type: TaskItemType;
  completed: boolean;
  value?: any; // Text, number, time string, photo URLs array, or signature data URL
  validationError?: string; // For number fields with validation issues
  caption?: string; // For photo fields
}

/**
 * Complete checklist record
 */
export interface Checklist {
  id: string;
  title: string;
  type: ChecklistType;
  status: ChecklistStatus;
  completedBy: string;
  completedDate: string; // ISO string
  dueDate?: string; // ISO string
  taskItems: TaskItem[];
  photoUrls: string[];
  signatureData?: string; // Base64 data URL
  completionPercentage: number; // 0-100
  section: string;
  storeId: string;
  storeName: string;
  notes?: string;
}

/**
 * Filter configuration for checklist list
 */
export interface ChecklistFilters {
  types: ChecklistType[]; // Empty = all types
  dateRange: DateRangeFilter;
  customStartDate?: string; // ISO string, used when dateRange is 'Custom'
  customEndDate?: string; // ISO string, used when dateRange is 'Custom'
  statuses: ChecklistStatus[]; // Empty = all statuses
  completedByUsers: string[]; // Empty = all users
  searchQuery: string; // Filter by title
}

/**
 * Date grouping for checklist list
 */
export interface ChecklistGroup {
  label: string; // "Today", "Yesterday", "Last 7 days", etc.
  checklists: Checklist[];
}

/**
 * Pagination state
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  hasMore: boolean;
  total: number;
}

/**
 * Checklist store state
 */
export interface ChecklistState {
  // Data
  checklists: Checklist[];
  selectedChecklist: Checklist | null;

  // UI State
  filters: ChecklistFilters;
  pagination: PaginationState;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;

  // Filter helpers
  activeFilterCount: number;

  // Actions
  fetchChecklists: (reset?: boolean) => Promise<void>;
  fetchChecklistDetail: (id: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setFilters: (filters: Partial<ChecklistFilters>) => void;
  resetFilters: () => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  closeDetail: () => void;
}

/**
 * Photo in gallery
 */
export interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string;
  timestamp?: string;
}

/**
 * Default filter values
 */
export const DEFAULT_FILTERS: ChecklistFilters = {
  types: [],
  dateRange: "Last 30 days",
  statuses: [],
  completedByUsers: [],
  searchQuery: "",
};

/**
 * Items per page for pagination
 */
export const PAGE_SIZE = 20;
