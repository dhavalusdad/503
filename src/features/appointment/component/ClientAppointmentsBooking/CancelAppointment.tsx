import { useState } from 'react';

import moment from 'moment-timezone';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import {
  useGetAppointmentDetailsExternalAccess,
  useCancelAppointmentExternalAccess,
} from '@/api/appointment';
import { ROUTES } from '@/constants/routePath';
import { AppointmentStatus } from '@/enums';
import { normalizeText } from '@/helper';
import Button from '@/stories/Common/Button';

const DEFAULT_TZ = 'America/Los_Angeles';

const CancelAppointment = () => {
  const { appointmentId = '' } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const { data: appointment, isLoading } = useGetAppointmentDetailsExternalAccess(
    appointmentId,
    tokenFromUrl
  );

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { mutateAsync: cancelAppointment, isPending } = useCancelAppointmentExternalAccess({
    onSuccess: () => {
      setSuccessMessage('Your appointment has been successfully cancelled.');
    },
  });

  const handleCancel = async () => {
    if (!appointment) return;
    await cancelAppointment({
      id: appointmentId,
      token: tokenFromUrl,
      cancellationScope: 'single',
      reason: 'Standard Cancellation',
    });
  };

  // Format times using default timezone
  const start = appointment?.slot?.start_time
    ? moment.utc(appointment.slot.start_time).tz(DEFAULT_TZ)
    : null;

  const formattedDate = start ? start.format('MMM DD, YYYY') : 'Not available';
  const formattedStartTime = start ? start.format('hh:mm A') : 'N/A';

  // Already cancelled
  if (appointment?.status == AppointmentStatus.CANCELLED) {
    return (
      <div className='flex flex-col items-center justify-center gap-6 h-screen px-4 text-center'>
        <h4 className='text-28px font-bold text-blackdark'>
          This appointment is already cancelled.
        </h4>
        <p className='text-gray-600'>
          If you wish to book a new appointment, please log in to your account.
        </p>
        <Button
          variant='filled'
          type='button'
          title='Log In'
          onClick={() => navigate(ROUTES.LOGIN.path)}
          parentClassName='w-full max-w-xs'
          className='w-full rounded-10px !font-bold !leading-5'
        />
      </div>
    );
  }

  // Success message
  if (successMessage) {
    return (
      <div className='flex flex-col items-center justify-center gap-6 h-screen px-4 text-center'>
        <h4 className='text-28px font-bold text-blackdark'>{successMessage}</h4>
        <p className='text-gray-600'>You can log in to your account to book another appointment.</p>
        <Button
          variant='filled'
          type='button'
          title='Log In'
          onClick={() => navigate(ROUTES.LOGIN.path)}
          parentClassName='w-full max-w-xs'
          className='w-full rounded-10px !font-bold !leading-5'
        />
      </div>
    );
  }

  // Token invalid
  if (appointment?.isTokenInvalid) {
    return (
      <div className='flex flex-col items-center justify-center gap-10 h-screen px-4 text-center'>
        <h4 className='text-28px font-bold text-blackdark'>
          This link has expired or is no longer valid.
        </h4>
        <p>Please log in to manage your appointments.</p>
        <Button
          variant='filled'
          type='button'
          title='Go to login page'
          onClick={() => navigate(ROUTES.LOGIN.path)}
          parentClassName='w-full max-w-xs'
          className='w-full rounded-10px !font-bold !leading-5'
        />
      </div>
    );
  }

  if (isLoading || !appointment) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <p>Loading appointment details...</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen px-4'>
      <div className='w-full max-w-xl bg-white border border-surface rounded-20px p-6 text-center'>
        <h2 className='text-28px font-bold text-blackdark mb-4'>Cancel Appointment</h2>

        <p className='text-primarygray text-base mb-6'>Do you want to cancel this appointment?</p>

        {/* Appointment Details */}
        <div className='bg-surface rounded-10px p-4 text-left mb-6'>
          <h3 className='text-base font-semibold mb-3'>Appointment Details:</h3>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-primarygray'>
            <div className='flex gap-1'>
              <span className='font-semibold text-blackdark'>Date:</span>
              <span>{formattedDate}</span>
            </div>

            <div className='flex gap-1'>
              <span className='font-semibold text-blackdark'>Time:</span>
              <span>{formattedStartTime}</span>
            </div>

            <div className='flex gap-1'>
              <span className='font-semibold text-blackdark'>Therapist name:</span>
              <span>
                {appointment.therapist?.user?.first_name} {appointment.therapist?.user?.last_name}
              </span>
            </div>

            <div className='flex gap-1'>
              <span className='font-semibold text-blackdark'>Therapy type:</span>
              <span>{appointment.therapy_type?.name || 'Not specified'}</span>
            </div>

            <div className='flex gap-1'>
              <span className='font-semibold text-blackdark'>Session type:</span>
              <span>{appointment.session_type || 'Not specified'}</span>
            </div>

            <div className='flex gap-1 sm:col-span-2'>
              <span className='font-semibold text-blackdark'>Appointment type:</span>
              <span>
                {appointment?.amd_appointment_types
                  ?.map((t: { name: string }) => normalizeText(t.name))
                  .join(', ') || 'Not specified'}
              </span>
            </div>
          </div>
        </div>

        {/* Note */}
        <p className='text-sm text-primarygray mb-8'>
          <strong>Note:</strong> Cancellation of the appointment cannot be undone. However, if you
          want to book a new appointment, you can log into your account and book one.
        </p>

        {/* Action Buttons */}
        <div className='flex items-center justify-center gap-4'>
          <Button
            variant='outline'
            title='Keep Appointment'
            onClick={() => navigate(ROUTES.LOGIN.path)}
            className='rounded-10px px-6'
          />

          <Button
            variant='filled'
            title='Cancel Appointment'
            onClick={handleCancel}
            isLoading={isPending}
            className='rounded-10px px-6 !bg-red-500 hover:!bg-red-600'
          />
        </div>
      </div>
    </div>
  );
};

export default CancelAppointment;
