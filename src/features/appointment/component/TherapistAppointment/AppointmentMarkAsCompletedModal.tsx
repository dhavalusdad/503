import { useEffect, useMemo } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

import {
  useGetAppointmentLoggedData,
  useUpdateTherapistAppointmentLoggedTime,
} from '@/api/appointment';
import { calendarQueryKeys } from '@/api/common/calendar.queryKey';
import { AppointmentStatus, SessionType } from '@/enums';
import { LogSessionFormSchema } from '@/features/appointment/validation';
import { useInvalidateQuery } from '@/hooks/data-fetching';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import Modal from '@/stories/Common/Modal';
import TextArea from '@/stories/Common/Textarea';
import TimeSelect from '@/stories/Common/TimeSelect';

type Props = {
  openModal: boolean;
  appointment_id: string;
  onClose: () => void;
  session_type: SessionType;
};

const AppointmentMarkAsCompletedModal = (props: Props) => {
  // ** Props **
  const { openModal, appointment_id, onClose, session_type } = props;

  // ** Redux States **
  const { timezone } = useSelector(currentUser);

  // ** Services **
  const { data: loggedData, isPending: isLoggedDataPending } =
    useGetAppointmentLoggedData(appointment_id);

  /// ** Hooks **
  const { invalidate } = useInvalidateQuery();

  const {
    mutateAsync: updateLoggedData,
    isPending: isUpdating,
    isError: isErrorInUpdatingSessionLogTime,
  } = useUpdateTherapistAppointmentLoggedTime();
  const {
    control,
    getValues,
    handleSubmit,
    formState: { isDirty, errors },
    reset,
    trigger,
    watch,
    setValue,
  } = useForm<{
    start_time: Date | null;
    end_time: Date | null;
    mark_as_completed: boolean;
    reason: string;
  }>({
    defaultValues: {
      start_time: null,
      end_time: null,
      mark_as_completed: false,
      reason: '',
    },
    mode: 'onChange',
    resolver: yupResolver(LogSessionFormSchema(timezone)),
  });

  const { start_time, end_time } = watch();

  const onSubmit = handleSubmit(async () => {
    const { start_time, end_time, mark_as_completed, reason } = getValues();
    if (!start_time || !end_time) return;
    await updateLoggedData({
      id: appointment_id,
      data: {
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        mark_as_completed,
        reason,
      },
    });

    if (!isErrorInUpdatingSessionLogTime) {
      invalidate(calendarQueryKeys.appointmentsDetail(appointment_id));
    }
    onClose();
  });

  const isFormDisabled = useMemo(() => {
    if (!loggedData) return false;
    return loggedData?.status === AppointmentStatus.COMPLETED;
  }, [loggedData]);

  useEffect(() => {
    if (!loggedData) return;
    const { start_time, end_time, status, reason } = loggedData;

    if (!start_time || !end_time) return;
    reset({
      start_time: moment.tz(start_time, timezone).toDate(),
      end_time: moment.tz(end_time, timezone).toDate(),
      mark_as_completed: status === AppointmentStatus.COMPLETED,
      reason: reason,
    });
  }, [loggedData]);

  useEffect(() => {
    if (start_time && end_time) {
      trigger('end_time');
    }
  }, [start_time]);

  useEffect(() => {
    if (start_time && end_time) {
      if (session_type === SessionType.CLINIC) {
        setValue('mark_as_completed', true);
      }
    }
  }, [start_time, end_time]);

  return (
    <Modal
      id='end-session'
      isOpen={openModal}
      title='Log Session Time'
      size='xs'
      closeButton={false}
      onClose={() => {
        onClose();
      }}
      contentClassName='pt-30px'
      footerClassName='pt-30px border border-solid border-surface rounded-b-20px'
      footer={
        <div className='flex items-center justify-end gap-5'>
          <Button
            variant='outline'
            title={isFormDisabled ? 'Close' : 'Cancel'}
            className='rounded-10px !px-6'
            onClick={onClose}
          />
          {!isFormDisabled ? (
            <Button
              variant='filled'
              title='Save'
              className='!px-6 rounded-10px'
              onClick={onSubmit}
              isDisabled={!isDirty}
              isLoading={isUpdating}
            />
          ) : (
            <></>
          )}
        </div>
      }
    >
      {isLoggedDataPending ? (
        <div className='flex justify-center items-center py-4'>
          <span
            className={`relative border-[5px] border-lime-500 border-b-lime-300 rounded-full block animate-spin h-5 w-5`}
          />
        </div>
      ) : (
        <div className='flex flex-col gap-5'>
          <div className='grid grid-cols-2 gap-5'>
            <TimeSelect
              control={control}
              name='start_time'
              error={errors?.start_time?.message}
              key='start_time'
              id='start_time'
              label='Start Time'
              timezone={timezone}
              placeholder='Select Start Time'
              portalId='end-session'
              isDisabled={isFormDisabled}
              isClearable
            />
            <TimeSelect
              control={control}
              name='end_time'
              error={errors?.end_time?.message}
              key='end_time'
              id='end_time'
              label='End Time'
              timezone={timezone}
              placeholder='Select End Time'
              portalId='end-session'
              isDisabled={isFormDisabled}
              isClearable
            />
          </div>

          <TextArea
            label='Reason for changing time'
            placeholder='Please provide the reason'
            name='reason'
            error={errors.reason?.message}
            isRequired
            parentClassName='col-span-2'
            isDisabled={isFormDisabled}
            value={getValues('reason') || ''}
            onChange={e =>
              setValue('reason', e.target.value, { shouldValidate: true, shouldDirty: true })
            }
          />

          <CheckboxField
            id='mark_as_completed'
            label='Mark As Completed'
            control={control}
            name='mark_as_completed'
            labelClass='whitespace-nowrap'
            isDisabled={isFormDisabled}
          />
        </div>
      )}
    </Modal>
  );
};

export default AppointmentMarkAsCompletedModal;
