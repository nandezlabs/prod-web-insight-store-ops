/**
 * Checklist Store
 *
 * Zustand store for managing checklist history state,
 * including filters, pagination, and data loading.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChecklistState, ChecklistFilters } from "../types";
import { DEFAULT_FILTERS, PAGE_SIZE } from "../types";
import {
  fetchChecklists,
  fetchChecklistDetail,
} from "../services/checklistService";

/**
 * Calculate number of active filters
 */
function countActiveFilters(filters: ChecklistFilters): number {
  let count = 0;

  if (filters.types.length > 0) count++;
  if (filters.dateRange !== "Last 30 days") count++; // Default is Last 30 days
  if (filters.statuses.length > 0) count++;
  if (filters.completedByUsers.length > 0) count++;
  if (filters.searchQuery) count++;

  return count;
}

export const useChecklistStore = create<ChecklistState>()(
  persist(
    (set, get) => ({
      // Data
      checklists: [],
      selectedChecklist: null,

      // UI State
      filters: DEFAULT_FILTERS,
      pagination: {
        page: 1,
        pageSize: PAGE_SIZE,
        hasMore: false,
        total: 0,
      },
      isLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      error: null,
      activeFilterCount: 0,

      // Actions
      fetchChecklists: async (reset = false) => {
        const state = get();

        // Don't fetch if already loading
        if (state.isLoading || state.isRefreshing) return;

        set({
          isLoading: reset,
          isRefreshing: !reset,
          error: null,
        });

        try {
          const page = reset ? 1 : state.pagination.page;
          const result = await fetchChecklists(state.filters, page, PAGE_SIZE);

          set({
            checklists: reset
              ? result.checklists
              : [...state.checklists, ...result.checklists],
            pagination: {
              page,
              pageSize: PAGE_SIZE,
              hasMore: result.hasMore,
              total: result.total,
            },
            isLoading: false,
            isRefreshing: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load checklists",
            isLoading: false,
            isRefreshing: false,
          });
        }
      },

      fetchChecklistDetail: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const checklist = await fetchChecklistDetail(id);

          set({
            selectedChecklist: checklist,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load checklist detail",
            isLoading: false,
          });
        }
      },

      loadMore: async () => {
        const state = get();

        // Don't load more if already loading or no more items
        if (state.isLoadingMore || !state.pagination.hasMore) return;

        set({ isLoadingMore: true, error: null });

        try {
          const nextPage = state.pagination.page + 1;
          const result = await fetchChecklists(
            state.filters,
            nextPage,
            PAGE_SIZE
          );

          set({
            checklists: [...state.checklists, ...result.checklists],
            pagination: {
              page: nextPage,
              pageSize: PAGE_SIZE,
              hasMore: result.hasMore,
              total: result.total,
            },
            isLoadingMore: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load more checklists",
            isLoadingMore: false,
          });
        }
      },

      refresh: async () => {
        await get().fetchChecklists(true);
      },

      setFilters: (newFilters: Partial<ChecklistFilters>) => {
        const state = get();
        const updatedFilters = { ...state.filters, ...newFilters };

        set({
          filters: updatedFilters,
          activeFilterCount: countActiveFilters(updatedFilters),
        });

        // Reset pagination and fetch with new filters
        set({ pagination: { ...state.pagination, page: 1 } });
        get().fetchChecklists(true);
      },

      resetFilters: () => {
        set({
          filters: DEFAULT_FILTERS,
          activeFilterCount: 0,
        });

        // Reset pagination and fetch
        const state = get();
        set({ pagination: { ...state.pagination, page: 1 } });
        get().fetchChecklists(true);
      },

      setSearchQuery: (query: string) => {
        get().setFilters({ searchQuery: query });
      },

      clearError: () => {
        set({ error: null });
      },

      closeDetail: () => {
        set({ selectedChecklist: null });
      },
    }),
    {
      name: "checklist-store",
      partialize: (state) => ({
        // Only persist filters, not the actual data
        filters: state.filters,
      }),
    }
  )
);
