import { useCallback, useState, useRef, useEffect } from 'react';

import { GaussianBlurBackgroundProcessor } from '@twilio/video-processors';
import { LocalVideoTrack } from 'twilio-video';

import { useVideoCall } from '@/features/video-call/store/useVideoCall';

export const useBackgroundBlur = () => {
  const { room, isBlurEnabled, setBlurEnabled } = useVideoCall();
  const [isProcessing, setIsProcessing] = useState(false);
  const processorRef = useRef<GaussianBlurBackgroundProcessor | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [blurMode, setBlurMode] = useState<'LIGHT_BLUR' | 'FULL_BLUR' | ''>('');

  const createProcessor = async (mode: 'LIGHT_BLUR' | 'FULL_BLUR') => {
    const config =
      mode === 'LIGHT_BLUR'
        ? { blurFilterRadius: 3, maskBlurRadius: 5 }
        : { blurFilterRadius: 15, maskBlurRadius: 5 };

    const processor = new GaussianBlurBackgroundProcessor({
      assetsPath: '/twilio-video-processors/',
      ...config,
    });

    await processor.loadModel();
    return processor;
  };

  const handleToggleBlur = useCallback(
    async (mode?: 'LIGHT_BLUR' | 'FULL_BLUR' | '') => {
      if (!room?.localParticipant || isProcessing) return;
      if (mode) {
        sessionStorage.setItem('BlurMode', mode);
      } else {
        sessionStorage.removeItem('BlurMode');
      }

      setIsProcessing(true);

      try {
        const videoPublication = Array.from(room.localParticipant.videoTracks.values()).find(
          p => p.track?.kind === 'video' && p.track.name !== 'screen'
        );

        if (!videoPublication?.track) {
          console.error('No video track found to apply blur');
          return;
        }

        const videoTrack = videoPublication.track as LocalVideoTrack;
        // Remove any existing processor
        if (processorRef.current) {
          await videoTrack.removeProcessor(processorRef.current);
          processorRef.current = null;
        }

        if (mode) {
          // Create new processor with chosen mode
          processorRef.current = await createProcessor(mode);
          setIsModelLoaded(true);
          setBlurMode(mode);

          // Add the new processor
          await videoTrack.addProcessor(processorRef.current);
          setBlurEnabled(true);
        } else {
          setBlurEnabled(false);
          setBlurMode('');
        }
      } catch (err) {
        console.error(' Failed to toggle blur:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    [room, isProcessing, setBlurEnabled]
  );

  // Cleanup on unmount
  useEffect(() => {
    let timeOut;
    if (room?.localParticipant) {
      const getBlurMode = sessionStorage.getItem('BlurMode');
      if (getBlurMode) {
        timeOut = setTimeout(() => {
          handleToggleBlur(getBlurMode as 'LIGHT_BLUR' | 'FULL_BLUR' | '');
        }, 1000);
      }
    }

    return () => {
      if (processorRef.current && room?.localParticipant) {
        room.localParticipant.videoTracks.forEach(pub => {
          if (pub.track?.kind === 'video') {
            try {
              (pub.track as LocalVideoTrack).removeProcessor(processorRef.current!);
            } catch (e) {
              console.error('Cleanup error:', e);
            }
          }
          if (timeOut as string) {
            clearTimeout(timeOut);
          }
        });
      }
    };
  }, [room]);

  return {
    handleToggleBlur,
    isBlurEnabled,
    blurMode,
    isProcessing,
    isModelLoaded,
  };
};
