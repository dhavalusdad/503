import { useSelector } from 'react-redux';

import { isAdminPanelRole } from '@/helper';
import { userRole } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Modal from '@/stories/Common/Modal';

export interface ConfirmAppointmentModalProps {
  isOpen?: boolean;
  onClose: () => void;
  closeButton: boolean;
  patientName?: string;
  showBookingConflict?: boolean;
  appointmentData?: {
    therapist?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    therapyType?: string;
    sessionType?: string;
    clinicAddress?: string;
    payment?: string;
  };
  onConfirm?: () => void;
  isLoading?: boolean;
}

const ConfirmAppointmentModal: React.FC<ConfirmAppointmentModalProps> = ({
  isOpen = false,
  onClose,
  closeButton,
  appointmentData = {},
  onConfirm,
  patientName,
  showBookingConflict = false, // Default to false
  isLoading = false,
}) => {
  const role = useSelector(userRole);
  const toggleSuccessAppointmentModal = () => {
    if (onConfirm) {
      onConfirm();
    }
  };
  return (
    <>
      {/* // updated modal  */}
      <Modal
        title={'Confirm Appointment'}
        className={''}
        parentClassName={''}
        size={'sm'}
        isOpen={isOpen}
        onClose={onClose}
        closeButton={closeButton}
        contentClassName='pt-30px'
        footer={
          <Button
            variant='filled'
            title={isLoading ? 'Booking...' : 'Confirm Appointment'}
            className='w-full rounded-10px px-6 !font-bold'
            isLoading={isLoading}
            isDisabled={isLoading}
            onClick={toggleSuccessAppointmentModal}
          />
        }
      >
        <div className='flex flex-col gap-6'>
          <div className='flex md:flex-row flex-col items-center gap-5'>
            <div className='flex flex-col gap-1.5 w-full'>
              <span className='text-base font-normal leading-22px text-blackdark'>Therapist</span>
              <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
                <span className='text-base font-normal leading-22px text-primarygray'>
                  {appointmentData.therapist || 'Dr. Harold Bryant'}
                </span>
              </div>
            </div>
            {isAdminPanelRole(role) && (
              <div className='flex flex-col gap-1.5 w-full'>
                <span className='text-base font-normal leading-22px text-blackdark'>Client</span>
                <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
                  <span className='text-base font-normal leading-22px text-primarygray'>
                    {patientName || '-'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className='flex md:flex-row flex-col items-center gap-5'>
            <div className='flex flex-col gap-1.5 md:w-2/4 w-full'>
              <span className='text-base font-normal leading-22px text-blackdark'>
                Appointment Date
              </span>
              <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
                <span className='text-base font-normal leading-22px text-primarygray'>
                  {appointmentData.appointmentDate}
                </span>
              </div>
            </div>
            <div className='flex flex-col gap-1.5 md:w-2/4 w-full'>
              <span className='text-base font-normal leading-22px text-blackdark'>
                Appointment Time
              </span>
              <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
                <span className='text-base font-normal leading-22px text-primarygray'>
                  {appointmentData.appointmentTime}
                </span>
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-1.5'>
            <span className='text-base font-normal leading-22px text-blackdark'>Therapy Type</span>
            <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
              <span className='text-base font-normal leading-22px text-primarygray'>
                {appointmentData.therapyType || 'Individual Therapy'}
              </span>
            </div>
          </div>
          {appointmentData.clinicAddress && (
            <div className='flex flex-col gap-1.5'>
              <span className='text-base font-normal leading-22px text-blackdark'>
                Clinic Address
              </span>
              <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
                <span className='text-base font-normal leading-22px text-primarygray'>
                  {appointmentData.clinicAddress}
                </span>
              </div>
            </div>
          )}
          <div className='flex flex-col gap-1.5'>
            <span className='text-base font-normal leading-22px text-blackdark'>Session Type</span>
            <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
              <span className='text-base font-normal leading-22px text-primarygray'>
                {appointmentData.sessionType || 'Video Session'}
              </span>
            </div>
          </div>
          <div className='flex flex-col gap-1.5'>
            <span className='text-base font-normal leading-22px text-blackdark'>Payment</span>
            <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
              <span className='text-base font-normal leading-22px text-primarygray'>
                {appointmentData.payment || 'Self Pay'}
              </span>
            </div>
          </div>
          <div className='flex items-center gap-2.5 py-1.5 px-3.5 rounded-md bg-yellow'>
            <Icon name='announcement' className='text-blackdark' />
            <span className='text-sm font-medium leading-18px text-blackdark'>
              {isAdminPanelRole(role)
                ? `${patientName} will get a reminder notification 15 minutes prior to the scheduled appointment.`
                : `You'll get a reminder notification 15 minutes prior to your scheduled appointment.`}
            </span>
          </div>
          {showBookingConflict && (
            <div className='flex items-center gap-2.5 py-1.5 px-3.5 rounded-md justify-center'>
              <span className='text-red-600 font-medium leading-18px text-blackdark'>
                {`Appointment cannot be booked. ${isAdminPanelRole(role) ? patientName : 'You'} already have an appointment scheduled with another
                therapist at this time.`}
              </span>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ConfirmAppointmentModal;
