import { useState, useRef, useEffect } from 'react';

import clsx from 'clsx';

import { UserRole } from '@/api/types/user.dto';
import Button from '@/stories/Common/Button';
import Icon, { type IconNameType } from '@/stories/Common/Icon';

interface MoreOptionsDropdownProps {
  isScreenSharing: boolean;
  isHandRaised: boolean;
  isVideoEnabled: boolean;
  isBlurEnabled: boolean;
  isBlurProcessing: boolean;
  onToggleScreenShare: () => void;
  onToggleHandRaise: () => void;
  onToggleParticipants: () => void;
  onOpenSettings: () => void;
  onLeave: () => void;
  onTogglePendingAssessmentForm: () => void;
  onToggleBlur: () => void;
  onToggleMemoPad: () => void;
  onToggleClientDetails: () => void;
  className?: string;
}

export function MoreOptionsDropdown({
  role,
  isScreenSharing,
  isHandRaised,
  isVideoEnabled,
  isBlurEnabled,
  isBlurProcessing,
  onToggleScreenShare,
  onToggleHandRaise,
  onToggleParticipants,
  onTogglePendingAssessmentForm,
  onToggleBlur,
  onToggleMemoPad,
  onToggleClientDetails,

  //   onOpenSettings,
  //   onLeave,
  className,
}: MoreOptionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showVideoEffects, setShowVideoEffects] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    {
      icon: isScreenSharing ? 'monitorOff' : 'monitor',
      label: isScreenSharing ? 'Stop sharing' : 'Share screen',
      onClick: onToggleScreenShare,
      className: '',
      iconClassName: 'w-5 h-5',
    },
    {
      icon: 'hand',
      label: isHandRaised ? 'Lower hand' : 'Raise hand',
      onClick: onToggleHandRaise,
      className: '',
      iconClassName: 'w-5 h-5',
    },
    {
      icon: 'users',
      label: 'View all participants',
      onClick: () => onToggleParticipants(),
      className: '',
      iconClassName: 'w-5 h-5',
    },
    ...(role == UserRole.THERAPIST
      ? [
          {
            icon: 'fileNote',
            label: 'patient Details',
            onClick: () => onToggleClientDetails(),
            className: '',
            iconClassName: 'w-18px h-18px',
          },
        ]
      : []),
    ...(role == UserRole.THERAPIST
      ? [
          {
            icon: 'memopad',
            label: 'MemoPad',
            onClick: () => onToggleMemoPad(),
            className: '',
            iconClassName: 'w-5 h-5',
          },
        ]
      : []),
    ...(isVideoEnabled
      ? [
          {
            icon: 'eye',
            label: 'Video effects',
            onClick: () => setShowVideoEffects(!showVideoEffects),
            hasSubmenu: true,
            className: '',
            iconClassName: 'w-22px h-22px',
          },
        ]
      : []),
    {
      icon: 'PendingAssessment',
      label: 'Pending Assessment Form',
      onClick: onTogglePendingAssessmentForm,
      className: '',
      iconClassName: 'w-18px h-18px',
    },
    // {
    //   icon: 'settings',
    //   label: 'Settings',
    //   onClick: onOpenSettings,
    //
    // },
  ];

  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      {/* Three dots button */}
      <Button
        variant='none'
        onClick={() => setIsOpen(!isOpen)}
        icon={<Icon name='threedots' className='icon-wrapper w-5 h-5 text-white' />}
        className={clsx(
          'border border-solid rounded-md w-10 h-10 !duration-100',
          isOpen ? 'bg-primary border-primary' : 'bg-primarylight/20 border-primarylight/50'
        )}
      />

      {/* Dropdown menu */}
      {isOpen && (
        <div className='absolute bottom-full mb-2 -right-10 sm:left-2/4 sm:-translate-x-2/4 z-10 bg-blackdark rounded-2xl shadow-content min-w-64 py-1'>
          {!showVideoEffects ? (
            // Main menu
            <>
              {menuItems.map((item, index) => (
                <Button
                  title={item.label}
                  key={index}
                  onClick={() => {
                    item.onClick();
                    if (!item.hasSubmenu) {
                      setIsOpen(false);
                    }
                  }}
                  variant='none'
                  className={clsx('text-white !justify-start w-full', item.className)}
                  isIconFirst
                  icon={
                    <div className='w-6'>
                      <Icon
                        name={item.icon as IconNameType}
                        className={clsx('icon-wrapper', item.iconClassName)}
                      />
                    </div>
                  }
                />
              ))}
            </>
          ) : (
            // Video effects submenu
            <>
              <Button
                variant='none'
                onClick={() => setShowVideoEffects(false)}
                className='text-white w-full !font-bold'
                title='Video Effects'
              />
              <Button
                title='Normal'
                onClick={() => {
                  if (isBlurEnabled) {
                    onToggleBlur();
                  }
                  setIsOpen(false);
                  setShowVideoEffects(false);
                }}
                variant='none'
                className={clsx('text-white !justify-start w-full', !isBlurEnabled && 'bg-primary')}
                isDisabled={isBlurProcessing}
              />
              <Button
                title={isBlurProcessing ? 'Processing...' : 'Blur Background'}
                onClick={() => {
                  if (!isBlurEnabled) {
                    onToggleBlur();
                  }
                  setIsOpen(false);
                  setShowVideoEffects(false);
                }}
                variant='none'
                className={clsx('text-white !justify-start w-full', isBlurEnabled && 'bg-primary')}
                isDisabled={isBlurProcessing}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
