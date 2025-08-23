import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGetDailyUpdateByIdQuery } from '../../features/dailyUpdates/dailyUpdatesApi';
import DailyUpdateForm from './DailyUpdateForm';
import Button from '../../components/Common/Button';

const DailyUpdateEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: dailyUpdate, isLoading, error } = useGetDailyUpdateByIdQuery(id!);

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

  const handleSuccess = () => {
    navigate(`/daily-updates/${dailyUpdate.id}/view`);
  };

  const handleClose = () => {
    navigate(`/daily-updates/${dailyUpdate.id}/view`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="secondary"
          onClick={() => navigate(`/daily-updates/${dailyUpdate.id}/view`)}
          icon={ArrowLeft}
        >
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Daily Update</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <DailyUpdateForm
          dailyUpdate={dailyUpdate}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default DailyUpdateEditPage;
