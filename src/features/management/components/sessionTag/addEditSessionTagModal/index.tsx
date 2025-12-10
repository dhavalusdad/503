import { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { useCreateTag, useGetTagById, useUpdateTag } from '@/api/tag';
import { TagType } from '@/enums';
import { SessionTagSchema } from '@/features/management/validation';
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
  const { mutate: createSessionTag } = useCreateTag();
  const { data: tagData, dataUpdatedAt } = useGetTagById(id);
  const { mutate: updateSessionTag } = useUpdateTag();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TagFormValues>({
    defaultValues: {
      name: '',
    },
    mode: 'onChange',
    resolver: yupResolver(SessionTagSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (isEdit && tagData) {
        reset({
          name: tagData.name || '',
        });
      } else {
        reset({
          name: '',
        });
      }
    }
  }, [isOpen, isEdit, dataUpdatedAt, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: TagFormValues) => {
    try {
      if (isEdit) {
        await updateSessionTag({
          id: id || '',
          data: {
            name: data.name,
            type: TagType.SESSION_TAG,
          },
        });
      } else {
        await createSessionTag({
          data: {
            name: data.name,
            type: TagType.SESSION_TAG,
          },
        });
      }
      handleClose();
    } catch (error) {
      console.error(error);
      showToast('Failed to save session tags', 'ERROR');
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Session Tag' : 'Add Session Tag'}
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
      <InputField
        label='Name'
        name='name'
        register={register}
        error={errors.name?.message}
        type='text'
        placeholder='Enter Session Tag Name'
        isRequired
        labelClass='!text-base !leading-5'
        inputClass='!text-base !leading-5'
      />
    </Modal>
  );
};

export default AddEditUserTagModal;
