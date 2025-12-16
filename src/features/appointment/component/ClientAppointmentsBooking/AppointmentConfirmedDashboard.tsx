import type React from 'react';
import type { SyntheticEvent } from 'react';

import clsx from 'clsx';
import moment from 'moment-timezone';
import { useSelector } from 'react-redux';

import type { TherapistBasicDetails } from '@/api/types/therapist.dto';
import type {
  AppointmentBookedResponse,
  AppointmentDateTimeProps,
} from '@/features/appointment/component/ClientAppointmentsBooking/types';
import { redirectTo } from '@/helper/redirect';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Modal from '@/stories/Common/Modal';

export interface SuccessAppointmentModalProps {
  isOpen?: boolean;
  onClose: () => void;
  closeButton: boolean;
  appointmentData?: (AppointmentDateTimeProps & { therapyType?: string }) | undefined;
  clientDetails?: {
    first_name?: string;
    last_name: string;
  };
  selectedTherapist?: TherapistBasicDetails;
  appointmentResponse?: { data: AppointmentBookedResponse };
}

const AppointmentConfirmedDashboard: React.FC<SuccessAppointmentModalProps> = ({
  isOpen = false,
  onClose,
  appointmentData,
  selectedTherapist,
  clientDetails,
  appointmentResponse,
}) => {
  const handleClose = () => {
    onClose();
  };
  const { timezone, id: loggedInUserId } = useSelector(currentUser);
  const userCurrentTimeZone = loggedInUserId ? timezone : moment.tz.guess();
  const isUserExisting = appointmentResponse?.data?.user?.is_existing_user;
  const isPasswordSet = appointmentResponse?.data?.user?.is_password_set;

  const handleSetPassword = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!appointmentResponse?.data?.loginUrl?.loginUrl) return;
    redirectTo(appointmentResponse.data.loginUrl.loginUrl, { isNewTab: true });
  };

  return (
    // updated modal // design need
    <Modal
      size='lg'
      isOpen={isOpen}
      onClose={handleClose}
      closeButton={true}
      footerClassName='text-center'
      title='Appointment Details'
      contentClassName='' // 👈 unified padding
      className='overflow-hidden'
    >
      <div className='flex flex-col items-center gap-4 relative'>
        {/* <div onClick={handleClose} className='absolute top-4 right-4 cursor-pointer'>
          <Icon name='close' className='text-blackdark w-7 h-7' />
        </div> */}

        <div className='mb-4'>
          <Icon name='double-leaf' className='text-Green' />
        </div>

        <h3 className='text-xl font-bold text-blackdark text-center'>
          Your Appointment is Confirmed!
        </h3>
        <h4 className='text-center'>
          {clientDetails?.first_name} {clientDetails?.last_name} your session has been booked
          successfully.
        </h4>

        <div className='flex flex-col gap-3 items-center border rounded-10px border-surface w-full p-5 bg-Gray'>
          <p className='font-semibold text-xl'>-: Appointment Information :-</p>
          <div className='flex flex-wrap justify-center gap-3'>
            <div className='flex items-center gap-2'>
              <Icon name='therapist' className='text-primary' />
              <span>
                Dr.
                {selectedTherapist?.user?.first_name} {selectedTherapist?.user?.last_name}
              </span>
            </div>
            <div className='bg-primarylight w-px h-5' />
            <div className='flex items-center gap-2'>
              <Icon name='calendar' className='text-primary' />
              <span>
                {moment
                  .tz(appointmentData?.selectedDate, userCurrentTimeZone)
                  .format('DD MMM YYYY')}
                , {appointmentData?.selectedTime?.time || '-'}
              </span>
            </div>
            <div className='bg-primarylight w-px h-5' />
            <div>
              <b>Therapy Type:</b> {selectedTherapist?.session_types[0]?.session_type || ''}
            </div>
          </div>
        </div>

        <hr className='w-full border-t border-surface my-4' />

        {(!isUserExisting || !isPasswordSet) && (
          <>
            <div className='w-full text-center'>
              <div className='flex justify-center items-center gap-2 mb-5'>
                <Icon name='key' className='text-primary' />
                <p className='font-semibold text-lg'>Let's get you Set Up.</p>
              </div>
              <p className='text-center text-base text-blackdark'>
                To access your dashboard, manage appointments, complete forms, and update insurance
                details, you'll need to set a password.
              </p>
            </div>

            <Button
              variant='filled'
              title='Set Password & Complete Profile'
              className='rounded-10px w-full font-bold'
              parentClassName='w-full'
              onClick={handleSetPassword}
            />
            <Button
              variant='outline'
              title="I'll do it later"
              className='rounded-10px w-full font-bold'
              onClick={onClose}
              parentClassName='w-full'
            />
            <p className='text-center'>
              You’ll receive a link via email to complete setup anytime.
            </p>
          </>
        )}

        <div className={clsx('w-full', { 'mt-5': !isUserExisting })}>
          <div className='flex justify-center items-center gap-2 mb-5'>
            <Icon name='checkedFilled' className='text-primary' />
            <p className='font-semibold text-lg'>What to Expect Next</p>
          </div>
          <div className='bg-Gray border border-solid border-surface p-5 rounded-20px'>
            <ul className='flex flex-col gap-3'>
              <li className='flex items-start gap-2'>
                <Icon name='checked' color='#43573C' className='text-primary mt-1' />
                <span>You'll get a reminder before your session.</span>
              </li>
              <li className='flex items-start gap-2'>
                <Icon name='checked' color='#43573C' className='text-primary mt-1' />
                <span>Make sure to complete any intake forms, sent to you.</span>
              </li>
              <li className='flex items-start gap-2'>
                <Icon name='checked' color='#43573C' className='text-primary mt-1' />
                <span>Upload insurance (if applicable) and confirm your contact details.</span>
              </li>
              <li className='flex items-start gap-2'>
                <Icon name='checked' color='#43573C' className='text-primary mt-1' />
                <span>Sessions are HIPAA-secure and conducted via video.</span>
              </li>
              <li className='flex items-start gap-2'>
                <Icon name='checked' color='#43573C' className='text-primary mt-1' />
                <span>If you need to cancel, please do so at least 24 hours in advance.</span>
              </li>
              <li className='flex items-start gap-2'>
                <Icon name='checked' color='#43573C' className='text-primary mt-1' />
                <span>
                  After the session, you'll have access to memo and follow-up options in your
                  dashboard.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Help */}
        <p className='text-center text-base text-blackdark'>
          Need help? Contact us at{' '}
          <a href='#' className='text-primary underline font-semibold'>
            support@cytipsych.com
          </a>{' '}
          or{' '}
          <a href='#' className='text-primary underline font-semibold'>
            call 866-478-3878
          </a>
          .
        </p>
      </div>
    </Modal>
  );
};

export default AppointmentConfirmedDashboard;
