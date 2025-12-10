import clsx from 'clsx';

import { useVideoCall } from '@/features/video-call/store/useVideoCall';
import type { ParticipantInfo } from '@/redux/ducks/videoCall';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

interface ParticipantsPanelProps {
  onClose: () => void;
  parentClassName?: string;
}

export function ParticipantsPanel({ onClose, parentClassName }: ParticipantsPanelProps) {
  const { room, participants, networkQuality } = useVideoCall();

  if (!room) return null;

  // Get all participants including local
  const allParticipants = [
    {
      sid: room.localParticipant.sid,
      identity: room.localParticipant.identity,
      isLocal: true,
      isMuted: !Array.from(room.localParticipant.audioTracks.values())[0]?.track?.isEnabled,
      isVideoEnabled:
        Array.from(room.localParticipant.videoTracks.values())[0]?.track?.isEnabled !== false,
      networkQuality: networkQuality, // Use actual network quality from Redux store
    },
    ...Array.from(participants.entries()).map(([sid, participant]: [string, ParticipantInfo]) => ({
      sid,
      identity: participant.identity,
      isLocal: false,
      isMuted: participant.isMuted,
      isVideoEnabled: participant.isVideoEnabled,
      networkQuality: participant.networkQuality,
    })),
  ];

  const getNetworkQualityIcon = (quality: number) => {
    return (
      <div className='flex items-center gap-0.5'>
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className={`w-1 h-2 rounded-sm ${i < quality ? 'bg-green-400' : 'bg-yellow-400'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {/* <div className='md:hidden fixed inset-0 bg-black/50 z-[998]' onClick={onClose} /> */}

      <div className='w-[calc(100%-32px)] sm:w-387px rounded-20px z-50 h-full absolute right-4 xl:right-auto xl:relative'>
        <div className={clsx('flex flex-col bg-white rounded-20px h-full', parentClassName)}>
          {/* Header */}
          <div className='flex items-center justify-between p-5 bg-surface rounded-t-20px'>
            <h2 className='text-xl font-semibold leading-6 text-blackdark'>
              Participants ({allParticipants.length})
            </h2>
            <Button
              onClick={onClose}
              variant='none'
              className='text-blackdark !p-0'
              parentClassName='h-6'
              icon={<Icon name='x' className='icon-wrapper w-6 h-6' />}
            />
          </div>

          {/* Participants List */}
          <div className='p-5 relative flex-1 overflow-hidden'>
            <div className='h-full overflow-y-auto scroll-disable flex flex-col gap-3'>
              {allParticipants.map(
                (participant: {
                  sid: string;
                  identity: string;
                  isLocal: boolean;
                  isMuted: boolean;
                  isVideoEnabled: boolean;
                  networkQuality: number;
                }) => (
                  <div key={participant.sid} className='px-3 py-2 bg-surface rounded-lg'>
                    <div className='flex items-center gap-3 justify-between'>
                      <div className='flex items-center gap-2.5 flex-1 overflow-hidden'>
                        {/* Avatar */}
                        <div className='w-10 h-10 bg-Gray rounded-full flex items-center justify-center'>
                          <span className='text-lg font-bold text-blackdark'>
                            {participant.identity.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {/* Name and status */}
                        <div className='flex items-center gap-1 flex-1 overflow-hidden'>
                          <span className='text-base font-normal leading-5 truncate'>
                            {participant.identity.split('-')[0]}
                          </span>
                          {participant.isLocal && (
                            <span className='text-sm font-normal text-blackdark'>(You)</span>
                          )}
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        {/* Audio status */}

                        <Icon
                          name={participant.isMuted ? 'micOff' : 'mic'}
                          className={clsx(
                            'icon-wrapper w-5 h-5',
                            participant.isMuted ? 'text-red-400' : 'text-green-400'
                          )}
                        />

                        {/* Video status */}
                        <Icon
                          name={participant.isVideoEnabled ? 'video' : 'videoOff'}
                          className={clsx(
                            'icon-wrapper w-5 h-5',
                            participant.isVideoEnabled ? 'text-green-400' : 'text-red-400'
                          )}
                        />
                        {/* Network quality */}
                        <div className='flex items-center'>
                          {getNetworkQualityIcon(participant.networkQuality)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
