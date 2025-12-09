import { create } from "zustand";
import { persist } from "zustand/middleware";
import { plReportService } from "../services/plReportService";
import type {
  PLReport,
  PLReportFormData,
  PLReportFilters,
  PLReportState,
  ChatMessageInput,
  AISummary,
} from "../types";

interface PLReportStore extends PLReportState {
  // Actions
  fetchReports: () => Promise<void>;
  fetchReportById: (id: string) => Promise<void>;
  createReport: (data: PLReportFormData) => Promise<void>;
  updateReport: (id: string, data: PLReportFormData) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  setFilters: (filters: Partial<PLReportFilters>) => void;
  clearFilters: () => void;
  setCurrentReport: (report: PLReport | null) => void;
  addChatMessage: (message: ChatMessageInput) => void;
  clearChatHistory: () => void;
  setAISummary: (summary: AISummary | null) => void;

  // Computed
  getFilteredReports: () => PLReport[];
}

const initialFilters: PLReportFilters = {
  sortBy: "period",
  sortOrder: "desc",
};

export const usePLReportStore = create<PLReportStore>()(
  persist(
    (set, get) => ({
      // State
      reports: [],
      currentReport: null,
      isLoading: false,
      error: null,
      filters: initialFilters,
      chatHistory: [],
      aiSummary: null,

      // Actions
      fetchReports: async () => {
        set({ isLoading: true, error: null });
        try {
          const reports = await plReportService.getAllReports();
          set({ reports, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch reports",
            isLoading: false,
          });
        }
      },

      fetchReportById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const report = await plReportService.getReportById(id);
          set({ currentReport: report, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch report",
            isLoading: false,
          });
        }
      },

      createReport: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const newReport = await plReportService.createReport(data);
          set((state) => ({
            reports: [...state.reports, newReport],
            currentReport: newReport,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to create report",
            isLoading: false,
          });
          throw error;
        }
      },

      updateReport: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          const updatedReport = await plReportService.updateReport(id, data);
          set((state) => ({
            reports: state.reports.map((r) =>
              r.id === id ? updatedReport : r
            ),
            currentReport: updatedReport,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update report",
            isLoading: false,
          });
          throw error;
        }
      },

      deleteReport: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await plReportService.deleteReport(id);
          set((state) => ({
            reports: state.reports.filter((r) => r.id !== id),
            currentReport:
              state.currentReport?.id === id ? null : state.currentReport,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete report",
            isLoading: false,
          });
          throw error;
        }
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      clearFilters: () => {
        set({ filters: initialFilters });
      },

      setCurrentReport: (report) => {
        set({ currentReport: report, chatHistory: [], aiSummary: null });
      },

      addChatMessage: (message) => {
        set((state) => ({
          chatHistory: [
            ...state.chatHistory,
            {
              ...message,
              id: `${message.role}-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
            },
          ],
        }));
      },

      clearChatHistory: () => {
        set({ chatHistory: [] });
      },

      setAISummary: (summary) => {
        set({ aiSummary: summary });
      },

      // Computed
      getFilteredReports: () => {
        const { reports, filters } = get();
        let filtered = [...reports];

        // Filter by store
        if (filters.storeId) {
          filtered = filtered.filter((r) => r.storeId === filters.storeId);
        }

        // Filter by period range
        if (filters.startPeriod) {
          filtered = filtered.filter((r) => r.period >= filters.startPeriod!);
        }
        if (filters.endPeriod) {
          filtered = filtered.filter((r) => r.period <= filters.endPeriod!);
        }

        // Filter by revenue range
        if (filters.minRevenue !== undefined) {
          filtered = filtered.filter((r) => r.revenue >= filters.minRevenue!);
        }
        if (filters.maxRevenue !== undefined) {
          filtered = filtered.filter((r) => r.revenue <= filters.maxRevenue!);
        }

        // Sort
        if (filters.sortBy) {
          filtered.sort((a, b) => {
            const aVal = a[filters.sortBy!];
            const bVal = b[filters.sortBy!];
            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return filters.sortOrder === "asc" ? comparison : -comparison;
          });
        }

        return filtered;
      },
    }),
    {
      name: "pl-report-store",
      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
);
