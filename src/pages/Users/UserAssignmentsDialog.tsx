import React, { useState } from 'react';
import { useGetProjectsQuery } from '../../features/projects/projectsApi';
import { useGetTeamsQuery } from '../../features/teams/teamsApi';
import { useUpdateUserAssignmentsMutation } from '../../features/users/usersApi';
import { UserWithDetails } from '../../types/user';
import Button from '../../components/Common/Button';
import { Search, Folder, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserAssignmentsDialogProps {
  user: UserWithDetails;
  onClose: () => void;
}

const UserAssignmentsDialog: React.FC<UserAssignmentsDialogProps> = ({ user, onClose }) => {
  const [search, setSearch] = useState('');
  const { data: projects } = useGetProjectsQuery({});
  const { data: teams } = useGetTeamsQuery({});
  const [updateAssignments, { isLoading }] = useUpdateUserAssignmentsMutation();

  const currentProjectIds = user.projects?.map(p => p.id) || [];
  const currentTeamIds = user.teams?.map(t => t.id) || [];

  const [selectedProjects, setSelectedProjects] = useState<string[]>(currentProjectIds);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(currentTeamIds);

  const filteredProjects = projects?.data.filter(project => 
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    project.code.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const filteredTeams = teams?.data.filter(team => 
    team.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleToggleProject = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleToggleTeam = (teamId: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSave = async () => {
    try {
      await updateAssignments({
        userId: user.id,
        projectIds: selectedProjects,
        teamIds: selectedTeams,
      }).unwrap();
      toast.success('User assignments updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update user assignments');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          placeholder="Search projects and teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Projects List */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Folder className="h-5 w-5 mr-2 text-gray-400" />
            Projects
          </h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {project.name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {project.code}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => handleToggleProject(project.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Teams List */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-gray-400" />
            Teams
          </h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {team.name}
                    </p>
                    {team.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {team.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      checked={selectedTeams.includes(team.id)}
                      onChange={() => handleToggleTeam(team.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          loading={isLoading}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default UserAssignmentsDialog;
