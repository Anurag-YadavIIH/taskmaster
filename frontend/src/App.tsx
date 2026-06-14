import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { TasksPage } from "./pages/tasks/TasksPage";
import { TaskDetailPage } from "./pages/tasks/TaskDetailPage";
import { TeamsPage } from "./pages/teams/TeamsPage";
import { TeamDetailPage } from "./pages/teams/TeamDetailPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path="/" element={<Navigate to="/tasks" replace />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/tasks/:id" element={<TaskDetailPage />} />
                  <Route path="/teams" element={<TeamsPage />} />
                  <Route path="/teams/:id" element={<TeamDetailPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/tasks" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
