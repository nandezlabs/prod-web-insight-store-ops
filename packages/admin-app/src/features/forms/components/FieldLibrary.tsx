import React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
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
import type { FieldType } from "../types";

interface FieldLibraryItem {
  type: FieldType;
  label: string;
  icon: LucideIcon;
  description: string;
}

const FIELD_TYPES: FieldLibraryItem[] = [
  {
    type: "checkbox",
    label: "Checkbox",
    icon: CheckSquare,
    description: "Yes/No or completed/incomplete",
  },
  {
    type: "text",
    label: "Text",
    icon: Type,
    description: "Short text input",
  },
  {
    type: "number",
    label: "Number",
    icon: Hash,
    description: "Numeric input with validation",
  },
  {
    type: "time",
    label: "Time",
    icon: Clock,
    description: "Time picker",
  },
  {
    type: "photo",
    label: "Photo",
    icon: Camera,
    description: "Camera or photo upload",
  },
  {
    type: "signature",
    label: "Signature",
    icon: PenTool,
    description: "Digital signature capture",
  },
  {
    type: "heading",
    label: "Heading",
    icon: Heading2,
    description: "Section title or header",
  },
  {
    type: "divider",
    label: "Divider",
    icon: Minus,
    description: "Visual separator",
  },
];

interface DraggableFieldProps {
  item: FieldLibraryItem;
}

const DraggableField: React.FC<DraggableFieldProps> = ({ item }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `field-type-${item.type}`,
    data: {
      type: "field-type",
      fieldType: item.type,
    },
  });

  const Icon = item.icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex items-start gap-3 p-3 rounded-lg border-2 border-gray-200 bg-white
        cursor-grab active:cursor-grabbing
        hover:border-blue-300 hover:bg-blue-50
        transition-all duration-200
        ${isDragging ? "opacity-50 shadow-lg" : "shadow-sm"}
      `}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900">{item.label}</div>
        <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
      </div>
    </div>
  );
};

export const FieldLibrary: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <h3 className="font-semibold text-gray-900">Field Library</h3>
        <p className="text-xs text-gray-500 mt-1">
          Drag fields to add them to your form
        </p>
      </div>

      {/* Field Types */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {FIELD_TYPES.map((item) => (
          <DraggableField key={item.type} item={item} />
        ))}
      </div>

      {/* Tips */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">💡 Tips</p>
          <ul className="space-y-1 text-gray-500">
            <li>• Drag fields to sections</li>
            <li>• Click fields to edit properties</li>
            <li>• Use headings to organize</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
