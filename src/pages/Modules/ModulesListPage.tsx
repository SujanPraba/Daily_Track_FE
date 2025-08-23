import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useSearchModulesMutation, useDeleteModuleMutation } from '../../features/modules/modulesApi';
import { Module } from '../../types/module';
import DataTable from '../../components/Common/DataTable';
import Button from '../../components/Common/Button';
import Dialog from '../../components/Common/Dialog';
import toast from 'react-hot-toast';
import ModuleForm from './ModuleForm';
import { Link } from 'react-router-dom';

const ModulesListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const [searchModules, { data: modulesResponse, isLoading }] = useSearchModulesMutation();
  const [deleteModule] = useDeleteModuleMutation();

  const modules = modulesResponse?.data || [];
  const pagination = modulesResponse;
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    searchModules({
      searchTerm: search,
      page,
      limit,
    }).finally(() => {
      setIsInitialLoading(false);
    });
  }, [search, page, limit, searchModules]);

  const handleDelete = async (module: Module) => {
    if (window.confirm(`Are you sure you want to delete module "${module.name}"?`)) {
      try {
        await deleteModule(module.id).unwrap();
        toast.success('Module deleted successfully');
        // Refresh the list
        searchModules({
          searchTerm: search,
          page,
          limit,
        });
      } catch (error) {
        toast.error('Failed to delete module');
      }
    }
  };

  const columns = [
    {
      header: 'Module Name',
      accessor: (module: Module) => (
        <div>
          <div className="font-bold text-gray-900">{module.name}</div>
          {/* <div className="text-sm text-gray-500">{module.code}</div> */}
        </div>
      )
    },
    {
      header: 'Description',
      accessor: (module: Module) => (
        <div className="text-gray-900 max-w-xs truncate">
          {module.description || '-'}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (module: Module) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${module.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          {module.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Created',
      accessor: (module: Module) => (
        <div className="text-sm text-gray-900">
          {new Date(module.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: (module: Module) => (
        <div className="flex space-x-2">
          <Link to={`/modules/${module.id}/view`}>
            <Button
              variant="secondary"
              size="sm"
              icon={Eye}
            />
          </Link>
          <Button
            variant="secondary"
            size="sm"
            icon={Edit2}
            onClick={() => setEditingModule(module)}
          />
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => handleDelete(module)}
          />
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Modules</h1>
        <div className="flex space-x-3">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Add Module
          </Button>
        </div>
      </div>

      {/* Filters */}
        <div className="flex justify-end items-center">
          <div className="flex items-center justify-end w-1/2">
            <div className="w-1/2 mr-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search modules..."
                className="block w-full rounded-lg py-2 px-3 border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
      </div>

      <DataTable
        data={modules}
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
        isOpen={isCreateDialogOpen || !!editingModule}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingModule(null);
        }}
        title={editingModule ? 'Edit Module' : 'Create Module'}
        size="lg"
      >
        <ModuleForm
          module={editingModule || undefined}
          onClose={() => {
            setIsCreateDialogOpen(false);
            setEditingModule(null);
          }}
          onSuccess={() => {
            // Refresh modules list after successful creation/update
            searchModules({
              searchTerm: search,
              page: page,
              limit: limit,
            });
          }}
        />
      </Dialog>
    </div>
  );
};

export default ModulesListPage;
