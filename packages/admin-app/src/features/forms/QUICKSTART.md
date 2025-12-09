# Form Builder - Quick Start Guide

Get started with the Form Builder in 5 minutes.

## Overview

The Form Builder allows you to create dynamic checklists and forms with drag-and-drop functionality. Perfect for:

- Opening/closing checklists
- Daily operational tasks
- Weekly inventory audits
- Custom inspection forms

## Getting Started

### 1. Navigate to Form Builder

From the admin dashboard sidebar, click **Forms** to access the Form Builder.

### 2. Create Your First Form

Click the **Create Form** button in the top right.

You'll see three panels:

- **Left**: Field Library with available field types
- **Center**: Form Canvas where you build
- **Right**: Property Editor for customization

### 3. Set Form Details

At the top of the canvas:

1. Enter a **Form Title** (e.g., "Morning Opening Checklist")
2. Select a **Form Type** from the dropdown:
   - Opening
   - Daily
   - Weekly
   - Period
   - Custom

### 4. Add a Section

Click **Add Section** button. A section groups related fields together.

Click on the section to edit its properties in the right panel:

- Section Title (e.g., "Safety Checks")
- Description (optional instructions)

### 5. Add Fields

Drag fields from the **Field Library** into your section:

**Available Field Types:**

- 📋 **Checkbox**: For yes/no tasks
- 📝 **Text**: For short text entries
- 🔢 **Number**: For numeric values
- 🕐 **Time**: For time selection
- 📷 **Photo**: For image uploads
- ✍️ **Signature**: For digital signatures
- 📌 **Heading**: For section titles (non-input)
- ➖ **Divider**: For visual separation (non-input)

### 6. Configure Fields

Click any field in the canvas to edit its properties:

**Basic Properties:**

- Label: The question or instruction
- Required: Toggle if field must be filled
- Help Text: Additional instructions

**Validation (for number/text fields):**

- Min/Max values
- Character limits
- Custom error messages

**Conditional Logic:**

- Show field only when conditions are met
- Example: "Show 'Reason' field if 'Issue Found' = Yes"

### 7. Organize Your Form

**Reorder Fields:**

- Drag fields up/down within a section

**Add More Sections:**

- Click "Add Section" for new groups
- Each section can have unlimited fields

**Duplicate Fields:**

- Click the duplicate icon on any field
- Useful for similar questions

**Delete Fields/Sections:**

- Click the trash icon
- Confirm deletion

### 8. Preview Your Form

Click **Preview** button to see how users will experience the form.

### 9. Save Your Form

Your form auto-saves every 30 seconds when you have unsaved changes.

Manual save:

- Click **Save** button in top right
- Status shows "Saved just now"

### 10. Export & Share

**Export JSON:**

- Click **Export** to download form schema
- Use for backups or integration

**View JSON:**

- Click **JSON** to see the raw schema
- Helpful for developers

## Example: Opening Checklist

Here's a quick example to try:

1. **Create form**: "Store Opening Checklist" (Type: Opening)

2. **Add Section 1**: "Safety & Security"

   - ☑️ Alarm disarmed
   - ☑️ Doors unlocked
   - ☑️ Lights on
   - 🕐 Opening time

3. **Add Section 2**: "Equipment Check"

   - ☑️ POS system running
   - ☑️ Temperature check
   - 🔢 Temperature reading (with min/max validation)
   - 📷 Equipment photo

4. **Add Section 3**: "Sign-off"
   - ✍️ Manager signature
   - 📝 Notes (optional)

## Tips & Tricks

### Organizing Large Forms

- Use **Headings** to break up long sections
- Group related fields in sections
- Use **Dividers** for visual separation

### Validation Best Practices

- Add helpful error messages
- Set reasonable min/max limits
- Use required only when necessary

### Conditional Logic

- Keep conditions simple
- Avoid circular dependencies
- Test your logic in preview

### Performance

- Forms auto-save every 30 seconds
- Large forms may take longer to save
- Export JSON regularly for backups

## Common Use Cases

### Daily Checklist

```
Type: Daily
Sections:
  - Morning Tasks (opening tasks)
  - Afternoon Tasks (mid-day checks)
  - Evening Tasks (closing procedures)
```

### Inventory Audit

```
Type: Weekly
Sections:
  - Dry Goods (count items)
  - Refrigerated (temperature + count)
  - Frozen (temperature + count)
  - Discrepancies (photos + notes)
```

### Incident Report

```
Type: Custom
Sections:
  - Incident Details (date, time, location)
  - Description (text fields)
  - Witnesses (text fields)
  - Actions Taken (checkboxes)
  - Manager Review (signature)
```

## Keyboard Shortcuts

- `Esc`: Deselect field/section
- `Delete`: Delete selected field (with confirmation)
- `Ctrl/Cmd + S`: Manual save

## Getting Help

- Hover over field types in library for descriptions
- Check tooltips on buttons
- See full documentation in `FORM-BUILDER.md`

## Next Steps

1. ✅ Create your first form
2. 📋 Build opening/closing checklists
3. 🔄 Duplicate and customize for different locations
4. 📊 View submissions in dashboard (coming soon)
5. 🔗 Integrate with Notion database

Happy form building! 🎉
