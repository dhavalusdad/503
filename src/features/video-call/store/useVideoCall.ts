import { useCallback, useMemo, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import {
  selectVideoCall,
  // selectRoom,
  // selectIsConnected,
  // selectIsConnecting,
  selectParticipants,
  // selectChatMessages,
  // selectIsMuted,
  // selectIsVideoEnabled,
  // selectIsScreenSharing,
  // selectChatOpen,
  selectHandRaisedSids,
  selectShowParticipants,
  selectShowSettings,
  selectShowLeaveConfirm,
  selectHasLeftRoom,
  // selectIdentity,
  // selectDominantSpeakerSid,
  setRoom,
  setConnected,
  setConnecting,
  setConnectionError,
  setIdentity,
  setLocalTracks,
  setLocalParticipant,
  addParticipant,
  removeParticipant,
  updateParticipant,
  setDominantSpeaker,
  setMuted,
  setVideoEnabled,
  setScreenSharing,
  setBlurEnabled,
  setScreenShareTrack,
  setCameraTrack,
  setChatOpen,
  markMessageDelivered,
  toggleHandRaise,
  setNetworkQuality,
  setPinnedParticipant,
  togglePinParticipant,
  setShowAllParticipants,
  toggleShowAllParticipants,
  setShowParticipants,
  setShowSettings,
  setShowLeaveConfirm,
  setHasLeftRoom,
  setRecording,
  reset,
  setIsTherapistEndCall,
  type ParticipantInfo,
} from '@/redux/ducks/videoCall';

import type { Room, LocalTrack, RemoteParticipant, LocalParticipant } from 'twilio-video';

export const useVideoCall = () => {
  const dispatch = useDispatch();
  const videoCallState = useSelector(selectVideoCall);

  // Selectors
  // const room = useSelector(selectRoom);
  // const isConnected = useSelector(selectIsConnected);
  // const isConnecting = useSelector(selectIsConnecting);
  const participants = useSelector(selectParticipants);
  // const chatMessages = useSelector(selectChatMessages);
  // const isMuted = useSelector(selectIsMuted);
  // const isVideoEnabled = useSelector(selectIsVideoEnabled);
  // const isScreenSharing = useSelector(selectIsScreenSharing);
  // const chatOpen = useSelector(selectChatOpen);
  const handRaisedSids = useSelector(selectHandRaisedSids);
  const showParticipants = useSelector(selectShowParticipants);
  const showSettings = useSelector(selectShowSettings);
  const showLeaveConfirm = useSelector(selectShowLeaveConfirm);
  const hasLeftRoom = useSelector(selectHasLeftRoom);
  // const identity = useSelector(selectIdentity);
  // const dominantSpeakerSid = useSelector(selectDominantSpeakerSid);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState<boolean>(true);
  const [isMemoPadOpen, setIsMemoPadOpen] = useState<boolean>(false);
  // Convert participants object to Map for compatibility
  const participantsMapResult = useMemo(() => {
    const map = new Map();
    Object.entries(participants).forEach(([key, value]) => {
      map.set(key, value);
    });

    return map;
  }, [participants]);

  // Convert handRaisedSids array to Set for compatibility
  const handRaisedSidsSetResult = useMemo(() => {
    return new Set(handRaisedSids);
  }, [handRaisedSids]);

  // Actions
  const actions = {
    setRoom: useCallback(
      (room: Room | null) => {
        dispatch(setRoom(room));
      },
      [dispatch]
    ),

    setConnected: useCallback(
      (connected: boolean) => {
        dispatch(setConnected(connected));
      },
      [dispatch]
    ),

    setConnecting: useCallback(
      (connecting: boolean) => {
        dispatch(setConnecting(connecting));
      },
      [dispatch]
    ),

    setConnectionError: useCallback(
      (error: string | null) => {
        dispatch(setConnectionError(error));
      },
      [dispatch]
    ),

    setIdentity: useCallback(
      (identity: string) => {
        dispatch(setIdentity(identity));
      },
      [dispatch]
    ),

    setLocalTracks: useCallback(
      (tracks: LocalTrack[]) => {
        dispatch(setLocalTracks(tracks));
      },
      [dispatch]
    ),

    setLocalParticipant: useCallback(
      (participant: LocalParticipant | null) => {
        dispatch(setLocalParticipant(participant));
      },
      [dispatch]
    ),

    addParticipant: useCallback(
      (participant: RemoteParticipant) => {
        dispatch(addParticipant(participant));
      },
      [dispatch]
    ),

    removeParticipant: useCallback(
      (sid: string) => {
        dispatch(removeParticipant(sid));
      },
      [dispatch]
    ),

    updateParticipant: useCallback(
      (sid: string, updates: Partial<ParticipantInfo>) => {
        dispatch(updateParticipant({ sid, updates }));
      },
      [dispatch]
    ),

    setDominantSpeaker: useCallback(
      (sid: string | null) => {
        dispatch(setDominantSpeaker(sid));
      },
      [dispatch]
    ),

    setMuted: useCallback(
      (muted: boolean) => {
        dispatch(setMuted(muted));
      },
      [dispatch]
    ),
    setIsTherapistEndCall: useCallback(
      (callEnd: boolean) => {
        dispatch(setIsTherapistEndCall(callEnd));
      },
      [dispatch]
    ),

    setVideoEnabled: useCallback(
      (enabled: boolean) => {
        dispatch(setVideoEnabled(enabled));
      },
      [dispatch]
    ),

    setScreenSharing: useCallback(
      (sharing: boolean) => {
        dispatch(setScreenSharing(sharing));
      },
      [dispatch]
    ),

    setBlurEnabled: useCallback(
      (enabled: boolean) => {
        dispatch(setBlurEnabled(enabled));
      },
      [dispatch]
    ),

    setScreenShareTrack: useCallback(
      (track: LocalTrack | null) => {
        dispatch(setScreenShareTrack(track));
      },
      [dispatch]
    ),

    setCameraTrack: useCallback(
      (tracks: LocalTrack[]) => {
        dispatch(setCameraTrack(tracks));
      },
      [dispatch]
    ),

    setChatOpen: useCallback(
      (open: boolean) => {
        dispatch(setChatOpen(open));
      },
      [dispatch]
    ),

    markMessageDelivered: useCallback(
      (messageId: string) => {
        dispatch(markMessageDelivered(messageId));
      },
      [dispatch]
    ),

    toggleHandRaise: useCallback(
      (sid: string) => {
        dispatch(toggleHandRaise(sid));
      },
      [dispatch]
    ),

    setNetworkQuality: useCallback(
      (quality: number) => {
        dispatch(setNetworkQuality(quality));
      },
      [dispatch]
    ),

    setPinnedParticipant: useCallback(
      (sid: string | null) => {
        dispatch(setPinnedParticipant(sid));
      },
      [dispatch]
    ),

    togglePinParticipant: useCallback(
      (sid: string) => {
        dispatch(togglePinParticipant(sid));
      },
      [dispatch]
    ),

    setShowAllParticipants: useCallback(
      (show: boolean) => {
        dispatch(setShowAllParticipants(show));
      },
      [dispatch]
    ),

    toggleShowAllParticipants: useCallback(() => {
      dispatch(toggleShowAllParticipants());
    }, [dispatch]),

    setShowParticipants: useCallback(
      (show: boolean) => {
        dispatch(setShowParticipants(show));
        if (show) {
          setIsClientDetailsOpen(false);
          setIsMemoPadOpen(false);
        }
      },
      [dispatch]
    ),

    setShowSettings: useCallback(
      (show: boolean) => {
        dispatch(setShowSettings(show));
      },
      [dispatch]
    ),

    setShowLeaveConfirm: useCallback(
      (show: boolean) => {
        dispatch(setShowLeaveConfirm(show));
      },
      [dispatch]
    ),

    setHasLeftRoom: useCallback(
      (left: boolean) => {
        dispatch(setHasLeftRoom(left));
      },
      [dispatch]
    ),

    setRecording: useCallback(
      (recording: {
        isRecording: boolean;
        recordingSid: string | null;
        recordingStartTime: Date | null;
      }) => {
        dispatch(setRecording(recording));
      },
      [dispatch]
    ),

    reset: useCallback(() => {
      dispatch(reset());
    }, [dispatch]),
  };

  return {
    // State
    ...videoCallState,
    participants: participantsMapResult,
    handRaisedSids: handRaisedSidsSetResult,
    showParticipants,
    showSettings,
    showLeaveConfirm,
    hasLeftRoom,
    isClientDetailsOpen,
    isMemoPadOpen,
    setIsClientDetailsOpen,
    setIsMemoPadOpen,

    // Actions
    ...actions,
  };
};
