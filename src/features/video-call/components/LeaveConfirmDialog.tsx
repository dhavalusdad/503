import { useState, useEffect } from 'react';

import { useVideoCall } from '@/features/video-call/store/useVideoCall';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Modal from '@/stories/Common/Modal';

interface LeaveConfirmDialogProps {
  open: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LeaveConfirmDialog({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: LeaveConfirmDialogProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { identity } = useVideoCall();

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!isVisible) return null;

  return (
    // updated modal
    <Modal
      isOpen={isAnimating}
      onClose={onClose}
      size='xs'
      closeButton={false}
      footer={
        <div className='flex justify-end items-center gap-5'>
          <Button
            title='Cancel'
            variant='outline'
            onClick={onClose}
            className='px-6 rounded-lg'
            isDisabled={isLoading}
          />

          <Button
            title={identity.includes('TP') ? 'End Call' : 'Leave Call'}
            variant='filled'
            onClick={onConfirm}
            className='px-6 rounded-lg bg-red border-red hover:bg-red/85 hover:border-red/75'
            isLoading={isLoading}
          />
        </div>
      }
      contentClassName='pt-30px'
    >
      <div className='flex flex-col items-center gap-5'>
        <div className='flex flex-col items-center gap-5'>
          <div className='w-16 h-16 rounded-full flex items-center justify-center bg-red/20'>
            <Icon name='alertTriangle' className='icon-wrapper w-8 h-8 text-red-600' />
          </div>
          <h2 className='text-2xl font-bold text-blackdark'>
            {identity.includes('TP') ? 'End the meeting?' : 'Leave the call?'}
          </h2>
        </div>
        <p className='text-lg text-blackdark text-center leading-7'>
          {identity.includes('TP')
            ? `You'll end the meeting for everyone.`
            : 'Are you sure you want to leave this video call? You can rejoin at any time.'}
        </p>
      </div>
    </Modal>
  );
}
