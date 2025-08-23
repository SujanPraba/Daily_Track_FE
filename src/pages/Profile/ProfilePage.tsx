import React, { useState } from 'react';
import { Edit2, MapPin, Building2, Users, Calendar, Shield } from 'lucide-react';
import { useUserCompleteInformation } from '../../features/users/useUserCompleteInformation';
import Button from '../../components/Common/Button';

const ProfilePage: React.FC = () => {
  const { userCompleteInformation, loading, error, fetchUserInfo } = useUserCompleteInformation();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <Button onClick={fetchUserInfo} variant="primary">
          Retry
        </Button>
      </div>
    );
  }

  if (!userCompleteInformation) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">No profile information available</div>
        <Button onClick={fetchUserInfo} variant="primary">
          Load Profile
        </Button>
      </div>
    );
  }

  const user = userCompleteInformation;


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Profile Summary</h2>
        </div>

        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-lg text-gray-600 mb-2">{user.position}</p>
            <div className="flex items-center text-gray-500">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{user.department}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
              <p className="text-lg font-semibold text-gray-900">{user.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-lg font-semibold text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Bio</label>
              <p className="text-lg font-semibold text-gray-900">{user.position}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
              <p className="text-lg font-semibold text-gray-900">{user.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
              <p className="text-lg font-semibold text-gray-900">{user.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Employee ID</label>
              <p className="text-lg font-semibold text-gray-900">{user.employeeId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects and Teams Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Projects & Teams</h2>

        </div>

        {user.projects && user.projects.length > 0 ? (
          <div className="space-y-6">
            {user.projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-3">{project.description}</p>
                <p className="text-sm text-gray-500 mb-3">Code: {project.code}</p>

                {/* Project Teams */}
                {project.teams && project.teams.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Teams ({project.teams.length})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {project.teams.map((team) => (
                        <span
                          key={team.id}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {team.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Roles */}
                {project.roles && project.roles.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Roles ({project.roles.length})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {project.roles.map((role) => (
                        <span
                          key={role.id}
                          className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
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
        ) : (
          <p className="text-gray-500 text-center py-4">No projects assigned</p>
        )}
      </div>

      {/* Account Details Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Account Details</h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Account Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
              <p className="text-lg font-semibold text-gray-900">{user.department}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Position</label>
              <p className="text-lg font-semibold text-gray-900">{user.position}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Last Login</label>
              <p className="text-lg font-semibold text-gray-900">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(user.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
