import React, { useMemo } from 'react';

import moment from 'moment-timezone';

import { isSameDay } from '@/stories/Common/Calender/commonFunction';
import TimeSlotCell from '@/stories/Common/Calender/Component/TimeSlotCell';
import type { DayColumnInterface } from '@/stories/Common/Calender/types';

const DayColumn = React.memo(
  ({
    data,
    dayIndex,
    timeLine,
    selection,
    view,
    timeZone,
    onAppointmentClick,
    onAvailableSlotClick,
    onConfirmSelection,
    slotSize,
    timeInterval,
    setRemoveSlots,
    findAvailableSlotForTimeSlot,
    findAppointmentForSlot,
    isSlotAvailable,
    handleSelectionCleaner,
    handleRemoveSelectedSlot,
    removeSlot,
  }: DayColumnInterface) => {
    // Pre-calculate current time once for all slots
    const currentMoment = useMemo(() => moment.tz(timeZone).format('YYYY-MM-DD HH:mm'), [timeZone]);

    // Pre-calculate all slot data to avoid recalculation on every render
    const slotsData = useMemo(() => {
      return timeLine.map(time => {
        const slotMoment = moment.tz(
          `${data.date} ${time.timeString}`,
          'YYYY-MM-DD HH:mm',
          timeZone
        );

        const isPast = slotMoment.isBefore(moment.tz(currentMoment, 'YYYY-MM-DD HH:mm', timeZone));

        const isMarkedAvailableSlot = isSlotAvailable(data.date, slotMoment);
        const availableSlotData = findAvailableSlotForTimeSlot(data.date, slotMoment);
        if (!availableSlotData)
          return {
            time,
            isPast,
            availableSlotData: availableSlotData || {},
          };
        const appointmentStartTime = findAppointmentForSlot(availableSlotData?.id || '');
        let futureConflict = null;
        let pastConflict = null;

        if (isMarkedAvailableSlot) {
          const futureSlotEndTime = slotMoment.clone().add(60, 'minutes');
          const futureAvailable = findAvailableSlotForTimeSlot(data.date, futureSlotEndTime);

          if (futureAvailable) {
            futureConflict = futureAvailable;
          }

          const checkPreviousSlotAppointmentExistOrNot = slotMoment.clone().subtract(59, 'minutes');
          const pastSlot = findAvailableSlotForTimeSlot(
            data.date,
            checkPreviousSlotAppointmentExistOrNot
          );
          const pastAppointment = findAppointmentForSlot(pastSlot?.id || '');
          if (pastAppointment) {
            pastConflict = pastAppointment;
          }
        }

        const availableSlotTime = isMarkedAvailableSlot ? availableSlotData?.start_time : undefined;

        let result = 0;
        let isValidDateSync = false;

        if (appointmentStartTime?.slot.start_time) {
          const appointmentDate = moment.tz(availableSlotData.start_time, timeZone);
          isValidDateSync = isSameDay(appointmentDate, data.date, timeZone);

          if (isValidDateSync) {
            const start = moment.tz(availableSlotData.start_time, timeZone);
            const end = moment.tz(availableSlotData.end_time, timeZone);

            const diffInMinutes = end.diff(start, 'minutes');
            result = diffInMinutes / timeInterval;
          }
        }

        return {
          time,
          isPast,
          futureConflict,
          pastConflict,
          availableSlotTime,
          appointmentStartTime,
          isValidDateSync,
          result,
          isMarkedAvailableSlot: !appointmentStartTime && isMarkedAvailableSlot,
          availableSlotData: availableSlotData || {},
        };
      });
    }, [
      timeLine,
      data.date,
      timeZone,
      currentMoment,
      isSlotAvailable,
      findAvailableSlotForTimeSlot,
      findAppointmentForSlot,
      timeInterval,
    ]);

    // Calculate selection state separately to avoid recalculating slot data
    const selectionState = useMemo(() => {
      if (
        !selection.dayIndex.includes(dayIndex) ||
        selection.startIndex === null ||
        selection.endIndex === null
      ) {
        return new Set();
      }

      const selectedIndices = new Set<number>();
      const minIndex = Math.min(selection.startIndex, selection.endIndex);
      const maxIndex = Math.max(selection.startIndex, selection.endIndex);

      for (let i = minIndex; i <= maxIndex; i++) {
        selectedIndices.add(i);
      }

      return selectedIndices;
    }, [selection.dayIndex, selection.startIndex, selection.endIndex, dayIndex]);

    return (
      <>
        {slotsData.map((slotData, slotIndex) => {
          const isSelected = selectionState.has(slotIndex);
          return (
            <TimeSlotCell
              totalTimeSlots={timeLine.length}
              removeSlot={removeSlot}
              key={`${slotIndex}-${dayIndex}`}
              slotIndex={slotIndex}
              dayIndex={dayIndex}
              time={slotData.time}
              data={data}
              isPast={slotData.isPast}
              futureConflict={!!slotData.futureConflict?.id}
              pastConflict={!!slotData.pastConflict?.id}
              handleRemoveSelectedSlots={handleRemoveSelectedSlot}
              handleSelectionCleaner={handleSelectionCleaner}
              availableSlotTime={slotData.availableSlotTime}
              appointmentStartTime={slotData.appointmentStartTime}
              isValidDateSync={!!slotData.isValidDateSync}
              result={slotData.result || 0}
              isSelected={isSelected}
              isMarkedAvailableSlot={slotData.isMarkedAvailableSlot}
              selection={selection}
              view={view}
              setRemoveSlots={setRemoveSlots}
              timeLine={timeLine}
              onAppointmentClick={onAppointmentClick}
              onAvailableSlotClick={onAvailableSlotClick}
              onConfirmSelection={onConfirmSelection}
              slotSize={slotSize}
              timeInterval={timeInterval}
              timeZone={timeZone}
              availableSlotData={slotData.availableSlotData}
              // isDisabledSelection={slotData.isDisabledSelection}
              // isDisabledSelectionBasedOnPreviousSlot={
              //   slotData.isDisabledSelectionBasedOnPreviousSlot
              // }
            />
          );
        })}
      </>
    );
  }
);

export default DayColumn;
