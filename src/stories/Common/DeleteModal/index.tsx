import Button from '@/stories/Common/Button';
import Modal, { type ModalSizeType } from '@/stories/Common/Modal';

type PropsType = {
  isOpen: boolean;
  message: string;
  titlemessage?: string;
  onClose: () => void;
  title?: string;
  size?: ModalSizeType;
  cancelButton?: boolean;
  onSubmit?: () => void;
  isSubmitLoading?: boolean;
  confirmButtonText?: string;
  closeButton?: boolean;
};

export const DeleteModal = ({
  size = 'md',
  isOpen,
  onClose,
  message = '',
  cancelButton = true,
  onSubmit,
  isSubmitLoading = false,
  confirmButtonText = 'Confirm',
  closeButton = false,
  title,
}: PropsType) => {
  if (!isOpen) return null;

  return (
    //  updated modal
    <Modal
      title=''
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
              parentClassName='w-2/4'
              className='w-full rounded-10px !leading-5'
              isDisabled={isSubmitLoading}
            />
          )}
          <Button
            type='button'
            variant='filled'
            title={confirmButtonText}
            onClick={onSubmit}
            parentClassName='w-2/4'
            className='w-full border-red bg-red hover:bg-red/85 hover:border-red/85 rounded-10px !leading-5'
            isDisabled={isSubmitLoading}
            isLoading={isSubmitLoading}
          />
        </div>
      }
    >
      <div className='flex flex-col gap-2.5'>
        {title && <h4 className='text-2xl font-bold text-blacldark'>{title}</h4>}
        <p className='text-lg font-semibold'>{message}</p>
      </div>
    </Modal>
  );
};
