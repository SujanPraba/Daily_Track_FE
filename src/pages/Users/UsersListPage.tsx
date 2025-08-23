import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, Users as UsersIcon, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchUsersMutation, useDeleteUserMutation } from '../../features/users/usersApi';
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
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [department, setDepartment] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false);
  const [isAssignmentsDialogOpen, setIsAssignmentsDialogOpen] = useState(false);

  const [searchUsers, { data: usersResponse, isLoading }] = useSearchUsersMutation();
  const [deleteUser] = useDeleteUserMutation();

  const users = usersResponse?.data || [];
  const pagination = usersResponse;
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    searchUsers({
      searchTerm: search,
      page,
      limit,
      department: department || undefined,
      position: position || undefined,
    }).finally(() => {
      setIsInitialLoading(false);
    });
  }, [search, page, limit, department, position, searchUsers]);

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
    // {
    //   header: 'Department',
    //   accessor: (user: UserWithDetails) => (
    //     <div>
    //       <div className="text-gray-900">{user.department || '-'}</div>
    //       <div className="text-sm text-gray-500">{user.position || '-'}</div>
    //     </div>
    //   )
    // },
    { header: 'Employee ID', accessor: (user: UserWithDetails) => user.employeeId || '-' },
    // {
    //   header: 'Current Assignments',
    //   accessor: (user: UserWithDetails) => (
    //     <div className="space-y-1">
    //       {user.projectRoles && user.projectRoles.length > 0 ? (
    //         user.projectRoles.map((projectRole, index) => (
    //           <div key={index} className="text-xs bg-gray-50 rounded px-2 py-1">
    //             <div className="font-medium text-gray-900">{projectRole.projectName}</div>
    //             <div className="text-gray-600">
    //               {projectRole.roleName}
    //               {projectRole.teamName && ` • ${projectRole.teamName}`}
    //             </div>
    //           </div>
    //         ))
    //       ) : (
    //         <span className="text-gray-400 text-xs">No assignments</span>
    //       )}
    //     </div>
    //   )
    // },
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
    // {
    //   header: 'Assignments',
    //   accessor: (user: UserWithDetails) => (
    //     <Button
    //       variant="secondary"
    //       size="sm"
    //       icon={Briefcase}
    //       onClick={() => {
    //         setSelectedUser(user);
    //         setIsAssignmentsDialogOpen(true);
    //       }}
    //     >
    //       View Assignments
    //     </Button>
    //   )
    // },
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="block w-full rounded-lg py-2 px-3 border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Department"
              className="block w-full rounded-lg py-2 px-3 border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Position"
              className="block w-full rounded-lg py-2 px-3 border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setDepartment('');
                setPosition('');
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading || isInitialLoading}
      />

      {/* Pagination */}
      {pagination && (
        <div className="bg-white rounded-lg shadow px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrevPage}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNextPage}
                icon={ChevronRight}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        isOpen={isCreateDialogOpen || !!editingUser}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Edit User' : 'Create User'}
        size="fullscreen"
      >
        <UserForm
          user={editingUser || undefined}
          onClose={() => {
            setIsCreateDialogOpen(false);
            setEditingUser(null);
          }}
          onSuccess={() => {
            // Refresh users list after successful creation/update
            searchUsers({
              searchTerm: search,
              page: page,
              limit: limit,
              department: department || undefined,
              position: position || undefined,
            });
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
        // size="lg"
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
        size="2xl"
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