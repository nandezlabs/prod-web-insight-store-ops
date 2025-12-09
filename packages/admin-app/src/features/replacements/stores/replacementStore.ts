import { create } from "zustand";
import { persist } from "zustand/middleware";
import { replacementService } from "../services/replacementService";
import type {
  ReplacementRequest,
  ReplacementPriority,
  ReplacementFilters,
  ReplacementState,
  ApprovalAction,
} from "../types";

interface ReplacementStore extends ReplacementState {
  // Actions
  fetchRequests: () => Promise<void>;
  setFilters: (filters: Partial<ReplacementFilters>) => void;
  clearFilters: () => void;
  selectRequest: (id: string) => void;
  deselectRequest: (id: string) => void;
  selectAll: (requests: ReplacementRequest[]) => void;
  deselectAll: () => void;
  setCurrentRequest: (request: ReplacementRequest | null) => void;
  approveRequest: (action: ApprovalAction) => Promise<void>;
  rejectRequest: (action: ApprovalAction) => Promise<void>;
  updatePriority: (id: string, priority: ReplacementPriority) => Promise<void>;
  addAdminNote: (id: string, note: string) => Promise<void>;
  bulkApprove: (requestIds: string[], adminNote: string) => Promise<void>;

  // Computed
  getFilteredRequests: () => ReplacementRequest[];
  getRequestById: (id: string) => ReplacementRequest | undefined;
}

const initialFilters: ReplacementFilters = {
  status: "All",
  sortBy: "priority",
  sortOrder: "desc",
};

export const useReplacementStore = create<ReplacementStore>()(
  persist(
    (set, get) => ({
      // State
      requests: [],
      isLoading: false,
      error: null,
      filters: initialFilters,
      selectedRequests: [],
      currentRequest: null,

      // Actions
      fetchRequests: async () => {
        set({ isLoading: true, error: null });
        try {
          const requests = await replacementService.getAllRequests();
          set({ requests, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch requests",
            isLoading: false,
          });
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

      selectRequest: (id) => {
        set((state) => ({
          selectedRequests: [...state.selectedRequests, id],
        }));
      },

      deselectRequest: (id) => {
        set((state) => ({
          selectedRequests: state.selectedRequests.filter(
            (reqId) => reqId !== id
          ),
        }));
      },

      selectAll: (requests) => {
        set({ selectedRequests: requests.map((r) => r.id) });
      },

      deselectAll: () => {
        set({ selectedRequests: [] });
      },

      setCurrentRequest: (request) => {
        set({ currentRequest: request });
      },

      approveRequest: async (action) => {
        set({ isLoading: true, error: null });
        try {
          const updatedRequest = await replacementService.approveRequest(
            action
          );

          set((state) => ({
            requests: state.requests.map((r) =>
              r.id === action.requestId ? updatedRequest : r
            ),
            currentRequest:
              state.currentRequest?.id === action.requestId
                ? updatedRequest
                : state.currentRequest,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to approve request",
            isLoading: false,
          });
          throw error;
        }
      },

      rejectRequest: async (action) => {
        set({ isLoading: true, error: null });
        try {
          const updatedRequest = await replacementService.rejectRequest(action);

          set((state) => ({
            requests: state.requests.map((r) =>
              r.id === action.requestId ? updatedRequest : r
            ),
            currentRequest:
              state.currentRequest?.id === action.requestId
                ? updatedRequest
                : state.currentRequest,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to reject request",
            isLoading: false,
          });
          throw error;
        }
      },

      updatePriority: async (id, priority) => {
        set({ isLoading: true, error: null });
        try {
          const updatedRequest = await replacementService.updatePriority(
            id,
            priority
          );

          set((state) => ({
            requests: state.requests.map((r) =>
              r.id === id ? updatedRequest : r
            ),
            currentRequest:
              state.currentRequest?.id === id
                ? updatedRequest
                : state.currentRequest,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update priority",
            isLoading: false,
          });
          throw error;
        }
      },

      addAdminNote: async (id, note) => {
        set({ isLoading: true, error: null });
        try {
          const updatedRequest = await replacementService.addAdminNote(
            id,
            note
          );

          set((state) => ({
            requests: state.requests.map((r) =>
              r.id === id ? updatedRequest : r
            ),
            currentRequest:
              state.currentRequest?.id === id
                ? updatedRequest
                : state.currentRequest,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to add note",
            isLoading: false,
          });
          throw error;
        }
      },

      bulkApprove: async (requestIds, adminNote) => {
        set({ isLoading: true, error: null });
        try {
          await replacementService.bulkApprove(requestIds, adminNote);

          // Refresh all requests
          const requests = await replacementService.getAllRequests();
          set({
            requests,
            selectedRequests: [],
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to bulk approve",
            isLoading: false,
          });
          throw error;
        }
      },

      // Computed
      getFilteredRequests: () => {
        const { requests, filters } = get();
        let filtered = [...requests];

        // Filter by status
        if (filters.status && filters.status !== "All") {
          filtered = filtered.filter((r) => r.status === filters.status);
        }

        // Filter by store
        if (filters.storeId) {
          filtered = filtered.filter((r) => r.storeId === filters.storeId);
        }

        // Filter by priority
        if (filters.priority) {
          filtered = filtered.filter((r) => r.priority === filters.priority);
        }

        // Sort
        const priorityOrder: Record<ReplacementPriority, number> = {
          Urgent: 4,
          High: 3,
          Medium: 2,
          Low: 1,
        };

        filtered.sort((a, b) => {
          let comparison = 0;

          if (filters.sortBy === "priority") {
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          } else if (filters.sortBy === "date") {
            comparison =
              new Date(a.requestDate).getTime() -
              new Date(b.requestDate).getTime();
          } else if (filters.sortBy === "store") {
            comparison = a.storeName.localeCompare(b.storeName);
          }

          return filters.sortOrder === "asc" ? comparison : -comparison;
        });

        return filtered;
      },

      getRequestById: (id) => {
        return get().requests.find((r) => r.id === id);
      },
    }),
    {
      name: "replacement-store",
      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
);
