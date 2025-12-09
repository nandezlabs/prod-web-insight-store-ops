import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@insight/ui";
import type {
  InventoryCategory,
  InventoryType,
  InventoryStatus,
} from "../types";
import { useInventoryStore } from "../store/inventoryStore";

const CATEGORIES: InventoryCategory[] = [
  "Protein",
  "Vegetables",
  "Grains",
  "Sauces",
  "Toppings",
  "Beverages",
  "Packaging",
  "Supplies",
];

const TYPES: InventoryType[] = [
  "Entree",
  "Bowl",
  "Sides",
  "Appetizer",
  "Dessert",
  "Beverage",
  "Ingredient",
  "Supply",
];

export const InventoryFilters: React.FC = () => {
  const { filters, setFilters, clearFilters } = useInventoryStore();

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories.length > 0) count++;
    if (filters.types.length > 0) count++;
    if (filters.status !== "all") count++;
    return count;
  }, [filters]);

  const handleCategoryToggle = (category: InventoryCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    setFilters({ categories: newCategories });
  };

  const handleTypeToggle = (type: InventoryType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    setFilters({ types: newTypes });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder="Search by name or code..."
            className="pl-10"
          />
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X size={16} />
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ status: e.target.value as "all" | InventoryStatus })
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Discontinued">Discontinued</option>
            <option value="Pending Delete">Pending Delete</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category{" "}
            {filters.categories.length > 0 && `(${filters.categories.length})`}
          </label>
          <div className="relative">
            <select
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              onChange={(e) => {
                if (e.target.value) {
                  handleCategoryToggle(e.target.value as InventoryCategory);
                  e.target.value = "";
                }
              }}
              value=""
            >
              <option value="">Select categories...</option>
              {CATEGORIES.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  disabled={filters.categories.includes(cat)}
                >
                  {cat} {filters.categories.includes(cat) ? "✓" : ""}
                </option>
              ))}
            </select>
          </div>
          {filters.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {filters.categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {cat}
                  <button
                    onClick={() => handleCategoryToggle(cat)}
                    className="hover:text-blue-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type {filters.types.length > 0 && `(${filters.types.length})`}
          </label>
          <div className="relative">
            <select
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              onChange={(e) => {
                if (e.target.value) {
                  handleTypeToggle(e.target.value as InventoryType);
                  e.target.value = "";
                }
              }}
              value=""
            >
              <option value="">Select types...</option>
              {TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                  disabled={filters.types.includes(type)}
                >
                  {type} {filters.types.includes(type) ? "✓" : ""}
                </option>
              ))}
            </select>
          </div>
          {filters.types.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {filters.types.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                >
                  {type}
                  <button
                    onClick={() => handleTypeToggle(type)}
                    className="hover:text-green-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
