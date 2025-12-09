// SettingsSection Component - Grouped settings
// CONTEXT: Display a section of related settings items

import { SettingsItem } from "./SettingsItem";
import type { SettingsSection as SettingsSectionType } from "../types";

interface SettingsSectionProps {
  section: SettingsSectionType;
  onToggle?: (id: string, value: boolean) => void;
}

/**
 * Grouped settings section with:
 * - Section title
 * - List of settings items
 * - Proper spacing and borders
 */
export function SettingsSection({ section, onToggle }: SettingsSectionProps) {
  return (
    <div className="mb-6">
      {/* Section Title */}
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider px-4 mb-3">
        {section.title}
      </h2>

      {/* Section Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {section.items.map((item) => (
          <SettingsItem key={item.id} item={item} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}
