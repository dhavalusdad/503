import clsx from 'clsx';

import { usePatientWellnessInVideoCall } from '@/api/wellness';

interface PersonalHubNotesProps {
  clientId: string;
  tenant_id: string;
}

export const PersonalHubNotes = ({ clientId, tenant_id }: PersonalHubNotesProps) => {
  const { data: wellnessData, isLoading } = usePatientWellnessInVideoCall(clientId, tenant_id);
  if (isLoading) {
    return <div>Loading</div>;
  }
  if (!wellnessData) {
    return (
      <div className='py-4'>
        <p className='text-sm text-primarygray text-center'>
          Patient has not logged any data in their Wellness Hub
        </p>
      </div>
    );
  }

  return (
    <div className='mt-2.5 bg-white flex flex-col gap-5'>
      <div className='flex flex-col gap-2.5'>
        <h5 className='font-semibold text-base leading-5 text-blackdark'>Personal Hub Memo</h5>
        <div className='flex flex-col gap-1.5'>
          <p className='font-medium text-15px leading-5 text-blackdark'>
            How are you feeling today?
          </p>
          <p className='text-priamrygray text-sm leading-5 font-normal'>
            {wellnessData.daily_mood}
          </p>
        </div>
      </div>
      <div className='flex flex-col gap-2.5'>
        <p className='font-medium text-15px leading-5 text-blackdark'>
          What are you grateful for today?
        </p>
        <div className='flex flex-wrap gap-2'>
          {wellnessData.daily_gratitude.map((note: string, index: number) => (
            <span
              key={index}
              className={clsx(
                'px-3 py-1 rounded-full text-sm',
                index === 0 ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
              )}
            >
              {note}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
