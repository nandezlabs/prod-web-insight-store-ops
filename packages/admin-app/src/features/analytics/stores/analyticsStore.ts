import { create } from "zustand";
import { persist } from "zustand/middleware";
import { subDays } from "date-fns";
import { analyticsService } from "../services/analyticsService";
import type { AnalyticsFilters, DateRange, AnalyticsState } from "../types";

interface AnalyticsStore extends AnalyticsState {
  // Actions
  fetchAnalytics: () => Promise<void>;
  setDateRange: (range: DateRange) => void;
  setDateRangePreset: (preset: string) => void;
  setStoreFilter: (storeIds: string[]) => void;
  setChecklistTypeFilter: (types: string[]) => void;
  clearFilters: () => void;
  refreshData: () => Promise<void>;
}

const defaultDateRange: DateRange = {
  startDate: subDays(new Date(), 30),
  endDate: new Date(),
  label: "Last 30 days",
};

const initialFilters: AnalyticsFilters = {
  dateRange: defaultDateRange,
};

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set, get) => ({
      // State
      data: null,
      isLoading: false,
      error: null,
      filters: initialFilters,

      // Actions
      fetchAnalytics: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await analyticsService.getAnalyticsData(get().filters);
          set({ data, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch analytics",
            isLoading: false,
          });
        }
      },

      setDateRange: (range) => {
        set((state) => ({
          filters: { ...state.filters, dateRange: range },
        }));
        get().fetchAnalytics();
      },

      setDateRangePreset: (preset) => {
        const range = analyticsService.getDateRangePreset(preset);
        set((state) => ({
          filters: { ...state.filters, dateRange: range },
        }));
        get().fetchAnalytics();
      },

      setStoreFilter: (storeIds) => {
        set((state) => ({
          filters: {
            ...state.filters,
            storeIds: storeIds.length > 0 ? storeIds : undefined,
          },
        }));
        get().fetchAnalytics();
      },

      setChecklistTypeFilter: (types) => {
        set((state) => ({
          filters: {
            ...state.filters,
            checklistTypes: types.length > 0 ? types : undefined,
          },
        }));
        get().fetchAnalytics();
      },

      clearFilters: () => {
        set({ filters: initialFilters });
        get().fetchAnalytics();
      },

      refreshData: async () => {
        await get().fetchAnalytics();
      },
    }),
    {
      name: "analytics-store",
      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
);
