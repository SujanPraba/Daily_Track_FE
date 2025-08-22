import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useGetPermissionsQuery, useDeletePermissionMutation } from '../../features/permissions/permissionsApi';
import { Permission, MODULES } from '../../types/permission';
import DataTable from '../../components/Common/DataTable';
import Button from '../../components/Common/Button';
import Dialog from '../../components/Common/Dialog';
import PermissionForm from './PermissionForm';
import toast from 'react-hot-toast';

const PermissionsListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  const { data: permissions, isLoading } = useGetPermissionsQuery({ search });
  const [deletePermission] = useDeletePermissionMutation();

  const filteredPermissions = useMemo(() => {
    let filtered = permissions?.data || [];
    if (selectedModule) {
      filtered = filtered.filter(p => p.module === selectedModule);
    }
    return filtered;
  }, [permissions?.data, selectedModule]);

  const handleDelete = async (permission: Permission) => {
    if (window.confirm(`Are you sure you want to delete permission "${permission.name}"?`)) {
      try {
        await deletePermission(permission.id).unwrap();
        toast.success('Permission deleted successfully');
      } catch (error) {
        toast.error('Failed to delete permission');
      }
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Module', accessor: (permission: Permission) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {permission.module}
      </span>
    )},
    { header: 'Action', accessor: (permission: Permission) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        {permission.action}
      </span>
    )},
    { header: 'Description', accessor: 'description' },
    { header: 'Status', accessor: (permission: Permission) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        permission.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {permission.isActive ? 'Active' : 'Inactive'}
      </span>
    )},
    { header: 'Actions', accessor: (permission: Permission) => (
      <div className="flex space-x-2">
        <Button
          variant="secondary"
          size="sm"
          icon={Edit2}
          onClick={() => setEditingPermission(permission)}
        />
        <Button
          variant="danger"
          size="sm"
          icon={Trash2}
          onClick={() => handleDelete(permission)}
        />
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Permissions</h1>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Add Permission
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
                placeholder="Search permissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
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
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
                    </div>
                  </td>
                </tr>
              ) : filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No permissions found
                  </td>
                </tr>
              ) : (
                filteredPermissions.map((permission) => (
                  <tr key={permission.id}>
                    {columns.map((column, index) => (
                      <td key={index} className="px-6 py-4 whitespace-nowrap">
                        {typeof column.accessor === 'function'
                          ? column.accessor(permission)
                          : permission[column.accessor as keyof Permission]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        isOpen={isCreateDialogOpen || !!editingPermission}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingPermission(null);
        }}
        title={editingPermission ? 'Edit Permission' : 'Create Permission'}
        size="lg"
      >
        <PermissionForm
          permission={editingPermission}
          onClose={() => {
            setIsCreateDialogOpen(false);
            setEditingPermission(null);
          }}
        />
      </Dialog>
    </div>
  );
};

export default PermissionsListPage;
