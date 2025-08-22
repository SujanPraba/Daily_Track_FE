import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Shield, Users as UsersIcon, Briefcase } from 'lucide-react';
import { useGetUsersQuery, useDeleteUserMutation } from '../../features/users/usersApi';
import { UserWithDetails } from '../../types/user';
import DataTable from '../../components/Common/DataTable';
import Button from '../../components/Common/Button';
import Dialog from '../../components/Common/Dialog';
import UserForm from './UserForm';
import UserRolesDialog from './UserRolesDialog';
import UserAssignmentsDialog from './UserAssignmentsDialog';
import toast from 'react-hot-toast';

const UsersListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false);
  const [isAssignmentsDialogOpen, setIsAssignmentsDialogOpen] = useState(false);

  const { data: users, isLoading } = useGetUsersQuery({ search });
  const [deleteUser] = useDeleteUserMutation();

  const handleDelete = async (user: UserWithDetails) => {
    if (window.confirm(`Are you sure you want to delete user "${user.firstName} ${user.lastName}"?`)) {
      try {
        await deleteUser(user.id).unwrap();
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const columns = [
    { 
      header: 'Name', 
      accessor: (user: UserWithDetails) => (
        <div>
          <div className="font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      )
    },
    { 
      header: 'Department', 
      accessor: (user: UserWithDetails) => (
        <div>
          <div className="text-gray-900">{user.department || '-'}</div>
          <div className="text-sm text-gray-500">{user.position || '-'}</div>
        </div>
      )
    },
    { header: 'Employee ID', accessor: 'employeeId' },
    { 
      header: 'Roles', 
      accessor: (user: UserWithDetails) => (
        <Button
          variant="secondary"
          size="sm"
          icon={Shield}
          onClick={() => {
            setSelectedUser(user);
            setIsRolesDialogOpen(true);
          }}
        >
          {user.roles?.length || 0} Roles
        </Button>
      )
    },
    { 
      header: 'Assignments', 
      accessor: (user: UserWithDetails) => (
        <Button
          variant="secondary"
          size="sm"
          icon={Briefcase}
          onClick={() => {
            setSelectedUser(user);
            setIsAssignmentsDialogOpen(true);
          }}
        >
          View Assignments
        </Button>
      )
    },
    { 
      header: 'Status', 
      accessor: (user: UserWithDetails) => (
        <div className="space-y-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
          {user.lastLoginAt && (
            <div className="text-xs text-gray-500">
              Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )
    },
    { 
      header: 'Actions', 
      accessor: (user: UserWithDetails) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Edit2}
            onClick={() => setEditingUser(user)}
          />
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => handleDelete(user)}
          />
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Add User
        </Button>
      </div>

      <DataTable
        data={users?.data || []}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search users..."
        onSearch={setSearch}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        isOpen={isCreateDialogOpen || !!editingUser}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Edit User' : 'Create User'}
        size="xl"
      >
        <UserForm
          user={editingUser}
          onClose={() => {
            setIsCreateDialogOpen(false);
            setEditingUser(null);
          }}
        />
      </Dialog>

      {/* Roles Dialog */}
      <Dialog
        isOpen={isRolesDialogOpen}
        onClose={() => {
          setIsRolesDialogOpen(false);
          setSelectedUser(null);
        }}
        title={`${selectedUser?.firstName} ${selectedUser?.lastName} - Roles`}
        size="lg"
      >
        <UserRolesDialog
          user={selectedUser!}
          onClose={() => {
            setIsRolesDialogOpen(false);
            setSelectedUser(null);
          }}
        />
      </Dialog>

      {/* Assignments Dialog */}
      <Dialog
        isOpen={isAssignmentsDialogOpen}
        onClose={() => {
          setIsAssignmentsDialogOpen(false);
          setSelectedUser(null);
        }}
        title={`${selectedUser?.firstName} ${selectedUser?.lastName} - Assignments`}
        size="xl"
      >
        <UserAssignmentsDialog
          user={selectedUser!}
          onClose={() => {
            setIsAssignmentsDialogOpen(false);
            setSelectedUser(null);
          }}
        />
      </Dialog>
    </div>
  );
};

export default UsersListPage;