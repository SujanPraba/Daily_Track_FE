import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useGetUsersQuery } from '../../features/users/usersApi';
import { useCreateProjectMutation } from '../../features/projects/projectsApi';
import { ProjectWithManager } from '../../types/project';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProjectFormProps {
  project?: ProjectWithManager | null;
  onClose: () => void;
}

interface ProjectFormData {
  name: string;
  code: string;
  description: string;
  managerId: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onClose }) => {
  const { data: users, isLoading: isLoadingUsers, error: usersError } = useGetUsersQuery({});
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: project?.name || '',
      code: project?.code || '',
      description: project?.description || '',
      managerId: project?.manager?.id || '',
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      await createProject({
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        description: data.description.trim(),
        managerId: data.managerId
      }).unwrap();
      toast.success('Project created successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to create project');
    }
  };

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
        <span className="ml-2 text-gray-600">Loading users...</span>
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
      <div className="space-y-4">
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Project name is required' }}
          render={({ field }) => (
            <Input
              label="Project Name"
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
              label="Project Code"
              placeholder="Enter project code (e.g., PROJ-001)"
              error={errors.code?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          rules={{ required: 'Description is required' }}
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

        <Controller
          name="managerId"
          control={control}
          rules={{ required: 'Project manager is required' }}
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
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
        <Button type="submit" variant="primary" loading={isLoading}>
          {project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;