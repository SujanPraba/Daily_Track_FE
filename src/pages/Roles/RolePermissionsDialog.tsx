import React, { useState, useMemo } from 'react';
import { useGetPermissionsQuery } from '../../features/permissions/permissionsApi';
import { useUpdateRolePermissionsMutation } from '../../features/roles/rolesApi';
import { RoleWithPermissions } from '../../types/role';
import { Permission, MODULES } from '../../types/permission';
import Button from '../../components/Common/Button';
import { Search, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface RolePermissionsDialogProps {
  role: RoleWithPermissions;
  onClose: () => void;
}

const RolePermissionsDialog: React.FC<RolePermissionsDialogProps> = ({ role, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const { data: permissions } = useGetPermissionsQuery({});
  const [updatePermissions, { isLoading }] = useUpdateRolePermissionsMutation();

  const currentPermissionIds = role.permissions?.map(p => p.id) || [];
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(currentPermissionIds);

  const filteredPermissions = useMemo(() => {
    let filtered = permissions?.data || [];
    if (selectedModule) {
      filtered = filtered.filter(p => p.moduleName === selectedModule);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [permissions?.data, selectedModule, search]);

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    filteredPermissions.forEach(permission => {
      if (!groups[permission.moduleName]) {
        groups[permission.moduleName] = [];
      }
      groups[permission.moduleName].push(permission);
    });
    return groups;
  }, [filteredPermissions]);

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleToggleModule = (module: string) => {
    const modulePermissions = groupedPermissions[module]?.map(p => p.id) || [];
    const allSelected = modulePermissions.every(id => selectedPermissions.includes(id));

    setSelectedPermissions(prev => {
      if (allSelected) {
        return prev.filter(id => !modulePermissions.includes(id));
      } else {
        const newIds = modulePermissions.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      }
    });
  };

  const handleSave = async () => {
    try {
      await updatePermissions({
        roleId: role.id,
        permissionIds: selectedPermissions,
      }).unwrap();
      toast.success('Role permissions updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update role permissions');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            placeholder="Search permissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="block w-48 rounded-lg border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
        >
          <option value="">All Modules</option>
          {MODULES.map(module => (
            <option key={module} value={module}>{module}</option>
          ))}
        </select>
      </div>

      {/* Permissions List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
            <div key={module} className="border-b border-gray-200 last:border-b-0">
              {/* Module Header */}
              <div
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => handleToggleModule(module)}
              >
                <div className="flex items-center">
                  <h3 className="text-sm font-medium text-gray-900">{module}</h3>
                  <span className="ml-2 text-sm text-gray-500">
                    ({modulePermissions.length} permissions)
                  </span>
                </div>
                <div className="flex items-center">
                  {modulePermissions.every(p => selectedPermissions.includes(p.id)) && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>

              {/* Module Permissions */}
              <div className="divide-y divide-gray-200">
                {modulePermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {permission.name}
                      </p>
                      {permission.description && (
                        <p className="text-sm text-gray-500">
                          {permission.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handleTogglePermission(permission.id)}
                      />
                    </div>
                  </div>
                ))}
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

export default RolePermissionsDialog;
