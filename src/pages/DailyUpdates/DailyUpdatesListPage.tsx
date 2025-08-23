import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Edit2, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchDailyUpdatesMutation, useDeleteDailyUpdateMutation } from '../../features/dailyUpdates/dailyUpdatesApi';
import { DailyUpdate, DailyUpdateSearchParams } from '../../types/dailyUpdate';
import { useUserCompleteInformation } from '../../features/users/useUserCompleteInformation';
import { useAppSelector } from '../../app/store';
import Button from '../../components/Common/Button';
import Dialog from '../../components/Common/Dialog';
import DailyUpdateForm from './DailyUpdateForm';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const DailyUpdatesListPage: React.FC = () => {
  const { userCompleteInformation } = useUserCompleteInformation();
  const { user } = useAppSelector((state) => state.auth);
console.log("user",userCompleteInformation);

  const [searchParams, setSearchParams] = useState<DailyUpdateSearchParams>({
    userId: user?.id,
    page: 1,
    limit: 10,
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<DailyUpdate | null>(null);

  const [searchDailyUpdates, { data: searchResponse, isLoading }] = useSearchDailyUpdatesMutation();
  const [deleteDailyUpdate] = useDeleteDailyUpdateMutation();

  const dailyUpdates = searchResponse?.data || [];
  const pagination = searchResponse;

  useEffect(() => {
    if (user?.id) {
      searchDailyUpdates(searchParams);
    }
  }, [searchParams, user?.id, searchDailyUpdates]);

  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (update: DailyUpdate) => {
    if (window.confirm(`Are you sure you want to delete this daily update?`)) {
      try {
        await deleteDailyUpdate(update.id).unwrap();
        toast.success('Daily update deleted successfully');
        searchDailyUpdates(searchParams);
      } catch (error) {
        toast.error('Failed to delete daily update');
      }
    }
  };

  const getProjectName = (projectId: string) => {
    const project = userCompleteInformation?.projects?.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

console.log("update",dailyUpdates );

  const columns = [
    {
      header: 'Date',
      accessor: (update: DailyUpdate) => (
        <div className="text-gray-900">
          {new Date(update.date).toLocaleDateString()}
        </div>
      )
    },
    {
      header: 'Project',
      accessor: (update: DailyUpdate) => (
        <div className="text-gray-900">
          {getProjectName(update.projectId)}
        </div>
      )
    },
    {
      header: 'Team',
      accessor: (update: DailyUpdate) => (
        <div className="text-gray-900">
          {(update.teamName)}
        </div>
      )
    },
    {
      header: 'Tickets',
      accessor: (update: DailyUpdate) => (
        <div className="text-gray-900 max-w-xs truncate">
          {update.tickets || '-'}
        </div>
      )
    },
    {
      header: 'Hours',
      accessor: (update: DailyUpdate) => (
        <div className="text-sm text-gray-900">
          <div>Internal: {update.internalMeetingHours}h</div>
          <div>External: {update.externalMeetingHours}h</div>
          <div>Other: {update.otherActivityHours}h</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (update: DailyUpdate) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          update.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
          update.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          update.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {update.status || 'DRAFT'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (update: DailyUpdate) => (
        <div className="flex space-x-2">
          <Link to={`/daily-updates/${update.id}/view`}>
            <Button variant="secondary" size="sm" icon={Eye} />
          </Link>
          <Button
            variant="secondary"
            size="sm"
            icon={Edit2}
            onClick={() => setEditingUpdate(update)}
          />
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => handleDelete(update)}
          />
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Daily Updates</h1>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Add Daily Update
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Project Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
            <select
              value={searchParams.projectId || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, projectId: e.target.value || undefined }))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Projects</option>
              {userCompleteInformation?.projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
            <select
              value={searchParams.teamId || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, teamId: e.target.value || undefined }))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Teams</option>
              {userCompleteInformation?.projects?.flatMap(project =>
                project.teams?.map(team => (
                  <option key={team.id} value={team.id}>
                    {project.name} - {team.name}
                  </option>
                )) || []
              )}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={searchParams.status || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value || undefined }))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={searchParams.startDate || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value || undefined }))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={searchParams.endDate || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value || undefined }))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Tickets Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tickets</label>
            <input
              type="text"
              value={searchParams.tickets || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, tickets: e.target.value || undefined }))}
              placeholder="Search tickets..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={handleSearch}
              className="w-full"
              icon={Search}
            >
              Search
            </Button>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => setSearchParams({
                userId: user?.id,
                page: 1,
                limit: 10,
              })}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Daily Updates Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  </td>
                </tr>
              ) : dailyUpdates.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                    No daily updates found
                  </td>
                </tr>
              ) : (
                dailyUpdates.map((update: any) => (
                  <tr key={update.id} className="hover:bg-gray-50">
                    {columns.map((column, index) => (
                      <td key={index} className="px-6 py-4 whitespace-nowrap">
                        {column.accessor(update)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                onClick={() => setSearchParams(prev => ({ ...prev, page: prev.page! - 1 }))}
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
                onClick={() => setSearchParams(prev => ({ ...prev, page: prev.page! + 1 }))}
                disabled={!pagination.hasNextPage}
                icon={ChevronRight}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        isOpen={isCreateDialogOpen || !!editingUpdate}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingUpdate(null);
        }}
        title={editingUpdate ? 'Edit Daily Update' : 'Create Daily Update'}
        size="lg"
      >
        <DailyUpdateForm
          dailyUpdate={editingUpdate || undefined}
          onClose={() => {
            setIsCreateDialogOpen(false);
            setEditingUpdate(null);
          }}
          onSuccess={() => {
            // Refresh the list after successful creation/update
            searchDailyUpdates(searchParams);
            setIsCreateDialogOpen(false);
            setEditingUpdate(null);
          }}
        />
      </Dialog>
    </div>
  );
};

export default DailyUpdatesListPage;
