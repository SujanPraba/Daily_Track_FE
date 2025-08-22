import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import UsersListPage from './pages/Users/UsersListPage';
import ProjectsListPage from './pages/Projects/ProjectsListPage';
import TeamsListPage from './pages/Teams/TeamsListPage';
import DailyUpdatesPage from './pages/DailyUpdates/DailyUpdatesPage';
import PermissionsListPage from './pages/Permissions/PermissionsListPage';
import RolesListPage from './pages/Roles/RolesListPage';
import ReportsPage from './pages/Reports/ReportsPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Overview */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Project Management */}
          <Route
            path="projects"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'PROJECT_MANAGER']}>
                <ProjectsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="teams"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'PROJECT_MANAGER']}>
                <TeamsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="daily-updates"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']}>
                <DailyUpdatesPage />
              </ProtectedRoute>
            }
          />

          {/* User Management */}
          <Route
            path="users"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN']}>
                <UsersListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="roles"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN']}>
                <RolesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="permissions"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN']}>
                <PermissionsListPage />
              </ProtectedRoute>
            }
          />

          {/* Reports */}
          <Route
            path="reports/projects"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'PROJECT_MANAGER']}>
                <ReportsPage type="projects" />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports/teams"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'PROJECT_MANAGER']}>
                <ReportsPage type="teams" />
              </ProtectedRoute>
            }
          />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;