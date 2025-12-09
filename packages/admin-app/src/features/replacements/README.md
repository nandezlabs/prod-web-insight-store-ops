# Replacement Request Workflow

Complete approval system for store replacement requests with comprehensive admin controls.

## 📁 File Structure

```
src/features/replacements/
├── components/
│   ├── AdminNotes.tsx           # Admin note management with form
│   ├── ApprovalActions.tsx      # Approve/reject actions with keyboard shortcuts
│   ├── ReplacementFilters.tsx   # Advanced filtering UI
│   ├── ReplacementQueue.tsx     # Tabbed queue with status counts
│   ├── RequestCard.tsx          # Request summary cards
│   ├── RequestDetail.tsx        # Full-screen modal with tabs
│   ├── StatusBadge.tsx          # Color-coded status indicators
│   └── index.ts                 # Component exports
├── pages/
│   └── ReplacementsPage.tsx     # Main page orchestrator
├── services/
│   └── replacementService.ts    # API integration + 5 mock requests
├── stores/
│   └── replacementStore.ts      # Zustand state management
├── types.ts                     # TypeScript interfaces
└── index.ts                     # Feature exports
```

## ✨ Features

### Approval Queue

- **5 Status Tabs**: Pending, Approved, Rejected, Implemented, All
- **Status Counts**: Real-time counts on each tab
- **Grid Layout**: Responsive 1-3 column layout
- **Card Selection**: Checkbox selection with visual feedback

### Request Cards

- Display: Original item → Suggested replacement
- Info: Store name, requester, request date
- Indicators: Status badge, priority badge
- Metadata: Reasons (first 2 shown), photo count, admin note count
- Interactive: Hover effects, click to open detail

### Request Detail Modal

- **3 Tabs**:
  - Details: Full request information, photos, reasons
  - Admin Notes: Note history + add new note
  - Status History: Timeline with user attribution
- **Approval Actions** (Pending requests only):
  - Approve button (green)
  - Reject button (red, requires note)
  - Admin note field
- **Keyboard Shortcuts**:
  - `Esc` to close modal
  - `A` to approve (when focused)
  - `R` to reject (when focused)

### Filtering & Sorting

- **Filters**:
  - Status (All, Pending, Approved, Rejected, Implemented)
  - Store (dropdown of all stores)
  - Priority (Urgent, High, Medium, Low)
- **Sorting**:
  - By: Priority, Date, Store
  - Order: Ascending/Descending toggle
- **Expandable UI**: Collapsed by default, shows "Active" badge

### Bulk Operations

- **Select All/Deselect All**: Checkbox toggle
- **Bulk Approve**: Approve multiple requests with single note
- **Progress Tracking**: Success/failure counts
- **Selection Counter**: Shows X selected

### Admin Notes

- **Add Notes**: Textarea + send button
- **Note Display**: Author, timestamp, content
- **Visibility**: Notes visible to store users
- **Threading**: Chronological order

### Status Management

- **4 Statuses**: Pending → Approved/Rejected → Implemented
- **History Tracking**: Every status change logged
- **User Attribution**: Records who changed status
- **Optional Notes**: Add context to status changes

## 🎨 UI Components

### StatusBadge

```tsx
<StatusBadge status="Pending" />
```

- Yellow: Pending
- Green: Approved
- Red: Rejected
- Blue: Implemented

### Priority Badge

- Red: Urgent
- Orange: High
- Yellow: Medium
- Gray: Low

### RequestCard Props

```tsx
interface RequestCardProps {
  request: ReplacementRequest;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDeselect: (id: string) => void;
  onClick: () => void;
}
```

## 📊 Data Types

### ReplacementRequest

```typescript
{
  id: string;
  originalItem: string;
  suggestedReplacement?: string;
  requestedBy: string;
  storeName: string;
  storeId: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Implemented';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  reasons: string[];
  additionalNotes?: string;
  photoUrls: string[];
  adminNotes?: AdminNote[];
  reviewedBy?: string;
  reviewDate?: string;
  statusHistory: StatusHistoryEntry[];
}
```

### AdminNote

```typescript
{
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}
```

### ApprovalAction

```typescript
{
  requestId: string;
  action: 'approve' | 'reject';
  adminNote?: string; // Required for rejection
  priority?: ReplacementPriority;
  suggestedAlternative?: string;
}
```

## 🔧 State Management (Zustand)

### Store Structure

```typescript
{
  requests: ReplacementRequest[];
  isLoading: boolean;
  error: string | null;
  filters: ReplacementFilters;
  selectedRequests: string[];
  currentRequest: ReplacementRequest | null;
}
```

### Actions

- `fetchRequests()` - Load all requests
- `approveRequest(action)` - Approve single request
- `rejectRequest(action)` - Reject single request
- `bulkApprove(ids, note)` - Approve multiple requests
- `addAdminNote(id, note)` - Add admin note
- `updatePriority(id, priority)` - Change priority
- `setFilters(filters)` - Update filters
- `selectAll(requests)` - Select all visible
- `deselectAll()` - Clear selection

### Computed

- `getFilteredRequests()` - Apply filters + sorting
- `getRequestById(id)` - Find specific request

### Persistence

- Filters persisted to localStorage
- Requests fetched fresh on mount

## 🌐 API Integration

### Service Methods

```typescript
// Get all requests
await replacementService.getAllRequests();

// Approve request
await replacementService.approveRequest(action);

// Reject request
await replacementService.rejectRequest(action);

// Add admin note
await replacementService.addAdminNote(id, note);

// Bulk approve
await replacementService.bulkApprove(requestIds, note);

// Update priority
await replacementService.updatePriority(id, priority);
```

### Mock Data (5 Requests)

1. **Orange Chicken → Honey Sesame Chicken**

   - Store: Downtown Store
   - Priority: High
   - Status: Pending
   - 2 photos

2. **Beef Broccoli → Shanghai Angus Steak**

   - Store: Westside Mall
   - Priority: Urgent
   - Status: Pending
   - 1 admin note

3. **Fried Rice** (no replacement)

   - Store: Airport Location
   - Priority: Medium
   - Status: Pending

4. **Chow Mein → Lo Mein**

   - Store: University District
   - Priority: Medium
   - Status: Approved

5. **Spring Rolls → Chicken Egg Rolls**
   - Store: Suburban Plaza
   - Priority: Low
   - Status: Rejected

### Analytics Integration

- Logs approval/rejection to Analytics & Logs database
- Tracks bulk operations
- Records request metadata

### Notion Integration

- Updates page properties on approval/rejection
- Syncs status changes
- Maintains request records

## 🎯 User Workflows

### Review & Approve Workflow

1. View Pending tab (default)
2. Click request card to open detail
3. Review details, photos, reasons
4. Add admin note (optional)
5. Click Approve button
6. Request moves to Approved tab
7. Notion page updated
8. Analytics logged

### Bulk Approval Workflow

1. Select multiple pending requests (checkbox)
2. Click "Bulk Approve" button
3. Enter approval note in prompt
4. Confirm action
5. All requests approved
6. Success message with count
7. Selection cleared

### Filtering Workflow

1. Click "Filters" to expand
2. Select status, store, priority
3. Choose sort order
4. Results update automatically
5. Active filter badge shown
6. Click "Clear all" to reset

## ⌨️ Keyboard Shortcuts

- `Cmd/Ctrl + A` - Select all visible requests
- `Esc` - Close detail modal
- `A` - Approve (in detail modal)
- `R` - Reject (in detail modal)

## 🎨 Design System

### Colors

- **Primary**: Blue (interactive elements)
- **Success**: Green (approve, approved)
- **Danger**: Red (reject, rejected)
- **Warning**: Yellow (pending)
- **Info**: Blue (implemented)
- **Muted**: Gray (secondary text)

### Spacing

- Cards: 4-unit gap in grid
- Sections: 6-unit vertical spacing
- Content: 3-4 unit internal padding

### Typography

- Page Title: 3xl, bold
- Card Title: lg, semibold
- Body: base
- Metadata: sm, muted

## 📦 Dependencies

- `zustand` - State management
- `date-fns` - Date formatting
- `lucide-react` - Icons
- `axios` - HTTP client

## 🚀 Usage

```tsx
import { ReplacementsPage } from "@/features/replacements";

// In your router
<Route path="/replacements" element={<ReplacementsPage />} />;
```

## 🔄 Future Enhancements

- [ ] Export to CSV
- [ ] Email notifications on approval/rejection
- [ ] Suggested alternative tracking
- [ ] Cost analysis integration
- [ ] Implementation scheduling
- [ ] Batch import from CSV
- [ ] Advanced search
- [ ] Request analytics dashboard
- [ ] Mobile-optimized view
- [ ] Real-time updates via WebSocket
