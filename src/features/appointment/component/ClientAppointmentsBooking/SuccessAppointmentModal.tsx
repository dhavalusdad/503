import type React from 'react';

import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import { getDashboardPath } from '@/helper';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Modal from '@/stories/Common/Modal';

export interface SuccessAppointmentModalProps {
  isOpen?: boolean;
  onClose: () => void;
  closeButton: boolean;
  appointmentData?: {
    therapist?: string;
    appointmentDate?: string;
    appointmentTime?: string;
  };
}

const SuccessAppointmentModal: React.FC<SuccessAppointmentModalProps> = ({
  isOpen = false,
  onClose,
  appointmentData = {},
}) => {
  const navigate = useNavigate();
  const { role } = useSelector(currentUser);
  const handleClose = () => {
    onClose();
    navigate(ROUTES.APPOINTMENT.path);
  };

  return (
    // updated modal
    <Modal
      className={''}
      parentClassName={''}
      size={'xs'}
      isOpen={isOpen}
      onClose={handleClose}
      closeButton={false}
      footerClassName='text-center'
      contentClassName='pt-30px'
      footer={
        <Button
          variant='filled'
          title='Go to Dashboard'
          className='rounded-10px px-6 py-2.5 !font-bold'
          onClick={() => navigate(getDashboardPath(role as UserRole))}
        />
      }
    >
      <div className='flex flex-col items-center gap-2.5 relative'>
        <div onClick={handleClose} className='absolute top-0 right-0 cursor-pointer'>
          <Icon name='close' className='text-blackdark icon-wrapper w-30px h-30px' />
        </div>
        <div className='relative mb-7'>
          <Icon name='tickcircle' className='text-Green' />
        </div>
        <h3 className='text-xl leading-7 font-bold text-blackdark mb-18px'>
          Appointment Confirmed!
        </h3>
        <div className='flex flex-col gap-3 items-center'>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-2'>
              <Icon name='calendar' className='text-primary' />
              <p className='text-base font-medium leading-22px text-blackdark'>
                {appointmentData.appointmentDate || 'Apr 30, 2025'}
              </p>
            </div>
            <div className='bg-primarylight w-1px h-18px'></div>
            <div className='flex items-center gap-2'>
              <Icon name='todotimer' className='text-primary' />
              <p className='text-base font-medium leading-22px text-blackdark'>
                {appointmentData.appointmentTime || '2:30 PM'}
              </p>
            </div>
          </div>
          <p className='text-base font-semibold leading-22px text-blackdark'>
            <b>Therapist:</b> <span>{appointmentData.therapist || 'Dr. Jane Smith'}</span>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessAppointmentModal;
