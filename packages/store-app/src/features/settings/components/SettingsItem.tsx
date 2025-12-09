// SettingsItem Component - Individual setting row
// CONTEXT: Render different types of settings items (button, toggle, select, info)

import { ChevronRight } from "lucide-react";
import type { SettingsItem as SettingsItemType } from "../types";

interface SettingsItemProps {
  item: SettingsItemType;
  onToggle?: (id: string, value: boolean) => void;
}

/**
 * Individual settings item supporting:
 * - Button: Clickable action
 * - Toggle: Switch on/off
 * - Select: Opens selection (future)
 * - Info: Read-only display
 */
export function SettingsItem({ item, onToggle }: SettingsItemProps) {
  const {
    id,
    label,
    value,
    type,
    icon: Icon,
    action,
    disabled,
    destructive,
  } = item;

  const handleClick = () => {
    if (disabled) return;
    if (action) action();
  };

  const handleToggle = () => {
    if (disabled) return;
    const currentValue = value === "true";
    onToggle?.(id, !currentValue);
  };

  // Base styles
  const baseStyles =
    "flex items-center justify-between px-4 py-3 transition-colors";
  const interactiveStyles = disabled
    ? "opacity-50 cursor-not-allowed"
    : "hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer";
  const destructiveStyles =
    destructive && !disabled
      ? "text-red-600 dark:text-red-400"
      : "text-gray-900 dark:text-gray-100";

  if (type === "info") {
    return (
      <div className={`${baseStyles} cursor-default`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {Icon && (
            <Icon
              className="w-5 h-5 text-gray-400 flex-shrink-0"
              aria-hidden="true"
            />
          )}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {label}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-2">
          {value}
        </span>
      </div>
    );
  }

  if (type === "toggle") {
    const isOn = value === "true";

    return (
      <div className={`${baseStyles} ${disabled ? "opacity-50" : ""}`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {Icon && (
            <Icon
              className="w-5 h-5 text-gray-400 flex-shrink-0"
              aria-hidden="true"
            />
          )}
          <span className={`text-sm ${destructiveStyles}`}>{label}</span>
        </div>
        <button
          onClick={handleToggle}
          disabled={disabled}
          role="switch"
          aria-checked={isOn}
          aria-label={label}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed ${
            isOn ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isOn ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    );
  }

  if (type === "select") {
    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`${baseStyles} ${interactiveStyles}`}
        aria-label={label}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {Icon && (
            <Icon
              className="w-5 h-5 text-gray-400 flex-shrink-0"
              aria-hidden="true"
            />
          )}
          <span className={`text-sm ${destructiveStyles}`}>{label}</span>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {value}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
        </div>
      </button>
    );
  }

  // Button type
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseStyles} ${interactiveStyles}`}
      aria-label={label}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && (
          <Icon
            className={`w-5 h-5 flex-shrink-0 ${
              destructive ? "text-red-600 dark:text-red-400" : "text-gray-400"
            }`}
            aria-hidden="true"
          />
        )}
        <span className={`text-sm ${destructiveStyles}`}>{label}</span>
      </div>
      {value && (
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
          {value}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-gray-400 ml-2" aria-hidden="true" />
    </button>
  );
}
