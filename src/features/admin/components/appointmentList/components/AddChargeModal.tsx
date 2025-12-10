import { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import { useChargeAppointment } from '@/api/payment';
import Button from '@/stories/Common/Button';
import Modal from '@/stories/Common/Modal';

import type { AppointmentDataType } from '../types';

interface AddChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAppointment: AppointmentDataType | null;
}

interface FormData {
  amount: string;
}

// Yup validation schema
const validationSchema = yup.object().shape({
  amount: yup
    .string()
    .required('Amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number with up to 2 decimal places')
    .test('positive', 'Amount must be greater than 0', value => {
      return value ? parseFloat(value) > 0 : false;
    }),
});

const AddChargeModal = ({ isOpen, onClose, selectedAppointment }: AddChargeModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });
  const { mutate: chargeAppointment, isPending } = useChargeAppointment();

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = (data: FormData) => {
    if (!selectedAppointment) return;

    chargeAppointment(
      {
        amount: data.amount,
        appointmentId: selectedAppointment.id,
      },
      {
        onSuccess: () => {
          onClose();
          reset();
        },
        onError: () => {},
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Add Charge to Appointment'
      closeButton={false}
      contentClassName='pt-30px'
      footer={
        <div className='flex items-center justify-end gap-5'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            className='!px-6 rounded-10px min-h-50px'
            isDisabled={isPending}
            title='Cancel'
          />
          <Button
            type='submit'
            variant='filled'
            className='!px-6 rounded-10px min-h-50px'
            isLoading={isPending}
            isDisabled={isPending}
            onClick={handleSubmit(onSubmit)}
            title='Add Charge'
          />
        </div>
      }
    >
      <InputField
        label='Amount'
        labelClass='!text-base'
        inputClass='!text-base !leading-5'
        type='text'
        placeholder='Enter amount (e.g., 35.00)'
        name='amount'
        register={register}
        error={errors.amount?.message}
      />
    </Modal>
  );
};

export default AddChargeModal;
