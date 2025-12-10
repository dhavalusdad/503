import { useCallback, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { SyncClient } from 'twilio-sync';

import { useEndSession } from '@/api/twilio';
import { UserRole } from '@/api/types/user.dto';
import { useVideoCall } from '@/features/video-call/store/useVideoCall';
import { currentUser } from '@/redux/ducks/user';

import { stopAllActiveMediaTracks } from '../utils/cleanup';
import { clearConnectionDetails } from '../utils/connectionStorage';
import { stopAllMediaStreams } from '../utils/media';
import { sendHandRaiseSignal } from '../utils/twilio';
import {
  clearTwilioSessionDetailsExceptIdentity,
  getTwilioToken,
} from '../utils/twilioSessionStorage';

import type { LocalDataTrack } from 'twilio-video';

export const useUIControls = (appointmentId?: string) => {
  const dispatch = useDispatch();
  const { roomId } = useParams<{ roomId: string }>();

  const { role } = useSelector(currentUser);
  const [isLeaving, setIsLeaving] = useState(false);
  const { mutate: endSession } = useEndSession();

  const {
    room,
    chatOpen,
    handRaisedSids,
    setChatOpen,
    setShowParticipants,
    setShowSettings,
    setShowLeaveConfirm,
    setHasLeftRoom,
    toggleHandRaise,
    reset,
    isClientDetailsOpen,
    setIsClientDetailsOpen,
    isMemoPadOpen,
    setIsMemoPadOpen,
    localTracks,
    identity,
  } = useVideoCall();

  const handleToggleChat = useCallback(() => {
    setShowParticipants(false);
    setChatOpen(!chatOpen);
    setIsClientDetailsOpen(false);
    setIsMemoPadOpen(false);
  }, [
    chatOpen,
    isClientDetailsOpen,
    setIsClientDetailsOpen,
    setChatOpen,
    setShowParticipants,
    isMemoPadOpen,
    setIsClientDetailsOpen,
  ]);

  const handleClientDetailsModel = useCallback(() => {
    setIsClientDetailsOpen(!isClientDetailsOpen);
    setShowParticipants(false);
    setChatOpen(false);
    setIsMemoPadOpen(false);
  }, [
    isClientDetailsOpen,
    setIsClientDetailsOpen,
    chatOpen,
    setChatOpen,
    setShowParticipants,
    isMemoPadOpen,
    setIsClientDetailsOpen,
  ]);

  const handleMemoPadModel = useCallback(() => {
    setIsClientDetailsOpen(false);
    setShowParticipants(false);
    setChatOpen(false);
    setIsMemoPadOpen(!isMemoPadOpen);
  }, [
    isClientDetailsOpen,
    setIsClientDetailsOpen,
    chatOpen,
    setChatOpen,
    setShowParticipants,
    isMemoPadOpen,
    setIsMemoPadOpen,
  ]);

  const handleLeave = useCallback(() => {
    setShowLeaveConfirm(true);
  }, [setShowLeaveConfirm]);

  const handleToggleHandRaise = useCallback(
    (dataTrack: LocalDataTrack) => {
      if (!room?.localParticipant || !dataTrack) return;
      const isRaised = handRaisedSids.has(room.localParticipant.sid);
      toggleHandRaise(room.localParticipant.sid);
      sendHandRaiseSignal(dataTrack, !isRaised, dispatch, room.localParticipant.sid);
    },
    [room, handRaisedSids, toggleHandRaise, dispatch]
  );

  const confirmLeave = useCallback(async () => {
    setIsLeaving(true);
    try {
      if (room) {
        if (identity.includes('TP')) {
          await new Promise<void>((resolve, reject) => {
            endSession(
              { roomId: room.sid, appointmentId },
              {
                onSuccess: () => {
                  resolve();
                },
                onError: error => {
                  console.error('Error ending session:', error);
                  reject(error);
                },
              }
            );
          });

          // Clear session data
          clearTwilioSessionDetailsExceptIdentity();
          clearConnectionDetails();
        }
        localTracks.forEach(track => {
          if (track && track.kind !== 'data' && typeof track.stop === 'function') {
            track.stop();
            track.disable();
          }
        });
        // Stop all active media tracks
        stopAllMediaStreams();
        stopAllActiveMediaTracks(room);

        // Clear session data for therapist role
        const token = getTwilioToken();
        if (role === UserRole.THERAPIST && token) {
          const syncClient = new SyncClient(token);
          const doc = await syncClient.document(roomId);
          await doc.set({});
        }

        room.disconnect();

        clearTwilioSessionDetailsExceptIdentity();
        // Reset state
        reset();

        // Navigate back to lobby
        if (roomId && role) {
          setHasLeftRoom(true);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLeaving(false);
    }
  }, [room, reset, setHasLeftRoom, role, roomId]);

  const enableAudioPlayback = useCallback(() => {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      if (audio.paused) {
        audio.play().catch(() => {});
      }
    });
  }, []);

  return {
    handleToggleChat,
    handleLeave,
    handleToggleHandRaise,
    confirmLeave,
    enableAudioPlayback,
    setShowParticipants,
    setShowSettings,
    setShowLeaveConfirm,
    setChatOpen,
    isLeaving,
    handleClientDetailsModel,
    isClientDetailsOpen,
    setIsClientDetailsOpen,
    isMemoPadOpen,
    setIsMemoPadOpen,
    handleMemoPadModel,
  };
};
