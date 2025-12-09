import { create } from "zustand";
import type { InventoryItem, InventoryFilters, InventoryState } from "../types";
import { inventoryService } from "../services/inventoryService";

interface InventoryStore extends InventoryState {
  // Data actions
  fetchItems: () => Promise<void>;
  createItem: (
    item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  // Filter actions
  setFilters: (filters: Partial<InventoryFilters>) => void;
  clearFilters: () => void;

  // Selection actions
  toggleSelectItem: (id: string) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;

  // Bulk actions
  bulkDelete: () => Promise<void>;
  bulkUpdateStatus: (status: InventoryItem["status"]) => Promise<void>;
  bulkExport: () => void;

  // Pagination
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Computed
  getFilteredItems: () => InventoryItem[];
  getPaginatedItems: () => InventoryItem[];
}

const defaultFilters: InventoryFilters = {
  search: "",
  categories: [],
  types: [],
  status: "all",
};

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  filters: defaultFilters,
  selectedItems: [],
  totalCount: 0,
  currentPage: 1,
  pageSize: 50,

  /**
   * Fetch all inventory items
   */
  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await inventoryService.getAllItems();
      set({
        items,
        totalCount: items.length,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch items",
        isLoading: false,
      });
    }
  },

  /**
   * Create new item
   */
  createItem: async (item) => {
    set({ isLoading: true, error: null });
    try {
      const newItem = await inventoryService.createItem(item);
      set((state) => ({
        items: [...state.items, newItem],
        totalCount: state.totalCount + 1,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create item",
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Update existing item
   */
  updateItem: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedItem = await inventoryService.updateItem(id, updates);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updatedItem : item)),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update item",
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Delete item (soft delete)
   */
  deleteItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await inventoryService.deleteItem(id);
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, status: "Pending Delete" as const } : item
        ),
        selectedItems: state.selectedItems.filter((itemId) => itemId !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete item",
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Set filters
   */
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      currentPage: 1, // Reset to first page on filter change
    }));
  },

  /**
   * Clear all filters
   */
  clearFilters: () => {
    set({
      filters: defaultFilters,
      currentPage: 1,
    });
  },

  /**
   * Toggle item selection
   */
  toggleSelectItem: (id) => {
    set((state) => ({
      selectedItems: state.selectedItems.includes(id)
        ? state.selectedItems.filter((itemId) => itemId !== id)
        : [...state.selectedItems, id],
    }));
  },

  /**
   * Toggle select all items
   */
  toggleSelectAll: () => {
    const { selectedItems, getPaginatedItems } = get();
    const paginatedItems = getPaginatedItems();
    const allSelected = paginatedItems.every((item) =>
      selectedItems.includes(item.id)
    );

    if (allSelected) {
      // Deselect all on current page
      set((state) => ({
        selectedItems: state.selectedItems.filter(
          (id) => !paginatedItems.find((item) => item.id === id)
        ),
      }));
    } else {
      // Select all on current page
      set((state) => ({
        selectedItems: [
          ...state.selectedItems,
          ...paginatedItems
            .map((item) => item.id)
            .filter((id) => !state.selectedItems.includes(id)),
        ],
      }));
    }
  },

  /**
   * Clear selection
   */
  clearSelection: () => {
    set({ selectedItems: [] });
  },

  /**
   * Bulk delete selected items
   */
  bulkDelete: async () => {
    const { selectedItems } = get();
    if (selectedItems.length === 0) return;

    set({ isLoading: true, error: null });
    try {
      await inventoryService.bulkDelete(selectedItems);
      set((state) => ({
        items: state.items.map((item) =>
          selectedItems.includes(item.id)
            ? { ...item, status: "Pending Delete" as const }
            : item
        ),
        selectedItems: [],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to bulk delete",
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Bulk update status
   */
  bulkUpdateStatus: async (status) => {
    const { selectedItems } = get();
    if (selectedItems.length === 0) return;

    set({ isLoading: true, error: null });
    try {
      await inventoryService.bulkUpdateStatus(selectedItems, status);
      set((state) => ({
        items: state.items.map((item) =>
          selectedItems.includes(item.id) ? { ...item, status } : item
        ),
        selectedItems: [],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to bulk update",
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Export selected items
   */
  bulkExport: () => {
    const { selectedItems, items } = get();
    const itemsToExport =
      selectedItems.length > 0
        ? items.filter((item) => selectedItems.includes(item.id))
        : items;

    inventoryService.exportToCSV(itemsToExport);
    set({ selectedItems: [] });
  },

  /**
   * Set current page
   */
  setPage: (page) => {
    set({ currentPage: page });
  },

  /**
   * Set page size
   */
  setPageSize: (size) => {
    set({ pageSize: size, currentPage: 1 });
  },

  /**
   * Get filtered items
   */
  getFilteredItems: () => {
    const { items, filters } = get();

    return items.filter((item) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          item.name.toLowerCase().includes(searchLower) ||
          item.code.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(item.category)) return false;
      }

      // Type filter
      if (filters.types.length > 0) {
        if (!filters.types.includes(item.type)) return false;
      }

      // Status filter
      if (filters.status !== "all") {
        if (item.status !== filters.status) return false;
      }

      return true;
    });
  },

  /**
   * Get paginated items
   */
  getPaginatedItems: () => {
    const { getFilteredItems, currentPage, pageSize } = get();
    const filtered = getFilteredItems();

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return filtered.slice(startIndex, endIndex);
  },
}));
