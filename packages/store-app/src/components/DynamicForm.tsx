import { useState, useEffect, useCallback, useRef } from "react";
import {
  DynamicFormProps,
  FormDefinition,
  FormResponse,
  FormState,
} from "../types/form";
import { getFormDefinition } from "../services/formApi";
import { useFormStore } from "../stores/formStore";
import { useAuthStore } from "../stores/authStore";
import {
  validateField,
  validateForm,
  isFieldVisible,
} from "../utils/formValidation";
import { generateId } from "../utils/helpers";
import { FormFieldInput } from "./FormFieldInput";

/**
 * DynamicForm - Renders forms from Notion schema with real-time validation
 *
 * UX Features:
 * - Progressive disclosure (one question at a time)
 * - Auto-save every 30 seconds
 * - Instant validation feedback
 * - Offline support with sync queue
 *
 * @param formId - Form Definition database ID from Notion
 * @param onSubmit - Callback when form is successfully submitted
 * @param onAutoSave - Callback for auto-save events
 *
 * @example
 * <DynamicForm
 *   formId="opening-checklist"
 *   onSubmit={handleSubmit}
 *   onAutoSave={handleAutoSave}
 * />
 *
 * Accessibility:
 * - ARIA labels on all inputs
 * - Keyboard navigation (Tab, Enter, Escape)
 * - Screen reader announces progress
 * - Focus management between questions
 */
export const DynamicForm: React.FC<DynamicFormProps> = ({
  formId,
  onSubmit,
  onAutoSave,
  initialData = {},
  mode = "progressive",
  autoSaveInterval = 30000, // 30 seconds
}) => {
  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(
    null
  );
  const [formState, setFormState] = useState<FormState>({
    currentFieldIndex: 0,
    responses: initialData,
    errors: [],
    isSubmitting: false,
    isSaving: false,
  });
  const [responseId] = useState(() => generateId());

  const { addResponse, updateResponse } = useFormStore();
  const { user } = useAuthStore();
  const autoSaveTimerRef = useRef<number | null>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  // Load form definition
  useEffect(() => {
    const loadForm = async () => {
      const definition = await getFormDefinition(formId);
      setFormDefinition(definition);
    };
    loadForm();
  }, [formId]);

  // Auto-save functionality
  const saveProgress = useCallback(async () => {
    if (!user || !formDefinition) return;

    setFormState((prev) => ({ ...prev, isSaving: true }));

    const response: FormResponse = {
      id: responseId,
      formId,
      userId: user.id,
      data: formState.responses,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateResponse(responseId, response);
    setFormState((prev) => ({
      ...prev,
      isSaving: false,
      lastSaved: new Date(),
    }));

    if (onAutoSave) {
      await onAutoSave(response);
    }
  }, [
    formId,
    responseId,
    formState.responses,
    user,
    formDefinition,
    updateResponse,
    onAutoSave,
  ]);

  // Set up auto-save timer
  useEffect(() => {
    if (autoSaveInterval > 0) {
      autoSaveTimerRef.current = setInterval(saveProgress, autoSaveInterval);

      return () => {
        if (autoSaveTimerRef.current) {
          clearInterval(autoSaveTimerRef.current);
        }
      };
    }
    return undefined;
  }, [autoSaveInterval, saveProgress]);

  // Focus management when changing questions
  useEffect(() => {
    if (mode === "progressive" && fieldRef.current) {
      fieldRef.current.focus();
    }
  }, [formState.currentFieldIndex, mode]);

  const handleFieldChange = useCallback(
    (fieldId: string, value: unknown) => {
      setFormState((prev) => {
        const newResponses = { ...prev.responses, [fieldId]: value };

        // Validate field in real-time
        const field = formDefinition?.fields.find((f) => f.id === fieldId);
        if (field) {
          const error = validateField(field, value);
          const newErrors = prev.errors.filter((e) => e.fieldId !== fieldId);
          if (error) {
            newErrors.push(error);
          }

          return {
            ...prev,
            responses: newResponses,
            errors: newErrors,
          };
        }

        return { ...prev, responses: newResponses };
      });
    },
    [formDefinition]
  );

  const handleNext = useCallback(() => {
    if (!formDefinition) return;

    const currentField = formDefinition.fields[formState.currentFieldIndex];
    if (!currentField) return;

    const error = validateField(
      currentField,
      formState.responses[currentField.id]
    );

    if (error) {
      setFormState((prev) => ({
        ...prev,
        errors: [
          ...prev.errors.filter((e) => e.fieldId !== currentField?.id),
          error,
        ],
      }));
      return;
    }

    // Find next visible field
    let nextIndex = formState.currentFieldIndex + 1;
    while (nextIndex < formDefinition.fields.length) {
      const nextField = formDefinition.fields[nextIndex];
      if (nextField && isFieldVisible(nextField, formState.responses)) {
        break;
      }
      nextIndex++;
    }

    if (nextIndex < formDefinition.fields.length) {
      setFormState((prev) => ({ ...prev, currentFieldIndex: nextIndex }));
    }
  }, [formDefinition, formState.currentFieldIndex, formState.responses]);

  const handlePrevious = useCallback(() => {
    if (!formDefinition || formState.currentFieldIndex === 0) return;

    // Find previous visible field
    let prevIndex = formState.currentFieldIndex - 1;
    while (prevIndex >= 0) {
      const prevField = formDefinition.fields[prevIndex];
      if (prevField && isFieldVisible(prevField, formState.responses)) {
        break;
      }
      prevIndex--;
    }

    if (prevIndex >= 0) {
      setFormState((prev) => ({ ...prev, currentFieldIndex: prevIndex }));
    }
  }, [formDefinition, formState.currentFieldIndex, formState.responses]);

  const handleSubmit = useCallback(async () => {
    if (!user || !formDefinition) return;

    // Validate all fields
    const errors = validateForm(formDefinition.fields, formState.responses);

    if (errors.length > 0) {
      setFormState((prev) => ({ ...prev, errors }));
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    const response: FormResponse = {
      id: responseId,
      formId,
      userId: user.id,
      data: formState.responses,
      status: "submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    addResponse(response);
    setFormState((prev) => ({ ...prev, isSubmitting: false }));

    await onSubmit(response);
  }, [
    formId,
    responseId,
    formState.responses,
    user,
    formDefinition,
    addResponse,
    onSubmit,
  ]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== "progressive") return;

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (formState.currentFieldIndex === formDefinition!.fields.length - 1) {
          handleSubmit();
        } else {
          handleNext();
        }
      } else if (e.key === "Escape") {
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    mode,
    formState.currentFieldIndex,
    formDefinition,
    handleNext,
    handlePrevious,
    handleSubmit,
  ]);

  if (!formDefinition) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading form...</p>
        </div>
      </div>
    );
  }

  const visibleFields = formDefinition.fields.filter((field) =>
    isFieldVisible(field, formState.responses)
  );
  const currentField =
    mode === "progressive" ? visibleFields[formState.currentFieldIndex] : null;
  const progress =
    mode === "progressive"
      ? ((formState.currentFieldIndex + 1) / visibleFields.length) * 100
      : (Object.keys(formState.responses).length / visibleFields.length) * 100;

  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {formDefinition.title}
          </h1>
          {formDefinition.description && (
            <p className="text-neutral-600">{formDefinition.description}</p>
          )}

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-neutral-600 mb-2">
              <span>Progress</span>
              <span aria-live="polite">
                {mode === "progressive"
                  ? `${formState.currentFieldIndex + 1} of ${
                      visibleFields.length
                    }`
                  : `${Object.keys(formState.responses).length} of ${
                      visibleFields.length
                    } completed`}
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-fast"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>

          {/* Auto-save indicator */}
          {formState.isSaving && (
            <p className="text-sm text-neutral-500 mt-2">Saving...</p>
          )}
          {formState.lastSaved && !formState.isSaving && (
            <p className="text-sm text-neutral-500 mt-2">
              Last saved: {formState.lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Form content */}
        <div className="space-y-4">
          {mode === "progressive" && currentField ? (
            // Progressive mode - one field at a time
            <div ref={fieldRef} tabIndex={-1} className="focus:outline-none">
              <FormFieldInput
                field={currentField}
                value={formState.responses[currentField.id]}
                error={formState.errors.find(
                  (e) => e.fieldId === currentField.id
                )}
                onChange={(value) => handleFieldChange(currentField.id, value)}
              />

              {/* Navigation buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={formState.currentFieldIndex === 0}
                  className="btn-outline flex-1"
                  aria-label="Previous question"
                >
                  Previous
                </button>

                {formState.currentFieldIndex === visibleFields.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={formState.isSubmitting}
                    className="btn-primary flex-1"
                    aria-label="Submit form"
                  >
                    {formState.isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary flex-1"
                    aria-label="Next question"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          ) : (
            // All-at-once mode - show all fields
            <div className="space-y-6">
              {visibleFields.map((field) => (
                <FormFieldInput
                  key={field.id}
                  field={field}
                  value={formState.responses[field.id]}
                  error={formState.errors.find((e) => e.fieldId === field.id)}
                  onChange={(value) => handleFieldChange(field.id, value)}
                />
              ))}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={formState.isSubmitting}
                className="btn-primary w-full"
              >
                {formState.isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          )}
        </div>

        {/* Keyboard shortcuts hint */}
        {mode === "progressive" && (
          <div className="mt-8 text-center text-sm text-neutral-500">
            <p>
              Press{" "}
              <kbd className="px-2 py-1 bg-neutral-200 rounded">Enter</kbd> for
              next, <kbd className="px-2 py-1 bg-neutral-200 rounded">Esc</kbd>{" "}
              for previous
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
