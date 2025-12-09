import axios from "axios";
import { subDays, startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import type { AnalyticsData, DateRange, AnalyticsFilters } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class AnalyticsService {
  /**
   * Fetch analytics data for the given filters
   */
  async getAnalyticsData(filters: AnalyticsFilters): Promise<AnalyticsData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics`, {
        params: {
          startDate: filters.dateRange.startDate.toISOString(),
          endDate: filters.dateRange.endDate.toISOString(),
          storeIds: filters.storeIds?.join(","),
          checklistTypes: filters.checklistTypes?.join(","),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      return this.getMockAnalyticsData(filters);
    }
  }

  /**
   * Export analytics data
   */
  async exportData(
    format: "csv" | "pdf",
    filters: AnalyticsFilters
  ): Promise<Blob> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/analytics/export`,
        {
          format,
          filters,
        },
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to export data:", error);
      throw error;
    }
  }

  /**
   * Get date range preset
   */
  getDateRangePreset(preset: string): DateRange {
    const now = new Date();

    switch (preset) {
      case "last7days":
        return {
          startDate: subDays(now, 7),
          endDate: now,
          label: "Last 7 days",
        };
      case "last30days":
        return {
          startDate: subDays(now, 30),
          endDate: now,
          label: "Last 30 days",
        };
      case "last90days":
        return {
          startDate: subDays(now, 90),
          endDate: now,
          label: "Last 90 days",
        };
      case "thisMonth":
        return {
          startDate: startOfMonth(now),
          endDate: now,
          label: "This month",
        };
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        return {
          startDate: startOfMonth(lastMonth),
          endDate: endOfMonth(lastMonth),
          label: "Last month",
        };
      default:
        return {
          startDate: subDays(now, 30),
          endDate: now,
          label: "Last 30 days",
        };
    }
  }

  /**
   * Mock analytics data for development
   */
  private getMockAnalyticsData(filters: AnalyticsFilters): AnalyticsData {
    const { startDate, endDate } = filters.dateRange;
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Generate completion trend data
    const completionTrend = Array.from({ length: daysDiff }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      return {
        date: format(date, "yyyy-MM-dd"),
        count: Math.floor(Math.random() * 50) + 20,
        opening: Math.floor(Math.random() * 20) + 5,
        daily: Math.floor(Math.random() * 20) + 10,
        weekly: Math.floor(Math.random() * 15) + 5,
      };
    });

    const totalCompleted = completionTrend.reduce((sum, d) => sum + d.count, 0);

    return {
      totalCompleted,
      avgCompletionRate: 87.5,
      onTimeRate: 92.3,
      activeStores: 24,
      completionTrend,
      storeComparison: [
        {
          storeId: "1",
          storeName: "Downtown Store",
          completionCount: 145,
          completionRate: 95.2,
        },
        {
          storeId: "2",
          storeName: "Westside Mall",
          completionCount: 132,
          completionRate: 88.7,
        },
        {
          storeId: "3",
          storeName: "Airport Location",
          completionCount: 128,
          completionRate: 91.3,
        },
        {
          storeId: "4",
          storeName: "University District",
          completionCount: 121,
          completionRate: 85.4,
        },
        {
          storeId: "5",
          storeName: "Suburban Plaza",
          completionCount: 118,
          completionRate: 89.1,
        },
        {
          storeId: "6",
          storeName: "Tech Park",
          completionCount: 115,
          completionRate: 92.8,
        },
        {
          storeId: "7",
          storeName: "Lakeside Center",
          completionCount: 112,
          completionRate: 87.6,
        },
        {
          storeId: "8",
          storeName: "Mountain View",
          completionCount: 108,
          completionRate: 84.2,
        },
        {
          storeId: "9",
          storeName: "Riverside Plaza",
          completionCount: 105,
          completionRate: 90.5,
        },
        {
          storeId: "10",
          storeName: "North Point",
          completionCount: 102,
          completionRate: 86.9,
        },
        {
          storeId: "11",
          storeName: "South Bay",
          completionCount: 98,
          completionRate: 83.1,
        },
        {
          storeId: "12",
          storeName: "East Gate",
          completionCount: 95,
          completionRate: 88.4,
        },
      ],
      typeBreakdown: [
        {
          type: "Opening Checklist",
          count: 342,
          percentage: 38.5,
          color: "#3b82f6",
        },
        {
          type: "Daily Cleaning",
          count: 298,
          percentage: 33.6,
          color: "#10b981",
        },
        {
          type: "Weekly Maintenance",
          count: 186,
          percentage: 21.0,
          color: "#f59e0b",
        },
        {
          type: "Inventory Count",
          count: 62,
          percentage: 7.0,
          color: "#8b5cf6",
        },
      ],
      previousPeriod: {
        totalCompleted: totalCompleted - Math.floor(Math.random() * 100) - 50,
        avgCompletionRate: 84.2,
        onTimeRate: 89.1,
        activeStores: 23,
      },
    };
  }
}

export const analyticsService = new AnalyticsService();
