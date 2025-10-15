import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { storage } from './utils/storage';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './components/admin/AdminDashboard';
import AnalyticsDashboard from './components/admin/AnalyticsDashboard';
import SettingsPage from './components/admin/SettingsPage';
import AdminPerformanceOverview from './components/admin/AdminPerformanceOverview';
import ManagerDashboard from './components/manager/ManagerDashboard';
import TasksListPage from './components/manager/TasksListPage';
import EmployeesList from './components/manager/EmployeesList';
import TeamAnalytics from './components/manager/TeamAnalytics';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import PerformancePage from './components/employee/PerformancePage';
import MyAnalytics from './components/employee/MyAnalytics';
import UserProfile from './components/common/UserProfile';

function App() {
  // Run migration on app load
  useEffect(() => {
    const result = storage.migrateTaskData();
    if (result.success && result.migratedCount > 0) {
      console.log(`Migrated ${result.migratedCount} tasks to new format`);
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1f2937',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
              style: {
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              style: {
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Profile Route (Protected) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/performance"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPerformanceOverview />
              </ProtectedRoute>
            }
          />
          {/* Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute requiredRole="manager">
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/tasks"
            element={
              <ProtectedRoute requiredRole="manager">
                <TasksListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/employees"
            element={
              <ProtectedRoute requiredRole="manager">
                <EmployeesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/analytics"
            element={
              <ProtectedRoute requiredRole="manager">
                <TeamAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/performance"
            element={
              <ProtectedRoute requiredRole="employee">
                <PerformancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/analytics"
            element={
              <ProtectedRoute requiredRole="employee">
                <MyAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 - Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
