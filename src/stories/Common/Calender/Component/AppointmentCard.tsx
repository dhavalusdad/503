import React, { memo, useMemo } from 'react';

import clsx from 'clsx';
import moment from 'moment-timezone';

import defaultUserPng from '@/assets/images/default-user.webp';
import type { AppointmentCardProps } from '@/stories/Common/Calender/types';
import Image from '@/stories/Common/Image';

const THERAPY_TYPE_COLORS = (isPast: boolean) => ({
  'Couples Therapy': !isPast ? 'bg-[#80558C]' : 'bg-[#9186A1]',
  'Family Therapy': !isPast ? 'bg-[#7286D3]' : 'bg-[#7286D3]',
  'Individual Therapy': !isPast ? 'bg-[#79AC78]' : 'bg-[#8FBDA2]',
  'Minor Therapy': !isPast ? 'bg-[#F97F7F]' : 'bg-[#F97F7F]',
});
const SERVER_URL = import.meta.env.VITE_BASE_URL;

const AppointmentCardComponent: React.FC<AppointmentCardProps> = memo(
  ({
    appointment,
    isPast = false,
    onClick,
    dayIndex,
    isAbsolute = false,
    availableSlotData,
    isDayView = false,
    timeZone = moment.tz.guess(),
    timeInterval = 60,
    slotSize = 30,
    currentSlotTime,
  }) => {
    // Pre-calculate moment objects once
    const appointmentTimes = useMemo(() => {
      if (!availableSlotData || !appointment?.slot) return null;

      const start = moment.tz(availableSlotData.start_time, timeZone);
      const end = moment.tz(availableSlotData.end_time, timeZone);

      const appointmentStart = moment.tz(appointment.slot.start_time, timeZone);
      const appointmentEnd = moment.tz(appointment.slot.end_time, timeZone);

      const startDate = appointmentStart.format('YYYY-MM-DD');
      const endDate = appointmentEnd.format('YYYY-MM-DD');

      const duration = end.diff(start, 'minutes');

      // Default normal range
      const timeRange = `${appointmentStart.format('hh:mm A')} to ${appointmentEnd.format('hh:mm A')}`;

      // ---------------------------------------
      // Check if appointment crosses midnight
      // ---------------------------------------
      const crossesMidnight = startDate !== endDate;

      return {
        start,
        end,
        duration: duration,
        timeRange,
        previousDay: end.isSame(appointmentEnd) && crossesMidnight,
        nextDayCont: start.isSame(appointmentStart) && crossesMidnight,
      };
    }, [availableSlotData?.start_time, availableSlotData?.end_time, appointment.slot, timeZone]);

    // Calculate precise positioning and height
    const positionAndSize = useMemo(() => {
      const pixelsPerMinute = slotSize / timeInterval;
      const calculatedHeight = (appointmentTimes?.duration || 0) * pixelsPerMinute;

      let topOffset = 0;
      if (currentSlotTime) {
        const today = moment.tz(timeZone).format('YYYY-MM-DD');
        const slotStart = moment.tz(`${today} ${currentSlotTime}`, 'YYYY-MM-DD HH:mm', timeZone);

        const appointmentStartToday = appointmentTimes?.start
          ?.clone()
          ?.year(slotStart.year())
          ?.month(slotStart.month())
          ?.date(slotStart.date());

        const minutesFromSlotStart = appointmentStartToday?.diff(slotStart, 'minutes') || 0;
        topOffset = Math.max(0, minutesFromSlotStart * pixelsPerMinute);
      }

      return {
        topOffset,
        height: calculatedHeight,
        isShort: calculatedHeight < slotSize * 2,
      };
    }, [appointmentTimes, currentSlotTime, timeInterval, slotSize, timeZone]);

    // Pre-calculate all styles
    const containerStyle: React.CSSProperties = useMemo(() => {
      const baseHeight = !isDayView ? 60 : positionAndSize.height;

      const style: React.CSSProperties = {
        height: `${baseHeight}px`,
        fontSize: '14px',
        zIndex: '20',
        ...(isPast ? { color: '#FFFFFF80' } : {}),
      };

      if (positionAndSize.isShort) {
        style.display = 'flex';
        style.flexWrap = 'wrap';
        style.alignItems = 'center';
        style.gap = '0 0.5rem';
      }

      if (isAbsolute) {
        style.top = `${positionAndSize.topOffset}px`;
      }

      return style;
    }, [isDayView, positionAndSize, isAbsolute, isPast]);

    // Pre-calculate CSS classes
    const containerClass = useMemo(() => {
      const therapyColor =
        THERAPY_TYPE_COLORS(isPast)[
          appointment?.therapy_type?.name as keyof typeof THERAPY_TYPE_COLORS
        ] || 'bg-primarylight';

      return `${therapyColor} relative px-2 py-1 text-white cursor-pointer select-none border-b border-solid border-white`;
    }, [appointment?.therapy_type?.name]);

    // Memoize click handler
    const handleClick = useMemo(
      () => (e: React.MouseEvent) => onClick(e, appointment, Number(dayIndex)),
      [onClick, appointment, dayIndex]
    );

    return (
      <div draggable={false} className='relative'>
        <div
          draggable={false}
          key={`appointment-card${appointmentTimes?.timeRange || ''}`}
          id='appointment-card'
          style={containerStyle}
          className={clsx('overflow-hidden', containerClass)}
          onClick={handleClick}
        >
          <div
            className={clsx(
              'flex w-full flex-col',
              (appointmentTimes?.duration ?? 0) <= 55 ? '' : 'gap-2'
            )}
          >
            <h6
              className={clsx(
                'font-bold truncate',
                (appointmentTimes?.duration ?? 0) <= 55 ? 'text-xs' : ''
              )}
            >
              {appointment?.therapy_type?.name}{' '}
              {(appointmentTimes?.nextDayCont || appointmentTimes?.previousDay) && (
                <span className='text-xs  font-medium'>
                  ({appointment.client?.user?.first_name} {appointment.client?.user?.last_name})
                </span>
              )}
            </h6>
            {!(appointmentTimes?.nextDayCont || appointmentTimes?.previousDay) && (
              <div className='flex items-center gap-1.5'>
                <Image
                  imgPath={
                    appointment.client?.user?.profile_image
                      ? `${SERVER_URL}${appointment.client?.user?.profile_image}`
                      : appointment.client?.user?.first_name && appointment.client?.user?.last_name
                        ? ''
                        : defaultUserPng
                  }
                  firstName={appointment.client?.user?.first_name}
                  lastName={appointment.client?.user?.last_name}
                  alt='profile'
                  imageClassName='rounded-full object-cover object-center w-full h-full'
                  className='w-6 h-6 bg-surface rounded-full flex items-center justify-center'
                  initialClassName='!text-10px'
                />
                <span className='text-sm font-medium truncate flex-1'>
                  {appointment.client?.user?.first_name} {appointment.client?.user?.last_name}
                </span>
              </div>
            )}
            <div
              className={clsx(
                'flex gap-1',
                appointmentTimes?.previousDay && (appointmentTimes?.duration ?? 0) <= 40
                  ? 'flex-row'
                  : 'flex-wrap'
              )}
            >
              <span className={clsx('text-xs font-medium truncate')}>
                {appointmentTimes?.timeRange || ''}
              </span>
              {(appointmentTimes?.nextDayCont || appointmentTimes?.previousDay) &&
                (appointmentTimes?.duration ?? 0) <= 55 && (
                  <>
                    {' '}
                    <span className={clsx('font-medium truncate text-xs')}>
                      {' '}
                      {appointmentTimes?.nextDayCont
                        ? ' (continues to next day)'
                        : ' (continued from previous day)'}
                    </span>{' '}
                  </>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  },
  areAppointmentListsEqual
);

function areAppointmentListsEqual(
  prevProps: AppointmentCardProps,
  nextProps: AppointmentCardProps
): boolean {
  const prev = prevProps.appointment;
  const next = nextProps.appointment;

  // Quick reference check first
  if (prev === next) return true;

  // Compare all props that affect rendering
  return (
    prev.id === next.id &&
    prev.slot.start_time === next.slot.start_time &&
    prev.slot.end_time === next.slot.end_time &&
    prev.client.id === next.client.id &&
    prev.therapy_type.id === next.therapy_type.id &&
    prev.therapy_type.name === next.therapy_type.name &&
    prevProps.isPast === nextProps.isPast &&
    prevProps.isAbsolute === nextProps.isAbsolute &&
    prevProps.isDayView === nextProps.isDayView &&
    prevProps.timeZone === nextProps.timeZone &&
    prevProps.timeInterval === nextProps.timeInterval &&
    prevProps.slotSize === nextProps.slotSize &&
    prevProps.currentSlotTime === nextProps.currentSlotTime &&
    prevProps.dayIndex === nextProps.dayIndex
  );
}

export const AppointmentCard = AppointmentCardComponent;
AppointmentCard.displayName = 'AppointmentCard';
