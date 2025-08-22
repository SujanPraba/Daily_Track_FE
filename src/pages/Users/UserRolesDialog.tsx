import React, { useState } from 'react';
import { useGetRolesQuery } from '../../features/roles/rolesApi';
import { useUpdateUserRolesMutation, useGetUserRolesQuery } from '../../features/users/usersApi';
import { UserWithDetails } from '../../types/user';
import Button from '../../components/Common/Button';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserRolesDialogProps {
  user: UserWithDetails;
  onClose: () => void;
}

const UserRolesDialog: React.FC<UserRolesDialogProps> = ({ user, onClose }) => {
  const [search, setSearch] = useState('');
  const { data: roles } = useGetRolesQuery({});
  const { data: userRoles } = useGetUserRolesQuery(user.id);
  const [updateRoles, { isLoading }] = useUpdateUserRolesMutation();

  const currentRoleIds = userRoles?.data.roleIds || user.roles?.map(r => r.id) || [];
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoleIds);

  const filteredRoles = roles?.data.filter(role => 
    role.name.toLowerCase().includes(search.toLowerCase()) ||
    role.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleToggleRole = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    try {
      await updateRoles({
        userId: user.id,
        roleIds: selectedRoles,
      }).unwrap();
      toast.success('User roles updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update user roles');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Roles List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900">
                    {role.name}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    role.level === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                    role.level === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    role.level === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {role.level}
                  </span>
                </div>
                {role.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {role.description}
                  </p>
                )}
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => handleToggleRole(role.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          loading={isLoading}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default UserRolesDialog;