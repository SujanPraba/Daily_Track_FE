import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, Building2, Ticket, Loader2, ChevronLeft, Plus, Save, CheckCircle } from 'lucide-react';
import { useCreateDailyUpdateMutation } from '../../features/dailyUpdates/dailyUpdatesApi';
import { CreateDailyUpdateDto } from '../../types/dailyUpdate';
import { useUserCompleteInformation } from '../../features/users/useUserCompleteInformation';
import { useAppSelector } from '../../app/store';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Common/Button';
import toast from 'react-hot-toast';

const DailyUpdateCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { userCompleteInformation } = useUserCompleteInformation();
  const { user } = useAppSelector((state) => state.auth);

  const [createDailyUpdate] = useCreateDailyUpdateMutation();

  const [formData, setFormData] = useState<CreateDailyUpdateDto>({
    userId: user?.id || '',
    projectId: '',
    teamId: '',
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [status, setStatus] = useState<'working' | 'leave'>('working');

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

    // Validate all hours fields are numeric and positive
    const hoursFields = ['ticketsHours', 'internalMeetingHours', 'externalMeetingHours', 'otherActivityHours', 'leavePermissionHours'];
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
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createDailyUpdate(formData).unwrap();
      setIsSuccess(true);
      toast.success('Daily update created successfully');
      setTimeout(() => navigate('/daily-updates'), 1500);
    } catch (error) {
      toast.error('Failed to create daily update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateDailyUpdateDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getProjectName = (projectId: string) => {
    const project = userCompleteInformation?.projects?.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const filteredProjects = userCompleteInformation?.projects?.filter(project =>
    project.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    project.code?.toLowerCase().includes(projectSearch.toLowerCase())
  ) || [];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Success!</h2>
          <p className="text-gray-600 mb-6">Your daily update has been created successfully.</p>
          <div className="animate-pulse text-[12px] text-gray-500">Redirecting to daily updates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/daily-updates')}
                icon={ChevronLeft}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Daily Updates
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Create Daily Update</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-orange-500" />
              <span className="text-[12px] font-medium text-gray-700">New Entry</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Daily Update Form</h2>
                <p className="text-[12px] text-gray-600">Track your daily work activities and time</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Project Selection */}
            <div className="bg-gray-50 rounded-lg p-6">
              <label className="block text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Project Selection
              </label>
              <div className="project-dropdown">
                <div className="relative">
                  <div
                    onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                    className={`flex items-center justify-between w-full px-4 py-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      errors.projectId
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300 hover:border-blue-400 focus:border-blue-500'
                    } ${projectDropdownOpen ? 'border-blue-500 ring-4 ring-blue-100' : ''}`}
                  >
                    <span className={formData.projectId ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                      {formData.projectId ? getProjectName(formData.projectId) : 'Select a project to continue'}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${projectDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {projectDropdownOpen && (
                    <div className="absolute z-[9999] w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-64 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="relative">
                          <input
                            type="text"
                            value={projectSearch}
                            onChange={(e) => setProjectSearch(e.target.value)}
                            placeholder="Search projects by name or code..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-[12px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <svg
                            className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto">
                        {filteredProjects.length === 0 ? (
                          <div className="px-4 py-6 text-center text-gray-500 text-[12px]">
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
                              className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors duration-150 ${
                                formData.projectId === project.id ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500' : 'text-gray-900'
                              }`}
                            >
                              <div className="font-medium text-[12px]">{project.name}</div>
                              {project.code && <div className="text-xs text-gray-500 mt-1">{project.code}</div>}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {errors.projectId && (
                <p className="mt-2 text-[12px] text-red-600 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {errors.projectId}
                </p>
              )}
            </div>

            {/* Status Selection */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-5 h-5 mr-2 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                Status Selection
              </h3>

              <div className="flex space-x-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="working"
                    checked={status === 'working'}
                    onChange={(e) => setStatus(e.target.value as 'working' | 'leave')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-[12px] font-medium text-gray-900">Working</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="leave"
                    checked={status === 'leave'}
                    onChange={(e) => setStatus(e.target.value as 'working' | 'leave')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-[12px] font-medium text-gray-900">Leave</span>
                </label>
              </div>

              <div className="mt-3 text-sm text-gray-600">
                {status === 'working' ? (
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Working mode: Fill in your work activities, tickets, and meeting hours
                  </span>
                ) : (
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Leave mode: Only leave permission hours are required
                  </span>
                )}
              </div>
            </div>

            {/* Date and Tickets Section */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Date & Ticket Information
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-3">
                    Work Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.date.split('T')[0]}
                      onChange={(e) => handleInputChange('date', new Date(e.target.value).toISOString())}
                      className={`block w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400 transition-all duration-200 ${
                        errors.date ? 'border-red-500' : ''
                      }`}
                    />
                    <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-purple-500" />
                  </div>
                  {errors.date && (
                    <p className="mt-2 text-[12px] text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.date}
                    </p>
                  )}
                </div>

                {/* Tickets */}
                <div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Ticket Names</label>
                      <input
                        type="text"
                        value={formData.tickets || ''}
                        onChange={(e) => handleInputChange('tickets', e.target.value)}
                        placeholder="TICKET-001, TICKET-002, TICKET-003"
                        disabled={status === 'leave'}
                        className={`block w-full px-4 py-3 rounded-lg border-2 shadow-sm transition-all duration-200 ${
                          status === 'leave'
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : errors.tickets
                              ? 'border-red-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400'
                              : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Time Spent on Tickets</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={formData.ticketsHours}
                          onChange={(e) => handleInputChange('ticketsHours', e.target.value)}
                          placeholder="0.00"
                          disabled={status === 'leave'}
                          className={`block w-full pl-12 pr-4 py-3 rounded-lg border-2 shadow-sm transition-all duration-200 ${
                            status === 'leave'
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400'
                          }`}
                        />
                        <Clock className={`absolute left-4 top-3.5 h-5 w-5 ${status === 'leave' ? 'text-gray-400' : 'text-purple-500'}`} />
                      </div>
                    </div>
                  </div>
                  {errors.tickets && (
                    <p className="mt-2 text-[12px] text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.tickets}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Hours Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-emerald-600" />
                Time Tracking
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Internal Meeting Hours */}
                <div className="bg-white rounded-lg p-4 border border-emerald-100">
                  <label className="block text-[12px] font-semibold text-gray-700 mb-3">
                    Internal Meetings
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
                      className={`block w-full pl-12 pr-4 py-3 rounded-lg border-2 shadow-sm transition-all duration-200 ${
                        status === 'leave'
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : errors.internalMeetingHours
                            ? 'border-red-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400'
                            : 'border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400'
                      }`}
                    />
                    <Clock className={`absolute left-4 top-3.5 h-5 w-5 ${status === 'leave' ? 'text-gray-400' : 'text-emerald-500'}`} />
                  </div>
                  {errors.internalMeetingHours && (
                    <p className="mt-2 text-[12px] text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.internalMeetingHours}
                    </p>
                  )}
                </div>

                {/* External Meeting Hours */}
                <div className="bg-white rounded-lg p-4 border border-emerald-100">
                  <label className="block text-[12px] font-semibold text-gray-700 mb-3">
                    External Meetings
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
                      className={`block w-full pl-12 pr-4 py-3 rounded-lg border-2 shadow-sm transition-all duration-200 ${
                        status === 'leave'
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : errors.externalMeetingHours
                            ? 'border-red-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400'
                            : 'border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400'
                      }`}
                    />
                    <Clock className={`absolute left-4 top-3.5 h-5 w-5 ${status === 'leave' ? 'text-gray-400' : 'text-emerald-500'}`} />
                  </div>
                  {errors.externalMeetingHours && (
                    <p className="mt-2 text-[12px] text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.externalMeetingHours}
                    </p>
                  )}
                </div>

                {/* Other Activity Hours */}
                <div className="bg-white rounded-lg p-4 border border-emerald-100">
                  <label className="block text-[12px] font-semibold text-gray-700 mb-3">
                    Other Activities
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
                      className={`block w-full pl-12 pr-4 py-3 rounded-lg border-2 shadow-sm transition-all duration-200 ${
                        status === 'leave'
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : errors.otherActivityHours
                            ? 'border-red-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400'
                            : 'border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400'
                      }`}
                    />
                    <Clock className={`absolute left-4 top-3.5 h-5 w-4 ${status === 'leave' ? 'text-gray-400' : 'text-emerald-500'}`} />
                  </div>
                  {errors.otherActivityHours && (
                    <p className="mt-2 text-[12px] text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.otherActivityHours}
                    </p>
                  )}
                </div>

                {/* Leave Permission Hours */}
                <div className="bg-white rounded-lg p-4 border border-emerald-100">
                  <label className="block text-[12px] font-semibold text-gray-700 mb-3">
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
                      className={`block w-full pl-12 pr-4 py-3 rounded-lg border-2 shadow-sm transition-all duration-200 ${
                        status === 'working'
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : errors.leavePermissionHours
                            ? 'border-red-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400'
                            : 'border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400'
                      }`}
                    />
                    <Clock className={`absolute left-4 top-3.5 h-5 w-5 ${status === 'working' ? 'text-gray-400' : 'text-emerald-500'}`} />
                  </div>
                  {errors.leavePermissionHours && (
                    <p className="mt-2 text-[12px] text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.leavePermissionHours}
                    </p>
                  )}
                </div>
              </div>

              {/* Total Hours Display */}
              <div className="mt-6 pt-6 border-t border-emerald-200">
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="space-y-3">
                    {parseFloat(formData.ticketsHours) > 0 && (
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-gray-600 font-medium">Ticket Hours:</span>
                        <span className="font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                          {parseFloat(formData.ticketsHours).toFixed(2)}h
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-gray-600 font-medium">Meeting Hours:</span>
                      <span className="font-semibold text-gray-700 bg-emerald-100 px-3 py-1 rounded-full">
                        {(parseFloat(formData.internalMeetingHours) + parseFloat(formData.externalMeetingHours)).toFixed(2)}h
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-gray-600 font-medium">Other Activity Hours:</span>
                      <span className="font-semibold text-gray-700 bg-emerald-100 px-3 py-1 rounded-full">
                        {parseFloat(formData.otherActivityHours).toFixed(2)}h
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-gray-600 font-medium">Leave Permission Hours:</span>
                      <span className="font-semibold text-gray-700 bg-emerald-100 px-3 py-1 rounded-full">
                        {parseFloat(formData.leavePermissionHours).toFixed(2)}h
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-emerald-200">
                      <span className="text-base font-semibold text-gray-700">Total Hours:</span>
                      <span className="text-xl font-bold text-emerald-600 bg-emerald-100 px-4 py-2 rounded-lg">
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
            </div>

            {/* Other Activities */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6">
              <label className="block text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-amber-600" />
                Additional Activities & Notes
              </label>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-2">
                    Other Activities
                  </label>
                  <textarea
                    value={formData.otherActivities || ''}
                    onChange={(e) => handleInputChange('otherActivities', e.target.value)}
                    placeholder="Code review, documentation, research, training, etc."
                    rows={3}
                    disabled={status === 'leave'}
                    className={`block w-full px-4 py-3 rounded-lg border-2 shadow-sm transition-all duration-200 resize-none ${
                      status === 'leave'
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-400'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional notes about the day, challenges faced, achievements, or next steps..."
                    rows={4}
                    className="block w-full px-4 py-3 rounded-lg border-2 border-gray-300 shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-400 transition-all duration-200 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/daily-updates')}
                disabled={isSubmitting}
                className="px-6 py-3"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="px-8 py-3 text-lg"
                icon={isSubmitting ? Loader2 : Save}
              >
                {isSubmitting ? 'Creating...' : 'Create Daily Update'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DailyUpdateCreatePage;
