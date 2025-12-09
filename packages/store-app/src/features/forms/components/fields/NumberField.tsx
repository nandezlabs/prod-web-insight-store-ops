import { Minus, Plus } from "lucide-react";

interface NumberFieldProps {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  error,
  min,
  max,
  step = 1,
  placeholder,
  disabled = false,
}: NumberFieldProps) {
  const handleIncrement = () => {
    const newValue = (value ?? 0) + step;
    if (max === undefined || newValue <= max) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = (value ?? 0) - step;
    if (min === undefined || newValue >= min) {
      onChange(newValue);
    }
  };

  const handleInputChange = (inputValue: string) => {
    if (inputValue === "") {
      onChange(null);
      return;
    }

    const numValue = Number(inputValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-lg font-medium text-gray-900">
        {label}
      </label>

      <div className="flex items-center gap-2">
        {/* Decrement button - 64x64px */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && (value ?? 0) <= min)}
          className="
            w-16 h-16 flex items-center justify-center
            bg-gray-200 hover:bg-gray-300 active:bg-gray-400
            rounded-lg transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <Minus className="w-6 h-6 text-gray-700" />
        </button>

        {/* Number input */}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value ?? ""}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`
            flex-1 px-4 py-3 text-lg text-center rounded-lg border-2
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            ${error ? "border-red-500" : "border-gray-300"}
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          `}
        />

        {/* Increment button - 64x64px */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && (value ?? 0) >= max)}
          className="
            w-16 h-16 flex items-center justify-center
            bg-gray-200 hover:bg-gray-300 active:bg-gray-400
            rounded-lg transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <Plus className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-600 text-sm font-medium text-center">{error}</p>
      )}
    </div>
  );
}
