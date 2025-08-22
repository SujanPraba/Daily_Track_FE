export interface Project {
  id: string;
  name: string;
  description?: string;
  code: string;
  managerId?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  code: string;
  managerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  isActive?: boolean;
}

export interface ProjectWithManager extends Project {
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
