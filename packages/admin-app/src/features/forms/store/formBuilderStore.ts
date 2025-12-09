import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  FormSchema,
  FormSection,
  FormField,
  FormBuilderState,
} from "../types";
import { formService } from "../services/formService";

interface FormBuilderStore extends FormBuilderState {
  // Form actions
  createNewForm: () => void;
  loadForm: (formId: string) => Promise<void>;
  updateFormTitle: (title: string) => void;
  updateFormType: (type: FormSchema["type"]) => void;
  saveForm: () => Promise<void>;

  // Section actions
  addSection: () => void;
  updateSection: (sectionId: string, updates: Partial<FormSection>) => void;
  deleteSection: (sectionId: string) => void;
  reorderSections: (sections: FormSection[]) => void;
  selectSection: (section: FormSection | null) => void;

  // Field actions
  addField: (sectionId: string, field: Omit<FormField, "id" | "order">) => void;
  updateField: (fieldId: string, updates: Partial<FormField>) => void;
  deleteField: (fieldId: string) => void;
  duplicateField: (fieldId: string) => void;
  reorderFields: (sectionId: string, fields: FormField[]) => void;
  selectField: (field: FormField | null) => void;

  // State actions
  setDirty: (isDirty: boolean) => void;
  reset: () => void;
}

const createEmptyForm = (): FormSchema => ({
  formId: "",
  title: "Untitled Form",
  type: "Custom",
  status: "Draft",
  sections: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useFormBuilderStore = create<FormBuilderStore>((set, get) => ({
  currentForm: null,
  selectedField: null,
  selectedSection: null,
  isDirty: false,
  isSaving: false,
  lastSaved: null,

  /**
   * Create new form
   */
  createNewForm: () => {
    set({
      currentForm: createEmptyForm(),
      selectedField: null,
      selectedSection: null,
      isDirty: false,
      lastSaved: null,
    });
  },

  /**
   * Load existing form
   */
  loadForm: async (formId: string) => {
    try {
      const form = await formService.getFormById(formId);
      if (form) {
        set({
          currentForm: form,
          selectedField: null,
          selectedSection: null,
          isDirty: false,
          lastSaved: form.updatedAt || null,
        });
      }
    } catch (error) {
      console.error("Failed to load form:", error);
    }
  },

  /**
   * Update form title
   */
  updateFormTitle: (title: string) => {
    const { currentForm } = get();
    if (!currentForm) return;

    set({
      currentForm: { ...currentForm, title },
      isDirty: true,
    });
  },

  /**
   * Update form type
   */
  updateFormType: (type: FormSchema["type"]) => {
    const { currentForm } = get();
    if (!currentForm) return;

    set({
      currentForm: { ...currentForm, type },
      isDirty: true,
    });
  },

  /**
   * Save form
   */
  saveForm: async () => {
    const { currentForm } = get();
    if (!currentForm) return;

    set({ isSaving: true });

    try {
      // Generate formId if new
      if (!currentForm.formId) {
        currentForm.formId = formService.generateFormId(currentForm.title);
      }

      currentForm.updatedAt = new Date().toISOString();

      // Save to backend
      const saved = currentForm.createdAt
        ? await formService.updateForm(currentForm.formId, currentForm)
        : await formService.createForm(currentForm);

      set({
        currentForm: saved,
        isDirty: false,
        isSaving: false,
        lastSaved: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to save form:", error);
      set({ isSaving: false });
      throw error;
    }
  },

  /**
   * Add new section
   */
  addSection: () => {
    const { currentForm } = get();
    if (!currentForm) return;

    const newSection: FormSection = {
      id: uuidv4(),
      title: "New Section",
      description: "",
      fields: [],
      order: currentForm.sections.length,
    };

    set({
      currentForm: {
        ...currentForm,
        sections: [...currentForm.sections, newSection],
      },
      isDirty: true,
    });
  },

  /**
   * Update section
   */
  updateSection: (sectionId: string, updates: Partial<FormSection>) => {
    const { currentForm } = get();
    if (!currentForm) return;

    set({
      currentForm: {
        ...currentForm,
        sections: currentForm.sections.map((section) =>
          section.id === sectionId ? { ...section, ...updates } : section
        ),
      },
      isDirty: true,
    });
  },

  /**
   * Delete section
   */
  deleteSection: (sectionId: string) => {
    const { currentForm, selectedSection } = get();
    if (!currentForm) return;

    set({
      currentForm: {
        ...currentForm,
        sections: currentForm.sections.filter((s) => s.id !== sectionId),
      },
      selectedSection:
        selectedSection?.id === sectionId ? null : selectedSection,
      isDirty: true,
    });
  },

  /**
   * Reorder sections
   */
  reorderSections: (sections: FormSection[]) => {
    const { currentForm } = get();
    if (!currentForm) return;

    set({
      currentForm: {
        ...currentForm,
        sections: sections.map((s, i) => ({ ...s, order: i })),
      },
      isDirty: true,
    });
  },

  /**
   * Select section
   */
  selectSection: (section: FormSection | null) => {
    set({ selectedSection: section, selectedField: null });
  },

  /**
   * Add field to section
   */
  addField: (sectionId: string, field: Omit<FormField, "id" | "order">) => {
    const { currentForm } = get();
    if (!currentForm) return;

    const section = currentForm.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newField: FormField = {
      ...field,
      id: uuidv4(),
      order: section.fields.length,
    };

    set({
      currentForm: {
        ...currentForm,
        sections: currentForm.sections.map((s) =>
          s.id === sectionId ? { ...s, fields: [...s.fields, newField] } : s
        ),
      },
      isDirty: true,
    });
  },

  /**
   * Update field
   */
  updateField: (fieldId: string, updates: Partial<FormField>) => {
    const { currentForm } = get();
    if (!currentForm) return;

    set({
      currentForm: {
        ...currentForm,
        sections: currentForm.sections.map((section) => ({
          ...section,
          fields: section.fields.map((field) =>
            field.id === fieldId ? { ...field, ...updates } : field
          ),
        })),
      },
      isDirty: true,
    });
  },

  /**
   * Delete field
   */
  deleteField: (fieldId: string) => {
    const { currentForm, selectedField } = get();
    if (!currentForm) return;

    set({
      currentForm: {
        ...currentForm,
        sections: currentForm.sections.map((section) => ({
          ...section,
          fields: section.fields.filter((f) => f.id !== fieldId),
        })),
      },
      selectedField: selectedField?.id === fieldId ? null : selectedField,
      isDirty: true,
    });
  },

  /**
   * Duplicate field
   */
  duplicateField: (fieldId: string) => {
    const { currentForm } = get();
    if (!currentForm) return;

    let duplicated = false;
    const updatedSections = currentForm.sections.map((section) => {
      const fieldIndex = section.fields.findIndex((f) => f.id === fieldId);
      if (fieldIndex === -1) return section;

      const originalField = section.fields[fieldIndex];
      const newField: FormField = {
        ...originalField,
        id: uuidv4(),
        label: `${originalField.label} (Copy)`,
        order: originalField.order + 1,
      };

      duplicated = true;
      const newFields = [...section.fields];
      newFields.splice(fieldIndex + 1, 0, newField);

      return { ...section, fields: newFields };
    });

    if (duplicated) {
      set({
        currentForm: { ...currentForm, sections: updatedSections },
        isDirty: true,
      });
    }
  },

  /**
   * Reorder fields in section
   */
  reorderFields: (sectionId: string, fields: FormField[]) => {
    const { currentForm } = get();
    if (!currentForm) return;

    set({
      currentForm: {
        ...currentForm,
        sections: currentForm.sections.map((section) =>
          section.id === sectionId
            ? { ...section, fields: fields.map((f, i) => ({ ...f, order: i })) }
            : section
        ),
      },
      isDirty: true,
    });
  },

  /**
   * Select field
   */
  selectField: (field: FormField | null) => {
    set({ selectedField: field, selectedSection: null });
  },

  /**
   * Set dirty state
   */
  setDirty: (isDirty: boolean) => {
    set({ isDirty });
  },

  /**
   * Reset store
   */
  reset: () => {
    set({
      currentForm: null,
      selectedField: null,
      selectedSection: null,
      isDirty: false,
      isSaving: false,
      lastSaved: null,
    });
  },
}));

// Auto-save every 30 seconds
if (typeof window !== "undefined") {
  setInterval(() => {
    const { currentForm, isDirty, isSaving } = useFormBuilderStore.getState();
    if (currentForm && isDirty && !isSaving) {
      useFormBuilderStore.getState().saveForm().catch(console.error);
    }
  }, 30000);
}
