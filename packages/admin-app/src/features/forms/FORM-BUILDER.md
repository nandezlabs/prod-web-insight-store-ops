# Form Builder

The Form Builder is a comprehensive drag-and-drop visual editor for creating and managing dynamic checklist forms. It provides an intuitive interface for building complex forms with sections, fields, validation rules, and conditional logic.

## Features

### 🎨 Visual Editor

- **Drag-and-Drop Interface**: Intuitive field placement using @dnd-kit
- **Three-Panel Layout**:
  - Left: Field Library with 8 field types
  - Center: Form Canvas for building
  - Right: Property Editor for configuration
- **Real-time Preview**: See your form as users will see it
- **JSON Export**: Export form schema for integration

### 📝 Field Types

1. **Checkbox**: Yes/No or completed/incomplete
2. **Text**: Short text input with maxLength validation
3. **Number**: Numeric input with min/max validation
4. **Time**: Time picker field
5. **Photo**: Camera or photo upload
6. **Signature**: Digital signature capture
7. **Heading**: Section title or header (non-input)
8. **Divider**: Visual separator (non-input)

### 🎯 Advanced Features

- **Validation Rules**: Min/max values, length limits, custom alerts
- **Conditional Logic**: Show/hide fields based on other field values
- **Section Organization**: Group related fields together
- **Field Reordering**: Drag to reorder within sections
- **Autosave**: Automatically saves every 30 seconds
- **Notion Integration**: Save forms directly to Notion database

## Architecture

### Components

#### FormBuilder (Main Component)

Located: `src/features/forms/components/FormBuilder.tsx`

The main orchestrator component that manages:

- DnD context for drag-and-drop functionality
- Top toolbar with title, type selector, and action buttons
- Three-panel layout coordination
- Modal dialogs for preview and JSON export
- Auto-save status indicator

```tsx
import { FormBuilder } from "@/features/forms";

<FormBuilder />;
```

#### FieldLibrary

Located: `src/features/forms/components/FieldLibrary.tsx`

Left sidebar displaying draggable field types with:

- Icon and description for each field type
- Drag handles using @dnd-kit/core
- Visual feedback during drag
- Tips section

#### FormCanvas

Located: `src/features/forms/components/FormCanvas.tsx`

Center panel for form construction with:

- Section cards with collapsible content
- Sortable field lists using @dnd-kit/sortable
- Drop zones for new fields
- Field actions (duplicate, delete)
- Section management

#### FieldEditor

Located: `src/features/forms/components/FieldEditor.tsx`

Right sidebar for property editing with:

- Dynamic form based on selected field/section
- Field label, required flag, help text
- Validation rules (type-specific)
- Conditional logic builder
- Section title and description

### State Management

**Store**: `formBuilderStore.ts` (Zustand)

State includes:

- `currentForm`: The form being edited
- `selectedField`: Currently selected field for editing
- `selectedSection`: Currently selected section
- `isDirty`: Has unsaved changes
- `isSaving`: Save operation in progress
- `lastSaved`: Timestamp of last save

Actions:

- Form: `createNewForm`, `loadForm`, `updateFormTitle`, `updateFormType`, `saveForm`
- Section: `addSection`, `updateSection`, `deleteSection`, `reorderSections`, `selectSection`
- Field: `addField`, `updateField`, `deleteField`, `duplicateField`, `reorderFields`, `selectField`

### Services

**formService.ts**

API integration for:

- `getAllForms()`: Fetch all forms
- `getFormById(id)`: Fetch single form
- `createForm(form)`: Create new form
- `updateForm(id, form)`: Update existing form
- `deleteForm(id)`: Delete form
- `duplicateForm(id)`: Duplicate form
- `archiveForm(id)`: Archive form
- `saveToNotion(form)`: Save to Notion database
- `exportAsJson(form)`: Download JSON file
- `generateFormId(title)`: Generate unique ID

## Usage

### Creating a New Form

```tsx
import { useFormBuilderStore } from "@/features/forms";

function MyComponent() {
  const { createNewForm } = useFormBuilderStore();

  const handleCreate = () => {
    createNewForm(); // Creates empty form with default values
  };
}
```

### Loading an Existing Form

```tsx
const { loadForm } = useFormBuilderStore();

await loadForm("opening-checklist-001");
```

### Adding Fields Programmatically

```tsx
const { addField } = useFormBuilderStore();

addField("section-id", {
  type: "checkbox",
  label: "Safety check completed",
  required: true,
  helpText: "Verify all safety equipment",
});
```

### Saving a Form

```tsx
const { saveForm, currentForm } = useFormBuilderStore();

// Manual save
await saveForm();

// Auto-save runs every 30 seconds automatically
```

## Data Structure

### FormSchema

```typescript
{
  formId: string;          // Unique identifier
  title: string;           // Form title
  type: 'Opening' | 'Daily' | 'Weekly' | 'Period' | 'Custom';
  status: 'Active' | 'Draft' | 'Archived';
  sections: FormSection[];
  createdAt: string;
  updatedAt: string;
}
```

### FormSection

```typescript
{
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  order: number;
}
```

### FormField

```typescript
{
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  validation?: {
    min?: number;        // For number fields
    max?: number;        // For number fields
    maxLength?: number;  // For text fields
    alert?: string;      // Custom error message
  };
  showIf?: {             // Conditional logic (array)
    field: string;       // Field ID to check
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: string;
  }[];
  helpText?: string;
  order: number;
}
```

## Integration

### Notion Integration

Forms can be saved to Notion with this structure:

```typescript
{
  formTitle: string; // Form title
  formId: string; // Unique ID
  formType: string; // Form type (Opening, Daily, etc.)
  schemaJson: string; // Full JSON schema
  section: string; // Category (default: 'Admin')
  status: string; // Active, Draft, or Archived
  lastModified: string; // ISO timestamp
}
```

### Store App Integration

The generated forms can be consumed by the store app:

```typescript
import { formService } from "@/services/formApi";

// Fetch active forms
const forms = await formService.getAllForms();
const openingChecklist = forms.find((f) => f.type === "Opening");

// Render form fields
openingChecklist.sections.forEach((section) => {
  section.fields.forEach((field) => {
    renderField(field);
  });
});
```

## Drag-and-Drop Implementation

### Adding New Fields

1. User drags field type from FieldLibrary
2. DnD detects drag start with field type data
3. User drops over a section in FormCanvas
4. `handleDragEnd` creates new field with default properties
5. Field is added to section via `addField` action

### Reordering Fields

1. User drags existing field within section
2. `@dnd-kit/sortable` manages visual feedback
3. `handleDragOver` calculates new position
4. `reorderFields` updates field order
5. Changes trigger auto-save after 30 seconds

## Best Practices

### Performance

- Use `React.memo` for field components in large forms
- Debounce property updates in FieldEditor
- Lazy load form list on FormsPage

### Validation

- Validate field labels are not empty before save
- Ensure section has at least one field
- Check conditional logic references valid fields

### User Experience

- Show loading states during async operations
- Confirm destructive actions (delete, archive)
- Display helpful tooltips and placeholders
- Auto-focus inputs when editing properties

### Accessibility

- Keyboard navigation for field selection
- ARIA labels for drag handles
- Focus management in modals
- Screen reader announcements for changes

## Troubleshooting

### Form not saving

- Check network tab for API errors
- Verify `formId` is generated
- Ensure `currentForm` is not null
- Check auto-save interval (30s)

### Drag-and-drop not working

- Verify `@dnd-kit` packages installed
- Check DndContext wraps components
- Ensure drag data includes `type` field
- Validate drop target has correct `type`

### Conditional logic not showing field

- Verify referenced field exists
- Check operator matches value type
- Ensure field order allows dependency

## Future Enhancements

- [ ] Multi-language support for forms
- [ ] Form templates library
- [ ] Field dependencies (disable if...)
- [ ] Advanced validation (regex, custom functions)
- [ ] Form versioning and history
- [ ] Bulk import/export
- [ ] Form analytics dashboard
- [ ] Duplicate detection
- [ ] Field library customization
- [ ] Collaborative editing
- [ ] Form submission workflow
- [ ] PDF export of forms
