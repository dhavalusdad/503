import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { Room, LocalTrack, RemoteParticipant, LocalParticipant } from 'twilio-video';

export interface ChatMessage {
  id: string;
  text: string;
  sender_identity: string;
  session_id: string;
  created_at: Date | string;
  updated_at: Date;
  delivered?: boolean;
}

export interface TrackMetadata {
  sid: string;
  kind: 'audio' | 'video' | 'data';
  isEnabled: boolean;
  name: string | null;
}

export interface ParticipantInfo {
  sid: string;
  identity: string;
  networkQuality: number;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  tracks: Map<string, TrackMetadata>;
}

export interface VideoCallState {
  // Connection state
  room: Room | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Local participant
  identity: string;
  localTracks: LocalTrack[];
  localParticipant: LocalParticipant | null;

  // Remote participants
  participants: Record<string, ParticipantInfo>;
  dominantSpeakerSid: string | null;

  // Media state
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isBlurEnabled: boolean;
  screenShareTrack: LocalTrack | null;
  cameraTrack: LocalTrack[];

  // UI state
  chatOpen: boolean;
  chatMessages: ChatMessage[];
  handRaisedSids: string[];
  networkQuality: number;
  pinnedParticipantSid: string | null;
  showAllParticipants: boolean;
  showParticipants: boolean;
  showSettings: boolean;
  showLeaveConfirm: boolean;
  hasLeftRoom: boolean;

  // Recording state
  isRecording: boolean;
  recordingSid: string | null;
  recordingStartTime: Date | null;
  isTherapistEndCall: boolean;
}

const initialState: VideoCallState = {
  room: null,
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  identity: '',
  localTracks: [],
  localParticipant: null,
  participants: {},
  dominantSpeakerSid: null,
  isMuted: true,
  isVideoEnabled: false,
  isScreenSharing: false,
  isBlurEnabled: false,
  screenShareTrack: null,
  cameraTrack: [],
  chatOpen: false,
  chatMessages: [],
  handRaisedSids: [],
  networkQuality: 5,
  pinnedParticipantSid: null,
  showAllParticipants: false,
  showParticipants: false,
  showSettings: false,
  showLeaveConfirm: false,
  hasLeftRoom: false,
  isRecording: false,
  recordingSid: null,
  recordingStartTime: null,
  isTherapistEndCall: false,
};

const videoCallSlice = createSlice({
  name: 'videoCall',
  initialState,
  reducers: {
    // Connection actions
    setRoom: (state, action: PayloadAction<Room | null>) => {
      state.room = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
    },
    setConnectionError: (state, action: PayloadAction<string | null>) => {
      state.connectionError = action.payload;
    },

    // Local participant actions
    setIdentity: (state, action: PayloadAction<string>) => {
      state.identity = action.payload;
    },
    setLocalTracks: (state, action: PayloadAction<LocalTrack[]>) => {
      state.localTracks = action.payload;
    },
    setLocalParticipant: (state, action: PayloadAction<LocalParticipant | null>) => {
      state.localParticipant = action.payload;
    },

    // Remote participants actions
    addParticipant: (state, action: PayloadAction<RemoteParticipant>) => {
      const participant = action.payload;
      state.participants[participant.sid] = {
        sid: participant.sid,
        identity: participant.identity,
        networkQuality: 5, // Start with unknown quality, will be updated by networkQualityLevelChanged event
        isMuted: true, // Assume muted until we get track info
        isVideoEnabled: false, // Assume no video until we get track info
        isHandRaised: false,
        isScreenSharing: false, // Assume no screen sharing until we get track info
        tracks: new Map(),
      };
    },
    removeParticipant: (state, action: PayloadAction<string>) => {
      const sid = action.payload;
      delete state.participants[sid];

      // Remove from hand raised list
      state.handRaisedSids = state.handRaisedSids.filter(id => id !== sid);

      // Clear dominant speaker if it was this participant
      if (state.dominantSpeakerSid === sid) {
        state.dominantSpeakerSid = null;
      }
    },
    updateParticipant: (
      state,
      action: PayloadAction<{ sid: string; updates: Partial<ParticipantInfo> }>
    ) => {
      const { sid, updates } = action.payload;
      if (state.participants[sid]) {
        if (updates.tracks) {
          state.participants[sid].tracks = updates.tracks;
        } else {
          Object.assign(state.participants[sid], updates);
        }
      }
    },
    setDominantSpeaker: (state, action: PayloadAction<string | null>) => {
      state.dominantSpeakerSid = action.payload;
    },

    // Media state actions
    setMuted: (state, action: PayloadAction<boolean>) => {
      state.isMuted = action.payload;
    },
    setIsTherapistEndCall: (state, action: PayloadAction<boolean>) => {
      state.isTherapistEndCall = action.payload;
    },

    setVideoEnabled: (state, action: PayloadAction<boolean>) => {
      state.isVideoEnabled = action.payload;
    },
    setScreenSharing: (state, action: PayloadAction<boolean>) => {
      state.isScreenSharing = action.payload;
    },
    setBlurEnabled: (state, action: PayloadAction<boolean>) => {
      state.isBlurEnabled = action.payload;
    },
    setScreenShareTrack: (state, action: PayloadAction<LocalTrack | null>) => {
      state.screenShareTrack = action.payload;
    },
    setCameraTrack: (state, action: PayloadAction<LocalTrack[]>) => {
      state.cameraTrack = action.payload;
    },

    // UI state actions
    setChatOpen: (state, action: PayloadAction<boolean>) => {
      state.chatOpen = action.payload;
    },
    markMessageDelivered: (state, action: PayloadAction<string>) => {
      const messageId = action.payload;
      const message = state.chatMessages.find(msg => msg.id === messageId);
      if (message) {
        message.delivered = true;
      }
    },
    toggleHandRaise: (state, action: PayloadAction<string>) => {
      const sid = action.payload;
      const index = state.handRaisedSids.indexOf(sid);

      if (index > -1) {
        state.handRaisedSids.splice(index, 1);
      } else {
        state.handRaisedSids.push(sid);
      }
    },
    setNetworkQuality: (state, action: PayloadAction<number>) => {
      state.networkQuality = action.payload;
    },
    setPinnedParticipant: (state, action: PayloadAction<string | null>) => {
      state.pinnedParticipantSid = action.payload;
    },
    togglePinParticipant: (state, action: PayloadAction<string>) => {
      const sid = action.payload;
      if (state.pinnedParticipantSid === sid) {
        state.pinnedParticipantSid = null;
      } else {
        state.pinnedParticipantSid = sid;
      }
    },
    setShowAllParticipants: (state, action: PayloadAction<boolean>) => {
      state.showAllParticipants = action.payload;
    },
    toggleShowAllParticipants: state => {
      state.showAllParticipants = !state.showAllParticipants;
    },
    setShowParticipants: (state, action: PayloadAction<boolean>) => {
      state.showParticipants = action.payload;
    },
    setShowSettings: (state, action: PayloadAction<boolean>) => {
      state.showSettings = action.payload;
    },
    setShowLeaveConfirm: (state, action: PayloadAction<boolean>) => {
      state.showLeaveConfirm = action.payload;
    },
    setHasLeftRoom: (state, action: PayloadAction<boolean>) => {
      state.hasLeftRoom = action.payload;
    },

    // Recording actions
    setRecording: (
      state,
      action: PayloadAction<{
        isRecording: boolean;
        recordingSid: string | null;
        recordingStartTime: Date | null;
      }>
    ) => {
      const { isRecording, recordingSid, recordingStartTime } = action.payload;
      state.isRecording = isRecording;
      state.recordingSid = recordingSid;
      state.recordingStartTime = recordingStartTime;
    },

    // Reset action
    reset: () => initialState,
  },
});

export const {
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
} = videoCallSlice.actions;

// Selectors
export const selectVideoCall = (state: { videoCall: VideoCallState }) => state.videoCall;
export const selectRoom = (state: { videoCall: VideoCallState }) => state.videoCall.room;
export const selectIsConnected = (state: { videoCall: VideoCallState }) =>
  state.videoCall.isConnected;
export const selectIsConnecting = (state: { videoCall: VideoCallState }) =>
  state.videoCall.isConnecting;
export const selectParticipants = (state: { videoCall: VideoCallState }) =>
  state.videoCall.participants;
export const selectChatMessages = (state: { videoCall: VideoCallState }) =>
  state.videoCall.chatMessages;
export const selectIsMuted = (state: { videoCall: VideoCallState }) => state.videoCall.isMuted;
export const selectIsVideoEnabled = (state: { videoCall: VideoCallState }) =>
  state.videoCall.isVideoEnabled;
export const selectIsScreenSharing = (state: { videoCall: VideoCallState }) =>
  state.videoCall.isScreenSharing;
export const selectIsBlurEnabled = (state: { videoCall: VideoCallState }) =>
  state.videoCall.isBlurEnabled;
export const selectChatOpen = (state: { videoCall: VideoCallState }) => state.videoCall.chatOpen;
export const selectHandRaisedSids = (state: { videoCall: VideoCallState }) =>
  state.videoCall.handRaisedSids;
export const selectIdentity = (state: { videoCall: VideoCallState }) => state.videoCall.identity;
export const selectDominantSpeakerSid = (state: { videoCall: VideoCallState }) =>
  state.videoCall.dominantSpeakerSid;
export const selectPinnedParticipantSid = (state: { videoCall: VideoCallState }) =>
  state.videoCall.pinnedParticipantSid;
export const selectShowAllParticipants = (state: { videoCall: VideoCallState }) =>
  state.videoCall.showAllParticipants;
export const selectShowParticipants = (state: { videoCall: VideoCallState }) =>
  state.videoCall.showParticipants;
export const selectShowSettings = (state: { videoCall: VideoCallState }) =>
  state.videoCall.showSettings;
export const selectShowLeaveConfirm = (state: { videoCall: VideoCallState }) =>
  state.videoCall.showLeaveConfirm;
export const selectHasLeftRoom = (state: { videoCall: VideoCallState }) =>
  state.videoCall.hasLeftRoom;
export const selectIsTherapistEndCall = (state: { videoCall: VideoCallState }) =>
  state.videoCall.isTherapistEndCall;

export default videoCallSlice.reducer;
