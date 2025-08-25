import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, Loader2, CalendarDays } from 'lucide-react';
import { useSearchDailyUpdatesMutation, useDeleteDailyUpdateMutation } from '../../features/dailyUpdates/dailyUpdatesApi';
import { DailyUpdate, DailyUpdateSearchParams } from '../../types/dailyUpdate';
import { useUserCompleteInformation } from '../../features/users/useUserCompleteInformation';
import { useAppSelector } from '../../app/store';
import Button from '../../components/Common/Button';
import Dialog from '../../components/Common/Dialog';
import DailyUpdateForm from './DailyUpdateForm';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const DailyUpdatesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { userCompleteInformation } = useUserCompleteInformation();
  const { user } = useAppSelector((state) => state.auth);

  const [searchParams, setSearchParams] = useState<DailyUpdateSearchParams>({
    userId: user?.id,
    page: 1,
    limit: 10,
  });

  const [editingUpdate, setEditingUpdate] = useState<DailyUpdate | null>(null);

  // Dropdown states
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [dateRangeDropdownOpen, setDateRangeDropdownOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');

  const [searchDailyUpdates, { data: searchResponse, isLoading }] = useSearchDailyUpdatesMutation();
  const [deleteDailyUpdate] = useDeleteDailyUpdateMutation();

  const dailyUpdates = searchResponse?.data || [];
  const pagination = searchResponse;

  useEffect(() => {
    if (user?.id) {
      searchDailyUpdates(searchParams);
    }
  }, [searchParams, user?.id, searchDailyUpdates]);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.project-dropdown')) {
        setProjectDropdownOpen(false);
      }
      if (!target.closest('.team-dropdown')) {
        setTeamDropdownOpen(false);
      }
      if (!target.closest('.date-range-dropdown')) {
        setDateRangeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getTeamName = (teamId: string) => {
    const project = userCompleteInformation?.projects?.find(p =>
      p.teams?.some(t => t.id === teamId)
    );
    const team = project?.teams?.find(t => t.id === teamId);
    return team?.name || 'Unknown Team';
  };

  // Helper function to format date for display
  const formatDateForDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to get date range display text
  const getDateRangeDisplayText = () => {
    if (searchParams.startDate && searchParams.endDate) {
      return `${formatDateForDisplay(searchParams.startDate)} - ${formatDateForDisplay(searchParams.endDate)}`;
    } else if (searchParams.startDate) {
      return `From ${formatDateForDisplay(searchParams.startDate)}`;
    } else if (searchParams.endDate) {
      return `Until ${formatDateForDisplay(searchParams.endDate)}`;
    }
    return 'Select date range';
  };

  // Filter projects based on search
  const filteredProjects = userCompleteInformation?.projects?.filter(project =>
    project.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    project.code?.toLowerCase().includes(projectSearch.toLowerCase())
  ) || [];

  // Filter teams based on search and selected project
  const filteredTeams = userCompleteInformation?.projects?.flatMap(project =>
    project.teams?.filter(team =>
      team.name.toLowerCase().includes(teamSearch.toLowerCase()) &&
      (!searchParams.projectId || project.id === searchParams.projectId)
    ).map(team => ({
      ...team,
      projectName: project.name
    })) || []
  ) || [];

  const columns = [
    {
      header: 'Date',
      accessor: (update: DailyUpdate) => (
        <div className="text-gray-900">
          <div className="font-medium">{new Date(update.date).toLocaleDateString()}</div>
          {parseFloat(update.leavePermissionHours || '0') > 0 && parseFloat(update.ticketsHours || '0') === 0 ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
              Leave Day
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
              Working Day
            </span>
          )}
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
          <div className="font-medium">{update.teamName || '-'}</div>
          {update.teamDescription && (
            <div className="text-xs text-gray-500 mt-1">{update.teamDescription}</div>
          )}
        </div>
      )
    },
    {
      header: 'Tickets & Activities',
      accessor: (update: DailyUpdate) => (
        <div className="text-gray-900 max-w-xs">
          {update.tickets ? (
            <div className="text-sm">
              <div className="font-medium text-gray-900">{update.tickets}</div>
              {update.ticketsHours && parseFloat(update.ticketsHours) > 0 && (
                <div className="text-xs text-gray-500">{update.ticketsHours}h</div>
              )}
            </div>
          ) : update.otherActivities ? (
            <div className="text-sm">
              <div className="font-medium text-gray-900">{update.otherActivities}</div>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          )}
        </div>
      )
    },
    {
      header: 'Hours',
      accessor: (update: DailyUpdate) => (
        <div className="text-sm text-gray-900">
          <div className="font-semibold text-orange-600 mb-1">
            Total: {update.totalHours || '0.00'}h
          </div>
          {parseFloat(update.ticketsHours || '0') > 0 && (
            <div className="text-xs text-gray-600">Tickets: {update.ticketsHours}h</div>
          )}
          {parseFloat(update.internalMeetingHours || '0') > 0 && (
            <div className="text-xs text-gray-600">Internal: {update.internalMeetingHours}h</div>
          )}
          {parseFloat(update.externalMeetingHours || '0') > 0 && (
            <div className="text-xs text-gray-600">External: {update.externalMeetingHours}h</div>
          )}
          {parseFloat(update.otherActivityHours || '0') > 0 && (
            <div className="text-xs text-gray-600">Other: {update.otherActivityHours}h</div>
          )}
          {parseFloat(update.leavePermissionHours || '0') > 0 && (
            <div className="text-xs text-gray-600 text-blue-600">Leave: {update.leavePermissionHours}h</div>
          )}
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
      header: 'Timeline',
      accessor: (update: DailyUpdate) => (
        <div className="text-xs text-gray-600 space-y-1">
          <div>Created: {new Date(update.createdAt).toLocaleDateString()}</div>
          {update.submittedAt && (
            <div>Submitted: {new Date(update.submittedAt).toLocaleDateString()}</div>
          )}
          {update.approvedAt && (
            <div className="text-green-600">Approved: {new Date(update.approvedAt).toLocaleDateString()}</div>
          )}
        </div>
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
          onClick={() => navigate('/daily-updates/create')}
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
          <div className="project-dropdown">
            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
            <div className="relative">
              {/* Selected Project Display */}
              <div
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                className={`flex items-center justify-between w-full px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                  'border-gray-300 hover:border-orange-400 focus:border-orange-500'
                } ${projectDropdownOpen ? 'border-orange-500 ring-2 ring-orange-200' : ''}`}
              >
                <span className={searchParams.projectId ? 'text-gray-900' : 'text-gray-500'}>
                  {searchParams.projectId ? getProjectName(searchParams.projectId) : 'All Projects'}
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
                        onChange={(e) => setProjectSearch(e.target.value)}
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
                    {filteredProjects.length === 0 ? (
                      <div className="px-3 py-4 text-center text-gray-500 text-sm">
                        No projects found
                      </div>
                    ) : (
                      <>
                        <div
                          onClick={() => {
                            setSearchParams(prev => ({
                              ...prev,
                              projectId: undefined,
                              teamId: undefined // Clear team selection when clearing project
                            }));
                            setProjectDropdownOpen(false);
                            setProjectSearch('');
                          }}
                          className="px-3 py-2 cursor-pointer hover:bg-orange-50 transition-colors text-gray-900"
                        >
                          <div className="font-medium text-sm">All Projects</div>
                        </div>
                        {filteredProjects.map((project) => (
                          <div
                            key={project.id}
                            onClick={() => {
                              setSearchParams(prev => ({
                                ...prev,
                                projectId: project.id,
                                teamId: undefined // Clear team selection when project changes
                              }));
                              setProjectDropdownOpen(false);
                              setProjectSearch('');
                            }}
                            className={`px-3 py-2 cursor-pointer hover:bg-orange-50 transition-colors ${
                              searchParams.projectId === project.id ? 'bg-orange-100 text-orange-900' : 'text-gray-900'
                            }`}
                          >
                            <div className="font-medium text-sm">{project.name}</div>
                            {project.code && <div className="text-xs text-gray-500">{project.code}</div>}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Team Filter */}
          <div className="team-dropdown">
            <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
            <div className="relative">
              {/* Selected Team Display */}
              <div
                onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
                className={`flex items-center justify-between w-full px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                  'border-gray-300 hover:border-orange-400 focus:border-orange-500'
                } ${teamDropdownOpen ? 'border-orange-500 ring-2 ring-orange-200' : ''}`}
              >
                <span className={searchParams.teamId ? 'text-gray-900' : 'text-gray-500'}>
                  {searchParams.teamId ? getTeamName(searchParams.teamId) : 'All Teams'}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${teamDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Dropdown Menu */}
              {teamDropdownOpen && (
                <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                  {/* Search Bar */}
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <div className="relative">
                      <input
                        type="text"
                        value={teamSearch}
                        onChange={(e) => setTeamSearch(e.target.value)}
                        placeholder="Search teams..."
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

                  {/* Teams List */}
                  <div className="max-h-40 overflow-y-auto">
                    {filteredTeams.length === 0 ? (
                      <div className="px-3 py-4 text-center text-gray-500 text-sm">
                        {searchParams.projectId ? 'No teams available for this project' : 'No teams found'}
                      </div>
                    ) : (
                      <>
                        <div
                          onClick={() => {
                            setSearchParams(prev => ({ ...prev, teamId: undefined }));
                            setTeamDropdownOpen(false);
                            setTeamSearch('');
                          }}
                          className="px-3 py-2 cursor-pointer hover:bg-orange-50 transition-colors text-gray-900"
                        >
                          <div className="font-medium text-sm">All Teams</div>
                        </div>
                        {filteredTeams.map((team) => (
                          <div
                            key={team.id}
                            onClick={() => {
                              setSearchParams(prev => ({ ...prev, teamId: team.id }));
                              setTeamDropdownOpen(false);
                              setTeamSearch('');
                            }}
                            className={`px-3 py-2 cursor-pointer hover:bg-orange-50 transition-colors ${
                              searchParams.teamId === team.id ? 'bg-orange-100 text-orange-900' : 'text-gray-900'
                            }`}
                          >
                            <div className="font-medium text-sm">{team.name}</div>
                            <div className="text-xs text-gray-500">{team.projectName}</div>
                          </div>
                        ))}
                      </>
                    )}
                    {searchParams.projectId && filteredTeams.length === 0 && (
                      <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100">
                        Select a different project to see available teams
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Date Range Picker */}
          <div className="date-range-dropdown">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarDays className="inline h-4 w-4 mr-1" />
              Date Range
            </label>
            <div className="relative">
              {/* Selected Date Range Display */}
              <div
                onClick={() => setDateRangeDropdownOpen(!dateRangeDropdownOpen)}
                className={`flex items-center justify-between w-full px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                  'border-gray-300 hover:border-orange-400 focus:border-orange-500'
                } ${dateRangeDropdownOpen ? 'border-orange-500 ring-2 ring-orange-200' : ''}`}
              >
                <span className={searchParams.startDate || searchParams.endDate ? 'text-gray-900' : 'text-gray-500'}>
                  {getDateRangeDisplayText()}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${dateRangeDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Date Range Dropdown Menu */}
              {dateRangeDropdownOpen && (
                <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  {/* Header */}
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">Select Date Range</h4>
                      <button
                        onClick={() => {
                          setSearchParams(prev => ({ ...prev, startDate: undefined, endDate: undefined }));
                          setDateRangeDropdownOpen(false);
                        }}
                        className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Date Inputs */}
                  <div className="p-4 space-y-4">
                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Start Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={searchParams.startDate || ''}
                          max={searchParams.endDate || undefined}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value || undefined }))}
                          className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        End Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={searchParams.endDate || ''}
                          min={searchParams.startDate || undefined}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value || undefined }))}
                          className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                      {searchParams.startDate && searchParams.endDate && searchParams.startDate > searchParams.endDate && (
                        <p className="mt-1 text-xs text-red-600">End date must be after start date</p>
                      )}
                    </div>

                    {/* Quick Date Presets */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quick Select</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            const today = new Date();
                            const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                            setSearchParams(prev => ({
                              ...prev,
                              startDate: lastWeek.toISOString().split('T')[0],
                              endDate: today.toISOString().split('T')[0]
                            }));
                            setDateRangeDropdownOpen(false);
                          }}
                          className="px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-orange-50 hover:border-orange-300 transition-colors"
                        >
                          Last 7 days
                        </button>
                        <button
                          onClick={() => {
                            const today = new Date();
                            const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                            setSearchParams(prev => ({
                              ...prev,
                              startDate: lastMonth.toISOString().split('T')[0],
                              endDate: today.toISOString().split('T')[0]
                            }));
                            setDateRangeDropdownOpen(false);
                          }}
                          className="px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-orange-50 hover:border-orange-300 transition-colors"
                        >
                          Last 30 days
                        </button>
                        <button
                          onClick={() => {
                            const today = new Date();
                            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                            setSearchParams(prev => ({
                              ...prev,
                              startDate: startOfMonth.toISOString().split('T')[0],
                              endDate: today.toISOString().split('T')[0]
                            }));
                            setDateRangeDropdownOpen(false);
                          }}
                          className="px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-orange-50 hover:border-orange-300 transition-colors"
                        >
                          This month
                        </button>
                        <button
                          onClick={() => {
                            const today = new Date();
                            const startOfYear = new Date(today.getFullYear(), 0, 1);
                            setSearchParams(prev => ({
                              ...prev,
                              startDate: startOfYear.toISOString().split('T')[0],
                              endDate: today.toISOString().split('T')[0]
                            }));
                            setDateRangeDropdownOpen(false);
                          }}
                          className="px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-orange-50 hover:border-orange-300 transition-colors"
                        >
                          This year
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {searchParams.startDate && searchParams.endDate ? (
                          <span>Selected: {getDateRangeDisplayText()}</span>
                        ) : (
                          <span>No date range selected</span>
                        )}
                      </div>
                      <button
                        onClick={() => setDateRangeDropdownOpen(false)}
                        className="px-3 py-1 text-xs bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

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
              onClick={() => {
                setSearchParams({
                  userId: user?.id,
                  page: 1,
                  limit: 10,
                });
                setProjectSearch('');
                setTeamSearch('');
                setDateRangeDropdownOpen(false);
              }}
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

      {/* Edit Dialog */}
      {editingUpdate && (
        <Dialog
          isOpen={!!editingUpdate}
          onClose={() => setEditingUpdate(null)}
          title="Edit Daily Update"
          size="lg"
        >
          <DailyUpdateForm
            dailyUpdate={editingUpdate}
            onClose={() => setEditingUpdate(null)}
            onSuccess={() => {
              // Refresh the list after successful update
              searchDailyUpdates(searchParams);
              setEditingUpdate(null);
            }}
          />
        </Dialog>
      )}
    </div>
  );
};

export default DailyUpdatesListPage;
