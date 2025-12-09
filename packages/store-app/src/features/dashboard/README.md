# Dashboard Feature

Main dashboard screen with quick action cards, navigation, and offline support.

## Components

### Dashboard

Main dashboard screen with welcome message, time display, and quick action cards.

**Features:**

- Welcome message with store name and user name
- Current date/time (updates every minute)
- Grid of quick action cards (2 columns mobile, 3+ on tablet/desktop)
- Offline banner when disconnected
- Sync queue status indicator
- Pull-to-refresh support (simulated)

**Usage:**

```tsx
import { Dashboard } from "@/features/dashboard";

<Route path="/dashboard" element={<Dashboard />} />;
```

### DashboardCard

Large touch-optimized card for quick actions.

**Features:**

- 120×120px minimum size
- Icon with title and subtitle
- Badge for notifications
- Disabled state for offline-only features
- Press animation (scale down)

**Props:**

```tsx
interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: number;
  onClick: () => void;
  disabled?: boolean;
}
```

### BottomNav

Fixed bottom navigation bar for main app sections.

**Features:**

- 4 navigation items: Home, Forms, History, More
- 56px touch targets
- Active state with blue indicator
- Keyboard accessible
- ARIA navigation labels

**Navigation Items:**

- **Home** - Dashboard screen
- **Forms** - Available forms list
- **History** - Completed checklists
- **More** - Settings, help, logout

### OfflineBanner

Status banner shown when offline.

**Features:**

- Fixed at top of screen
- Yellow/orange background
- Shows sync queue count
- Dismissible with X button
- Auto-hides when online
- ARIA live region for screen readers

### SyncQueueStatus

Displays pending sync items and sync status.

**Features:**

- Shows count of pending items
- Animated spinner when syncing
- Checkmark when synced
- Click to see detail modal
- Failed item indicators
- Auto-retry logic (30 seconds)

## State Management

### dashboardStore

Zustand store for dashboard state.

```tsx
interface DashboardState {
  isOnline: boolean;
  syncQueue: SyncQueueItem[];
  isSyncing: boolean;
  lastSyncTime: Date | null;
  showOfflineBanner: boolean;
  dismissOfflineBanner: () => void;
  syncQueueItems: () => Promise<void>;
}
```

**Usage:**

```tsx
import { useDashboardStore } from "@/features/dashboard";

const isOnline = useDashboardStore((state) => state.isOnline);
const syncQueue = useDashboardStore((state) => state.syncQueue);
```

## Quick Action Cards

Default cards configured in Dashboard:

1. **Opening Checklist** - Food safety & store prep (offline capable)
2. **Daily Tasks** - Cleaning & operations (offline capable, badge: 3)
3. **Weekly Tasks** - Inventory & deep clean (offline capable)
4. **Request Replacement** - Menu item changes (requires online)
5. **View History** - Completed checklists (requires online)
6. **Settings** - Store info & logout (offline capable)

## Navigation Flow

```
Login → Dashboard
  ↓
  ├─ Tap card → Navigate to feature/form
  ├─ Bottom nav → Switch main sections
  └─ Back → Previous screen or dashboard
```

## Offline Behavior

**Offline-capable features:**

- Opening Checklist
- Daily Tasks
- Weekly Tasks
- Settings

**Requires online:**

- Request Replacement
- View History

**Auto-sync:**

- Queue submissions when offline
- Auto-sync when connection restored
- Show sync status in header
- Retry failed items every 30 seconds

## Accessibility

- ✅ All interactive elements keyboard accessible
- ✅ Screen reader announces navigation changes
- ✅ ARIA labels on all navigation items
- ✅ High contrast support
- ✅ Focus management on route changes
- ✅ Touch targets ≥56px

## Example: Custom Dashboard Cards

```tsx
import { Dashboard } from "@/features/dashboard";
import { Star } from "lucide-react";

// Add custom card to dashboard
const customCards = [
  {
    id: "custom",
    title: "Special Task",
    subtitle: "Description",
    icon: Star,
    badge: 5,
    route: "/custom",
    requiresOnline: false,
  },
];
```

## Integration with Other Features

### With Auth

```tsx
import { useAuthStore } from "@/features/auth";

const user = useAuthStore((state) => state.user);
// Display user.name and user.storeName in header
```

### With Forms

```tsx
import { useFormStore } from "@/features/forms";

const queuedSubmissions = useFormStore((state) => state.queuedSubmissions);
// Pass to dashboardStore.syncQueue
```

## Styling

Uses component library and TailwindCSS:

- Background: `bg-slate-50`
- Cards: `bg-white shadow-md`
- Primary color: `blue-600`
- Warning: `amber-500`
- Success: `emerald-600`

## Browser Support

- ✅ Chrome/Edge
- ✅ Safari (iOS 14+)
- ✅ Firefox
- ✅ Mobile Safari
- ✅ Chrome Mobile
