// Replacement Request Types

export type ReplacementStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Implemented";
export type ReplacementPriority = "Low" | "Medium" | "High" | "Urgent";

export interface ReplacementRequest {
  id: string;
  originalItem: string;
  suggestedReplacement?: string;
  requestedBy: string;
  storeName: string;
  storeId: string;
  requestDate: string;
  status: ReplacementStatus;
  priority: ReplacementPriority;
  reasons: string[];
  additionalNotes: string;
  photoUrls: string[];
  adminNotes?: AdminNote[];
  reviewedBy?: string;
  reviewDate?: string;
  statusHistory: StatusHistoryEntry[];
}

export interface AdminNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface StatusHistoryEntry {
  id: string;
  status: ReplacementStatus;
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface ReplacementFilters {
  status: ReplacementStatus | "All";
  storeId?: string;
  priority?: ReplacementPriority;
  sortBy: "priority" | "date" | "store";
  sortOrder: "asc" | "desc";
}

export interface BulkApprovalResult {
  successful: number;
  failed: number;
  errors: { id: string; error: string }[];
}

export interface ApprovalAction {
  requestId: string;
  action: "approve" | "reject";
  adminNote: string;
  priority?: ReplacementPriority;
  suggestedAlternative?: string;
}

export interface ReplacementState {
  requests: ReplacementRequest[];
  isLoading: boolean;
  error: string | null;
  filters: ReplacementFilters;
  selectedRequests: string[];
  currentRequest: ReplacementRequest | null;
}
