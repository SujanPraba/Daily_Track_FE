import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreatePermissionMutation, useUpdatePermissionMutation } from '../../features/permissions/permissionsApi';
import { CreatePermissionDto, Permission, MODULES, ACTIONS } from '../../types/permission';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import toast from 'react-hot-toast';

interface PermissionFormProps {
  permission?: Permission;
  onClose: () => void;
}

const PermissionForm: React.FC<PermissionFormProps> = ({ permission, onClose }) => {
  const [createPermission, { isLoading: isCreating }] = useCreatePermissionMutation();
  const [updatePermission, { isLoading: isUpdating }] = useUpdatePermissionMutation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreatePermissionDto>({
    defaultValues: {
      name: permission?.name || '',
      description: permission?.description || '',
      module: permission?.module || MODULES[0],
      action: permission?.action || ACTIONS[0],
    },
  });

  const selectedModule = watch('module');
  const selectedAction = watch('action');

  // Auto-generate name based on module and action
  React.useEffect(() => {
    if (!permission && selectedModule && selectedAction) {
      const generatedName = `${selectedModule}_${selectedAction}`;
      control._defaultValues.name = generatedName;
    }
  }, [selectedModule, selectedAction, permission, control._defaultValues]);

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
    } catch (error) {
      toast.error(permission ? 'Failed to update permission' : 'Failed to create permission');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <Controller
            name="module"
            control={control}
            rules={{ required: 'Module is required' }}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Module
                </label>
                <select
                  {...field}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-lg"
                >
                  {MODULES.map((module) => (
                    <option key={module} value={module}>
                      {module}
                    </option>
                  ))}
                </select>
                {errors.module && (
                  <p className="mt-1 text-sm text-red-600">{errors.module.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="action"
            control={control}
            rules={{ required: 'Action is required' }}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Action
                </label>
                <select
                  {...field}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-lg"
                >
                  {ACTIONS.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
                {errors.action && (
                  <p className="mt-1 text-sm text-red-600">{errors.action.message}</p>
                )}
              </div>
            )}
          />

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
        </div>

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
                rows={6}
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
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
