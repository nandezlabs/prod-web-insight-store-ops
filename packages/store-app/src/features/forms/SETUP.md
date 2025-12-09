# Dynamic Forms System - Setup Guide

Complete setup instructions for the dynamic forms system with Notion integration.

## Prerequisites

- ✅ Notion account with API access
- ✅ Hostinger Premium hosting (PHP 7.4+)
- ✅ Authentication system already set up
- ✅ MySQL database configured

## Step 1: Environment Variables

Create or update `.env` file in project root:

```env
# API Configuration
VITE_API_BASE_URL=https://your-domain.com/api

# Notion Database IDs (get from Notion database URLs)
VITE_DB_FORM_DEFINITIONS=abc123...
VITE_DB_CHECKLISTS=def456...
VITE_DB_ANALYTICS_LOGS=ghi789...
```

### How to Find Database IDs

1. Open database in Notion
2. Click "Share" → "Copy link"
3. Extract ID from URL:
   ```
   https://www.notion.so/workspace/DATABASE_ID?v=...
                                 ^^^^^^^^^^^
   ```

## Step 2: Create Notion Databases

### A. Form Definitions Database

Properties:

- **Form ID** (Title) - Unique identifier (e.g., "opening-checklist")
- **Title** (Text) - Display name (e.g., "Opening Checklist")
- **Description** (Text) - Optional description
- **Type** (Select) - Form category (Opening, Closing, Safety, etc.)
- **Section** (Select) - Form section (Daily Operations, etc.)
- **Schema** (Text) - JSON form schema (see examples below)
- **Active** (Checkbox) - Whether form is available
- **Created** (Created time) - Auto
- **Last Modified** (Last edited time) - Auto

### B. Checklists Database

Properties:

- **Checklist Title** (Title) - Generated from form
- **Type** (Select) - From form schema
- **Task Items** (Rich text) - JSON of all field values
- **Status** (Select) - "Completed"
- **Completed By** (Rich text) - Store ID
- **Completed Date** (Date) - Submission timestamp
- **Section** (Select) - From form schema
- **Photo URLs** (Rich text) - JSON array of URLs
- **Signature Data** (Rich text) - Base64 image data
- **Completion Percentage** (Number) - Always 100
- **Created** (Created time) - Auto

### C. Analytics Logs Database (Optional)

Properties:

- **Event Type** (Title) - "form_completion"
- **Store ID** (Rich text) - User's store
- **Timestamp** (Date) - When it happened
- **Metadata** (Rich text) - JSON with formId, formTitle

## Step 3: Create Form Schemas

### Example 1: Simple Opening Checklist

```json
{
  "formId": "opening-checklist",
  "title": "Opening Checklist",
  "description": "Daily store opening procedures",
  "type": "Opening",
  "section": "Daily Operations",
  "sections": [
    {
      "id": "safety",
      "title": "Safety Check",
      "description": "Verify all safety requirements before opening",
      "fields": [
        {
          "id": "emergency_exits_clear",
          "type": "checkbox",
          "label": "Emergency exits are clear and accessible",
          "required": true
        },
        {
          "id": "fire_extinguisher_check",
          "type": "checkbox",
          "label": "Fire extinguisher inspected and accessible",
          "required": true
        },
        {
          "id": "first_aid_kit",
          "type": "checkbox",
          "label": "First aid kit is stocked",
          "required": true
        }
      ]
    },
    {
      "id": "equipment",
      "title": "Equipment Setup",
      "fields": [
        {
          "id": "cash_register_count",
          "type": "number",
          "label": "Starting cash drawer amount ($)",
          "required": true,
          "validation": {
            "min": 0,
            "max": 10000,
            "alert": "Amount must be between $0 and $10,000"
          }
        },
        {
          "id": "opening_time",
          "type": "time",
          "label": "Store opened at",
          "required": true
        },
        {
          "id": "pos_system_check",
          "type": "checkbox",
          "label": "POS system is functioning properly",
          "required": true
        }
      ]
    },
    {
      "id": "notes",
      "title": "Additional Notes",
      "fields": [
        {
          "id": "general_notes",
          "type": "text",
          "label": "Any issues or observations?",
          "placeholder": "Enter any notes here...",
          "multiline": true,
          "validation": {
            "maxLength": 500
          }
        }
      ]
    }
  ]
}
```

### Example 2: Incident Report (with Photos & Signature)

```json
{
  "formId": "incident-report",
  "title": "Incident Report",
  "type": "Safety",
  "section": "Reports",
  "sections": [
    {
      "id": "incident_details",
      "title": "Incident Details",
      "fields": [
        {
          "id": "incident_time",
          "type": "time",
          "label": "Time of incident",
          "required": true
        },
        {
          "id": "incident_type",
          "type": "text",
          "label": "Type of incident",
          "required": true
        },
        {
          "id": "description",
          "type": "text",
          "label": "Detailed description",
          "required": true,
          "multiline": true,
          "validation": {
            "maxLength": 1000
          }
        }
      ]
    },
    {
      "id": "documentation",
      "title": "Documentation",
      "fields": [
        {
          "id": "photos",
          "type": "photo",
          "label": "Photos of incident (if applicable)",
          "maxPhotos": 5
        },
        {
          "id": "witness_present",
          "type": "checkbox",
          "label": "Were there witnesses?"
        },
        {
          "id": "witness_info",
          "type": "text",
          "label": "Witness contact information",
          "multiline": true,
          "showIf": {
            "field": "witness_present",
            "value": true
          }
        }
      ]
    },
    {
      "id": "signature",
      "title": "Signature",
      "fields": [
        {
          "id": "reporter_signature",
          "type": "signature",
          "label": "Reporter signature",
          "required": true
        }
      ]
    }
  ]
}
```

### Example 3: Equipment Inspection (with Conditional Fields)

```json
{
  "formId": "equipment-inspection",
  "title": "Equipment Inspection",
  "type": "Maintenance",
  "section": "Equipment",
  "sections": [
    {
      "id": "hvac",
      "title": "HVAC System",
      "fields": [
        {
          "id": "hvac_functioning",
          "type": "checkbox",
          "label": "HVAC system is functioning properly",
          "required": true
        },
        {
          "id": "hvac_temperature",
          "type": "number",
          "label": "Current temperature (°F)",
          "required": true,
          "validation": {
            "min": 50,
            "max": 90
          }
        },
        {
          "id": "hvac_issues",
          "type": "checkbox",
          "label": "Are there any issues?"
        },
        {
          "id": "hvac_issue_description",
          "type": "text",
          "label": "Describe the issue",
          "required": true,
          "multiline": true,
          "showIf": {
            "field": "hvac_issues",
            "value": true
          }
        },
        {
          "id": "hvac_photos",
          "type": "photo",
          "label": "Photos of issue",
          "maxPhotos": 3,
          "showIf": {
            "field": "hvac_issues",
            "value": true
          }
        }
      ]
    }
  ]
}
```

## Step 4: Add Schemas to Notion

1. Open Form Definitions database in Notion
2. Click "New" to create a page
3. Fill in properties:

   - **Form ID**: `opening-checklist`
   - **Title**: `Opening Checklist`
   - **Type**: Select `Opening`
   - **Section**: Select `Daily Operations`
   - **Schema**: Paste JSON from examples above
   - **Active**: Check ✓

4. Repeat for each form you want to create

## Step 5: Test the Forms

### In Your App

```tsx
import { DynamicForm } from "@/features/forms";

function TestFormsPage() {
  return (
    <DynamicForm
      formId="opening-checklist"
      onComplete={() => {
        console.log("Form submitted!");
        // Navigate back or show success
      }}
      onCancel={() => {
        console.log("Form cancelled");
        // Navigate back
      }}
    />
  );
}
```

### Testing Checklist

1. ✅ Form loads with correct title and sections
2. ✅ All field types render properly
3. ✅ Validation works (required, min/max)
4. ✅ Conditional fields show/hide correctly
5. ✅ Auto-save indicator appears after 30 seconds
6. ✅ Can navigate between sections
7. ✅ Photo upload works
8. ✅ Signature capture works
9. ✅ Submission creates entry in Checklists database
10. ✅ Offline mode queues submission

## Step 6: Common Field Patterns

### Yes/No Questions

```json
{
  "id": "equipment_working",
  "type": "checkbox",
  "label": "Is the equipment working properly?",
  "required": true
}
```

### Text Input with Limit

```json
{
  "id": "notes",
  "type": "text",
  "label": "Notes",
  "placeholder": "Enter notes here...",
  "multiline": true,
  "validation": {
    "maxLength": 500
  }
}
```

### Number with Range

```json
{
  "id": "temperature",
  "type": "number",
  "label": "Temperature (°F)",
  "required": true,
  "validation": {
    "min": 32,
    "max": 100,
    "alert": "Temperature must be between 32°F and 100°F"
  }
}
```

### Time Entry

```json
{
  "id": "start_time",
  "type": "time",
  "label": "Start time",
  "required": true
}
```

### Photo Capture

```json
{
  "id": "damage_photos",
  "type": "photo",
  "label": "Photos of damage",
  "maxPhotos": 5
}
```

### Signature

```json
{
  "id": "manager_signature",
  "type": "signature",
  "label": "Manager signature",
  "required": true
}
```

### Conditional Field

```json
{
  "id": "issue_description",
  "type": "text",
  "label": "Describe the issue",
  "required": true,
  "multiline": true,
  "showIf": {
    "field": "has_issue",
    "value": true
  }
}
```

## Step 7: Verify Data in Notion

After submitting a form:

1. Open Checklists database
2. Find the new entry (sorted by Created time)
3. Verify all properties are populated:
   - Checklist Title
   - Type
   - Task Items (JSON of all fields)
   - Status = "Completed"
   - Completed By (Store ID)
   - Completed Date
   - Photo URLs (if photos uploaded)
   - Signature Data (if signature captured)

## Troubleshooting

### Form Won't Load

- Verify `formId` matches Form Definitions database exactly
- Check browser console for API errors
- Verify session token is valid
- Check Notion API permissions

### Photos Won't Upload

- Check PHP max upload size (`php.ini`)
- Verify photo upload endpoint in `notion-proxy.php`
- Test camera permissions on device
- Check network connectivity

### Auto-Save Not Working

- Open browser DevTools → Application → IndexedDB
- Check `forms-db` database exists
- Verify `saved-forms` store has entries
- Check console for errors

### Submission Fails

- Verify all required fields are filled
- Check Checklists database has all required properties
- Review API error in network tab
- Test with minimal form first

### Conditional Fields Not Showing

- Verify `showIf` field ID exists in same section
- Check value type matches (boolean, string, number)
- Test with browser console: `formStore.getState().formData`

## Performance Tips

1. **Keep sections small** - 5-10 fields per section
2. **Limit photo uploads** - Max 3-5 photos
3. **Use validation** - Prevent bad data early
4. **Test offline mode** - Queue works offline
5. **Monitor IndexedDB** - Clear old data periodically

## Next Steps

1. Create your first form schema
2. Add to Form Definitions database
3. Test in app
4. Review submitted data in Checklists
5. Create more forms as needed

## Need Help?

Common issues:

- Schema validation errors → Check JSON syntax
- API errors → Review PHP backend logs
- Network errors → Check CORS headers
- Storage errors → Clear IndexedDB and retry

Refer to:

- `README.md` - Full feature documentation
- `types.ts` - TypeScript interfaces
- `formService.ts` - API integration
- `formStore.ts` - State management
