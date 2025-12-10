import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { formsQueryKey } from '@/api/common/assessment-form.queryKey';
import { jwtUtils } from '@/api/utils/jwtUtlis';
import { PendingTask } from '@/features/video-call/components/PendingTaskList';

export const WaitingRoom = ({
  appointmentId,
  tenant_id,
}: {
  appointmentId: string;
  userId?: string;
  tenant_id: string;
}) => {
  const [showWaitingList, setShowWaitingList] = useState(false);
  const queryClient = useQueryClient();
  const userId = jwtUtils.getUserFromToken(sessionStorage.getItem('inviteToken') as string)?.id;

  const handleData = (pendingCount: number) => setShowWaitingList(!pendingCount);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({
          queryKey: formsQueryKey.getList(appointmentId, userId),
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (showWaitingList) {
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <h3 className='text-lg font-bold text-blackdark mb-4'>
          Hang tight! We’ll begin shortly ⚡
        </h3>
        <div className='w-16 h-16 border-4 border-surface border-t-primary rounded-full animate-spin mb-4'></div>
        {/* <p className='text-xl font-mono bg-gray-200 px-3 py-1 rounded-md'>{formatTime(seconds)}</p> */}
      </div>
    );
  }

  return (
    <div className='   p-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-[24px] font-bold text-blackdark mb-4'>
            Your session will begin as soon as the Therapist starts it.
          </h1>
          <h2 className='text-[20px]  font-semibold text-gray-700'>
            Finish the pending tasks before the session starts
          </h2>
        </div>
        <div className='!h-[342px] overflow-auto !pb-[1.5rem]'>
          <PendingTask
            tenant_id={tenant_id}
            appointmentId={appointmentId}
            handleData={handleData}
            userId={userId}
          />
        </div>
        <div className='bg-gradient-to-r border-primary border-2 bg-primary/30 rounded-10px px-2 py-2 shadow-md'>
          <div className='flex items-center gap-4'>
            <p className='text-primary font-medium'>
              Complete required steps before your session begins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
