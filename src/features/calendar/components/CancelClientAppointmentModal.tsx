import { useState } from 'react';

import { useCancelClientAppointment } from '@/api/appointment';
import { CANCELLATION_REASONS } from '@/constants/CommonConstant';
import { showToast } from '@/helper';
import { Button } from '@/stories/Common/Button';
import { Modal, type ModalProps } from '@/stories/Common/Modal';
import RadioField from '@/stories/Common/RadioBox';
import Select from '@/stories/Common/Select';
import TextArea from '@/stories/Common/Textarea';

const CancelClientAppointmentModal = ({
  isOpen,
  onClose,
  appointmentId,
}: ModalProps & { appointmentId: string }) => {
  const { mutate: cancelAppointment, isPending } = useCancelClientAppointment();
  const [isPendingState, setIsPendingState] = useState(isPending);
  const [reason, setReason] = useState<{ value: string; label: string } | null>(null);
  const [cancellationScope, setCancellationScope] = useState<'all_future' | 'single'>('single');
  const [cancelAppointmentError, setCancelAppointmentError] = useState<boolean>(false);

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
      setIsPendingState(true);
      cancelAppointment(
        { id: appointmentId, reason: reason.value, cancellationScope },
        {
          onSuccess: () => {
            setIsPendingState(false);
            onClose();
          },
          onError: () => {
            setIsPendingState(false);
          },
        }
      );
    } catch (error) {
      showToast('Failed to cancel appointment', 'ERROR');
      throw error;
    }
  };

  return (
    //updated modal
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Cancel Appointment'
      closeButton={false}
      id='cancel-appointment-modal'
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
            variant='filled'
            onClick={handleCancelAppointment}
            title='Cancel Appointment'
            isDisabled={isPendingState}
            isLoading={isPendingState}
            className='!px-6 bg-red border-red hover:bg-red/85 hover:border-red/85 rounded-10px'
          />
        </div>
      }
    >
      <div className='flex flex-col gap-6'>
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

export default CancelClientAppointmentModal;
