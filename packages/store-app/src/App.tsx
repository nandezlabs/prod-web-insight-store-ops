import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./features/dashboard/Dashboard";
import { LoginScreen } from "./features/auth/components/LoginScreen";
import { TasksPage } from "./features/tasks/TasksPage";
import { useAuthStore } from "./features/auth/stores/authStore";

function App() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <LoginScreen
        storeId={import.meta.env.VITE_TEST_STORE_ID || "store-001"}
        storeName="Test Store"
      />
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
