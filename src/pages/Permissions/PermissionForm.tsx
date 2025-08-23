import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreatePermissionMutation, useUpdatePermissionMutation } from '../../features/permissions/permissionsApi';
import { useSearchModulesMutation } from '../../features/modules/modulesApi';
import { CreatePermissionDto, Permission } from '../../types/permission';
import { Module } from '../../types/module';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import toast from 'react-hot-toast';


interface PermissionFormProps {
  permission?: Permission;
  onClose: () => void;
  onSuccess?: () => void;
}

const PermissionForm: React.FC<PermissionFormProps> = ({ permission, onClose, onSuccess }) => {
  const [createPermission, { isLoading: isCreating }] = useCreatePermissionMutation();
  const [updatePermission, { isLoading: isUpdating }] = useUpdatePermissionMutation();


  const [searchModules, { data: modulesResponse }] = useSearchModulesMutation();

  const modules = modulesResponse?.data || [];

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePermissionDto>({
    defaultValues: {
      name: permission?.name || '',
      description: permission?.description || '',
      moduleId: permission?.moduleId || '',
    },
  });

  // Load modules on mount
  useEffect(() => {
    searchModules({
      searchTerm: '',
      page: 1,
      limit: 100,
    });
  }, [searchModules]);

  const onSubmit = async (data: CreatePermissionDto) => {
    try {
      if (permission) {
        await updatePermission({ id: permission.id, ...data }).unwrap();
        toast.success('Permission updated successfully');
      } else {
        await createPermission(data).unwrap();
        toast.success('Permission created successfully');
      }
      onClose();
      // Call onSuccess callback to refresh permissions list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(permission ? 'Failed to update permission' : 'Failed to create permission');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Module Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
          <Controller
            name="moduleId"
            control={control}
            rules={{ required: 'Module is required' }}
            render={({ field }) => (
              <select
                {...field}
                className="block w-full rounded-lg py-2 px-3 border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select a module</option>
                {modules.map((module: Module) => (
                  <option key={module.id} value={module.id}>
                    {module.code} - {module.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.moduleId && (
            <p className="mt-1 text-sm text-red-600">{errors.moduleId.message}</p>
          )}
        </div>

        {/* Permission Name */}
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Permission name is required' }}
          render={({ field }) => (
            <Input
              label="Permission Name"
              error={errors.name?.message}
              {...field}
            />
          )}
        />

        {/* Description */}
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...field}
                rows={4}
                className="mt-1 p-3 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe what this permission allows..."
              />
            </div>
          )}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isCreating || isUpdating}
        >
          {permission ? 'Update Permission' : 'Create Permission'}
        </Button>
      </div>
    </form>
  );
};

export default PermissionForm;

