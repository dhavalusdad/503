import type React from 'react';

import clsx from 'clsx';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import type { TherapistBasicDetails } from '@/api/types/therapist.dto';
import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import { getDashboardPath } from '@/helper';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Modal from '@/stories/Common/Modal';

export interface SuccessSlotRequestModalProps {
  isOpen?: boolean;
  onClose: () => void;
  closeButton: boolean;
  appointmentData?: {
    therapist?: string;
    appointmentDate?: string;
    appointmentTime?: string;
  };
  selectedTherapist?: TherapistBasicDetails;
  fromDashboard?: boolean;
  preferredTime?: Date;
}

const SuccessSlotRequestModal: React.FC<SuccessSlotRequestModalProps> = ({
  isOpen = false,
  onClose,
  selectedTherapist,
  fromDashboard = false,
  preferredTime = null,
}) => {
  const navigate = useNavigate();
  const { role } = useSelector(currentUser);
  const handleClose = () => {
    onClose();
    if (!fromDashboard) {
      navigate(ROUTES.BOOK_APPOINTMENT.path);
    }
  };

  return (
    <Modal
      size={'xs'}
      isOpen={isOpen}
      onClose={handleClose}
      closeButton={false}
      contentClassName='pt-30px'
      footerClassName={clsx('text-center', fromDashboard ? '!p-0' : '')}
      footer={
        <>
          {fromDashboard ? null : (
            <Button
              variant='filled'
              title='Go to Dashboard'
              className='rounded-10px !px-6 !font-bold'
              onClick={() => navigate(getDashboardPath(role as UserRole))}
            />
          )}
        </>
      }
    >
      <div className='flex flex-col items-center gap-2.5 relative'>
        <div onClick={handleClose} className='absolute top-0 right-0 cursor-pointer'>
          <Icon name='close' className='text-blackdark icon-wrapper w-30px h-30px' />
        </div>
        <Icon name='double-leaf' className='text-Green' />
        <h3 className='text-lg leading-6 font-bold text-blackdark'>Slot Request Sent!</h3>
        <div className='flex flex-col gap-3 items-center'>
          <p className='text-base font-semibold leading-5 text-blackdark'>
            <b>Therapist: </b>
            {fromDashboard ? (
              <span>
                {selectedTherapist?.user?.first_name} {selectedTherapist?.user?.last_name}
              </span>
            ) : (
              <span>
                {selectedTherapist?.first_name} {selectedTherapist?.last_name}
              </span>
            )}
          </p>
          {preferredTime && (
            <p className='text-base font-semibold leading-5 text-blackdark'>
              <>
                <b> Selected Time: </b>{' '}
                <span>{moment(preferredTime).format('YYYY-MM-DD HH:mm z')}</span>
              </>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SuccessSlotRequestModal;
