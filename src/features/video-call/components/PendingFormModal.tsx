import { type Dispatch, type SetStateAction } from 'react';

import { PendingTask } from '@/features/video-call/components/PendingTaskList';
import Modal from '@/stories/Common/Modal';

const PendingTaskModal = ({
  userId,
  appointmentId,
  setShowModal,
  showModal,
  setPendingCount,
  tenant_id,
  role,
}: {
  userId: string;
  appointmentId: string;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  showModal: boolean;
  setPendingCount: Dispatch<SetStateAction<number>>;
  tenant_id: string;
  role?: string;
}) => {
  const handleData = (pendingCount: number) => {
    setShowModal(pendingCount > 0);
    setPendingCount?.(pendingCount);
  };
  return (
    <>
      <Modal
        isOpen={showModal}
        title='Pending Task'
        onClose={() => setShowModal(false)}
        contentClassName='!p-5'
        parentTitleClassName='!p-5'
        className='overflow-hidden'
        size='lg'
      >
        <PendingTask
          tenant_id={tenant_id}
          appointmentId={appointmentId}
          handleData={handleData}
          userId={userId}
          role={role}
        />
      </Modal>
    </>
  );
};

export default PendingTaskModal;
