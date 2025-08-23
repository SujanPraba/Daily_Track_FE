export interface DailyUpdate {
  id: string;
  userId: string;
  projectId: string;
  teamId: string;
  date: string;
  tickets: string;
  internalMeetingHours: string;
  externalMeetingHours: string;
  otherActivities: string;
  otherActivityHours: string;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  teamName: string;
}

export interface CreateDailyUpdateDto {
  userId: string;
  projectId: string;
  teamId: string;
  date: string;
  tickets: string;
  internalMeetingHours: string;
  externalMeetingHours: string;
  otherActivities: string;
  otherActivityHours: string;
  notes: string;
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
