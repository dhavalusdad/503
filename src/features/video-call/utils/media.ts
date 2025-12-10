import {
  createLocalVideoTrack,
  createLocalAudioTrack,
  type LocalTrack,
  LocalVideoTrack,
} from 'twilio-video';

import {
  getTwilioSessionDetails,
  updateTwilioSessionDetails,
} from '@/features/video-call/utils/twilioSessionStorage';

export interface MediaDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface MediaDevices {
  audioInputs: MediaDevice[];
  videoInputs: MediaDevice[];
  audioOutputs: MediaDevice[];
}

export async function getMediaDevices(): Promise<MediaDevices> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();

    return {
      audioInputs: devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          kind: device.kind,
        })),
      videoInputs: devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          kind: device.kind,
        })),
      audioOutputs: devices
        .filter(device => device.kind === 'audiooutput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Speaker ${device.deviceId.slice(0, 8)}`,
          kind: device.kind,
        })),
    };
  } catch (error) {
    console.error('Failed to enumerate media devices:', error);
    return {
      audioInputs: [],
      videoInputs: [],
      audioOutputs: [],
    };
  }
}

export async function createPreviewTracks(audioDeviceId?: string, videoDeviceId?: string) {
  const tracks = [];

  // --- AUDIO ---
  try {
    const audioTrack = await createLocalAudioTrack(
      audioDeviceId && audioDeviceId !== 'default' ? { deviceId: { exact: audioDeviceId } } : {} // if "default" or not provided → just use {}
    );
    tracks.push(audioTrack);
  } catch (err) {
    console.error('No audio track created:', err);
  }

  // --- VIDEO ---
  try {
    const videoTrack = await createLocalVideoTrack({
      deviceId: { exact: videoDeviceId },
      width: 640,
      height: 480,
    });
    tracks.push(videoTrack);
  } catch (err) {
    console.error('No video track created:', err);
  }

  return tracks;
}

export async function createAudioTrack(deviceId?: string) {
  try {
    return await createLocalAudioTrack(
      deviceId && deviceId !== 'default' ? { deviceId: { exact: deviceId } } : {}
    );
  } catch (error) {
    console.error('Failed to create audio track:', error);
    throw error;
  }
}

export async function createVideoTrack(deviceId?: string) {
  try {
    return await createLocalVideoTrack({
      ...(deviceId && deviceId !== 'default' ? { deviceId: { exact: deviceId } } : {}),
      width: 640,
      height: 480,
    });
  } catch (error) {
    console.error('Failed to create video track:', error);
    throw error;
  }
}

export async function startScreenShare(
  onStopped?: (event: Event) => void
): Promise<LocalVideoTrack | null> {
  try {
    if (!navigator?.mediaDevices?.getDisplayMedia) {
      throw new Error('Screen sharing is not supported in this browser');
    }

    const stream = await navigator.mediaDevices?.getDisplayMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 },
      },
      audio: false, // no mic needed
    });

    const videoTrack = stream?.getVideoTracks()[0];
    if (!videoTrack) {
      throw new Error('No video track found in screen share stream');
    }

    // wrap it for Twilio
    const twilioTrack = new LocalVideoTrack(videoTrack);

    // Check if the track is already ended

    // detect when user stops sharing from browser
    videoTrack.onended = event => {
      if (onStopped) {
        onStopped(event);
      }
    };

    return twilioTrack;
  } catch (error) {
    console.error('Failed to start screen share:', error);
    return null;
  }
}

export function stopScreenShare(track: LocalTrack) {
  if (track && 'stop' in track && typeof track.stop === 'function') {
    track.stop();
  }
}

export function stopAllTracks(tracks: LocalTrack[]) {
  tracks.forEach(track => {
    if (track && 'stop' in track && typeof track.stop === 'function') {
      track.stop();
    }
  });
}

export function stopAllMediaStreams() {
  // Stop all active media streams to free up camera and microphone
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // This will stop any active getUserMedia streams
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => {
          track.stop();
        });
      })
      .catch(() => {
        // Ignore errors - this is just for cleanup
      });
  }
}

export async function requestMediaPermissions(): Promise<{ audio: boolean; video: boolean }> {
  try {
    if (!navigator?.mediaDevices?.getUserMedia) {
      console.error('getUserMedia is not supported in this browser.');
      return { audio: false, video: false };
    }

    // Check for available devices first
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasAudioInput = devices.some(device => device.kind === 'audioinput');
    const hasVideoInput = devices.some(device => device.kind === 'videoinput');

    const permissions = { audio: false, video: false };

    // Try to get audio permission if audio device is available
    if (hasAudioInput) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStream.getTracks().forEach(track => track.stop());
        permissions.audio = true;
      } catch (error) {
        console.error('Audio permission denied or failed:', error);
        permissions.audio = false;
      }
    }

    // Try to get video permission if video device is available
    if (hasVideoInput) {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoStream.getTracks().forEach(track => track.stop());
        permissions.video = true;
      } catch (error) {
        console.error('Video permission denied or failed:', error);
        permissions.video = false;
      }
    }

    return permissions;
  } catch (error) {
    console.error('Failed to get media permissions:', error);
    return { audio: false, video: false };
  }
}

export function getStoredDevicePreferences() {
  const sessionDetails = getTwilioSessionDetails();
  return {
    audioInputId: sessionDetails.audioInputId || '',
    videoInputId: sessionDetails.videoInputId || '',
    audioOutputId: sessionDetails.audioOutputId || '',
  };
}

export function storeDevicePreferences(
  audioInputId: string,
  videoInputId: string,
  audioOutputId: string
) {
  updateTwilioSessionDetails({
    audioInputId,
    videoInputId,
    audioOutputId,
  });
}

export function getStoredUserPreferences() {
  const sessionDetails = getTwilioSessionDetails();
  return {
    displayName: sessionDetails.displayName || '',
    lastRoom: sessionDetails.lastRoom || '',
    identity: sessionDetails.identity || '',
    role: sessionDetails.role,
  };
}

export function storeUserPreferences(displayName: string, roomName: string) {
  updateTwilioSessionDetails({
    displayName,
    lastRoom: roomName,
  });
}
