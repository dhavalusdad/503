import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { DeviceSelector } from '@/features/video-call/components/DeviceSelector';
import { useVideoCall } from '@/features/video-call/store/useVideoCall';
import { clearAllTwilioData } from '@/features/video-call/utils/cleanup';
import { generateRoomId, validateDisplayName } from '@/features/video-call/utils/format';
import {
  createPreviewTracks,
  getStoredUserPreferences,
  requestMediaPermissions,
  storeUserPreferences,
} from '@/features/video-call/utils/media';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';

import type { LocalTrack } from 'twilio-video';

export function CreateMeeting() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [appointmentTitle, setAppointmentTitle] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [previewTracks, setPreviewTracks] = useState<LocalTrack[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [appointmentLink, setAppointmentLink] = useState('');

  const { setIdentity } = useVideoCall();

  useEffect(() => {
    // Clear any existing session data on page load
    clearAllTwilioData();

    // Load stored preferences
    const { displayName: storedName } = getStoredUserPreferences();
    setDisplayName(storedName);

    // Request permissions and create preview
    initializePreview();
  }, []);

  const initializePreview = async () => {
    try {
      const hasPerms = await requestMediaPermissions();
      setHasPermissions(hasPerms.audio && hasPerms.video);

      if (hasPerms.audio && hasPerms.video) {
        const tracks = await createPreviewTracks();
        setPreviewTracks(tracks);
      }
    } catch (error) {
      console.error('Failed to initialize preview:', error);
    }
  };

  const toggleVideo = () => {
    const videoTrack = previewTracks.find(track => track.kind === 'video');
    if (videoTrack && videoTrack.kind === 'video') {
      if (isVideoEnabled) {
        // Stop the track completely to free up camera resources
        videoTrack.stop();
      } else {
        // Recreate the video track when enabling
        initializePreview();
      }
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    const audioTrack = previewTracks.find(track => track.kind === 'audio');
    if (audioTrack && audioTrack.kind === 'audio') {
      if (isAudioEnabled) {
        // Stop the track completely to free up microphone resources
        audioTrack.stop();
      } else {
        // Recreate the audio track when enabling
        initializePreview();
      }
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const handleCreateAppointment = async () => {
    const nameError = validateDisplayName(displayName);
    if (nameError) {
      return;
    }

    if (!appointmentTitle.trim()) {
      return;
    }

    setIsCreating(true);

    try {
      // Generate a unique room ID for the appointment
      const roomId = generateRoomId();

      // Store preferences
      storeUserPreferences(displayName, roomId);
      setIdentity(displayName);

      // Create unique identity to avoid duplicates
      const uniqueIdentity = `${displayName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Stop preview tracks first
      previewTracks.forEach(track => {
        if (track && track.kind !== 'data' && typeof track.stop === 'function') {
          track.stop();
        }
      });

      // Create appointment link
      const baseUrl = window.location.origin;
      const appointmentUrl = `${baseUrl}/join-appointment/${encodeURIComponent(roomId)}?title=${encodeURIComponent(appointmentTitle)}&host=${encodeURIComponent(displayName)}`;

      setAppointmentLink(appointmentUrl);

      // Store appointment data in sessionStorage
      sessionStorage.setItem(
        'appointmentData',
        JSON.stringify({
          roomId,
          title: appointmentTitle,
          host: displayName,
          date: appointmentDate,
          time: appointmentTime,
          identity: uniqueIdentity,
        })
      );
    } catch (error) {
      console.error('Failed to create appointment:', error);
      setIsCreating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(appointmentLink);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const shareAppointment = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: appointmentTitle || 'Video Call Appointment',
          text: `Join my video call: ${appointmentTitle || 'Appointment'}`,
          url: appointmentLink,
        });
      } catch (error) {
        console.error('Failed to share:', error);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const joinAppointment = () => {
    if (appointmentLink) {
      navigate(
        `/join-appointment/${encodeURIComponent(JSON.parse(sessionStorage.getItem('appointmentData') || '{}').roomId)}`
      );
    }
  };

  const goBackToLobby = () => {
    navigate('/');
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='max-w-4xl w-full'>
        <div className='text-center mb-8'>
          <div className='flex flex-wrap gap-3 items-center justify-between mb-4'>
            <Button onClick={goBackToLobby} variant='outline' className='flex items-center gap-2'>
              <Icon name='leftarrow' className='w-4 h-4' />
              Back to Lobby
            </Button>
            <div></div> {/* Spacer */}
          </div>

          <h1 className='text-4xl font-bold text-gray-900 mb-2'>Create Appointment Link</h1>
          <p className='text-lg text-gray-600'>Create a meeting link and share it with others</p>
        </div>

        <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
          <div className='grid md:grid-cols-2 gap-0'>
            {/* Preview Section */}
            <div className='bg-gray-900 p-6 flex flex-col'>
              <h2 className='text-white text-lg font-semibold mb-4'>Camera Preview</h2>

              <div className='flex-1 relative bg-gray-800 rounded-lg overflow-hidden mb-4'>
                {hasPermissions && previewTracks.length > 0 ? (
                  <VideoPreview
                    tracks={previewTracks}
                    isVideoEnabled={isVideoEnabled}
                    displayName={displayName}
                  />
                ) : (
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='text-center text-gray-400'>
                      <Icon name='videoOff' className='w-12 h-12 mx-auto mb-2' />
                      <p>Camera preview unavailable</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Controls */}
              <div className='flex justify-center gap-3'>
                <Button
                  variant={isAudioEnabled ? 'outline' : 'outline'}
                  onClick={toggleAudio}
                  isDisabled={!hasPermissions}
                >
                  {isAudioEnabled ? (
                    <Icon name='mic' className='w-4 h-4' />
                  ) : (
                    <Icon name='micOff' className='w-4 h-4' />
                  )}
                </Button>

                <Button
                  variant={isVideoEnabled ? 'outline' : 'outline'}
                  onClick={toggleVideo}
                  isDisabled={!hasPermissions}
                >
                  {isVideoEnabled ? (
                    <Icon name='video' className='w-4 h-4' />
                  ) : (
                    <Icon name='videoOff' className='w-4 h-4' />
                  )}
                </Button>

                <Button variant='outline' onClick={() => setShowSettings(!showSettings)}>
                  <Icon name='settings' className='w-4 h-4' />
                </Button>
              </div>

              {showSettings && (
                <div className='mt-4'>
                  <DeviceSelector />
                </div>
              )}
            </div>

            {/* Appointment Form Section */}
            <div className='p-6'>
              {!appointmentLink ? (
                <>
                  <h2 className='text-xl font-semibold text-gray-900 mb-6'>Create Appointment</h2>

                  <div className='space-y-4'>
                    <div>
                      <label
                        htmlFor='displayName'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Your Name
                      </label>
                      <InputField
                        id='displayName'
                        type='text'
                        placeholder='Enter your name'
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        disabled={isCreating}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor='appointmentTitle'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Appointment Title
                      </label>
                      <InputField
                        id='appointmentTitle'
                        type='text'
                        placeholder='e.g., Team Meeting, Client Call, Interview'
                        value={appointmentTitle}
                        onChange={e => setAppointmentTitle(e.target.value)}
                        disabled={isCreating}
                      />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label
                          htmlFor='appointmentDate'
                          className='block text-sm font-medium text-gray-700 mb-2'
                        >
                          Date (Optional)
                        </label>
                        <InputField
                          id='appointmentDate'
                          type='date'
                          value={appointmentDate}
                          onChange={e => setAppointmentDate(e.target.value)}
                          disabled={isCreating}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='appointmentTime'
                          className='block text-sm font-medium text-gray-700 mb-2'
                        >
                          Time (Optional)
                        </label>
                        <InputField
                          id='appointmentTime'
                          type='time'
                          value={appointmentTime}
                          onChange={e => setAppointmentTime(e.target.value)}
                          disabled={isCreating}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateAppointment}
                      isDisabled={isCreating || !displayName.trim() || !appointmentTitle.trim()}
                      className='w-full'
                      variant='outline'
                    >
                      {isCreating ? 'Creating...' : 'Create Appointment Link'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className='text-xl font-semibold text-gray-900 mb-6'>Appointment Created!</h2>

                  <div className='space-y-4'>
                    <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                      <h3 className='font-semibold text-green-800 mb-2'>{appointmentTitle}</h3>
                      <p className='text-green-700 text-sm'>Host: {displayName}</p>
                      {appointmentDate && (
                        <p className='text-green-700 text-sm flex items-center gap-1 mt-1'>
                          <Icon name='calendar' className='w-4 h-4' />
                          {new Date(appointmentDate).toLocaleDateString()}
                        </p>
                      )}
                      {appointmentTime && (
                        <p className='text-green-700 text-sm flex items-center gap-1 mt-1'>
                          <Icon name='clock' className='w-4 h-4' />
                          {appointmentTime}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Appointment Link
                      </label>
                      <div className='flex gap-2'>
                        <InputField
                          value={appointmentLink}
                          readOnly
                          className='flex-1'
                          disabled
                          type='text'
                        />
                        <Button variant='outline' onClick={copyToClipboard}>
                          <span>Copy</span>
                        </Button>
                      </div>
                    </div>

                    <div className='flex gap-2'>
                      <Button
                        onClick={shareAppointment}
                        className='flex-1'
                        variant='outline'
                        isDisabled={!appointmentLink}
                      >
                        <span>Share</span>
                        Share
                      </Button>
                      <Button
                        onClick={joinAppointment}
                        className='flex-1'
                        variant='outline'
                        isDisabled={!appointmentLink}
                      >
                        Join Now
                      </Button>
                    </div>

                    <Button
                      onClick={() => {
                        setAppointmentLink('');
                        setIsCreating(false);
                      }}
                      variant='outline'
                      className='w-full'
                    >
                      Create Another Appointment
                    </Button>
                  </div>
                </>
              )}

              <div className='mt-6 pt-6 border-t border-gray-200'>
                <p className='text-sm text-gray-500 text-center'>
                  Share this link with others to join your video call
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface VideoPreviewProps {
  tracks: LocalTrack[];
  isVideoEnabled: boolean;
  displayName: string;
}

function VideoPreview({ tracks, isVideoEnabled, displayName }: VideoPreviewProps) {
  const videoTrack = tracks.find(track => track.kind === 'video');

  useEffect(() => {
    if (videoTrack && isVideoEnabled && videoTrack.kind === 'video') {
      const videoElement = document.getElementById('preview-video') as HTMLVideoElement;
      if (videoElement) {
        try {
          // For Twilio LocalTrack, we need to get the underlying MediaStreamTrack
          // For Twilio LocalVideoTrack, we need to get the underlying MediaStream
          if ('mediaStreamTrack' in videoTrack) {
            videoElement.srcObject = new MediaStream([videoTrack.mediaStreamTrack]);
          } else if ('attach' in videoTrack) {
            // Fallback: try to attach the track directly
            (videoTrack as { attach: (element: HTMLVideoElement) => void }).attach(videoElement);
          }
        } catch (error) {
          console.error('Failed to create MediaStream for preview:', error);
          // Fallback: try to use the track directly if it's already a MediaStreamTrack
          try {
            if (videoTrack instanceof MediaStreamTrack) {
              videoElement.srcObject = new MediaStream([videoTrack]);
            }
          } catch (fallbackError) {
            console.error('Fallback MediaStream creation also failed:', fallbackError);
          }
        }
        return () => {
          videoElement.srcObject = null;
        };
      }
    }
  }, [videoTrack, isVideoEnabled]);

  return (
    <div className='relative w-full h-full'>
      {isVideoEnabled && videoTrack && videoTrack.kind === 'video' ? (
        <video
          id='preview-video'
          className='w-full h-full object-cover'
          autoPlay
          muted
          playsInline
        />
      ) : (
        <div className='absolute inset-0 flex items-center justify-center bg-gray-800'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2'>
              <span className='text-xl font-semibold text-white'>
                {displayName.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <Icon name='videoOff' className='w-6 h-6 mx-auto text-gray-400' />
          </div>
        </div>
      )}

      {/* Name overlay */}
      <div className='absolute bottom-3 left-3'>
        <span className='text-white text-sm font-medium bg-black/50 px-2 py-1 rounded'>
          {displayName || 'You'} (Preview)
        </span>
      </div>
    </div>
  );
}
