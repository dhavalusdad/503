import { useUpdateQueueRequest } from '@/api/queueManagement';
import { formatStatusLabel } from '@/helper';
import Button from '@/stories/Common/Button';
import Modal from '@/stories/Common/Modal';

import { UpdateQueueRequestDataType } from '../constant';

interface StaffMemberConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  queueId: string;
  staffMemberId: string;
}

const StaffMemberConfirmationModal = ({
  isOpen,
  onClose,
  queueId,
  staffMemberId,
}: StaffMemberConfirmationModalProps) => {
  const { mutate: updateQueue } = useUpdateQueueRequest();

  const onSubmit = async () => {
    try {
      const formData = new FormData();

      formData.append('assigned_to_id', staffMemberId);
      formData.append('type', UpdateQueueRequestDataType.ASSIGNEE);

      await updateQueue({
        data: formData,
        id: queueId,
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
    } finally {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      id='appointment-edit-modal'
      title={`${formatStatusLabel(status)} Request`}
      size='sm'
      closeButton={false}
      contentClassName='pt-30px'
      footer={
        <div className='flex items-center justify-end gap-5'>
          <Button
            variant='outline'
            title='Cancel'
            onClick={onClose}
            className='rounded-10px !leading-5 !px-6'
          />
          <Button
            variant='filled'
            title='Confirm'
            onClick={() => onSubmit()}
            className='rounded-10px !leading-5 !px-6'
          />
        </div>
      }
    >
      <h3 className='font-semibold text-xl leading-7 text-blackdark'>
        Are you sure you want to assign this request?
      </h3>
    </Modal>
  );
};

export default StaffMemberConfirmationModal;
