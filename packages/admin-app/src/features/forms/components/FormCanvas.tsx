import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Type,
  Hash,
  Clock,
  Camera,
  PenTool,
  Heading2,
  Minus,
  LucideIcon,
} from "lucide-react";
import type { FormSection, FormField, FieldType } from "../types";
import { useFormBuilderStore } from "../store/formBuilderStore";

const FIELD_ICONS: Record<FieldType, LucideIcon> = {
  checkbox: CheckSquare,
  text: Type,
  number: Hash,
  time: Clock,
  photo: Camera,
  signature: PenTool,
  heading: Heading2,
  divider: Minus,
};

interface SortableFieldProps {
  field: FormField;
  sectionId: string;
}

const SortableField: React.FC<SortableFieldProps> = ({ field, sectionId }) => {
  const { selectedField, selectField, deleteField, duplicateField } =
    useFormBuilderStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: {
      type: "field",
      field,
      sectionId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = FIELD_ICONS[field.type];
  const isSelected = selectedField?.id === field.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex items-center gap-2 px-3 py-2 rounded-md
        ${isDragging ? "opacity-50 z-50" : ""}
        ${
          isSelected
            ? "bg-blue-50 border-2 border-blue-500"
            : "bg-white border border-gray-200"
        }
        hover:border-gray-300
        transition-all cursor-pointer
      `}
      onClick={() => selectField(field)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </div>

      {/* Field Icon */}
      <div className="flex-shrink-0 w-6 h-6 rounded bg-gray-100 text-gray-600 flex items-center justify-center">
        <Icon size={14} />
      </div>

      {/* Field Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            {field.label}
          </span>
          {field.required && <span className="text-xs text-red-500">*</span>}
        </div>
        {field.helpText && (
          <p className="text-xs text-gray-500 truncate">{field.helpText}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            duplicateField(field.id);
          }}
          className="p-1 text-gray-400 hover:text-blue-600 rounded"
          title="Duplicate"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Delete this field?")) {
              deleteField(field.id);
            }
          }}
          className="p-1 text-gray-400 hover:text-red-600 rounded"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

interface SectionCardProps {
  section: FormSection;
}

const SectionCard: React.FC<SectionCardProps> = ({ section }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { selectedSection, selectSection, deleteSection } =
    useFormBuilderStore();

  const { setNodeRef } = useDroppable({
    id: section.id,
    data: {
      type: "section",
      section,
    },
  });

  const isSelected = selectedSection?.id === section.id;

  return (
    <div
      className={`
        border rounded-lg overflow-hidden
        ${isSelected ? "border-blue-500 shadow-md" : "border-gray-200"}
        bg-white
      `}
    >
      {/* Section Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer"
        onClick={() => selectSection(section)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900">{section.title}</h4>
          {section.description && (
            <p className="text-xs text-gray-500 mt-0.5">
              {section.description}
            </p>
          )}
        </div>

        <span className="text-xs text-gray-500 px-2 py-1 bg-white rounded border border-gray-200">
          {section.fields.length} field{section.fields.length !== 1 ? "s" : ""}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Delete this section?")) {
              deleteSection(section.id);
            }
          }}
          className="p-1 text-gray-400 hover:text-red-600 rounded"
          title="Delete section"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Section Fields */}
      {!isCollapsed && (
        <div ref={setNodeRef} className="p-3 space-y-2 min-h-[80px]">
          {section.fields.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
              Drag fields here to add them
            </div>
          ) : (
            <SortableContext
              items={section.fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {section.fields.map((field) => (
                <SortableField
                  key={field.id}
                  field={field}
                  sectionId={section.id}
                />
              ))}
            </SortableContext>
          )}
        </div>
      )}
    </div>
  );
};

export const FormCanvas: React.FC = () => {
  const { currentForm, addSection } = useFormBuilderStore();

  if (!currentForm) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No form loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Canvas Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentForm.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {currentForm.type} Checklist
            </p>
          </div>
          <button
            onClick={addSection}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Section
          </button>
        </div>
      </div>

      {/* Canvas Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentForm.sections.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Plus size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start building your form
              </h3>
              <p className="text-gray-500 mb-6">
                Add a section to organize your form fields. Then drag fields
                from the library into sections.
              </p>
              <button
                onClick={addSection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Section
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {currentForm.sections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
