# Inventory Management System

A comprehensive inventory management feature with full CRUD operations, advanced filtering, bulk actions, and CSV import/export capabilities.

## Features

### ✅ Complete CRUD Operations

- **Create**: Add new inventory items with detailed information
- **Read**: View all items in a sortable, paginated data table
- **Update**: Edit existing item details
- **Delete**: Soft delete items (marks as "Pending Delete")

### 🔍 Advanced Filtering

- **Search**: Filter by item name or code
- **Categories**: Multi-select category filters (Protein, Vegetables, Grains, etc.)
- **Types**: Multi-select type filters (Entree, Bowl, Sides, etc.)
- **Status**: Filter by Active, Discontinued, or Pending Delete
- **Active Filter Count**: Visual indicator of applied filters
- **Clear Filters**: One-click reset

### 📊 Data Table (@tanstack/react-table)

- **Sortable Columns**: Click headers to sort by any column
- **Pagination**: 50 items per page with page navigation
- **Row Selection**: Checkbox selection for bulk operations
- **Responsive Design**: Horizontal scroll on mobile
- **Loading States**: Skeleton screens during data fetch
- **Empty States**: Helpful messages when no items found

### 🔢 Bulk Operations

- **Select All**: Toggle select all items on current page
- **Bulk Delete**: Delete multiple items at once
- **Bulk Status Update**: Change status for multiple items
- **Bulk Export**: Export selected items to CSV
- **Selection Count**: Shows number of selected items

### 📥 CSV Import/Export

- **Import CSV**: Upload and validate CSV files
- **Data Validation**: Check for required fields and valid values
- **Preview**: Review data before importing
- **Error Handling**: Detailed error messages for invalid data
- **Export**: Download inventory as CSV file

### 📷 Photo Upload

- **Image Upload**: Attach photos to inventory items
- **Preview**: See uploaded images before saving
- **Validation**: File type and size validation (max 5MB)
- **Remove**: Delete uploaded photos

## Architecture

### Components

#### InventoryTable

`src/features/inventory/components/InventoryTable.tsx`

Main data table using @tanstack/react-table:

- Sortable columns (name, code, category, type, status)
- Checkbox selection column
- Actions column (edit, delete)
- Pagination controls
- Loading skeleton
- Empty state

**Props:**

```typescript
{
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}
```

#### InventoryFilters

`src/features/inventory/components/InventoryFilters.tsx`

Advanced filtering interface:

- Search input with debounce
- Status dropdown
- Multi-select category filter
- Multi-select type filter
- Filter tags with remove buttons
- Active filter count badge
- Clear all filters button

#### BulkActions

`src/features/inventory/components/BulkActions.tsx`

Bulk operation toolbar:

- Shows when items are selected
- Select all checkbox
- Selection count
- Clear selection button
- Delete selected button
- Actions dropdown (status updates, export)

#### AddItemModal

`src/features/inventory/components/AddItemModal.tsx`

Form for creating new items:

- Required fields: name, code, category, type
- Optional: description, photo, status
- Real-time validation
- Unique code check
- Photo upload with preview
- Error messages

#### EditItemModal

`src/features/inventory/components/EditItemModal.tsx`

Form for editing existing items:

- Pre-filled with current values
- Same validation as AddItemModal
- Updates only changed fields

#### DeleteConfirm

`src/features/inventory/components/DeleteConfirm.tsx`

Confirmation dialog for delete operations:

- Shows item details
- Soft delete explanation
- Cancel/confirm actions

#### ImportCSV

`src/features/inventory/components/ImportCSV.tsx`

CSV import wizard:

- File upload
- CSV parsing with papaparse
- Data validation
- Preview table
- Error reporting
- Import confirmation

### State Management

**Store**: `inventoryStore.ts` (Zustand)

State:

- `items`: Array of inventory items
- `isLoading`: Loading state
- `error`: Error message
- `filters`: Current filter values
- `selectedItems`: IDs of selected items
- `currentPage`: Current page number
- `pageSize`: Items per page (50)
- `totalCount`: Total items count

Actions:

- `fetchItems()`: Load all items from API
- `createItem(item)`: Add new item
- `updateItem(id, updates)`: Update existing item
- `deleteItem(id)`: Soft delete item
- `setFilters(filters)`: Update filters
- `clearFilters()`: Reset all filters
- `toggleSelectItem(id)`: Toggle item selection
- `toggleSelectAll()`: Select/deselect all on page
- `clearSelection()`: Clear all selections
- `bulkDelete()`: Delete selected items
- `bulkUpdateStatus(status)`: Update status for selected
- `bulkExport()`: Export selected items
- `setPage(page)`: Change current page
- `getFilteredItems()`: Get filtered results
- `getPaginatedItems()`: Get current page items

### Services

**inventoryService.ts**

API integration:

- `getAllItems()`: GET /api/inventory
- `getItemById(id)`: GET /api/inventory/:id
- `createItem(item)`: POST /api/inventory
- `updateItem(id, item)`: PUT /api/inventory/:id
- `deleteItem(id)`: PATCH /api/inventory/:id (soft delete)
- `bulkDelete(ids)`: POST /api/inventory/bulk-delete
- `bulkUpdateStatus(ids, status)`: POST /api/inventory/bulk-status
- `uploadPhoto(file)`: POST /api/inventory/upload-photo
- `importItems(items)`: POST /api/inventory/import
- `exportToCSV(items)`: Client-side CSV generation
- `isCodeUnique(code, excludeId?)`: Uniqueness check
- `getMockItems()`: Development mock data

## Data Structure

### InventoryItem

```typescript
{
  id: string;
  name: string;                    // Item name
  code: string;                    // Unique identifier
  category: InventoryCategory;     // Protein, Vegetables, etc.
  type: InventoryType;             // Entree, Bowl, Sides, etc.
  description?: string;            // Optional description
  photoUrl?: string;               // Optional photo URL
  status: InventoryStatus;         // Active, Pending Delete, Discontinued
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp
}
```

### Categories

- Protein
- Vegetables
- Grains
- Sauces
- Toppings
- Beverages
- Packaging
- Supplies

### Types

- Entree
- Bowl
- Sides
- Appetizer
- Dessert
- Beverage
- Ingredient
- Supply

### Status

- **Active**: Item is currently in use
- **Discontinued**: Item no longer available
- **Pending Delete**: Marked for deletion (soft delete)

## Usage

### Adding an Item

```typescript
import { useInventoryStore } from "@/features/inventory";

function MyComponent() {
  const { createItem } = useInventoryStore();

  const handleAdd = async () => {
    await createItem({
      name: "Orange Chicken",
      code: "ENT-ORC-001",
      category: "Protein",
      type: "Entree",
      description: "Crispy chicken with orange sauce",
      status: "Active",
    });
  };
}
```

### Filtering Items

```typescript
const { setFilters, clearFilters } = useInventoryStore();

// Apply filters
setFilters({
  search: "chicken",
  categories: ["Protein"],
  types: ["Entree"],
  status: "Active",
});

// Clear filters
clearFilters();
```

### Bulk Operations

```typescript
const { selectedItems, bulkDelete, bulkUpdateStatus } = useInventoryStore();

// Delete selected
await bulkDelete();

// Update status
await bulkUpdateStatus("Discontinued");
```

### CSV Import

```typescript
import Papa from "papaparse";

// CSV format:
// name,code,category,type,description,status
// Orange Chicken,ENT-ORC-001,Protein,Entree,Crispy chicken,Active

Papa.parse(file, {
  header: true,
  complete: (results) => {
    const items = results.data.map((row) => ({
      name: row.name,
      code: row.code,
      category: row.category,
      type: row.type,
      description: row.description,
      status: row.status || "Active",
    }));

    await inventoryService.importItems(items);
  },
});
```

### CSV Export

```typescript
const { bulkExport } = useInventoryStore();

// Export all filtered items
bulkExport();

// Or export specific items
inventoryService.exportToCSV(items);
```

## Notion Integration

Items can be synced to Notion Inventory database with this structure:

```typescript
{
  "Item Name": string,
  "Item Code": string,
  "Category": select,
  "Type": select,
  "Description": text,
  "Photo": file,
  "Status": select,
  "Created": date,
  "Updated": date
}
```

## Keyboard Accessibility

- **Tab**: Navigate between interactive elements
- **Enter**: Activate buttons and links
- **Escape**: Close modals
- **Space**: Toggle checkboxes
- **Arrow Keys**: Navigate table rows
- **Ctrl/Cmd + A**: Select all (in table context)

## Best Practices

### Performance

- Pagination limits rendered items to 50 per page
- Filtered results computed on-demand
- Debounce search input to reduce re-renders
- Use React.memo for table cells in large datasets

### Data Validation

- Required fields enforced
- Unique code validation
- Category/type must match predefined lists
- File size limits for photos
- CSV format validation before import

### Error Handling

- API errors displayed to user
- Validation errors shown inline
- Bulk operation failures reported
- CSV import errors with row numbers

### User Experience

- Confirmation dialogs for destructive actions
- Loading states during async operations
- Empty states with helpful messages
- Success feedback after operations
- Keyboard shortcuts for power users

## Troubleshooting

### Items not loading

- Check API endpoint configuration
- Verify VITE_API_URL environment variable
- Check browser console for errors
- Ensure mock data returns if API fails

### CSV import fails

- Verify CSV headers match expected format
- Check for special characters in data
- Ensure categories/types match valid values
- Review validation errors in preview

### Photos not uploading

- Check file size (max 5MB)
- Verify file type is image/\*
- Check upload API endpoint
- Review network tab for errors

### Filters not working

- Clear browser cache
- Check filter state in Redux DevTools
- Verify getFilteredItems() logic
- Reset filters and try again

## Future Enhancements

- [ ] Advanced search with operators (AND, OR)
- [ ] Saved filter presets
- [ ] Item history/audit log
- [ ] Barcode scanning
- [ ] Low stock alerts
- [ ] Inventory forecasting
- [ ] Multi-store inventory tracking
- [ ] Supplier management
- [ ] Price tracking
- [ ] Expiration date tracking
- [ ] Batch/lot number tracking
- [ ] QR code generation
