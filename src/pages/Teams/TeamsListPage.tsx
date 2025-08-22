import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { useGetTeamsQuery, useDeleteTeamMutation } from '../../features/teams/teamsApi';
import { TeamWithLeader } from '../../types/team';
import DataTable from '../../components/Common/DataTable';
import Button from '../../components/Common/Button';
import Dialog from '../../components/Common/Dialog';
import toast from 'react-hot-toast';
import TeamForm from './TeamForm';

const TeamsListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamWithLeader | null>(null);

  const { data: teams, isLoading } = useGetTeamsQuery({ search });
  const [deleteTeam] = useDeleteTeamMutation();

  const handleDelete = async (team: TeamWithLeader) => {
    if (window.confirm(`Are you sure you want to delete team "${team.name}"?`)) {
      try {
        await deleteTeam(team.id).unwrap();
        toast.success('Team deleted successfully');
      } catch (error) {
        toast.error('Failed to delete team');
      }
    }
  };

  const columns: any[] = [
    { header: 'Name', accessor: (team: TeamWithLeader) => team.name },
    {
      header: 'Project',
      accessor: (team: TeamWithLeader) => team.project ? `${team.project.code} - ${team.project.name}` : '-'
    },
    { 
      header: 'Leader',
      accessor: (team: TeamWithLeader) => team.leader ? `${team.leader.firstName} ${team.leader.lastName}` : '-'
    },
    { 
      header: 'Members',
      accessor: (team: TeamWithLeader) => (
        <Button
          variant="secondary"
          size="sm"
          icon={Users}
        >
          {team.members?.length || 0} Members
        </Button>
      )
    },
    { 
      header: 'Status',
      accessor: (team: TeamWithLeader) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          team.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {team.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (team: TeamWithLeader) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Edit2}
            onClick={() => setEditingTeam(team)}
          />
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => handleDelete(team)}
          />
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Teams</h1>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Add Team
        </Button>
      </div>

      <DataTable
        data={teams || []}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search teams..."
        onSearch={setSearch}
      />

      <Dialog
        isOpen={isCreateDialogOpen || !!editingTeam}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingTeam(null);
        }}
        title={editingTeam ? 'Edit Team' : 'Create Team'}
        size="2xl"
      >
        <TeamForm
          team={editingTeam}
          onClose={() => {
            setIsCreateDialogOpen(false);
            setEditingTeam(null);
          }}
        />
      </Dialog>
    </div>
  );
};

export default TeamsListPage;