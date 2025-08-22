export interface Permission {
  id: string;
  name: string;
  description?: string;
  module: string;
  action: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionDto {
  name: string;
  description?: string;
  module: string;
  action: string;
}

export interface UpdatePermissionDto extends Partial<CreatePermissionDto> {
  isActive?: boolean;
}

export const MODULES = [
  'USER',
  'PROJECT',
  'TEAM',
  'ROLE',
  'PERMISSION',
  'DAILY_UPDATE',
] as const;

export const ACTIONS = [
  'CREATE',
  'READ',
  'UPDATE',
  'DELETE',
  'MANAGE',
  'APPROVE',
] as const;

export type Module = typeof MODULES[number];
export type Action = typeof ACTIONS[number];
