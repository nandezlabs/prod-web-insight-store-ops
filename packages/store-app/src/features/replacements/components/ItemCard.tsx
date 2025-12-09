/**
 * ItemCard Component
 *
 * Displays inventory item with name, code, category badge, and photo.
 */

import { motion } from "framer-motion";
import { Check, Package } from "lucide-react";
import type { InventoryItem } from "../types";

interface ItemCardProps {
  item: InventoryItem;
  isSelected?: boolean;
  onClick: () => void;
}

/**
 * Get badge color based on category
 */
function getCategoryColor(category: string): string {
  switch (category) {
    case "Entrees":
      return "bg-red-100 text-red-700";
    case "Sides":
      return "bg-yellow-100 text-yellow-700";
    case "Beverages":
      return "bg-blue-100 text-blue-700";
    case "Desserts":
      return "bg-pink-100 text-pink-700";
    case "Add-ons":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function ItemCard({ item, isSelected = false, onClick }: ItemCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full bg-white rounded-lg border-2 p-4 text-left transition-all ${
        isSelected
          ? "border-blue-500 shadow-md"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
      whileTap={{ scale: 0.98 }}
      aria-pressed={isSelected}
      aria-label={`Select ${item.name}, code ${item.code}, ${item.category}`}
    >
      <div className="flex gap-4">
        {/* Photo or placeholder */}
        <div className="flex-shrink-0">
          {item.photoUrl ? (
            <img
              src={item.photoUrl}
              alt={item.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Item details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
              {item.name}
            </h3>

            {isSelected && (
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" aria-label="Selected" />
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2">Code: {item.code}</p>

          <div className="flex items-center gap-2">
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                item.category
              )}`}
            >
              {item.category}
            </span>

            {item.status !== "Active" && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                {item.status}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
