import { useEffect, useState } from 'react';

import clsx from 'clsx';

import CustomRatingSlider from '@/features/dashboard/components/RatingSlider';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

export const WellnessHub = ({
  handleLabelChange,
  handleGratitudeChange,
  initialData,
}: {
  handleLabelChange?: (label: string) => void;
  handleGratitudeChange?: (gratitude: string[]) => void;
  initialData?: { id: string; daily_mood: string; daily_gratitude: string[] };
}) => {
  const gratitudeList = [
    { label: 'Feeling overwhelmed', lightColor: 'bg-purple-500', darkColor: 'bg-purple-600' },
    { label: 'Anxious but coping', lightColor: 'bg-blue-500', darkColor: 'bg-blue-600' },
    { label: 'Productive today', lightColor: 'bg-green-500', darkColor: 'bg-green-600' },
  ];
  const [selectedGratitude, setSelectedGratitude] = useState<string[]>([]);

  const toggleGratitude = (item: string) => {
    setSelectedGratitude(prev => {
      const updated = prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item];
      return updated;
    });
  };

  useEffect(() => {
    if (handleGratitudeChange) {
      handleGratitudeChange(selectedGratitude);
    }
  }, [selectedGratitude, handleGratitudeChange]);

  return (
    <div className='flex flex-col lg:flex-row gap-5'>
      {/* Daily Mood Check-In */}
      {initialData && initialData?.daily_mood ? (
        <div className='lg:w-2/4 w-full bg-green-100 px-3.5 py-5 rounded-10px relative flex flex-col items-center justify-center gap-2.5'>
          {/* Icon at top center */}
          <Icon name='success' />
          {/* Title: Centered */}
          <h6 className='font-bold text-xl leading-6 text-blackdark text-center'>
            Check-in Complete!
          </h6>

          {/* Paragraph: Centered */}
          <p className='font-normal text-lg leading-22px text-blackdark text-center'>
            That's great to hear! You're doing well today!
          </p>

          <span className='font-normal text-base leading-5 text-blackdark/70 text-center'>
            Your mood check-in has been recorded. We appreciate your commitment to mental wellness.
          </span>
        </div>
      ) : (
        <div className='lg:w-2/4 w-full bg-purplelight px-3.5 py-5 rounded-10px relative'>
          <div className='absolute left-0 top-0'>
            <Icon name='lineardailymood' />
          </div>
          <div className='flex items-center gap-1.5 mb-5'>
            <Icon name='happyemoji' />
            <h6 className='text-base font-bold leading-22px text-blackdark'>Daily Mood Check-In</h6>
          </div>
          <div className='flex flex-col gap-6'>
            <p className='text-base font-normal leading-22px text-blackdark'>
              How are you feeling today?
            </p>
            <CustomRatingSlider onLabelChange={handleLabelChange} />
          </div>
        </div>
      )}
      <div className='lg:w-2/4 w-full bg-Greenlight px-3.5 py-5 rounded-10px'>
        <div className='flex items-center gap-1.5 mb-5'>
          <Icon name='leaf' />
          <h6 className='text-base font-bold leading-22px text-blackdark'>Daily Gratitude</h6>
        </div>
        <div className='flex flex-col gap-3.5'>
          <h6 className='text-base font-bold leading-22px text-primary'>
            What are you grateful for today?
          </h6>
          <div className='flex items-center flex-wrap gap-2.5'>
            {initialData?.daily_gratitude?.length ? (
              <>
                {initialData?.daily_gratitude?.map(initialGratitude => (
                  <Button
                    key={initialGratitude}
                    title={initialGratitude}
                    variant='none'
                    className={clsx(
                      'text-white rounded-md select-none',
                      gratitudeList.find(gratitude => gratitude.label === initialGratitude)
                        ?.darkColor || ''
                    )}
                    isDisabled={(initialData?.daily_gratitude?.length ?? 0) > 0}
                  >
                    <Icon name='tickcircle' className='icon-wrapper w-4 h-4' />
                  </Button>
                ))}
                <p className='w-full font-medium text-base text-black-700'>
                  Your Daily Gratitude has been submitted!
                </p>
              </>
            ) : (
              gratitudeList.map(gratitude => (
                <Button
                  key={gratitude.label}
                  title={gratitude.label}
                  onClick={() => toggleGratitude(gratitude.label)}
                  variant='none'
                  className={clsx(
                    'flex text-white items-center gap-1.5 rounded-md cursor-pointer select-none transition !p-2.5 2xl:!p-3.5 !text-sm 2xl:!text-base !leading-18px 2xl:!leading-5',
                    gratitude.lightColor,
                    selectedGratitude.includes(gratitude.label) && gratitude.darkColor
                  )}
                  isDisabled={(initialData?.daily_gratitude?.length ?? 0) > 0}
                >
                  {selectedGratitude.includes(gratitude.label) && (
                    <Icon name='tickcircle' className='icon-wrapper w-4 h-4' />
                  )}
                  {initialData?.daily_gratitude?.includes(gratitude.label) && (
                    <Icon name='tickcircle' className='icon-wrapper w-4 h-4' />
                  )}
                </Button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessHub;
