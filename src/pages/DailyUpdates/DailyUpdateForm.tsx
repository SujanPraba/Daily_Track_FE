import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, Building2, Ticket, Loader2, X } from 'lucide-react';
import { useCreateDailyUpdateMutation, useUpdateDailyUpdateMutation } from '../../features/dailyUpdates/dailyUpdatesApi';
import { CreateDailyUpdateDto, UpdateDailyUpdateDto, DailyUpdate } from '../../types/dailyUpdate';
import { useUserCompleteInformation } from '../../features/users/useUserCompleteInformation';
import { useAppSelector } from '../../app/store';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import toast from 'react-hot-toast';

interface DailyUpdateFormProps {
  dailyUpdate?: DailyUpdate;
  onClose: () => void;
  onSuccess: () => void;
}

const DailyUpdateForm: React.FC<DailyUpdateFormProps> = ({
  dailyUpdate,
  onClose,
  onSuccess,
}) => {
  const { userCompleteInformation } = useUserCompleteInformation();
  const { user } = useAppSelector((state) => state.auth);

  const [createDailyUpdate] = useCreateDailyUpdateMutation();
  const [updateDailyUpdate] = useUpdateDailyUpdateMutation();

  const [formData, setFormData] = useState<CreateDailyUpdateDto>({
    userId: user?.id || '',
    projectId: '',
    teamId: '', // Keep for compatibility but won't be used in UI
    date: new Date().toISOString(),
    tickets: '',
    ticketsHours: '0.00',
    internalMeetingHours: '0.00',
    externalMeetingHours: '0.00',
    otherActivities: '',
    otherActivityHours: '0.00',
    leavePermissionHours: '0.00',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'working' | 'leave'>('working');

  // Dropdown states
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');

  useEffect(() => {
    if (dailyUpdate) {
      setFormData({
        userId: dailyUpdate.userId,
        projectId: dailyUpdate.projectId,
        teamId: dailyUpdate.teamId,
        date: dailyUpdate.date,
        tickets: dailyUpdate.tickets,
        ticketsHours: dailyUpdate.ticketsHours || '0.00',
        internalMeetingHours: dailyUpdate.internalMeetingHours,
        externalMeetingHours: dailyUpdate.externalMeetingHours,
        otherActivities: dailyUpdate.otherActivities,
        otherActivityHours: dailyUpdate.otherActivityHours,
        leavePermissionHours: dailyUpdate.leavePermissionHours || '0.00',
        notes: dailyUpdate.notes,
      });
    }
  }, [dailyUpdate]);

  // Handle click outside dropdown
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

        if (status === 'working') {
      // When working, require tickets and validate working hours
      if (!formData.tickets?.trim()) {
        newErrors.tickets = 'Tickets are required when working';
      }
      if (parseFloat(formData.ticketsHours) < 0) {
        newErrors.tickets = 'Ticket hours must be a positive number';
      }
    } else if (status === 'leave') {
      // When on leave, require leave permission hours
      if (parseFloat(formData.leavePermissionHours) <= 0) {
        newErrors.leavePermissionHours = 'Leave permission hours are required when on leave';
      }
    }

    // Validate hours are numeric and positive
    const hoursFields = ['internalMeetingHours', 'externalMeetingHours', 'otherActivityHours'];
    hoursFields.forEach(field => {
      const value = parseFloat(formData[field as keyof CreateDailyUpdateDto] as string);
      if (isNaN(value) || value < 0) {
        newErrors[field] = 'Hours must be a positive number';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (dailyUpdate) {
        // Update existing daily update
        await updateDailyUpdate({
          id: dailyUpdate.id,
          ...formData,
        }).unwrap();
        toast.success('Daily update updated successfully');
      } else {
        // Create new daily update
        await createDailyUpdate(formData).unwrap();
        toast.success('Daily update created successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(dailyUpdate ? 'Failed to update daily update' : 'Failed to create daily update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateDailyUpdateDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };



  const getProjectName = (projectId: string) => {
    const project = userCompleteInformation?.projects?.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  // Filter projects based on search
  const filteredProjects = userCompleteInformation?.projects?.filter(project =>
    project.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    project.code?.toLowerCase().includes(projectSearch.toLowerCase())
  ) || [];

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {dailyUpdate ? 'Edit Daily Update' : 'Create Daily Update'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Project Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="inline h-4 w-4 mr-1" />
            Project *
          </label>
          <div className="project-dropdown">
            <div className="relative">
              {/* Selected Project Display */}
              <div
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                className={`flex items-center justify-between w-full px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                  errors.projectId
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 hover:border-orange-400 focus:border-orange-500'
                } ${projectDropdownOpen ? 'border-orange-500 ring-2 ring-orange-200' : ''}`}
              >
                <span className={formData.projectId ? 'text-gray-900' : 'text-gray-500'}>
                  {formData.projectId ? getProjectName(formData.projectId) : 'Select a project'}
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
                      filteredProjects.map((project) => (
                        <div
                          key={project.id}
                          onClick={() => {
                            handleInputChange('projectId', project.id);
                            setProjectDropdownOpen(false);
                            setProjectSearch('');
                          }}
                          className={`px-3 py-2 cursor-pointer hover:bg-orange-50 transition-colors ${
                            formData.projectId === project.id ? 'bg-orange-100 text-orange-900' : 'text-gray-900'
                          }`}
                        >
                          <div className="font-medium text-sm">{project.name}</div>
                          {project.code && <div className="text-xs text-gray-500">{project.code}</div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {errors.projectId && (
            <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
          )}
        </div>

        {/* Status Selection */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <div className="w-4 h-4 mr-2 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            Status
          </h3>

          <div className="flex space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="status"
                value="working"
                checked={status === 'working'}
                onChange={(e) => setStatus(e.target.value as 'working' | 'leave')}
                className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-900">Working</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="status"
                value="leave"
                checked={status === 'leave'}
                onChange={(e) => setStatus(e.target.value as 'working' | 'leave')}
                className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-900">Leave</span>
            </label>
          </div>
        </div>

        {/* Date and Tickets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.date.split('T')[0]}
                onChange={(e) => handleInputChange('date', new Date(e.target.value).toISOString())}
                className={`block w-full pl-10 pr-3 py-2 rounded-lg border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-400 transition-colors ${
                  errors.date ? 'border-red-500' : ''
                }`}
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Tickets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Ticket className="inline h-4 w-4 mr-1" />
              Tickets *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ticket Names */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Ticket Names</label>
                                    <input
                      type="text"
                      value={formData.tickets || ''}
                      onChange={(e) => handleInputChange('tickets', e.target.value)}
                      placeholder="TICKET-001, TICKET-002, TICKET-003"
                      disabled={status === 'leave'}
                      className={`block w-full rounded-lg shadow-sm transition-colors ${
                        status === 'leave'
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : errors.tickets
                            ? 'border-red-500 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-400'
                            : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-400'
                      }`}
                    />
              </div>

              {/* Ticket Hours */}
                                  <div>
                      <label className="block text-xs text-gray-600 mb-1">Ticket Hours</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={formData.ticketsHours}
                          onChange={(e) => handleInputChange('ticketsHours', e.target.value)}
                          placeholder="0.00"
                          disabled={status === 'leave'}
                          className={`block w-full pl-10 pr-3 py-2 rounded-lg shadow-sm transition-colors ${
                            status === 'leave'
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-400'
                          }`}
                        />
                        <Clock className={`absolute left-3 top-2.5 h-4 w-4 ${status === 'leave' ? 'text-gray-400' : 'text-gray-400'}`} />
                      </div>
                    </div>
            </div>
            {errors.tickets && (
              <p className="mt-1 text-sm text-red-600">{errors.tickets}</p>
            )}
          </div>
        </div>

        {/* Hours Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Time Tracking
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Internal Meeting Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Meeting Hours
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={formData.internalMeetingHours}
                  onChange={(e) => handleInputChange('internalMeetingHours', e.target.value)}
                  placeholder="0.00"
                  disabled={status === 'leave'}
                  className={`block w-full pl-10 pr-3 py-2 rounded-lg shadow-sm transition-colors ${
                    status === 'leave'
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : errors.internalMeetingHours
                        ? 'border-red-500 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-400'
                        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-400'
                  }`}
                />
                <Clock className={`absolute left-3 top-2.5 h-4 w-4 ${status === 'leave' ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
              {errors.internalMeetingHours && (
                <p className="mt-1 text-sm text-red-600">{errors.internalMeetingHours}</p>
              )}
            </div>

            {/* External Meeting Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                External Meeting Hours
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={formData.externalMeetingHours}
                  onChange={(e) => handleInputChange('externalMeetingHours', e.target.value)}
                  placeholder="0.00"
                  disabled={status === 'leave'}
                  className={`block w-full pl-10 pr-3 py-2 rounded-lg shadow-sm transition-colors ${
                    status === 'leave'
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : errors.externalMeetingHours
                        ? 'border-red-500 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-400'
                        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-400'
                  }`}
                />
                <Clock className={`absolute left-3 top-2.5 h-4 w-4 ${status === 'leave' ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
              {errors.externalMeetingHours && (
                <p className="mt-1 text-sm text-red-600">{errors.externalMeetingHours}</p>
              )}
            </div>

            {/* Other Activity Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Activity Hours
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={formData.otherActivityHours}
                  onChange={(e) => handleInputChange('otherActivityHours', e.target.value)}
                  placeholder="0.00"
                  disabled={status === 'leave'}
                  className={`block w-full pl-10 pr-3 py-2 rounded-lg shadow-sm transition-colors ${
                    status === 'leave'
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : errors.otherActivityHours
                        ? 'border-red-500 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-400'
                        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-400'
                  }`}
                />
                <Clock className={`absolute left-3 top-2.5 h-4 w-4 ${status === 'leave' ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
              {errors.otherActivityHours && (
                <p className="mt-1 text-sm text-red-600">{errors.otherActivityHours}</p>
              )}
            </div>

            {/* Leave Permission Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Permission Hours
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={formData.leavePermissionHours}
                  onChange={(e) => handleInputChange('leavePermissionHours', e.target.value)}
                  placeholder="0.00"
                  disabled={status === 'working'}
                  className={`block w-full pl-10 pr-3 py-2 rounded-lg shadow-sm transition-colors ${
                    status === 'working'
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : errors.leavePermissionHours
                        ? 'border-red-500 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-400'
                        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-400'
                  }`}
                />
                <Clock className={`absolute left-3 top-2.5 h-4 w-4 ${status === 'working' ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
              {errors.leavePermissionHours && (
                <p className="mt-1 text-sm text-red-600">{errors.leavePermissionHours}</p>
              )}
            </div>
          </div>

          {/* Total Hours Display */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-2">
                          {/* Ticket Hours Summary */}
            {parseFloat(formData.ticketsHours) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Ticket Hours:</span>
                <span className="font-medium text-gray-700">
                  {parseFloat(formData.ticketsHours).toFixed(2)}h
                </span>
              </div>
            )}

              {/* Meeting Hours Summary */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Meeting Hours:</span>
                <span className="font-medium text-gray-700">
                  {(parseFloat(formData.internalMeetingHours) + parseFloat(formData.externalMeetingHours)).toFixed(2)}h
                </span>
              </div>

              {/* Other Activity Hours Summary */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Other Activity Hours:</span>
                <span className="font-medium text-gray-700">
                  {parseFloat(formData.otherActivityHours).toFixed(2)}h
                </span>
              </div>

              {/* Leave Permission Hours Summary */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Leave Permission Hours:</span>
                <span className="font-medium text-gray-700">
                  {parseFloat(formData.leavePermissionHours).toFixed(2)}h
                </span>
              </div>

              {/* Total Hours */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Total Hours:</span>
                <span className="text-lg font-semibold text-orange-600">
                  {(
                    parseFloat(formData.ticketsHours || '0') +
                    parseFloat(formData.internalMeetingHours) +
                    parseFloat(formData.externalMeetingHours) +
                    parseFloat(formData.otherActivityHours) +
                    parseFloat(formData.leavePermissionHours || '0')
                  ).toFixed(2)}h
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Other Activities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Other Activities
          </label>
          <textarea
            value={formData.otherActivities || ''}
            onChange={(e) => handleInputChange('otherActivities', e.target.value)}
            placeholder="Code review, documentation, etc."
            rows={3}
            disabled={status === 'leave'}
            className={`block w-full rounded-lg shadow-sm transition-colors ${
              status === 'leave'
                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-400'
            }`}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Additional Notes
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any additional notes about the day..."
            rows={4}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-400 transition-colors"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {dailyUpdate ? 'Update Daily Update' : 'Create Daily Update'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DailyUpdateForm;
