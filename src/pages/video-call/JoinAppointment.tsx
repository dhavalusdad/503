import { useState, useEffect, useRef } from 'react';

import { GaussianBlurBackgroundProcessor } from '@twilio/video-processors';
import clsx from 'clsx';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { SyncClient } from 'twilio-sync';
import { LocalAudioTrack, type LocalTrack, LocalVideoTrack } from 'twilio-video';

import { useGetAppointmentDetailsByVideoRoom } from '@/api/appointment';
import { useNotifyParticipant } from '@/api/notification';
import { UserRole } from '@/api/types/user.dto';
import { jwtUtils } from '@/api/utils/jwtUtlis';
import { ROUTES } from '@/constants/routePath';
import { AppointmentStatus } from '@/enums';
import type { UserAppointment } from '@/features/admin/components/appointmentList/types';
import { WaitingRoom } from '@/features/video-call/components/WaitingRoom';
import { useVideoCall } from '@/features/video-call/store/useVideoCall';
import { clearAllTwilioData } from '@/features/video-call/utils/cleanup';
import { validateDisplayName } from '@/features/video-call/utils/format';
import {
  createAudioTrack,
  createVideoTrack,
  getStoredUserPreferences,
  requestMediaPermissions,
  storeUserPreferences,
} from '@/features/video-call/utils/media';
import { fetchAccessToken } from '@/features/video-call/utils/twilio';
import {
  getTwilioIdentity,
  getTwilioSessionDetails,
  updateTwilioSessionDetails,
} from '@/features/video-call/utils/twilioSessionStorage';
import { usePopupClose } from '@/hooks/usePopupClose';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import ButtonWithTooltip from '@/stories/Common/ButtonWithTooltip';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import SwiperComponent from '@/stories/Common/Swiper';

export const API_BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:7000';

export default function JoinAppointment() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string; role: string }>();
  const { search, state } = useLocation();
  const query = new URLSearchParams(search);
  const { reset, setIdentity, identity, setLocalTracks } = useVideoCall();
  const invite = query.get('invite');
  const inviteToken = invite || sessionStorage.getItem('inviteToken');
  const { role: loginRole } = useSelector(currentUser);
  const [role, setRole] = useState<string>(loginRole);
  const [displayName, setDisplayName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [previewTracks, setPreviewTracks] = useState<LocalTrack[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isJoiningErrorDuplicate, setIsJoiningErrorDuplicate] = useState(false);
  const [audioDeviceList, setAudioDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceList, setVideoDeviceList] = useState<MediaDeviceInfo[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const videoMenuRef = useRef<HTMLDivElement>(null);
  const { isOpen: isMenuVisible, setIsOpen: setMenuVisible } = usePopupClose({
    popupRef: menuRef as React.RefObject<HTMLElement>,
    buttonRef: buttonRef as React.RefObject<HTMLElement>,
  });

  const videoButtonRef = useRef<HTMLDivElement>(null);
  const { isOpen: isVideoMenuVisible, setIsOpen: setVideoMenuVisible } = usePopupClose({
    popupRef: videoMenuRef as React.RefObject<HTMLElement>,
    buttonRef: videoButtonRef as React.RefObject<HTMLElement>,
  });
  // Pre-join blur state
  const [isBlurProcessing, setIsBlurProcessing] = useState(false);
  const [blurMode, setBlurMode] = useState<'LIGHT_BLUR' | 'FULL_BLUR' | ''>('');
  const processorRef = useRef<GaussianBlurBackgroundProcessor | null>(null);
  const [hasPermissions, setHasPermissions] = useState({
    video: false,
    audio: false,
  });
  const [hasDevices, setHasDevices] = useState<{
    video: MediaDeviceInfo | undefined;
    audio: MediaDeviceInfo | undefined;
  }>({
    video: undefined,
    audio: undefined,
  });
  const [waitingForTherapist, setWaitingForTherapist] = useState(false);
  const [fromRejoin, setFromRejoin] = useState<boolean>(false);

  const {
    data: appointmentDetails,
    isLoading,
    isError,
  } = useGetAppointmentDetailsByVideoRoom(roomId!);
  const { mutate: notifyParticipantWaitingStatus } = useNotifyParticipant({
    role: role as UserRole,
    user_id: getTwilioSessionDetails()?.userId || '',
  });

  useEffect(() => {
    clearAllTwilioData();
    if (state?.fromRejoin) {
      const { displayName: storedName, identity } = getStoredUserPreferences();
      setDisplayName(storedName);
      setIdentity(identity);
    }
    if (
      appointmentDetails?.status &&
      appointmentDetails?.status !== AppointmentStatus.COMPLETED &&
      appointmentDetails?.status !== AppointmentStatus.NO_SHOW &&
      appointmentDetails?.status !== AppointmentStatus.CANCELLED
    ) {
      initializePreview();
    }
  }, [appointmentDetails]);

  useEffect(() => {
    if (invite) {
      const roleFromToken =
        jwtUtils.getUserFromToken(invite)?.role || getStoredUserPreferences().role;
      if (roleFromToken) {
        setRole(roleFromToken);
      }
    }
  }, [invite, fromRejoin]);

  useEffect(() => {
    if (invite) {
      sessionStorage.setItem('inviteToken', invite);
      navigate(`/join-appointment/${roomId}`, { replace: true });
    }
  }, [invite, navigate, roomId]);

  useEffect(() => {
    if (state?.fromRejoin && role !== UserRole.THERAPIST) {
      setFromRejoin(true);
    }
  }, [state, role]);

  useEffect(() => {
    if (role === UserRole.THERAPIST && appointmentDetails && !displayName) {
      const therapistName = appointmentDetails.therapist.user.first_name || 'Therapist';
      setDisplayName(therapistName);
    }
  }, [role, appointmentDetails, displayName]);

  useEffect(() => {
    if (!isLoading) {
      if (
        appointmentDetails?.status === AppointmentStatus.COMPLETED ||
        appointmentDetails?.status === AppointmentStatus.NO_SHOW ||
        appointmentDetails?.status === AppointmentStatus.CANCELLED
      ) {
        navigate(ROUTES.SESSION_EXPIRED.path);
      }
    }
  }, [appointmentDetails, isLoading, isError, navigate]);

  const initializePreview = async () => {
    try {
      if (isJoiningErrorDuplicate) return;

      // 1) Request permissions first to ensure device labels are available
      const permissions = await requestMediaPermissions();
      setHasPermissions({ ...permissions });

      // 2) Re-enumerate devices AFTER permission to get full device labels
      const devices = await navigator.mediaDevices.enumerateDevices();

      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      const videoInputs = devices.filter(d => d.kind === 'videoinput');

      const defaultAudio = audioInputs[0];
      const defaultVideo = videoInputs[0];

      setAudioDeviceList([...(audioInputs || [])]);
      setVideoDeviceList([...(videoInputs || [])]);
      setHasDevices({ audio: defaultAudio, video: defaultVideo });

      // 3) Create initial preview tracks immediately so the user sees video/audio after reload
      if (permissions?.audio || permissions?.video) {
        const audioTrack = permissions?.audio
          ? await createAudioTrack(defaultAudio?.deviceId)
          : null;
        const videoTrack = permissions?.video
          ? await createVideoTrack(defaultVideo?.deviceId)
          : null;
        setIsVideoEnabled(Boolean(defaultVideo && permissions.video));
        setIsAudioEnabled(Boolean(defaultAudio && permissions.audio));
        const tracks = [audioTrack, videoTrack].filter(d => d !== null);
        setPreviewTracks([...tracks]);
      }
    } catch (error) {
      console.error('Failed to initialize preview:', error);
    }
  };

  const audioVideo = () => {
    if (
      appointmentDetails?.status === AppointmentStatus.COMPLETED ||
      appointmentDetails?.status === AppointmentStatus.NO_SHOW ||
      appointmentDetails?.status === AppointmentStatus.CANCELLED
    )
      return;
    if (hasPermissions?.audio || hasPermissions?.video) {
      // Ensure device labels are refreshed after permissions by re-enumerating
      navigator.mediaDevices
        .enumerateDevices()
        .then(devices => {
          setAudioDeviceList([...(devices.filter(d => d.kind === 'audioinput') || [])]);
          setVideoDeviceList([...(devices.filter(d => d.kind === 'videoinput') || [])]);
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    audioVideo();
  }, [hasPermissions, appointmentDetails]);

  // Keep device lists in sync if devices are plugged/unplugged
  useEffect(() => {
    const handleChange = async () => {
      if (
        appointmentDetails?.status === AppointmentStatus.COMPLETED ||
        appointmentDetails?.status === AppointmentStatus.NO_SHOW ||
        appointmentDetails?.status === AppointmentStatus.CANCELLED
      )
        return;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDeviceList([...(devices.filter(d => d.kind === 'audioinput') || [])]);
        setVideoDeviceList([...(devices.filter(d => d.kind === 'videoinput') || [])]);
      } catch (e) {
        console.error(e);
      }
    };
    navigator.mediaDevices?.addEventListener?.('devicechange', handleChange);
    return () => {
      navigator.mediaDevices?.removeEventListener?.('devicechange', handleChange);
    };
  }, [appointmentDetails]);

  useEffect(() => {
    const saved = sessionStorage.getItem('BlurMode');
    if (saved === 'LIGHT_BLUR' || saved === 'FULL_BLUR') {
      setBlurMode(saved as 'LIGHT_BLUR' | 'FULL_BLUR');
    }
  }, []);

  useEffect(() => {
    const apply = async () => {
      if (!blurMode) return;
      const videoTrack = previewTracks?.find(t => t.kind === 'video') as
        | LocalVideoTrack
        | undefined;
      if (videoTrack) {
        await applyBlurIfNeededTo(videoTrack);
      }
    };
    apply();
  }, [blurMode, previewTracks]);

  const toggleVideo = () => {
    if (!hasDevices.video || !hasPermissions.video) {
      return;
    }

    const videoTrack = previewTracks?.find(track => track.kind === 'video');
    if (videoTrack && videoTrack.kind === 'video') {
      if (isVideoEnabled) {
        // Stop the track completely to free up camera resources
        videoTrack.disable();
        videoTrack.stop();
      } else {
        // Recreate the video track when enabling
        videoTrack.enable();
        videoTrack.restart();
      }
      setIsVideoEnabled(!isVideoEnabled);
    } else {
      initializePreview();
    }
  };

  const toggleAudio = () => {
    if (!hasDevices.audio || !hasPermissions.audio) {
      return;
    }

    const audioTrack = previewTracks?.find(track => track.kind === 'audio');

    if (audioTrack && audioTrack.kind === 'audio') {
      if (isAudioEnabled) {
        // Stop the track completely to free up microphone resources
        audioTrack.disable();
        audioTrack.stop();
      } else {
        audioTrack.enable();
        audioTrack.restart();
      }
      setIsAudioEnabled(!isAudioEnabled);
    } else {
      initializePreview();
    }
  };

  const handleToggleBlur = async (mode?: 'LIGHT_BLUR' | 'FULL_BLUR' | '') => {
    try {
      if (isBlurProcessing) return;
      setIsBlurProcessing(true);

      const videoTrack = previewTracks?.find(t => t.kind === 'video') as
        | LocalVideoTrack
        | undefined;
      if (!videoTrack) {
        setIsBlurProcessing(false);
        return;
      }

      if (processorRef.current) {
        try {
          await videoTrack.removeProcessor(processorRef.current);
        } catch (e) {
          console.error(e);
        }
        processorRef.current = null;
      }

      if (mode) {
        const config =
          mode === 'LIGHT_BLUR'
            ? { blurFilterRadius: 3, maskBlurRadius: 5 }
            : { blurFilterRadius: 15, maskBlurRadius: 5 };
        const processor = new GaussianBlurBackgroundProcessor({
          assetsPath: '/twilio-video-processors/',
          ...config,
        });
        await processor.loadModel();
        await videoTrack.addProcessor(processor);
        processorRef.current = processor;
        setBlurMode(mode);
        sessionStorage.setItem('BlurMode', mode);
      } else {
        setBlurMode('');
        sessionStorage.removeItem('BlurMode');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsBlurProcessing(false);
    }
  };

  // Re-apply blur to a new LocalVideoTrack if user switches camera while a blur is selected
  const applyBlurIfNeededTo = async (track: LocalVideoTrack) => {
    if (!blurMode) return;
    try {
      // Clean up previous processor (if any)
      if (processorRef.current) {
        try {
          await track.removeProcessor(processorRef.current);
        } catch (e) {
          console.error(e);
        }
      }
      const config =
        blurMode === 'LIGHT_BLUR'
          ? { blurFilterRadius: 3, maskBlurRadius: 5 }
          : { blurFilterRadius: 15, maskBlurRadius: 5 };
      const processor = new GaussianBlurBackgroundProcessor({
        assetsPath: '/twilio-video-processors/',
        ...config,
      });
      await processor.loadModel();
      await track.addProcessor(processor);
      processorRef.current = processor;
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoinAppointment = async () => {
    if (!roomId) {
      return;
    }

    if (role !== UserRole.THERAPIST) {
      const nameError = validateDisplayName(displayName);
      if (nameError) {
        return;
      }
    }

    setIsJoining(true);

    try {
      reset();

      let identityToUse: string | null = null;

      if (fromRejoin) {
        identityToUse = getTwilioIdentity();
      }

      storeUserPreferences(displayName, roomId);

      const tokenData = await fetchAccessToken(displayName, roomId, inviteToken || '');
      const role = tokenData?.data?.role;
      const userId = tokenData?.data?.userId;

      if (!identityToUse) {
        identityToUse = tokenData?.data?.identity;
      }
      setIdentity(identityToUse);
      // Store token and identity in centralized session storage
      updateTwilioSessionDetails({
        token: tokenData?.data?.token,
        identity: identityToUse,
        displayName: displayName,
        room: roomId,
        roomSid: roomId,
        role,
        participantType: role == UserRole.THERAPIST ? 'HOST' : 'CLIENT',
        userId: userId,
      });

      setLocalTracks(previewTracks);
      // Store user's media preferences
      sessionStorage.setItem('userAudioEnabled', isAudioEnabled.toString());
      sessionStorage.setItem('userVideoEnabled', isVideoEnabled.toString());

      // Init Sync client
      const syncClient = new SyncClient(tokenData?.data?.token);
      const doc = await syncClient.document(roomId);
      const current = doc.data as { therapistJoined?: boolean; startedAt?: string };

      if (role === UserRole.THERAPIST) {
        await doc.set({
          ...doc.data,
          therapistJoined: true,
          startedAt: new Date().toISOString(),
        });
        if (appointmentDetails?.client?.user.user_settings?.length) {
          notifyParticipantWaitingStatus({
            recipientId: appointmentDetails?.client?.user?.id,
            roomId: roomId,
            appointmentId: appointmentDetails?.id,
          });
        }
        navigate(ROUTES.ROOM.navigatePath(roomId), {
          state: { role, inviteToken: inviteToken || '' },
        });
        handleStopAllMediaTrack();
      } else {
        if (current?.therapistJoined) {
          navigate(ROUTES.ROOM.navigatePath(roomId), {
            state: { role, inviteToken: inviteToken || '' },
          });
          handleStopAllMediaTrack();
        } else {
          setWaitingForTherapist(true);
          notifyParticipantWaitingStatus({
            recipientId: appointmentDetails?.therapist?.user?.id,
            roomId: roomId,
            appointmentId: appointmentDetails?.id,
          });
          doc.on('updated', event => {
            if (event.data?.therapistJoined) {
              navigate(ROUTES.ROOM.navigatePath(roomId), {
                state: { role, inviteToken: inviteToken || '' },
              });
              handleStopAllMediaTrack();
            }
          });
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('identity')) {
        setIsJoiningErrorDuplicate(true);
      }
      console.error('Failed to join appointment:', error);
      setIsJoining(false);
    }
  };
  const handleStopAllMediaTrack = () => {
    return previewTracks?.forEach(track => {
      if (track && track.kind !== 'data' && typeof track.stop === 'function') {
        track.stop();
      }
    });
  };

  const changInputDevice = async (device: MediaDeviceInfo, kind: 'audio' | 'video') => {
    setHasDevices(prev => ({ ...prev, [kind]: device }));

    const existing = previewTracks.find(d => d.kind === kind);
    if (existing && typeof (existing as LocalAudioTrack | LocalVideoTrack).stop === 'function') {
      (existing as LocalAudioTrack | LocalVideoTrack).stop();
    }

    const track =
      kind == 'audio'
        ? await createAudioTrack(device.deviceId)
        : await createVideoTrack(device.deviceId);

    // If switching video device and blur is enabled, reapply to new track
    if (kind === 'video' && track && (track as LocalVideoTrack)) {
      await applyBlurIfNeededTo(track as LocalVideoTrack);
    }

    setPreviewTracks([
      ...previewTracks.filter(d => d.kind == (kind === 'audio' ? 'video' : 'audio')),
      track,
    ]);

    if (kind == 'audio') {
      sessionStorage.setItem('audioDeviceId', device.deviceId);
    } else {
      sessionStorage.setItem('videoDeviceId', device.deviceId);
    }
  };

  const userDependentList = () => {
    if (appointmentDetails?.users_appointment?.length > 0) {
      return [appointmentDetails?.client, ...(appointmentDetails?.users_appointment || {})].filter(
        Boolean
      );
    } else {
      return [appointmentDetails?.client].filter(Boolean);
    }
  };

  if (isJoiningErrorDuplicate) {
    return (
      <div className='h-screen bg-white py-60px xl:px-134px lg:px-14 px-7'>
        <div className='flex flex-col items-center gap-30px'>
          <Icon name='logo-secondary' />
          <h5 className='text-xl font-bold text-blackdark leading-7 text-center'>
            {role === UserRole.THERAPIST
              ? 'It looks like a Therapist has already joined this session via this link.'
              : 'It looks like a participant has already joined this call with this name. Please try again using a different name.'}
          </h5>
          <Button
            onClick={() => navigate(-1)}
            variant='filled'
            className='bg-green-800 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition'
          >
            Return to home screen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='h-screen bg-white py-60px xl:px-134px lg:px-14 px-7'>
      {/* Header */}
      <div className='flex flex-col items-center gap-30px'>
        <Icon name='logo-secondary' />
        <h5 className='text-xl font-bold text-blackdark leading-7 text-center'>
          Care you trust in. Made simple with Cyti
        </h5>
      </div>

      {/* Content */}
      <div className='flex lg:flex-row flex-col items-center lg:gap-5 gap-8 w-full sm:mt-20 mt-10'>
        <div className='lg:w-3/5 w-full max-w-[600px] lg:max-w-[unset] flex flex-col items-center gap-5'>
          <div className='w-full aspect-video min-h-250px bg-blacklightdark rounded-20px flex justify-center items-center relative overflow-hidden'>
            {Array.isArray(previewTracks) && previewTracks?.length > 0 ? (
              <VideoPreview
                tracks={previewTracks}
                isVideoEnabled={Boolean(hasPermissions.video && isVideoEnabled)}
                isAudioEnabled={Boolean(
                  hasDevices?.audio && hasPermissions.audio && isAudioEnabled
                )}
                displayName={displayName}
              />
            ) : (
              <div className='flex flex-col items-center gap-2.5'>
                <div className='w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto'>
                  <span className='text-2xl font-bold text-white'>
                    {displayName.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <Icon name='videoOff' className='w-6 h-6 icon-wrapper text-white mt-1' />
                <p className='text-white text-xl font-normal leading-7'>Camera is off</p>
              </div>
            )}
          </div>

          {/* Control buttons */}
          <div className='flex flex-wrap items-center gap-3'>
            {/* Audio Control Button Group */}
            <div
              ref={buttonRef}
              className='relative flex items-center gap-2 bg-primary rounded-md px-2 py-1'
            >
              {/* {isAudioEnabled && hasDevices.audio && hasPermissions.audio && ( */}
              <ButtonWithTooltip
                tooltipLabel='Audio Input Options'
                variant='none'
                icon={
                  <Icon
                    name='dropdownArrow'
                    className={clsx(
                      'icon-wrapper w-4 h-4 transform transition-transform duration-200 ease-in-out',
                      isMenuVisible ? 'rotate-0' : 'rotate-180',
                      isAudioEnabled && hasDevices.audio && hasPermissions.audio
                        ? 'cursor-pointer'
                        : 'cursor-not-allowed'
                    )}
                  />
                }
                onClick={
                  isAudioEnabled && hasDevices.audio && hasPermissions.audio
                    ? () => setMenuVisible(!isMenuVisible)
                    : undefined
                }
                className='text-white !p-0'
                parentClassName='h-4'
              />
              {/* )} */}
              <ButtonWithTooltip
                tooltipLabel={
                  hasDevices.audio && hasPermissions.audio && isAudioEnabled ? 'Mute' : 'Unmute'
                }
                onClick={toggleAudio}
                variant='none'
                parentClassName='h-8'
                className={clsx(
                  'rounded-lg text-white !p-1.5 !duration-100',
                  hasDevices.audio && hasPermissions.audio && isAudioEnabled
                    ? 'bg-white'
                    : 'bg-white'
                )}
                isDisabled={!hasDevices.audio || !hasPermissions.audio}
                icon={
                  <Icon
                    name={
                      hasDevices.audio && hasPermissions.audio && isAudioEnabled ? 'mic' : 'micOff'
                    }
                    className={clsx(
                      'w-5 h-5 icon-wrapper',
                      hasDevices.audio && hasPermissions.audio && isAudioEnabled
                        ? 'text-primary'
                        : 'text-red'
                    )}
                  />
                }
              />
              {isMenuVisible && hasDevices.audio && hasPermissions.audio && isAudioEnabled && (
                <div
                  ref={menuRef}
                  className='absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg min-w-64 z-50 overflow-hidden shadow-2xl'
                >
                  <div className='px-4 py-3 text-center'>
                    <h3 className='text-base font-bold text-primary leading-5'>Microphone</h3>
                  </div>
                  {audioDeviceList.map((device, index) => (
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
                      variant={hasDevices?.audio?.deviceId === device.deviceId ? 'filled' : 'none'}
                    />
                  ))}
                </div>
              )}
            </div>
            {/* Video Control Button Group */}
            {/* setBlurMode */}
            {/* Video Control Button Group */}
            <div
              ref={videoButtonRef}
              className='relative flex items-center gap-2 bg-primary rounded-md px-2 py-1'
            >
              {/* Dropdown Arrow */}
              {/* {isVideoEnabled && hasPermissions.video && ( */}
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
                tooltipLabel={
                  hasDevices.video && hasPermissions.video && isVideoEnabled
                    ? 'Turn Off Camera'
                    : 'Turn On Camera'
                }
                onClick={toggleVideo}
                variant='none'
                parentClassName='h-8'
                className={clsx(
                  'rounded-lg text-white !p-1.5 !duration-100',
                  hasDevices.video && hasPermissions.video && isVideoEnabled
                    ? 'bg-white'
                    : 'bg-white'
                )}
                isDisabled={!hasDevices.video || !hasPermissions.video}
                icon={
                  <Icon
                    name={
                      hasDevices.video && hasPermissions.video && isVideoEnabled
                        ? 'video'
                        : 'videoOff'
                    }
                    className={clsx(
                      'w-5 h-5 icon-wrapper',
                      hasDevices.video && hasPermissions.video && isVideoEnabled
                        ? 'text-primary'
                        : 'text-red'
                    )}
                  />
                }
              />

              {/* Video Effects Dropdown Menu */}
              {isVideoMenuVisible && isVideoEnabled && (
                <div
                  ref={videoMenuRef}
                  className='absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg min-w-48 z-50 overflow-hidden shadow-2xl'
                >
                  <div className='px-4 py-3 text-center'>
                    <h3 className='text-base font-bold text-primary leading-5'>
                      Video Input Devices
                    </h3>
                  </div>
                  {videoDeviceList.map(device => {
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
                    onClick={() => handleToggleBlur('')}
                    className={clsx(
                      'w-full text-blackdark !leading-22px rounded-none !p-2.5 !text-15px !justify-start',
                      !blurMode ? 'hover:!bg-primary' : 'hover:bg-primarylight/30'
                    )}
                    title={isBlurProcessing ? 'Processing...' : 'No Effects'}
                    variant={!blurMode ? 'filled' : 'none'}
                    isDisabled={isBlurProcessing}
                  />
                  <Button
                    titleClassName='text-left'
                    onClick={() => handleToggleBlur('LIGHT_BLUR')}
                    className={clsx(
                      'w-full text-blackdark !leading-22px rounded-none !p-2.5 !text-15px !justify-start',
                      blurMode === 'LIGHT_BLUR' ? 'hover:!bg-primary' : 'hover:bg-primarylight/30'
                    )}
                    title={isBlurProcessing ? 'Processing...' : 'Slightly Blur'}
                    variant={blurMode === 'LIGHT_BLUR' ? 'filled' : 'none'}
                    isDisabled={isBlurProcessing}
                  />
                  <Button
                    titleClassName='text-left'
                    onClick={() => handleToggleBlur('FULL_BLUR')}
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
            </div>
          </div>
        </div>

        <div className='lg:w-2/5'>
          <>
            {fromRejoin && identity && (
              <div className='max-w-347px w-full mx-auto text-center'>
                <p className='text-base text-primarygray mb-4'>
                  Welcome back, <strong>{displayName}</strong>!
                </p>
                <Button
                  onClick={handleJoinAppointment}
                  variant='filled'
                  className='w-full rounded-10px'
                  isDisabled={isJoining}
                >
                  {isJoining ? 'Rejoining...' : 'Rejoin Session'}
                </Button>
              </div>
            )}

            {!fromRejoin && waitingForTherapist && role !== UserRole.THERAPIST && (
              <WaitingRoom
                tenant_id={appointmentDetails.tenant_id}
                appointmentId={appointmentDetails?.id}
                role={role}
              />
            )}

            {!fromRejoin && !waitingForTherapist && role === UserRole.THERAPIST && (
              <div className='max-w-347px w-full mx-auto flex flex-col gap-[20px]'>
                <div className='flex flex-col gap-1.5'>
                  <div>
                    <h2 className='font-bold text-3xl text-blackdark leading-7 mb-6'>
                      Ready to join?
                    </h2>
                    <p className='text-primarygray text-base font-normal'>
                      Here's an overview of the Client joining the session.
                    </p>
                  </div>
                  {userDependentList().length > 1 ? (
                    <SwiperComponent
                      showNav={false}
                      showBullets={true}
                      className='w-full h-fit !pb-5'
                    >
                      {userDependentList().map((item: UserAppointment) => (
                        <div key={item?.user?.id} className='w-full'>
                          {/* <MemberCard member={item.user} index={index} showDeleteButton={false} /> */}

                          <div key={item?.user?.id} className='flex flex-col gap-1.5'>
                            <p>
                              <strong>Full Name: </strong>
                              {`${item?.user?.first_name} ${item?.user?.last_name}`}
                            </p>
                            <p>
                              <strong>Age: </strong>
                              {item?.user?.dob
                                ? moment().diff(moment(item?.user?.dob), 'years')
                                : '-'}
                            </p>
                            <p>
                              <strong>Gender: </strong>
                              {item?.user?.gender}
                            </p>
                            <p>
                              <strong>Therapy Type: </strong>
                              {appointmentDetails?.therapy_type?.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </SwiperComponent>
                  ) : (
                    userDependentList().map((item: UserAppointment) => (
                      <div key={item?.user?.id} className='w-full'>
                        {/* <MemberCard member={item.user} index={index} showDeleteButton={false} /> */}

                        <div key={item?.user?.id} className='flex flex-col gap-1.5'>
                          <p>
                            <strong>Full Name: </strong>
                            {`${item?.user?.first_name} ${item?.user?.last_name}`}
                          </p>
                          <p>
                            <strong>Age: </strong>
                            {item?.user?.dob ? moment().diff(moment(item?.user?.dob), 'years') : ''}
                          </p>
                          <p>
                            <strong>Gender: </strong>
                            {item?.user?.gender}
                          </p>
                          <p>
                            <strong>Therapy Type: </strong>
                            {appointmentDetails?.therapy_type?.name}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div>
                  <Button
                    onClick={handleJoinAppointment}
                    isDisabled={isJoining || !displayName.trim()}
                    variant='filled'
                    className='w-full rounded-10px'
                  >
                    {isJoining ? 'Joining...' : 'Start Session'}
                  </Button>
                </div>
              </div>
            )}

            {!fromRejoin && !waitingForTherapist && role !== UserRole.THERAPIST && (
              <div className='max-w-347px w-full mx-auto'>
                <div className='flex flex-col gap-1.5'>
                  <h2 className='font-bold text-xl text-blackdark leading-7'>Ready to join?</h2>
                  <p className='text-primarygray text-base font-normal'>
                    Enter your details to join the session
                  </p>
                </div>
                <InputField
                  id='displayName'
                  type='text'
                  placeholder='Enter your name'
                  label='Your display name'
                  labelClass='!text-base !leading-22px'
                  parentClassName='my-30px'
                  inputClass='bg-surfacelight font-bold placeholder:font-normal'
                  value={displayName}
                  onChange={e => {
                    setDisplayName(e.target.value);
                    setIsJoiningErrorDuplicate(false);
                  }}
                  disabled={isJoining}
                  className='w-full'
                  error={
                    isJoiningErrorDuplicate && role !== UserRole.THERAPIST
                      ? 'Its looks like a participant has already joined this call with this name. Please try again using a different name.'
                      : ''
                  }
                />
                <Button
                  onClick={handleJoinAppointment}
                  isDisabled={isJoining || !displayName.trim()}
                  variant='filled'
                  className='w-full rounded-10px'
                >
                  {isJoining ? 'Joining...' : 'Join Session'}
                </Button>
              </div>
            )}
          </>
        </div>
      </div>
    </div>
  );
}

interface VideoPreviewProps {
  tracks: LocalTrack[];
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  displayName: string;
}

const VideoPreview = ({
  tracks,
  isVideoEnabled,
  isAudioEnabled,
  displayName,
}: VideoPreviewProps) => {
  const videoTrack = tracks.find(track => track.kind === 'video');

  useEffect(() => {
    if (videoTrack && isVideoEnabled) {
      const videoElement = document.getElementById('preview-video') as HTMLVideoElement;
      if (videoElement) {
        try {
          if (
            'attach' in videoTrack &&
            typeof (videoTrack as LocalVideoTrack).attach === 'function'
          ) {
            (videoTrack as LocalVideoTrack).attach(videoElement);
            return () => {
              if (
                'detach' in videoTrack &&
                typeof (videoTrack as LocalVideoTrack).detach === 'function'
              ) {
                (videoTrack as LocalVideoTrack).detach(videoElement);
              }
              videoElement.srcObject = null;
            };
          } else {
            const mediaStreamTrack =
              'mediaStreamTrack' in videoTrack && (videoTrack as LocalVideoTrack).mediaStreamTrack
                ? (videoTrack as LocalVideoTrack).mediaStreamTrack
                : (videoTrack as unknown as MediaStreamTrack);
            videoElement.srcObject = new MediaStream([mediaStreamTrack]);
            return () => {
              videoElement.srcObject = null;
            };
          }
        } catch (error) {
          console.error('Failed to attach preview video:', error);
        }
      }
    }
  }, [videoTrack, isVideoEnabled]);

  return (
    <div className='relative w-full h-full'>
      {isVideoEnabled && videoTrack ? (
        <video
          id='preview-video'
          className='w-full h-full object-cover rounded-2xl'
          autoPlay
          muted
          playsInline
        />
      ) : (
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='flex flex-col items-center gap-2.5'>
            <div className='w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto'>
              <span className='text-2xl font-bold text-white'>
                {displayName.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              {!isVideoEnabled && (
                <div className='bg-gray-600 rounded-10px p-2 w-10 h-10 flex items-center justify-center'>
                  <Icon name='videoOff' className='icon-wrapper w-5 h-5 text-white' />
                </div>
              )}

              {!isAudioEnabled && (
                <div className='bg-gray-600 rounded-10px p-2 w-10 h-10 flex items-center justify-center'>
                  <Icon name='micOff' className='icon-wrapper w-5 h-5 text-white' />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className='absolute bottom-3 left-3'>
        <span className='text-white text-sm font-normal bg-black/50 px-2 py-1 rounded-md'>
          {displayName || 'You'} (Preview)
        </span>
      </div>
    </div>
  );
};
