import React from 'react';
import { useUsersAllInformation } from '../../features/users';

interface UsersInfoDisplayProps {
  showProjects?: boolean;
  showTeams?: boolean;
  showRoles?: boolean;
}

export const UsersInfoDisplay: React.FC<UsersInfoDisplayProps> = ({
  showProjects = true,
  showTeams = true,
  showRoles = true,
}) => {
  const { allUsersInformation, loading, error, fetchUsers } = useUsersAllInformation();

  if (loading) {
    return <div className="text-center py-4">Loading users information...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="text-red-600 mb-2">Error: {error}</div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (allUsersInformation.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="text-gray-600 mb-2">No users information available</div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Load Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Users Information ({allUsersInformation.length})</h3>
        <button
          onClick={fetchUsers}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid gap-4">
        {allUsersInformation.map((user) => (
          <div key={user.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </h4>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">
                  {user.department} • {user.position} • {user.employeeId}
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
                <div className="flex flex-wrap gap-2">
                  {user.projects.map((project) => (
                    <span
                      key={project.id}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      {project.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {showTeams && user.teams.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Teams ({user.teams.length})</h5>
                <div className="flex flex-wrap gap-2">
                  {user.teams.map((team) => (
                    <span
                      key={team.id}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                    >
                      {team.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {showRoles && user.roles.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Roles ({user.roles.length})</h5>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <span
                      key={role.id}
                      className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs"
                    >
                      {role.name} ({role.level})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
