import { Permission } from "./permission";

export interface Module {
  id: string;
  name: string;
  description: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

export interface CreateModuleDto {
  name: string;
  description: string;
  code: string;
}

export interface UpdateModuleDto extends Partial<CreateModuleDto> {
  isActive?: boolean;
}
