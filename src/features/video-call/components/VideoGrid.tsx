import React, { useState, useRef, useEffect, memo, type JSX } from 'react';

import clsx from 'clsx';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { OverflowCard } from '@/features/video-call/components/OverflowCard';
import { VideoTile } from '@/features/video-call/components/VideoTile';
import { useVideoCall } from '@/features/video-call/store/useVideoCall';
import { sendPinSignal } from '@/features/video-call/utils/twilio';
import { useDeviceType } from '@/hooks/useDeviceType';

import type {
  LocalTrackPublication,
  RemoteTrackPublication,
  LocalTrack,
  RemoteTrack,
} from 'twilio-video';

interface Participant {
  sid: string;
  identity: string;
  isLocal: boolean;
  tracks: Map<string, LocalTrackPublication | RemoteTrackPublication>;
  networkQuality: number;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
}

interface FloatingPosition {
  x: number;
  y: number;
}

export const VideoGrid = memo(() => {
  const {
    room,
    participants,
    dominantSpeakerSid,
    handRaisedSids,
    isScreenSharing,
    isVideoEnabled,
    isMuted,
    pinnedParticipantSid,
    networkQuality,
    showAllParticipants,
    togglePinParticipant,
    setShowAllParticipants,
  } = useVideoCall();

  const deviceType = useDeviceType();

  const [floatingPosition, setFloatingPosition] = useState<FloatingPosition>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const dragRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });
  // Handle pin toggle with signal sending
  const handlePinToggle = (participantSid: string) => {
    if (participantSid === '' || participantSid === pinnedParticipantSid) {
      togglePinParticipant('');
      setTimeout(() => {
        setShowAllParticipants(true);
      }, 100);
      return;
    }
    const isCurrentlyPinned = pinnedParticipantSid === participantSid;
    const newPinnedState = !isCurrentlyPinned;

    togglePinParticipant(participantSid);

    if (room?.localParticipant) {
      const dataTrackPublication = Array.from(room.localParticipant.dataTracks.values())[0];
      if (dataTrackPublication && dataTrackPublication.track) {
        sendPinSignal(dataTrackPublication.track, participantSid, newPinnedState);
      }
    }
    setShowAllParticipants(false);
  };

  // Dragging handlers for floating tile
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    // Use left and top instead of right and bottom
    dragRef.current = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const containerRect = scrollContainerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const newX = e.clientX - containerRect.left - dragRef.current.offsetX;
    const newY = e.clientY - containerRect.top - dragRef.current.offsetY;

    // Keep within bounds
    const maxX = containerRect.width - 290; // Assuming floating tile width is 200px
    const maxY = containerRect.height - 200; // Assuming floating tile height is 150px

    setFloatingPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResizeObserver = () => {
    if (!scrollContainerRef.current) return;

    const containerRect = scrollContainerRef.current.getBoundingClientRect();

    const maxX = containerRect.width - 300; // tile width
    const maxY = containerRect.height - 200; // tile height

    // Only adjust if out of bounds
    if (floatingPosition.x > maxX || floatingPosition.y > maxY) {
      setFloatingPosition({
        x: Math.min(floatingPosition.x, maxX),
        y: Math.min(floatingPosition.y, maxY),
      });
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      new ResizeObserver(handleResizeObserver).observe(
        (scrollContainerRef.current as HTMLElement) || ''
      );
    }
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  useEffect(() => {
    const videoGridElement = document.getElementById('video-grid');

    if (!videoGridElement) return;

    // ResizeObserver for video grid
    const resizeObserver = new ResizeObserver(handleResizeObserver);
    resizeObserver.observe(videoGridElement);

    // Cleanup function
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Separate effect for IntersectionObserver that runs when showAllParticipants changes
  useEffect(() => {
    const swiperButtonElement = document.getElementById('swiper-action-button');
    if (scrollContainerRef.current && swiperButtonElement) {
      if (
        scrollContainerRef.current.contains(document.getElementById('swiper-element-video-grid'))
      ) {
        swiperButtonElement.classList.remove('hidden');
      } else {
        swiperButtonElement.classList.add('hidden');
      }
    }
  }, [showAllParticipants, allParticipants.length, pinnedParticipantSid, isScreenSharing]); // Re-run when layout might change

  if (!room) {
    return (
      <div className='w-full h-full flex items-center justify-center'>
        <div className='text-center text-sm font-normal leading-5 text-primarygray'>
          <p>No one has joined the meeting yet</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const allParticipants: Participant[] = [];

    // Local participant
    allParticipants.push({
      sid: room.localParticipant.sid,
      identity: room.localParticipant.identity,
      isLocal: true,
      tracks: room.localParticipant.tracks,
      networkQuality: networkQuality, // Use actual network quality from Redux store
      isMuted: isMuted,
      isVideoEnabled: isVideoEnabled,
      isScreenSharing: isScreenSharing,
    });

    // Remote participants
    Array.from(participants.entries()).forEach(([sid, participant]) => {
      const roomParticipant = room?.participants.get(sid);

      allParticipants.push({
        sid,
        identity: participant.identity,
        isLocal: false,
        tracks: roomParticipant?.tracks || new Map(),
        networkQuality: participant.networkQuality || 0, // Use actual network quality, default to 0 (unknown)
        isMuted: participant.isMuted,
        isVideoEnabled: participant.isVideoEnabled,
        isScreenSharing: participant.isScreenSharing || false,
      });
    });

    // Sorting (pinned > screen share > dominant)
    allParticipants.sort((a, b) => {
      const aPinned = pinnedParticipantSid === a.sid;
      const bPinned = pinnedParticipantSid === b.sid;
      if (aPinned !== bPinned) return aPinned ? -1 : 1;

      // const aScreen = a.isScreenSharing;
      // const bScreen = b.isScreenSharing;
      // if (aScreen !== bScreen) return aScreen ? -1 : 1;

      // const aDom = dominantSpeakerSid === a.sid;
      // const bDom = dominantSpeakerSid === b.sid;
      // if (aDom !== bDom) return aDom ? -1 : 1;

      return 0;
    });

    setAllParticipants([...allParticipants]);
  }, [
    room,
    participants,
    isMuted,
    isVideoEnabled,
    pinnedParticipantSid,
    dominantSpeakerSid,
    isScreenSharing,
  ]);

  useEffect(() => {
    Array.from(participants.entries()).forEach(([sid, participant]) => {
      if (
        participant?.identify?.split('-').includes('TP') &&
        participant?.identify?.split('-').includes('HOST')
      ) {
        handlePinToggle(sid);
      }
    });
  }, [participants]);

  useEffect(() => {
    if (showAllParticipants) {
      handlePinToggle(pinnedParticipantSid || '');
    }
  }, [showAllParticipants]);

  const getVideoTilesForParticipant = (participant: Participant) => {
    const tiles: JSX.Element[] = [];
    // Get video tracks
    const videoTracks = Array.from(participant.tracks.values())
      .map(pub => pub.track)
      .filter((t): t is LocalTrack | RemoteTrack => !!t && t.kind === 'video');

    const screenShareTrack = videoTracks.find(t => t.name === 'screen');

    // Get audio track
    const audioTrack =
      Array.from(participant.tracks.values())
        .map(pub => pub.track)
        .find((t): t is LocalTrack | RemoteTrack => !!t && t.kind === 'audio') || null;

    videoTracks.forEach((track, index) => {
      const isScreenShare = track.name === 'screen';
      const identity =
        participant.identity.split('-')[0] + (isScreenShare ? ' (Screen Share)' : '');
      tiles.push(
        <VideoTile
          key={`${participant.sid}-${isScreenShare ? 'screen' : 'camera'}-${index}-${participant.isVideoEnabled ? 'videoEnabled' : 'videoDisabled'}`}
          identity={identity}
          videoTrack={track}
          audioTrack={audioTrack}
          isMuted={participant.isMuted}
          isLocal={participant.isLocal}
          isVideoEnabled={isScreenShare ? true : participant.isVideoEnabled}
          isScreenSharing={isScreenShare}
          participantSid={isScreenShare ? `${participant.sid} screen` : participant.sid}
          isDominantSpeaker={dominantSpeakerSid === participant.sid}
          isHandRaised={handRaisedSids.has(participant.sid)}
          isPinned={pinnedParticipantSid === participant.sid}
          networkQuality={participant.networkQuality}
          onPinToggle={() =>
            handlePinToggle(isScreenShare ? `${participant.sid} screen` : participant.sid)
          }
        />
      );
    });

    // Add placeholder tile if no video but has audio
    if (videoTracks.length === 0 && audioTrack) {
      const identity = participant.identity.split('-')[0];
      tiles.push(
        <VideoTile
          key={`${participant.sid}-placeholder`}
          identity={identity}
          videoTrack={undefined}
          audioTrack={audioTrack}
          isMuted={participant.isMuted}
          isVideoEnabled={participant.isVideoEnabled}
          isLocal={participant.isLocal}
          participantSid={participant.sid}
          isScreenSharing={false}
          isDominantSpeaker={dominantSpeakerSid === participant.sid}
          isHandRaised={handRaisedSids.has(participant.sid)}
          isPinned={pinnedParticipantSid === participant.sid}
          networkQuality={participant.networkQuality}
          onPinToggle={() => handlePinToggle(participant.sid)}
        />
      );
    }

    if (videoTracks.length == 1 && screenShareTrack && audioTrack) {
      const identity = participant.identity.split('-')[0];
      tiles.push(
        <VideoTile
          key={`${participant.sid}-placeholder`}
          identity={identity}
          videoTrack={undefined}
          audioTrack={audioTrack}
          isMuted={participant.isMuted}
          isVideoEnabled={participant.isVideoEnabled}
          isLocal={participant.isLocal}
          participantSid={participant.sid}
          isScreenSharing={false}
          isDominantSpeaker={dominantSpeakerSid === participant.sid}
          isHandRaised={handRaisedSids.has(participant.sid)}
          isPinned={pinnedParticipantSid === participant.sid}
          networkQuality={participant.networkQuality}
          onPinToggle={() => handlePinToggle(participant.sid)}
        />
      );
    }

    // Add data-only tile if no audio/video
    if (
      !audioTrack &&
      (videoTracks.length === 0 || (videoTracks.length === 1 && screenShareTrack))
    ) {
      const identity = participant.identity.split('-')[0];
      tiles.push(
        <VideoTile
          key={`${participant.sid}-placeholder-${participant.isVideoEnabled ? 'videoEnabled' : 'videoDisabled'}`}
          identity={identity}
          audioTrack={null}
          videoTrack={undefined}
          isMuted={participant.isMuted}
          participantSid={participant.sid}
          isVideoEnabled={false}
          isLocal={participant.isLocal}
          isScreenSharing={false}
          isDominantSpeaker={dominantSpeakerSid === participant.sid}
          isHandRaised={handRaisedSids.has(participant.sid)}
          isPinned={pinnedParticipantSid === participant.sid}
          networkQuality={participant.networkQuality}
          onPinToggle={() => handlePinToggle(participant.sid)}
        />
      );
    }
    return tiles;
    // return Array.from({ length: 7 }).fill(tiles[0])
  };

  const getAllVideoTiles = () => {
    return allParticipants.flatMap(participant => getVideoTilesForParticipant(participant));
  };

  const hasScreenShare = () => {
    return allParticipants.some(p => p.isScreenSharing);
  };

  const hasPinnedParticipant = () => {
    return pinnedParticipantSid !== null;
  };

  const getMainTile = () => {
    const allTiles = getAllVideoTiles();

    if (hasPinnedParticipant()) {
      let pinnedTileMatch = null;
      for (const tile of allTiles) {
        if (tile.props.participantSid === pinnedParticipantSid) {
          const tiles = allTiles.find(tile => tile.props.participantSid === pinnedParticipantSid);
          pinnedTileMatch = tiles;
          return tiles; // Return first tile of pinned participant
        }
      }
      if (!pinnedTileMatch) {
        handlePinToggle('');
      }
    }
    // Find screen share first
    for (const participant of allParticipants) {
      const tiles = getVideoTilesForParticipant(participant);
      const screenShareTile = tiles.find(tile => tile.props.isScreenSharing);
      if (screenShareTile) return screenShareTile;
    }

    // Then find pinned participant

    return null;
  };

  const getSidebarTiles = () => {
    const mainTile = getMainTile();
    const allTiles = getAllVideoTiles();

    if (!mainTile) return allTiles;

    // Filter out the main tile
    return allTiles.filter(tile => tile.key !== mainTile.key);
  };

  const getOverflowCount = () => {
    const sidebarTiles = getSidebarTiles();
    if (deviceType === 'mobile') {
      return sidebarTiles.length;
    }
    if (deviceType === 'mobilehorizontal' || deviceType === 'tablet') {
      return sidebarTiles.length > 1 ? sidebarTiles.length - 1 : 0;
    }
    return sidebarTiles.length > 4 ? sidebarTiles.length - 3 : 0;
  };

  const renderScreenShareLayout = () => {
    const mainTile = getMainTile();
    const sidebarTiles = getSidebarTiles();
    const visibleSidebarTiles = (() => {
      if (deviceType === 'mobile') {
        return []; // only overflow
      }
      if (deviceType === 'mobilehorizontal' || deviceType === 'tablet') {
        return sidebarTiles.slice(0, 1); // show 1 tile
      }
      // desktop / tabletbigger
      return sidebarTiles.slice(0, sidebarTiles.length === 4 ? 4 : 3);
    })();
    const overflowCount = getOverflowCount();

    return (
      <div className='flex flex-col lg:flex-row w-full h-full gap-5'>
        {/* Main content area */}
        <div className='flex-1 h-full'>{mainTile}</div>

        {/* Right sidebar for participants */}
        {/* {visibleSidebarTiles.length > 0 && ( */}
        {(visibleSidebarTiles.length > 0 || overflowCount > 0) && (
          <div
            className={clsx(
              'grid gap-5',
              deviceType === 'mobile'
                ? 'grid-cols-1 w-full h-28' // only overflow
                : deviceType === 'mobilehorizontal'
                  ? 'grid-cols-2 w-full h-32' // 1 tile + overflow (2 columns)
                  : deviceType === 'tablet'
                    ? 'grid-cols-2 w-full h-40' // 1 tile + overflow (2 columns)
                    : 'grid-cols-1 grid-rows-4 w-64'
            )}
          >
            {deviceType !== 'mobile' &&
              visibleSidebarTiles.map(tile => (
                <React.Fragment key={tile.key}>{tile}</React.Fragment>
              ))}

            {/* Overflow indicator */}
            {overflowCount > 0 && (
              <OverflowCard
                additionalCount={overflowCount}
                onClick={() => {
                  handlePinToggle('');
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  const renderFloatingLayout = () => {
    const allTiles = getAllVideoTiles();
    let [floatingTile, mainTile] = allTiles;
    if (floatingTile.props.isPinned) {
      [floatingTile, mainTile] = [mainTile, floatingTile];
    }

    // For mobile, use a side-by-side layout instead of floating
    if (deviceType === 'mobile' || deviceType === 'mobilehorizontal') {
      return (
        <div className='flex flex-col w-full h-full gap-4'>
          <>{mainTile}</>
          {floatingTile && <>{floatingTile}</>}
        </div>
      );
    }
    return (
      <div className='relative w-full h-full'>
        {/* Main tile takes full space */}
        <div className='w-full h-full'>{mainTile}</div>

        {/* Floating tile */}
        {floatingTile && (
          <div
            className='absolute w-64 sm:w-72 h-40 sm:h-48 cursor-move z-10 rounded-2xl backdrop-blur-[18px] shadow-content'
            style={{
              left: `${floatingPosition.x}px`,
              top: `${floatingPosition.y}px`,
            }}
            onMouseDown={handleMouseDown}
          >
            {floatingTile}
          </div>
        )}
      </div>
    );
  };

  const renderGridLayout = () => {
    const allTiles = getAllVideoTiles();

    return (
      <div className={clsx('grid gap-5 w-full h-full', getGridClass(allTiles.length))}>
        {allTiles}
      </div>
    );
  };

  const getGridClass = (count: number) => {
    if (count <= 1) return 'grid-cols-1 grid-rows-1';
    if (count <= 2) return 'grid-cols-1 grid-rows-2 sm:grid-cols-2 sm:grid-rows-1';
    if (count <= 4) return 'sm:grid-cols-2 sm:grid-rows-2';
    if (count <= 6)
      return 'sm:grid-cols-2 sm:grid-rows-2 md:grid-rows-3 xl:grid-cols-3 xl:grid-rows-2';
    if (count <= 9)
      return 'sm:grid-cols-2 sm:grid-rows-2 md:grid-rows-3 lg:grid-cols-3 xl:grid-cols-3 xl:grid-rows-3';
    if (count <= 12)
      return 'sm:grid-cols-2 sm:grid-rows-2 md:grid-rows-3 lg:grid-rows-4 lg:grid-cols-3 xl:grid-cols-4 xl:grid-rows-3';
    if (count <= 16)
      return 'sm:grid-cols-2 sm:grid-rows-2 md:grid-rows-3 lg:grid-rows-4 lg:grid-cols-3 xl:grid-cols-4 xl:grid-rows-4';
    return 'sm:grid-cols-2 sm:grid-rows-2 md:grid-rows-3 lg:grid-rows-4 lg:grid-cols-3 xl:grid-cols-5 xl:grid-rows-4'; // 17–20
  };

  const renderSwiperGridLayout = () => {
    const allTiles = getAllVideoTiles();

    const tilesPerSlide =
      deviceType === 'mobile'
        ? 2
        : deviceType === 'mobilehorizontal'
          ? 4
          : deviceType === 'tablet'
            ? 6
            : deviceType === 'tabletbigger'
              ? 12
              : 20;
    const swiperArray = Array.from({ length: Math.ceil(allTiles.length / tilesPerSlide) }, (_, i) =>
      allTiles.slice(i * tilesPerSlide, (i + 1) * tilesPerSlide)
    );

    return (
      <Swiper
        modules={[Navigation]}
        id='swiper-element-video-grid'
        navigation={{
          nextEl: '.custom-next',
          prevEl: '.custom-prev',
        }}
        className='w-full h-full'
        spaceBetween={10}
        slidesPerView={1}
        breakpoints={{
          640: {
            spaceBetween: 15,
          },
          1024: {
            spaceBetween: 20,
          },
        }}
      >
        {swiperArray.map((swiper, index) => (
          <SwiperSlide key={index}>
            <div className={clsx('grid gap-5 w-full h-full', getGridClass(swiper.length))}>
              {swiper}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    );
  };

  const shouldUseScreenShareLayout = () => {
    const allTiles = getAllVideoTiles();
    return (hasScreenShare() || hasPinnedParticipant()) && allTiles.length > 2;
  };

  const shouldUseFloatingLayout = () => {
    const allTiles = getAllVideoTiles();
    return allTiles.length === 2 && !shouldUseScreenShareLayout();
  };

  const renderLayout = () => {
    if (shouldUseFloatingLayout()) {
      return renderFloatingLayout();
    }

    if (shouldUseScreenShareLayout() && !showAllParticipants) {
      return renderScreenShareLayout();
    }
    if (
      deviceType === 'mobile'
        ? getAllVideoTiles().length > 2
        : deviceType === 'mobilehorizontal'
          ? getAllVideoTiles().length > 4
          : deviceType === 'tablet'
            ? getAllVideoTiles().length > 6
            : deviceType === 'tabletbigger'
              ? getAllVideoTiles().length > 12
              : getAllVideoTiles().length > 20
    ) {
      return renderSwiperGridLayout();
    }

    return renderGridLayout();
  };

  return (
    <div ref={scrollContainerRef} className='h-full flex-1 overflow-hidden'>
      {renderLayout()}
    </div>
  );
});
