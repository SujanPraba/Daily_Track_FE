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
  roleIds?: string[];
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
  isActive?: boolean;
  password?: string; // Optional for updates
}

export interface UserAssignments {
  roleIds?: string[];
  teamIds?: string[];
  projectIds?: string[];
}
