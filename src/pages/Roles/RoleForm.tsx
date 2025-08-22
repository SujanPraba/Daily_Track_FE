import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreateRoleMutation, useUpdateRoleMutation } from '../../features/roles/rolesApi';
import { CreateRoleDto, RoleWithPermissions, ROLE_LEVELS } from '../../types/role';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import toast from 'react-hot-toast';

interface RoleFormProps {
  role?: RoleWithPermissions;
  onClose: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onClose }) => {
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoleDto>({
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      level: role?.level || 'USER',
      permissionIds: role?.permissions?.map(p => p.id) || [],
    },
  });

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
      toast.error(role ? 'Failed to update role' : 'Failed to create role');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Role name is required' }}
            render={({ field }) => (
              <Input
                label="Role Name"
                error={errors.name?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="level"
            control={control}
            rules={{ required: 'Role level is required' }}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role Level
                </label>
                <select
                  {...field}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-lg"
                >
                  {ROLE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                {errors.level && (
                  <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
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
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...field}
                rows={6}
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe the role and its responsibilities..."
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
          {role ? 'Update Role' : 'Create Role'}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
