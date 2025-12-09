import axios from "axios";
import type { PLReport, PLReportFormData } from "../types";
import { encryptPLReport, decryptPLReport } from "../utils/encryption";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class PLReportService {
  /**
   * Calculate derived metrics
   */
  calculateMetrics(data: PLReportFormData): Partial<PLReport> {
    const revenue =
      typeof data.revenue === "string"
        ? parseFloat(data.revenue)
        : data.revenue;
    const cogs =
      typeof data.cogs === "string" ? parseFloat(data.cogs) : data.cogs;
    const laborCosts =
      typeof data.laborCosts === "string"
        ? parseFloat(data.laborCosts)
        : data.laborCosts;
    const rent =
      typeof data.rent === "string" ? parseFloat(data.rent) : data.rent;
    const utilities =
      typeof data.utilities === "string"
        ? parseFloat(data.utilities)
        : data.utilities;
    const marketing =
      typeof data.marketing === "string"
        ? parseFloat(data.marketing)
        : data.marketing;
    const otherExpenses =
      typeof data.otherExpenses === "string"
        ? parseFloat(data.otherExpenses)
        : data.otherExpenses;

    const totalExpenses =
      cogs + laborCosts + rent + utilities + marketing + otherExpenses;
    const grossProfit = revenue - cogs;
    const netProfit = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
      revenue,
      cogs,
      laborCosts,
      rent,
      utilities,
      marketing,
      otherExpenses,
      totalExpenses,
      grossProfit,
      netProfit,
      profitMargin,
    };
  }

  /**
   * Get all P&L reports
   */
  async getAllReports(): Promise<PLReport[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/pl-reports`);
      return response.data.map((report: any) => decryptPLReport(report));
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      return this.getMockReports();
    }
  }

  /**
   * Get report by ID
   */
  async getReportById(id: string): Promise<PLReport | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/pl-reports/${id}`);
      return decryptPLReport(response.data) as PLReport;
    } catch (error) {
      console.error("Failed to fetch report:", error);
      return null;
    }
  }

  /**
   * Create new report
   */
  async createReport(data: PLReportFormData): Promise<PLReport> {
    const metrics = this.calculateMetrics(data);
    const reportData = { ...data, ...metrics };

    try {
      const encrypted = encryptPLReport(reportData);
      const response = await axios.post(
        `${API_BASE_URL}/pl-reports`,
        encrypted
      );
      return decryptPLReport(response.data) as PLReport;
    } catch (error) {
      console.error("Failed to create report:", error);
      throw error;
    }
  }

  /**
   * Update report
   */
  async updateReport(id: string, data: PLReportFormData): Promise<PLReport> {
    const metrics = this.calculateMetrics(data);
    const reportData = { ...data, ...metrics };

    try {
      const encrypted = encryptPLReport(reportData);
      const response = await axios.put(
        `${API_BASE_URL}/pl-reports/${id}`,
        encrypted
      );
      return decryptPLReport(response.data) as PLReport;
    } catch (error) {
      console.error("Failed to update report:", error);
      throw error;
    }
  }

  /**
   * Delete report
   */
  async deleteReport(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/pl-reports/${id}`);
    } catch (error) {
      console.error("Failed to delete report:", error);
      throw error;
    }
  }

  /**
   * Get trend data for a store
   */
  async getTrendData(
    storeId: string,
    months: number = 12
  ): Promise<PLReport[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/pl-reports/trends/${storeId}`,
        {
          params: { months },
        }
      );
      return response.data.map((report: any) => decryptPLReport(report));
    } catch (error) {
      console.error("Failed to fetch trend data:", error);
      return [];
    }
  }

  /**
   * Mock data for development
   */
  private getMockReports(): PLReport[] {
    return [
      {
        id: "1",
        reportName: "Downtown Store - December 2025",
        period: "2025-12",
        storeId: "store-001",
        storeName: "Downtown Store",
        revenue: 125000,
        cogs: 45000,
        laborCosts: 28000,
        rent: 8000,
        utilities: 2500,
        marketing: 3000,
        otherExpenses: 4500,
        totalExpenses: 91000,
        grossProfit: 80000,
        netProfit: 34000,
        profitMargin: 27.2,
        notes: "Strong month with increased foot traffic during holidays",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        reportName: "Westside Mall - December 2025",
        period: "2025-12",
        storeId: "store-002",
        storeName: "Westside Mall",
        revenue: 98000,
        cogs: 38000,
        laborCosts: 24000,
        rent: 9500,
        utilities: 2200,
        marketing: 2500,
        otherExpenses: 3800,
        totalExpenses: 80000,
        grossProfit: 60000,
        netProfit: 18000,
        profitMargin: 18.4,
        notes: "Mall location with consistent performance",
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        reportName: "Downtown Store - November 2025",
        period: "2025-11",
        storeId: "store-001",
        storeName: "Downtown Store",
        revenue: 108000,
        cogs: 42000,
        laborCosts: 26000,
        rent: 8000,
        utilities: 2300,
        marketing: 2800,
        otherExpenses: 4200,
        totalExpenses: 85300,
        grossProfit: 66000,
        netProfit: 22700,
        profitMargin: 21.0,
        notes: "Typical fall month performance",
        createdAt: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];
  }
}

export const plReportService = new PLReportService();
