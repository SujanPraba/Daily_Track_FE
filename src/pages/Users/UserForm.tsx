import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreateUserMutation, useUpdateUserMutation } from '../../features/users/usersApi';
import { CreateUserDto, UserWithDetails } from '../../types/user';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import toast from 'react-hot-toast';

interface UserFormProps {
  user?: UserWithDetails;
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose }) => {
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateUserDto>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      position: user?.position || '',
      employeeId: user?.employeeId || '',
      roleIds: user?.roles?.map(r => r.id) || [],
    },
  });

  const onSubmit = async (data: CreateUserDto) => {
    try {
      if (user) {
        await updateUser({ id: user.id, ...data }).unwrap();
        toast.success('User updated successfully');
      } else {
        await createUser(data).unwrap();
        toast.success('User created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(user ? 'Failed to update user' : 'Failed to create user');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          
          <Controller
            name="firstName"
            control={control}
            rules={{ required: 'First name is required' }}
            render={({ field }) => (
              <Input
                label="First Name"
                error={errors.firstName?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            rules={{ required: 'Last name is required' }}
            render={({ field }) => (
              <Input
                label="Last Name"
                error={errors.lastName?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            rules={{ 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
            render={({ field }) => (
              <Input
                label="Email Address"
                type="email"
                error={errors.email?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                label="Phone Number"
                type="tel"
                error={errors.phone?.message}
                {...field}
              />
            )}
          />

          {!user && (
            <Controller
              name="password"
              control={control}
              rules={{ 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
              render={({ field }) => (
                <Input
                  label="Password"
                  type="password"
                  error={errors.password?.message}
                  {...field}
                />
              )}
            />
          )}
        </div>

        {/* Employment Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Employment Information</h3>
          
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <Input
                label="Department"
                error={errors.department?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="position"
            control={control}
            render={({ field }) => (
              <Input
                label="Position"
                error={errors.position?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="employeeId"
            control={control}
            render={({ field }) => (
              <Input
                label="Employee ID"
                error={errors.employeeId?.message}
                {...field}
              />
            )}
          />
        </div>
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
          {user ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
