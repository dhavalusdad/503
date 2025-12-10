import React, { memo, useRef, useState } from 'react';

import clsx from 'clsx';
import moment from 'moment-timezone';

import defaultUserPng from '@/assets/images/default-user.webp';
import { ROUTES } from '@/constants/routePath';
import { SessionType } from '@/enums';
import { checkIfSessionCanBeStarted } from '@/features/appointment/helper';
import AppointmentDetailsModal from '@/features/calendar/components/AppointmentDetailsModal';
import CancelTherapistAppointmentModal from '@/features/calendar/components/CancelTherapistAppointmentModal';
import { RescheduleAppointmentModal } from '@/features/calendar/components/RescheduleAppointmentModal';
import { redirectTo } from '@/helper/redirect';
import { usePopupClose } from '@/hooks/usePopupClose';
import Button from '@/stories/Common/Button';
import type { AppointmentDetailsPopupProps } from '@/stories/Common/Calender/types';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';

const SERVER_URL = import.meta.env.VITE_BASE_URL;

export const AppointmentDetailsPopup: React.FC<AppointmentDetailsPopupProps> = memo(
  ({ appointment, onClose, position, timeZone = moment.tz.guess(), ref, ...rest }) => {
    const { client, slot } = appointment;

    const { sessionCannotBeStarted, minutesDiff } = checkIfSessionCanBeStarted({
      start_time: slot.start_time,
      end_time: slot.end_time,
      timezone: timeZone,
    });
    const start = moment.tz(slot.start_time, timeZone);
    const end = moment.tz(slot.end_time, timeZone);

    // Case 1: real next-day (date changed)
    const isNextDay =
      start.format('YYYY-MM-DD') !== end.clone().subtract('minute', 2).format('YYYY-MM-DD');

    const startTime = start.format('hh:mm A');
    const endTime = end.format('hh:mm A');

    const startDate = start.format('DD MMM YYYY');
    const endDate = end.format('DD MMM YYYY');

    const timeRange = isNextDay
      ? `${startTime} (${startDate}) – ${endTime} (${endDate})`
      : `${startTime} -${endTime}`;

    const isPast = moment
      .tz(slot.end_time, timeZone)
      .isBefore(moment.tz(moment.tz(timeZone).format('YYYY-MM-DD HH:mm'), timeZone));
    // const isWithin24HoursOfCreation = moment
    //   .tz(timeZone)
    //   .isBefore(moment.tz(appointment?.created_at, timeZone).add(24, 'hours'));
    const [appointmentDetailsModalOpen, setAppointmentDetailsModalOpen] = useState(false);
    const [cancelAppointmentModalOpen, setCancelAppointmentModalOpen] = useState(false);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const moreActionRef = useRef<HTMLDivElement>(null);
    const { isOpen: isVisible, setIsOpen: setIsVisible } = usePopupClose({
      popupRef: moreActionRef as React.RefObject<HTMLElement>,
    });
    const getStylesObject = () => {
      const arrowSize = 15; // adjust to match your arrow svg size
      const style: React.CSSProperties = {};

      if (position.topBottomDirection === 'top') {
        style.bottom = -arrowSize;
        style.left = '50%';
        style.transform = 'translateX(-50%) rotate(180deg)';
      } else {
        style.top = -arrowSize;
        style.left = '50%';
        style.transform = 'translateX(-50%) rotate(0deg)';
      }

      if (position.leftRightDirection === 'left') {
        style.left = 'auto';
        style.right = '20px';
        style.transform =
          position.topBottomDirection === 'top' ? 'rotate(-90deg)' : 'rotate(90deg)';
      } else if (position.leftRightDirection === 'right') {
        style.left = '20px';
        style.transform =
          position.topBottomDirection === 'top' ? 'rotate(-90deg)' : 'rotate(90deg)';
      }

      return style;
    };

    return (
      <div draggable={false} ref={ref as React.RefObject<HTMLDivElement>}>
        <div
          style={{
            top: position.top,
            left: position.left,
            ...(position.topBottomDirection && { topBottomDirection: position.topBottomDirection }),
            ...(position.leftRightDirection && { leftRightDirection: position.leftRightDirection }),
          }}
          {...rest}
          className={clsx(
            'fixed bg-white shadow-calendermodal w-96 !border-0',
            position.topBottomDirection == 'top' ? 'mt-18px' : 'mt-2.5'
          )}
        >
          <div className='absolute' style={getStylesObject()}>
            <Icon name='polygonarrow' className='text-white' />
          </div>
          <div className='flex justify-between items-center p-4 border-b border-surface'>
            <h2 className='text-base font-bold text-blackdark leading-22px'>Appointment Details</h2>
            <Button
              variant='none'
              onClick={onClose}
              className='rounded-full w-30px h-30px justify-center bg-Gray !p-0'
              icon={<Icon name='close' className='text-blackdark' />}
            />
          </div>
          <div className='p-4 relative'>
            <div className='flex flex-col gap-3.5'>
              <div className='flex items-center justify-between gap-2'>
                <p className='text-primary text-base font-bold leading-22px'>
                  {appointment?.therapy_type?.name}
                </p>
                {!isPast && (
                  <div onClick={() => setIsVisible(!isVisible)} className='relative cursor-pointer'>
                    <Icon name='threedots' />
                  </div>
                )}
                {isVisible && (
                  <div
                    ref={moreActionRef}
                    className='absolute right-0 top-[15px] mt-2 flex flex-col items-center  gap-2 min-w-40 bg-white rounded-10px p-2 px-3 border border-solid border-surface shadow-dropdown'
                  >
                    <Button
                      variant='none'
                      title='Reschedule'
                      icon={<Icon name='reschedule' color='' className='rounded-full' />}
                      isIconFirst
                      parentClassName='w-full flex justify-start items-center p-1'
                      className='  w-full !p-0  justify-start items-center text-13px'
                      onClick={() => setIsRescheduleModalOpen(true)}
                    />
                    <Button
                      variant='none'
                      title='Cancel'
                      icon={<Icon name='close' color='red' className='rounded-full text-white' />}
                      isIconFirst
                      parentClassName='w-full flex justify-start items-center p-1'
                      className='  w-full !p-0  justify-start items-center text-red text-13px'
                      onClick={() => setCancelAppointmentModalOpen(true)}
                    />
                  </div>
                )}
              </div>
              <div className='flex flex-col gap-2.5'>
                <div className='flex items-center gap-3'>
                  <Image
                    imgPath={
                      client?.user?.profile_image
                        ? `${SERVER_URL}${client?.user?.profile_image}`
                        : client?.user?.first_name && client?.user?.last_name
                          ? ''
                          : defaultUserPng
                    }
                    firstName={client?.user?.first_name}
                    lastName={client?.user?.last_name}
                    alt='profile'
                    imageClassName='rounded-full object-cover object-center w-full h-full'
                    className='w-12 h-12 bg-surface rounded-full flex items-center justify-center'
                    initialClassName='!text-base'
                  />
                  <span className='text-sm font-medium text-blackdark'>
                    {client?.user?.first_name} {client?.user?.last_name}
                  </span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <Icon name='clock' className='text-white' />
                  <span className='text-sm font-medium text-blackdark'>{timeRange}</span>
                </div>
              </div>
            </div>
          </div>
          <div className='flex items-center justify-between gap-2 p-4 pt-0'>
            {!isPast &&
              appointment?.video_room_name &&
              appointment?.session_type == SessionType.VIRTUAL && (
                <div className='relative group flex-1'>
                  <Button
                    variant='filled'
                    title='Start Session'
                    isDisabled={sessionCannotBeStarted}
                    parentClassName='flex-1'
                    className='w-full rounded-10px !font-bold !text-sm !py-3'
                    onClick={() => {
                      const url = ROUTES.JOIN_APPOINTMENT.navigatePath(
                        appointment?.video_room_name
                      );
                      redirectTo(url, { isNewTab: false });
                    }}
                  />
                  {minutesDiff > 15 && (
                    <div className='hidden group-hover:flex items-center gap-2 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-blackdark text-white text-xs leading-3 font-medium px-3 py-2 rounded-lg whitespace-nowrap z-50 shadow-lg'>
                      <Icon name='info' />
                      <span>Available 15 minutes before session</span>
                      <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blackdark'></div>
                    </div>
                  )}
                </div>
              )}

            <Button
              variant={isPast ? 'filled' : 'outline'}
              title='View Full Details'
              parentClassName='flex-1'
              className='w-full rounded-10px !font-bold !text-sm'
              onClick={() => setAppointmentDetailsModalOpen(true)}
            />
          </div>
        </div>

        {appointmentDetailsModalOpen && (
          <AppointmentDetailsModal
            isPast={isPast}
            isOpen={appointmentDetailsModalOpen}
            onClose={() => {
              setAppointmentDetailsModalOpen(false);
              onClose();
            }}
            appointmentId={appointment?.id}
          />
        )}
        {cancelAppointmentModalOpen && (
          <CancelTherapistAppointmentModal
            isOpen={cancelAppointmentModalOpen}
            onClose={() => {
              setCancelAppointmentModalOpen(false);
              onClose();
            }}
            appointmentId={appointment?.id}
            parentModule='therapist-calendar'
          />
        )}
        {isRescheduleModalOpen && (
          <RescheduleAppointmentModal
            isOpen={isRescheduleModalOpen}
            onClose={() => setIsRescheduleModalOpen(false)}
            appointmentId={appointment?.id}
            parentModule='therapist-calendar'
          />
        )}
      </div>
    );
  }
);
