export type FieldType =
  | "checkbox"
  | "text"
  | "number"
  | "time"
  | "photo"
  | "signature";

export interface FormValidation {
  min?: number;
  max?: number;
  alert?: string;
  maxLength?: number;
  pattern?: string;
}

export interface ShowIfCondition {
  field: string;
  value: any;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  validation?: FormValidation;
  showIf?: ShowIfCondition;
  placeholder?: string;
  helpText?: string;
  multiline?: boolean;
  maxPhotos?: number;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormSchema {
  formId: string;
  title: string;
  description?: string;
  type?: string;
  section?: string;
  sections: FormSection[];
}

export interface FormFieldValue {
  value: any;
  valid: boolean;
  error?: string;
}

export interface FormData {
  [fieldId: string]: any;
}

export interface FormValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface SavedFormState {
  formId: string;
  schemaTitle: string;
  currentSection: number;
  data: FormData;
  timestamp: number;
  completed: boolean;
}

export interface QueuedSubmission {
  id: string;
  formId: string;
  formTitle: string;
  formType: string;
  formSection: string;
  data: FormData;
  timestamp: number;
  retryCount: number;
}

export interface FormSubmissionPayload {
  checklistTitle: string;
  type: string;
  taskItems: string;
  status: string;
  completedBy: string;
  completedDate: string;
  section: string;
  photoUrls?: string[];
  signatureData?: string;
  completionPercentage: number;
}

export interface AutoSaveStatus {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved?: Date;
  error?: string;
}

export interface FormState {
  schema: FormSchema | null;
  currentSection: number;
  formData: FormData;
  validationErrors: Record<string, string>;
  autoSaveStatus: AutoSaveStatus;
  isOnline: boolean;
  queuedSubmissions: QueuedSubmission[];
  isSubmitting: boolean;
}
