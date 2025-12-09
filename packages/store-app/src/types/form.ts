/**
 * Form type definitions for dynamic forms rendered from Notion schema
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "phone"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "date"
  | "time"
  | "datetime";

export interface ValidationRule {
  type: "required" | "min" | "max" | "pattern" | "custom";
  value?: string | number;
  message: string;
  validator?: (value: unknown) => boolean;
}

export interface FieldOption {
  id: string;
  label: string;
  value: string;
  color?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  validation?: ValidationRule[];
  defaultValue?: unknown;
  dependsOn?: {
    fieldId: string;
    condition: (value: unknown) => boolean;
  };
}

export interface FormDefinition {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  userId: string;
  data: Record<string, unknown>;
  status: "draft" | "submitted" | "synced";
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  syncedAt?: string;
}

export interface ValidationError {
  fieldId: string;
  message: string;
}

export interface DynamicFormProps {
  formId: string;
  onSubmit: (response: FormResponse) => void | Promise<void>;
  onAutoSave?: (response: FormResponse) => void | Promise<void>;
  initialData?: Record<string, unknown>;
  mode?: "progressive" | "all-at-once";
  autoSaveInterval?: number;
}

export interface FormState {
  currentFieldIndex: number;
  responses: Record<string, unknown>;
  errors: ValidationError[];
  isSubmitting: boolean;
  isSaving: boolean;
  lastSaved?: Date;
}
