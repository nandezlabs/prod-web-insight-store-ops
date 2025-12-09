/**
 * Replacement Request Feature - Type Definitions
 *
 * Defines all TypeScript interfaces for requesting menu item replacements.
 */

export type ReplacementPriority = "Low" | "Medium" | "High" | "Urgent";
export type RequestStatus =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Implemented";
export type ItemCategory =
  | "Entrees"
  | "Sides"
  | "Beverages"
  | "Desserts"
  | "Add-ons";
export type ReasonType =
  | "Low sales"
  | "Customer complaints"
  | "Quality issues"
  | "Seasonal change"
  | "Other";

/**
 * Inventory item from menu database
 */
export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: ItemCategory;
  type: string;
  status: "Active" | "Inactive" | "Seasonal";
  photoUrl?: string;
  description?: string;
}

/**
 * Replacement request data
 */
export interface ReplacementRequest {
  id?: string;
  originalItem: string; // Item name
  originalItemId: string; // Item ID
  suggestedReplacement?: string; // Item name
  suggestedReplacementId?: string; // Item ID
  reasons: ReasonType[];
  additionalNotes: string;
  photoUrls: string[];
  priority: ReplacementPriority;
  status: RequestStatus;
  requestedBy: string; // Store ID
  requestedByName: string; // Store name
  requestDate: string; // ISO string
  adminNotes?: string;
  reviewedBy?: string;
  reviewedDate?: string;
}

/**
 * Form step in the wizard
 */
export interface FormStep {
  id: number;
  title: string;
  description: string;
  isComplete: boolean;
  isValid: boolean;
}

/**
 * Draft state for auto-save
 */
export interface ReplacementDraft {
  currentStep: number;
  originalItem: InventoryItem | null;
  suggestedReplacement: InventoryItem | null;
  reasons: ReasonType[];
  additionalNotes: string;
  photoUrls: string[];
  photos: File[]; // Local files before upload
  priority: ReplacementPriority;
  lastSaved: string; // ISO string
}

/**
 * Store state
 */
export interface ReplacementState {
  // Form state
  draft: ReplacementDraft;
  currentStep: number;

  // Inventory items
  inventoryItems: InventoryItem[];
  recentItems: InventoryItem[];

  // User's requests
  userRequests: ReplacementRequest[];
  selectedRequest: ReplacementRequest | null;

  // UI state
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;

  // Draft actions
  setOriginalItem: (item: InventoryItem | null) => void;
  setSuggestedReplacement: (item: InventoryItem | null) => void;
  setReasons: (reasons: ReasonType[]) => void;
  setAdditionalNotes: (notes: string) => void;
  addPhoto: (file: File) => void;
  removePhoto: (index: number) => void;
  setPriority: (priority: ReplacementPriority) => void;

  // Data actions
  fetchInventoryItems: () => Promise<void>;
  fetchUserRequests: () => Promise<void>;
  submitRequest: () => Promise<void>;

  // Draft persistence
  saveDraft: () => void;
  loadDraft: () => void;
  clearDraft: () => void;

  // Utility
  validateCurrentStep: () => boolean;
  clearError: () => void;
  selectRequest: (request: ReplacementRequest | null) => void;
}

/**
 * Predefined reason options
 */
export const REASON_OPTIONS: ReasonType[] = [
  "Low sales",
  "Customer complaints",
  "Quality issues",
  "Seasonal change",
  "Other",
];

/**
 * Form step configuration
 */
export const FORM_STEPS: Omit<FormStep, "isComplete" | "isValid">[] = [
  {
    id: 1,
    title: "Select Item",
    description: "Choose the item you want to replace",
  },
  {
    id: 2,
    title: "Reason",
    description: "Tell us why this item should be replaced",
  },
  {
    id: 3,
    title: "Photos",
    description: "Add photos to support your request (optional)",
  },
  {
    id: 4,
    title: "Suggest Replacement",
    description: "Suggest a new item (optional)",
  },
  {
    id: 5,
    title: "Review",
    description: "Review and submit your request",
  },
];

/**
 * Maximum values
 */
export const MAX_PHOTOS = 3;
export const MAX_NOTES_LENGTH = 500;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
