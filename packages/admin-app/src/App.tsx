import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { Dashboard } from "./features/analytics/pages/Dashboard";
import { FormsPage } from "./features/forms/pages/FormsPage";
import { InventoryPage } from "./features/inventory/pages/InventoryPage";
import { ReplacementsPage } from "./features/replacements/pages/ReplacementsPage";
import { StoresPage } from "./features/stores/pages/StoresPage";
import { PLReportsPage } from "./features/pl-reports/pages/PLReportsPage";
import { UserManagementPage } from "./features/users";
import { StoreManagementPage } from "./features/stores";
import { TaskManagementPage } from "./features/tasks";
import { NotificationsPage } from "./features/notifications";
import { MessagingPage } from "./features/messaging";
import { PinLoginPage } from "./features/auth/pages/PinLoginPage";
import { SetupWizard } from "./features/auth/components/SetupWizard";
import { ProtectedRoute } from "./features/auth";
import { useSetupStore } from "./features/auth/store/setupStore";

function App() {
  const { isSetupComplete } = useSetupStore();

  // Show setup wizard on first run
  if (!isSetupComplete) {
    return <SetupWizard />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PinLoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/forms" element={<FormsPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/replacements" element={<ReplacementsPage />} />
                  <Route path="/stores" element={<StoresPage />} />
                  <Route path="/users" element={<UserManagementPage />} />
                  <Route path="/stores" element={<StoreManagementPage />} />
                  <Route path="/reports" element={<PLReportsPage />} />
                  <Route path="/tasks" element={<TaskManagementPage />} />
                  <Route
                    path="/notifications"
                    element={<NotificationsPage />}
                  />
                  <Route path="/messages" element={<MessagingPage />} />

                  {/* Catch all - redirect to dashboard */}
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
