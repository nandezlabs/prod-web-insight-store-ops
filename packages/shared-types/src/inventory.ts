/**
 * Inventory Types
 */

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku?: string;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number;
  unit: string;
  price?: number;
  status: StockStatus;
  lastUpdated: string;
  storeId?: string;
}

export interface InventoryFilters {
  category?: string;
  status?: StockStatus;
  searchTerm?: string;
}

export interface InventoryUpdateRequest {
  itemId: string;
  quantity: number;
  reason?: string;
  updatedBy: string;
}
