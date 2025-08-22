import { User } from './auth';

export interface Team {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  leadId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamWithDetails extends Team {
  project?: {
    id: string;
    name: string;
    code: string;
  };
  lead?: User;
  members?: User[];
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  projectId: string;
  leadId?: string;
  memberIds?: string[];
}

export interface UpdateTeamDto extends Partial<CreateTeamDto> {
  isActive?: boolean;
}
