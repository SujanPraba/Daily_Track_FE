import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Legend,
} from 'recharts';
import { Calendar, Download, Filter, TrendingUp, Clock, Users, Building2, Target, ChevronDown } from 'lucide-react';
import Button from '../../components/Common/Button';
import { useUserCompleteInformation } from '../../features/users/useUserCompleteInformation';
import { useAppSelector } from '../../app/store';

import toast from 'react-hot-toast';

interface TimeTrackingData {
  userId: string;
  userName: string;
  projectId: string;
  projectName: string;
  teamId: string;
  teamName: string;
  date: string;
  internalMeetingHours: string;
  externalMeetingHours: string;
  otherActivityHours: string;
  ticketsHours: string;
  leavePermissionHours: string;
  totalHours: string;
}

const ReportsPage: React.FC = () => {
  const { userCompleteInformation } = useUserCompleteInformation();
  const { user } = useAppSelector((state) => state.auth);

  // Filter states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [filterTimeBy, setFilterTimeBy] = useState<'day' | 'fullTime'>('day');

  // Hours filter states
  const [showHoursFilter, setShowHoursFilter] = useState(false);
  const [selectedHours, setSelectedHours] = useState<Record<string, boolean>>({
    ticketsHours: true,
    internalMeetingHours: true,
    externalMeetingHours: true,
    otherActivityHours: true,
    leavePermissionHours: true,
  });

  // Data states
  const [timeTrackingData, setTimeTrackingData] = useState<TimeTrackingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Set default date range (last 30 days)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  // Fetch time tracking data
  const fetchTimeTrackingData = async () => {
    if (!startDate || !endDate) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/daily-updates/time-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: selectedProject || undefined,
          teamId: selectedTeam || undefined,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate + 'T23:59:59.999Z').toISOString(),
          filterTimeBy: filterTimeBy,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTimeTrackingData(data);
      } else if (response.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error('Failed to fetch time tracking data');
      }
    } catch (error) {
      console.error('Error fetching time tracking data:', error);
      toast.error('Failed to fetch time tracking data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeTrackingData();
  }, [startDate, endDate, selectedProject, selectedTeam, filterTimeBy]);

  // Process data for charts
  const getProjectChartData = () => {
    const projectMap = new Map<string, {
      name: string;
      totalHours: number;
      ticketsHours: number;
      meetingHours: number;
      otherHours: number;
      leaveHours: number;
    }>();

    timeTrackingData.forEach(item => {
      const existing = projectMap.get(item.projectId) || {
        name: item.projectName,
        totalHours: 0,
        ticketsHours: 0,
        meetingHours: 0,
        otherHours: 0,
        leaveHours: 0,
      };

      existing.totalHours += parseFloat(item.totalHours);
      existing.ticketsHours += parseFloat(item.ticketsHours);
      existing.meetingHours += parseFloat(item.internalMeetingHours) + parseFloat(item.externalMeetingHours);
      existing.otherHours += parseFloat(item.otherActivityHours);
      existing.leaveHours += parseFloat(item.leavePermissionHours);

      projectMap.set(item.projectId, existing);
    });

    return Array.from(projectMap.values());
  };

  const getTeamChartData = () => {
    const teamMap = new Map<string, {
      name: string;
      totalHours: number;
      avgHoursPerDay: number;
      memberCount: number;
    }>();

    timeTrackingData.forEach(item => {
      const existing = teamMap.get(item.teamId) || {
        name: item.teamName,
        totalHours: 0,
        avgHoursPerDay: 0,
        memberCount: 0,
      };

      existing.totalHours += parseFloat(item.totalHours);
      existing.memberCount = Math.max(existing.memberCount, 1);

      teamMap.set(item.teamId, existing);
    });

    // Calculate average hours per day
    const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));

    teamMap.forEach(team => {
      team.avgHoursPerDay = team.totalHours / daysDiff;
    });

    return Array.from(teamMap.values());
  };

  const getTimeSeriesData = () => {
    const dateMap = new Map<string, {
      date: string;
      totalHours: number;
      ticketsHours: number;
      meetingHours: number;
      otherHours: number;
      leaveHours: number;
    }>();

    timeTrackingData.forEach(item => {
      const existing = dateMap.get(item.date) || {
        date: item.date,
        totalHours: 0,
        ticketsHours: 0,
        meetingHours: 0,
        otherHours: 0,
        leaveHours: 0,
      };

      existing.totalHours += parseFloat(item.totalHours);
      existing.ticketsHours += parseFloat(item.ticketsHours);
      existing.meetingHours += parseFloat(item.internalMeetingHours) + parseFloat(item.externalMeetingHours);
      existing.otherHours += parseFloat(item.otherActivityHours);
      existing.leaveHours += parseFloat(item.leavePermissionHours);

      dateMap.set(item.date, existing);
    });

    return Array.from(dateMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // New function for project-based stacked chart (similar to user's image)
  const getProjectStackedChartData = () => {
    const projectMap = new Map<string, {
      name: string;
      ticketsHours: number;
      internalMeetingHours: number;
      externalMeetingHours: number;
      otherActivityHours: number;
      leavePermissionHours: number;
      totalHours: number;
    }>();

    timeTrackingData.forEach(item => {
      const existing = projectMap.get(item.projectId) || {
        name: item.projectName,
        ticketsHours: 0,
        internalMeetingHours: 0,
        externalMeetingHours: 0,
        otherActivityHours: 0,
        leavePermissionHours: 0,
        totalHours: 0,
      };

      existing.ticketsHours += parseFloat(item.ticketsHours);
      existing.internalMeetingHours += parseFloat(item.internalMeetingHours);
      existing.externalMeetingHours += parseFloat(item.externalMeetingHours);
      existing.otherActivityHours += parseFloat(item.otherActivityHours);
      existing.leavePermissionHours += parseFloat(item.leavePermissionHours);
      existing.totalHours += parseFloat(item.totalHours);

      projectMap.set(item.projectId, existing);
    });

    return Array.from(projectMap.values()).sort((a, b) => b.totalHours - a.totalHours);
  };

  // New function for user-based chart data
  const getUserChartData = () => {
    const userMap = new Map<string, {
      name: string;
      totalHours: number;
      ticketsHours: number;
      internalMeetingHours: number;
      externalMeetingHours: number;
      otherActivityHours: number;
      leavePermissionHours: number;
      avgHoursPerDay: number;
      projectCount: number;
      teamCount: number;
    }>();

    timeTrackingData.forEach(item => {
      const existing = userMap.get(item.userId) || {
        name: item.userName,
        totalHours: 0,
        ticketsHours: 0,
        internalMeetingHours: 0,
        externalMeetingHours: 0,
        otherActivityHours: 0,
        leavePermissionHours: 0,
        avgHoursPerDay: 0,
        projectCount: 0,
        teamCount: 0,
      };

      existing.totalHours += parseFloat(item.totalHours);
      existing.ticketsHours += parseFloat(item.ticketsHours);
      existing.internalMeetingHours += parseFloat(item.internalMeetingHours);
      existing.externalMeetingHours += parseFloat(item.externalMeetingHours);
      existing.otherActivityHours += parseFloat(item.otherActivityHours);
      existing.leavePermissionHours += parseFloat(item.leavePermissionHours);

      // Count unique projects and teams
      if (!existing.projectCount) existing.projectCount = 0;
      if (!existing.teamCount) existing.teamCount = 0;

      userMap.set(item.userId, existing);
    });

    // Calculate average hours per day and count unique projects/teams
    const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));

    userMap.forEach(user => {
      user.avgHoursPerDay = user.totalHours / daysDiff;

      // Count unique projects and teams for this user
      const userProjects = new Set(timeTrackingData.filter(item => item.userId === user.name).map(item => item.projectId));
      const userTeams = new Set(timeTrackingData.filter(item => item.userId === user.name).map(item => item.teamId));
      user.projectCount = userProjects.size;
      user.teamCount = userTeams.size;
    });

    return Array.from(userMap.values()).sort((a, b) => b.totalHours - a.totalHours);
  };

  // New function for user stacked chart data
  const getUserStackedChartData = () => {
    const userMap = new Map<string, {
      name: string;
      teamName: string;
      ticketsHours: number;
      internalMeetingHours: number;
      externalMeetingHours: number;
      otherActivityHours: number;
      leavePermissionHours: number;
      totalHours: number;
    }>();

    timeTrackingData.forEach(item => {
      const existing = userMap.get(item.userId) || {
        name: item.userName,
        teamName: item.teamName,
        ticketsHours: 0,
        internalMeetingHours: 0,
        externalMeetingHours: 0,
        otherActivityHours: 0,
        leavePermissionHours: 0,
        totalHours: 0,
      };

      existing.ticketsHours += parseFloat(item.ticketsHours);
      existing.internalMeetingHours += parseFloat(item.internalMeetingHours);
      existing.externalMeetingHours += parseFloat(item.externalMeetingHours);
      existing.otherActivityHours += parseFloat(item.otherActivityHours);
      existing.leavePermissionHours += parseFloat(item.leavePermissionHours);
      existing.totalHours += parseFloat(item.totalHours);

      userMap.set(item.userId, existing);
    });

    return Array.from(userMap.values()).sort((a, b) => b.totalHours - a.totalHours);
  };

  const getProductivityMetrics = () => {
    if (timeTrackingData.length === 0) return { totalHours: 0, avgDailyHours: 0, totalProjects: 0, totalTeams: 0 };

    const totalHours = timeTrackingData.reduce((sum, item) => sum + parseFloat(item.totalHours), 0);
    const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    const avgDailyHours = totalHours / daysDiff;

    const uniqueProjects = new Set(timeTrackingData.map(item => item.projectId));
    const uniqueTeams = new Set(timeTrackingData.map(item => item.teamId));

    return {
      totalHours: totalHours.toFixed(1),
      avgDailyHours: avgDailyHours.toFixed(1),
      totalProjects: uniqueProjects.size,
      totalTeams: uniqueTeams.size,
    };
  };

  const projectChartData = getProjectChartData();
  const teamChartData = getTeamChartData();
  const timeSeriesData = getTimeSeriesData();
  const projectStackedData = getProjectStackedChartData();
  const userChartData = getUserChartData();
  const userStackedData = getUserStackedChartData();
  const metrics = getProductivityMetrics();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'];

  // Create team color mapping
  const getTeamColorMap = () => {
    const uniqueTeams = Array.from(new Set(userStackedData.map(user => user.teamName)));
    const teamColorMap = new Map<string, string>();

    uniqueTeams.forEach((team, index) => {
      teamColorMap.set(team, COLORS[index % COLORS.length]);
    });

    return teamColorMap;
  };

  const teamColorMap = getTeamColorMap();

  const handleHoursFilterChange = (hourType: string) => {
    setSelectedHours(prev => ({
      ...prev,
      [hourType]: !prev[hourType]
    }));
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into team productivity and project progress</p>
        </div>
        <Button onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Projects</option>
              {userCompleteInformation?.projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Filter</label>
            <select
              value={filterTimeBy}
              onChange={(e) => setFilterTimeBy(e.target.value as 'day' | 'fullTime')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="day">By Day</option>
              <option value="fullTime">Full Time</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="secondary"
              className="w-full"
              onClick={fetchTimeTrackingData}
              disabled={isLoading}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isLoading ? 'Loading...' : 'Apply Filters'}
            </Button>
          </div>
        </div>
      </div>

      {/* Hours Filter Dropdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Chart Hours Filter</h3>
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setShowHoursFilter(!showHoursFilter)}
              className="flex items-center space-x-2"
            >
              <span>Filter Hours</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showHoursFilter ? 'rotate-180' : ''}`} />
            </Button>

            {showHoursFilter && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 text-sm">Select Hours to Display:</h4>
                  {Object.entries(selectedHours).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => handleHoursFilterChange(key)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">
                        {key === 'ticketsHours' && 'Ticket Hours'}
                        {key === 'internalMeetingHours' && 'Internal Meeting Hours'}
                        {key === 'externalMeetingHours' && 'External Meeting Hours'}
                        {key === 'otherActivityHours' && 'Other Activity Hours'}
                        {key === 'leavePermissionHours' && 'Leave Permission Hours'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Hours',
            value: metrics.totalHours,
            icon: Clock,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            label: 'Avg Daily Hours',
            value: metrics.avgDailyHours,
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
          },
          {
            label: 'Active Projects',
            value: metrics.totalProjects,
            icon: Building2,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
          },
          {
            label: 'Active Teams',
            value: metrics.totalTeams,
            icon: Users,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
          },
        ].map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className={`p-3 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Performance Metrics */}
      {userChartData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Users</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userChartData.slice(0, 6).map((user, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">{user.name}</h4>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Total Hours:</span>
                    <span className="font-medium text-gray-900">{user.totalHours.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Daily Avg:</span>
                    <span className="font-medium text-gray-900">{user.avgHoursPerDay.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Projects:</span>
                    <span className="font-medium text-gray-900">{user.projectCount}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Teams:</span>
                    <span className="font-medium text-gray-900">{user.teamCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Performance Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Project Performance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={projectChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip fontSize={11} />
              <Legend fontSize={11} />
              {selectedHours.ticketsHours && (
                <Bar dataKey="ticketsHours" fill="#3B82F6" name="Ticket Hours" radius={[2, 2, 0, 0]} barSize={20} />
              )}
              {selectedHours.internalMeetingHours && (
                <Bar dataKey="meetingHours" fill="#10B981" name="Meeting Hours" radius={[2, 2, 0, 0]} barSize={20} />
              )}
              {selectedHours.otherActivityHours && (
                <Bar dataKey="otherHours" fill="#F59E0B" name="Other Hours" radius={[2, 2, 0, 0]} barSize={20} />
              )}
              {selectedHours.leavePermissionHours && (
                <Bar dataKey="leaveHours" fill="#EF4444" name="Leave Hours" radius={[2, 2, 0, 0]} barSize={20} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Team Performance Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Team Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip fontSize={11} />
              <Legend fontSize={11} />
              <Bar dataKey="totalHours" fill="#8B5CF6" name="Total Hours" radius={[2, 2, 0, 0]} barSize={20} />
              <Bar dataKey="avgHoursPerDay" fill="#06B6D4" name="Avg Daily Hours" radius={[2, 2, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* NEW: Project Stacked Chart (similar to user's image) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Project Hours Distribution (Stacked)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectStackedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip fontSize={11} />
              <Legend fontSize={11} />
              {selectedHours.ticketsHours && (
                <Bar dataKey="ticketsHours" stackId="a" fill="#3B82F6" name="Ticket Hours" barSize={20} />
              )}
              {selectedHours.internalMeetingHours && (
                <Bar dataKey="internalMeetingHours" stackId="a" fill="#10B981" name="Internal Meetings" barSize={20} />
              )}
              {selectedHours.externalMeetingHours && (
                <Bar dataKey="externalMeetingHours" stackId="a" fill="#06B6D4" name="External Meetings" barSize={20} />
              )}
              {selectedHours.otherActivityHours && (
                <Bar dataKey="otherActivityHours" stackId="a" fill="#F59E0B" name="Other Activities" barSize={20} />
              )}
              {selectedHours.leavePermissionHours && (
                <Bar dataKey="leavePermissionHours" stackId="a" fill="#EF4444" name="Leave Hours" barSize={20} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* NEW: User Performance Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Performance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={userChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip fontSize={11} />
              <Legend fontSize={11} />
              <Bar dataKey="totalHours" fill="#8B5CF6" name="Total Hours" radius={[2, 2, 0, 0]} barSize={20} />
              <Line type="monotone" dataKey="avgHoursPerDay" stroke="#EF4444" strokeWidth={2} name="Avg Daily Hours" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Time Series Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Time Tracking Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip fontSize={11} />
              <Legend fontSize={11} />
              {selectedHours.ticketsHours && (
                <Area type="monotone" dataKey="ticketsHours" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              )}
              {selectedHours.meetingHours && (
                <Area type="monotone" dataKey="meetingHours" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              )}
              {selectedHours.otherHours && (
                <Area type="monotone" dataKey="otherHours" stackId="3" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Project Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Time Distribution by Project</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectChartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="totalHours"
                label={({ name, totalHours }) => `${name} (${totalHours.toFixed(1)}h)`}
                fontSize={11}
              >
                {projectChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} hours`, 'Total Hours']} fontSize={11} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NEW: User Hours Distribution (Stacked) - Full Width */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Hours Distribution (Stacked)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={userStackedData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              fontSize={11}
            />
            <YAxis fontSize={11} />
            <Tooltip fontSize={11} />
            <Legend fontSize={11} />
            {selectedHours.ticketsHours && (
              <Bar dataKey="ticketsHours" stackId="a" name="Ticket Hours" barSize={20}>
                {userStackedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={teamColorMap.get(entry.teamName) || COLORS[0]} />
                ))}
              </Bar>
            )}
            {selectedHours.internalMeetingHours && (
              <Bar dataKey="internalMeetingHours" stackId="a" name="Internal Meetings" barSize={20}>
                {userStackedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={teamColorMap.get(entry.teamName) || COLORS[0]} />
                ))}
              </Bar>
            )}
            {selectedHours.externalMeetingHours && (
              <Bar dataKey="externalMeetingHours" stackId="a" name="External Meetings" barSize={20}>
                {userStackedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={teamColorMap.get(entry.teamName) || COLORS[0]} />
                ))}
              </Bar>
            )}
            {selectedHours.otherActivityHours && (
              <Bar dataKey="otherActivityHours" stackId="a" name="Other Activities" barSize={20}>
                {userStackedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={teamColorMap.get(entry.teamName) || COLORS[0]} />
                ))}
              </Bar>
            )}
            {selectedHours.leavePermissionHours && (
              <Bar dataKey="leavePermissionHours" stackId="a" name="Leave Hours" barSize={20}>
                {userStackedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={teamColorMap.get(entry.teamName) || COLORS[0]} />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>

        {/* Team Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Team Color Legend:</h4>
          <div className="flex flex-wrap gap-4">
            {Array.from(teamColorMap.keys()).map((teamName) => (
              <div key={teamName} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: teamColorMap.get(teamName) }}
                ></div>
                <span className="text-sm text-gray-600">{teamName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Detailed Time Tracking Data</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tickets</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meetings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Other</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              ) : timeTrackingData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No data available for the selected filters
                  </td>
                </tr>
              ) : (
                timeTrackingData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.projectName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.teamName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(item.ticketsHours).toFixed(2)}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(parseFloat(item.internalMeetingHours) + parseFloat(item.externalMeetingHours)).toFixed(2)}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(item.otherActivityHours).toFixed(2)}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(item.leavePermissionHours).toFixed(2)}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {parseFloat(item.totalHours).toFixed(2)}h
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;