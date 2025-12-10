import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import clsx from 'clsx';

import { UserRole } from '@/api/types/user.dto';
import { ControlBar } from '@/features/video-call/components/ControlBar';
import { useVideoCall } from '@/features/video-call/store/useVideoCall';
import ButtonWithTooltip from '@/stories/Common/ButtonWithTooltip';
import Icon from '@/stories/Common/Icon';

interface RoomControlBarProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  isChatOpen: boolean;
  isBlurEnabled: boolean;
  isBlurProcessing?: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleHandRaise: () => void;
  onToggleChat: () => void;
  onOpenSettings: () => void;
  onLeave: () => void;
  onToggleBlur: () => void;
  participantCount: number;
  onToggleParticipants: () => void;
  onToggleClientDetails: () => void;
  onToggleMemoPad: () => void;
  onTogglePendingAssessmentForm: () => void;
  setShowPendingTaskModal: Dispatch<SetStateAction<boolean>>;
  pendingCount: number;
  blurMode: string;
  role: UserRole;
}

export function RoomControlBar({
  role,
  participantCount,
  onToggleParticipants,
  onToggleClientDetails,
  onToggleMemoPad,
  onTogglePendingAssessmentForm,
  setShowPendingTaskModal,
  pendingCount,
  ...props
}: RoomControlBarProps) {
  const { isConnected, networkQuality, showAllParticipants } = useVideoCall();

  const getConnectionIcon = () => {
    if (!isConnected) {
      return <Icon name='wifiOff' className='w-4 h-4 text-red-400' />;
    }

    return (
      <Icon
        name='wifi'
        className={clsx(
          'icon-wrapper w-5 h-5',
          networkQuality >= 4
            ? 'text-green-400'
            : networkQuality >= 2
              ? 'text-yellow-400'
              : 'text-red-400'
        )}
      />
    );
  };
  const getConnectionText = () => {
    if (!isConnected) return 'Disconnected';

    switch (networkQuality) {
      case 5:
        return 'Excellent';
      case 4:
        return 'Good';
      case 3:
        return 'Fair';
      case 2:
        return 'Poor';
      case 1:
        return 'Very Poor';
      default:
        return 'Unknown';
    }
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {isMobile ? (
        <>
          {/* Mobile Layout - Google Meet Style */}
          <div className='flex flex-col items-center gap-4 relative z-10'>
            {/* Connection Status - Compact version */}
            <div className='flex items-center gap-2'>
              {getConnectionIcon()}
              <span
                className={clsx(
                  'text-sm font-normal leading-18px',
                  networkQuality >= 4
                    ? 'text-green-400'
                    : networkQuality >= 2
                      ? 'text-yellow-400'
                      : 'text-red-400'
                )}
              >
                {getConnectionText()}
              </span>
              <span className='text-sm font-normal leading-18px text-white/70'>•</span>
              <span className='text-sm font-normal leading-18px text-white/70'>
                {participantCount + 1} participants
              </span>
            </div>

            {/* Main Control Bar */}
            <ControlBar
              {...props}
              role={role}
              showAllParticipants={showAllParticipants}
              onToggleParticipants={onToggleParticipants}
              onToggleMemoPad={onToggleMemoPad}
              onToggleClientDetails={onToggleClientDetails}
              onTogglePendingAssessmentForm={onTogglePendingAssessmentForm}
            />
          </div>
        </>
      ) : (
        <>
          {/* Desktop Layout - Original Style */}
          <div className='flex items-center justify-between gap-5 relative z-10'>
            {/* Connection Status */}
            <div className='flex items-center gap-2.5'>
              {getConnectionIcon()}
              <span
                className={clsx(
                  'text-sm',
                  networkQuality >= 4
                    ? 'text-green-400'
                    : networkQuality >= 2
                      ? 'text-yellow-400'
                      : 'text-red-400'
                )}
              >
                {getConnectionText()}
              </span>
            </div>

            {/* Main Control Bar */}
            <div className='flex-1 flex justify-center'>
              <ControlBar {...props} role={role} showAllParticipants={showAllParticipants} />
            </div>
            <div className='flex gap-3'>
              {/* Participant Count Button */}
              <ButtonWithTooltip
                tooltipLabel='Participants'
                variant='none'
                title={`${participantCount + 1}`}
                onClick={onToggleParticipants}
                className='!py-2 !px-2 !gap-1 !font-bold h-10 bg-white rounded-lg text-blackdark'
                icon={<Icon name='users' className='icon-wrapper w-4 h-4' />}
                isIconFirst
              />
              {role === UserRole.THERAPIST && (
                <>
                  <ButtonWithTooltip
                    tooltipLabel='Client Details'
                    variant='none'
                    onClick={onToggleClientDetails}
                    className='!py-2 !px-2 !gap-1 !font-bold h-10 bg-yellow rounded-lg'
                    icon={<Icon name='fileNote' className='icon-wrapper w-6 h-4 text-white' />}
                    isIconFirst
                  />
                  <ButtonWithTooltip
                    tooltipLabel='Memo Pad'
                    variant='none'
                    onClick={onToggleMemoPad}
                    className='!py-2 !px-2 !gap-1 !font-bold h-10 bg-Green rounded-lg'
                    icon={<Icon name='memopad' className='icon-wrapper w-6 h-4 text-white' />}
                    isIconFirst
                  />
                </>
              )}
              {((role === UserRole.CLIENT && pendingCount > 0) || role === UserRole.THERAPIST) && (
                <>
                  <ButtonWithTooltip
                    tooltipLabel='Pending Assessments'
                    variant='none'
                    onClick={
                      role === UserRole.CLIENT && pendingCount > 0
                        ? () => setShowPendingTaskModal(d => !d)
                        : onTogglePendingAssessmentForm
                    }
                    className='!py-2 !px-2 !gap-1 !font-bold h-10 bg-white rounded-lg text-blackdark'
                    icon={<Icon name='PendingAssessment' className='icon-wrapper w-5 h-5' />}
                    isIconFirst
                    children={
                      pendingCount ? (
                        <div className=' absolute -top-2 -right-2'>
                          <Icon
                            name='info'
                            className='text-yellow-500 bg-white rounded-full'
                          ></Icon>
                        </div>
                      ) : (
                        <></>
                      )
                    }
                  />
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
