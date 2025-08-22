import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetDailyUpdatesQuery } from '../../features/dailyUpdates/dailyUpdatesApi';
import { useAppSelector } from '../../app/store';
import { Plus, Calendar, Clock, Users, Filter } from 'lucide-react';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { format, parseISO } from 'date-fns';

const DailyUpdatesPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const { data: updates, isLoading } = useGetDailyUpdatesQuery({
    page,
    limit: 10,
    userId: user?.role.name.toLowerCase() === 'employee' ? user.id : undefined,
    date: dateFilter,
    projectId: projectFilter,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Updates</h1>
          <p className="text-gray-600 mt-1">Track daily work activities and progress</p>
        </div>
        <Link to="/daily-updates/create">
          <Button className="mt-4 sm:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Add Update
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">5 updates</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">38.5</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Meetings</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="date"
            label="Filter by Date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Project
            </label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Projects</option>
              <option value="1">Project Alpha</option>
              <option value="2">Project Beta</option>
              <option value="3">Project Gamma</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Updates Timeline */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Updates</h3>
        </div>
        <div className="p-6">
          {updates?.data.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No updates found</h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first daily update
              </p>
              <Link to="/daily-updates/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Update
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {updates?.data.map((update) => (
                <div key={update.id} className="border-l-4 border-blue-500 pl-6 pb-6 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {format(parseISO(update.date), 'EEEE, MMMM d, yyyy')}
                        </h4>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {update.totalHours} hours
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{update.workLog}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Tickets Handled</p>
                          <p className="text-gray-600">{update.ticketsHandled.join(', ')}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Meetings</p>
                          <p className="text-gray-600">
                            Internal: {update.internalMeetings} • External: {update.externalMeetings}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Other Activities</p>
                          <p className="text-gray-600">{update.otherActivities || 'None'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyUpdatesPage;