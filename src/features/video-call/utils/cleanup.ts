/**
 * Utility functions for cleaning up application state and storage
 */
import { clearTwilioSessionDetailsExceptIdentity } from '@/features/video-call/utils/twilioSessionStorage';

import type { Room } from 'twilio-video';

export function clearAllTwilioData() {
  // Clear centralized Twilio session storage
  clearTwilioSessionDetailsExceptIdentity();

  // Clear any other Twilio-related data from localStorage if needed
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('twilio-')) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}

export function forceCleanup() {
  // Clear all storage
  clearAllTwilioData();

  // Clear any cached data
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
}

export function stopAllActiveMediaTracks(room?: Room) {
  const activeStreams = navigator?.mediaDevices?._activeStreams;

  if (activeStreams && Array.isArray(activeStreams)) {
    activeStreams.forEach((stream: MediaStream) => {
      stream.getTracks().forEach(track => track?.stop());
    });
  }

  document.querySelectorAll('video, audio').forEach(mediaEl => {
    const stream = mediaEl.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track?.stop());
      mediaEl.srcObject = null;
    }
  });

  if (room) {
    room.localParticipant.tracks.forEach(publication => {
      const track = publication.track;
      if (track) {
        track?.stop?.();

        try {
          publication.unpublish();
        } catch (err) {
          console.error('Twilio unpublish error', err);
        }
      }
    });

    room.disconnect();
  }
}
