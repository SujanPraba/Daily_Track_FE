import { Module } from './module';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  moduleId: string;
  module: Module;
  action?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  moduleName: string;
}

export interface CreatePermissionDto {
  name: string;
  description?: string;
  moduleId: string;
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

export type ModuleType = typeof MODULES[number];
export type Action = typeof ACTIONS[number];
