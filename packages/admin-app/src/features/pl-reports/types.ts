export interface PLReport {
  id: string;
  reportName: string;
  period: string; // "YYYY-MM" format
  storeId: string;
  storeName: string;
  revenue: number;
  cogs: number; // Cost of Goods Sold
  laborCosts: number;
  rent: number;
  utilities: number;
  marketing: number;
  otherExpenses: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number; // Percentage
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PLReportFormData {
  reportName: string;
  period: string;
  storeId: string;
  revenue: number | string;
  cogs: number | string;
  laborCosts: number | string;
  rent: number | string;
  utilities: number | string;
  marketing: number | string;
  otherExpenses: number | string;
  notes?: string;
}

export interface PLMetrics {
  revenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  previousPeriod?: {
    revenue: number;
    netProfit: number;
    profitMargin: number;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export type ChatMessageInput = Omit<ChatMessage, "id">;

export interface AISummary {
  overview: string;
  insights: string[];
  recommendations: string[];
  generatedAt: string;
  reportId: string;
}

export interface TrendData {
  period: string;
  revenue: number;
  expenses: number;
  netProfit: number;
}

export interface PLReportFilters {
  storeId?: string;
  startPeriod?: string;
  endPeriod?: string;
  minRevenue?: number;
  maxRevenue?: number;
  sortBy?: "period" | "revenue" | "netProfit" | "profitMargin";
  sortOrder?: "asc" | "desc";
}

export interface PLReportState {
  reports: PLReport[];
  currentReport: PLReport | null;
  isLoading: boolean;
  error: string | null;
  filters: PLReportFilters;
  chatHistory: ChatMessage[];
  aiSummary: AISummary | null;
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}
