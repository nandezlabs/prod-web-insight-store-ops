import { FormField, ValidationRule, ValidationError } from "../types/form";

/**
 * Validate a single field value against its validation rules
 */
export function validateField(
  field: FormField,
  value: unknown
): ValidationError | null {
  // Check required
  if (
    field.required &&
    (value === undefined || value === null || value === "")
  ) {
    return {
      fieldId: field.id,
      message:
        field.validation?.find((r) => r.type === "required")?.message ||
        `${field.label} is required`,
    };
  }

  // If no value and not required, skip other validations
  if (!value && !field.required) {
    return null;
  }

  // Check validation rules
  if (field.validation) {
    for (const rule of field.validation) {
      const error = validateRule(field, value, rule);
      if (error) {
        return error;
      }
    }
  }

  return null;
}

/**
 * Validate a single validation rule
 */
function validateRule(
  field: FormField,
  value: unknown,
  rule: ValidationRule
): ValidationError | null {
  switch (rule.type) {
    case "required":
      // Already handled in validateField
      return null;

    case "min":
      if (typeof value === "string" || typeof value === "number") {
        const numValue = typeof value === "string" ? value.length : value;
        if (rule.value !== undefined && numValue < Number(rule.value)) {
          return { fieldId: field.id, message: rule.message };
        }
      }
      return null;

    case "max":
      if (typeof value === "string" || typeof value === "number") {
        const numValue = typeof value === "string" ? value.length : value;
        if (rule.value !== undefined && numValue > Number(rule.value)) {
          return { fieldId: field.id, message: rule.message };
        }
      }
      return null;

    case "pattern":
      if (typeof value === "string" && rule.value) {
        const regex = new RegExp(String(rule.value));
        if (!regex.test(value)) {
          return { fieldId: field.id, message: rule.message };
        }
      }
      return null;

    case "custom":
      if (rule.validator && !rule.validator(value)) {
        return { fieldId: field.id, message: rule.message };
      }
      return null;

    default:
      return null;
  }
}

/**
 * Validate all fields in a form
 */
export function validateForm(
  fields: FormField[],
  responses: Record<string, unknown>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const field of fields) {
    // Check if field should be visible based on dependencies
    if (field.dependsOn) {
      const dependencyValue = responses[field.dependsOn.fieldId];
      if (!field.dependsOn.condition(dependencyValue)) {
        continue; // Skip validation for hidden fields
      }
    }

    const error = validateField(field, responses[field.id]);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}

/**
 * Check if a field should be visible based on dependencies
 */
export function isFieldVisible(
  field: FormField,
  responses: Record<string, unknown>
): boolean {
  if (!field.dependsOn) {
    return true;
  }

  const dependencyValue = responses[field.dependsOn.fieldId];
  return field.dependsOn.condition(dependencyValue);
}
