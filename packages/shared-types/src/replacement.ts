/**
 * Replacement Request Types
 */

export type ReplacementStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed";
export type ReplacementPriority = "low" | "medium" | "high" | "urgent";

export interface ReplacementRequest {
  id: string;
  storeId: string;
  storeName: string;
  itemName: string;
  category?: string;
  quantity: number;
  reason: string;
  priority: ReplacementPriority;
  status: ReplacementStatus;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  completedAt?: string;
  notes?: string;
  estimatedCost?: number;
}

export interface ReplacementFilters {
  status?: ReplacementStatus;
  priority?: ReplacementPriority;
  storeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ReplacementStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
}
