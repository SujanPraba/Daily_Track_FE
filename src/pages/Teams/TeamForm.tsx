import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSearchUsersMutation } from '../../features/users/usersApi';
import { useSearchProjectsMutation } from '../../features/projects/projectsApi';
import { useCreateTeamMutation } from '../../features/teams/teamsApi';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface TeamFormProps {
  team?: any | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface TeamFormData {
  name: string;
  description: string;
  leadId: string;
  projectId: string;
}

const TeamForm: React.FC<TeamFormProps> = ({ team, onClose, onSuccess }) => {
  const [searchUsers, { data: usersResponse, isLoading: isLoadingUsers }] = useSearchUsersMutation();
  const [searchProjects, { data: projectsResponse, isLoading: isLoadingProjects }] = useSearchProjectsMutation();
  const [createTeam, { isLoading }] = useCreateTeamMutation();

  // Project pagination state
  const [projectPage, setProjectPage] = useState(1);
  const [projectSearch, setProjectSearch] = useState('');
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [hasMoreProjects, setHasMoreProjects] = useState(true);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  // Users pagination state
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TeamFormData>({
    defaultValues: {
      name: team?.name || '',
      description: team?.description || '',
      leadId: team?.leader?.id || '',
      projectId: team?.project?.id || '',
    },
  });

  const selectedLeadId = watch('leadId');

  // Load projects with pagination
  useEffect(() => {
    searchProjects({
      searchTerm: projectSearch,
      page: projectPage,
      limit: 10,
    }).then((result) => {
      if ('data' in result && result.data) {
        if (projectPage === 1) {
          setAllProjects(result.data.data);
        } else {
          setAllProjects(prev => [...prev, ...result.data.data]);
        }
        setHasMoreProjects(result.data.hasNextPage);
      }
    });
  }, [projectPage, projectSearch, searchProjects]);

  // Load users with pagination
  useEffect(() => {
    searchUsers({
      searchTerm: userSearch,
      page: userPage,
      limit: 10,
    }).then((result) => {
      if ('data' in result && result.data) {
        if (userPage === 1) {
          setAllUsers(result.data.data);
        } else {
          setAllUsers(prev => [...prev, ...result.data.data]);
        }
        setHasMoreUsers(result.data.hasNextPage);
      }
    });
  }, [userPage, userSearch, searchUsers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.project-dropdown')) {
        setProjectDropdownOpen(false);
      }
      if (!target.closest('.user-dropdown')) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMoreProjects = () => {
    if (hasMoreProjects) {
      setProjectPage(prev => prev + 1);
    }
  };

  const loadMoreUsers = () => {
    if (hasMoreUsers) {
      setUserPage(prev => prev + 1);
    }
  };

  const onSubmit = async (data: TeamFormData) => {
    try {
      await createTeam({
        name: data.name.trim(),
        description: data.description.trim(),
        leadId: data.leadId,
        projectId: data.projectId,
      }).unwrap();
      toast.success('Team created successfully');
      onClose();
      // Call onSuccess callback to refresh teams list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to create team');
    }
  };

  if (isLoadingProjects) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
        <span className="ml-2 text-gray-600">Loading projects...</span>
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

              {/* Custom Project Dropdown */}
              <div className="relative project-dropdown">
                {/* Selected Project Display */}
                <div
                  onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                  className={`flex items-center justify-between w-full px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                    errors.projectId
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 hover:border-orange-400 focus:border-orange-500'
                  } ${projectDropdownOpen ? 'border-orange-500 ring-2 ring-orange-200' : ''}`}
                >
                  <span className={field.value ? 'text-gray-900' : 'text-gray-500'}>
                    {field.value ? allProjects.find(p => p.id === field.value)?.name || 'Select a project' : 'Select a project'}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Dropdown Menu */}
                {projectDropdownOpen && (
                  <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                      <div className="relative">
                        <input
                          type="text"
                          value={projectSearch}
                          onChange={(e) => {
                            setProjectSearch(e.target.value);
                            setProjectPage(1);
                          }}
                          placeholder="Search projects..."
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <svg
                          className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Projects List */}
                    <div className="max-h-40 overflow-y-auto">
                      {isLoadingProjects && projectPage === 1 ? (
                        <div className="px-3 py-4 text-center text-gray-500 text-sm">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-orange-600 mr-2" />
                            Loading projects...
                          </div>
                        </div>
                      ) : allProjects.length === 0 ? (
                        <div className="px-3 py-4 text-center text-gray-500 text-sm">
                          No projects found
                        </div>
                      ) : (
                        allProjects.map((project) => (
                          <div
                            key={project.id}
                            onClick={() => {
                              field.onChange(project.id);
                              setProjectDropdownOpen(false);
                            }}
                            className={`px-3 py-2 cursor-pointer hover:bg-orange-50 transition-colors ${
                              field.value === project.id ? 'bg-orange-100 text-orange-900' : 'text-gray-900'
                            }`}
                          >
                            <div className="font-medium text-sm">{project.name}</div>
                            <div className="text-xs text-gray-500">{project.code}</div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Pagination Controls */}
                    {allProjects.length > 0 && (
                      <div className="border-t border-gray-200 bg-gray-50 p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Showing {allProjects.length} projects
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setProjectPage(prev => Math.max(1, prev - 1))}
                              disabled={projectPage <= 1}
                              className="px-2 py-1 text-xs"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </Button>
                            <span className="text-xs text-gray-500 px-2">
                              Page {projectPage}
                            </span>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={loadMoreProjects}
                              disabled={!hasMoreProjects}
                              loading={isLoadingProjects}
                              className="px-2 py-1 text-xs"
                            >
                              <ChevronLeft className="h-3 w-3 rotate-180" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {errors.projectId && (
                <p className="mt-1 text-sm text-red-600">{errors.projectId.message}</p>
              )}
            </div>
          )}
        />

        <Controller
          name="leadId"
          control={control}
          rules={{ required: 'Team leader is required' }}
          render={({ field }) => (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Team Leader</label>

              {/* Custom User Dropdown */}
              <div className="relative user-dropdown">
                {/* Selected User Display */}
                <div
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center justify-between w-full px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                    errors.leadId
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 hover:border-orange-400 focus:border-orange-500'
                  } ${userDropdownOpen ? 'border-orange-500 ring-2 ring-orange-200' : ''}`}
                >
                  <span className={field.value ? 'text-gray-900' : 'text-gray-500'}>
                    {field.value ? allUsers.find(u => u.id === field.value)?.firstName + ' ' + allUsers.find(u => u.id === field.value)?.lastName || 'Select a team leader' : 'Select a team leader'}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-visible">
                    {/* Search Bar */}
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                      <div className="relative">
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => {
                            setUserSearch(e.target.value);
                            setUserPage(1);
                          }}
                          placeholder="Search users..."
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <svg
                          className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Users List */}
                    <div className="max-h-40 overflow-y-auto">
                      {isLoadingUsers && userPage === 1 ? (
                        <div className="px-3 py-4 text-center text-gray-500 text-sm">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-orange-600 mr-2" />
                            Loading users...
                          </div>
                        </div>
                      ) : allUsers.length === 0 ? (
                        <div className="px-3 py-4 text-center text-gray-500 text-sm">
                          No users found
                        </div>
                      ) : (
                        allUsers.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => {
                              field.onChange(user.id);
                              setUserDropdownOpen(false);
                            }}
                            className={`px-3 py-2 cursor-pointer hover:bg-orange-50 transition-colors ${
                              field.value === user.id ? 'bg-orange-100 text-orange-900' : 'text-gray-900'
                            }`}
                          >
                            <div className="font-medium text-sm">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-gray-500">{user.position}</div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Pagination Controls */}
                    {allUsers.length > 0 && (
                      <div className="border-t border-gray-200 bg-gray-50 p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Showing {allUsers.length} users
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setUserPage(prev => Math.max(1, prev - 1))}
                              disabled={userPage <= 1}
                              className="px-2 py-1 text-xs"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </Button>
                            <span className="text-xs text-gray-500 px-2">
                              Page {userPage}
                            </span>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={loadMoreUsers}
                              disabled={!hasMoreUsers}
                              loading={isLoadingUsers}
                              className="px-2 py-1 text-xs"
                            >
                              <ChevronLeft className="h-3 w-3 rotate-180" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {errors.leadId && (
                <p className="mt-1 text-sm text-red-600">{errors.leadId.message}</p>
              )}
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