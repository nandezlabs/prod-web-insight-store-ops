# Dashboard Integration Guide

## Setup

The dashboard is the main screen shown after successful login. It provides quick access to all app features and shows online/offline status.

## App Router Integration

### Update App.tsx

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginScreen } from "@/features/auth";
import { Dashboard } from "@/features/dashboard";
import { DynamicForm } from "@/features/forms";
import { useAuthStore } from "@/features/auth/stores/authStore";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const sessionToken = useAuthStore((state) => state.sessionToken);

  if (!sessionToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginScreen />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/forms/:formId"
          element={
            <ProtectedRoute>
              <DynamicForm
                formId={/* get from route params */}
                onComplete={() => navigate("/dashboard")}
                onCancel={() => navigate("/dashboard")}
              />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Navigation After Login

Update the auth LoginScreen to redirect to dashboard:

```tsx
// In LoginScreen.tsx
import { useNavigate } from "react-router-dom";

function LoginScreen() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (pin: string) => {
    const success = await login(storeId, pin);
    if (success) {
      navigate("/dashboard", { replace: true });
    }
  };

  // ... rest of component
}
```

## Sync Integration

Connect the forms sync queue to the dashboard:

```tsx
// In App.tsx or a provider
import { useFormStore } from "@/features/forms";
import { useDashboardStore } from "@/features/dashboard";
import { useEffect } from "react";

function SyncProvider({ children }: { children: React.ReactNode }) {
  const formQueue = useFormStore((state) => state.queuedSubmissions);
  const dashboardSync = useDashboardStore((state) => state.syncQueue);

  useEffect(() => {
    // Sync form queue to dashboard
    const syncItems = formQueue.map((submission) => ({
      id: submission.id,
      type: "form" as const,
      title: submission.formTitle,
      timestamp: submission.timestamp,
      retryCount: submission.retryCount,
      status: "pending" as const,
    }));

    // Update dashboard store with form queue
    // Note: You'd add a setter method to dashboardStore for this
  }, [formQueue]);

  return <>{children}</>;
}
```

## Quick Action Routes

Create placeholder pages for each quick action:

### Forms Route

```tsx
// src/features/forms/FormsList.tsx
import { useNavigate } from "react-router-dom";
import { DashboardCard } from "@/features/dashboard";

export function FormsList() {
  const navigate = useNavigate();

  const forms = [
    {
      id: "opening-checklist",
      title: "Opening Checklist",
      icon: ClipboardCheck,
    },
    { id: "daily-tasks", title: "Daily Tasks", icon: ListTodo },
    // ... more forms
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Available Forms</h1>
      <div className="grid grid-cols-2 gap-4">
        {forms.map((form) => (
          <DashboardCard
            key={form.id}
            title={form.title}
            icon={form.icon}
            onClick={() => navigate(`/forms/${form.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
```

### History Route

```tsx
// src/features/history/History.tsx
import { Card, EmptyState } from "@/components";
import { History as HistoryIcon } from "lucide-react";

export function History() {
  const [checklists, setChecklists] = useState([]);

  if (checklists.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={HistoryIcon}
          title="No history yet"
          description="Completed checklists will appear here"
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">History</h1>
      {/* List of completed checklists */}
    </div>
  );
}
```

### Settings Route

```tsx
// src/features/settings/Settings.tsx
import { Card, Button } from "@/components";
import { useAuthStore } from "@/features/auth";
import { useNavigate } from "react-router-dom";

export function Settings() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card title="Store Information">
        <dl className="space-y-2">
          <div>
            <dt className="text-sm text-slate-600">Store ID</dt>
            <dd className="font-medium">{user?.storeId}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600">Store Name</dt>
            <dd className="font-medium">{user?.storeName}</dd>
          </div>
        </dl>
      </Card>

      <Button variant="danger" onClick={handleLogout} fullWidth>
        Logout
      </Button>
    </div>
  );
}
```

## Complete Route Configuration

```tsx
<Routes>
  {/* Auth */}
  <Route path="/login" element={<LoginScreen />} />

  {/* Dashboard */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />

  {/* Forms */}
  <Route
    path="/forms"
    element={
      <ProtectedRoute>
        <FormsList />
      </ProtectedRoute>
    }
  />
  <Route
    path="/forms/:formId"
    element={
      <ProtectedRoute>
        <FormView />
      </ProtectedRoute>
    }
  />

  {/* History */}
  <Route
    path="/history"
    element={
      <ProtectedRoute>
        <History />
      </ProtectedRoute>
    }
  />

  {/* Settings */}
  <Route
    path="/settings"
    element={
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    }
  />
  <Route
    path="/more"
    element={
      <ProtectedRoute>
        <MoreMenu />
      </ProtectedRoute>
    }
  />

  {/* Redirects */}
  <Route path="/" element={<Navigate to="/dashboard" replace />} />
  <Route path="*" element={<Navigate to="/dashboard" replace />} />
</Routes>
```

## Offline Behavior

The dashboard automatically:

1. Detects online/offline status
2. Shows offline banner when disconnected
3. Disables cards that require connectivity
4. Displays sync queue count
5. Auto-syncs when connection restored

No additional configuration needed!

## Customization

### Change Dashboard Cards

```tsx
// In Dashboard.tsx
const cards: DashboardCardType[] = [
  {
    id: "custom",
    title: "Custom Task",
    subtitle: "Your description",
    icon: Star, // from lucide-react
    badge: 5,
    route: "/custom",
    requiresOnline: false,
    disabled: false,
  },
  // ... more cards
];
```

### Change Bottom Nav Items

```tsx
// In BottomNav.tsx
const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home, route: "/dashboard" },
  { id: "tasks", label: "Tasks", icon: CheckSquare, route: "/tasks" },
  { id: "reports", label: "Reports", icon: BarChart3, route: "/reports" },
  { id: "profile", label: "Profile", icon: User, route: "/profile" },
];
```

## Testing

### Manual Testing Checklist

- [ ] Login redirects to dashboard
- [ ] Dashboard shows store name
- [ ] Time updates every minute
- [ ] Click each quick action card
- [ ] Bottom nav switches sections
- [ ] Offline banner appears when offline
- [ ] Cards disable when offline (if requiresOnline)
- [ ] Sync queue shows pending items
- [ ] Auto-sync works when back online

### Simulate Offline Mode

In Chrome DevTools:

1. Open DevTools (F12)
2. Network tab → Throttling → Offline
3. Verify offline banner appears
4. Test offline-capable features

## Next Steps

1. ✅ Dashboard is complete
2. Create FormsList page
3. Create History page
4. Create Settings page
5. Create MoreMenu page
6. Test full navigation flow
