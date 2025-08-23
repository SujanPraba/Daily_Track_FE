import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react';
import { useSearchPermissionsMutation, useDeletePermissionMutation } from '../../features/permissions/permissionsApi';
import { useSearchModulesMutation } from '../../features/modules/modulesApi';
import { Permission } from '../../types/permission';
import { Module } from '../../types/module';
import DataTable from '../../components/Common/DataTable';
import Button from '../../components/Common/Button';
import Dialog from '../../components/Common/Dialog';
import PermissionForm from './PermissionForm';
import toast from 'react-hot-toast';

const PermissionsListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  const [searchPermissions, { data: permissionsResponse, isLoading }] = useSearchPermissionsMutation();
  const [searchModules, { data: modulesResponse }] = useSearchModulesMutation();
  const [deletePermission] = useDeletePermissionMutation();

  const permissions = permissionsResponse?.data || [];
  const pagination = permissionsResponse;
  const modules = modulesResponse?.data || [];
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    searchPermissions({
      searchTerm: search,
      page,
      limit,
      moduleId: selectedModuleId || undefined,
    }).finally(() => {
      setIsInitialLoading(false);
    });
  }, [search, page, limit, selectedModuleId, searchPermissions]);

  // Load modules on mount
  useEffect(() => {
    searchModules({
      searchTerm: '',
      page: 1,
      limit: 100,
    });
  }, [searchModules]);

  const handleDelete = async (permission: Permission) => {
    if (window.confirm(`Are you sure you want to delete permission "${permission.name}"?`)) {
      try {
        await deletePermission(permission.id).unwrap();
        toast.success('Permission deleted successfully');
        // Refresh the list
        searchPermissions({
          searchTerm: search,
          page,
          limit,
          moduleId: selectedModuleId || undefined,
        });
      } catch (error) {
        toast.error('Failed to delete permission');
      }
    }
  };

  const hasActiveFilters = search || selectedModuleId;

  const clearFilters = () => {
    setSearch('');
    setSelectedModuleId('');
    setPage(1);
  };

  const columns = [
    {
      header: 'Permission Details',
      accessor: (permission: Permission) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{permission.name}</div>
          {permission.description && (
            <div className="text-sm text-gray-500">{permission.description}</div>
          )}
        </div>
      )
    },
    {
      header: 'Module',
      accessor: (permission: Permission) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
          {permission.moduleName || permission.moduleId}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (permission: Permission) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
          permission.isActive
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-red-100 text-red-800 border-red-200'
        }`}>
          {permission.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (permission: Permission) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Edit2}
            onClick={() => setEditingPermission(permission)}
            className="hover:bg-gray-100"
          />
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => handleDelete(permission)}
            className="hover:bg-red-50"
          />
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage system permissions and access controls
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          Add Permission
        </Button>
      </div>

      {/* Filters */}
      <div className="flex justify-end">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search permissions..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors hover:border-gray-400"
              />
            </div>

            {/* Module Filter */}
            <div className="relative">
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="block w-full py-2.5 px-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none bg-white cursor-pointer hover:border-gray-400"
              >
                <option value="" className="py-2 px-3">All Modules</option>
                {modules.map((module: Module) => (
                  <option
                    key={module.id}
                    value={module.id}
                    className="py-2 px-3 hover:bg-orange-50"
                  >
                    {module.code} - {module.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <Button
                  variant="secondary"
                  onClick={clearFilters}
                  icon={X}
                  className="w-full md:w-auto"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-sm text-gray-500">Active filters:</span>
              {search && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                  Search: "{search}"
                  <button
                    onClick={() => setSearch('')}
                    className="ml-1.5 hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedModuleId && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  Module: {modules.find((m: Module) => m.id === selectedModuleId)?.name}
                  <button
                    onClick={() => setSelectedModuleId('')}
                    className="ml-1.5 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          data={permissions}
          columns={columns}
          isLoading={isLoading || isInitialLoading}
        />
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Results Info */}
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrevPage}
                  icon={ChevronLeft}
                  className="px-3 py-2"
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                    if (pageNum > pagination.totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          pageNum === pagination.page
                            ? 'bg-orange-500 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNextPage}
                  icon={ChevronRight}
                  className="px-3 py-2"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          permission={editingPermission || undefined}
          onClose={() => {
            setIsCreateDialogOpen(false);
            setEditingPermission(null);
          }}
          onSuccess={() => {
            // Refresh permissions list after successful creation/update
            searchPermissions({
              searchTerm: search,
              page: page,
              limit: limit,
              moduleId: selectedModuleId || undefined,
            });
          }}
        />
      </Dialog>
    </div>
  );
};

export default PermissionsListPage;
