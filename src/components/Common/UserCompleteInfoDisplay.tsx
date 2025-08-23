import React from 'react';
import { useUserCompleteInformation } from '../../features/users';

interface UserCompleteInfoDisplayProps {
  showProjects?: boolean;
  showTeams?: boolean;
  showRoles?: boolean;
}

export const UserCompleteInfoDisplay: React.FC<UserCompleteInfoDisplayProps> = ({
  showProjects = true,
  showTeams = true,
  showRoles = true,
}) => {
  const { userCompleteInformation, loading, error, fetchUserInfo } = useUserCompleteInformation();

  if (loading) {
    return <div className="text-center py-4">Loading user information...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="text-red-600 mb-2">Error: {error}</div>
        <button
          onClick={fetchUserInfo}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!userCompleteInformation) {
    return (
      <div className="text-center py-4">
        <div className="text-gray-600 mb-2">No user information available</div>
        <button
          onClick={fetchUserInfo}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Load User Info
        </button>
      </div>
    );
  }

  const user = userCompleteInformation;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">User Complete Information</h3>
        <button
          onClick={fetchUserInfo}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          Refresh
        </button>
      </div>

      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </h4>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">
              {user.department} • {user.position} • {user.employeeId}
            </p>
            <p className="text-sm text-gray-500">
              Phone: {user.phone || 'N/A'}
            </p>
            <p className="text-sm text-gray-500">
              Last Login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
            </p>
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 rounded-full text-xs ${
              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {showProjects && user.projects.length > 0 && (
          <div className="mb-3">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Projects ({user.projects.length})</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {user.projects.map((project) => (
                <div key={project.id} className="p-2 bg-blue-50 rounded border">
                  <div className="font-medium text-blue-900">{project.name}</div>
                  <div className="text-xs text-blue-700">{project.code}</div>
                  <div className="text-xs text-blue-600">{project.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showTeams && user.projects.some(p => p.teams.length > 0) && (
          <div className="mb-3">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Teams</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {user.projects.flatMap(project =>
                project.teams.map((team) => (
                  <div key={team.id} className="p-2 bg-purple-50 rounded border">
                    <div className="font-medium text-purple-900">{team.name}</div>
                    <div className="text-xs text-purple-700">Lead ID: {team.leadId}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {showRoles && user.projects.some(p => p.roles.length > 0) && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Roles</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {user.projects.flatMap(project =>
                project.roles.map((role) => (
                  <div key={role.id} className="p-2 bg-orange-50 rounded border">
                    <div className="font-medium text-orange-900">{role.name}</div>
                    <div className="text-xs text-orange-700">Level: {role.level}</div>
                    <div className="text-xs text-orange-600">
                      Permissions: {role.permissions.length}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
