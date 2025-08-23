import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, FileText, Users, Building2, Ticket, Edit2, Trash2 } from 'lucide-react';
import { useGetDailyUpdateByIdQuery, useDeleteDailyUpdateMutation } from '../../features/dailyUpdates/dailyUpdatesApi';
import { useUserCompleteInformation } from '../../features/users/useUserCompleteInformation';
import Button from '../../components/Common/Button';
import toast from 'react-hot-toast';

const DailyUpdateViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userCompleteInformation } = useUserCompleteInformation();
  
  const { data: dailyUpdate, isLoading, error } = useGetDailyUpdateByIdQuery(id!);
  const [deleteDailyUpdate] = useDeleteDailyUpdateMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading daily update...</p>
        </div>
      </div>
    );
  }

  if (error || !dailyUpdate) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error: Daily update not found</div>
        <Button onClick={() => navigate('/daily-updates')} variant="primary">
          Back to Daily Updates
        </Button>
      </div>
    );
  }

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

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this daily update?')) {
      try {
        await deleteDailyUpdate(dailyUpdate.id).unwrap();
        toast.success('Daily update deleted successfully');
        navigate('/daily-updates');
      } catch (error) {
        toast.error('Failed to delete daily update');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/daily-updates')}
            icon={ArrowLeft}
          >
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Daily Update Details</h1>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/daily-updates/${dailyUpdate.id}/edit`)}
            icon={Edit2}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            icon={Trash2}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex justify-center">
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(dailyUpdate.status || 'DRAFT')}`}>
          {dailyUpdate.status || 'DRAFT'}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Project & Team Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-blue-600" />
              Project & Team
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Project</label>
                <p className="text-lg font-semibold text-gray-900">{getProjectName(dailyUpdate.projectId)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Team</label>
                <p className="text-lg font-semibold text-gray-900">{getTeamName(dailyUpdate.teamId)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                <p className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  {new Date(dailyUpdate.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-600" />
              Time Tracking
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Internal Meeting Hours</span>
                <span className="font-semibold text-gray-900">{dailyUpdate.internalMeetingHours}h</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">External Meeting Hours</span>
                <span className="font-semibold text-gray-900">{dailyUpdate.externalMeetingHours}h</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Other Activity Hours</span>
                <span className="font-semibold text-gray-900">{dailyUpdate.otherActivityHours}h</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Hours</span>
                <span className="font-bold text-orange-600">
                  {(parseFloat(dailyUpdate.internalMeetingHours) + 
                    parseFloat(dailyUpdate.externalMeetingHours) + 
                    parseFloat(dailyUpdate.otherActivityHours)).toFixed(2)}h
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Tickets */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Ticket className="h-5 w-5 mr-2 text-purple-600" />
              Tickets
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 font-medium">{dailyUpdate.tickets || 'No tickets specified'}</p>
            </div>
          </div>

          {/* Other Activities */}
          {dailyUpdate.otherActivities && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                Other Activities
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900">{dailyUpdate.otherActivities}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {dailyUpdate.notes && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                Additional Notes
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900">{dailyUpdate.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Created:</span> {new Date(dailyUpdate.createdAt).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span> {new Date(dailyUpdate.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyUpdateViewPage;
