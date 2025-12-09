/**
 * Checklist Types
 */

export type ChecklistSection = "opening" | "closing" | "midday";
export type ChecklistType = "daily" | "weekly" | "period";
export type TaskStatus = "pending" | "completed" | "skipped" | "failed";

export interface ChecklistTask {
  id: string;
  section: ChecklistSection;
  type: ChecklistType;
  taskName: string;
  taskOrder: number;
  description?: string;
  status: TaskStatus;
  requiresPhoto?: boolean;
  requiresSignature?: boolean;
}

export interface ChecklistSubmission {
  id: string;
  storeId: string;
  storeName: string;
  section: ChecklistSection;
  type: ChecklistType;
  tasks: ChecklistTaskResponse[];
  submittedBy: string;
  submittedAt: string;
  completionTime?: number; // in seconds
  photos?: string[];
  signature?: string;
  notes?: string;
}

export interface ChecklistTaskResponse {
  taskId: string;
  taskName: string;
  status: TaskStatus;
  completedAt?: string;
  notes?: string;
  photoUrl?: string;
}

export interface ChecklistFilters {
  section?: ChecklistSection;
  type?: ChecklistType;
  status?: TaskStatus;
  dateFrom?: string;
  dateTo?: string;
}
