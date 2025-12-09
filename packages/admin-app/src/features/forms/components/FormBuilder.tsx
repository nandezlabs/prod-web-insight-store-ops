import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Save, Download, Eye, FileJson, Loader2 } from "lucide-react";
import { FieldLibrary } from "./FieldLibrary";
import { FormCanvas } from "./FormCanvas";
import { FieldEditor } from "./FieldEditor";
import { useFormBuilderStore } from "../store/formBuilderStore";
import { formService } from "../services/formService";
import type { FormField, FieldType } from "../types";

export const FormBuilder: React.FC = () => {
  const {
    currentForm,
    isDirty,
    isSaving,
    lastSaved,
    saveForm,
    updateFormTitle,
    updateFormType,
    addField,
    reorderFields,
  } = useFormBuilderStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  );

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const [showJsonPreview, setShowJsonPreview] = React.useState(false);

  // Auto-save indicator
  const autoSaveStatus = React.useMemo(() => {
    if (isSaving) return "Saving...";
    if (!isDirty && lastSaved) {
      const lastSavedDate = new Date(lastSaved);
      const now = new Date();
      const diffMs = now.getTime() - lastSavedDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return "Saved just now";
      if (diffMins === 1) return "Saved 1 minute ago";
      if (diffMins < 60) return `Saved ${diffMins} minutes ago`;
      return `Saved at ${lastSavedDate.toLocaleTimeString()}`;
    }
    if (isDirty) return "Unsaved changes";
    return "";
  }, [isSaving, isDirty, lastSaved]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !currentForm) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Dragging a field type from library
    if (activeData?.type === "field-type" && overData?.type === "section") {
      // Will be handled in dragEnd
      return;
    }

    // Reordering fields within or between sections
    if (activeData?.type === "field" && overData?.type === "field") {
      const activeSectionId = activeData.sectionId;
      const overSectionId = overData.sectionId;

      if (activeSectionId === overSectionId) {
        const section = currentForm.sections.find(
          (s) => s.id === activeSectionId
        );
        if (!section) return;

        const oldIndex = section.fields.findIndex((f) => f.id === active.id);
        const newIndex = section.fields.findIndex((f) => f.id === over.id);

        if (oldIndex !== newIndex) {
          const newFields = arrayMove(section.fields, oldIndex, newIndex);
          reorderFields(activeSectionId, newFields);
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !currentForm) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Drop a field type from library into a section
    if (activeData?.type === "field-type" && overData?.type === "section") {
      const fieldType = activeData.fieldType as FieldType;
      const sectionId = overData.section.id;

      const newField: Omit<FormField, "id" | "order"> = {
        type: fieldType,
        label: getDefaultLabel(fieldType),
        required: false,
      };

      addField(sectionId, newField);
    }
  };

  const getDefaultLabel = (type: FieldType): string => {
    const labels: Record<FieldType, string> = {
      checkbox: "New Checkbox",
      text: "New Text Field",
      number: "New Number Field",
      time: "New Time Field",
      photo: "New Photo Field",
      signature: "New Signature Field",
      heading: "Section Heading",
      divider: "Divider",
    };
    return labels[type];
  };

  const handleSave = async () => {
    try {
      await saveForm();
      // Optional: Show success toast
    } catch (error) {
      console.error("Failed to save form:", error);
      // Optional: Show error toast
    }
  };

  const handleExportJson = () => {
    if (currentForm) {
      formService.exportAsJson(currentForm);
    }
  };

  if (!currentForm) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">No form loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4 flex-1">
          <input
            type="text"
            value={currentForm.title}
            onChange={(e) => updateFormTitle(e.target.value)}
            className="text-lg font-semibold text-gray-900 border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            placeholder="Form Title"
          />
          <select
            value={currentForm.type}
            onChange={(e) =>
              updateFormType(e.target.value as typeof currentForm.type)
            }
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Opening">Opening</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Period">Period</option>
            <option value="Custom">Custom</option>
          </select>
        </div>

        {/* Auto-save Status */}
        <div className="flex items-center gap-3 text-sm text-gray-500">
          {isSaving && <Loader2 size={14} className="animate-spin" />}
          <span>{autoSaveStatus}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-6">
          <button
            onClick={() => setShowJsonPreview(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileJson size={16} />
            JSON
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Field Library - Left Panel */}
          <div className="w-64 flex-shrink-0">
            <FieldLibrary />
          </div>

          {/* Form Canvas - Center Panel */}
          <div className="flex-1 min-w-0">
            <FormCanvas />
          </div>

          {/* Field Editor - Right Panel */}
          <div className="w-80 flex-shrink-0">
            <FieldEditor />
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="px-4 py-2 bg-white border-2 border-blue-500 rounded-lg shadow-lg">
                Dragging...
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* JSON Preview Modal */}
      {showJsonPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Form JSON</h3>
              <button
                onClick={() => setShowJsonPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(currentForm, null, 2)}
              </pre>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowJsonPreview(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleExportJson}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Form Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <h2 className="text-2xl font-bold mb-4">{currentForm.title}</h2>
              {currentForm.sections.map((section) => (
                <div key={section.id} className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    {section.title}
                  </h3>
                  {section.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {section.description}
                    </p>
                  )}
                  <div className="space-y-3">
                    {section.fields.map((field) => (
                      <div
                        key={field.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <label className="block text-sm font-medium mb-1">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        {field.helpText && (
                          <p className="text-xs text-gray-500 mb-2">
                            {field.helpText}
                          </p>
                        )}
                        <div className="text-xs text-gray-400 italic">
                          [{field.type} field]
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
