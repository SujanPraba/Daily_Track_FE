import { Permission } from './permission';

export interface Role {
  id: string;
  name: string;
  description?: string;
  level: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'USER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleWithPermissions extends Role {
  permissions?: Permission[];
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  level: Role['level'];
  permissionIds?: string[];
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {
  isActive?: boolean;
}

export const ROLE_LEVELS = [
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'USER',
] as const;

export type RoleLevel = typeof ROLE_LEVELS[number];
