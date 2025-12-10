import { AppointmentStatus } from '@/enums';
import { AppointmentStatusBadge } from '@/features/appointment/component/AppointmentStatusBadge';
import Modal from '@/stories/Common/Modal';

export interface AppointmentDetailsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  closeButton: boolean;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen = false,
  onClose,
  closeButton,
}) => {
  return (
    <Modal
      title={'Appointment Detail'}
      className={''}
      parentClassName={''}
      size={'sm'}
      isOpen={isOpen}
      onClose={onClose}
      closeButton={closeButton}
    >
      <div className='grid grid-cols-2 gap-5'>
        <div className='flex flex-col gap-1.5'>
          <span className='text-base font-normal leading-22px text-blackdark'>Patient Name</span>
          <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
            <span className='text-base font-normal leading-22px text-primarygray'>
              Lloyd Howell
            </span>
          </div>
        </div>
        <div className='flex flex-col gap-1.5'>
          <span className='text-base font-normal leading-22px text-blackdark'>Therapy Type</span>
          <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
            <span className='text-base font-normal leading-22px text-primarygray'>
              Individual Therapy
            </span>
          </div>
        </div>
        <div className='flex flex-col gap-1.5'>
          <span className='text-base font-normal leading-22px text-blackdark'>Therapist</span>
          <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
            <span className='text-base font-normal leading-22px text-primarygray'>
              Dr. Harold Bryant
            </span>
          </div>
        </div>
        <div className='flex flex-col gap-1.5'>
          <span className='text-base font-normal leading-22px text-blackdark'>
            Appointment Date
          </span>
          <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
            <span className='text-base font-normal leading-22px text-primarygray'>05/20/2025</span>
          </div>
        </div>
        <div className='flex flex-col gap-1.5'>
          <span className='text-base font-normal leading-22px text-blackdark'>
            Appointment Time
          </span>
          <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
            <span className='text-base font-normal leading-22px text-primarygray'>10:00 AM</span>
          </div>
        </div>
        <div className='flex flex-col gap-1.5'>
          <span className='text-base font-normal leading-22px text-blackdark'>Status</span>
          <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
            <span className='text-base font-normal leading-22px text-primarygray'>
              <AppointmentStatusBadge
                status={AppointmentStatus.COMPLETED}
                type='appointment_status'
              />
            </span>
          </div>
        </div>
        <div className='flex flex-col gap-1.5 col-span-2'>
          <span className='text-base font-normal leading-22px text-blackdark'>
            Select Session Type
          </span>
          <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
            <span className='text-base font-normal leading-22px text-primarygray'>
              Video Session
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AppointmentDetailsModal;
