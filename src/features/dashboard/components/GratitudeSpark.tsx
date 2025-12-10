import Icon from '@/stories/Common/Icon';

export const GratitudeSpark = () => {
  return (
    <div className='bg-white rounded-10px p-5'>
      <h6 className='text-base font-bold leading-22px text-blackdark mb-3.5'>Gratitude Spark</h6>
      <div className='rounded-10px bg-[linear-gradient(360deg,#E0DEFF_0%,#FCD9FF_100%)] h-56 xl:h-48 2xl:h-56 relative overflow-hidden p-5'>
        <div className='absolute -left-14 -bottom-14 w-28 h-28 rounded-full bg-transparent border-[16px] border-solid border-purpledark/27'></div>
        <div className='absolute -top-8 -right-12 w-28 h-28 rounded-full bg-transparent border-[16px] border-solid border-purpledark/27'></div>
        <div className='flex items-center justify-center h-full'>
          <div className='flex flex-col items-center gap-2.5 mx-auto w-3/4'>
            <Icon name='cursorpointer' className='text-purpledark' />
            <h6 className='text-purpledark text-sm 2xl:text-base font-bold leading-22px uppercase text-center'>
              Tap to uncover something worth noticing today
            </h6>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GratitudeSpark;
