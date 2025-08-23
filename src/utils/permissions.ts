export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

export const hasAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};

// Sidebar permission checks
export const canViewDashboard = (permissions: string[]): boolean => {
  return hasPermission(permissions, 'VIEW_DASHBOARD');
};

export const canViewReports = (permissions: string[]): boolean => {
  return hasPermission(permissions, 'VIEW_REPORTS');
};

export const canViewConfiguration = (permissions: string[]): boolean => {
  return hasPermission(permissions, 'VIEW_CONFIGURATION');
};

export const canViewUserManagement = (permissions: string[]): boolean => {
  return hasPermission(permissions, 'VIEW_USER_MANAGEMENT');
};

export const canViewProjectManagement = (permissions: string[]): boolean => {
  return hasPermission(permissions, 'VIEW_PROJECT_MANAGEMENT');
};

export const canViewTeamManagement = (permissions: string[]): boolean => {
  return hasPermission(permissions, 'VIEW_TEAM_MANAGEMENT');
};

export const canViewModuleManagement = (permissions: string[]): boolean => {
  return hasPermission(permissions, 'VIEW_MODULE_MANAGEMENT');
};

export const canViewPermissionManagement = (permissions: string[]): boolean => {
  return hasPermission(permissions, 'VIEW_PERMISSION_MANAGEMENT');
};

export const canViewRoleManagement = (permissions: string[]): boolean => {
  return hasPermission(permissions, 'VIEW_ROLE_MANAGEMENT');
};

export const canViewDailyUpdates = (permissions: string[]): boolean => {
  return hasAnyPermission(permissions, ['VIEW_DAILY_UPDATES', 'VIEW_DAILY_UPDATES_FULL']);
};
