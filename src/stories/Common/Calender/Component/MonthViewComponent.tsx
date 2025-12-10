import React, { useMemo, useRef } from 'react';

import moment from 'moment-timezone';

import { usePopupClose } from '@/hooks/usePopupClose';
import Button from '@/stories/Common/Button';
import { AppointmentCard } from '@/stories/Common/Calender/Component/AppointmentCard';
import type {
  Appointment,
  MonthCellInterface,
  MonthViewComponentInterface,
} from '@/stories/Common/Calender/types';

const MonthView = ({
  month,
  appointments = [],
  handleAppointmentClick,
  timeZone = moment.tz.guess(),
}: MonthViewComponentInterface) => {
  // Create a lookup map for appointments by date for O(1) access
  const appointmentsByDate = useMemo(() => {
    const lookup = new Map<string, Appointment[]>();

    appointments?.forEach(appointment => {
      const appointmentDate = moment.tz(appointment.slot.start_time, timeZone);
      const dateKey = `${appointmentDate.year()}-${appointmentDate.month()}-${appointmentDate.date()}`;

      if (!lookup.has(dateKey)) {
        lookup.set(dateKey, []);
      }
      lookup.get(dateKey)!.push(appointment);
    });

    return lookup;
  }, [appointments]);

  // Flatten month data once and memoize
  const flattenedMonth = useMemo(() => month.flat(), [month]);

  return (
    <>
      {flattenedMonth.map((cell, idx) => (
        <MonthCell
          key={`${cell.date}-${idx}`} // Better key using date + index
          cell={cell}
          index={idx}
          appointments={
            appointmentsByDate.get(
              `${moment.tz(cell.date, timeZone).year()}-${moment.tz(cell.date, timeZone).month()}-${moment.tz(cell.date, timeZone).date()}`
            ) || []
          }
          timeZone={timeZone}
          handleAppointmentClick={handleAppointmentClick}
        />
      ))}
    </>
  );
};

// Separate memoized component for each month cell
const MonthCellComponent = ({
  cell,
  appointments,
  handleAppointmentClick,
  index,
  timeZone,
}: MonthCellInterface) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isOpen: showPopup, setIsOpen: setShowPopup } = usePopupClose({
    buttonRef: buttonRef as React.RefObject<HTMLElement>,
    popupRef: popupRef as React.RefObject<HTMLElement>,
  });

  // Memoize visible appointments and count
  const { visibleAppointments, totalCount } = useMemo(() => {
    const visible = appointments.slice(0, 2);
    return {
      visibleAppointments: visible,
      totalCount: appointments.length,
    };
  }, [appointments]);

  return (
    <div
      draggable={false}
      className={`p-2 relative border-surface border min-h-190px ${
        cell?.isCurrentMonth ? 'bg-white text-blackdark' : 'bg-surface/50 text-primary'
      }`}
    >
      {cell.day}
      <div draggable={false} className='flex flex-col  gap-1 max-h-180px'>
        {visibleAppointments.map((appointment, index) => (
          <AppointmentCard
            key={`${appointment.id || appointment.slot.start_time}-${index}`}
            onClick={handleAppointmentClick}
            index={index}
            appointment={appointment}
            isDayView={false}
            timeZone={timeZone}
            totalTimeSlots={0} // Month view doesn't need time-based positioning
          />
        ))}
        {totalCount > 2 && (
          <div className='relative text-end'>
            <Button
              buttonRef={buttonRef}
              variant='none'
              parentClassName='inline-block'
              className='text-sm w-full text-primary !font-bold cursor-pointer flex justify-end hover:bg-primarylight !px-2 rounded-md !p-1'
              title={`+${totalCount - 2} more...`}
              onClick={() => setShowPopup(!showPopup)}
            />
          </div>
        )}
        {/* {totalCount > 2 && (
          <RowDropdown<HTMLDivElement>
            placement='right'
            dropdownContentClassName='!border-0 !shadow-content'
            content={() => (
              <div
                className={`w-full`}
              >
                <div className='p-2 border-b border-surface bg-primary rounded-t-lg z-50 sticky top-0'>
                  <div className='font-semibold text-white text-lg'>
                    {moment.tz(cell.date, timeZone as string).format('MMM DD, YYYY')}
                  </div>
                  <div className='text-white text-base'>
                    {totalCount} appointment{totalCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className='p-2 h-full'>
                  <div
                    className={`flex flex-col gap-1 overflow-y-auto max-h-72 scroll-disable`}
                  >
                    {appointments.map((appointment, index) => (
                      <AppointmentCard
                        key={`${appointment.id || appointment.slot.start_time}-${index}`}
                        onClick={handleAppointmentClick}
                        index={index}
                        appointment={appointment}
                        isDayView={false}
                        timeZone={timeZone}
                        totalTimeSlots={0} // Month view doesn't need time-based positioning
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          >
            {({ onToggle, targetRef }) => (
              <div
                ref={targetRef}
                onClick={() => onToggle()}
                className='relative text-end'>
                <Button
                  variant='none'
                  parentClassName='inline-block'
                  className='text-sm w-full text-primary !font-bold cursor-pointer flex justify-end hover:bg-primarylight !px-2 rounded-md !p-1'
                  title={`+${totalCount - 2} more...`}
                />
              </div>
            )}
          </RowDropdown>
        )} */}
      </div>
      {totalCount > 2 && showPopup && (
        <div
          ref={popupRef}
          className={` 
            ${index > 7 ? 'bottom-0' : 'bottom-[-150px] '} 
            left-0 right-0 z-40 absolute shadow-content bg-white w-full 
            border border-solid border-surface rounded-lg scrollbar-hide
          `}
        >
          <div className='p-2 border-b border-surface bg-primary rounded-t-lg z-50 sticky top-0'>
            <div className='font-semibold text-white text-lg'>
              {moment.tz(cell.date, timeZone as string).format('MMM DD, YYYY')}
            </div>
            <div className='text-white text-base'>
              {totalCount} appointment{totalCount !== 1 ? 's' : ''}
            </div>
          </div>
          <div className='p-2 h-full'>
            <div
              className={`flex flex-col gap-1 overflow-y-auto max-h-72 scrollbar-hide ${index < 7 ? 'pt-[30px]' : ''}`}
            >
              {appointments.map((appointment, index) => (
                <AppointmentCard
                  key={`${appointment.id || appointment.slot.start_time}-${index}`}
                  onClick={handleAppointmentClick}
                  index={index}
                  appointment={appointment}
                  isDayView={false}
                  timeZone={timeZone}
                  totalTimeSlots={0} // Month view doesn't need time-based positioning
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MonthViewComponent = React.memo(MonthView);
const MonthCell = React.memo(MonthCellComponent);
