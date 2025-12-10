import React, { useCallback, useMemo } from 'react';

import moment from 'moment-timezone';

import type { SelectSlotRangTimeInfoInterface } from '@/stories/Common/Calender/types';

export const SelectSlotRangTimeInfo = React.memo(
  ({
    timeLine,
    selection,
    slotIndex,
    timeZone = moment.tz.guess(),
  }: SelectSlotRangTimeInfoInterface & { timeZone?: string }) => {
    const selectedAreaInfo = useMemo(() => {
      const startIdx = Math.min(slotIndex, selection?.endIndex ?? slotIndex);
      const endIdx = Math.max(slotIndex, selection?.endIndex ?? slotIndex);

      const startTime = timeLine[startIdx]?.timeString;
      const endTime = timeLine[endIdx + 1]?.timeString || null;

      const startDateTime = moment.tz(
        `${moment.tz(timeZone).format('YYYY-MM-DD')} ${startTime}`,
        timeZone
      );
      const endDateTime = moment.tz(
        `${moment.tz(timeZone).format('YYYY-MM-DD')} ${endTime}`,
        timeZone
      );

      return `${startDateTime.format('hh:mm A')} - ${!endTime ? '11:59 PM' : endDateTime.format('hh:mm A')}`;
    }, [timeLine, selection?.endIndex, slotIndex, timeZone]);

    // Memoize event handlers to prevent recreation on every render
    const stopPropagation = useCallback((e: React.MouseEvent | React.SyntheticEvent) => {
      e.stopPropagation();
    }, []);
    const diffIndex = moment
      .tz(
        `${moment.tz(timeZone).format('YYYY-MM-DD')} ${timeLine[selection?.endIndex ?? slotIndex]?.timeString}`,
        timeZone
      )
      .diff(
        moment.tz(
          `${moment.tz(timeZone).format('YYYY-MM-DD')} ${timeLine[selection?.startIndex ?? slotIndex]?.timeString}`,
          timeZone
        ),
        'minutes'
      );

    return (
      <div
        draggable={false}
        onMouseDown={stopPropagation}
        onMouseUp={stopPropagation}
        onClick={stopPropagation}
        className={`z-10 flex flex-col !w-full gap-1 text-primary text-sm leading-3.5 font-bold select-none ${selection?.endIndex < selection?.startIndex ? 'top-[-5px] relative' : 'top-[-2px] relative'} ${
          Math.abs(diffIndex) > 60 || selection.dayIndex.length > 1
            ? 'justify-center text-center'
            : ''
        }`}
      >
        <div
          className={`flex flex-col ${selection?.endIndex < selection?.startIndex ? 'flex-col-reverse' : 'gap-1'}`}
        >
          <span
            className={`${Math.abs(diffIndex) < 60 && selection.dayIndex.length == 1 ? 'text-10px leading-3 ' : 'text-[12px] leading-3 '}`}
          >
            Mark it as available?
          </span>
          <span
            className={
              Math.abs(diffIndex) < 60 && selection.dayIndex.length == 1
                ? 'text-10px leading-3 '
                : 'text-[12px] leading-3 '
            }
          >
            {selectedAreaInfo}
          </span>
        </div>
      </div>
    );
  }
);

SelectSlotRangTimeInfo.displayName = 'SelectSlotRangTimeInfo';
