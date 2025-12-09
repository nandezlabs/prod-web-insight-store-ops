/**
 * ItemSearch Component
 *
 * Search bar with category filter and item list.
 * Shows recently selected items at top.
 */

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { ItemCard } from "./ItemCard";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { EmptyState } from "../../../components/EmptyState";
import type { InventoryItem, ItemCategory } from "../types";

interface ItemSearchProps {
  items: InventoryItem[];
  recentItems: InventoryItem[];
  selectedItem: InventoryItem | null;
  onSelect: (item: InventoryItem) => void;
  isLoading?: boolean;
}

const CATEGORIES: (ItemCategory | "All")[] = [
  "All",
  "Entrees",
  "Sides",
  "Beverages",
  "Desserts",
  "Add-ons",
];

export function ItemSearch({
  items,
  recentItems,
  selectedItem,
  onSelect,
  isLoading = false,
}: ItemSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ItemCategory | "All"
  >("All");

  // Filter items
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.code.toLowerCase().includes(query)
      );
    }

    // Sort alphabetically
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [items, selectedCategory, searchQuery]);

  // Filter recent items that match current filters
  const filteredRecentItems = useMemo(() => {
    return recentItems.filter((item) =>
      filteredItems.some((fi) => fi.id === item.id)
    );
  }, [recentItems, filteredItems]);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or code..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search inventory items"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg border whitespace-nowrap transition-colors min-h-[48px] ${
                selectedCategory === category
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              aria-pressed={selectedCategory === category}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Recent items */}
      {!isLoading && filteredRecentItems.length > 0 && !searchQuery && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Recently Selected
          </h3>
          <div className="space-y-2">
            {filteredRecentItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isSelected={selectedItem?.id === item.id}
                onClick={() => onSelect(item)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All items */}
      {!isLoading && filteredItems.length > 0 && (
        <div>
          {filteredRecentItems.length > 0 && !searchQuery && (
            <h3 className="text-sm font-medium text-gray-700 mb-3 mt-6">
              All Items
            </h3>
          )}
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isSelected={selectedItem?.id === item.id}
                onClick={() => onSelect(item)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredItems.length === 0 && (
        <EmptyState
          icon={Search}
          title="No items found"
          description={
            searchQuery
              ? `No items match "${searchQuery}"`
              : "No items in this category"
          }
          action={
            searchQuery
              ? {
                  label: "Clear search",
                  onClick: () => setSearchQuery(""),
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
