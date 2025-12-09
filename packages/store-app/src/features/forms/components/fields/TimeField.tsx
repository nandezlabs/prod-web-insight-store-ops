import { Clock } from "lucide-react";

interface TimeFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function TimeField({
  id,
  label,
  value = "",
  onChange,
  error,
  disabled = false,
}: TimeFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-lg font-medium text-gray-900">
        {label}
      </label>

      <div className="relative">
        {/* Clock icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Clock className="w-5 h-5 text-gray-400" />
        </div>

        {/* Time input - native picker with good mobile support */}
        <input
          id={id}
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full pl-12 pr-4 py-3 text-lg rounded-lg border-2
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            ${error ? "border-red-500" : "border-gray-300"}
          `}
        />
      </div>

      {/* Error message */}
      {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
    </div>
  );
}
