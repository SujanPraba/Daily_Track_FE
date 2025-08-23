import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreateModuleMutation, useUpdateModuleMutation } from '../../features/modules/modulesApi';
import { CreateModuleDto, Module } from '../../types/module';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import toast from 'react-hot-toast';

interface ModuleFormProps {
  module?: Module;
  onClose: () => void;
  onSuccess?: () => void;
}

const ModuleForm: React.FC<ModuleFormProps> = ({ module, onClose, onSuccess }) => {
  const [createModule, { isLoading: isCreating }] = useCreateModuleMutation();
  const [updateModule, { isLoading: isUpdating }] = useUpdateModuleMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateModuleDto>({
    defaultValues: {
      name: module?.name || '',
      description: module?.description || '',
      code: module?.code || '',
    },
  });

  const onSubmit = async (data: CreateModuleDto) => {
    try {
      if (module) {
        await updateModule({ id: module.id, ...data }).unwrap();
        toast.success('Module updated successfully');
      } else {
        await createModule(data).unwrap();
        toast.success('Module created successfully');
      }
      onClose();
      // Call onSuccess callback to refresh modules list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(module ? 'Failed to update module' : 'Failed to create module');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Module name is required' }}
          render={({ field }) => (
            <Input
              label="Module Name"
              error={errors.name?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="code"
          control={control}
          rules={{ required: 'Module code is required' }}
          render={({ field }) => (
            <Input
              label="Module Code"
              error={errors.code?.message}
              placeholder="e.g., USER_MGMT"
              {...field}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input
              label="Description"
              error={errors.description?.message}
              {...field}
            />
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
          {module ? 'Update Module' : 'Create Module'}
        </Button>
      </div>
    </form>
  );
};

export default ModuleForm;
