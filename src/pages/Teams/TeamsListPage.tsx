import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchTeamsMutation, useDeleteTeamMutation } from '../../features/teams/teamsApi';
import DataTable from '../../components/Common/DataTable';
import Button from '../../components/Common/Button';
import Dialog from '../../components/Common/Dialog';
import toast from 'react-hot-toast';
import TeamForm from './TeamForm';
import { Project } from '../../types/project';
import { User } from '../../types/user';
interface TeamWithLeader {
  id: string;
  name: string;
  project: Project;
  projectName: string;
  leader: User;
  leadName: string;
  members: User[];
  isActive: boolean;
  userCount: number;
}

const TeamsListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [projectId, setProjectId] = useState<string>('');
  const [leadId, setLeadId] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamWithLeader | null>(null);

  const [searchTeams, { data: teamsResponse, isLoading }] = useSearchTeamsMutation();
  const [deleteTeam] = useDeleteTeamMutation();

  const teams = teamsResponse?.data || [];
  const pagination = teamsResponse;
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    searchTeams({
      searchTerm: search,
      page,
      limit,
      projectId: projectId || undefined,
      leadId: leadId || undefined,
    }).finally(() => {
      setIsInitialLoading(false);
    });
  }, [search, page, limit, projectId, leadId, searchTeams]);

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
      accessor: (team: TeamWithLeader) => team.projectName || '-'
    },
    {
      header: 'Team Lead',
      accessor: (team: TeamWithLeader) => team.leadName || '-'
    },
    {
      header: 'Members',
      accessor: (team: TeamWithLeader) => (
        <Button
          variant="secondary"
          size="sm"
          icon={Users}
        >
          {team.userCount || 0} Members
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams..."
              className="block w-full rounded-lg py-2 px-3 border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project ID</label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Project UUID"
              className="block w-full rounded-lg py-2 px-3 border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div> */}
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setProjectId('');
                setLeadId('');
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        data={teams}
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
          onSuccess={() => {
            // Refresh teams list after successful creation/update
            searchTeams({
              searchTerm: search,
              page: page,
              limit: limit,
              projectId: projectId || undefined,
              leadId: leadId || undefined,
            });
          }}
        />
      </Dialog>
    </div>
  );
};

export default TeamsListPage;