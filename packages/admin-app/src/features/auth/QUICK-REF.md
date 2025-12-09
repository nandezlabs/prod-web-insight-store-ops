# Auth System - Quick Reference

## 🚀 Quick Start

### Login

```tsx
// Already implemented in App.tsx
<Route path="/login" element={<LoginPage />} />
```

### Protect Routes

```tsx
import { ProtectedRoute } from "@/features/auth";

<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>;
```

### Check Permissions

```tsx
import { AuthGuard, usePermissions } from "@/features/auth";

// Component guard
<AuthGuard permissions={["edit"]}>
  <Button>Edit</Button>
</AuthGuard>;

// Hook
const { hasPermission } = usePermissions();
if (hasPermission("delete")) {
  /* ... */
}
```

### Access User

```tsx
import { useAuthStore } from "@/features/auth";

const { user, logout } = useAuthStore();
// user.name, user.email, user.role, user.permissions
```

## 🔐 Security

- **Rate Limit:** 5 attempts / 15 min
- **Session:** 8 hours
- **Auto-refresh:** Every 5 min if needed
- **Storage:** localStorage (remember) or sessionStorage

## 📋 API Endpoints

```
POST /api/admin/auth.php
{
  "email": "admin@example.com",
  "password": "Pass1234",
  "action": "login" | "logout" | "refresh"
}
```

## 🎯 Common Permissions

```typescript
"manage_users";
"approve_replacements";
"edit_content";
"view_analytics";
"manage_settings";
```

## 🧪 Test Credentials (Development)

**Email:** Any valid email  
**Password:** Any value (validates format)  
**Result:** Returns mock admin user

## 📚 Full Docs

See `src/features/auth/README.md` for complete documentation.
