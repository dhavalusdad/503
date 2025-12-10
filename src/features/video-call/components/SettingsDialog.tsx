import { useState, useEffect } from 'react';

import { DeviceSelector } from '@/features/video-call/components/DeviceSelector';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-200 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />

      {/* Dialog */}
      <div
        className={`transform transition-all duration-200 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className='w-full max-w-md overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-lg font-medium text-white'>Settings</h2>
            <Button icon={<Icon name='x' className='w-5 h-5' />} onClick={onClose} variant='none' />
          </div>

          <div className='space-y-6'>
            <DeviceSelector />

            <div className='pt-4 border-t border-gray-700'>
              <h3 className='text-white text-sm font-medium mb-2'>About</h3>
              <p className='text-gray-400 text-sm'>Twilio Video Call App v1.0.0</p>
              <p className='text-gray-400 text-xs mt-1'>
                Built with React, TypeScript, and Twilio Programmable Video
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
