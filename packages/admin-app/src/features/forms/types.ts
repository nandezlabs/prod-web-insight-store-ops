// Form Schema Types
export interface FormSchema {
  formId: string;
  title: string;
  type: "Opening" | "Daily" | "Weekly" | "Period" | "Custom";
  sections: FormSection[];
  status: "Active" | "Draft" | "Archived";
  createdAt?: string;
  updatedAt?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  order: number;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  validation?: FieldValidation;
  showIf?: ConditionalLogic[];
  helpText?: string;
  order: number;
}

export type FieldType =
  | "checkbox"
  | "text"
  | "number"
  | "time"
  | "photo"
  | "signature"
  | "heading"
  | "divider";

export interface FieldValidation {
  min?: number;
  max?: number;
  maxLength?: number;
  alert?: string;
}

export interface ConditionalLogic {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than";
  value: any;
}

// Field Library Item
export interface FieldLibraryItem {
  type: FieldType;
  label: string;
  icon: string;
  description: string;
}

// Form Builder State
export interface FormBuilderState {
  currentForm: FormSchema | null;
  selectedField: FormField | null;
  selectedSection: FormSection | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: string | null;
}

// Form List Item
export interface FormListItem {
  formId: string;
  title: string;
  type: FormSchema["type"];
  status: FormSchema["status"];
  lastModified: string;
  fieldCount?: number;
  responseCount?: number;
}

// Notion Integration
export interface NotionFormPage {
  formTitle: string;
  formId: string;
  formType: FormSchema["type"];
  schemaJson: string;
  section: string;
  status: FormSchema["status"];
  lastModified: string;
}
