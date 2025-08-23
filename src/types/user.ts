import { Role } from './role';
import { Team } from './team';
import { Project } from './project';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  employeeId?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithDetails extends User {
  roles?: Role[];
  teams?: Team[];
  projects?: Project[];
  project?: Project;
  team?: Team;
  projectId?: string;
  teamId?: string;
  projectRoles?: Array<{
    projectId: string;
    projectName: string;
    roleId: string;
    roleName: string;
    teamId: string | null;
    teamName: string | null;
    assignedAt: string;
  }>;
  teamIds?: string[];
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  position?: string;
  employeeId?: string;
  projectRoleAssignments?: Array<{
    projectId: string;
    roleId: string;
    teamId: string;
  }>;
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
  isActive?: boolean;
  password?: string; // Optional for updates
}

export interface ProjectRoleAssignment {
  projectId: string;
  roleId: string;
  teamId: string;
}

export interface UserAssignments {
  roleIds?: string[];
  teamIds?: string[];
  projectIds?: string[];
}

export interface UserAllInformation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  department: string;
  position: string;
  employeeId: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    code: string;
    status: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    teams: Array<{
      id: string;
      name: string;
      description: string;
      leadId: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
    roles: Array<{
      id: string;
      name: string;
      description: string;
      level: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
      permissions: string[];
    }>;
  }>;
  commonPermissions: string[];
}
