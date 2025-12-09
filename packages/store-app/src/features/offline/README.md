# Offline Sync Feature

Complete offline sync functionality for managing pending submissions when offline with automatic sync when online.

## Features

✅ **Queue Management**: View and manage all pending items waiting to sync
✅ **Auto-Sync**: Automatically syncs when coming back online
✅ **Retry Logic**: Exponential backoff retry mechanism (max 5 attempts)
✅ **Conflict Resolution**: Handle sync conflicts with manual resolution UI
✅ **Status Indicator**: Global sync status in app header with pending count
✅ **Error Handling**: Smart error handling for network, auth, validation, and quota errors
✅ **Accessibility**: Full keyboard navigation and screen reader support

## Architecture

```
src/features/offline/
├── components/
│   ├── SyncQueue.tsx             # Queue management UI (modal)
│   ├── SyncQueueItem.tsx         # Individual pending item card
│   ├── SyncStatus.tsx            # Global sync indicator (header)
│   ├── ConflictResolver.tsx      # Conflict resolution modal
│   └── index.ts
├── stores/
│   └── syncStore.ts              # Zustand store for sync state
├── services/
│   └── syncService.ts            # Sync logic & retry mechanism
├── types.ts                      # TypeScript interfaces
└── index.ts                      # Main exports
```

## IndexedDB Schema

### `syncQueue` Table

| Column        | Type                                             | Description               |
| ------------- | ------------------------------------------------ | ------------------------- |
| `id`          | UUID                                             | Unique identifier         |
| `type`        | `'checklist' \| 'replacement' \| 'photo'`        | Item type                 |
| `data`        | JSON                                             | Submission data           |
| `attempts`    | number                                           | Retry count               |
| `status`      | `'pending' \| 'syncing' \| 'failed' \| 'synced'` | Current status            |
| `createdAt`   | timestamp                                        | Creation time             |
| `lastAttempt` | timestamp                                        | Last sync attempt         |
| `error`       | string                                           | Error message (if failed) |

**Indexes:**

- `by-status`: Query items by status
- `by-type`: Query items by type

## Usage

### 1. Add Item to Sync Queue

```tsx
import { useSyncStore } from '@/features/offline';

function MyComponent() {
  const addToQueue = useSyncStore((state) => state.addToQueue);

  const handleSubmit = async (data) => {
    // Add to queue (auto-syncs if online)
    addToQueue({
      type: 'checklist',
      data: {
        checklistType: 'Opening',
        items: [...],
        photos: [...]
      }
    });
  };
}
```

### 2. Display Sync Status

```tsx
import { SyncStatus, SyncQueue } from "@/features/offline";
import { useState } from "react";

function AppHeader() {
  const [showQueue, setShowQueue] = useState(false);

  return (
    <header>
      {/* Other header content */}
      <SyncStatus onClick={() => setShowQueue(true)} />

      <SyncQueue isOpen={showQueue} onClose={() => setShowQueue(false)} />
    </header>
  );
}
```

### 3. Manual Sync Trigger

```tsx
import { startSync } from "@/features/offline";

function ManualSyncButton() {
  return <button onClick={() => startSync()}>Sync Now</button>;
}
```

## Auto-Sync Behavior

### Triggers

- When item is added to queue (if online)
- When device comes back online (online event)
- Every 30 seconds (auto-retry for failed items)

### Retry Strategy

- **Max attempts**: 5
- **Delays**: 5s → 15s → 30s → 60s → 120s (exponential backoff)
- **FIFO order**: Items synced in order added

### Error Handling

| Error Type           | Action                              |
| -------------------- | ----------------------------------- |
| **Network error**    | Retry automatically with backoff    |
| **Auth error**       | Redirect to login, keep in queue    |
| **Validation error** | Mark as failed, require user action |
| **Quota error**      | Pause sync, show message            |
| **Conflict error**   | Show conflict resolver              |

## Components

### SyncStatus

Small indicator showing online/offline status with pending count badge.

**States:**

- 🟢 Green: Online & synced
- 🟡 Yellow: Online, syncing or pending items
- 🔴 Red: Offline

**Props:**

```tsx
interface SyncStatusProps {
  onClick?: () => void;
}
```

### SyncQueue

Full-screen modal for queue management.

**Features:**

- Header with pending count
- "Sync All Now" button
- Items grouped by type
- Empty state when all synced
- Offline warning

**Props:**

```tsx
interface SyncQueueProps {
  isOpen: boolean;
  onClose: () => void;
}
```

### SyncQueueItem

Individual queue item card.

**Features:**

- Type icon and title
- Status badge
- Created timestamp
- Retry count (if > 0)
- Actions: Retry, View Details, Delete
- Expandable error message

**Props:**

```tsx
interface SyncQueueItemProps {
  item: SyncQueueItem;
}
```

### ConflictResolver

Modal for resolving sync conflicts.

**Features:**

- Side-by-side comparison
- Resolution options:
  - Keep local version
  - Keep server version
  - Merge manually (JSON editor)
- Multiple conflicts support
- Skip or Resolve actions

**Props:**

```tsx
interface ConflictResolverProps {
  isOpen: boolean;
  onClose: () => void;
}
```

## Store API

### State

```tsx
{
  queue: SyncQueueItem[];
  isOnline: boolean;
  isSyncing: boolean;
  conflicts: SyncConflict[];
}
```

### Actions

```tsx
addToQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'attempts' | 'status'>): void
removeFromQueue(itemId: string): void
updateItemStatus(itemId: string, status: SyncStatus, error?: string): void
incrementAttempts(itemId: string): void
clearQueue(): void
setOnlineStatus(isOnline: boolean): void
setSyncing(isSyncing: boolean): void
addConflict(conflict: SyncConflict): void
resolveConflict(itemId: string, resolution: 'local' | 'server' | 'merge', mergedData?: any): void
getPendingCount(): number
getFailedItems(): SyncQueueItem[]
```

## Service API

### Functions

```tsx
// Start sync process
startSync(): Promise<void>

// Retry specific item
retryItem(itemId: string): Promise<void>

// Start/stop auto-retry
startAutoRetry(): void
stopAutoRetry(): void
```

## Sync Process Flow

### For Checklists

1. Upload photos first (get URLs)
2. Create page in Checklists database
3. Update page with photo URLs
4. Log to Analytics & Logs
5. Remove from queue on success

### For Replacements

1. Upload photos (get URLs)
2. Create page in Replacements database
3. Log event
4. Remove from queue

### For Photos

1. Upload to storage
2. Get URL
3. Update parent record
4. Remove from queue

## Accessibility

- ✅ Status changes announced to screen readers
- ✅ Keyboard navigation through queue
- ✅ Clear, actionable error messages
- ✅ ARIA labels on all interactive elements
- ✅ Focus management in modals

## Integration Example

```tsx
// App.tsx
import { SyncStatus, SyncQueue } from "@/features/offline";
import { useState } from "react";

function App() {
  const [showSyncQueue, setShowSyncQueue] = useState(false);

  return (
    <div>
      <header>
        <h1>Store App</h1>
        <SyncStatus onClick={() => setShowSyncQueue(true)} />
      </header>

      <main>{/* Your app content */}</main>

      <SyncQueue
        isOpen={showSyncQueue}
        onClose={() => setShowSyncQueue(false)}
      />
    </div>
  );
}
```

## Testing

### Manual Testing Checklist

- [ ] Add item while online (should sync immediately)
- [ ] Add item while offline (should queue)
- [ ] Go offline then online (should auto-sync)
- [ ] Force failure (test retry mechanism)
- [ ] Test max retries (should stop after 5)
- [ ] Test conflict resolution
- [ ] Test delete from queue
- [ ] Test clear all queue
- [ ] Verify accessibility (keyboard, screen reader)

## Performance Notes

- Queue persisted in IndexedDB (survives page refresh)
- Store state persisted with Zustand persist middleware
- Auto-retry runs every 30s (minimal battery impact)
- Photos uploaded before creating records (efficient)

## Future Enhancements

- [ ] Batch sync multiple items
- [ ] Progress indicators for large uploads
- [ ] Network quality detection
- [ ] Background sync with Service Workers
- [ ] Delta sync for updates
- [ ] Compression for large payloads
