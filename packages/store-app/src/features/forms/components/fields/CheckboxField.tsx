import { Check } from "lucide-react";

interface CheckboxFieldProps {
  id: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  disabled?: boolean;
}

export function CheckboxField({
  id,
  label,
  value,
  onChange,
  error,
  disabled = false,
}: CheckboxFieldProps) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        id={id}
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={`
          flex items-center gap-3 w-full p-4 rounded-lg text-left
          transition-colors
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer active:scale-[0.98]"
          }
          ${error ? "border-2 border-red-500" : "border-2 border-gray-300"}
        `}
      >
        {/* Checkbox - 48x48px touch target */}
        <div
          className={`
            min-w-[48px] min-h-[48px] w-12 h-12
            flex items-center justify-center
            rounded-lg border-2 transition-all
            ${
              value
                ? "bg-blue-600 border-blue-600"
                : error
                ? "border-red-500"
                : "border-gray-400"
            }
          `}
        >
          {value && <Check className="w-6 h-6 text-white" strokeWidth={3} />}
        </div>

        {/* Label */}
        <span className="text-lg font-medium text-gray-900 flex-1">
          {label}
        </span>
      </button>

      {/* Error message */}
      {error && (
        <p className="text-red-600 text-sm font-medium pl-4">{error}</p>
      )}
    </div>
  );
}
