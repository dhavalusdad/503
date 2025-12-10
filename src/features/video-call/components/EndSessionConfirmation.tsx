import { useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import moment, { type Moment } from 'moment';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useEndAppointmentAPI, useGetAppointmentDetailsByVideoRoom } from '@/api/appointment';
import { appointmentQueryKey } from '@/api/common/appointment.queryKey';
import { ROUTES } from '@/constants/routePath';
import { AppointmentStatus } from '@/enums';
import AddAmdFormsModal from '@/features/admin/components/clientManagement/components/AddAmdForm';
import { EndSessionFormSchema } from '@/features/appointment/validation';
import UnsignedAmdForms from '@/features/video-call/components/UnsignedAmdForms';
import { useInvalidateQuery } from '@/hooks/data-fetching';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import TextArea from '@/stories/Common/Textarea';
import TimeSelect from '@/stories/Common/TimeSelect';

const EndSessionConfirmation = () => {
  // ** Hooks **
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { appointment_id: appointmentId } = useParams<{ appointment_id: string }>();

  const navigate = useNavigate();
  const location = useLocation();
  const { invalidate } = useInvalidateQuery();

  // ** Redux States **
  const { timezone, id } = useSelector(currentUser);
  const currentUserTimeZone = id ? timezone : moment.tz.guess();
  // ** Services **

  const { data: appointmentDetails, isLoading: isLoadingAppointment } =
    useGetAppointmentDetailsByVideoRoom(location?.state?.roomId);
  const [stepValue, setStepValue] = useState(1);
  // console.log(a)
  const {
    mutateAsync: endSession,
    isPending: isSessionEnding,
    isError: isErrorInEndingSession,
  } = useEndAppointmentAPI();

  const {
    register,
    control,
    getValues,
    setValue,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<{
    start_time: Moment | null;
    end_time: Moment | null;
    notes: string | null;
    reason: string;
  }>({
    defaultValues: {
      start_time: null,
      end_time: null,
      notes: '',
      reason: '',
    },
    resolver: yupResolver(
      EndSessionFormSchema(
        timezone,
        appointmentDetails?.actual_start_time
          ? moment
              .tz(appointmentDetails?.actual_start_time || new Date(), currentUserTimeZone)
              .format()
          : null,
        appointmentDetails?.logged_end_time
          ? moment
              .tz(appointmentDetails?.logged_end_time || new Date(), currentUserTimeZone)
              .add(5, 'minutes')
              .format()
          : null
      )
    ),
    mode: 'onChange',
  });

  useEffect(() => {
    if (!location?.state?.roomId) {
      navigate(ROUTES.THERAPIST_LOGIN.path);
    }
  }, []);

  useEffect(() => {
    if (appointmentDetails) {
      reset({
        start_time: appointmentDetails?.actual_start_time
          ? moment
              .tz(appointmentDetails?.actual_start_time || new Date(), currentUserTimeZone)
              .format()
          : null,
        end_time: moment
          .tz(appointmentDetails?.logged_end_time || new Date(), currentUserTimeZone)
          .add(5, 'minutes')
          .format(),
        notes: appointmentDetails?.notes || '',
        reason: appointmentDetails?.reason || '',
      });
    }
  }, [appointmentDetails, isLoadingAppointment, reset]);

  const handleCompleteSession = handleSubmit(async () => {
    if (!appointmentId) {
      console.error('No appointment ID found');
      return;
    }

    try {
      const values = getValues();
      const { notes, start_time, end_time, reason } = values;
      await endSession({
        data: {
          note:
            notes && notes.trim()
              ? {
                  therapist_id: appointmentDetails?.therapist?.id,
                  client_id: appointmentDetails?.client?.id,
                  title: 'End Session Memo',
                  content: notes.trim(),
                }
              : undefined,
          ...(start_time ? { start_time: moment.tz(start_time, 'UTC').toDate() } : {}),
          ...(end_time ? { end_time: moment.tz(end_time, 'UTC').toDate() } : {}),
          ...(reason ? { reason } : {}),
        },
        id: appointmentId,
      });

      if (isErrorInEndingSession) return;
      invalidate(appointmentQueryKey.clientAppointments(appointmentDetails?.client?.id));

      setStepValue(2);
    } catch (error) {
      console.error('Error completing session:', error);
    }
  });

  const handleCancel = () => {
    // Navigate back to the previous page or dashboard
    navigate(ROUTES.MEETING_LEFT.navigatePath(location?.state?.roomId));
  };

  const iWillDoItLater = () => {
    navigate(ROUTES.THERAPIST_DASHBOARD.path);
  };

  useEffect(() => {
    if (appointmentDetails?.status == AppointmentStatus.COMPLETED) {
      setStepValue(2);
    }
  }, [appointmentDetails]);
  // Show loading state while fetching appointment details
  if (isLoadingAppointment) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading appointment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4 '>
      <div className='min-h-screen w-full bg-gray-100 flex items-center justify-center p-4'>
        <div className='bg-white rounded-20px shadow-lg w-full max-w-2xl mx-4'>
          {/* Header */}

          {stepValue == 1 ? (
            <div className='p-6 pb-4'>
              <h2 className='text-2xl font-bold text-gray-800 mb-4'>End Session Confirmation</h2>
              <p className='text-gray-600'>Do you want to modify session timings ?</p>
              <div className='grid grid-cols-2 gap-5 my-5'>
                <TimeSelect
                  control={control}
                  name='start_time'
                  error={errors?.start_time?.message}
                  key={`start_time-${appointmentDetails?.logged_start_time}`}
                  id='start_time'
                  label='Start Time'
                  timezone={timezone}
                  parentClassName='w-full'
                  placeholder='Select Start Time'
                  isClearable
                />
                <TimeSelect
                  control={control}
                  name='end_time'
                  error={errors?.end_time?.message}
                  key={`end_time-${appointmentDetails?.logged_end_time}`}
                  id='end_time'
                  label='End Time'
                  timezone={timezone}
                  parentClassName='w-full'
                  placeholder='Select End Time'
                  isClearable
                />
                <div className='col-span-2'>
                  <TextArea
                    label='Reason for changing time'
                    placeholder='Please provide the reason'
                    name='reason'
                    onChange={e =>
                      setValue('reason', e.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    value={getValues('reason')}
                    error={errors.reason?.message}
                  />
                </div>
              </div>
              {/* Description */}
              <p className='text-gray-600 text-[16px] leading-relaxed font-nunito'>
                Confirm the completion of this session. You can optionally leave a final session
                summary. Once confirmed, the appointment will be marked as completed.
              </p>
              <div className='mb-6 mt-6'>
                <TextArea
                  name='notes'
                  onChange={e => setValue('notes', e.target.value)}
                  placeholder='Type your memo here...'
                  className='w-full h-54 p-3 border border-gray-400 bg-[#F6F5F4] rounded-20px text-[16px] resize-none focus:outline-none '
                  register={register}
                />
              </div>
              {/* Appointment Details */}
            </div>
          ) : (
            <div className='p-6 pb-4 flex flex-col gap-6'>
              <div>
                <h2 className='text-2xl font-bold text-gray-800 mb-2'>AMD Clinical Notes</h2>
                <p className='text-gray-600'>
                  Review and complete any pending AMD notes for this appointment.
                </p>
              </div>
              {stepValue == 2 && (
                <UnsignedAmdForms
                  key={`${isModalOpen}`}
                  therapistId={appointmentDetails?.therapist_id}
                  appointmentId={appointmentId}
                  roomId={location?.state?.roomId}
                />
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex gap-3 w-full justify-end p-4'>
            {stepValue == 1 && (
              <Button
                title='Rejoin Session'
                parentClassName='w-full'
                variant='none'
                className='flex-1 w-full py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium'
                onClick={handleCancel}
                isDisabled={isSessionEnding}
              />
            )}
            {stepValue == 2 && (
              <div
                className=' underline  text-primary font-bold w-full flex justify-center items-center cursor-pointer'
                onClick={iWillDoItLater}
              >
                Go to Dashboard
              </div>
            )}

            <Button
              title={stepValue == 2 ? 'Assign form' : 'Complete Session'}
              parentClassName='w-full'
              variant='filled'
              className='flex-1 w-full py-2.5 px-4 bg-primary text-white rounded-lg  transition-colors duration-200 font-medium'
              isLoading={isSessionEnding}
              isDisabled={isSessionEnding}
              onClick={stepValue == 2 ? () => setIsModalOpen(true) : handleCompleteSession}
            />
          </div>
        </div>
      </div>
      {isModalOpen && (
        <AddAmdFormsModal
          clientId={appointmentDetails.client_id}
          isModalOpen={isModalOpen}
          appointment_id={appointmentId}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </div>
  );
};

export default EndSessionConfirmation;
