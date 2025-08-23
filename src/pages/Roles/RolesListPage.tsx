import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Shield } from 'lucide-react';
import { useGetRolesQuery, useDeleteRoleMutation } from '../../features/roles/rolesApi';
import { RoleWithPermissions } from '../../types/role';
import DataTable from '../../components/Common/DataTable';
import Button from '../../components/Common/Button';
import Dialog from '../../components/Common/Dialog';
import RoleForm from './RoleForm';
import RolePermissionsDialog from './RolePermissionsDialog';
import toast from 'react-hot-toast';

const RolesListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);

  const { data: roles, isLoading } = useGetRolesQuery({ search });
  const [deleteRole] = useDeleteRoleMutation();

  const handleDelete = async (role: RoleWithPermissions) => {
    if (window.confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      try {
        await deleteRole(role.id).unwrap();
        toast.success('Role deleted successfully');
      } catch (error) {
        toast.error('Failed to delete role');
      }
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    // { header: 'Level', accessor: (role: RoleWithPermissions) => (
    //   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    //     role.level === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
    //     role.level === 'ADMIN' ? 'bg-red-100 text-red-800' :
    //     role.level === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
    //     'bg-gray-100 text-gray-800'
    //   }`}>
    //     {role.level}
    //   </span>
    // )},
    { header: 'Description', accessor: 'description' },
    { header: 'Permissions', accessor: (role: RoleWithPermissions) => (
      <Button
        variant="secondary"
        size="sm"
        icon={Shield}
        onClick={() => {
          setSelectedRole(role);
          setIsPermissionsDialogOpen(true);
        }}
      >
        {role.permissions?.length || 0} Permissions
      </Button>
    )},
    { header: 'Status', accessor: (role: RoleWithPermissions) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        role.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {role.isActive ? 'Active' : 'Inactive'}
      </span>
    )},
    { header: 'Actions', accessor: (role: RoleWithPermissions) => (
      <div className="flex space-x-2">
        <Button
          variant="secondary"
          size="sm"
          icon={Edit2}
          onClick={() => setEditingRole(role)}
        />
        <Button
          variant="danger"
          size="sm"
          icon={Trash2}
          onClick={() => handleDelete(role)}
        />
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Roles</h1>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Add Role
        </Button>
      </div>

      <DataTable
        data={roles as any || []}
        columns={columns as any}
        isLoading={isLoading}
        searchPlaceholder="Search roles..."
        onSearch={setSearch}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        isOpen={isCreateDialogOpen || !!editingRole}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingRole(null);
        }}
        title={editingRole ? 'Edit Role' : 'Create Role'}
        // size="lg"
        size="2xl"
      >
        <RoleForm
          role={editingRole as RoleWithPermissions}
          onClose={() => {
            setIsCreateDialogOpen(false);
            setEditingRole(null);
          }}
        />
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog
        isOpen={isPermissionsDialogOpen}
        onClose={() => {
          setIsPermissionsDialogOpen(false);
          setSelectedRole(null);
        }}
        title={`${selectedRole?.name} - Permissions`}
        // size="xl"
      >
        <RolePermissionsDialog
          role={selectedRole!}
          onClose={() => {
            setIsPermissionsDialogOpen(false);
            setSelectedRole(null);
          }}
        />
      </Dialog>
    </div>
  );
};

export default RolesListPage;
