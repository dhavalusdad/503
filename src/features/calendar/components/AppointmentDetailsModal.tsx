import clsx from 'clsx';
import moment from 'moment';

import { useGetAppointmentDetails } from '@/api/appointment';
import defaultUserPng from '@/assets/images/default-user.webp';
import { SessionType } from '@/enums';
import { Button } from '@/stories/Common/Button';
import { Icon } from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import { Modal, type ModalProps } from '@/stories/Common/Modal';
const SERVER_URL = import.meta.env.VITE_BASE_URL;

const AppointmentDetailsModal = ({
  isOpen,
  onClose,
  appointmentId,
  isPast = false,
}: ModalProps & { appointmentId: string; isPast: boolean }) => {
  const { data: appointmentDetails } = useGetAppointmentDetails(appointmentId);

  const formatSchedule = (startTime: string, endTime: string) => {
    const timezone = appointmentDetails?.therapist?.user?.user_settings[0]?.timezone;
    const start = moment.tz(startTime, timezone);
    const end = moment.tz(endTime, timezone);
    const dayName = start.format('dddd');
    const date = start.format('D MMMM YYYY');
    const startTimeFormatted = start.format('h:mm A');
    const endTimeFormatted = end.format('h:mm A');

    return `${dayName}, ${date}, ${startTimeFormatted} to ${endTimeFormatted}`;
  };

  const handleStartSession = () => {
    // Handle start session logic
    // console.log('Starting session for appointment:', appointmentId);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Appointment Details'
      size='sm'
      contentClassName='pt-30px'
      footerClassName={clsx(isPast ? '!p-0' : '')}
      footer={
        <>
          {/* Action Button */}
          {!isPast && (
            <div className='flex justify-end'>
              <Button
                variant='filled'
                onClick={handleStartSession}
                className='bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg'
                isDisabled={true}
                title=' Start Session'
              />
            </div>
          )}
        </>
      }
    >
      <div className='flex flex-col gap-5'>
        {/* Client Information Section */}
        <div className='border-b border-solid border-surface pb-5'>
          <h3 className='text-base font-bold text-blackdark uppercase mb-5'>CLIENT INFORMATION</h3>
          <div className='flex items-center gap-3'>
            <Image
              imgPath={
                appointmentDetails?.client?.user?.profile_image
                  ? `${SERVER_URL}${appointmentDetails?.client?.user?.profile_image}`
                  : appointmentDetails?.client?.user?.first_name &&
                      appointmentDetails?.client?.user?.last_name
                    ? ''
                    : defaultUserPng
              }
              firstName={appointmentDetails?.client?.user?.first_name}
              lastName={appointmentDetails?.client?.user?.last_name}
              alt='User Avatar'
              imageClassName='rounded-full object-cover object-center w-full h-full'
              className='w-14 h-14 bg-surface rounded-full flex items-center justify-center'
              initialClassName='!text-base'
            />
            <div className='flex-1 flex flex-col gap-1.5'>
              <h4 className='text-base font-bold text-blackdark leading-5'>
                {`${appointmentDetails?.client?.user?.first_name} `}
                {appointmentDetails?.client?.user?.last_name}
              </h4>
              <div className='flex items-center gap-2'>
                {appointmentDetails?.client?.phone && (
                  <>
                    <Icon name='phone' className='w-4 h-4 icon-wrapper text-primarygray' />
                    <span className='text-sm text-primarygray font-semibold leading-18px'>
                      {appointmentDetails?.client?.phone}
                    </span>
                  </>
                )}
                {appointmentDetails?.client?.user?.email && (
                  <>
                    <Icon name='mail' className='w-4 h-4 icon-wrapper text-primarygray' />
                    <span className='text-sm text-primarygray font-semibold leading-18px'>
                      {appointmentDetails?.client?.user?.email}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Details Section */}
        <div className='flex flex-col gap-5'>
          <h3 className='text-base font-bold text-blackdark uppercase'>APPOINTMENT DETAILS</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            <div className='flex flex-col gap-1.5'>
              <h6 className='text-base font-semibold leading-5 text-blackdark'>Schedule On</h6>
              <p className='text-sm font-normal leading-5 text-primarygray'>
                {formatSchedule(
                  appointmentDetails?.slot?.start_time,
                  appointmentDetails?.slot?.end_time
                )}
              </p>
            </div>
            <div className='flex flex-col gap-1.5'>
              <h6 className='text-base font-semibold leading-5 text-blackdark'>Area of Focus</h6>
              <p className='text-sm font-normal leading-5 text-primarygray'>
                {appointmentDetails?.appointment_area_of_focus
                  ?.map((area: { area_of_focus: { name: string } }) => area.area_of_focus.name)
                  .join(', ')}
              </p>
            </div>
            <div className='flex flex-col gap-1.5'>
              <h6 className='text-base font-semibold leading-5 text-blackdark'>Therapy Type</h6>
              <p className='text-sm font-normal leading-5 text-primarygray'>
                {appointmentDetails?.therapy_type?.name}
              </p>
            </div>
            <div className='flex flex-col gap-1.5'>
              <h6 className='text-base font-semibold leading-5 text-blackdark'>Session Type</h6>
              <p className='text-sm font-normal leading-5 text-primarygray'>
                {appointmentDetails?.session_type}
              </p>
            </div>
            {appointmentDetails?.session_type === SessionType.CLINIC && (
              <div className='flex flex-col gap-1.5 col-span-2'>
                <h6 className='text-base font-semibold leading-5 text-blackdark'>Clinic Address</h6>
                <p className='text-sm font-normal leading-5 text-primarygray'>
                  {`${appointmentDetails?.clinic_address?.name} - ${[appointmentDetails?.clinic_address?.address, appointmentDetails?.clinic_address?.city?.name, appointmentDetails?.clinic_address?.state?.name].filter(Boolean).join(', ')}`}
                </p>
              </div>
            )}
          </div>
          {/* Reason for Visit Section */}
          <div className='flex flex-col gap-1.5 col-span-2'>
            <h6 className='text-base font-semibold leading-5 text-blackdark'>Reason for Visit</h6>
            <p className='text-sm font-normal leading-5 text-primarygray'>
              {appointmentDetails?.appointment_reason || 'No reason for visit'}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AppointmentDetailsModal;
