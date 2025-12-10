import { useEffect, useCallback, useState } from 'react';

import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { LocalDataTrack } from 'twilio-video';

import { getRoomDetails } from '@/api/twilio';
import { useVideoCall } from '@/features/video-call/store/useVideoCall';
import { reset } from '@/redux/ducks/videoCall';

import { stopAllActiveMediaTracks } from '../utils/cleanup';
import {
  clearConnectionDetails,
  getConnectionDetails,
  hasValidConnectionDetails,
} from '../utils/connectionStorage';
import { stopAllMediaStreams } from '../utils/media';
import { connectToRoom, disconnectFromRoom, setupRoomEventListeners } from '../utils/twilio';
import {
  clearTwilioSessionDetails,
  getTwilioDisplayName,
  getTwilioIdentity,
  getTwilioRoomSid,
  getTwilioToken,
  updateTwilioSessionDetails,
} from '../utils/twilioSessionStorage';

export const useRoomConnection = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [dataTrack, setDataTrack] = useState<LocalDataTrack | null>(null);
  const [cleanupRoom, setCleanupRoom] = useState<(() => void) | null>(null);

  const {
    room,
    isConnected,
    isConnecting,
    setConnecting,
    setIdentity,
    setHasLeftRoom,
    identity,
    setIsTherapistEndCall,
    localTracks,
  } = useVideoCall();

  const getConnectionDetailsFromStorage = useCallback(() => {
    let token = getTwilioToken();
    let storedIdentity = getTwilioIdentity();
    let storedDisplayName = getTwilioDisplayName();

    // If sessionStorage is empty, try sessionStorage fallback
    if (!token || !storedIdentity) {
      const fallbackDetails = getConnectionDetails();
      if (fallbackDetails) {
        token = fallbackDetails.token;
        storedIdentity = fallbackDetails.identity;
        storedDisplayName = fallbackDetails.displayName;
      }
    }

    return { token, storedIdentity, storedDisplayName };
  }, []);

  const checkRoomStatus = async () => {
    const roomSid = getTwilioRoomSid();
    const roomDetails = await getRoomDetails(roomSid!);

    if (roomDetails?.data?.status === 'completed') {
      // Stop all active media tracks
      localTracks.forEach(track => {
        if (track && track.kind !== 'data' && typeof track.stop === 'function') {
          track.stop();
          track.disable();
        }
      });
      stopAllMediaStreams();
      stopAllActiveMediaTracks(room!);
      // Clear session data
      clearTwilioSessionDetails();
      clearConnectionDetails();

      // Reset state
      reset();

      // Navigate back to lobby
      if (roomId) {
        setIsTherapistEndCall(true);
        setHasLeftRoom(true);
      }

      return false;
    }
    return true;
  };

  const initializeRoom = useCallback(async () => {
    // Wait for user role to be loaded if still loading
    const { token, storedIdentity, storedDisplayName } = getConnectionDetailsFromStorage();

    if (!token || !storedIdentity) {
      if (roomId) {
        setHasLeftRoom(true);
      }
      return;
    }

    if (!roomId) {
      navigate('/');
      return;
    }

    setConnecting(true);

    // Add a timeout to prevent infinite loading
    const connectionTimeout = setTimeout(() => {
      console.error('Connection timeout - forcing setConnecting(false)');
      setConnecting(false);
    }, 30000);

    try {
      if (!(await checkRoomStatus())) {
        clearTimeout(connectionTimeout);
        setConnecting(false);
        return;
      }
      // Use structured identity if available, otherwise fallback to stored identity
      const identityToUse = storedIdentity;
      const displayNameToUse = storedDisplayName || storedIdentity;

      const { room, dataTrack } = await connectToRoom({
        token,
        options: {
          name: decodeURIComponent(roomId),
          logLevel: 'warn',
        },
      });

      setDataTrack(dataTrack);

      // Setup event listeners
      const cleanup = setupRoomEventListeners(room, dispatch);
      setCleanupRoom(() => cleanup);

      // Set the display name for UI purposes
      setIdentity(storedIdentity);

      // Save connection details to centralized session storage
      updateTwilioSessionDetails({
        token,
        identity: identityToUse,
        roomSid: room.sid,
        displayName: displayNameToUse,
        room: decodeURIComponent(roomId),
      });

      clearTimeout(connectionTimeout);
      setConnecting(false);
    } catch (error) {
      console.error('💥 Connection failed:', error);
      clearTimeout(connectionTimeout);
      setConnecting(false);

      const errorMessage = error instanceof Error ? error.message : 'Failed to join room';

      // Handle token errors
      if (
        errorMessage.includes('token') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('invalid')
      ) {
        clearTwilioSessionDetails();
        clearConnectionDetails();
        setConnecting(false);
        navigate('/');
      } else {
        setConnecting(false);
      }
    }
  }, [
    roomId,
    navigate,
    setConnecting,
    setIdentity,
    setHasLeftRoom,
    getConnectionDetailsFromStorage,
  ]);

  const handleReconnection = useCallback(() => {
    setConnecting(false);
    if (hasValidConnectionDetails()) {
      clearTwilioSessionDetails();
    }
    window.location.reload();
  }, [setConnecting]);

  const cleanup = useCallback(() => {
    if (cleanupRoom) {
      cleanupRoom();
    }
    if (room) {
      disconnectFromRoom(room);
    }
  }, [cleanupRoom, room]);

  // Initialize room connection
  useEffect(() => {
    if (isConnecting || isConnected) {
      return;
    }

    const timeoutId = setTimeout(initializeRoom, 100);

    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [initializeRoom, cleanup]);

  return {
    dataTrack,
    cleanupRoom,
    handleReconnection,
    cleanup,
    identity,
  };
};
