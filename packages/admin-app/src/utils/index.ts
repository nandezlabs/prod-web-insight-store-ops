import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Re-export utilities from shared package
export {
  formatCurrency,
  formatDate,
  formatPercent,
  formatNumber,
  formatPhone,
  truncate,
  capitalize,
  toTitleCase,
  getInitials,
} from "@insight/shared-utils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
