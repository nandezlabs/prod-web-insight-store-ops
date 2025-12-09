# Replacement Request Feature

Complete feature for store users to request menu item replacements with photo evidence and admin approval workflow.

## Overview

The Replacement Request feature enables store managers to:

- **Search and select** inventory items to replace
- **Provide reasons** with predefined chips + custom notes
- **Add photo evidence** (up to 3 photos, camera or upload)
- **Suggest alternatives** (optional)
- **Track request status** (Pending, Approved, Rejected, Implemented)
- **View history** of all past requests

## Components

### ReplacementRequest (5-Step Wizard)

Main component with multi-step form:

1. **Select Item** - Search inventory, filter by category, recent items
2. **Reason** - Multi-select chips + additional notes (500 char max)
3. **Photos** - Camera or file upload (up to 3, compressed to 1200px)
4. **Suggest Replacement** - Optional alternative item selection
5. **Review** - Summary with edit buttons, submit

**Features:**

- ✅ Progress indicator (1 of 5)
- ✅ Auto-save draft to IndexedDB
- ✅ Step validation
- ✅ Back/Next navigation
- ✅ Loading states

### ItemSearch

Search and select inventory items.

**Features:**

- Real-time search by name or code
- Category filter chips (Entrees, Sides, Beverages, Desserts, Add-ons)
- Recently selected items at top
- Item cards with photo, code, category badge
- Tap to select with visual indication

### ReasonInput

Multi-select reason chips with text area.

**Predefined Reasons:**

- Low sales
- Customer complaints
- Quality issues
- Seasonal change
- Other (requires additional notes)

**Features:**

- Multi-select chips with check marks
- Character counter (500 max)
- Required field validation
- "Other" requires notes

### PhotoCapture

Camera access with preview and compression.

**Features:**

- Camera button (mobile devices)
- File upload button (fallback)
- Preview thumbnails (3-column grid)
- Delete individual photos
- Image compression (1200px max, 0.8 quality)
- File size validation (5MB max)
- Max 3 photos

### RequestHistory

View past requests with status badges.

**Features:**

- Filter by status (All, Pending, Approved, Rejected, Implemented)
- Status badges with color coding
- Relative dates ("2 days ago")
- Tap card to view detail
- Full detail modal with admin notes
- Photo gallery in detail view

## File Structure

```
src/features/replacements/
├── components/
│   ├── ReplacementRequest.tsx     # 5-step wizard (287 lines)
│   ├── RequestHistory.tsx         # Request list + detail (331 lines)
│   ├── ItemSearch.tsx             # Search + filter (152 lines)
│   ├── ItemCard.tsx               # Item display (101 lines)
│   ├── ReasonInput.tsx            # Reason chips + notes (136 lines)
│   ├── PhotoCapture.tsx           # Camera + upload (134 lines)
│   └── index.ts
├── stores/
│   └── replacementStore.ts        # Zustand state (240 lines)
├── services/
│   └── replacementService.ts      # API + IndexedDB (325 lines)
├── types.ts                       # TypeScript types (136 lines)
├── index.ts
└── README.md

Total: 11 files, ~1,850 lines
```

## Data Flow

```
ReplacementRequest (wizard)
├──> useReplacementStore (Zustand)
│    ├── Draft state (auto-saved to IndexedDB)
│    ├── Inventory items (cached)
│    └── User requests
│
├──> replacementService
│    ├── fetchInventoryItems() → Notion API
│    ├── uploadPhotos() → compress + upload
│    ├── submitRequest() → Create in Notion
│    └── fetchUserRequests() → Query user's requests
│
└──> Components
     ├── ItemSearch → Select items
     ├── ReasonInput → Capture reasons
     ├── PhotoCapture → Take/upload photos
     └── Review → Submit

RequestHistory
└──> useReplacementStore
     ├── fetchUserRequests()
     └── Display with status badges
```

## Usage

### Basic Usage

```tsx
import { ReplacementRequest } from "@/features/replacements";

<Route path="/request-replacement" element={<ReplacementRequest />} />;
```

### With Dashboard Integration

```tsx
// Dashboard quick action card
{
  id: 'replacement',
  title: 'Request Replacement',
  icon: RefreshCw,
  path: '/request-replacement',
  badge: draftExists ? '1' : undefined,
  disabled: !navigator.onLine, // Require online for submission
}
```

### Request History

```tsx
import { RequestHistory } from "@/features/replacements";

<Route path="/replacement-history" element={<RequestHistory />} />;
```

## State Management

### Zustand Store

```typescript
interface ReplacementState {
  // Form
  draft: ReplacementDraft;
  currentStep: number; // 1-5

  // Data
  inventoryItems: InventoryItem[];
  recentItems: InventoryItem[]; // Last 5 selected
  userRequests: ReplacementRequest[];

  // Actions
  setOriginalItem(item); // Step 1
  setReasons(reasons); // Step 2
  addPhoto(file); // Step 3
  setSuggestedReplacement(item); // Step 4
  submitRequest(); // Step 5

  // Navigation
  nextStep();
  previousStep();
  validateCurrentStep();
}
```

### Draft Auto-Save

Drafts are automatically saved to IndexedDB on every change:

- Original item selection
- Reason changes
- Photo additions/removals
- Suggested replacement
- Priority changes

Draft persists across page reloads and is cleared after successful submission.

## API Integration

### Fetch Inventory Items

```typescript
GET /notion-proxy.php?action=queryInventory

Response: {
  items: [
    {
      id: "item-123",
      name: "Classic Chicken Sandwich",
      code: "CH001",
      category: "Entrees",
      type: "Sandwich",
      status: "Active",
      photoUrl: "https://..."
    }
  ]
}
```

### Submit Replacement Request

```typescript
POST /notion-proxy.php?action=createReplacement
Body: {
  originalItem: "Classic Chicken Sandwich",
  originalItemId: "item-123",
  suggestedReplacement: "Spicy Chicken Sandwich",
  suggestedReplacementId: "item-456",
  reasons: ["Low sales", "Customer complaints"],
  additionalNotes: "Many complaints about dryness",
  photoUrls: ["https://photo1.jpg", "https://photo2.jpg"],
  priority: "Medium",
  requestedBy: "store-001",
  requestedByName: "Main Street Store"
}

Response: {
  request: {
    id: "req-789",
    status: "Pending",
    requestDate: "2025-12-07T10:30:00Z",
    ...
  }
}
```

### Upload Photos

```typescript
POST /upload.php
Content-Type: multipart/form-data
Body: FormData with compressed image

Response: {
  url: "https://storage.example.com/photos/req-789-1.jpg"
}
```

## Types

### ReplacementRequest

```typescript
interface ReplacementRequest {
  id?: string;
  originalItem: string;
  originalItemId: string;
  suggestedReplacement?: string;
  suggestedReplacementId?: string;
  reasons: ReasonType[];
  additionalNotes: string;
  photoUrls: string[];
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Draft" | "Pending" | "Approved" | "Rejected" | "Implemented";
  requestedBy: string;
  requestedByName: string;
  requestDate: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedDate?: string;
}
```

### InventoryItem

```typescript
interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: "Entrees" | "Sides" | "Beverages" | "Desserts" | "Add-ons";
  type: string;
  status: "Active" | "Inactive" | "Seasonal";
  photoUrl?: string;
  description?: string;
}
```

## Offline Support

### Draft Persistence

- ✅ Auto-saved to IndexedDB every change
- ✅ Restored on page load
- ✅ Cleared after submission
- ✅ Survives browser restarts

### Cached Data

- ✅ Inventory items cached in IndexedDB
- ✅ User requests cached locally
- ✅ Photos stored as File objects until upload
- ❌ Submission requires online connection

## Accessibility

- ✅ **Keyboard navigation** through all steps
- ✅ **ARIA labels** on all interactive elements
- ✅ **Progress indicator** with aria-valuenow
- ✅ **Required field** announcements
- ✅ **Error messages** with role="alert"
- ✅ **Camera fallback** (file upload)
- ✅ **Touch targets** minimum 48×48px
- ✅ **Focus management** in modal

## Photo Handling

### Compression

Images are compressed before upload:

- **Max width:** 1200px (maintains aspect ratio)
- **Quality:** 80%
- **Format:** JPEG
- **Max file size:** 5MB (original), ~500KB (compressed)

### Camera Access

```tsx
<input
  type="file"
  accept="image/*"
  capture="environment" // Rear camera
  onChange={handleCapture}
/>
```

Fallback to file picker if camera unavailable.

## Validation

### Step 1: Select Item

- ✅ Item must be selected

### Step 2: Reason

- ✅ At least one reason selected
- ✅ If "Other" selected, notes required
- ✅ Notes max 500 characters

### Step 3: Photos

- ⚠️ Optional (but recommended)
- ✅ Max 3 photos
- ✅ Max 5MB per photo

### Step 4: Suggest Replacement

- ⚠️ Optional

### Step 5: Review

- ✅ All previous steps valid
- ✅ Original item exists
- ✅ Reasons not empty

## Notion Database Schema

Create a "Replacements" database with:

| Property              | Type          | Description                              |
| --------------------- | ------------- | ---------------------------------------- |
| Replacement Request   | Title         | "{Original} → {Suggested}"               |
| Original Item         | Text          | Item name to replace                     |
| Suggested Replacement | Text          | Suggested new item (optional)            |
| Requested By          | Text          | Store ID                                 |
| Status                | Select        | Pending, Approved, Rejected, Implemented |
| Reasons               | Multi-select  | Low sales, Customer complaints, etc.     |
| Additional Notes      | Text          | Custom notes                             |
| Photos                | Files & media | Photo attachments                        |
| Priority              | Select        | Low, Medium, High, Urgent                |
| Request Date          | Date          | When submitted                           |
| Reviewed By           | Text          | Admin who reviewed                       |
| Reviewed Date         | Date          | When reviewed                            |
| Admin Notes           | Text          | Admin feedback                           |

## Performance

- ⚡ **Bundle size:** ~40KB (gzipped, excluding dependencies)
- ⚡ **Image compression:** ~90% size reduction
- ⚡ **IndexedDB caching:** Instant draft recovery
- ⚡ **Debounced search:** Smooth typing experience
- ⚡ **Lazy loading:** Components loaded on demand

## Testing Checklist

- [ ] Load replacement request form
- [ ] Search for inventory items
- [ ] Filter by category
- [ ] Select an item
- [ ] Navigate to step 2
- [ ] Select multiple reasons
- [ ] Add "Other" and type notes (500 char limit)
- [ ] Navigate to step 3
- [ ] Take photo with camera
- [ ] Upload photo from device
- [ ] Add 3 photos (max)
- [ ] Try to add 4th photo (should prevent)
- [ ] Remove a photo
- [ ] Navigate to step 4
- [ ] Search and select suggested replacement
- [ ] Clear suggestion
- [ ] Navigate to step 5 (review)
- [ ] Edit each section
- [ ] Submit request
- [ ] Verify success message
- [ ] Check request appears in history
- [ ] Go offline and check draft persists
- [ ] Reload page and verify draft restored

## Future Enhancements

- [ ] Bulk requests (replace multiple items at once)
- [ ] Request templates (save common requests)
- [ ] Push notifications for status updates
- [ ] Export request as PDF
- [ ] Request analytics dashboard
- [ ] Approval workflow for managers
- [ ] Integration with inventory management
- [ ] Trending replacement suggestions
