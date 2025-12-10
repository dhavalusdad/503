import React, { memo } from 'react';

import Button from '@/stories/Common/Button';
import TabNavigation from '@/stories/Common/Calender/Component/TabNavigation';
import {
  type CalendarTopBarProps,
  MODE_CONSTANT,
  MONTH_DAY_WEEK_TOGGLE,
} from '@/stories/Common/Calender/types';
import Icon from '@/stories/Common/Icon';
import Select from '@/stories/Common/Select';

export const CalendarTopBarComponent: React.FC<CalendarTopBarProps> = ({
  view,
  activeMonth,
  start,
  end,
  onTodayClick,
  onPrevClick,
  onNextClick,
  onTabChange,
  setTimeInterval,
  timeInterval,
  slotRange,
  children,
}) => {
  const renderTitle = () => {
    if (view === MODE_CONSTANT.MONTH) {
      return `${activeMonth.month} ${activeMonth.year}`;
    }

    if (view === MODE_CONSTANT.DAY && start) {
      return `${start.month} ${start.dateNum}, ${start.year}`;
    }

    if (view === MODE_CONSTANT.WEEK && start && end) {
      return `${start.month} ${start.dateNum}${
        start.year !== end.year ? ` ${start.year}` : ''
      } - ${end.month !== start.month ? `${end.month} ` : ''}${end.dateNum}, ${end.year}`;
    }

    return '';
  };

  return (
    <div className='w-full relative flex items-center justify-between flex-col lg:flex-row p-5 gap-3'>
      {/* Today & Chevron */}
      <div className=' flex items-center gap-6'>
        <Button
          variant='filled'
          className='rounded-lg py-2 !font-semibold min-h-10'
          title='Today'
          onClick={onTodayClick}
        />
        <div className='flex items-center gap-2.5'>
          <Button
            onClick={onPrevClick}
            variant='none'
            icon={<Icon name='chevronLeft' className='' />}
            className='border border-solid border-surface p-0 w-10 h-10 rounded-lg text-primarygray'
          />
          <Button
            onClick={onNextClick}
            variant='none'
            icon={<Icon name='chevronRight' className='' />}
            className='border border-solid border-surface p-0 h-10 w-10 rounded-lg bg-blackdark text-white'
          />
        </div>
      </div>

      {/* Calendar Info */}
      <div className=' flex justify-center'>
        <p className='text-xl font-semibold text-blackdark '>{renderTitle()}</p>
      </div>

      {/* View Mode Tabs */}
      <div className={`flex items-center flex-wrap justify-center gap-3`}>
        {view !== MODE_CONSTANT.MONTH && (
          <Select
            key={'slot-interval-config'}
            options={slotRange.map(d => ({
              value: d,
              label: `${d} min`,
            }))}
            onChange={selected =>
              setTimeInterval((selected as { value: number; label: string })?.value || 15)
            }
            placeholder={`Select Slot Interval`}
            labelClassName='!text-base'
            className='sm:text-base text-sm z-[100]'
            StylesConfig={{
              control: () => ({
                minHeight: '46px',
                // fontSize: '14px',
              }),
              option: () => ({
                fontSize: '16px',
                zIndex: 100,
              }),
            }}
            value={{ value: timeInterval, label: `${timeInterval} min` }}
          />
        )}

        <TabNavigation tabs={MONTH_DAY_WEEK_TOGGLE} activeTab={view} onTabChange={onTabChange} />
        {children}
      </div>
    </div>
  );
};

export const CalendarTopBar = memo(CalendarTopBarComponent, (prevProps, nextProps) => {
  const prevView = prevProps.view;
  const nextView = nextProps.view;

  // Check view change
  if (prevView !== nextView) return false;

  // Check activeMonth for MONTH view
  if (prevView === MODE_CONSTANT.MONTH) {
    return (
      prevProps.activeMonth?.month === nextProps.activeMonth?.month &&
      prevProps.activeMonth?.year === nextProps.activeMonth?.year
    );
  }

  // Check start for DAY view
  if (prevView === MODE_CONSTANT.DAY) {
    return (
      prevProps.start?.month === nextProps.start?.month &&
      prevProps.start?.dateNum === nextProps.start?.dateNum &&
      prevProps.start?.year === nextProps.start?.year
    );
  }

  // Check start and end for WEEK view
  if (prevView === MODE_CONSTANT.WEEK) {
    return (
      prevProps.start?.month === nextProps.start?.month &&
      prevProps.start?.dateNum === nextProps.start?.dateNum &&
      prevProps.start?.year === nextProps.start?.year &&
      prevProps.end?.month === nextProps.end?.month &&
      prevProps.end?.dateNum === nextProps.end?.dateNum &&
      prevProps.end?.year === nextProps.end?.year
    );
  }

  return false;
});
