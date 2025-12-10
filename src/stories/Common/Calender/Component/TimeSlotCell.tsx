import React, { useMemo } from 'react';

import moment from 'moment-timezone';

import { AppointmentCard } from '@/stories/Common/Calender/Component/AppointmentCard';
import { AvailableSlotCard } from '@/stories/Common/Calender/Component/AvailableSlotCard';
import { MODE_CONSTANT, type TimeSlotCellInterface } from '@/stories/Common/Calender/types';

const TimeSlotCell = React.memo(
  ({
    slotIndex,
    dayIndex,
    time,
    data,
    appointmentStartTime,
    isValidDateSync,
    result,
    isSelected,
    isMarkedAvailableSlot,
    availableSlotTime,
    view,
    timeLine,
    onAppointmentClick,
    onAvailableSlotClick,
    onConfirmSelection,
    slotSize,
    timeInterval,
    setRemoveSlots,
    isPast,
    removeSlot,
    handleSelectionCleaner,
    handleRemoveSelectedSlots,
    timeZone,
    availableSlotData,
    isDisabledSelection,
    futureConflict,
    pastConflict,
  }: TimeSlotCellInterface) => {
    const hasAppointment = appointmentStartTime && isValidDateSync;
    const markedAvailable = !!isMarkedAvailableSlot;

    // Pre-calculate slot time moments once
    const slotTimes = useMemo(() => {
      const slotStart = moment.tz(`${data.date} ${time.timeString}`, 'YYYY-MM-DD HH:mm', timeZone);
      const slotEnd = slotStart.clone().add(timeInterval, 'minutes');
      return { slotStart, slotEnd };
    }, [data.date, time.timeString, timeInterval, timeZone]);

    // Check if this is the slot where the appointment should be rendered
    const shouldRenderAppointment = useMemo(() => {
      if (!hasAppointment || !appointmentStartTime) return false;

      const appointmentStart = moment.tz(availableSlotData.start_time, timeZone);

      return (
        appointmentStart.isSameOrAfter(slotTimes.slotStart) &&
        appointmentStart.isBefore(slotTimes.slotEnd)
      );
    }, [hasAppointment, appointmentStartTime, slotTimes, timeZone]);

    // Check if this is the slot where the available slot should be rendered
    const shouldRenderAvailableSlot = useMemo(() => {
      if (!isMarkedAvailableSlot || !availableSlotTime) {
        return false;
      }

      const availableSlotMoment = moment.tz(availableSlotTime, timeZone);

      return (
        availableSlotMoment.isSameOrAfter(slotTimes.slotStart) &&
        availableSlotMoment.isBefore(slotTimes.slotEnd)
      );
    }, [isMarkedAvailableSlot, availableSlotTime, slotTimes, timeZone]);

    // Pre-calculate styling classes
    const styleClasses = useMemo(() => {
      const timeMinutes = time.timeString.split(':')[1];
      const isHourMark = timeMinutes === '00';
      const borderClass = isHourMark
        ? '!border-primarylight'
        : '!border-primarylight/50 !border-r-primarylight';

      let bgClass;
      if (isPast) {
        bgClass = ' bg-black/8.5 border-t border-r border-solid !cursor-not-allowed';
      } else if (shouldRenderAvailableSlot && availableSlotTime) {
        bgClass = 'border-t border-r border-solid bg-yellowdarklight';
      } else {
        bgClass = 'bg-yellowdarklight border-t border-r border-solid';
      }

      return `cursor-pointer relative slot-cell ${bgClass} ${borderClass}`;
    }, [isPast, shouldRenderAvailableSlot, availableSlotTime, time.timeString]);

    const shouldDisableSlot = isPast || hasAppointment || isDisabledSelection;

    const isDayView = view === MODE_CONSTANT.DAY || view === MODE_CONSTANT.WEEK;

    return (
      <div
        key={`${dayIndex}-${slotIndex}-${appointmentStartTime?.id ?? ''}-${availableSlotData?.id}-${slotSize}-${futureConflict}-${pastConflict}-${availableSlotData?.id}-${availableSlotData?.status}-${appointmentStartTime?.slot.start_time}-${appointmentStartTime?.slot.end_time}-${appointmentStartTime?.slot.id ?? ''}-${timeInterval}-${slotSize} `}
        id={`${dayIndex}-${slotIndex}`}
        data-day-index={dayIndex}
        data-slot-index={slotIndex}
        data-has-appointment={shouldDisableSlot}
        data-is-marked-available-slot={markedAvailable}
        draggable={false}
        style={{ height: slotSize }}
        className={styleClasses}
      >
        <div
          className='selection-buttons w-full h-full absolute inset-0 '
          onClick={onConfirmSelection}
        />
        {/* Render appointment card if needed */}
        {hasAppointment && shouldRenderAppointment && appointmentStartTime && (
          <AppointmentCard
            dayIndex={dayIndex}
            isPast={isPast}
            slotIndex={slotIndex}
            onClick={onAppointmentClick}
            availableSlotData={availableSlotData}
            index={dayIndex}
            appointment={appointmentStartTime}
            resultHeight={result}
            isAbsolute={true}
            isDayView={isDayView}
            timeZone={timeZone}
            timeInterval={timeInterval}
            slotSize={slotSize}
            currentSlotTime={time.timeString}
            totalTimeSlots={timeLine.length}
          />
        )}

        {/* Render available slot card if needed */}
        {isMarkedAvailableSlot &&
          !hasAppointment &&
          !isPast &&
          shouldRenderAvailableSlot &&
          availableSlotTime && (
            <AvailableSlotCard
              isSelected={isSelected}
              dayIndex={dayIndex}
              removeSlot={removeSlot}
              slotIndex={slotIndex}
              futureConflict={futureConflict}
              pastConflict={pastConflict}
              availableSlotData={availableSlotData}
              setRemoveSlots={setRemoveSlots}
              slotTime={availableSlotTime}
              onSlotClick={onAvailableSlotClick}
              timeZone={timeZone}
              handleRemoveSelectedSlot={handleRemoveSelectedSlots}
              handleSelectionCleaner={handleSelectionCleaner}
              timeInterval={timeInterval}
              slotSize={slotSize}
              currentSlotTime={time.timeString}
              isDayView={isDayView}
              isDisabledSelection={isDisabledSelection}
            />
          )}

        {/* Selection buttons for DOM manipulation */}
        {/* <div className='selection-buttons'>
          <AvailableSlotBookingButton
            handleConfirmSelection={onConfirmSelection}
            handleSelectionCleaner={handleSelectionCleaner}
          />
        </div> */}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.slotIndex === nextProps.slotIndex &&
      prevProps.dayIndex === nextProps.dayIndex &&
      prevProps.time.timeString === nextProps.time.timeString &&
      prevProps.data.date === nextProps.data.date &&
      prevProps.isPast === nextProps.isPast &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isMarkedAvailableSlot === nextProps.isMarkedAvailableSlot &&
      prevProps.availableSlotTime === nextProps.availableSlotTime &&
      prevProps.appointmentStartTime === nextProps.appointmentStartTime &&
      prevProps.isValidDateSync === nextProps.isValidDateSync &&
      prevProps.result === nextProps.result &&
      prevProps.view === nextProps.view &&
      prevProps.slotSize === nextProps.slotSize &&
      prevProps.timeInterval === nextProps.timeInterval &&
      prevProps.timeZone === nextProps.timeZone &&
      prevProps.isDisabledSelection === nextProps.isDisabledSelection &&
      prevProps.isDisabledSelectionBasedOnPreviousSlot ===
        nextProps.isDisabledSelectionBasedOnPreviousSlot &&
      prevProps.futureConflict === nextProps.futureConflict &&
      prevProps.pastConflict === nextProps.pastConflict &&
      prevProps.removeSlot === nextProps.removeSlot &&
      prevProps.availableSlotData.id === nextProps.availableSlotData.id &&
      prevProps.availableSlotData.status === nextProps.availableSlotData.status &&
      prevProps.appointmentStartTime?.slot.start_time ===
        nextProps.appointmentStartTime?.slot.start_time &&
      prevProps.appointmentStartTime?.slot.end_time ===
        nextProps.appointmentStartTime?.slot.end_time &&
      prevProps.appointmentStartTime?.slot.id === nextProps.appointmentStartTime?.slot.id
    );
  }
);

export default TimeSlotCell;
