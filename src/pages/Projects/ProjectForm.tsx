import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useGetUsersQuery } from '../../features/users/usersApi';
import { useGetRolesQuery } from '../../features/roles/rolesApi';
import { useCreateProjectMutation, useUpdateProjectMutation } from '../../features/projects/projectsApi';
import { ProjectWithManager, CreateProjectDto, UpdateProjectDto } from '../../types/project';
import { Role } from '../../types/role';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { Loader2, Search, X, Shield, Calendar, Target } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProjectFormProps {
  project?: ProjectWithManager | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProjectFormData {
  name: string;
  code: string;
  description: string;
  managerId: string;
  status: string;
  startDate: string;
  endDate: string;
  roleIds: string[];
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onClose, onSuccess }) => {
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
  const [roleSearch, setRoleSearch] = useState('');

  const { data: users, isLoading: isLoadingUsers, error: usersError } = useGetUsersQuery({});
  const { data: roles, isLoading: isLoadingRoles } = useGetRolesQuery({ search: roleSearch });
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: project?.name || '',
      code: project?.code || '',
      description: project?.description || '',
      managerId: project?.manager?.id || '',
      status: project?.status || 'ACTIVE',
      startDate: project?.startDate ? project.startDate.split('T')[0] : '',
      endDate: project?.endDate ? project.endDate.split('T')[0] : '',
      roleIds: [],
    },
  });

  // Initialize selected roles when project changes
  useEffect(() => {
    if (project?.roles) {
      const roleIds = project.roles.map((role: any) => role.id);
      setSelectedRoleIds(new Set(roleIds));
      setValue('roleIds', roleIds);
    }
  }, [project, setValue]);

  // Update form value when selected roles change
  useEffect(() => {
    setValue('roleIds', Array.from(selectedRoleIds));
  }, [selectedRoleIds, setValue]);

  const handleRoleSearch = (searchTerm: string) => {
    setRoleSearch(searchTerm);
  };

  const toggleRole = (roleId: string) => {
    const newSelected = new Set(selectedRoleIds);
    if (newSelected.has(roleId)) {
      newSelected.delete(roleId);
    } else {
      newSelected.add(roleId);
    }
    setSelectedRoleIds(newSelected);
  };

  const clearRoleFilters = () => {
    setRoleSearch('');
  };

  const hasActiveRoleFilters = roleSearch;

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const projectData = {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        description: data.description.trim(),
        managerId: data.managerId,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        roleIds: Array.from(selectedRoleIds)
      };

      if (project) {
        // Update existing project
        await updateProject({
          id: project.id,
          ...projectData
        }).unwrap();
        toast.success('Project updated successfully');
      } else {
        // Create new project
        await createProject(projectData).unwrap();
        toast.success('Project created successfully');
      }

      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.data?.message || `Failed to ${project ? 'update' : 'create'} project`);
    }
  };

  if (isLoadingUsers || isLoadingRoles) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="text-center py-6">
        <p className="text-red-600">Failed to load users. Please try again later.</p>
        <Button variant="secondary" onClick={onClose} className="mt-4">Close</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Project Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
          <Target className="h-5 w-5 text-blue-600 mr-2" />
          Project Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Project name is required' }}
            render={({ field }) => (
              <Input
                label="Project Name *"
                placeholder="Enter project name"
                error={errors.name?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="code"
            control={control}
            rules={{
              required: 'Project code is required',
              pattern: {
                value: /^[A-Za-z0-9-]+$/,
                message: 'Project code can only contain letters, numbers, and hyphens'
              }
            }}
            render={({ field }) => (
              <Input
                label="Project Code *"
                placeholder="Enter project code (e.g., PROJ-001)"
                error={errors.code?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="status"
            control={control}
            rules={{ required: 'Project status is required' }}
            render={({ field }) => (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Project Status *</label>
                <select
                  {...field}
                  className={`block w-full rounded-lg border shadow-sm py-2 px-3 ${
                    errors.status
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                  }`}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="managerId"
            control={control}
            render={({ field }) => (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Project Manager</label>
                <select
                  {...field}
                  className={`block w-full rounded-lg border shadow-sm py-2 px-3 ${
                    errors.managerId
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                  }`}
                >
                  <option value="">Select a manager</option>
                  {(users as any)?.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
                {errors.managerId && (
                  <p className="mt-1 text-sm text-red-600">{errors.managerId.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    {...field}
                    className={`block w-full pl-10 pr-3 py-2 rounded-lg border shadow-sm ${
                      errors.startDate
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                    }`}
                  />
                </div>
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    {...field}
                    className={`block w-full pl-10 pr-3 py-2 rounded-lg border shadow-sm ${
                      errors.endDate
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                    }`}
                  />
                </div>
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            )}
          />
        </div>

        <div className="mt-4">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  {...field}
                  rows={4}
                  placeholder="Enter project description"
                  className={`block w-full rounded-lg border shadow-sm py-2 px-3 ${
                    errors.description
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* Roles Selection */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900 flex items-center">
                <Shield className="h-5 w-5 text-purple-600 mr-2" />
                Project Roles
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Select the roles that will be assigned to this project
              </p>
            </div>
            <div className="bg-orange-50 px-3 py-1.5 rounded-md">
              <span className="text-xs font-medium text-orange-800">
                {selectedRoleIds.size} role{selectedRoleIds.size !== 1 ? 's' : ''} selected
              </span>
            </div>
          </div>
        </div>

        {/* Role Filters */}
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={roleSearch}
                onChange={(e) => handleRoleSearch(e.target.value)}
                placeholder="Search roles..."
                className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
            {hasActiveRoleFilters && (
              <Button
                variant="secondary"
                onClick={clearRoleFilters}
                icon={X}
                className="px-3 py-2 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Roles List */}
        <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
          {roles?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No roles found.
            </div>
          ) : (
            roles?.map((role: Role) => (
              <div
                key={role.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => toggleRole(role.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedRoleIds.has(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-colors"
                />

                <div className="flex items-center space-x-2 flex-1">
                  <div className="p-1.5 bg-blue-100 rounded-md">
                    <Shield className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{role.name}</div>
                    {role.description && (
                      <div className="text-xs text-gray-500 mt-0.5">{role.description}</div>
                    )}
                  </div>
                </div>

                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                  role.isActive
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {role.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
        <Button
          type="submit"
          variant="primary"
          loading={isCreating || isUpdating}
          className="px-6 py-2.5"
        >
          {project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;