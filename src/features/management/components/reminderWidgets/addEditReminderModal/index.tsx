import { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import {
  useCreateFieldOptions,
  useGetFieldOptionsById,
  useUpdateFieldOptions,
} from '@/api/field-option';
import { FieldOptionType } from '@/enums';
import { ReminderWidgetsSchema } from '@/features/management/validation';
import { showToast } from '@/helper';
import Button from '@/stories/Common/Button';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';

interface AddEditReminderWidgtesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  id?: string;
}

const AddEditRemiderWidgetsModal = ({
  isOpen,
  onClose,
  isEdit = false,
  id,
}: AddEditReminderWidgtesModalProps) => {
  const { mutate: createReminderWidget } = useCreateFieldOptions();
  const { data: reminderWidgets, dataUpdatedAt } = useGetFieldOptionsById(id);
  const { mutate: updateReminderWidgets } = useUpdateFieldOptions();

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
    resolver: yupResolver(ReminderWidgetsSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (isEdit && reminderWidgets) {
        reset({
          name: reminderWidgets.name || '',
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

  const onSubmit = async (data: { name: string }) => {
    try {
      if (isEdit) {
        await updateReminderWidgets({
          id: id || '',
          data: {
            name: data.name,
            type: FieldOptionType.WIDGET_TYPE,
          },
        });
      } else {
        await createReminderWidget({
          data: {
            name: data.name,
            type: 'WidgetType',
          },
        });
      }
      handleClose();
    } catch (error) {
      console.error(error);
      showToast('Failed to save Reminder Widget', 'ERROR');
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Reminder Widget' : 'Add Reminder Widget'}
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
            className=' rounded-10px !leading-5 !px-6'
          />
          <Button
            type='button'
            variant='filled'
            title={'Save'}
            onClick={handleSubmit(onSubmit)}
            className=' rounded-10px !leading-5 !px-6'
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
        placeholder='Enter Reminder Widget Name'
        labelClass='!text-base !leading-5'
        inputClass='!text-base !leading-5'
      />
    </Modal>
  );
};

export default AddEditRemiderWidgetsModal;
