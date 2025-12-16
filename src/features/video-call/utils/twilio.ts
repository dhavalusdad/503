import { Bounce, toast, type ToastIcon } from 'react-toastify';
import {
  connect,
  Room,
  type LocalTrack,
  LocalDataTrack,
  type ConnectOptions,
  createLocalAudioTrack,
  createLocalVideoTrack,
  type RemoteTrack,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteDataTrack,
  LocalAudioTrack,
  LocalVideoTrack,
} from 'twilio-video';

import { stopAllActiveMediaTracks } from '@/features/video-call/utils/cleanup';
import {
  setRoom,
  setLocalParticipant,
  setConnected,
  setConnecting,
  setConnectionError,
  setLocalTracks,
  setMuted,
  setVideoEnabled,
  setNetworkQuality,
  addParticipant,
  removeParticipant,
  updateParticipant,
  setDominantSpeaker,
  toggleHandRaise,
  setPinnedParticipant,
  setIsTherapistEndCall,
} from '@/redux/ducks/videoCall';
import type { AppDispatch } from '@/redux/store';

export const showVideoCallToast = (
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  options?: {
    autoClose?: number;
    icon?: string;
  }
) => {
  const defaultOptions = {
    position: 'bottom-right' as const,
    autoClose: options?.autoClose || 5000,
    hideProgressBar: true,
    closeOnClick: false,
    icon: false as ToastIcon,
    pauseOnHover: false,
    draggable: true,
    theme: 'dark' as const,
    transition: Bounce,
  };

  const toastMessage = options?.icon ? `${options.icon} ${message}` : message;

  switch (type) {
    case 'success':
      toast.success(toastMessage, defaultOptions);
      break;
    case 'warning':
      toast.warning(toastMessage, defaultOptions);
      break;
    case 'error':
      toast.error(toastMessage, defaultOptions);
      break;
    case 'info':
    default:
      toast.info(toastMessage, defaultOptions);
      break;
  }
};

export interface TokenResponse {
  data: {
    token: string;
    role: string;
    userId: string;
    identity: string;
  };
  identity: string;
  room: string;
  expiresAt: string;
}

export interface ConnectToRoomOptions {
  token: string;
  options?: ConnectOptions;
}

export interface ConnectToRoomResult {
  room: Room;
  localTracks: LocalTrack[];
  dataTrack: LocalDataTrack;
}

const API_BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:7000';

export async function fetchAccessToken(
  displayName: string,
  roomName: string,
  invite: string
): Promise<TokenResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/twilio/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        displayName,
        room: roomName,
        ttlMinutes: 105,
        invite: invite,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch access token');
    }

    return response.json();
  } catch (error) {
    // Handle network errors specifically
    if (error instanceof TypeError && error.message.includes('fetch')) {
      showVideoCallToast(
        'Network error: Unable to connect to server. Please check your internet connection.',
        'error',
        { icon: '⚠️' }
      );
    }
    throw error;
  }
}

export async function connectToRoom({
  token,
  options = {},
}: ConnectToRoomOptions): Promise<ConnectToRoomResult> {
  // Check for available devices first
  const devices = await navigator.mediaDevices.enumerateDevices();
  const hasAudioInput = devices.some(device => device.kind === 'audioinput');
  const hasVideoInput = devices.some(device => device.kind === 'videoinput');
  const StoredDeviceId = sessionStorage.getItem('audioDeviceId');
  const StoredVideoDeviceId = sessionStorage.getItem('videoDeviceId');

  // Don't check permissions here - let Twilio handle it

  // Create local tracks only for available devices
  const tracks: LocalTrack[] = [];

  let audioTrack: LocalAudioTrack | null = null;
  let videoTrack: LocalVideoTrack | null = null;

  if (hasAudioInput) {
    try {
      audioTrack = await createLocalAudioTrack({
        ...(StoredDeviceId ? { deviceId: StoredDeviceId } : {}),
        echoCancellation: true,
        noiseSuppression: true,
      });

      // Apply user's audio preference from join screen
      const userAudioEnabled = sessionStorage.getItem('userAudioEnabled');
      if (userAudioEnabled !== null) {
        if (userAudioEnabled === 'false') {
          audioTrack.disable();
        }
      }

      tracks.push(audioTrack);
    } catch (error) {
      console.error('❌ Failed to create audio track:', error);
    }
  }

  if (hasVideoInput) {
    try {
      videoTrack = await createLocalVideoTrack(
        StoredVideoDeviceId && StoredVideoDeviceId !== 'default'
          ? { deviceId: { exact: StoredVideoDeviceId } }
          : {}
      );

      // Apply user's video preference from join screen
      const userVideoEnabled = sessionStorage.getItem('userVideoEnabled');
      if (userVideoEnabled !== null) {
        if (userVideoEnabled === 'false') {
          videoTrack.disable();
        }
      }

      tracks.push(videoTrack);
    } catch (error) {
      console.error('❌ Failed to create video track:', error);
    }
  }

  try {
    // Create data track for chat (always available)
    const dataTrack = new LocalDataTrack({
      name: 'chat',
    });

    tracks.push(dataTrack);

    // If no media tracks were created due to permission denial, we can still connect with just the data track
    // if (tracks.length === 1 && tracks[0] === dataTrack) {
    // }

    // Ensure we always have at least the data track
    if (tracks.length === 0) {
      tracks.push(dataTrack);
    }

    const defaultOptions: ConnectOptions = {
      tracks: tracks,
      audio: false,

      video: { height: 720, width: 1280, frameRate: 40 },

      bandwidthProfile: {
        video: {
          mode: 'collaboration', // better than 'grid' for dynamic quality
          maxSubscriptionBitrate: 4000000, // allow higher bitrate for video
          dominantSpeakerPriority: 'high',
          trackSwitchOffMode: 'detected',
          renderDimensions: {
            high: { width: 1280, height: 720 },
            standard: { width: 640, height: 360 },
            low: { width: 640, height: 360 },
          },
        },
      },

      maxAudioBitrate: 64000, // good quality for speech (remove for music)

      preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],

      networkQuality: { local: 2, remote: 2 }, // 0–3 (higher = more detailed stats)

      enableDscp: true, // enable QoS at network level
      dominantSpeaker: true,
      ...options,
    };

    // Add connection timeout and retry logic

    const connectionPromise = connect(token, defaultOptions);

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000);
    });

    const room = (await Promise.race([connectionPromise, timeoutPromise])) as Room;

    const localTracks = tracks.filter(track => track !== null) as LocalTrack[];
    return { room, localTracks, dataTrack };
  } catch (error) {
    console.error('💥 connectToRoom failed:', error);
    console.error('💥 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.error('💥 This error will be thrown back to Room component');

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('duplicate identity')) {
        throw new Error(
          'Another participant with the same name is already in the room. Please try again.'
        );
      } else if (error.message.includes('token')) {
        throw new Error('Invalid access token. Please try joining again.');
      } else if (
        error.message.includes('Signaling connection error') ||
        error.message.includes('WebSocket')
      ) {
        throw new Error(
          'Unable to connect to Twilio servers. Please check your internet connection and try again.'
        );
      } else if (error.message.includes('timeout')) {
        throw new Error(
          'Connection timed out. Please check your internet connection and try again.'
        );
      } else if (error.message.includes('room')) {
        throw new Error('Unable to join the room. Please check your connection and try again.');
      } else if (error.message.includes('media') || error.message.includes('getUserMedia')) {
        throw new Error(
          'Unable to access camera or microphone. Please check your permissions and try again.'
        );
      }
    }

    throw error;
  } finally {
    // Clean up stored preferences after applying them

    const userAudioEnabled = sessionStorage.getItem('userAudioEnabled');
    const userVideoEnabled = sessionStorage.getItem('userVideoEnabled');
    if (userAudioEnabled !== null || userVideoEnabled !== null) {
      sessionStorage.removeItem('userAudioEnabled');
      sessionStorage.removeItem('userVideoEnabled');
    }
  }
}

export function setupRoomEventListeners(room: Room, dispatch: AppDispatch) {
  // Set initial state
  dispatch(setRoom(room));

  dispatch(setLocalParticipant(room.localParticipant));

  dispatch(setConnected(true));

  dispatch(setConnecting(false));

  dispatch(setConnectionError(null));

  // Set local tracks and initial states
  const localTracks = Array.from(room.localParticipant.tracks.values())
    .map(publication => publication.track)
    .filter(track => track !== null);
  dispatch(setLocalTracks(localTracks));

  // Log local participant data tracks

  // Set initial local track states
  const audioPublication = Array.from(room.localParticipant.audioTracks.values())[0];
  const videoPublication = Array.from(room.localParticipant.videoTracks.values())[0];

  // Get user's audio preference from sessionStorage
  const userAudioEnabled = sessionStorage.getItem('userAudioEnabled');
  const userVideoEnabled = sessionStorage.getItem('userVideoEnabled');

  // Handle cases where no media tracks are available
  if (audioPublication?.track) {
    // Use user's preference if available, otherwise use track's current state
    const shouldBeMuted =
      userAudioEnabled !== null
        ? !(userAudioEnabled === 'true')
        : !audioPublication.track.isEnabled;
    // Apply the user's preference to the track
    if (userAudioEnabled !== null) {
      if (userAudioEnabled === 'true') {
        audioPublication.track.enable();
      } else {
        audioPublication.track.disable();
      }
    }

    dispatch(setMuted(shouldBeMuted));
  }

  if (videoPublication?.track) {
    // Use user's preference if available, otherwise use track's current state
    const shouldBeVideoEnabled =
      userVideoEnabled !== null
        ? userVideoEnabled === 'true'
        : videoPublication.track.isEnabled === true;

    // Apply the user's preference to the track
    if (userVideoEnabled !== null) {
      if (userVideoEnabled === 'true') {
        videoPublication.track.enable();
      } else {
        videoPublication.track.disable();
      }
    }

    dispatch(setVideoEnabled(shouldBeVideoEnabled));
  } else {
    dispatch(setVideoEnabled(false)); // No video track = disabled
  }

  // Add existing participants
  room.participants.forEach(participant => {
    dispatch(addParticipant(participant));
    attachParticipantTracks(participant, dispatch, room);

    // Auto-pin host (therapist) for existing remote participants

    // Check for therapist host in multiple ways to be more flexible
    const hasTherapistRole = participant.identity.includes('-therapist-');
    const hasHostType = participant.identity.includes('-host');
    const hasTherapistHost = participant.identity.includes('-therapist-host');
    const hasTPRole = participant.identity.includes('-TP-');
    const hasTPHost = participant.identity.includes('-TP-host');
    const isHost =
      hasTherapistHost ||
      hasTPHost ||
      (hasTherapistRole && hasHostType) ||
      (hasTPRole && hasHostType);

    if (isHost) {
      // Only auto-pin if this is a remote participant (not the local user)
      const localParticipant = room.localParticipant;

      if (localParticipant && participant.sid !== localParticipant.sid) {
        dispatch(setPinnedParticipant(participant.sid));
      }
    }

    // Set up network quality listener for existing remote participant
    participant.on('networkQualityLevelChanged', networkQuality => {
      dispatch(updateParticipant({ sid: participant.sid, updates: { networkQuality } }));
    });
  });
  // Participant connected
  room.on('participantConnected', async participant => {
    dispatch(addParticipant(participant));
    attachParticipantTracks(participant, dispatch, room);

    // Set up network quality listener for remote participant
    participant.on('networkQualityLevelChanged', networkQuality => {
      dispatch(updateParticipant({ sid: participant.sid, updates: { networkQuality } }));
    });

    // Set up data track listeners for new participant
    participant.dataTracks.forEach(publication => {
      if (publication.track) {
        setupDataTrackListeners(publication.track, participant.identity, dispatch);
      }
    });

    // Listen for new data tracks from this participant
    participant.on('trackSubscribed', (track: RemoteTrack) => {
      if (track.kind === 'data') {
        setupDataTrackListeners(track, participant.identity, dispatch);
      }
    });

    // CRITICAL FIX: Set up data track listeners for ALL existing participants
    // This ensures that the new participant can receive messages from existing participants
    room.participants.forEach(existingParticipant => {
      if (existingParticipant.sid !== participant.sid) {
        existingParticipant.dataTracks.forEach(publication => {
          if (publication.track) {
            setupDataTrackListeners(publication.track, existingParticipant.identity, dispatch);
          }
        });
      }
    });

    // CRITICAL FIX: Set up data track listeners for the new participant on ALL existing participants
    // This ensures that existing participants can receive messages from the new participant
    room.participants.forEach(existingParticipant => {
      if (existingParticipant.sid !== participant.sid) {
        participant.dataTracks.forEach(publication => {
          if (publication.track) {
            setupDataTrackListeners(publication.track, participant.identity, dispatch);
          }
        });
      }
    });

    showVideoCallToast(`${participant.identity.split('-')[0]} joined the appointment`, 'success', {
      icon: '👤',
    });
  });

  // Participant disconnected
  room.on('participantDisconnected', participant => {
    // Remove participant from store
    dispatch(removeParticipant(participant.sid));

    dispatch(setIsTherapistEndCall(participant.identity.includes('-TP-HOST')));

    showVideoCallToast(`${participant.identity.split('-')[0]} left the appointment`, 'warning', {
      icon: '👤',
    });

    // Clean up unknown remaining tracks for this participant
    // Tracks will be detached automatically when components unmount
  });

  // Track subscribed

  room.on('trackSubscribed', (track, _publication, participant) => {
    // attachTrack(track, participant.sid);
    // Update participant state
    if (track.kind === 'audio') {
      dispatch(updateParticipant({ sid: participant.sid, updates: { isMuted: !track.isEnabled } }));
    } else if (track.kind === 'video') {
      // Check if this is a screen share track
      const isScreenShare = track.name?.includes('screen');

      if (isScreenShare) {
        // Update participant state for screen sharing
        dispatch(
          updateParticipant({
            sid: participant.sid,
            updates: {
              isScreenSharing: track.isEnabled,
            },
          })
        );
        // Auto-pin the screen share for remote participants
        if (participant.sid !== room.localParticipant.sid) {
          dispatch(setPinnedParticipant(participant.sid));
        }

        // Set up direct track listeners for screen share
        track.on('enabled', () => {
          dispatch(
            updateParticipant({
              sid: participant.sid,
              updates: { isScreenSharing: true },
            })
          );
        });

        track.on('disabled', () => {
          dispatch(
            updateParticipant({
              sid: participant.sid,
              updates: { isScreenSharing: false },
            })
          );
        });
        setTimeout(() => {
          document.getElementById(`pin-button-${participant.sid}-screen`)?.click();
        }, 1000);
      } else if (track.name !== 'screen') {
        // Regular video track
        dispatch(
          updateParticipant({ sid: participant.sid, updates: { isVideoEnabled: track.isEnabled } })
        );

        // Set up direct track listeners for regular video
        track.on('enabled', () => {
          // console.log('🎥 Video track enabled for participant', participant.sid);

          const isScreenShare = track.name?.includes('screen');
          if (!isScreenShare) {
            dispatch(
              updateParticipant({ sid: participant.sid, updates: { isVideoEnabled: true } })
            );
          }
        });

        track.on('disabled', () => {
          // console.log('🎥 Video track disabled for participant', participant.sid);
          const isScreenShare = track.name?.includes('screen');
          if (!isScreenShare) {
            dispatch(
              updateParticipant({ sid: participant.sid, updates: { isVideoEnabled: false } })
            );
          }
        });
      }
    }
  });

  // Track unsubscribed
  room.on('trackUnsubscribed', (track, _publication, participant) => {
    // Update participant state in Redux
    if (track.kind === 'audio') {
      dispatch(
        updateParticipant({
          sid: participant.sid,
          updates: { isMuted: true }, // assume muted when unsubscribed
        })
      );
    } else if (track.kind === 'video') {
      const isScreenShare =
        track.name?.includes('screen') ||
        track.mediaStreamTrack?.getSettings?.()?.displaySurface === 'monitor' ||
        track.mediaStreamTrack?.getSettings?.()?.displaySurface === 'window' ||
        track.mediaStreamTrack?.getSettings?.()?.displaySurface === 'browser';

      if (isScreenShare) {
        dispatch(
          updateParticipant({
            sid: participant.sid,
            updates: { isScreenSharing: false },
          })
        );
      } else if (track.name !== 'screen') {
        dispatch(
          updateParticipant({
            sid: participant.sid,
            updates: { isVideoEnabled: false }, // no video if unsubscribed
          })
        );
      }
    }
  });

  // Dominant speaker changed
  room.on('dominantSpeakerChanged', participant => {
    dispatch(setDominantSpeaker(participant ? participant.sid : null));
  });

  // Network quality changed for local participant
  room.localParticipant.on('networkQualityLevelChanged', networkQuality => {
    dispatch(setNetworkQuality(networkQuality));
  });

  // Room disconnected
  room.on('disconnected', (_room, error) => {
    dispatch(setConnected(false));
    dispatch(setRoom(null));
    if (error) {
      if (error?.code === 53216 || error.message.includes('Participant session length exceeded')) {
        dispatch(setConnectionError('Your session has expired.'));
        return;
      }
      dispatch(setConnectionError(error.message));
    }
  });

  // Connection state changes
  room.on('reconnecting', () => {
    dispatch(setConnecting(true));
    dispatch(setConnectionError('Reconnecting...'));
  });

  room.on('reconnected', () => {
    dispatch(setConnecting(false));
    dispatch(setConnectionError(null));
  });

  // Handle connection failures - this event doesn't exist on Room
  // Connection failures are handled in the connectToRoom function

  // Data track messages (chat)
  room.participants.forEach(participant => {
    participant.dataTracks.forEach(publication => {
      if (publication.track) {
        setupDataTrackListeners(publication.track, participant.identity, dispatch);
      }
    });

    participant.on('trackSubscribed', (track: RemoteTrack) => {
      if (track.kind === 'data') {
        setupDataTrackListeners(track, participant.identity, dispatch);
      }
    });
  });

  // CRITICAL FIX: Set up cross-participant data track listeners
  // This ensures that all participants can receive messages from each other
  const setupCrossParticipantDataTrackListeners = () => {
    const participants = Array.from(room.participants.values());
    participants.forEach(participant => {
      participants.forEach(otherParticipant => {
        if (participant.sid !== otherParticipant.sid) {
          otherParticipant.dataTracks.forEach(publication => {
            if (publication.track) {
              setupDataTrackListeners(publication.track, otherParticipant.identity, dispatch);
            }
          });
        }
      });
    });
  };

  // Set up cross-participant listeners initially
  setupCrossParticipantDataTrackListeners();

  // Debug function to log current data track listener status
  const logDataTrackStatus = () => {
    const participants = Array.from(room.participants.values());
    participants.forEach(participant => {
      participant.dataTracks.forEach(publication => {
        const track = publication.track;
        if (track) {
          // const hasListeners = (track as RemoteDataTrack & { _chatListenersSet?: boolean })
          //   ._chatListenersSet;
        }
      });
    });
  };

  // Function to manually set up data track listeners for all participants
  const setupAllDataTrackListeners = () => {
    const participants = Array.from(room.participants.values());
    participants.forEach(participant => {
      participants.forEach(otherParticipant => {
        if (participant.sid !== otherParticipant.sid) {
          otherParticipant.dataTracks.forEach(publication => {
            if (publication.track) {
              setupDataTrackListeners(publication.track, otherParticipant.identity, dispatch);
            }
          });
        }
      });
    });
    logDataTrackStatus();
  };

  // Make the function available globally for debugging
  (window as Window & { setupAllDataTrackListeners?: () => void }).setupAllDataTrackListeners =
    setupAllDataTrackListeners;

  // Log initial status
  logDataTrackStatus();

  // Note: Periodic state synchronization removed for Redux migration
  // This functionality can be re-implemented if needed using Redux selectors

  return () => {
    // Cleanup function
    room.removeAllListeners();
    room.localParticipant.removeAllListeners();
    room.participants.forEach(participant => {
      participant.removeAllListeners();
    });
  };
}

function attachParticipantTracks(
  participant: RemoteParticipant,
  dispatch: AppDispatch,
  room: Room
) {
  Array.from(participant.tracks.entries()).map(([sid, publication]) => {
    return {
      sid,
      kind: publication.kind,
      isSubscribed: publication.isSubscribed,
      hasTrack: !!publication.track,
    };
  });

  // Note: Store access removed for Redux migration
  let hasVideo = false;
  let hasScreenShare = false;
  let hasAudio = false;
  let isVideoEnabled = false;
  let isScreenSharing = false;
  let isMuted = true;

  participant.tracks.forEach((publication: RemoteTrackPublication) => {
    if (publication.track) {
      // Check initial track states
      if (publication.track.kind === 'video') {
        // Check if this is a screen share track
        const isScreenShareTrack =
          publication.track.name?.includes('screen') ||
          publication.track.mediaStreamTrack?.getSettings?.()?.displaySurface === 'monitor' ||
          publication.track.mediaStreamTrack?.getSettings?.()?.displaySurface === 'window' ||
          publication.track.mediaStreamTrack?.getSettings?.()?.displaySurface === 'browser';

        if (isScreenShareTrack) {
          hasScreenShare = true;
          isScreenSharing = publication.track.isEnabled;
        } else {
          hasVideo = true;
          isVideoEnabled = publication.track.isEnabled;
        }
      } else if (publication.track.kind === 'audio') {
        hasAudio = true;
        isMuted = !publication.track.isEnabled;
      } else if (publication.track.kind === 'data') {
        // Set up data track listener for existing data tracks
        setupDataTrackListeners(publication.track, participant.identity, dispatch);
      }
    } else {
      // Note: Track metadata storage removed for Redux migration
      // This functionality can be re-implemented if needed
    }
  });

  // Update participant state with initial track states
  const finalState = {
    isVideoEnabled: hasVideo ? isVideoEnabled : false,
    isScreenSharing: hasScreenShare ? isScreenSharing : false,
    isMuted: hasAudio ? isMuted : true,
  };

  dispatch(updateParticipant({ sid: participant.sid, updates: finalState }));

  // Auto-pin existing screen share for remote participants
  if (hasScreenShare && isScreenSharing && participant.sid !== room.localParticipant.sid) {
    dispatch(setPinnedParticipant(participant.sid));
  }

  participant.on('trackSubscribed', (track: RemoteTrack) => {
    if (track.kind === 'data') {
      setupDataTrackListeners(track, participant.identity, dispatch);
    }
  });

  // participant.on('trackUnsubscribed', (track: RemoteTrack) => {
  // Track will be detached automatically when component unmounts
  // Update participant state based on track type
  // Note: Store access removed for Redux migration
  // const updates: Partial<ParticipantInfo> = {};
  // if (track.kind === 'video') {
  //   // Check if this is a screen share track by looking at the track's constraints or source
  //   const isScreenShare = track.name?.includes('screen') ||
  //     (track).mediaStreamTrack?.getSettings?.()?.displaySurface === 'monitor' ||
  //     (track as any).mediaStreamTrack?.getSettings?.()?.displaySurface === 'window' ||
  //     (track as any).mediaStreamTrack?.getSettings?.()?.displaySurface === 'browser';
  //   if (isScreenShare) {
  //     updates.isScreenSharing = false;
  //
  //   } else {
  //     updates.isVideoEnabled = false;
  //
  //   }
  // } else if (track.kind === 'audio') {
  //   updates.isMuted = true;
  //
  // }
  // if (Object.keys(updates).length > 0) {
  //   store.updateParticipant(participant.sid, updates);
  // }
  // Note: Track removal from store removed for Redux migration
  // This functionality can be re-implemented if needed
  // });

  // Set up track enabled/disabled listeners for this participant
  participant.on('trackEnabled', (publication: RemoteTrackPublication) => {
    const track = publication.track;
    if (track) {
      // Note: Store access removed for Redux migration
      if (track.kind === 'audio') {
        dispatch(updateParticipant({ sid: participant.sid, updates: { isMuted: false } }));
      } else if (track.kind === 'video') {
        const isScreenShare = track.name?.includes('screen');
        if (!isScreenShare) {
          dispatch(updateParticipant({ sid: participant.sid, updates: { isVideoEnabled: true } }));
        } else {
          dispatch(updateParticipant({ sid: participant.sid, updates: { isScreenSharing: true } }));
        }
      }
    }
  });

  participant.on('trackDisabled', (publication: RemoteTrackPublication) => {
    const track = publication.track;
    if (track) {
      // Note: Store access removed for Redux migration
      if (track.kind === 'audio') {
        dispatch(updateParticipant({ sid: participant.sid, updates: { isMuted: true } }));
      } else if (track.kind === 'video') {
        const isScreenShare = track.name?.includes('screen');
        if (!isScreenShare) {
          dispatch(updateParticipant({ sid: participant.sid, updates: { isVideoEnabled: false } }));
        } else {
          dispatch(
            updateParticipant({ sid: participant.sid, updates: { isScreenSharing: false } })
          );
        }

        // Note: State check removed for Redux migration
      }
    }
  });
}

// function attachTrack(track: RemoteTrack, participantSid: string) {
//   // Track attachment is now handled by the VideoTile component
//   // This function is kept for compatibility but the actual attachment
//   // happens in the VideoTile component's useEffect hooks
//   console.log(`🎥 Track ${track.kind} attached for participant ${participantSid}`, {
//     trackName: track.name,
//     isEnabled: track.isEnabled,
//     trackSid: track.sid
//   });
// }

function setupDataTrackListeners(
  dataTrack: RemoteDataTrack,
  senderIdentity: string,
  dispatch: AppDispatch
) {
  // Check if listeners are already set up to prevent duplicates
  if ((dataTrack as RemoteDataTrack & { _chatListenersSet?: boolean })._chatListenersSet) {
    return;
  }

  // Mark that listeners are set up
  (dataTrack as RemoteDataTrack & { _chatListenersSet?: boolean })._chatListenersSet = true;

  dataTrack.on('message', (data: string) => {
    try {
      const message = JSON.parse(data);

      if (message.type === 'handRaise') {
        const participantSid = message.participantSid;
        if (participantSid) {
          dispatch(toggleHandRaise(participantSid));

          if (message.raised) {
            showVideoCallToast(`${senderIdentity.split('-')[0]} raised their hand`, 'info', {
              icon: '✋',
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse data track message:', error, 'Raw data:', data);
    }
  });

  // Add error handling for data track
  dataTrack.on('error', error => {
    console.error(`💬 Data track error for ${senderIdentity}:`, error);
  });
}
export function sendHandRaiseSignal(
  dataTrack: LocalDataTrack,
  raised: boolean,
  dispatch: AppDispatch,
  participantSid?: string
) {
  const message = {
    type: 'handRaise',
    raised,
    participantSid,
    timestamp: Date.now(),
  };

  try {
    dataTrack.send(JSON.stringify(message));
    setTimeout(() => {
      if (raised && participantSid) {
        dispatch(toggleHandRaise(participantSid || ''));
        dataTrack.send(JSON.stringify({ ...message, raised: false }));
      }
    }, 3000);
    return true;
  } catch (error) {
    console.error('Failed to send hand raise signal:', error);
    return false;
  }
}

export function sendPinSignal(dataTrack: LocalDataTrack, participantSid: string, pinned: boolean) {
  const message = {
    type: 'pin',
    participantSid,
    pinned,
    timestamp: Date.now(),
  };

  try {
    dataTrack.send(JSON.stringify(message));
    return true;
  } catch (error) {
    console.error('Failed to send pin signal:', error);
    return false;
  }
}

export function disconnectFromRoom(room: Room) {
  // Stop and unpublish all local tracks first
  room.localParticipant.tracks.forEach(publication => {
    if (publication.track && publication.kind !== 'data') {
      // Unpublish the track first
      room.localParticipant.unpublishTrack(publication.track);

      // Stop local tracks (audio/video tracks have stop method)
      if (publication.kind === 'audio' || publication.kind === 'video') {
        const localTrack = publication.track as LocalAudioTrack | LocalVideoTrack;
        if (localTrack && typeof localTrack.stop === 'function') {
          localTrack.stop();
        }
      }
    }
  });
  stopAllActiveMediaTracks(room);
  // Disconnect from room
  room.disconnect();
}

export async function fetchChatMessages(sessionId: string) {
  try {
    const response = await fetch(`${API_BASE}/api/twilio/chat/${sessionId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch chat messages: ${response.status}`);
    }

    const messages = await response.json();

    return messages;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
}
