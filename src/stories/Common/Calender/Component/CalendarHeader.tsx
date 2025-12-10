import React, { memo } from 'react';

import clsx from 'clsx';
import moment from 'moment-timezone';

import { isSameDay } from '@/stories/Common/Calender/commonFunction';
import { type CalendarHeaderProps, MODE_CONSTANT } from '@/stories/Common/Calender/types';

const CalendarHeaderComponent: React.FC<CalendarHeaderProps & { timeZone?: string }> = ({
  view,
  weekday,
  timeZone = moment.tz.guess(),
}) => {
  return (
    <div className={`bg-white shadow-calenderheader  flex border-t border-solid border-surface`}>
      {view !== MODE_CONSTANT.MONTH && (
        <div className=' w-100px border-r border-solid border-surface' />
      )}
      <div
        className={clsx(
          'grid',
          view !== MODE_CONSTANT.MONTH ? 'w-[calc(100%-100px)]' : 'w-full',
          view === MODE_CONSTANT.DAY ? 'grid-cols-1' : 'grid-cols-7'
        )}
      >
        {weekday.map((data, index) => (
          <div
            key={index}
            className={`flex items-center justify-center   border-b border-solid border-black text-center py-2 border-surface border-r last:border-r-0 text-base font-medium text-blackdark  ${view !== MODE_CONSTANT.MONTH && isSameDay(data.date, moment.tz(timeZone), timeZone) ? 'bg-surface' : ''}
              }`}
          >
            {data.day}
            {view !== MODE_CONSTANT.MONTH && isSameDay(data.date, moment.tz(timeZone), timeZone) ? (
              <label className='ml-1.5 text-sm font-bold text-white flex items-center justify-center w-7 h-7 bg-primary rounded-full'>
                {' '}
                {data.date.split('-').slice(-1)[0]}
              </label>
            ) : (
              <span className='font-bold ml-1.5'>
                {' '}
                {view !== MODE_CONSTANT.MONTH ? data.date.split('-').slice(-1)[0] : ''}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CalendarHeader = memo(CalendarHeaderComponent, (prevProps, nextProps) => {
  return (
    prevProps.view === nextProps.view &&
    prevProps.weekday.length === nextProps.weekday.length &&
    prevProps.weekday.every((day, index) => day.date === nextProps.weekday[index].date)
  );
});
CalendarHeader.displayName = 'CalendarHeader';
