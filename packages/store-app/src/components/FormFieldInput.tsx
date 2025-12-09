import { FormField, ValidationError } from "../types/form";

interface FormFieldInputProps {
  field: FormField;
  value: unknown;
  error?: ValidationError;
  onChange: (value: unknown) => void;
}

export const FormFieldInput: React.FC<FormFieldInputProps> = ({
  field,
  value,
  error,
  onChange,
}) => {
  const inputId = `field-${field.id}`;
  const errorId = `error-${field.id}`;
  const descriptionId = `description-${field.id}`;

  const renderInput = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <input
            id={inputId}
            type={
              field.type === "email"
                ? "email"
                : field.type === "phone"
                ? "tel"
                : "text"
            }
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={`input ${
              error ? "border-danger-500 focus:ring-danger-500" : ""
            }`}
            aria-invalid={!!error}
            aria-describedby={`${field.description ? descriptionId : ""} ${
              error ? errorId : ""
            }`}
            aria-required={field.required}
          />
        );

      case "textarea":
        return (
          <textarea
            id={inputId}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`input resize-none ${
              error ? "border-danger-500 focus:ring-danger-500" : ""
            }`}
            aria-invalid={!!error}
            aria-describedby={`${field.description ? descriptionId : ""} ${
              error ? errorId : ""
            }`}
            aria-required={field.required}
          />
        );

      case "number":
        return (
          <input
            id={inputId}
            type="number"
            value={(value as number) || ""}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={field.placeholder}
            className={`input ${
              error ? "border-danger-500 focus:ring-danger-500" : ""
            }`}
            aria-invalid={!!error}
            aria-describedby={`${field.description ? descriptionId : ""} ${
              error ? errorId : ""
            }`}
            aria-required={field.required}
          />
        );

      case "select":
        return (
          <select
            id={inputId}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`input ${
              error ? "border-danger-500 focus:ring-danger-500" : ""
            }`}
            aria-invalid={!!error}
            aria-describedby={`${field.description ? descriptionId : ""} ${
              error ? errorId : ""
            }`}
            aria-required={field.required}
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "multiselect":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => {
              const selected =
                Array.isArray(value) && value.includes(option.value);
              return (
                <label
                  key={option.id}
                  className="flex items-center gap-3 p-3 border-2 border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors touch-target"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => {
                      const currentValues = (value as string[]) || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v) => v !== option.value);
                      onChange(newValues);
                    }}
                    className="w-6 h-6 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-base text-neutral-900">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        );

      case "radio":
        return (
          <div
            className="space-y-2"
            role="radiogroup"
            aria-labelledby={inputId}
          >
            {field.options?.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-3 p-3 border-2 border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors touch-target"
              >
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-6 h-6 text-primary-600 focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-base text-neutral-900">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <label className="flex items-center gap-3 touch-target cursor-pointer">
            <input
              id={inputId}
              type="checkbox"
              checked={(value as boolean) || false}
              onChange={(e) => onChange(e.target.checked)}
              className="w-6 h-6 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
              aria-invalid={!!error}
              aria-describedby={`${field.description ? descriptionId : ""} ${
                error ? errorId : ""
              }`}
              aria-required={field.required}
            />
            <span className="text-base text-neutral-900">{field.label}</span>
          </label>
        );

      case "date":
        return (
          <input
            id={inputId}
            type="date"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`input ${
              error ? "border-danger-500 focus:ring-danger-500" : ""
            }`}
            aria-invalid={!!error}
            aria-describedby={`${field.description ? descriptionId : ""} ${
              error ? errorId : ""
            }`}
            aria-required={field.required}
          />
        );

      case "time":
        return (
          <input
            id={inputId}
            type="time"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`input ${
              error ? "border-danger-500 focus:ring-danger-500" : ""
            }`}
            aria-invalid={!!error}
            aria-describedby={`${field.description ? descriptionId : ""} ${
              error ? errorId : ""
            }`}
            aria-required={field.required}
          />
        );

      case "datetime":
        return (
          <input
            id={inputId}
            type="datetime-local"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`input ${
              error ? "border-danger-500 focus:ring-danger-500" : ""
            }`}
            aria-invalid={!!error}
            aria-describedby={`${field.description ? descriptionId : ""} ${
              error ? errorId : ""
            }`}
            aria-required={field.required}
          />
        );

      default:
        return null;
    }
  };

  // Checkbox has label built-in
  if (field.type === "checkbox") {
    return (
      <div className="card">
        {renderInput()}
        {field.description && (
          <p id={descriptionId} className="text-sm text-neutral-600 mt-2 ml-9">
            {field.description}
          </p>
        )}
        {error && (
          <p
            id={errorId}
            className="text-sm text-danger-600 mt-2 ml-9"
            role="alert"
          >
            {error.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <label
        htmlFor={inputId}
        className="block text-lg font-medium text-neutral-900 mb-2"
      >
        {field.label}
        {field.required && (
          <span className="text-danger-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {field.description && (
        <p id={descriptionId} className="text-sm text-neutral-600 mb-3">
          {field.description}
        </p>
      )}

      {renderInput()}

      {error && (
        <p id={errorId} className="text-sm text-danger-600 mt-2" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
};
