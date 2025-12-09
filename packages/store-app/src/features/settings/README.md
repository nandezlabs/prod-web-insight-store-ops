# Settings Feature

Complete settings functionality for managing app settings, store information, account, help & support, and about information.

## Features

✅ **Store Information**: Display store details, sync status, and location
✅ **Account Management**: View logged-in store, change PIN (future), logout with confirmation
✅ **App Settings**: Photo quality, auto-sync toggle, notifications, cache management
✅ **Help & Support**: Documentation, contact support, bug reports, feature requests
✅ **About**: App version, build info, privacy policy, terms, licenses
✅ **Logout Protection**: Warning when pending items exist, keeps offline data
✅ **Accessibility**: Full keyboard navigation, ARIA labels, focus management

## Architecture

```
src/features/settings/
├── components/
│   ├── Settings.tsx              # Main settings screen
│   ├── SettingsSection.tsx       # Grouped settings section
│   ├── SettingsItem.tsx          # Individual setting row
│   ├── StoreInfo.tsx             # Store details display
│   ├── LogoutButton.tsx          # Logout with confirmation
│   └── index.ts
├── types.ts                      # TypeScript interfaces
└── index.ts                      # Main exports
```

## Components

### Settings (Main Component)

The main settings screen with all sections and navigation.

**Features:**

- Scrollable list of sections
- Back button navigation
- Responsive layout
- Dark mode support

**Sections:**

1. Store Information (card view)
2. Account
3. App Settings
4. Help & Support
5. About

**Usage:**

```tsx
import { Settings } from "@/features/settings";

function App() {
  return <Settings />;
}
```

### StoreInfo

Display store details in a card format.

**Props:**

```tsx
interface StoreInfoProps {
  storeInfo: StoreInfoData;
}

interface StoreInfoData {
  storeName: string;
  storeId: string;
  userName?: string;
  address?: string;
  geofenceRadius?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  lastSyncTime?: number;
  isOnline: boolean;
}
```

**Features:**

- Store name (bold, large)
- Store ID (gray, small)
- Address with map pin icon
- Geofence radius indicator
- Online/offline status
- Last sync timestamp
- "View on Map" button (opens Google Maps)

**Usage:**

```tsx
import { StoreInfo } from "@/features/settings";

const storeInfo = {
  storeName: "Downtown Store",
  storeId: "STORE-001",
  address: "123 Main St, City, State",
  geofenceRadius: 100,
  coordinates: { latitude: 40.7128, longitude: -74.006 },
  lastSyncTime: Date.now() - 300000,
  isOnline: true,
};

<StoreInfo storeInfo={storeInfo} />;
```

### LogoutButton

Logout button with confirmation modal and pending items warning.

**Props:**

```tsx
interface LogoutButtonProps {
  onLogout: () => void;
}
```

**Features:**

- Red button with logout icon
- Confirmation modal on click
- Shows pending sync items count
- Warning about offline data being kept
- Cancel / Logout actions

**Behavior:**

1. User clicks Logout
2. Modal shows confirmation
3. If pending items exist, shows count and warning
4. User confirms → `onLogout()` called
5. Auth store cleared, redirect to login
6. Offline data (sync queue) is preserved

**Usage:**

```tsx
import { LogoutButton } from "@/features/settings";

function Settings() {
  const handleLogout = () => {
    // Clear auth
    authStore.logout();
    // Redirect
    navigate("/login");
  };

  return <LogoutButton onLogout={handleLogout} />;
}
```

### SettingsSection

Grouped settings section with title and items.

**Props:**

```tsx
interface SettingsSectionProps {
  section: SettingsSection;
  onToggle?: (id: string, value: boolean) => void;
}

interface SettingsSection {
  id: string;
  title: string;
  items: SettingsItem[];
}
```

**Features:**

- Section title (uppercase, gray)
- Bordered card container
- Dividers between items
- Proper spacing

**Usage:**

```tsx
import { SettingsSection } from "@/features/settings";

const section = {
  id: "account",
  title: "Account",
  items: [{ id: "user", label: "User", value: "John Doe", type: "info" }],
};

<SettingsSection section={section} />;
```

### SettingsItem

Individual setting row with different types.

**Props:**

```tsx
interface SettingsItemProps {
  item: SettingsItem;
  onToggle?: (id: string, value: boolean) => void;
}

interface SettingsItem {
  id: string;
  label: string;
  value?: string;
  type: "button" | "toggle" | "select" | "info";
  icon?: LucideIcon;
  action?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}
```

**Item Types:**

**1. Info** (Read-only display)

```tsx
{
  id: 'version',
  label: 'App Version',
  value: '1.0.0',
  type: 'info',
  icon: Info,
}
```

**2. Button** (Clickable action)

```tsx
{
  id: 'clear-cache',
  label: 'Clear Cache',
  type: 'button',
  icon: Trash2,
  action: () => clearCache(),
}
```

**3. Toggle** (On/off switch)

```tsx
{
  id: 'autoSync',
  label: 'Auto-Sync',
  value: 'true',
  type: 'toggle',
  icon: RefreshCw,
}
```

**4. Select** (Opens selection - future)

```tsx
{
  id: 'photo-quality',
  label: 'Photo Quality',
  value: 'Medium',
  type: 'select',
  icon: Image,
  action: () => openPhotoQualityPicker(),
}
```

**Styling:**

- Disabled items: 50% opacity
- Destructive items: Red text and icon
- Hover effect on interactive items
- Chevron right on button/select types

## Settings Sections

### 1. Store Information

Displayed as a card at the top of the screen.

**Contents:**

- Store name and ID
- Current user name
- Address (with map icon)
- Geofence radius
- Connection status (online/offline)
- Last sync time
- "View on Map" button

### 2. Account

**Items:**

- **Logged in as**: Shows store name (info)
- **Change PIN**: Future feature (disabled button)

### 3. App Settings

**Items:**

- **Photo Quality**: Low/Medium/High selector
- **Auto-Sync**: Toggle on/off
- **Notifications**: Future feature (disabled toggle)
- **Clear Cache**: Removes cached API responses
- **Clear Offline Data**: Removes all IndexedDB data (destructive)

### 4. Help & Support

**Items:**

- **View Help Docs**: Opens help documentation
- **Contact Support**: Opens email to support
- **Report a Bug**: Opens email with bug report template
- **Request a Feature**: Opens email with feature request template

### 5. About

**Items:**

- **App Version**: Current version (info)
- **Build Number**: Build date (info)
- **Privacy Policy**: Opens privacy policy page
- **Terms of Service**: Opens terms page
- **Open Source Licenses**: Opens licenses page

## Actions

### Clear Cache

**Behavior:**

1. Removes cached API responses from localStorage
2. Keeps sync queue intact
3. Shows success message
4. No confirmation needed

**Implementation:**

```tsx
const handleClearCache = () => {
  localStorage.removeItem("api-cache");
  alert("Cache cleared successfully!");
};
```

### Clear Offline Data

**Behavior:**

1. Shows confirmation modal
2. Displays warning if pending items exist
3. "This will delete X pending submissions"
4. User confirms → clears all IndexedDB
5. Auth session preserved
6. Shows success message

**Implementation:**

```tsx
const handleClearOfflineData = async () => {
  try {
    await clearDatabase();
    setShowClearDataConfirm(false);
    alert("Offline data cleared successfully!");
  } catch (error) {
    alert("Failed to clear offline data");
  }
};
```

### Logout

**Behavior:**

1. Shows confirmation modal
2. If pending items exist, shows count and warning
3. "X items waiting to sync"
4. "Your offline data will be kept"
5. User confirms → logout action
6. Clears auth store
7. Clears session token
8. Redirects to login
9. Keeps sync queue (doesn't clear offline data)

**Implementation:**

```tsx
const handleLogout = () => {
  logout(); // From auth store
  navigate("/login");
};
```

## Accessibility

✅ **Keyboard Navigation**

- All buttons tabbable
- Toggle switches keyboard-operable
- Modal focus trap
- Proper tab order

✅ **Screen Readers**

- ARIA labels on all interactive elements
- `role="switch"` on toggles
- `aria-checked` state on toggles
- Status announcements

✅ **Visual Indicators**

- Destructive actions in red
- Disabled items grayed out
- Hover states on interactive items
- Focus rings on keyboard navigation

## Integration Example

```tsx
// App.tsx with routing
import { Settings } from "@/features/settings";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        {/* Other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

```tsx
// Link to settings from anywhere
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon } from "lucide-react";

function Header() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate("/settings")}>
      <SettingsIcon className="w-5 h-5" />
    </button>
  );
}
```

## Customization

### Adding a New Setting

```tsx
// In Settings.tsx
const sections: SettingsSectionType[] = [
  // ... existing sections
  {
    id: "my-section",
    title: "My Section",
    items: [
      {
        id: "my-setting",
        label: "My Setting",
        value: "Value",
        type: "toggle", // or 'button', 'select', 'info'
        icon: MyIcon,
        action: () => handleMyAction(),
      },
    ],
  },
];
```

### Adding a New Action

```tsx
const handleMyAction = () => {
  // Your action logic
  console.log("Action triggered");
};
```

### Customizing Toggle Behavior

```tsx
const handleToggle = (id: string, value: boolean) => {
  if (id === "my-toggle") {
    setMyState(value);
    // Additional logic
  }
};
```

## TypeScript Types

```tsx
type SettingsItemType = "button" | "toggle" | "select" | "info";

interface SettingsItem {
  id: string;
  label: string;
  value?: string;
  type: SettingsItemType;
  icon?: LucideIcon;
  action?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

interface SettingsSection {
  id: string;
  title: string;
  items: SettingsItem[];
}

interface StoreInfoData {
  storeName: string;
  storeId: string;
  userName?: string;
  address?: string;
  geofenceRadius?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  lastSyncTime?: number;
  isOnline: boolean;
}

interface PhotoQuality {
  value: "low" | "medium" | "high";
  label: string;
  description: string;
}

interface AppSettings {
  photoQuality: PhotoQuality["value"];
  autoSync: boolean;
  notifications: boolean;
}
```

## Future Enhancements

- [ ] Change PIN functionality
- [ ] Push notifications toggle
- [ ] Theme selection (light/dark/system)
- [ ] Language selection
- [ ] Photo quality descriptions
- [ ] Storage usage indicator
- [ ] Export settings
- [ ] Import settings
- [ ] Advanced settings section
- [ ] Developer options
