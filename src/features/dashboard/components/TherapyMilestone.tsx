import Icon from '@/stories/Common/Icon';

export const TherapyMilestone = () => {
  return (
    <div className='bg-white rounded-10px p-5'>
      <h6 className='text-base font-bold leading-22px text-blackdark mb-3.5'>Therapy Milestones</h6>
      <ul className='flex flex-col gap-8 2xl:gap-10 overflow-y-auto max-h-56'>
        <li className='flex items-center gap-3 relative before:absolute before:left-2.5 before:mt-0.5 before:w-0.5 before:h-7 2xl:before:h-9 before:bg-bluedark before:top-full'>
          <Icon name='tickcircle' className='icon-wrapper w-6 h-6 text-bluedark' />
          <span className='text-base font-bold leading-22px text-bluedark'>
            Lorem ipsum pretium leo
          </span>
        </li>
        <li className='flex items-center gap-3 relative before:absolute before:left-2.5 before:mt-0.5 before:w-0.5 before:h-7 2xl:before:h-9 before:bg-bluedark before:top-full'>
          <Icon name='tickcircle' className='icon-wrapper w-6 h-6 text-bluedark' />
          <span className='text-base font-bold leading-22px text-bluedark'>
            Lorem ipsum pretium leo
          </span>
        </li>
        <li className='flex items-center gap-3 relative before:absolute before:left-2.5 before:mt-0.5 before:w-0.5 before:h-7 2xl:before:h-9 before:bg-surface before:top-full'>
          <Icon name='tickcircleblank' className='icon-wrapper w-6 h-6 text-blackdark/30' />
          <span className='text-base font-normal leading-22px text-primarygray'>
            Lorem ipsum pretium leo
          </span>
        </li>
        <li className='flex items-center gap-3 relative'>
          <Icon name='tickcircleblank' className='icon-wrapper w-6 h-6 text-blackdark/30' />
          <span className='text-base font-normal leading-22px text-primarygray'>
            Lorem ipsum pretium leo
          </span>
        </li>
      </ul>
    </div>
  );
};

export default TherapyMilestone;
