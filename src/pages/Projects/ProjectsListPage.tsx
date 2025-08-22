import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useGetProjectsQuery, useDeleteProjectMutation } from '../../features/projects/projectsApi';
import { ProjectWithManager } from '../../types/project';
import DataTable from '../../components/Common/DataTable';
import Button from '../../components/Common/Button';
import Dialog from '../../components/Common/Dialog';
import toast from 'react-hot-toast';
import ProjectForm from './ProjectForm';

const ProjectsListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithManager | null>(null);

  const { data: projects, isLoading } = useGetProjectsQuery({ search });
  const [deleteProject] = useDeleteProjectMutation();

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

      <DataTable
        data={projects || []}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search projects..."
        onSearch={setSearch}
      />

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
        />
      </Dialog>
    </div>
  );
};

export default ProjectsListPage;