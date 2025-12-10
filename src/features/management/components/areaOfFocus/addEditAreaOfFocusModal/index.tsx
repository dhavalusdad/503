import { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import {
  useCreateFieldOptions,
  useGetFieldOptionsById,
  useUpdateFieldOptions,
} from '@/api/field-option';
import { FieldOptionType } from '@/enums';
import { areaOfFocusSchema } from '@/features/management/validation';
import { showToast } from '@/helper';
import Button from '@/stories/Common/Button';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';

interface AddEditAreaOfFocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  id?: string;
}

const AddEditAreaOfFocusModal = ({
  isOpen,
  onClose,
  isEdit = false,
  id,
}: AddEditAreaOfFocusModalProps) => {
  if (!isOpen) return null;
  const { mutate: createAreaOfFocus } = useCreateFieldOptions();
  const { data: areaOfFocus, dataUpdatedAt } = useGetFieldOptionsById(id);
  const { mutate: updateAreaOfFocus } = useUpdateFieldOptions();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: '',
    },
    mode: 'onChange',
    resolver: yupResolver(areaOfFocusSchema),
  });

  // Reset form when modal opens/closes or when edit mode changes
  useEffect(() => {
    if (isOpen) {
      if (isEdit && areaOfFocus) {
        // Set form values for edit mode
        reset({
          name: areaOfFocus.name || '',
        });
      } else {
        // Reset form for add mode
        reset({
          name: '',
        });
      }
    }
  }, [isOpen, isEdit, dataUpdatedAt, reset]);

  // Reset form when closing modal
  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: { name: string }) => {
    try {
      if (isEdit) {
        await updateAreaOfFocus({
          id: id || '',
          data: {
            name: data.name,
            type: FieldOptionType.AREA_OF_FOCUS,
          },
        });
      } else {
        await createAreaOfFocus({
          data: {
            name: data.name,
            type: FieldOptionType.AREA_OF_FOCUS,
          },
        });
      }
      handleClose();
    } catch (error) {
      console.error(error);
      showToast('Failed to save Area of Focus', 'ERROR');
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Area of Focus' : 'Add Area of Focus'}
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
            onClick={handleClose}
            className=' rounded-10px !leading-5 !px-30px'
          />
          <Button
            type='button'
            variant='filled'
            title={'Save'}
            onClick={handleSubmit(onSubmit)}
            className=' rounded-10px !leading-5 !px-30px'
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
        placeholder='Enter Area of Focus Name'
        labelClass='!text-base !leading-5'
        inputClass='!text-base !leading-5'
      />
    </Modal>
  );
};

export default AddEditAreaOfFocusModal;
