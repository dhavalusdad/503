import React, { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';

import type { UserRole } from '@/api/types/user.dto';
import { MoreOptionsDropdown } from '@/features/video-call/components/MoreOptionsDropdown';
import { useVideoCall } from '@/features/video-call/store/useVideoCall';
import { usePopupClose } from '@/hooks/usePopupClose';
import { setLocalTracks } from '@/redux/ducks/videoCall';
import Button from '@/stories/Common/Button';
import ButtonWithTooltip from '@/stories/Common/ButtonWithTooltip';
import Icon from '@/stories/Common/Icon';

import { createAudioTrack, createVideoTrack } from '../utils/media';

import type { LocalAudioTrack, LocalVideoTrack } from 'twilio-video';

export interface ControlBarProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  isChatOpen: boolean;
  showAllParticipants: boolean;
  isBlurEnabled: boolean;
  isBlurProcessing?: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleHandRaise: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onOpenSettings: () => void;
  onLeave: () => void;
  onTogglePendingAssessmentForm: () => void;
  onToggleBlur: (value: string) => void;
  className?: string;
  onToggleMemoPad: () => void;
  onToggleClientDetails: () => void;
  blurMode: boolean;
  role: UserRole;
}

export function ControlBar({
  isMuted,
  isVideoEnabled,
  onToggleMute,
  onToggleVideo,
  onLeave,
  className,
  isScreenSharing,
  onToggleScreenShare,
  isHandRaised,
  onToggleHandRaise,
  onToggleChat,
  onToggleParticipants,
  onOpenSettings,
  isChatOpen,
  onTogglePendingAssessmentForm,
  isBlurEnabled,
  onToggleBlur,
  isBlurProcessing = false,
  onToggleMemoPad,
  onToggleClientDetails,
  blurMode,
  role,
}: ControlBarProps) {
  const [audioDeviceList, setAudioDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [cameraDeviceList, setCameraDeviceList] = useState<MediaDeviceInfo[]>([]);

  const [hasDevices, setHasDevices] = useState<{
    video: MediaDeviceInfo | undefined;
    audio: MediaDeviceInfo | undefined;
  }>({
    video: undefined,
    audio: undefined,
  });
  const { localTracks, identity } = useVideoCall();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { isOpen: isMenuVisible, setIsOpen: setMenuVisible } = usePopupClose({
    popupRef: menuRef as React.RefObject<HTMLElement>,
    buttonRef: buttonRef as React.RefObject<HTMLElement>,
  });

  // Video effects menu
  const videoMenuRef = useRef<HTMLDivElement>(null);
  const videoButtonRef = useRef<HTMLDivElement>(null);
  const { isOpen: isVideoMenuVisible, setIsOpen: setVideoMenuVisible } = usePopupClose({
    popupRef: videoMenuRef as React.RefObject<HTMLElement>,
    buttonRef: videoButtonRef as React.RefObject<HTMLElement>,
  });

  const changInputDevice = async (device: MediaDeviceInfo, kind: 'audio' | 'video') => {
    setHasDevices(prev => ({ ...prev, [kind]: device }));
    const existing = localTracks.find(d => d.kind === kind);
    if (existing && typeof (existing as LocalAudioTrack | LocalVideoTrack).stop === 'function') {
      (existing as LocalAudioTrack | LocalVideoTrack)?.stop();
    }
    const track =
      kind == 'audio'
        ? await createAudioTrack(device.deviceId)
        : await createVideoTrack(device.deviceId);

    setLocalTracks([
      ...localTracks.filter(d => d.kind == (kind == 'audio' ? 'video' : 'audio')),
      track,
    ]);
    if (kind == 'audio') {
      sessionStorage.setItem('audioDeviceId', device.deviceId);
    } else {
      sessionStorage.setItem('videoDeviceId', device.deviceId);
    }

    replaceTrack(device.deviceId, kind);
  };

  const handelSetDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const audioDeviceId = sessionStorage.getItem('audioDeviceId');
    const videoDeviceId = sessionStorage.getItem('videoDeviceId');

    const currentAudio = devices.find(d => d.deviceId === audioDeviceId && d.kind === 'audioinput');
    const currentVideo = devices.find(d => d.deviceId === videoDeviceId && d.kind === 'videoinput');

    // Set audio
    if (currentAudio) {
      setHasDevices(prev => ({ ...prev, audio: currentAudio }));
      replaceTrack(currentAudio.deviceId, 'audio');
    } else {
      const defaultAudio = devices.find(d => d.kind === 'audioinput');
      if (defaultAudio) setHasDevices(prev => ({ ...prev, audio: defaultAudio }));
    }

    // Set video
    if (currentVideo) {
      setHasDevices(prev => ({ ...prev, video: currentVideo }));
      replaceTrack(currentVideo.deviceId, 'video');
    } else {
      const defaultVideo = devices.find(d => d.kind === 'videoinput');
      if (defaultVideo) setHasDevices(prev => ({ ...prev, video: defaultVideo }));
    }

    // Set device lists
    setAudioDeviceList([...(devices.filter(d => d.kind === 'audioinput') || [])]);
    setCameraDeviceList([...(devices.filter(d => d.kind === 'videoinput') || [])]);
  };

  const replaceTrack = (newDeviceId: string, kind: 'audio' | 'video') => {
    localTracks.find(d => d.kind == kind)?.restart({ deviceId: { exact: newDeviceId } });
  };

  useEffect(() => {
    handelSetDevices();
  }, []);

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
          {/* Mobile Layout - Google Meet Style (hidden on lg+) */}
          <div className={clsx('flex items-center gap-3 sm:gap-4', className)}>
            {/* Microphone Control */}
            <div
              ref={buttonRef}
              className={`relative flex items-center gap-2 ${isMuted ? 'bg-white !p-1' : 'bg-primarylight/50 px-2 py-1 '} rounded-lg `}
            >
              {/* Main Audio Button */}
              {/* Dropdown Arrow */}
              {!isMuted && (
                <ButtonWithTooltip
                  tooltipLabel='Audio Input Options'
                  variant='none'
                  icon={
                    <Icon
                      name='dropdownArrow'
                      className={clsx(
                        'icon-wrapper w-4 h-4 transform transition-transform duration-200 ease-in-out',
                        isMenuVisible ? 'rotate-0' : 'rotate-180',
                        isMuted ? 'cursor-not-allowed' : 'cursor-pointer'
                      )}
                    />
                  }
                  onClick={isMuted ? undefined : () => setMenuVisible(prev => !prev)}
                  className='text-white !p-0'
                  parentClassName='h-4'
                />
              )}
              <ButtonWithTooltip
                tooltipLabel={isMuted ? 'Unmute' : 'Mute'}
                onClick={onToggleMute}
                variant='none'
                parentClassName='h-8'
                className={clsx(
                  'rounded-lg text-white !p-1.5 !duration-100',
                  hasDevices.audio && !isMuted ? 'bg-blackdark' : 'bg-white'
                )}
                isDisabled={!hasDevices.audio}
                icon={
                  <Icon
                    name={hasDevices.audio && !isMuted ? 'mic' : 'micOff'}
                    className={clsx(
                      'w-5 h-5 icon-wrapper',
                      hasDevices.audio && !isMuted ? '' : 'text-red'
                    )}
                  />
                }
              />
              {isMenuVisible && !isMuted && (
                <div
                  ref={menuRef}
                  className='absolute bottom-full mb-2 left-[77%] transform -translate-x-1/2 bg-white rounded-lg min-w-44 z-50 overflow-hidden'
                >
                  <div className='px-4 py-3 text-center'>
                    <h3 className='text-base font-bold text-primary leading-5'>Microphone</h3>
                  </div>
                  {audioDeviceList.map((device, index) => {
                    return (
                      <Button
                        key={index}
                        titleClassName='text-left'
                        onClick={() => changInputDevice(device, 'audio')}
                        className={clsx(
                          'w-full text-blackdark !leading-22px rounded-none !p-2.5 !text-15px !justify-start',
                          hasDevices?.audio?.deviceId === device.deviceId
                            ? 'hover:!bg-primary'
                            : 'hover:bg-primarylight/30'
                        )}
                        title={device.label}
                        variant={
                          hasDevices?.audio?.deviceId === device.deviceId ? 'filled' : 'none'
                        }
                      />
                    );
                  })}
                </div>
              )}
            </div>
            {/* Camera Control */}
            <ButtonWithTooltip
              tooltipLabel={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
              variant='none'
              onClick={onToggleVideo}
              className={clsx(
                'rounded-lg text-white !p-1.5 w-10 h-10 !duration-100',
                isVideoEnabled ? 'bg-blackdark' : 'bg-white'
              )}
              icon={
                <Icon
                  name={isVideoEnabled ? 'video' : 'videoOff'}
                  className={clsx('w-5 h-5 icon-wrapper', isVideoEnabled ? '' : 'text-red')}
                />
              }
            />

            {/* Chat Button */}
            <ButtonWithTooltip
              tooltipLabel={isChatOpen ? 'Close Chat' : 'Open Chat'}
              variant='none'
              onClick={onToggleChat}
              icon={<Icon name='messageSquare' className='icon-wrapper w-5 h-5 text-white' />}
              className={clsx(
                'border border-solid rounded-md w-10 h-10 !duration-100',
                isChatOpen
                  ? 'bg-primary border-primary'
                  : 'bg-primarylight/20 border-primarylight/50'
              )}
            />

            {/* End Call Button */}
            <ButtonWithTooltip
              tooltipLabel='Leave Call'
              variant='none'
              onClick={onLeave}
              icon={<Icon name='phone' className='icon-wrapper w-5 h-5 text-white' />}
              className='border border-solid rounded-md w-10 h-10 !duration-100 bg-red-500 border-red-500'
            />

            {/* More Options Dropdown */}
            <MoreOptionsDropdown
              role={role}
              isScreenSharing={isScreenSharing}
              isHandRaised={isHandRaised}
              isVideoEnabled={isVideoEnabled}
              isBlurEnabled={isBlurEnabled}
              isBlurProcessing={isBlurProcessing}
              onToggleScreenShare={onToggleScreenShare}
              onToggleHandRaise={onToggleHandRaise}
              onToggleParticipants={onToggleParticipants}
              onOpenSettings={onOpenSettings}
              onLeave={onLeave}
              onTogglePendingAssessmentForm={onTogglePendingAssessmentForm}
              onToggleBlur={onToggleBlur}
              onToggleMemoPad={onToggleMemoPad}
              onToggleClientDetails={onToggleClientDetails}
            />
          </div>
        </>
      ) : (
        <>
          {/* Desktop Layout - Original Style (hidden on mobile/tablet) */}
          <div className={clsx('flex flex-wrap items-center gap-3', className)}>
            {/* Primary Controls */}
            {/* Audio Control Button Group */}
            <div
              ref={buttonRef}
              className='relative flex items-center gap-2 bg-primarylight/50 rounded-md px-2 py-1'
            >
              {/* Main Audio Button */}
              {/* Dropdown Arrow */}
              {/* {!isMuted && ( */}
              <ButtonWithTooltip
                tooltipLabel='Audio Input Options'
                variant='none'
                icon={
                  <Icon
                    name='dropdownArrow'
                    className={clsx(
                      'icon-wrapper w-4 h-4 transform transition-transform duration-200 ease-in-out',
                      isMenuVisible ? 'rotate-0' : 'rotate-180',
                      isMuted ? 'cursor-not-allowed' : 'cursor-pointer'
                    )}
                  />
                }
                onClick={isMuted ? undefined : () => setMenuVisible(prev => !prev)}
                className='text-white !p-0'
                parentClassName='h-4'
              />
              {/* )} */}
              <ButtonWithTooltip
                tooltipLabel={isMuted ? 'Unmute' : 'Mute'}
                onClick={onToggleMute}
                variant='none'
                parentClassName='h-8'
                className={clsx(
                  'rounded-lg text-white !p-1.5 !duration-100',
                  hasDevices.audio && !isMuted ? 'bg-blackdark' : 'bg-white'
                )}
                isDisabled={!hasDevices.audio}
                icon={
                  <Icon
                    name={hasDevices.audio && !isMuted ? 'mic' : 'micOff'}
                    className={clsx(
                      'w-5 h-5 icon-wrapper',
                      hasDevices.audio && !isMuted ? '' : 'text-red'
                    )}
                  />
                }
              />
              {isMenuVisible && !isMuted && (
                <div
                  ref={menuRef}
                  className='absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg min-w-64 z-50 overflow-hidden'
                >
                  <div className='px-4 py-3 text-center'>
                    <h3 className='text-base font-bold text-primary leading-5'>Microphone</h3>
                  </div>
                  {audioDeviceList.map((device, index) => {
                    return (
                      <Button
                        key={index}
                        titleClassName='text-left'
                        onClick={() => changInputDevice(device, 'audio')}
                        className={clsx(
                          'w-full text-blackdark !leading-22px rounded-none !p-2.5 !text-15px !justify-start',
                          hasDevices?.audio?.deviceId === device.deviceId
                            ? 'hover:!bg-primary'
                            : 'hover:bg-primarylight/30'
                        )}
                        title={device.label}
                        variant={
                          hasDevices?.audio?.deviceId === device.deviceId ? 'filled' : 'none'
                        }
                      />
                    );
                  })}
                </div>
              )}
            </div>
            {/* Video Control Button Group with Effects Dropdown */}
            <div
              ref={videoButtonRef}
              className='relative flex items-center gap-2 bg-primarylight/50 rounded-md px-2 py-1'
            >
              {/* Video Control Button Group */}
              {/* Dropdown Arrow */}
              {/* {isVideoEnabled && ( */}
              <ButtonWithTooltip
                tooltipLabel='Video Input Options'
                variant='none'
                icon={
                  <Icon
                    name='dropdownArrow'
                    className={clsx(
                      'icon-wrapper w-4 h-4 transform transition-transform duration-200 ease-in-out',
                      isVideoMenuVisible ? 'rotate-0' : 'rotate-180',
                      !isVideoEnabled ? 'cursor-not-allowed' : 'cursor-pointer'
                    )}
                  />
                }
                onClick={!isVideoEnabled ? undefined : () => setVideoMenuVisible(prev => !prev)}
                className='text-white !p-0'
                parentClassName='h-4'
              />
              {/* )} */}
              <ButtonWithTooltip
                tooltipLabel={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
                onClick={onToggleVideo}
                variant='none'
                parentClassName='h-8'
                className={clsx(
                  'rounded-lg text-white !p-1.5 !duration-100',
                  isVideoEnabled ? 'bg-blackdark' : 'bg-white'
                )}
                icon={
                  <Icon
                    name={isVideoEnabled ? 'video' : 'videoOff'}
                    className={clsx('w-5 h-5 icon-wrapper', isVideoEnabled ? '' : 'text-red')}
                  />
                }
              />
              {/* Video Effects Dropdown Menu */}
              {isVideoMenuVisible && isVideoEnabled && (
                <div
                  ref={videoMenuRef}
                  className='absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg min-w-48 z-50 overflow-hidden'
                >
                  <div className='px-4 py-3 text-center'>
                    <h3 className='text-base font-bold text-primary leading-5'>
                      Video Input Devices
                    </h3>
                  </div>
                  {cameraDeviceList.map(device => {
                    return (
                      <Button
                        key={device.deviceId}
                        titleClassName='text-left'
                        onClick={() => changInputDevice(device, 'video')}
                        className={clsx(
                          'w-full text-blackdark !leading-22px rounded-none !p-2.5 !text-15px !justify-start',
                          hasDevices?.video?.deviceId === device.deviceId
                            ? 'hover:!bg-primary'
                            : 'hover:bg-primarylight/30'
                        )}
                        title={device.label}
                        variant={
                          hasDevices?.video?.deviceId === device.deviceId ? 'filled' : 'none'
                        }
                      />
                    );
                  })}
                  <div className='px-4 py-3 text-center'>
                    <h3 className='text-base font-bold text-primary leading-5'>Video Effects</h3>
                  </div>
                  <Button
                    titleClassName='text-left'
                    onClick={() => onToggleBlur('')}
                    className={clsx(
                      'w-full text-blackdark !leading-22px rounded-none !p-2.5 !text-15px !justify-start',
                      !isBlurEnabled && !blurMode ? 'hover:!bg-primary' : 'hover:bg-primarylight/30'
                    )}
                    title='No Effects'
                    variant={!isBlurEnabled && !blurMode ? 'filled' : 'none'}
                    isDisabled={isBlurProcessing}
                  />
                  <Button
                    titleClassName='text-left'
                    onClick={() => onToggleBlur('LIGHT_BLUR')}
                    className={clsx(
                      'w-full text-blackdark !leading-22px rounded-none !p-2.5 !text-15px !justify-start',
                      blurMode == 'LIGHT_BLUR' ? 'hover:!bg-primary' : 'hover:bg-primarylight/30'
                    )}
                    title={isBlurProcessing ? 'Processing...' : 'Slightly Blur'}
                    variant={blurMode == 'LIGHT_BLUR' ? 'filled' : 'none'}
                    isDisabled={isBlurProcessing}
                  />
                  <Button
                    titleClassName='text-left'
                    onClick={() => onToggleBlur('FULL_BLUR')}
                    className={clsx(
                      'w-full text-blackdark !leading-22px rounded-none !p-2.5 !text-15px !justify-start',
                      blurMode == 'FULL_BLUR' ? 'hover:!bg-primary' : 'hover:bg-primarylight/30'
                    )}
                    title={isBlurProcessing ? 'Processing...' : 'Complete Blur'}
                    variant={blurMode == 'FULL_BLUR' ? 'filled' : 'none'}
                    isDisabled={isBlurProcessing}
                  />
                </div>
              )}
              {/* setBlurMode */}
            </div>
            {/* Secondary Controls */}
            <ButtonWithTooltip
              tooltipLabel={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
              icon={
                <Icon
                  name={isScreenSharing ? 'monitorOff' : 'monitor'}
                  className='icon-wrapper w-18px h-18px text-white'
                />
              }
              onClick={onToggleScreenShare}
              variant={'none'}
              className={clsx(
                'border border-solid rounded-md w-10 h-10 !duration-100',
                isScreenSharing
                  ? 'bg-primarylight/50 border-primarylight/50'
                  : 'bg-primarylight/20 border-primarylight/50 hover:bg-primarylight/50'
              )}
            />
            <ButtonWithTooltip
              tooltipLabel={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
              icon={<Icon name='hand' className={clsx('icon-wrapper w-18px h-18px text-white')} />}
              onClick={!isHandRaised ? onToggleHandRaise : () => {}}
              className={clsx(
                'border border-solid rounded-md w-10 h-10 !duration-100',
                isHandRaised
                  ? 'bg-primarylight/50 border-primarylight/50'
                  : 'bg-primarylight/20 border-primarylight/50 hover:bg-primarylight/50'
              )}
              variant={'none'}
            />
            <ButtonWithTooltip
              tooltipLabel='Open Chat'
              variant='none'
              onClick={onToggleChat}
              icon={<Icon name='messageSquare' className='icon-wrapper w-18px h-18px text-white' />}
              className={clsx(
                'border border-solid rounded-md w-10 h-10 !duration-100 bg-primarylight/20 border-primarylight/50 hover:bg-primarylight/50'
              )}
            />
            {/* Leave Button */}
            <ButtonWithTooltip
              tooltipLabel={identity.includes('TP') ? 'End Session' : 'Leave Session'}
              variant='none'
              title={identity.includes('TP') ? 'End Session' : 'Leave session'}
              onClick={onLeave}
              icon={<Icon name='phone' className='icon-wrapper w-4 h-4 text-white' />}
              isIconFirst
              className='bg-red hover:bg-red-500 text-white !font-bold rounded-lg !py-2 sm:!py-3 !px-3 sm:!px-4 hover:scale-105'
            />
          </div>
        </>
      )}
      {/* Swiper Navigation - Hidden by default */}
      <div className='hidden' id='swiper-action-button'>
        <div className=' items-center gap-2 hidden lg:flex ml-5'>
          <Button
            onClick={() => {}}
            variant='none'
            icon={<Icon name='chevronLeft' className='w-4 h-4 icon-wrapper' />}
            className='border border-solid bg-primarylight/20 border-primarylight/50 hover:bg-primarylight/50 !p-0 w-10 h-10 rounded-lg text-white font-bold custom-prev'
          />
          <Button
            onClick={() => {}}
            variant='none'
            icon={<Icon name='chevronRight' className='w-4 h-4 icon-wrapper' />}
            className='border border-solid bg-primarylight/20 border-primarylight/50 hover:bg-primarylight/50 !p-0 w-10 h-10 rounded-lg text-white font-bold custom-next'
          />
        </div>
      </div>
    </>
  );
}
