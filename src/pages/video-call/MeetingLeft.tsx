import { useLocation, useSearchParams } from 'react-router-dom';

import MeetingLeftScreen from '@/features/video-call/components/MeetingLeftScreen';

const MeetingLeft = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const inviteToken =
    location.state?.invite ||
    searchParams.get('invite') ||
    sessionStorage.getItem('inviteToken') ||
    undefined;

  return <MeetingLeftScreen inviteToken={inviteToken} />;
};

export default MeetingLeft;
