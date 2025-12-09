/**
 * Analytics Types
 */

export interface AnalyticsLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  storeId?: string;
  storeName?: string;
  action: string;
  category: string;
  metadata?: Record<string, any>;
}

export interface DashboardStats {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  orders: {
    current: number;
    previous: number;
    change: number;
  };
  customers: {
    current: number;
    previous: number;
    change: number;
  };
  conversion: {
    current: number;
    previous: number;
    change: number;
  };
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PLReport {
  id: string;
  storeId: string;
  storeName: string;
  period: string;
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number;
  trend: "up" | "down" | "stable";
  createdAt: string;
}
