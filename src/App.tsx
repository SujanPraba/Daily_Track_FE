import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProfilePage from './pages/Profile/ProfilePage';
import UsersListPage from './pages/Users/UsersListPage';
import ProjectsListPage from './pages/Projects/ProjectsListPage';
import TeamsListPage from './pages/Teams/TeamsListPage';
import DailyUpdatesPage from './pages/DailyUpdates/DailyUpdatesPage';
import ModulesListPage from './pages/Modules/ModulesListPage';
import ModulesViewPage from './pages/Modules/ModulesViewPage';
import PermissionsListPage from './pages/Permissions/PermissionsListPage';
import RolesListPage from './pages/Roles/RolesListPage';
import ReportsPage from './pages/Reports/ReportsPage';
import ConfigurationPage from './pages/Configuration/ConfigurationPage';
import { useAppDispatch } from './app/store';
import { fetchUserCompleteInformation } from './features/users/usersSlice';
import { useEffect } from 'react';
import DailyUpdateViewPage from './pages/DailyUpdates/DailyUpdateViewPage';
import DailyUpdateEditPage from './pages/DailyUpdates/DailyUpdateEditPage';
import DailyUpdateCreatePage from './pages/DailyUpdates/DailyUpdateCreatePage';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchUserCompleteInformation());
  }, [dispatch]);

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
          <Route index element={<Navigate to="/profile" replace />} />

          {/* Profile - Default landing page */}
          <Route path="profile" element={<ProfilePage />} />

          {/* Overview */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Configuration */}
          <Route
            path="configuration"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN']}>
                <ConfigurationPage />
              </ProtectedRoute>
            }
          />

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
          <Route
            path="daily-updates/create"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']}>
                <DailyUpdateCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="daily-updates/:id/view"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']}>
                <DailyUpdateViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="daily-updates/:id/edit"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']}>
                <DailyUpdateEditPage />
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
            path="modules"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN']}>
                <ModulesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="modules/view-all"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN']}>
                <ModulesViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="modules/:id/view"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN']}>
                <ModulesViewPage />
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
            path="reports"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'PROJECT_MANAGER']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports/projects"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'PROJECT_MANAGER']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports/teams"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'PROJECT_MANAGER']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Routes>
    </div>
  );
}

export default App;