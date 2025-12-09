# Checklist History - Integration Guide

Step-by-step guide to integrate the Checklist History feature into your application.

## Prerequisites

Ensure these dependencies are installed:

```bash
npm install zustand framer-motion lucide-react idb
```

## Step 1: Environment Variables

Add the API endpoint to your `.env` file:

```env
VITE_API_URL=https://your-domain.com/api
```

## Step 2: Router Integration

Add the history route to your router configuration:

```tsx
// App.tsx or routes.tsx
import { Routes, Route } from "react-router-dom";
import { ChecklistHistory } from "./features/checklists";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Other routes */}
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <ChecklistHistory />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## Step 3: Bottom Navigation Integration

Update the dashboard bottom navigation to include history:

```tsx
// src/features/dashboard/components/BottomNav.tsx
import { Home, FileText, History, MoreHorizontal } from "lucide-react";

const navItems = [
  { id: "home", label: "Home", icon: Home, path: "/dashboard" },
  { id: "forms", label: "Forms", icon: FileText, path: "/forms" },
  { id: "history", label: "History", icon: History, path: "/history" }, // ← Add this
  { id: "more", label: "More", icon: MoreHorizontal, path: "/more" },
];
```

## Step 4: Backend API Setup

### PHP Endpoint (Notion Proxy)

Add the following actions to `api/notion-proxy.php`:

#### Query Checklists

```php
// Handle queryChecklists action
if ($action === 'queryChecklists') {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $pageSize = isset($_GET['pageSize']) ? (int)$_GET['pageSize'] : 20;
    $startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null;
    $endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null;
    $types = isset($_GET['types']) ? explode(',', $_GET['types']) : [];
    $statuses = isset($_GET['statuses']) ? explode(',', $_GET['statuses']) : [];
    $users = isset($_GET['users']) ? explode(',', $_GET['users']) : [];
    $search = isset($_GET['search']) ? $_GET['search'] : '';

    // Build Notion filter
    $filter = [
        'and' => []
    ];

    // Filter by date range
    if ($startDate && $endDate) {
        $filter['and'][] = [
            'property' => 'Completed Date',
            'date' => [
                'on_or_after' => $startDate,
                'on_or_before' => $endDate
            ]
        ];
    }

    // Filter by type
    if (!empty($types)) {
        $typeFilters = [];
        foreach ($types as $type) {
            $typeFilters[] = [
                'property' => 'Type',
                'select' => ['equals' => $type]
            ];
        }
        $filter['and'][] = ['or' => $typeFilters];
    }

    // Filter by status
    if (!empty($statuses)) {
        $statusFilters = [];
        foreach ($statuses as $status) {
            $statusFilters[] = [
                'property' => 'Status',
                'select' => ['equals' => $status]
            ];
        }
        $filter['and'][] = ['or' => $statusFilters];
    }

    // Filter by completed by user
    if (!empty($users)) {
        $userFilters = [];
        foreach ($users as $user) {
            $userFilters[] = [
                'property' => 'Completed By',
                'rich_text' => ['contains' => $user]
            ];
        }
        $filter['and'][] = ['or' => $userFilters];
    }

    // Search by title
    if ($search) {
        $filter['and'][] = [
            'property' => 'Title',
            'title' => ['contains' => $search]
        ];
    }

    // Query Notion database
    $response = $notionClient->queryDatabase(
        CHECKLISTS_DB_ID,
        $filter,
        [
            ['property' => 'Completed Date', 'direction' => 'descending']
        ],
        $pageSize,
        ($page - 1) * $pageSize
    );

    // Transform results
    $checklists = array_map(function($page) {
        return transformChecklistFromNotion($page);
    }, $response['results']);

    echo json_encode([
        'checklists' => $checklists,
        'total' => count($response['results']),
        'hasMore' => $response['has_more']
    ]);
    exit;
}
```

#### Get Single Checklist

```php
// Handle getChecklist action
if ($action === 'getChecklist') {
    $id = isset($_GET['id']) ? $_GET['id'] : null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing checklist ID']);
        exit;
    }

    // Get page from Notion
    $page = $notionClient->getPage($id);

    // Transform to frontend format
    $checklist = transformChecklistFromNotion($page);

    echo json_encode(['checklist' => $checklist]);
    exit;
}
```

#### Transform Helper Function

```php
// Add to notion-proxy.php or create utils file
function transformChecklistFromNotion($page) {
    $props = $page['properties'];

    return [
        'id' => $page['id'],
        'title' => $props['Title']['title'][0]['plain_text'] ?? '',
        'type' => $props['Type']['select']['name'] ?? 'Custom',
        'status' => $props['Status']['select']['name'] ?? 'Not Started',
        'completedBy' => $props['Completed By']['rich_text'][0]['plain_text'] ?? '',
        'completedDate' => $props['Completed Date']['date']['start'] ?? '',
        'dueDate' => $props['Due Date']['date']['start'] ?? null,
        'taskItems' => json_decode($props['Task Items']['rich_text'][0]['plain_text'] ?? '[]', true),
        'photoUrls' => json_decode($props['Photos']['rich_text'][0]['plain_text'] ?? '[]', true),
        'signatureData' => $props['Signature']['rich_text'][0]['plain_text'] ?? null,
        'completionPercentage' => $props['Completion']['number'] ?? 0,
        'section' => $props['Section']['select']['name'] ?? '',
        'storeId' => $props['Store ID']['rich_text'][0]['plain_text'] ?? '',
        'storeName' => $props['Store Name']['rich_text'][0]['plain_text'] ?? '',
        'notes' => $props['Notes']['rich_text'][0]['plain_text'] ?? null,
    ];
}
```

## Step 5: Notion Database Schema

Create a "Checklists" database in Notion with these properties:

| Property Name  | Type   | Description                                  |
| -------------- | ------ | -------------------------------------------- |
| Title          | Title  | Checklist name                               |
| Type           | Select | Opening, Daily, Weekly, Period, Custom       |
| Status         | Select | Not Started, In Progress, Completed, Overdue |
| Completed By   | Text   | User who completed                           |
| Completed Date | Date   | Completion timestamp                         |
| Due Date       | Date   | Optional due date                            |
| Task Items     | Text   | JSON array of task items                     |
| Photos         | Text   | JSON array of photo URLs                     |
| Signature      | Text   | Base64 signature data                        |
| Completion     | Number | Percentage (0-100)                           |
| Section        | Select | Checklist section/category                   |
| Store ID       | Text   | Store identifier                             |
| Store Name     | Text   | Store name                                   |
| Notes          | Text   | Additional notes                             |

### Sample Task Items JSON

```json
[
  {
    "id": "task-1",
    "label": "Check front door locks",
    "type": "checkbox",
    "completed": true,
    "value": true
  },
  {
    "id": "task-2",
    "label": "Temperature reading",
    "type": "number",
    "completed": true,
    "value": 72,
    "validationError": null
  },
  {
    "id": "task-3",
    "label": "Opening notes",
    "type": "text",
    "completed": true,
    "value": "Everything looks good"
  },
  {
    "id": "task-4",
    "label": "Opening time",
    "type": "time",
    "completed": true,
    "value": "08:00"
  },
  {
    "id": "task-5",
    "label": "Store condition photos",
    "type": "photo",
    "completed": true,
    "value": [
      "https://example.com/photo1.jpg",
      "https://example.com/photo2.jpg"
    ],
    "caption": "Front entrance"
  },
  {
    "id": "task-6",
    "label": "Manager signature",
    "type": "signature",
    "completed": true,
    "value": "data:image/png;base64,iVBORw0KG..."
  }
]
```

## Step 6: Test Data

Add some sample checklists to your Notion database:

```javascript
// Script to create test data (run in browser console on Notion page)
const testChecklists = [
  {
    title: "Morning Opening Checklist",
    type: "Opening",
    status: "Completed",
    completedBy: "John Doe",
    completedDate: new Date().toISOString(),
    completion: 100,
    section: "Daily Operations",
    storeId: "store-001",
    storeName: "Main Street Store",
  },
  {
    title: "Daily Inventory Check",
    type: "Daily",
    status: "Completed",
    completedBy: "Jane Smith",
    completedDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    completion: 95,
    section: "Inventory",
    storeId: "store-001",
    storeName: "Main Street Store",
  },
  // Add more test data...
];
```

## Step 7: TypeScript Configuration

Ensure `vite-env.d.ts` includes the API URL:

```typescript
// src/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // ... other env variables
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## Step 8: Testing

### Online Testing

1. Start development server: `npm run dev`
2. Navigate to `/history`
3. Verify checklists load from API
4. Test filters and search
5. Open a checklist detail
6. Test photo gallery

### Offline Testing

1. Open Chrome DevTools → Network tab
2. Set throttling to "Offline"
3. Reload `/history` page
4. Verify cached checklists load
5. Test filters (local filtering)

### Mobile Testing

1. Use Chrome DevTools device emulation
2. Test touch interactions
3. Verify 48×48px touch targets
4. Test photo gallery swipe
5. Test modal scrolling

## Step 9: Production Deployment

### Frontend Build

```bash
npm run build
```

### Environment Variables

Set production environment variables:

```env
VITE_API_URL=https://your-production-domain.com/api
```

### Backend Deployment

1. Upload `api/` directory to Hostinger
2. Set Notion API credentials in `api/config.php`
3. Test API endpoints manually
4. Enable CORS for your frontend domain

## Common Integration Issues

### Issue: Photos not loading

**Solution:** Check CORS headers on photo URLs. Add this to `.htaccess`:

```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
</IfModule>
```

### Issue: Filters not persisting

**Solution:** Verify Zustand persist middleware is configured:

```tsx
// Already configured in checklistStore.ts
persist(
  (set, get) => ({
    /* ... */
  }),
  { name: "checklist-store" }
);
```

### Issue: Infinite scroll not working

**Solution:** Check IntersectionObserver browser support. Add polyfill if needed:

```bash
npm install intersection-observer
```

```tsx
// main.tsx
import "intersection-observer";
```

## Performance Tips

1. **Enable IndexedDB caching** for faster offline access
2. **Lazy load images** in photo gallery
3. **Debounce search** (already implemented at 300ms)
4. **Use pagination** (20 items per page recommended)
5. **Compress photos** before uploading to Notion

## Security Considerations

1. **Validate all inputs** on backend
2. **Sanitize photo URLs** to prevent XSS
3. **Rate limit API requests** (use RateLimiter.php)
4. **Encrypt sensitive data** in transit (HTTPS)
5. **Validate user permissions** before showing checklists

## Next Steps

After integration:

1. Test with real checklist data
2. Gather user feedback
3. Monitor performance metrics
4. Implement PDF export (see README)
5. Add analytics tracking
6. Consider additional features (favorites, bulk export, etc.)

## Support

For issues or questions:

1. Check README.md troubleshooting section
2. Review TypeScript errors in browser console
3. Test API endpoints manually with Postman
4. Verify environment variables are set correctly
