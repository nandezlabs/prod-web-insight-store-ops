# PIN-Based Authentication System

Secure PIN authentication for store tablets with geofencing, rate limiting, and touch-optimized UI.

## Features

### 🔐 Security

- **Argon2id Password Hashing** (server-side)
- **Rate Limiting**: 5 attempts = 15-minute lockout
- **Geofence Verification**: Location-based authentication
- **Encrypted Session Storage**: Tokens stored securely in localStorage
- **Session Validation**: Automatic session checking on app load

### 📱 User Experience

- **Touch-Optimized**: 64x64px buttons for comfortable tablet use
- **Visual Feedback**: Framer Motion animations and haptic feedback
- **Clear Error Messages**: Non-technical, user-friendly language
- **Auto-Submit**: Automatically submits on 4th digit
- **Loading States**: Clear indication of processing
- **Lockout Timer**: Live countdown for rate-limited users

### ♿ Accessibility

- **Screen Reader Support**: ARIA labels and live regions
- **Keyboard Navigation**: Tab, Enter, Escape support
- **High Contrast**: Visible focus indicators
- **Semantic HTML**: Proper roles and labels

## File Structure

```
src/features/auth/
├── components/
│   ├── PinEntry.tsx          # 3x4 touch-optimized PIN pad
│   ├── LoginScreen.tsx       # Full login screen with error handling
│   └── GeofenceStatus.tsx    # Location verification indicator
├── stores/
│   └── authStore.ts          # Zustand state management
├── services/
│   └── authService.ts        # API calls to PHP backend
├── types.ts                   # TypeScript interfaces
├── index.ts                   # Public exports
└── README.md                  # This file
```

## Usage

### Basic Implementation

```tsx
import { LoginScreen } from "@/features/auth";

function App() {
  return (
    <LoginScreen
      storeId="STORE-001"
      storeName="Downtown Location"
      logoUrl="/logo.png" // Optional
    />
  );
}
```

### Using the Auth Store

```tsx
import { useAuthStore } from "@/features/auth";

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Welcome, {user?.storeName}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Session Persistence

```tsx
import { useAuthStore } from "@/features/auth";
import { useEffect } from "react";

function App() {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    // Check for existing session on app load
    checkSession();
  }, [checkSession]);

  return <YourApp />;
}
```

## API Integration

The authentication system expects a PHP backend with the following endpoint:

### POST `/api/auth.php`

#### Login Request

```json
{
  "action": "login",
  "storeId": "STORE-001",
  "pin": "1234",
  "latitude": 40.7128,
  "longitude": -74.006
}
```

#### Login Response (Success)

```json
{
  "success": true,
  "sessionToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "storeId": "STORE-001",
    "storeName": "Downtown Location",
    "role": "manager"
  }
}
```

#### Login Response (Error)

```json
{
  "success": false,
  "error": "Invalid PIN",
  "attemptsRemaining": 4
}
```

#### Rate Limit Response (423 Locked)

```json
{
  "success": false,
  "error": "Too many attempts",
  "lockedUntil": 1701967200000,
  "attemptsRemaining": 0
}
```

#### Logout Request

```json
{
  "action": "logout"
}
```

**Headers**: `Authorization: Bearer <sessionToken>`

#### Validate Session Request

```json
{
  "action": "validateSession"
}
```

**Headers**: `Authorization: Bearer <sessionToken>`

## Error Messages

The system uses clear, non-technical error messages:

| Error           | Message                                               |
| --------------- | ----------------------------------------------------- |
| Invalid PIN     | "Invalid PIN"                                         |
| Rate Limited    | "Too many attempts. Try again in X minutes"           |
| Geofence Failed | "Location verification failed. Are you at the store?" |
| Network Error   | "Network error. Please check your connection."        |
| Location Denied | "Location access denied"                              |

## Security Considerations

### Client-Side

- ✅ Session tokens encrypted in localStorage
- ✅ Auto-logout on session expiration
- ✅ Rate limiting enforced locally and server-side
- ✅ PIN never stored locally
- ✅ Clear PIN input after submission

### Server-Side Requirements

- ⚠️ **Must use Argon2id** for PIN hashing
- ⚠️ **Must validate geofence** coordinates
- ⚠️ **Must enforce rate limiting** (5 attempts/15 min)
- ⚠️ **Must validate session tokens** on protected endpoints
- ⚠️ **Never reveal** if storeId is invalid (security)

## Customization

### Changing PIN Length

```tsx
<PinEntry
  pin={pin}
  onPinChange={setPin}
  onSubmit={handleSubmit}
  onClear={handleClear}
  maxLength={6} // Change to 6-digit PIN
/>
```

### Adjusting Rate Limits

Edit `src/features/auth/stores/authStore.ts`:

```typescript
const MAX_ATTEMPTS = 5; // Change max attempts
const LOCKOUT_DURATION = 15 * 60 * 1000; // Change lockout time
```

### Custom Styling

All components use Tailwind CSS classes. Customize by editing component files or wrapping with custom styles.

## Testing Checklist

- [ ] PIN entry works with touch
- [ ] PIN entry works with keyboard
- [ ] Auto-submit on 4th digit
- [ ] Error messages display correctly
- [ ] Rate limiting triggers at 5 attempts
- [ ] Lockout timer counts down correctly
- [ ] Geolocation permission prompts
- [ ] Session persists across page reload
- [ ] Logout clears all state
- [ ] Haptic feedback works (on supported devices)
- [ ] Screen reader announces errors
- [ ] Keyboard navigation works throughout

## Dependencies

- `react` - UI framework
- `zustand` - State management
- `framer-motion` - Animations
- `lucide-react` - Icons
- `tailwindcss` - Styling

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Safari 14+
- ✅ Firefox 88+
- ⚠️ Geolocation requires HTTPS (except localhost)
- ⚠️ Haptic feedback only on supported devices

## License

Part of the store-app project.
