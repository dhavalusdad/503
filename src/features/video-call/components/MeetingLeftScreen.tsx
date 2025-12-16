import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { appointmentQueryKey } from '@/api/common/appointment.queryKey';
import { UserRole } from '@/api/types/user.dto';
import Illustration from '@/assets/images/Illustration.webp';
import { ROUTES } from '@/constants/routePath';
import { useVideoCall } from '@/features/video-call/store/useVideoCall';
import { stopAllActiveMediaTracks } from '@/features/video-call/utils/cleanup';
import { getTwilioIdentity } from '@/features/video-call/utils/twilioSessionStorage';
import { useInvalidateQuery } from '@/hooks/data-fetching';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';

const MeetingLeftScreen = ({ inviteToken }: { inviteToken: string }) => {
  const { isTherapistEndCall } = useVideoCall();
  const { invalidate } = useInvalidateQuery();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { room } = useVideoCall();
  const { role, accessToken } = useSelector(currentUser);
  const identity = getTwilioIdentity();
  const user = useSelector(currentUser);
  const redirection = {
    [UserRole.CLIENT]: accessToken ? ROUTES.CLIENT_DASHBOARD.path : ROUTES.LOGIN.path,
    [UserRole.THERAPIST]: accessToken
      ? ROUTES.THERAPIST_DASHBOARD.path
      : ROUTES.THERAPIST_LOGIN.path,
    [UserRole.ADMIN]: accessToken ? ROUTES.ADMIN_DASHBOARD.path : ROUTES.ADMIN_LOGIN.path,
    [UserRole.BACKOFFICE]: accessToken
      ? ROUTES.ADMIN_BACKOFFICE_QUEUE.path
      : ROUTES.ADMIN_LOGIN.path,
  }[role];

  const handleReturnToHomeScreen = () => {
    navigate(redirection);

    stopAllActiveMediaTracks(room!);
    if (user) {
      invalidate(appointmentQueryKey.clientAppointments(user?.id));
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 font-nunito'>
      <div className='relative w-full max-w-md flex justify-center'>
        <img src={Illustration} alt='Meeting Illustration' className='w-64 h-64 object-contain' />
      </div>
      <h1 className='mt-8 text-xl font-semibold text-gray-800'>{`${isTherapistEndCall ? 'The Host ended the meeting' : 'You left the meeting'}`}</h1>
      <div className='mt-6 flex flex-col gap-4 items-center'>
        <div className='flex gap-4'>
          <Button
            className='bg-green-800 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition'
            onClick={handleReturnToHomeScreen}
            variant='filled'
          >
            Return to home screen
          </Button>
          {identity && (
            <Button
              className='bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-500 transition'
              onClick={() => {
                if (roomId) {
                  const roomLink = `${roomId}?invite=${inviteToken}`;
                  navigate(ROUTES.JOIN_APPOINTMENT.navigatePath(roomLink), {
                    state: { fromRejoin: true },
                  });
                }
              }}
              variant='filled'
            >
              Rejoin Meeting
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingLeftScreen;
