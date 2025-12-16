import { useEffect, useCallback, useState } from 'react';

import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useGetAppointmentDetailsByVideoRoom } from '@/api/appointment';
import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import { ChatPanel } from '@/features/video-call/components/ChatPanel';
import { ClientDetails } from '@/features/video-call/components/ClientDetails';
import { ErrorState } from '@/features/video-call/components/ErrorState';
import { LeaveConfirmDialog } from '@/features/video-call/components/LeaveConfirmDialog';
import { LoadingState } from '@/features/video-call/components/LoadingState';
import { MemoPad } from '@/features/video-call/components/MemoPad';
import PendingAssessmentModal from '@/features/video-call/components/PendingAssessmentModal';
import PendingTaskModal from '@/features/video-call/components/PendingFormModal';
import { RoomControlBar } from '@/features/video-call/components/RoomControlBar';
import { RoomHeader } from '@/features/video-call/components/RoomHeader';
import { SettingsDialog } from '@/features/video-call/components/SettingsDialog';
import { VideoGrid } from '@/features/video-call/components/VideoGrid';
import { useBackgroundBlur } from '@/features/video-call/hooks/useBackgroundBlur';
import { useMediaControls } from '@/features/video-call/hooks/useMediaControls';
import { useRoomConnection } from '@/features/video-call/hooks/useRoomConnection';
import { useUIControls } from '@/features/video-call/hooks/useUIControls';
import { useVideoCall } from '@/features/video-call/store/useVideoCall';
import { stopAllActiveMediaTracks } from '@/features/video-call/utils/cleanup';
import { getTwilioSessionDetails } from '@/features/video-call/utils/twilioSessionStorage';
import { ParticipantsPanel } from '@/pages/video-call/ParticipantsPanel';
import { currentUser } from '@/redux/ducks/user';

export default function Room() {
  const [showModal, setShowModal] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const { roomId } = useParams<{ roomId: string }>();
  const { role } = useSelector(currentUser);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUserRole = location?.state?.role || getTwilioSessionDetails()?.role || role;

  const inviteToken = location.state?.invite || sessionStorage.getItem('inviteToken');

  // Custom hooks
  const { dataTrack, handleReconnection } = useRoomConnection();
  const { handleToggleMute, handleToggleVideo, handleToggleScreenShare } = useMediaControls();
  const {
    handleToggleBlur,
    isBlurEnabled,
    isProcessing: isBlurProcessing,
    blurMode,
  } = useBackgroundBlur();

  const {
    room,
    isConnected,
    isConnecting,
    connectionError,
    isMuted,
    isVideoEnabled,
    isScreenSharing,
    chatOpen,
    handRaisedSids,
    showParticipants,
    showSettings,
    showLeaveConfirm,
    hasLeftRoom,
    localTracks,
  } = useVideoCall();

  const { data: appointmentDetails } = useGetAppointmentDetailsByVideoRoom(roomId!);

  const [openPendingAssessmentForm, setOpenPendingAssessmentForm] = useState(false);

  const {
    handleToggleChat,
    handleLeave,
    handleToggleHandRaise,
    confirmLeave,
    enableAudioPlayback,
    setShowParticipants,
    setShowSettings,
    setShowLeaveConfirm,
    setChatOpen,
    isLeaving,
    handleClientDetailsModel,
    isClientDetailsOpen,
    setIsClientDetailsOpen,
    isMemoPadOpen,
    setIsMemoPadOpen,
    handleMemoPadModel,
  } = useUIControls(appointmentDetails?.id);

  // ... rest of the component ...

  // Enhanced beforeunload handler
  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (isConnected && room) {
        sessionStorage.setItem('userAudioEnabled', (!isMuted).toString());
        sessionStorage.setItem('userVideoEnabled', isVideoEnabled.toString());
        if (isScreenSharing) {
          handleToggleScreenShare();
        }
        stopAllActiveMediaTracks(room);
        room.disconnect();
        event.preventDefault();
        event.returnValue = ''; // show browser confirmation
        return event;
      }
    },
    [isConnected, room, isMuted, isVideoEnabled, isScreenSharing]
  );

  // Enhanced cleanup on page unload
  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  useEffect(() => {
    if (hasLeftRoom) {
      localTracks.forEach(track => {
        if (track && track.kind !== 'data' && typeof track.stop === 'function') {
          track.stop();
          track.disable();
        }
      });

      if (role == UserRole.THERAPIST) {
        navigate(ROUTES.END_SESSION_CONFIRMATION.navigatePath(appointmentDetails.id as string), {
          replace: true,
          state: { roomId: roomId },
        });
      } else {
        navigate(ROUTES.MEETING_LEFT.navigatePath(roomId as string), {
          replace: true,
          state: { invite: inviteToken },
        });
      }
    }
  }, [hasLeftRoom, navigate, inviteToken]);

  if (!isConnected && !isConnecting) {
    return <ErrorState connectionError={connectionError} onRetry={handleReconnection} />;
  }

  if (isConnecting) {
    return <LoadingState roomId={roomId || 'Unknown Room'} />;
  }

  return (
    <div
      className='h-screen bg-blacklightdark overflow-hidden flex flex-col'
      onClick={enableAudioPlayback}
    >
      {/* Header */}
      <RoomHeader
        appointmentDetails={appointmentDetails}
        roomName={roomId || 'Unknown Room'}
        participantCount={room?.participants.size || 0}
        onToggleParticipants={() => setShowParticipants(!showParticipants)}
        onOpenSettings={() => setShowSettings(true)}
        onLeave={handleLeave}
      />

      {/* Main Content */}
      <div className='flex-1 overflow-hidden flex items-start gap-5 px-4 relative'>
        {/* Video Grid */}
        <VideoGrid />

        {/* Participants Panel */}
        {showParticipants && <ParticipantsPanel onClose={() => setShowParticipants(false)} />}

        {/* Chat Panel */}
        {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
        {currentUserRole === UserRole.THERAPIST && isClientDetailsOpen && (
          <ClientDetails
            clientId={appointmentDetails.client.id}
            appointment_id={appointmentDetails.id}
            onClose={() => setIsClientDetailsOpen(false)}
            dependents={appointmentDetails.users_appointment}
            tenantId={appointmentDetails?.tenant_id}
          />
        )}
        {currentUserRole === UserRole.THERAPIST && isMemoPadOpen && (
          <MemoPad
            tenant_id={appointmentDetails?.tenant_id}
            appointment_id={appointmentDetails.id}
            client_id={appointmentDetails.client.id}
            therapist_id={appointmentDetails.therapist.id}
            onClose={() => setIsMemoPadOpen(false)}
          />
        )}
      </div>

      {/* Control Bar */}
      <div className='relative z-50 p-4'>
        <RoomControlBar
          role={currentUserRole}
          isMuted={isMuted}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
          isBlurEnabled={isBlurEnabled}
          isBlurProcessing={isBlurProcessing}
          isHandRaised={
            room?.localParticipant ? handRaisedSids.has(room.localParticipant.sid) : false
          }
          isChatOpen={chatOpen}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onToggleScreenShare={handleToggleScreenShare}
          onToggleBlur={handleToggleBlur}
          onToggleHandRaise={() => dataTrack && handleToggleHandRaise(dataTrack)}
          onToggleChat={handleToggleChat}
          onOpenSettings={() => setShowSettings(true)}
          onLeave={handleLeave}
          participantCount={room?.participants.size || 0}
          onToggleParticipants={() => {
            setChatOpen(false);
            setIsClientDetailsOpen(false);
            setIsMemoPadOpen(false);
            setShowParticipants(!showParticipants);
          }}
          blurMode={blurMode}
          setShowPendingTaskModal={setShowModal}
          pendingCount={pendingCount}
          onToggleClientDetails={handleClientDetailsModel}
          onToggleMemoPad={handleMemoPadModel}
          onTogglePendingAssessmentForm={() =>
            role === UserRole.CLIENT
              ? setShowModal(true)
              : setOpenPendingAssessmentForm(!openPendingAssessmentForm)
          }
        />
      </div>

      {/* Dialogs */}
      <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />

      <LeaveConfirmDialog
        open={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={confirmLeave}
        isLoading={isLeaving}
      />
      {openPendingAssessmentForm && role !== UserRole.CLIENT && (
        <PendingAssessmentModal
          isOpen={openPendingAssessmentForm}
          onClose={() => setOpenPendingAssessmentForm(false)}
          userId={appointmentDetails?.client.user.id}
          appointmentId={appointmentDetails?.id}
          tenant_id={appointmentDetails.tenant_id}
        />
      )}
      {currentUserRole == UserRole.CLIENT && (
        <PendingTaskModal
          userId={appointmentDetails?.client.user.id}
          appointmentId={appointmentDetails.id}
          setShowModal={setShowModal}
          setPendingCount={setPendingCount}
          showModal={showModal}
          tenant_id={appointmentDetails.tenant_id}
          role={role}
        />
      )}
    </div>
  );
}
