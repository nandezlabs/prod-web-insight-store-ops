interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  disabled?: boolean;
}

export function TextField({
  id,
  label,
  value = "",
  onChange,
  error,
  placeholder,
  maxLength,
  multiline = false,
  disabled = false,
}: TextFieldProps) {
  const Component = multiline ? "textarea" : "input";

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-lg font-medium text-gray-900">
        {label}
      </label>

      <Component
        id={id}
        type={multiline ? undefined : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        rows={multiline ? 4 : undefined}
        className={`
          w-full px-4 py-3 text-lg rounded-lg border-2
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${error ? "border-red-500" : "border-gray-300"}
          ${multiline ? "resize-none" : ""}
        `}
      />

      {/* Character counter */}
      {maxLength && (
        <div className="flex justify-between text-sm">
          <span
            className={
              value.length > maxLength ? "text-red-600" : "text-gray-500"
            }
          >
            {value.length} / {maxLength} characters
          </span>
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
    </div>
  );
}
