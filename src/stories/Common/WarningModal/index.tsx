import Modal, { type ModalSizeType } from '@/stories/Common/Modal';

import Button from '../Button';

type PropsType = {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  title?: string;
  size?: ModalSizeType;
  confirmButtonText?: string;
};

export const WarningModal = ({
  title = 'Warning',
  size = 'md',
  isOpen,
  onClose,
  message = '',
}: PropsType) => {
  if (!isOpen) return null;

  return (
    <Modal
      title={title}
      onClose={onClose}
      size={size}
      isOpen={isOpen}
      contentClassName='pt-30px'
      footerClassName='pt-30px border-t border-solid border-surface'
      footer={
        <div className='flex items-center gap-5'>
          <Button
            type='button'
            variant='filled'
            title='Okay'
            isIconFirst
            onClick={onClose}
            parentClassName='w-4/4'
            className='w-full rounded-10px !leading-5'
          />
        </div>
      }
    >
      <div className='flex flex-col gap-5 items-center'>
        <p className='text-center text-lg font-semibold'>{message}</p>
      </div>
    </Modal>
  );
};
