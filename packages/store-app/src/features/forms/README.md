# Dynamic Forms System

A comprehensive form system that renders dynamic forms from Notion database schemas, with offline support, auto-save, and progressive disclosure.

## Features

### ✅ Progressive Disclosure

- One section at a time
- Progress indicator with visual feedback
- Section navigation (Previous/Next)

### 💾 Auto-Save

- Saves to IndexedDB every 30 seconds
- Visual indicator (Saving/Saved/Error)
- Preserves progress across app restarts

### 📴 Offline Support

- Queue submissions when offline
- Auto-sync when connection restored
- Visual online/offline status

### 🎯 Field Types

1. **Checkbox** - 48×48px touch target with checkmark
2. **Text** - Single or multiline with character counter
3. **Number** - Input with +/- buttons (64×64px)
4. **Time** - Native time picker
5. **Photo** - Camera capture, max 5 photos, grid display
6. **Signature** - Canvas with clear/done buttons

### ✔️ Validation

- Required field validation
- Min/max for numbers
- Character limits for text
- Real-time validation on blur
- Error summary at section top

### 🔀 Conditional Logic

- `showIf` conditions based on other fields
- Dynamic field visibility

## Quick Start

### 1. Set Environment Variables

Create `.env` file:

```env
VITE_DB_FORM_DEFINITIONS=your_form_definitions_database_id
VITE_DB_CHECKLISTS=your_checklists_database_id
VITE_DB_ANALYTICS_LOGS=your_analytics_logs_database_id
```

### 2. Use in Your App

```tsx
import { DynamicForm } from "@/features/forms";

function MyPage() {
  return (
    <DynamicForm
      formId="opening-checklist"
      onComplete={() => console.log("Done!")}
      onCancel={() => console.log("Cancelled")}
    />
  );
}
```

## Architecture

### Components

```
forms/
├── types.ts                  # TypeScript interfaces
├── services/
│   └── formService.ts       # API calls
├── stores/
│   └── formStore.ts         # Zustand store with auto-save
└── components/
    ├── DynamicForm.tsx      # Main form container
    ├── fields/
    │   ├── CheckboxField.tsx
    │   ├── TextField.tsx
    │   ├── NumberField.tsx
    │   ├── TimeField.tsx
    │   ├── PhotoField.tsx
    │   └── SignatureField.tsx
    └── ui/
        ├── ProgressIndicator.tsx
        ├── AutoSaveIndicator.tsx
        └── FormField.tsx    # Field type router
```

### Data Flow

1. **Load Schema**: Fetch form definition from Notion
2. **Render Section**: Display current section fields
3. **User Input**: Update formData in store
4. **Auto-Save**: Persist to IndexedDB every 30s
5. **Navigate**: Validate section before moving forward
6. **Submit**: Create checklist entry in Notion

### Store State

```typescript
{
  schema: FormSchema | null,       // Form definition
  currentSection: number,           // Current section index
  formData: FormData,               // All field values
  validationErrors: Record<string, string>,
  autoSaveStatus: AutoSaveStatus,   // Saving/Saved/Error
  isOnline: boolean,                // Network status
  queuedSubmissions: QueuedSubmission[],
  isSubmitting: boolean
}
```

## Form Schema (Notion Database)

### Form Definitions Database

Properties:

- **Form ID** (Title): Unique identifier (e.g., "opening-checklist")
- **Title** (Text): Display name
- **Description** (Text): Optional description
- **Type** (Select): Form category
- **Section** (Select): Form section
- **Schema** (Text): JSON schema

### Schema Format

```json
{
  "formId": "opening-checklist",
  "title": "Opening Checklist",
  "type": "Opening",
  "section": "Daily Operations",
  "sections": [
    {
      "id": "safety",
      "title": "Safety Check",
      "description": "Verify all safety requirements",
      "fields": [
        {
          "id": "emergency_exits_clear",
          "type": "checkbox",
          "label": "Emergency exits are clear",
          "required": true
        },
        {
          "id": "fire_extinguisher_check",
          "type": "checkbox",
          "label": "Fire extinguisher inspected",
          "required": true
        },
        {
          "id": "notes",
          "type": "text",
          "label": "Additional notes",
          "multiline": true,
          "validation": { "maxLength": 500 }
        }
      ]
    },
    {
      "id": "equipment",
      "title": "Equipment",
      "fields": [
        {
          "id": "cash_register_count",
          "type": "number",
          "label": "Starting cash count",
          "required": true,
          "validation": { "min": 0, "max": 10000 }
        },
        {
          "id": "opening_time",
          "type": "time",
          "label": "Store opened at",
          "required": true
        }
      ]
    }
  ]
}
```

### Field Options

#### All Fields

- `id` (string): Unique field identifier
- `type` (FieldType): checkbox | text | number | time | photo | signature
- `label` (string): Display label
- `required` (boolean): Required validation
- `showIf` (object): Conditional visibility
  ```json
  { "field": "has_damage", "value": true }
  ```

#### Text Fields

- `multiline` (boolean): Textarea vs input
- `placeholder` (string): Placeholder text
- `validation.maxLength` (number): Character limit

#### Number Fields

- `validation.min` (number): Minimum value
- `validation.max` (number): Maximum value
- `validation.alert` (string): Custom error message

#### Photo Fields

- `maxPhotos` (number): Max photos (default: 5)

## API Integration

### Endpoints Used

1. **Fetch Schema**

   ```
   POST /api/notion-proxy.php?action=query
   ```

2. **Submit Form**

   ```
   POST /api/notion-proxy.php?action=create
   ```

3. **Upload Photo**

   ```
   POST /api/notion-proxy.php?action=upload
   ```

4. **Log Analytics**
   ```
   POST /api/notion-proxy.php?action=create
   ```

### Authentication

All requests require Bearer token:

```typescript
headers: {
  'Authorization': `Bearer ${sessionToken}`
}
```

## IndexedDB Schema

### Database: `forms-db`

#### Object Store: `saved-forms`

- Key: `formId`
- Data:
  ```typescript
  {
    formId: string,
    schemaTitle: string,
    currentSection: number,
    data: FormData,
    timestamp: number,
    completed: boolean
  }
  ```

#### Object Store: `submission-queue`

- Key: `id`
- Data:
  ```typescript
  {
    id: string,
    formId: string,
    formTitle: string,
    formType: string,
    formSection: string,
    data: FormData,
    timestamp: number,
    retryCount: number
  }
  ```

## Validation Rules

### Required Fields

- Cannot be empty/null/undefined
- Checkbox must be checked

### Number Fields

- Must be valid number
- Respect min/max bounds
- Show custom alert message

### Text Fields

- Respect maxLength
- Show character counter

### Photo Fields

- Max photos limit enforced
- Upload errors handled gracefully

## Touch Optimization

- **Buttons**: Minimum 48×48px (64×64px for primary)
- **Inputs**: 3rem (48px) height
- **Active states**: Scale feedback
- **Keyboard**: Full keyboard navigation support

## Error Handling

1. **Network Errors**: Queue for offline sync
2. **Validation Errors**: Show at field + summary
3. **Upload Errors**: Retry with user feedback
4. **Schema Errors**: Graceful fallback

## Performance

- **Debounced auto-save**: 30 second intervals
- **Optimistic updates**: Instant UI feedback
- **IndexedDB**: Fast local persistence
- **Image optimization**: Compress before upload

## Browser Support

- Chrome/Edge: ✅ Full support
- Safari: ✅ Full support
- Firefox: ✅ Full support
- Mobile Safari: ✅ Touch optimized
- Chrome Mobile: ✅ Touch optimized

## Testing

### Manual Test Checklist

1. ✅ Load form schema
2. ✅ Fill out all field types
3. ✅ Test validation (required, min/max)
4. ✅ Test conditional fields (showIf)
5. ✅ Test auto-save (check IndexedDB)
6. ✅ Test offline mode (queue submission)
7. ✅ Test online sync (verify Notion entry)
8. ✅ Test navigation (Previous/Next)
9. ✅ Test photo upload (max 5)
10. ✅ Test signature (draw, clear, save)

## Troubleshooting

### Form Not Loading

- Check `formId` matches Notion database
- Verify API token is valid
- Check network tab for errors

### Auto-Save Not Working

- Check browser console for IndexedDB errors
- Verify auto-save timer is running
- Check storage quota

### Photos Not Uploading

- Verify camera permissions
- Check file size limits
- Test network connection

### Validation Not Working

- Check schema validation rules
- Verify field IDs match
- Test required fields

## Future Enhancements

- [ ] File attachments (PDF, etc.)
- [ ] Date/datetime pickers
- [ ] Multi-select fields
- [ ] Drag-and-drop photo reordering
- [ ] Form templates
- [ ] Version history
- [ ] Bulk operations
- [ ] Export to PDF
- [ ] Email notifications
- [ ] Scheduled forms

## Dependencies

- `zustand`: State management
- `idb`: IndexedDB wrapper
- `framer-motion`: Animations
- `lucide-react`: Icons
- `react-router-dom`: Navigation

## License

MIT
