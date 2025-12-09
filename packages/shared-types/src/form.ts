/**
 * Form Types
 */

export type FieldType =
  | "text"
  | "number"
  | "email"
  | "checkbox"
  | "radio"
  | "select"
  | "textarea"
  | "date"
  | "time"
  | "photo"
  | "signature";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  defaultValue?: any;
  order: number;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  status: "active" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version?: number;
}

export interface FormResponse {
  id: string;
  formId: string;
  formTitle: string;
  responses: Record<string, any>;
  submittedBy: string;
  submittedAt: string;
  storeId?: string;
  storeName?: string;
  status: "pending" | "approved" | "rejected";
  photos?: string[];
  signature?: string;
}

export interface DynamicFormField extends FormField {
  value?: any;
  error?: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
