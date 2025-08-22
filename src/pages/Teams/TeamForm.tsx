import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useGetUsersQuery } from '../../features/users/usersApi';
import { useGetProjectsQuery } from '../../features/projects/projectsApi';
import { useCreateTeamMutation } from '../../features/teams/teamsApi';
import { TeamWithLeader } from '../../types/team';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface TeamFormProps {
  team?: TeamWithLeader | null;
  onClose: () => void;
}

interface TeamFormData {
  name: string;
  description: string;
  leaderId: string;
  projectId: string;
  memberIds: string[];
}

const TeamForm: React.FC<TeamFormProps> = ({ team, onClose }) => {
  const { data: users, isLoading: isLoadingUsers, error: usersError } = useGetUsersQuery({});
  const { data: projects, isLoading: isLoadingProjects, error: projectsError } = useGetProjectsQuery({});
  const [createTeam, { isLoading }] = useCreateTeamMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TeamFormData>({
    defaultValues: {
      name: team?.name || '',
      description: team?.description || '',
      leaderId: team?.leader?.id || '',
      projectId: team?.project?.id || '',
      memberIds: team?.members?.map(m => m.id) || [],
    },
  });

  const selectedLeaderId = watch('leaderId');

  const onSubmit = async (data: TeamFormData) => {
    try {
      await createTeam({
        name: data.name.trim(),
        description: data.description.trim(),
        leaderId: data.leaderId,
        projectId: data.projectId,
        memberIds: [...new Set([data.leaderId, ...data.memberIds])] // Ensure leader is also a member
      }).unwrap();
      toast.success('Team created successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to create team');
    }
  };

  if (isLoadingUsers || isLoadingProjects) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
        <span className="ml-2 text-gray-600">Loading data...</span>
      </div>
    );
  }

  if (usersError || projectsError) {
    return (
      <div className="text-center py-6">
        <p className="text-red-600">Failed to load data. Please try again later.</p>
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
          rules={{ required: 'Team name is required' }}
          render={({ field }) => (
            <Input
              label="Team Name"
              placeholder="Enter team name"
              error={errors.name?.message}
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
                placeholder="Enter team description"
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
          name="projectId"
          control={control}
          rules={{ required: 'Project is required' }}
          render={({ field }) => (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Project</label>
              <select
                {...field}
                className={`block w-full rounded-lg border shadow-sm py-2 px-3 ${
                  errors.projectId
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                }`}
              >
                <option value="">Select a project</option>
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.code} - {project.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-600">{errors.projectId.message}</p>
              )}
            </div>
          )}
        />

        <Controller
          name="leaderId"
          control={control}
          rules={{ required: 'Team leader is required' }}
          render={({ field }) => (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Team Leader</label>
              <select
                {...field}
                className={`block w-full rounded-lg border shadow-sm py-2 px-3 ${
                  errors.leaderId
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                }`}
              >
                <option value="">Select a team leader</option>
                {users?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.position})
                  </option>
                ))}
              </select>
              {errors.leaderId && (
                <p className="mt-1 text-sm text-red-600">{errors.leaderId.message}</p>
              )}
            </div>
          )}
        />

        <Controller
          name="memberIds"
          control={control}
          render={({ field }) => (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Team Members</label>
              <select
                multiple
                {...field}
                className={`block w-full rounded-lg border shadow-sm py-2 px-3 min-h-[200px] ${
                  errors.memberIds
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                }`}
              >
                {users?.filter(user => user.id !== selectedLeaderId).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.position})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Hold Ctrl/Cmd to select multiple members
              </p>
            </div>
          )}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
        <Button type="submit" variant="primary" loading={isLoading}>
          {team ? 'Update Team' : 'Create Team'}
        </Button>
      </div>
    </form>
  );
};

export default TeamForm;