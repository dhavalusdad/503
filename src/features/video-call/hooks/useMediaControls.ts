import { useCallback, useState } from 'react';

import { createLocalAudioTrack, createLocalVideoTrack, LocalVideoTrack } from 'twilio-video';

import { useVideoCall } from '@/features/video-call/store/useVideoCall';
import { startScreenShare, stopScreenShare } from '@/features/video-call/utils/media';

export const useMediaControls = () => {
  const [currentScreenTrack, setCurrentScreenTrack] = useState<LocalVideoTrack | null>(null);

  const {
    room,
    isMuted,
    isVideoEnabled,
    isScreenSharing,
    setMuted,
    setVideoEnabled,
    setScreenSharing,
    setScreenShareTrack,
  } = useVideoCall();

  const handleToggleMute = useCallback(async () => {
    if (!room?.localParticipant) return;

    const audioPublication = Array.from(room.localParticipant.audioTracks.values())[0];
    if (audioPublication && audioPublication.track) {
      if (isMuted) {
        audioPublication.track.restart();

        audioPublication.track.enable();
        setMuted(false);
      } else {
        audioPublication.track.stop();
        audioPublication.track.disable();
        setMuted(true);
      }
    } else {
      try {
        const newAudioTrack = await createLocalAudioTrack({
          echoCancellation: true,
          noiseSuppression: true,
        });

        await room.localParticipant.publishTrack(newAudioTrack);
        setMuted(true);
      } catch (error) {
        console.error('Failed to create new audio track:', error);
        setMuted(true);
      }
    }
  }, [room, isMuted, setMuted]);

  const handleToggleVideo = useCallback(async () => {
    if (!room?.localParticipant) return;

    const videoPublication = Array.from(room.localParticipant.videoTracks.values()).find(
      publication => publication.track && publication.track.name !== 'screen'
    );
    if (videoPublication && videoPublication.track) {
      if (isVideoEnabled) {
        videoPublication.track.stop();
        videoPublication.track.disable();
        setVideoEnabled(false);
      } else {
        videoPublication.track.restart();

        videoPublication.track.enable();
        setVideoEnabled(true);
      }
    } else {
      try {
        // check if the device is available
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoInput = devices.some(device => device.kind === 'videoinput');
        if (!hasVideoInput) {
          throw new Error('No video input device found');
        }

        const newVideoTrack = await createLocalVideoTrack({
          width: 640,
          height: 480,
          frameRate: 24,
        });

        await room.localParticipant.publishTrack(newVideoTrack, { priority: 'standard' });
        setVideoEnabled(true);
      } catch (error) {
        console.error('Failed to create new video track:', error);
      }
    }
  }, [room, isVideoEnabled, setVideoEnabled]);

  const handleScreenShareStopped = useCallback(
    (event: Event) => {
      if (!room?.localParticipant) return;
      if (event.target && event.target instanceof MediaStreamTrack) {
        try {
          const trackToUnpublish = currentScreenTrack || event.target;
          room.localParticipant.unpublishTrack(trackToUnpublish);
          if (currentScreenTrack) {
            stopScreenShare(currentScreenTrack);
          }
        } catch (error) {
          console.error('Failed to unpublish screen share track:', error);
        }
        setScreenSharing(false);
        setScreenShareTrack(null);
        setCurrentScreenTrack(null);
      }
    },
    [room, currentScreenTrack, setScreenSharing, setScreenShareTrack]
  );

  const handleToggleScreenShare = useCallback(async () => {
    if (!room?.localParticipant) return;

    if (isScreenSharing) {
      if (currentScreenTrack) {
        try {
          room.localParticipant.unpublishTrack(currentScreenTrack);
        } catch (error) {
          console.error('Failed to unpublish screen share track:', error);
        }
        stopScreenShare(currentScreenTrack);
      }
      setScreenSharing(false);
      setScreenShareTrack(null);
      setCurrentScreenTrack(null);
    } else {
      try {
        const screenTrack: LocalVideoTrack | null =
          await startScreenShare(handleScreenShareStopped);
        if (screenTrack) {
          const screenTrackPublication = new LocalVideoTrack(screenTrack?.mediaStreamTrack, {
            name: 'screen',
          });
          await room.localParticipant.publishTrack(screenTrackPublication, { priority: 'high' });
          setScreenSharing(true);
          setScreenShareTrack(screenTrack);
          setCurrentScreenTrack(screenTrack);
        }
      } catch (error) {
        console.error('Failed to start screen share:', error);
      }
    }
  }, [
    room,
    isScreenSharing,
    currentScreenTrack,
    setScreenSharing,
    setScreenShareTrack,
    handleScreenShareStopped,
  ]);

  return {
    handleToggleMute,
    handleToggleVideo,
    handleToggleScreenShare,
  };
};
