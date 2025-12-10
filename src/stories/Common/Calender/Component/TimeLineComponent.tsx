import React from 'react';

import type { TimeSlot } from '@/stories/Common/Calender/types';

const getTimeLabel = (time: TimeSlot, displayHourOnly: boolean) => {
  if (displayHourOnly) {
    const minutes = time.label.split(':')[1];
    return minutes.slice(0, 2) === '00' ? time.label : '';
  }

  return time.label;
};

export const TimeLineComponent = React.memo<{
  timeLine: TimeSlot[];
  slotSize: number;
  displayHourOnly: boolean;
}>(({ timeLine, slotSize, displayHourOnly }) => {
  return (
    <div
      draggable={false}
      className='border-r border-surface text-sm font-bold text-primarygray w-100px'
    >
      {timeLine.map((time: TimeSlot, i: number) => (
        <TimeLineItem
          key={time.timeString || i} // Better key using unique identifier
          time={time}
          index={i}
          slotSize={slotSize}
          displayHourOnly={displayHourOnly}
        />
      ))}
    </div>
  );
});

// Separate memoized component for individual time line items
const TimeLineItem = React.memo<{
  time: TimeSlot;
  index: number;
  slotSize: number;
  displayHourOnly: boolean;
}>(({ time, slotSize, displayHourOnly }) => {
  return (
    <div
      style={{ height: slotSize }}
      className=' border-b border-surface px-2 flex justify-center items-center'
    >
      {getTimeLabel(time, displayHourOnly)}
    </div>
  );
});
