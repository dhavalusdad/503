import { useState } from 'react';

import SuccessAppointmentModal from '@/features/appointment/component/ClientAppointmentsBooking/SuccessAppointmentModal';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Modal from '@/stories/Common/Modal';

export interface ConfirmAppointmentModalProps {
  isOpen?: boolean;
  onClose: () => void;
  closeButton: boolean;
}

const ConfirmAppointmentModal: React.FC<ConfirmAppointmentModalProps> = ({
  isOpen = false,
  onClose,
  closeButton,
}) => {
  const [openSuccessAppointmentModal, setOpenSuccessAppointmentModal] = useState(false);
  const [hideConfirmModal, setHideConfirmModal] = useState(false);

  const toggleSuccessAppointmentModal = () => {
    setHideConfirmModal(true);
    setOpenSuccessAppointmentModal(!openSuccessAppointmentModal);
  };
  const handleCloseSuccessModal = () => {
    setOpenSuccessAppointmentModal(false);
    onClose();
    setHideConfirmModal(false);
  };

  return (
    <>
      <Modal
        title={'Confirm Appointment'}
        className={''}
        parentClassName={''}
        size={'sm'}
        isOpen={isOpen && !hideConfirmModal}
        onClose={onClose}
        closeButton={closeButton}
        footer={
          <Button
            variant='filled'
            title='Confirm Appointment'
            className='w-full rounded-10px px-6 !font-bold'
            onClick={toggleSuccessAppointmentModal}
          />
        }
      >
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col gap-1.5'>
            <span className='text-base font-normal leading-22px text-blackdark'>Therapist</span>
            <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
              <span className='text-base font-normal leading-22px text-primarygray'>
                Dr. Harold Bryant
              </span>
            </div>
          </div>
          <div className='flex items-center gap-5'>
            <div className='flex flex-col gap-1.5 w-2/4'>
              <span className='text-base font-normal leading-22px text-blackdark'>
                Appointment Date
              </span>
              <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
                <span className='text-base font-normal leading-22px text-primarygray'>
                  05/20/2025
                </span>
              </div>
            </div>
            <div className='flex flex-col gap-1.5 w-2/4'>
              <span className='text-base font-normal leading-22px text-blackdark'>
                Appointment Time
              </span>
              <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
                <span className='text-base font-normal leading-22px text-primarygray'>
                  10:00 AM
                </span>
              </div>
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
            <span className='text-base font-normal leading-22px text-blackdark'>Session Type</span>
            <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
              <span className='text-base font-normal leading-22px text-primarygray'>
                Video Session
              </span>
            </div>
          </div>
          <div className='flex flex-col gap-1.5'>
            <span className='text-base font-normal leading-22px text-blackdark'>Payment</span>
            <div className='border border-solid border-surface rounded-10px py-3 px-3.5 bg-Gray'>
              <span className='text-base font-normal leading-22px text-primarygray'>Self Pay</span>
            </div>
          </div>
          <div className='flex items-center gap-2.5 py-1.5 px-3.5 rounded-md bg-yellow'>
            <Icon name='announcement' className='text-blackdark' />
            <span className='text-sm font-medium leading-18px text-blackdark'>
              You'll get a reminder notification 15 minutes prior your appointment is scheduled to
              begin.
            </span>
          </div>
        </div>
      </Modal>
      {openSuccessAppointmentModal && (
        <SuccessAppointmentModal
          isOpen={openSuccessAppointmentModal}
          onClose={handleCloseSuccessModal}
          closeButton={true}
        />
      )}
    </>
  );
};

export default ConfirmAppointmentModal;
