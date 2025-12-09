// Re-export common types from shared package
export type {
  Store,
  StoreProfile,
  AuthUser,
  User,
  AdminUser,
  Form,
  FormField,
  FormResponse,
  InventoryItem,
  InventoryFilters,
  ReplacementRequest,
  ReplacementStatus,
  ReplacementPriority,
  ChecklistTask,
  ChecklistSubmission,
  DashboardStats,
  PLReport,
  ApiResponse,
} from "@insight/shared-types";

// Legacy aliases for compatibility
export type FormTemplate = import("@insight/shared-types").Form;
export type Replacement = import("@insight/shared-types").ReplacementRequest;

export interface AnalyticsData {
  revenue: number;
  orders: number;
  customers: number;
  conversionRate: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  topProducts: Array<{ name: string; sales: number }>;
}
