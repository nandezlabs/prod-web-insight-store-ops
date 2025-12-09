// Inventory Types

export type InventoryStatus = "Active" | "Pending Delete" | "Discontinued";

export type InventoryCategory =
  | "Protein"
  | "Vegetables"
  | "Grains"
  | "Sauces"
  | "Toppings"
  | "Beverages"
  | "Packaging"
  | "Supplies";

export type InventoryType =
  | "Entree"
  | "Bowl"
  | "Sides"
  | "Appetizer"
  | "Dessert"
  | "Beverage"
  | "Ingredient"
  | "Supply";

export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: InventoryCategory;
  type: InventoryType;
  description?: string;
  photoUrl?: string;
  status: InventoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryFilters {
  search: string;
  categories: InventoryCategory[];
  types: InventoryType[];
  status: "all" | InventoryStatus;
}

export interface BulkAction {
  type: "delete" | "changeStatus" | "export";
  itemIds: string[];
  newStatus?: InventoryStatus;
}

export interface CSVImportRow {
  name: string;
  code: string;
  category: string;
  type: string;
  description?: string;
  status?: string;
}

export interface ImportValidationError {
  row: number;
  field: string;
  message: string;
}

export interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  filters: InventoryFilters;
  selectedItems: string[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}
