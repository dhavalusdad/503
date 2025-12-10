import { useSelector } from 'react-redux';

import { UserRole } from '@/api/types/user.dto';
import { currentUser } from '@/redux/ducks/user';
import Icon from '@/stories/Common/Icon';

const ChatWelcome = () => {
  const user = useSelector(currentUser);

  return (
    <div className='flex items-center justify-center bg-white rounded-20px p-5 flex-1'>
      <div className='max-w-498px text-center'>
        <div className='flex flex-col items-center'>
          <div className='w-60px h-60px bg-greendarklight/45 rounded-full flex items-center justify-center mb-5'>
            <Icon name='messageSquare' className='text-primary icon-wrapper w-22px h-22px' />
          </div>
          <h1 className='font-bold text-xl text-primary mb-2.5'>
            Welcome to CytiPsychological Chat
          </h1>
          <p className='text-base font-normal text-blackdark'>{`Connect with your ${user.role == UserRole.THERAPIST ? 'client' : 'therapist'} in a safe, confidential environment. Select a conversation from the left to start chatting.`}</p>
        </div>
        <div className='mt-30px p-3 bg-surfacelight border border-surface rounded-10px'>
          <p className='font-normal text-base text-blackdark'>
            {`Select a conversation from the left to start chatting with your ${user.role == UserRole.THERAPIST ? 'client' : 'therapist'}.`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatWelcome;
