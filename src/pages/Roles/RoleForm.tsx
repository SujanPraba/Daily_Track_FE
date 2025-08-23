import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreateRoleMutation, useUpdateRoleMutation } from '../../features/roles/rolesApi';
import { useGetModulesWithPermissionsQuery } from '../../features/modules/modulesApi';
import { CreateRoleDto, RoleWithPermissions, ROLE_LEVELS } from '../../types/role';
import { Module } from '../../types/module';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronRight, Shield, Key, Check } from 'lucide-react';

interface RoleFormProps {
  role?: RoleWithPermissions;
  onClose: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onClose }) => {
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const { data: modulesWithPermissions, isLoading: isLoadingModules } = useGetModulesWithPermissionsQuery();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateRoleDto>({
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      level: role?.level || 'USER',
      permissionIds: role?.permissions?.map(p => p.id) || [],
    },
  });

  // Initialize selected permissions when editing a role
  useEffect(() => {
    if (role?.permissions) {
      const permissionIds = role.permissions.map(p => p.id);
      setSelectedPermissions(new Set(permissionIds));
    }
  }, [role]);

  // Update form value when permissions change
  useEffect(() => {
    setValue('permissionIds', Array.from(selectedPermissions));
  }, [selectedPermissions, setValue]);

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const togglePermission = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const toggleAllPermissionsInModule = (module: Module, checked: boolean) => {
    const newSelected = new Set(selectedPermissions);
    const modulePermissionIds = module.permissions?.map(p => p.id) || [];

    if (checked) {
      modulePermissionIds.forEach(id => newSelected.add(id));
    } else {
      modulePermissionIds.forEach(id => newSelected.delete(id));
    }

    setSelectedPermissions(newSelected);
  };

  const getModuleSelectedCount = (module: Module) => {
    const modulePermissionIds = module.permissions?.map(p => p.id) || [];
    return modulePermissionIds.filter(id => selectedPermissions.has(id)).length;
  };

  const onSubmit = async (data: CreateRoleDto) => {
    try {
      if (role) {
        await updateRole({ id: role.id, ...data }).unwrap();
        toast.success('Role updated successfully');
      } else {
        await createRole(data).unwrap();
        toast.success('Role created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(role ? 'Failed to update role' : 'Failed to update role');
    }
  };

  if (isLoadingModules) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Loading modules and permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Role Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-base font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Role name is required' }}
              render={({ field }) => (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Role Name *
                  </label>
                  <input
                    {...field}
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Enter role name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="level"
              control={control}
              rules={{ required: 'Role level is required' }}
              render={({ field }) => (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Role Level *
                  </label>
                  <select
                    {...field}
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                    {ROLE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  {errors.level && (
                    <p className="mt-1 text-xs text-red-600">{errors.level.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...field}
                  rows={4}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                  placeholder="Describe the role and its responsibilities..."
                />
              </div>
            )}
          />
        </div>
      </div>

      {/* Module and Permissions Selection */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">Module Permissions</h3>
              <p className="mt-1 text-xs text-gray-500">
                Select the permissions this role should have access to
              </p>
            </div>
            <div className="bg-orange-50 px-3 py-1.5 rounded-md">
              <span className="text-xs font-medium text-orange-800">
                {selectedPermissions.size} permission{selectedPermissions.size !== 1 ? 's' : ''} selected
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {modulesWithPermissions?.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            const selectedCount = getModuleSelectedCount(module);
            const totalCount = module.permissions?.length || 0;
            const allSelected = totalCount > 0 && selectedCount === totalCount;
            const someSelected = selectedCount > 0 && selectedCount < totalCount;

            return (
              <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Module Header */}
                <div className="bg-gray-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => toggleModuleExpansion(module.id)}
                        className="p-1.5 hover:bg-white rounded-md transition-colors duration-200"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        )}
                      </button>

                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-blue-100 rounded-md">
                          <Shield className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{module.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{module.code}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{selectedCount}</div>
                        <div className="text-xs text-gray-500">of {totalCount}</div>
                      </div>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(ref) => {
                            if (ref) ref.indeterminate = someSelected;
                          }}
                          onChange={(e) => toggleAllPermissionsInModule(module, e.target.checked)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-colors"
                        />
                        <span className="text-xs font-medium text-gray-700">All</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Permissions List */}
                {isExpanded && module.permissions && (
                  <div className="bg-white divide-y divide-gray-100">
                    {module.permissions.map((permission, index) => (
                      <div
                        key={permission.id}
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                          index === 0 ? 'pt-3' : ''
                        }`}
                        onClick={() => togglePermission(permission.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.has(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-colors"
                          />

                          <div className="flex items-center space-x-2 flex-1">
                            <div className="p-1.5 bg-purple-100 rounded-md">
                              <Key className="h-3.5 w-3.5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                              {permission.description && (
                                <div className="text-xs text-gray-500 mt-0.5">{permission.description}</div>
                              )}
                            </div>
                          </div>

                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            permission.isActive
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {permission.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-2">
        <Button
          variant="secondary"
          onClick={onClose}
          className="px-6 py-2 text-sm"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isCreating || isUpdating}
          className="px-6 py-2 text-sm"
        >
          {role ? 'Update Role' : 'Create Role'}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
