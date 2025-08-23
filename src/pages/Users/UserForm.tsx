import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFormContext } from 'react-hook-form';
import { useCreateUserMutation, useUpdateUserMutation } from '../../features/users/usersApi';
import { useSearchProjectsMutation } from '../../features/projects/projectsApi';
import { useSearchTeamsMutation } from '../../features/teams/teamsApi';
import { useSearchRolesMutation } from '../../features/roles/rolesApi';
import { CreateUserDto, UserWithDetails, ProjectRoleAssignment } from '../../types/user';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronLeft, ChevronRight, Search, Plus, X, Shield, Folder, User, Building, Briefcase } from 'lucide-react';

interface UserFormProps {
  user?: UserWithDetails;
  onClose: () => void;
  onSuccess?: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSuccess }) => {
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  // Project dropdown state
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectPage, setProjectPage] = useState(1);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [hasMoreProjects, setHasMoreProjects] = useState(true);

  // Project-Role-Team assignments
  const [projectRoleAssignments, setProjectRoleAssignments] = useState<ProjectRoleAssignment[]>([]);

  // API hooks
  const [searchProjects] = useSearchProjectsMutation();
  const [searchTeams] = useSearchTeamsMutation();
  const [searchRoles] = useSearchRolesMutation();

  // Load projects with pagination
  const loadProjects = async () => {
    try {
      const result = await searchProjects({
        searchTerm: projectSearch,
        page: projectPage,
        limit: 10,
      });
      if ('data' in result && result.data) {
        if (projectPage === 1) {
          setAllProjects(result.data.data);
        } else {
          setAllProjects(prev => [...prev, ...result.data.data]);
        }
        setHasMoreProjects(result.data.hasNextPage);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  // Handle project search
  const handleProjectSearch = (searchTerm: string) => {
    setProjectSearch(searchTerm);
    setProjectPage(1);
    setAllProjects([]);
  };

  // Load more projects
  const loadMoreProjects = () => {
    setProjectPage(prev => prev + 1);
    loadProjects();
  };

  // Add project to assignments
  const addProjectToAssignments = (project: any) => {
    const existingAssignment = projectRoleAssignments.find(a => a.projectId === project.id);
    if (!existingAssignment) {
      setProjectRoleAssignments(prev => [...prev, {
        projectId: project.id,
        roleId: '',
        teamId: ''
      }]);
    }
    setProjectDropdownOpen(false);
  };

  // Remove project from assignments
  const removeProjectFromAssignments = (projectId: string) => {
    setProjectRoleAssignments(prev => prev.filter(a => a.projectId !== projectId));
  };

  // Update role selection for a project
  const updateProjectRole = (projectId: string, roleId: string) => {
    setProjectRoleAssignments(prev => prev.map(a =>
      a.projectId === projectId ? { ...a, roleId } : a
    ));
  };

  // Update team selection for a project
  const updateProjectTeam = (projectId: string, teamId: string) => {
    setProjectRoleAssignments(prev => prev.map(a =>
      a.projectId === projectId ? { ...a, teamId } : a
    ));
  };

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.project-dropdown')) {
        setProjectDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateUserDto>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      employeeId: user?.employeeId || '',
      department: user?.department || '',
      position: user?.position || '',
    },
  });

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [projectSearch, projectPage]);

  // Set selected values when user prop changes
  useEffect(() => {
    if (user) {
      // Initialize project-role-team assignments if user has existing assignments
      if (user.projectRoles && user.projectRoles.length > 0) {
        // Map the existing projectRoles to our local state
        const existingAssignments = user.projectRoles.map(projectRole => ({
          projectId: projectRole.projectId,
          roleId: projectRole.roleId,
          teamId: projectRole.teamId || '' // Handle null teamId
        }));
        setProjectRoleAssignments(existingAssignments);
      } else {
        setProjectRoleAssignments([]);
      }
    } else {
      // Reset assignments for new user
      setProjectRoleAssignments([]);
    }
  }, [user]);

  const onSubmit = async (data: CreateUserDto) => {
    try {
      // Filter out assignments that don't have both roleId and teamId
      const validAssignments = projectRoleAssignments.filter(
        assignment => assignment.roleId && assignment.teamId
      );

      const userData = {
        ...data,
        projectRoleAssignments: validAssignments
      };

      if (user) {
        await updateUser({ id: user.id, ...userData }).unwrap();
        toast.success('User updated successfully');
      } else {
        await createUser(userData).unwrap();
        toast.success('User created successfully');
      }
      onClose();
      // Call onSuccess callback to refresh users list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(user ? 'Failed to update user' : 'Failed to create user');
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-xl">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user ? 'Edit User' : 'Create New User'}
            </h2>
            <p className="text-gray-600 mt-2 text-base">
              {user ? 'Update user information and assignments' : 'Add a new user to the system'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 h-full">
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-12">
          {/* Personal Information Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: 'First name is required' }}
                  render={({ field }) => (
                    <Input
                      label="First Name"
                      error={errors.firstName?.message}
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: 'Last name is required' }}
                  render={({ field }) => (
                    <Input
                      label="Last Name"
                      error={errors.lastName?.message}
                      {...field}
                    />
                  )}
                />
              </div>

              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field }) => (
                  <Input
                    label="Email Address"
                    type="email"
                    error={errors.email?.message}
                    {...field}
                  />
                )}
              />

              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Employee ID"
                    error={errors.employeeId?.message}
                    {...field}
                  />
                )}
              />

              {!user && (
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      label="Password"
                      type="password"
                      error={errors.password?.message}
                      {...field}
                    />
                  )}
                />
              )}
            </div>
          </div>

          {/* Project & Role Assignments Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Project & Role Assignments</h2>
            </div>

            <div className="space-y-5">
              {/* Project Selection */}
              <div className="relative project-dropdown">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Project</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white hover:border-gray-400 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Folder className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Select a project to add</span>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {projectDropdownOpen && (
                    <div className="absolute z-[9999] w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-hidden">
                      {/* Search Bar */}
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search projects..."
                            value={projectSearch}
                            onChange={(e) => handleProjectSearch(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>

                      {/* Project List */}
                      <div className="max-h-48 overflow-y-auto">
                        {allProjects
                          .filter(project => !projectRoleAssignments.some(a => a.projectId === project.id))
                          .map((project) => (
                            <button
                              key={project.id}
                              type="button"
                              onClick={() => addProjectToAssignments(project)}
                              className="w-full text-left px-4 py-3 hover:bg-purple-50 focus:bg-purple-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{project.code} - {project.name}</div>
                              {project.description && (
                                <div className="text-sm text-gray-500">{project.description}</div>
                              )}
                            </button>
                          ))}
                      </div>

                      {/* Pagination */}
                      {hasMoreProjects && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={loadMoreProjects}
                            className="w-full"
                          >
                            Load More Projects
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Projects & Roles */}
              <div className="space-y-4">
                {projectRoleAssignments.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <Folder className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No projects assigned yet</p>
                    <p className="text-gray-400 text-xs mt-1">Select projects above to get started</p>
                  </div>
                ) : (
                  projectRoleAssignments.map((assignment) => (
                    <ProjectRoleSelector
                      key={assignment.projectId}
                      assignment={assignment}
                      onUpdateRole={(roleId) => updateProjectRole(assignment.projectId, roleId)}
                      onUpdateTeam={(teamId) => updateProjectTeam(assignment.projectId, teamId)}
                      onRemove={() => removeProjectFromAssignments(assignment.projectId)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-8 mt-8 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onClose}
            className="px-8 py-3 text-base"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isCreating || isUpdating}
            className="px-8 py-3 text-base"
          >
            {user ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Project Role Selector Component
interface ProjectRoleSelectorProps {
  assignment: ProjectRoleAssignment;
  onUpdateRole: (roleId: string) => void;
  onUpdateTeam: (teamId: string) => void;
  onRemove: () => void;
}

const ProjectRoleSelector: React.FC<ProjectRoleSelectorProps> = ({ assignment, onUpdateRole, onUpdateTeam, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState('');
  const [roles, setRoles] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [projectInfo, setProjectInfo] = useState<any>(null);

  // Get existing user data to show project and role names
  const existingUser = useFormContext()?.getValues() as any;
  const existingProjectRole = existingUser?.projectRoles?.find((pr: any) => pr.projectId === assignment.projectId);

  // Fetch project information
  const fetchProjectInfo = async () => {
    try {
      const response = await fetch(`http://localhost:3000/projects/${assignment.projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const project = await response.json();
        setProjectInfo(project);
      }
    } catch (error) {
      console.error('Failed to fetch project info:', error);
    }
  };

  // Fetch teams for this project
  const fetchProjectTeams = async () => {
    setIsLoadingTeams(true);
    try {
      const response = await fetch(`http://localhost:3000/teams?projectId=${assignment.projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const projectTeams = await response.json();
        if (Array.isArray(projectTeams)) {
          setTeams(projectTeams);
        } else {
          console.warn('Expected array of teams, got:', projectTeams);
          setTeams([]);
        }
      } else {
        console.error('Failed to fetch project teams:', response.status, response.statusText);
        setTeams([]);
      }
    } catch (error) {
      console.error('Failed to fetch project teams:', error);
      setTeams([]);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  // Fetch roles for this project
  const fetchProjectRoles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/projects/${assignment.projectId}/roles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const projectRoles = await response.json();
        // Ensure we have a valid array of roles
        if (Array.isArray(projectRoles)) {
          setRoles(projectRoles);
        } else {
          console.warn('Expected array of roles, got:', projectRoles);
          setRoles([]);
        }
      } else {
        console.error('Failed to fetch project roles:', response.status, response.statusText);
        setRoles([]);
      }
    } catch (error) {
      console.error('Failed to fetch project roles:', error);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectInfo();
    fetchProjectTeams();
  }, [assignment.projectId]);

  useEffect(() => {
    if (isOpen) {
      fetchProjectRoles();
    }
  }, [isOpen, assignment.projectId]);

  const toggleRole = (roleId: string) => {
    onUpdateRole(roleId);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Folder className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {existingProjectRole ? (
                `${existingProjectRole.projectName}`
              ) : projectInfo ? (
                `${projectInfo.code} - ${projectInfo.name}`
              ) : (
                'Loading...'
              )}
            </div>
            {existingProjectRole && (
              <div className="text-sm text-gray-600">
                Role: <span className="font-medium">{existingProjectRole.roleName}</span>
                {existingProjectRole.teamName && (
                  <> | Team: <span className="font-medium">{existingProjectRole.teamName}</span></>
                )}
              </div>
            )}
            <div className="text-sm text-gray-500">
              {assignment.roleId && assignment.teamId ? (
                <span className="text-green-600 font-medium">✓ Fully Configured</span>
              ) : (
                <span className="text-orange-600 font-medium">⚠ Needs Configuration</span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Role: {assignment.roleId ? 'Selected' : 'Not Selected'} |
              Team: {assignment.teamId ? 'Selected' : 'Not Selected'}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
              assignment.roleId && assignment.teamId
                ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
            }`}
          >
            {isOpen ? 'Hide Details' : 'Configure'}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            title="Remove project"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          {/* Team Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Team {assignment.teamId && <span className="text-green-600">✓</span>}
            </label>
            {isLoadingTeams ? (
              <div className="flex items-center space-x-2 py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-500">Loading teams...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={assignment.teamId}
                  onChange={(e) => onUpdateTeam(e.target.value)}
                  className={`block w-full rounded-lg border shadow-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    assignment.teamId ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">No team assigned</option>
                  {teams.length > 0 ? (
                    teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No teams available for this project</option>
                  )}
                </select>
                {existingProjectRole && !existingProjectRole.teamId && (
                  <div className="text-xs text-gray-500 italic">
                    This user currently has no team assignment for this project
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Role {assignment.roleId && <span className="text-green-600">✓</span>}
            </label>
            {existingProjectRole && assignment.roleId && (
              <div className="text-xs text-gray-500 italic mb-2">
                Current role: <span className="font-medium">{existingProjectRole.roleName}</span>
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search roles..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Roles List */}
          {isLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-500 text-sm mt-2">Loading roles...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Array.isArray(roles) && roles.length > 0 ? (
                roles
                  .filter(role =>
                    role && role.id && (
                      (role.name && role.name.toLowerCase().includes(roleSearch.toLowerCase())) ||
                      (role.description && role.description.toLowerCase().includes(roleSearch.toLowerCase()))
                    )
                  )
                  .map((role) => (
                    <label key={role.id} className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      assignment.roleId === role.id
                        ? 'bg-purple-50 border border-purple-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}>
                      <input
                        type="radio"
                        name={`role-${assignment.projectId}`}
                        checked={assignment.roleId === role.id}
                        onChange={() => toggleRole(role.id)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <div className="flex items-center space-x-2 flex-1">
                        <div className={`p-1.5 rounded ${
                          assignment.roleId === role.id ? 'bg-purple-200' : 'bg-purple-100'
                        }`}>
                          <Shield className={`h-3.5 w-3.5 ${
                            assignment.roleId === role.id ? 'text-purple-700' : 'text-purple-600'
                          }`} />
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${
                            assignment.roleId === role.id ? 'text-purple-900' : 'text-gray-900'
                          }`}>
                            {role.name || 'Unnamed Role'}
                            {assignment.roleId === role.id && <span className="ml-2 text-purple-600">✓ Selected</span>}
                          </div>
                          {role.description && (
                            <div className={`text-xs ${
                              assignment.roleId === role.id ? 'text-purple-600' : 'text-gray-500'
                            }`}>
                              {role.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No roles found for this project.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserForm;
