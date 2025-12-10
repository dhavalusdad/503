import { useEffect, useRef, useState } from 'react';

import { clsx } from 'clsx';

import { useDeviceType } from '@/hooks/useDeviceType';
import Icon from '@/stories/Common/Icon';
import Tooltip from '@/stories/Common/Tooltip/Tooltip';

import type { LocalTrack, LocalVideoTrack, RemoteTrack } from 'twilio-video';

export interface VideoTileProps {
  identity: string;
  videoTrack?: LocalTrack | RemoteTrack | LocalVideoTrack;
  audioTrack?: LocalTrack | RemoteTrack | null;
  isLocal?: boolean;
  isDominantSpeaker?: boolean;
  isHandRaised?: boolean;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
  networkQuality?: number;
  isScreenShare?: boolean;
  isLocalVideoMain?: boolean;
  totalParticipants?: number;
  className?: string;
  onClick?: () => void;
  isScreenSharing?: boolean;
  isPinned?: boolean;
  onPinToggle?: () => void;
  participantSid?: string;
}

export function VideoTile({
  identity,
  videoTrack,
  audioTrack,
  isLocal = false,
  isDominantSpeaker = false,
  isHandRaised = false,
  isMuted = false,
  isVideoEnabled = true,
  // networkQuality,
  // isLocalVideoMain = false,
  isScreenSharing = false,
  className,
  onClick,
  isPinned = false,
  onPinToggle,
  participantSid,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const deviceType = useDeviceType();
  const [resetVideoTrack] = useState(Date.now());

  useEffect(() => {
    if (
      (deviceType === 'mobile' ||
        deviceType === 'mobilehorizontal' ||
        deviceType === 'tablet' ||
        deviceType === 'tabletbigger') &&
      onPinToggle
    ) {
      const mobileElement = document.getElementById(`video-tile-${identity}`);
      let lastTouchTime = 0;

      const handleTouchEnd = () => {
        const currentTime = Date.now();
        const timeDifference = currentTime - lastTouchTime;

        // Double tap to pin/unpin (within 300ms)
        if (timeDifference < 300 && timeDifference > 50) {
          onPinToggle();
        }

        lastTouchTime = currentTime;
      };

      if (mobileElement) {
        mobileElement.addEventListener('touchend', handleTouchEnd);
      }

      // Cleanup the event listeners on component unmount
      return () => {
        if (mobileElement) {
          mobileElement.removeEventListener('touchend', handleTouchEnd);
        }
      };
    }
  }, [deviceType, identity, onPinToggle]);

  // Video track handling
  useEffect(() => {
    if (!videoRef.current || !videoTrack) return;

    // If video is disabled, detach and exit
    if (!isVideoEnabled || !('attach' in videoTrack)) {
      if ('detach' in videoTrack && videoRef.current) {
        videoTrack.detach(videoRef.current);
      }
      return;
    }

    // Attach video on mount
    videoTrack.attach(videoRef.current);

    // Handler for Twilio "restarted" event
    const handleRestarted = () => {
      if (videoRef.current) {
        videoTrack.attach(videoRef.current);
      }
    };

    // Handler for Twilio "stopped" event
    const handleStopped = () => {
      if (videoRef.current) {
        videoTrack.detach(videoRef.current);
      }
    };

    // Subscribe to Twilio events
    videoTrack.on('restarted', handleRestarted);
    videoTrack.on('stopped', handleStopped);

    // Cleanup
    return () => {
      videoTrack.off('restarted', handleRestarted);
      videoTrack.off('stopped', handleStopped);

      if (videoRef.current) {
        videoTrack.detach(videoRef.current);
      }
    };
  }, [videoTrack, isVideoEnabled]);

  // Audio track handling
  useEffect(() => {
    if (!audioRef.current || !audioTrack || isLocal) return;

    if ('attach' in audioTrack) {
      audioTrack.attach(audioRef.current);
    }
    return () => {
      if (audioRef.current && 'detach' in audioTrack) {
        audioTrack.detach(audioRef.current);
      }
    };
  }, [audioTrack, isLocal, isMuted]);

  const renderIndicators = () => (
    <div className='absolute flex gap-2 sm:gap-3 top-2 sm:top-3 right-2 sm:right-3'>
      {[{ icon: isMuted ? 'micOff' : 'mic' }].map(({ icon }, i) => (
        <div
          key={i}
          className='w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-sm'
        >
          <Icon
            name={icon as 'video' | 'videoOff' | 'micOff' | 'mic'}
            className='text-white icon-wrapper w-4 h-4'
          />
        </div>
      ))}
      {/* Mobile pin hint - show small indicator when not pinned */}
    </div>
  );

  const renderPinButton = () => {
    if (!onPinToggle) return null;

    const tooltipLabel =
      deviceType === 'tabletbigger' ||
      deviceType === 'tablet' ||
      deviceType === 'mobilehorizontal' ||
      deviceType === 'mobile'
        ? isPinned
          ? 'Double tap to unpin'
          : 'Double tap to pin'
        : isPinned
          ? 'Unpin participant'
          : 'Pin participant';

    return (
      <div
        className={clsx(
          'absolute top-2 sm:top-3 left-2 sm:left-3 z-20 items-center justify-center transition-all duration-300',
          deviceType === 'mobile' || deviceType === 'mobilehorizontal'
            ? isPinned
              ? 'flex'
              : 'hidden'
            : 'hidden group-hover:flex',
          isPinned && '!flex'
        )}
      >
        <Tooltip
          label={tooltipLabel}
          disable={
            deviceType === 'tabletbigger' ||
            deviceType === 'tablet' ||
            deviceType === 'mobilehorizontal' ||
            deviceType === 'mobile'
          }
          placement='right'
        >
          <div
            id={`pin-button-${participantSid?.split(' ')[0]}-${isScreenSharing ? 'screen' : 'camera'}`}
            onClick={e => {
              e.stopPropagation();
              onPinToggle();
            }}
            className={clsx(
              'w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center transition-colors bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 active:bg-black/90 cursor-pointer'
            )}
          >
            <Icon name={isPinned ? 'pinOff' : 'pinIcon'} className='icon-wrapper w-4 h-4' />
          </div>
        </Tooltip>
      </div>
    );
  };
  // const renderNetworkBars = () => {
  //   if (isLocal) return null;

  //   // map networkQuality (0–5) to colors and bar count
  //   const getColor = () => {
  //     if (networkQuality === undefined) return 'bg-gray-500'; // no data/unknown

  //     if (networkQuality <= 2) return 'bg-red-500'; // poor
  //     if (networkQuality === 3) return 'bg-yellow-400'; // average
  //     if (networkQuality === 4) return 'bg-lime-400'; // good
  //     return 'bg-green-500'; // excellent
  //   };

  //   const getBarCount = () => {
  //     if (networkQuality === undefined || networkQuality === 0) return 0; // no bars for unknown
  //     return Math.max(1, networkQuality); // at least 1 bar, max 5 bars
  //   };

  //   return (
  //     <div
  //       className={`absolute ${
  //         !isLocalVideoMain && !onPinToggle ? 'top-2 left-2' : 'bottom-2 right-2'
  //       }`}
  //     >
  //       <div className='flex items-end gap-[3px] bg-black/50 backdrop-blur-sm rounded-md px-1.5 py-1'>
  //         {Array.from({ length: getBarCount() }).map((_, i) => (
  //           <div
  //             key={i}
  //             className={clsx(
  //               'w-[6px] h-[6px] rounded-full transition-all duration-200',
  //               getColor()
  //             )}
  //           />
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  return (
    <div
      id={`video-tile-${identity}`}
      className={clsx(
        'relative rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden w-full h-full group transition-all duration-300',
        className
      )}
      onClick={onClick}
    >
      {isDominantSpeaker && (
        <div
          className={clsx(
            'bg-transparent rounded-lg sm:rounded-xl lg:rounded-2xl absolute inset-0 z-10 border-4 border-solid border-surface'
          )}
        ></div>
      )}
      {isVideoEnabled && videoTrack && (videoTrack as LocalVideoTrack)?.isEnabled ? (
        <video
          key={`${isVideoEnabled}-${videoTrack.kind}-${resetVideoTrack}`}
          ref={videoRef}
          id='video-element'
          className='w-full h-full object-cover rounded-lg sm:rounded-xl lg:rounded-2xl'
          autoPlay
          muted={isLocal}
          playsInline
          style={{
            transform: isScreenSharing ? 'scaleX(1)' : 'scaleX(-1)',
          }}
        />
      ) : (
        <div className='absolute inset-0 bg-gradient-to-br from-gray-400 to-blackdarklight flex items-center justify-center'>
          {/* {user?.profile_image ? (
            <>
              <Image
                imgPath={user?.profile_image}
                alt='User Avatar'
                className='w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-gray-600 capitalize flex items-center justify-center text-xl sm:text-2xl lg:text-3xl font-semibold text-white'
                imageClassName='w-full h-full object-contain object-center rounded-full'
                initialClassName='!text-base'
              />
            </>
          ) : ( */}
          <div className='w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 capitalize bg-gray-600 rounded-full flex items-center justify-center text-xl sm:text-2xl lg:text-3xl font-semibold text-white'>
            {identity.charAt(0).toUpperCase()}
          </div>
          {/* )} */}
        </div>
      )}

      {!isLocal && <audio ref={audioRef} autoPlay playsInline style={{ display: 'none' }} />}

      {!isScreenSharing && renderIndicators()}
      {renderPinButton()}
      {isHandRaised && (
        <div className='absolute w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center transition-colors bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 bottom-2 sm:bottom-3 right-2 sm:right-3'>
          <Icon name='hand' className='icon-wrapper w-4 h-4' />
        </div>
      )}

      <div className='absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-1.5'>
        <span className='text-white text-xs sm:text-sm font-medium'>
          {identity.split('-')} {isLocal && '(You)'}
        </span>
      </div>

      {/* {renderNetworkBars()} */}
    </div>
  );
}
