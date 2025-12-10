import React, { memo, useMemo, useCallback } from 'react';

import moment from 'moment-timezone';

import type { AvailableSlotCardProps, SelectionState } from '@/stories/Common/Calender/types.tsx';
import Tooltip from '@/stories/Common/Tooltip/Tooltip';

const AvailableSlotCardComponent: React.FC<AvailableSlotCardProps> = memo(
  ({
    slotIndex,
    slotTime,
    onSlotClick,
    timeZone = moment.tz.guess(),
    timeInterval,
    slotSize,
    currentSlotTime,
    isDayView = false,
    customStyle = {},
    setRemoveSlots,
    className = '',
    removeSlot,
    availableSlotData,
    dayIndex,

    handleRemoveSelectedSlot,
    futureConflict,
    pastConflict,
  }) => {
    // ---- Time / layout calculations ----
    const timeData = useMemo(() => {
      if (!availableSlotData?.start_time || !availableSlotData?.end_time) {
        return {
          topOffset: 0,
          height: slotSize,
          displayTime: '',
          slotTimeMoment: moment.tz(slotTime, timeZone),
        };
      }

      const slotStart = moment.tz(availableSlotData.start_time, timeZone);
      const slotEnd = moment.tz(availableSlotData.end_time, timeZone);
      const currentSlotDate = moment.tz(slotTime, timeZone).format('YYYY-MM-DD');
      const currentSlotStart = moment.tz(`${currentSlotDate} ${currentSlotTime}`, timeZone);

      const duration = slotEnd.diff(slotStart, 'minutes');
      const minutesFromSlotStart = slotStart.diff(currentSlotStart, 'minutes');

      const pixelsPerMinute = slotSize / timeInterval;
      const topOffset = Math.max(0, minutesFromSlotStart * pixelsPerMinute);
      const height = Math.max(slotSize, duration * pixelsPerMinute);

      const displayTime = `${slotStart.format('hh:mm A')} - ${slotEnd.format('hh:mm A')}`;

      return {
        topOffset,
        height,
        displayTime,
        slotTimeMoment: moment.tz(slotTime, timeZone),
      };
    }, [slotTime, timeZone, currentSlotTime, timeInterval, slotSize, availableSlotData]);

    // ---- Is this slot inside the current remove selection? ----
    const selectionState = useMemo(() => {
      if (
        !removeSlot.startDateTime ||
        !removeSlot.endDateTime ||
        removeSlot.startIndex === null ||
        removeSlot.endIndex === null
      ) {
        return {
          isInSelection: false,
          isStartSlot: false,
          isEndSlot: false,
        };
      }

      const startMoment = moment.tz(removeSlot.startDateTime, timeZone);
      const endMoment = moment.tz(removeSlot.endDateTime, timeZone);

      const isInSelection =
        removeSlot.dayIndex[0] <= dayIndex &&
        removeSlot.startIndex <= slotIndex &&
        removeSlot.endIndex >= slotIndex &&
        timeData.slotTimeMoment.isSameOrAfter(startMoment) &&
        timeData.slotTimeMoment.isSameOrBefore(endMoment);

      const isStartSlot =
        removeSlot.startIndex === slotIndex && removeSlot.dayIndex[0] === dayIndex;

      const isEndSlot =
        removeSlot.endIndex === slotIndex &&
        removeSlot.dayIndex[removeSlot.dayIndex.length - 1] === dayIndex;

      return {
        isInSelection,
        isStartSlot,
        isEndSlot,
      };
    }, [removeSlot, dayIndex, slotIndex, timeData.slotTimeMoment, timeZone]);

    // ---- Styles ----
    const containerStyle: React.CSSProperties = useMemo(
      () => ({
        height: `${timeData.height}px`,
        top: `${timeData.topOffset}px`,
        ...customStyle,
      }),
      [timeData.height, timeData.topOffset, customStyle]
    );

    const containerClass = useMemo(() => {
      const classes = [
        'user-select:none bg-white',
        !futureConflict && timeData.topOffset > 1
          ? 'border-b'
          : timeData.topOffset === 0 && 'border-b',
        'border-primarylight',
        'text-sm cursor-pointer',
        'absolute w-full z-5',
        'transition-colors',
        'flex flex-col justify-center',
        isDayView && 'flex-wrap gap-1',
        className,
        timeData.topOffset > 1 && !pastConflict && 'border-t border-primarylight',
      ];

      return classes.filter(Boolean).join(' ');
    }, [futureConflict, pastConflict, timeData.topOffset, isDayView, className]);

    // ---- Mouse handlers ----

    /**
     * Behaviour:
     * - If this slot is already in the red selection → confirm removal of ALL selected slots.
     * - Otherwise → start a new selection with ONLY this slot (single-slot remove mode).
     */
    const handleMouseDown = useCallback(() => {
      // Click on an already selected (red) slot → confirm remove all selected
      if (selectionState.isInSelection) {
        handleRemoveSelectedSlot();
        return;
      }

      // Start new selection from this slot (for single or drag multi)
      setRemoveSlots({
        isSelecting: true,
        dayIndex: [dayIndex],
        startIndex: slotIndex,
        endIndex: slotIndex,
        startDateTime: slotTime,
        endDateTime: slotTime,
      });
    }, [
      selectionState.isInSelection,
      setRemoveSlots,
      dayIndex,
      slotIndex,
      slotTime,
      handleRemoveSelectedSlot,
    ]);

    /**
     * While dragging with mouse button pressed:
     * extend the current removal selection across multiple slots.
     */
    const handleMouseOver = useCallback(
      (e: React.MouseEvent) => {
        if (!removeSlot.isSelecting || e.buttons !== 1) return;

        setRemoveSlots((prev: SelectionState) => {
          const startDay = prev.dayIndex[0] ?? dayIndex;
          const newDayList = Array.from(new Set([...prev.dayIndex, dayIndex])).filter(
            (d: number) => d >= startDay && d <= dayIndex
          );

          return {
            ...prev,
            dayIndex: newDayList,
            endIndex: slotIndex,
            endDateTime: slotTime,
          };
        });
      },
      [removeSlot.isSelecting, setRemoveSlots, dayIndex, slotIndex, slotTime]
    );

    /**
     * Mouse up just finalizes the dragged selection range.
     * It does NOT remove – removal is only on click/mousedown of any selected slot.
     */
    const handleMouseUp = useCallback(() => {
      if (!removeSlot.isSelecting) return;
      setRemoveSlots((prev: SelectionState) => ({
        ...prev,
        isSelecting: false,
        endIndex: slotIndex,
        endDateTime: slotTime,
      }));
    }, [removeSlot.isSelecting, setRemoveSlots, slotIndex, slotTime]);

    /**
     * Click is optional now. We can leave it no-op or keep your old onSlotClick
     * for *other* behaviors. It does NOT remove slots.
     */
    const handleClick = useCallback(() => {
      if (onSlotClick) {
        onSlotClick(slotTime as string);
      }
    }, [onSlotClick, slotTime]);

    return (
      <Tooltip
        placement='top'
        label={timeData.displayTime}
        className='text-white text-sm px-3 py-1 rounded-lg shadow-lg bg-gray-800'
      >
        <div
          id={`${availableSlotData?.id}-${availableSlotData?.status}`}
          draggable={false}
          style={containerStyle}
          className={containerClass}
          onMouseDown={handleMouseDown}
          onMouseOver={handleMouseOver}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
        >
          {selectionState.isInSelection && (
            <div
              draggable={false}
              className='w-full h-full bg-[#B71C1C]/95 flex items-center justify-center relative p-2'
            >
              {selectionState.isStartSlot && (
                <span draggable={false} className='text-[15px]  font-bold text-white select-none'>
                  Mark it as unavailable?
                </span>
              )}
            </div>
          )}
        </div>
      </Tooltip>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    return (
      prevProps.slotIndex === nextProps.slotIndex &&
      prevProps.dayIndex === nextProps.dayIndex &&
      prevProps.slotTime === nextProps.slotTime &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.futureConflict === nextProps.futureConflict &&
      prevProps.pastConflict === nextProps.pastConflict &&
      prevProps.timeZone === nextProps.timeZone &&
      prevProps.timeInterval === nextProps.timeInterval &&
      prevProps.slotSize === nextProps.slotSize &&
      prevProps.currentSlotTime === nextProps.currentSlotTime &&
      prevProps.isDayView === nextProps.isDayView &&
      prevProps.className === nextProps.className &&
      prevProps.availableSlotData?.id === nextProps.availableSlotData?.id &&
      prevProps.availableSlotData?.start_time === nextProps.availableSlotData?.start_time &&
      prevProps.availableSlotData?.end_time === nextProps.availableSlotData?.end_time &&
      prevProps.availableSlotData?.status === nextProps.availableSlotData?.status &&
      prevProps.removeSlot.isSelecting === nextProps.removeSlot.isSelecting &&
      prevProps.removeSlot.startIndex === nextProps.removeSlot.startIndex &&
      prevProps.removeSlot.endIndex === nextProps.removeSlot.endIndex &&
      prevProps.removeSlot.startDateTime === nextProps.removeSlot.startDateTime &&
      prevProps.removeSlot.endDateTime === nextProps.removeSlot.endDateTime &&
      JSON.stringify(prevProps.removeSlot.dayIndex) ===
        JSON.stringify(nextProps.removeSlot.dayIndex)
    );
  }
);

AvailableSlotCardComponent.displayName = 'AvailableSlotCard';
export const AvailableSlotCard = AvailableSlotCardComponent;
