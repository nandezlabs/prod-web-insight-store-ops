export interface AnalyticsData {
  totalCompleted: number;
  avgCompletionRate: number;
  onTimeRate: number;
  activeStores: number;
  completionTrend: DataPoint[];
  storeComparison: StoreMetric[];
  typeBreakdown: TypeMetric[];
  previousPeriod?: PeriodComparison;
}

export interface DataPoint {
  date: string;
  count: number;
  type?: string;
  opening?: number;
  daily?: number;
  weekly?: number;
}

export interface StoreMetric {
  storeId: string;
  storeName: string;
  completionCount: number;
  completionRate: number;
}

export interface TypeMetric {
  type: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface PeriodComparison {
  totalCompleted: number;
  avgCompletionRate: number;
  onTimeRate: number;
  activeStores: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  label?: string;
}

export type DateRangePreset =
  | "last7days"
  | "last30days"
  | "last90days"
  | "thisMonth"
  | "lastMonth"
  | "custom";

export interface AnalyticsFilters {
  dateRange: DateRange;
  storeIds?: string[];
  checklistTypes?: string[];
}

export interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
}

export interface ExportOptions {
  format: "csv" | "pdf";
  includeCharts: boolean;
  filters: AnalyticsFilters;
}
