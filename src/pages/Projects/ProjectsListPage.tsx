import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDeleteProjectMutation, useSearchProjectsMutation } from '../../features/projects/projectsApi';
import { ProjectWithManager } from '../../types/project';
import DataTable from '../../components/Common/DataTable';
import Button from '../../components/Common/Button';
import Dialog from '../../components/Common/Dialog';
import toast from 'react-hot-toast';
import ProjectForm from './ProjectForm';

const ProjectsListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState<string>('');
  const [managerId, setManagerId] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithManager | null>(null);

  const [searchProjects, { data: projectsResponse, isLoading }] = useSearchProjectsMutation();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [deleteProject] = useDeleteProjectMutation();

  const projects = projectsResponse?.data || [];
  const pagination = projectsResponse;

  useEffect(() => {
    searchProjects({
      searchTerm: search,
      page,
      limit,
      status: status || undefined,
      managerId: managerId || undefined,
    }).finally(() => {
      setIsInitialLoading(false);
    });
  }, [search, page, limit, status, managerId, searchProjects]);

  const handleDelete = async (project: ProjectWithManager) => {
    if (window.confirm(`Are you sure you want to delete project "${project.name}"?`)) {
      try {
        await deleteProject(project.id).unwrap();
        toast.success('Project deleted successfully');
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const columns: any[] = [
    { header: 'Code', accessor: (project: ProjectWithManager) => project.code },
    { header: 'Name', accessor: (project: ProjectWithManager) => project.name },
    {
      header: 'Manager',
      accessor: (project: ProjectWithManager) => project.manager ? `${project.manager.firstName} ${project.manager.lastName}` : '-'
    },
    {
      header: 'Status',
      accessor: (project: ProjectWithManager) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
          project.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {project.status}
        </span>
      )
    },
    {
      header: 'Start Date',
      accessor: (project: ProjectWithManager) => project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'
    },
    {
      header: 'End Date',
      accessor: (project: ProjectWithManager) => project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'
    },
    {
      header: 'Actions',
      accessor: (project: ProjectWithManager) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Edit2}
            onClick={() => setEditingProject(project)}
          />
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => handleDelete(project)}
          />
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Add Project
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="block w-full rounded-lg py-2 px-3 border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div> */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Manager ID</label>
            <input
              type="text"
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              placeholder="Manager UUID"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div> */}
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setStatus('');
                setManagerId('');
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        data={projects}
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

      <Dialog
        isOpen={isCreateDialogOpen || !!editingProject}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingProject(null);
        }}
        title={editingProject ? 'Edit Project' : 'Create Project'}
        size="2xl"
      >
        <ProjectForm
          project={editingProject}
          onClose={() => {
            setIsCreateDialogOpen(false);
            setEditingProject(null);
          }}
          onSuccess={() => {
            setIsCreateDialogOpen(false);
            setEditingProject(null);
            searchProjects({
              searchTerm: search,
              page,
              limit,
              status: status || undefined,
              managerId: managerId || undefined,
            });
          }}
        />
      </Dialog>
    </div>
  );
};

export default ProjectsListPage;