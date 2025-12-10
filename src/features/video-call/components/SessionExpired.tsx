import Icon from '@/stories/Common/Icon';
const SessionExpired = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen bg-Gray px-4 text-center'>
      <div className='max-w-md p-8'>
        <Icon name='logo-secondary' className='ml-10 mb-10' />
        <h1 className='text-3xl font-bold mb-3 text-blackdark'>
          We're sorry, this session is no longer active.
        </h1>
        <p className='text-primarygray'>
          The scheduled appointment time has passed. Please contact your therapist to reschedule.
        </p>
      </div>
    </div>
  );
};

export default SessionExpired;
