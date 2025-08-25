export interface DailyUpdate {
  id: string;
  userId: string;
  projectId: string;
  teamId: string | null;
  date: string;
  tickets: string | null;
  ticketsHours: string;
  internalMeetingHours: string;
  externalMeetingHours: string;
  otherActivities: string | null;
  otherActivityHours: string;
  leavePermissionHours: string;
  totalHours: string;
  notes: string | null;
  status: string;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  teamName: string;
  teamDescription: string | null;
}

export interface CreateDailyUpdateDto {
  userId: string;
  projectId: string;
  teamId: string | null;
  date: string;
  tickets: string | null;
  ticketsHours: string;
  internalMeetingHours: string;
  externalMeetingHours: string;
  otherActivities: string | null;
  otherActivityHours: string;
  leavePermissionHours: string;
  notes: string | null;
}

export interface UpdateDailyUpdateDto extends Partial<CreateDailyUpdateDto> {
  status?: string;
}

export interface DailyUpdateSearchParams {
  userId?: string;
  projectId?: string;
  teamId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  tickets?: string;
  minTotalHours?: string;
  page?: number;
  limit?: number;
}

export interface DailyUpdateSearchResponse {
  data: DailyUpdate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
