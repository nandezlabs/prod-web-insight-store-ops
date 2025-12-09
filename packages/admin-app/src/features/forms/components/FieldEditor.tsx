import React from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { FormField, FormSection, ConditionalLogic } from "../types";
import { useFormBuilderStore } from "../store/formBuilderStore";
import { Input } from "@insight/ui";

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Does not equal" },
  { value: "contains", label: "Contains" },
  { value: "greater_than", label: "Greater than" },
  { value: "less_than", label: "Less than" },
];

export const FieldEditor: React.FC = () => {
  const {
    selectedField,
    selectedSection,
    updateField,
    updateSection,
    selectField,
    selectSection,
    currentForm,
  } = useFormBuilderStore();

  const handleClose = () => {
    selectField(null);
    selectSection(null);
  };

  // Field Editor
  if (selectedField) {
    const handleFieldUpdate = (updates: Partial<FormField>) => {
      updateField(selectedField.id, updates);
    };

    const addConditionalRule = () => {
      const newRule: ConditionalLogic = {
        field: "",
        operator: "equals",
        value: "",
      };
      handleFieldUpdate({
        showIf: [...(selectedField.showIf || []), newRule],
      });
    };

    const updateConditionalRule = (
      index: number,
      updates: Partial<ConditionalLogic>
    ) => {
      const newRules = [...(selectedField.showIf || [])];
      newRules[index] = { ...newRules[index], ...updates };
      handleFieldUpdate({ showIf: newRules });
    };

    const removeConditionalRule = (index: number) => {
      const newRules = [...(selectedField.showIf || [])];
      newRules.splice(index, 1);
      handleFieldUpdate({ showIf: newRules });
    };

    // Get all available fields for conditional logic
    const availableFields: FormField[] = [];
    currentForm?.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.id !== selectedField.id) {
          availableFields.push(field);
        }
      });
    });

    return (
      <div className="h-full flex flex-col bg-white border-l border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Field Properties</h3>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Basic Properties */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field Type
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-600 capitalize">
              {selectedField.type}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label <span className="text-red-500">*</span>
            </label>
            <Input
              value={selectedField.label}
              onChange={(e) => handleFieldUpdate({ label: e.target.value })}
              placeholder="Enter field label"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedField.required || false}
                onChange={(e) =>
                  handleFieldUpdate({ required: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Required field
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Help Text
            </label>
            <textarea
              value={selectedField.helpText || ""}
              onChange={(e) => handleFieldUpdate({ helpText: e.target.value })}
              placeholder="Instructions or hints for this field"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Validation Rules */}
          {(selectedField.type === "number" ||
            selectedField.type === "text") && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Validation
              </h4>
              <div className="space-y-3">
                {selectedField.type === "number" && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Minimum Value
                      </label>
                      <Input
                        type="number"
                        value={selectedField.validation?.min ?? ""}
                        onChange={(e) =>
                          handleFieldUpdate({
                            validation: {
                              ...selectedField.validation,
                              min: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            },
                          })
                        }
                        placeholder="No minimum"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Maximum Value
                      </label>
                      <Input
                        type="number"
                        value={selectedField.validation?.max ?? ""}
                        onChange={(e) =>
                          handleFieldUpdate({
                            validation: {
                              ...selectedField.validation,
                              max: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            },
                          })
                        }
                        placeholder="No maximum"
                      />
                    </div>
                  </>
                )}
                {selectedField.type === "text" && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Maximum Length
                    </label>
                    <Input
                      type="number"
                      value={selectedField.validation?.maxLength ?? ""}
                      onChange={(e) =>
                        handleFieldUpdate({
                          validation: {
                            ...selectedField.validation,
                            maxLength: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          },
                        })
                      }
                      placeholder="No limit"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Alert Message (if validation fails)
                  </label>
                  <Input
                    value={selectedField.validation?.alert || ""}
                    onChange={(e) =>
                      handleFieldUpdate({
                        validation: {
                          ...selectedField.validation,
                          alert: e.target.value,
                        },
                      })
                    }
                    placeholder="Enter custom error message"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Conditional Logic */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">
                Conditional Logic
              </h4>
              <button
                onClick={addConditionalRule}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Rule
              </button>
            </div>

            {!selectedField.showIf || selectedField.showIf.length === 0 ? (
              <p className="text-xs text-gray-500 italic">
                Show this field only when specific conditions are met
              </p>
            ) : (
              <div className="space-y-3">
                {selectedField.showIf.map((rule, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-md space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">
                        Rule {index + 1}
                      </span>
                      <button
                        onClick={() => removeConditionalRule(index)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Show if field
                      </label>
                      <select
                        value={rule.field}
                        onChange={(e) =>
                          updateConditionalRule(index, {
                            field: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select field...</option>
                        {availableFields.map((field) => (
                          <option key={field.id} value={field.id}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Operator
                      </label>
                      <select
                        value={rule.operator}
                        onChange={(e) =>
                          updateConditionalRule(index, {
                            operator: e.target
                              .value as ConditionalLogic["operator"],
                          })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {OPERATORS.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Value
                      </label>
                      <Input
                        value={rule.value}
                        onChange={(e) =>
                          updateConditionalRule(index, {
                            value: e.target.value,
                          })
                        }
                        placeholder="Enter value"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Section Editor
  if (selectedSection) {
    const handleSectionUpdate = (updates: Partial<FormSection>) => {
      updateSection(selectedSection.id, updates);
    };

    return (
      <div className="h-full flex flex-col bg-white border-l border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Section Properties</h3>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={selectedSection.title}
              onChange={(e) => handleSectionUpdate({ title: e.target.value })}
              placeholder="Enter section title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={selectedSection.description || ""}
              onChange={(e) =>
                handleSectionUpdate({ description: e.target.value })
              }
              placeholder="Optional section description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Fields in this section:</strong>{" "}
              {selectedSection.fields.length}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No Selection
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50 border-l border-gray-200 p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <Plus size={32} className="text-gray-400" />
      </div>
      <h3 className="font-medium text-gray-900 mb-2">No Selection</h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Select a field or section to edit its properties
      </p>
    </div>
  );
};
