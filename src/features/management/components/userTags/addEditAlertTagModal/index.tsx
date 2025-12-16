import { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { useCreateTag, useGetTagById, useUpdateTag } from '@/api/tag';
import { TagType } from '@/enums';
import { TagSchema } from '@/features/management/validation';
import { showToast } from '@/helper';
import Button from '@/stories/Common/Button';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';

interface AddEditTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  id?: string;
}

interface TagFormValues {
  name: string;
  color: string;
}

const AddEditUserTagModal = ({ isOpen, onClose, isEdit = false, id }: AddEditTagModalProps) => {
  if (!isOpen) return null;
  const { mutateAsync: createTag } = useCreateTag();
  const { data: tagData, dataUpdatedAt } = useGetTagById(id);
  const { mutate: updateTag } = useUpdateTag();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TagFormValues>({
    defaultValues: {
      name: '',
      color: '#000000',
    },
    mode: 'onChange',
    resolver: yupResolver(TagSchema),
  });

  // Watch the color value for preview

  // Reset form when modal opens/closes or when edit mode changes
  useEffect(() => {
    if (isOpen) {
      if (isEdit && tagData) {
        // Set form values for edit mode
        reset({
          name: tagData.name || '',
          color: `#${tagData.color}`,
        });
      } else {
        // Reset form for add mode
        reset({
          name: '',
          color: '#000000',
        });
      }
    }
  }, [isOpen, isEdit, dataUpdatedAt, reset]);

  // Reset form when closing modal
  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: TagFormValues) => {
    try {
      if (isEdit) {
        await updateTag({
          id: id || '',
          data: {
            name: data.name,
            color: data.color.slice(1),
          },
        });
      } else {
        await createTag({
          data: {
            name: data.name,
            color: data.color.slice(1),
            type: TagType.ALERT_TAG,
          },
        });
      }
      handleClose();
    } catch (error) {
      console.error(error);
      showToast('Failed to save tags', 'ERROR');
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Tag' : 'Add Tag'}
      isOpen={isOpen}
      onClose={handleClose}
      closeButton={false}
      contentClassName='pt-30px'
      footer={
        <div className='flex items-center justify-end gap-5'>
          <Button
            type='button'
            variant='outline'
            title='Cancel'
            isIconFirst
            onClick={handleClose}
            className='rounded-10px !leading-5 !px-6'
          />
          <Button
            type='button'
            variant='filled'
            title='Save'
            onClick={handleSubmit(onSubmit)}
            className='rounded-10px !leading-5 !px-6'
          />
        </div>
      }
    >
      <div className='flex flex-col gap-5'>
        <InputField
          label='Name'
          name='name'
          register={register}
          error={errors.name?.message}
          type='text'
          placeholder='Enter Tag Name'
          isRequired
          labelClass='!text-base'
          inputClass='!text-base !leading-5'
        />
        <InputField
          label='Color'
          name='color'
          register={register}
          error={errors.color?.message}
          type='color'
          isRequired
          labelClass='!text-base'
          inputClass='!p-0 min-h-50px cursor-pointer !border-0 focus:outline-none !text-base !leading-5'
        />
      </div>
    </Modal>
  );
};

export default AddEditUserTagModal;
