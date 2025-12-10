import clsx from 'clsx';

import Button from '@/stories/Common/Button';
import Modal, { type ModalSizeType } from '@/stories/Common/Modal';

type PropsType = {
  isOpen: boolean;
  alertMessage: string;
  onClose: () => void;
  title?: string;
  size?: ModalSizeType;
  cancelButton?: boolean;
  onSubmit?: () => void;
  isSubmitLoading?: boolean;
  confirmButtonText?: string;
  closeButton?: boolean;
  cancelButtonClassName?: string;
  confirmButtonClassName?: string;
  cancelButtonParentClassName?: string;
  confirmButtonParentClassName?: string;
};

export const AlertModal = ({
  title = 'Confirm Discard',
  size = 'md',
  isOpen,
  onClose,
  alertMessage = 'Are you sure?',
  cancelButton = true,
  onSubmit,
  isSubmitLoading = false,
  confirmButtonText = 'Confirm',
  closeButton = false,
  cancelButtonClassName,
  confirmButtonClassName,
  cancelButtonParentClassName,
  confirmButtonParentClassName,
}: PropsType) => {
  if (!isOpen) return null;

  return (
    <Modal
      title={title}
      onClose={onClose}
      size={size}
      isOpen={isOpen}
      closeButton={closeButton}
      contentClassName='pt-30px'
      footerClassName='pt-30px border-t border-solid border-surface'
      footer={
        <div className='flex items-center gap-5'>
          {cancelButton && (
            <Button
              type='button'
              variant='outline'
              title='Cancel'
              isIconFirst
              onClick={onClose}
              parentClassName={clsx('w-2/4', cancelButtonParentClassName)}
              className={clsx('w-full rounded-10px !leading-5', cancelButtonClassName)}
              isDisabled={isSubmitLoading}
            />
          )}
          <Button
            type='button'
            variant='filled'
            title={confirmButtonText}
            onClick={onSubmit}
            parentClassName={clsx('w-2/4', confirmButtonParentClassName)}
            className={clsx(
              'w-full border-red bg-red hover:bg-red/85 hover:border-red/85 rounded-10px !leading-5',
              confirmButtonClassName
            )}
            isDisabled={isSubmitLoading}
            isLoading={isSubmitLoading}
          />
        </div>
      }
    >
      <div className='flex flex-col gap-5 items-center'>
        <p className='text-center text-lg font-semibold whitespace-pre-line'>{alertMessage}</p>
      </div>
    </Modal>
  );
};
