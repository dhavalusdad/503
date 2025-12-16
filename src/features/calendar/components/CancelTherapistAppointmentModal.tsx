import { useState } from 'react';

import { useCancelTherapistAppointment } from '@/api/appointment';
import { appointmentQueryKey } from '@/api/common/appointment.queryKey';
import { calendarQueryKeys } from '@/api/common/calendar.queryKey';
import { queryClient } from '@/api/QueryProvider';
import { CANCELLATION_REASONS } from '@/constants/CommonConstant';
import { AppointmentStatus } from '@/enums';
import type { AppointmentInfiniteData } from '@/features/calendar/types';
import { showToast } from '@/helper';
import { useInvalidateQuery } from '@/hooks/data-fetching';
import { Button } from '@/stories/Common/Button';
import { Modal, type ModalProps } from '@/stories/Common/Modal';
import RadioField from '@/stories/Common/RadioBox';
import Select from '@/stories/Common/Select';
import TextArea from '@/stories/Common/Textarea';

const CancelTherapistAppointmentModal = ({
  isOpen,
  onClose,
  appointmentId,
  parentModule,
}: ModalProps & { appointmentId: string; parentModule: string }) => {
  const { invalidate } = useInvalidateQuery();
  const { mutate: cancelAppointment } = useCancelTherapistAppointment({
    onSuccess: () => {
      queryClient.setQueriesData<AppointmentInfiniteData>(
        { queryKey: appointmentQueryKey.getClientTherapistAppointmentList() },
        oldData => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              data: page.data.map(item =>
                item.id === appointmentId ? { ...item, status: AppointmentStatus.CANCELLED } : item
              ),
            })),
          };
        }
      );

      if (parentModule === 'therapist-dashboard') {
        invalidate(calendarQueryKeys.clientTherapistAppointments());
      } else if (parentModule === 'therapist-calendar') {
        invalidate(calendarQueryKeys.all);
      }
      setIsPending(false);
      onClose();
    },
    onError: () => {
      setIsPending(false);
    },
  });
  const [reason, setReason] = useState<{ value: string; label: string } | null>(null);
  const [cancellationScope, setCancellationScope] = useState<'all_future' | 'single'>('single');
  const [cancelAppointmentError, setCancelAppointmentError] = useState<boolean>(false);
  const [isPending, setIsPending] = useState(false);

  const handleCancelAppointment = async () => {
    if (!reason?.value || reason?.label === 'Other') {
      if (reason?.label === 'Other' && reason?.value == 'Other') {
        setCancelAppointmentError(true);
        return;
      } else if (reason?.label != 'Other') {
        setCancelAppointmentError(true);
        return;
      }
    }
    try {
      setIsPending(true);
      cancelAppointment({ id: appointmentId, reason: reason.value, cancellationScope });
    } catch (error) {
      showToast('Failed to cancel appointment', 'ERROR');
      throw error;
    }
  };

  return (
    //updated Modal
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Cancel Appointment'
      id='cancel-appointment-modal'
      closeButton={false}
      size='xs'
      contentClassName=''
      footer={
        <div className='flex items-center justify-end gap-3 border-t border-surface pt-30px'>
          <Button
            title='Cancel'
            variant='outline'
            onClick={onClose}
            className='!px-6 rounded-10px'
          />
          <Button
            title='Cancel Appointment'
            variant='filled'
            isDisabled={isPending}
            isLoading={isPending}
            onClick={handleCancelAppointment}
            className='!px-6 bg-red border-red hover:bg-red/85 hover:border-red/85 rounded-10px'
          />
        </div>
      }
    >
      <div className='flex flex-col gap-6'>
        <p className='text-lg font-semibold text-blackdark'>
          Are you sure you want to Cancel this Appointment?
        </p>
        <div className='flex flex-col gap-3'>
          <Select
            options={CANCELLATION_REASONS}
            value={reason}
            label={'Cancellation Reason'}
            isRequired={true}
            placeholder='Select reason'
            onChange={value => setReason(value as { value: string; label: string })}
            onFocus={() => setCancelAppointmentError(false)}
            onBlur={() => setCancelAppointmentError(false)}
            labelClassName='!text-base !leading-5'
            portalRootId='cancel-appointment-modal'
            StylesConfig={{
              control: () => ({
                minHeight: '50px',
              }),
              singleValue: () => ({
                fontSize: '16px',
              }),
              option: () => ({
                fontSize: '16px',
              }),
            }}
          />

          {reason?.label === 'Other' && (
            <TextArea
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setReason({ value: e?.target?.value, label: 'Other' })
              }
              placeholder='Enter cancellation reason'
            />
          )}
          {cancelAppointmentError && (
            <span className='text-red'>
              {reason?.label === 'Other' ? 'Please enter a reason' : 'Please select a reason'}
            </span>
          )}
        </div>

        <div className='flex flex-col gap-4'>
          <RadioField
            id='single-session'
            label='Cancel only this session'
            name='cancellation-scope'
            value='single'
            isChecked={cancellationScope === 'single'}
            onChange={() => setCancellationScope('single')}
          />
          <RadioField
            id='all-sessions'
            label='Cancel this and all future sessions'
            name='cancellation-scope'
            value='all_future'
            isChecked={cancellationScope === 'all_future'}
            onChange={() => setCancellationScope('all_future')}
          />
        </div>
      </div>
    </Modal>
  );
};

export default CancelTherapistAppointmentModal;
