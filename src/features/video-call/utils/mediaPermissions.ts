// Media permissions storage utility
export interface MediaPermissions {
  audio: boolean;
  video: boolean;
  timestamp: number;
}

const PERMISSIONS_KEY = 'videoCall_mediaPermissions';

export const getStoredMediaPermissions = (): MediaPermissions | null => {
  try {
    const stored = localStorage.getItem(PERMISSIONS_KEY);
    if (!stored) return null;

    const permissions = JSON.parse(stored) as MediaPermissions;

    // Check if permissions are older than 24 hours
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;

    if (now - permissions.timestamp > dayInMs) {
      // Remove expired permissions
      localStorage.removeItem(PERMISSIONS_KEY);
      return null;
    }

    return permissions;
  } catch (error) {
    console.error('Error reading stored media permissions:', error);
    return null;
  }
};

export const storeMediaPermissions = (audio: boolean, video: boolean): void => {
  try {
    const permissions: MediaPermissions = {
      audio,
      video,
      timestamp: Date.now(),
    };
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
  } catch (error) {
    console.error('Error storing media permissions:', error);
  }
};

export const clearStoredMediaPermissions = (): void => {
  try {
    localStorage.removeItem(PERMISSIONS_KEY);
  } catch (error) {
    console.error('Error clearing stored media permissions:', error);
  }
};

export const requestMediaPermissions = async (): Promise<{ audio: boolean; video: boolean }> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    // Get the actual track states
    const audioTracks = stream.getAudioTracks();
    const videoTracks = stream.getVideoTracks();

    const audioEnabled = audioTracks.length > 0 && audioTracks[0].enabled;
    const videoEnabled = videoTracks.length > 0 && videoTracks[0].enabled;

    // Stop the stream immediately as we only needed it to check permissions
    stream.getTracks().forEach(track => track.stop());

    // Store the permissions
    storeMediaPermissions(audioEnabled, videoEnabled);

    return { audio: audioEnabled, video: videoEnabled };
  } catch (error) {
    console.error('Error requesting media permissions:', error);

    // Try to get partial permissions
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.getTracks().forEach(track => track.stop());
      storeMediaPermissions(true, false);
      return { audio: true, video: false };
    } catch {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoStream.getTracks().forEach(track => track.stop());
        storeMediaPermissions(false, true);
        return { audio: false, video: true };
      } catch {
        storeMediaPermissions(false, false);
        return { audio: false, video: false };
      }
    }
  }
};
