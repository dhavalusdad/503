import { useState, useCallback, useMemo } from 'react';

import moment from 'moment';
import { useSelector } from 'react-redux';

import { useGetAppointments } from '@/api/appointment';
import {
  useCreateAvailabilitySlots,
  useGetAvailabilitySlots,
  useRemoveAvailabilitySlots,
} from '@/api/availability';
// import type { CreateAvailabilitySlotRequest, CreateAvailabilitySlotsRequest } from '@/api/types';
import type {
  CreateAvailabilitySlotRequest,
  CreateAvailabilitySlotsRequest,
} from '@/api/types/calendar.dto';
import { AppointmentStatus } from '@/enums';
import ScheduleAppointment from '@/features/calendar/components/ScheduleAppointment';
// import type { ErrorResponse } from '@/features/login';
import type { ErrorResponse } from '@/features/login/types';
import { showToast } from '@/helper';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CustomCalendar from '@/stories/Common/Calender';
import type { AvailableTimeSlotsPerDay } from '@/stories/Common/Calender/types';

import type { AxiosError } from 'axios';

export const CalendarMain = () => {
  const user = useSelector(currentUser);

  const [scheduleAppointment, setScheduleAppointment] = useState(false);
  const [monthPagination, setMonthPagination] = useState({
    startDate: '',
    endDate: '',
    timeZone: user?.timezone,
    therapist_id: user?.therapist_id,
  });

  // API hooks
  const { data: availabilityData, dataUpdatedAt: dataUpdatedAtAvailability } =
    useGetAvailabilitySlots(monthPagination);

  const { mutateAsync: createAvailableSlots } = useCreateAvailabilitySlots();

  const { mutateAsync: removeAvailableSlot } = useRemoveAvailabilitySlots();

  const { data: appointmentsData, dataUpdatedAt: dataUpdatedAtAppointments } = useGetAppointments(
    {
      ...monthPagination,
      includeCancelled: false,
      status: [
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.IN_PROGRESS,
        AppointmentStatus.Rescheduled,
        AppointmentStatus.NO_SHOW,
      ],
    },

    { enabled: !!monthPagination?.startDate && !!monthPagination?.timeZone }
  );

  // Memoized handlers for better performance
  const handleCreateAvailabilitySlots = useCallback(
    async (slotsData: CreateAvailabilitySlotsRequest) => {
      const currentAvailabilitySlots = availabilityData?.data || {};

      // Filter out slots that already exist
      const removeSlot = [];
      const newData: CreateAvailabilitySlotsRequest = slotsData.filter(
        (slot: CreateAvailabilitySlotRequest) =>
          !currentAvailabilitySlots?.some(
            (existingSlot: { start_time: string; end_time: string }) => {
              const slotTime = moment.tz(existingSlot.start_time, user.timezone);
              const createdSlot = moment.tz(slot.start_time, user.timezone);
              if (
                moment.tz(moment.now(), user.timezone).diff(slotTime, 'minute') > 0 &&
                moment.tz(moment.now(), user.timezone).diff(slotTime, 'minute') <= 45 &&
                createdSlot.diff(slotTime, 'minute') > 0 &&
                createdSlot.diff(slotTime, 'minute') <= 45
              ) {
                // moment(slot.start_time).isBetween(existingSlot.start_time, existingSlot.end_time)
                removeSlot.push(existingSlot);
                return false;
              }

              return (
                moment(slot.start_time).isBetween(existingSlot.start_time, existingSlot.end_time) ||
                moment(slot.end_time).isBetween(existingSlot.start_time, existingSlot.end_time) ||
                moment(existingSlot.start_time).isSame(slot.start_time)
              );
            }
          )
      );
      if (removeSlot?.length > 0) {
        await removeAvailableSlot({
          ids: Array.isArray(removeSlot) && (removeSlot?.map(d => d.id) as string[]),
        });
      }

      if (newData?.length === 0) {
        showToast('All selected slots already exist');
        return;
      }

      try {
        await createAvailableSlots(newData);
        showToast(`Slot${newData?.length > 1 ? 's' : ''} marked as Available!`);
      } catch (error) {
        showToast(error as AxiosError<ErrorResponse>, 'ERROR');
      }
    },
    [dataUpdatedAtAvailability, createAvailableSlots]
  );

  const handleRemoveAvailableSlots = useCallback(
    async (uniqueSlotsToRemove: AvailableTimeSlotsPerDay[]) => {
      try {
        // Extract IDs from the slots, handling the different structure
        const ids = uniqueSlotsToRemove
          .filter(slot => slot?.id !== undefined && slot?.status !== 'Booked')
          .map(slot => slot?.id);
        if (ids.length === 0) {
          showToast('No valid slots to remove', 'ERROR');
          return;
        }

        await removeAvailableSlot({ ids: ids as string[] });
        showToast(`Slot${ids.length > 1 ? 's' : ''} marked as Unavailable!`);
      } catch (error) {
        showToast(error as AxiosError<ErrorResponse>, 'ERROR');
      }
    },
    [removeAvailableSlot]
  );

  const handleMonthPagination = useCallback(
    (startDate: string, endDate: string) =>
      setMonthPagination(prev => ({
        ...prev,
        startDate,
        endDate,
        timeZone: prev.timeZone || 'UTC',
      })),
    []
  );

  const calendarProps = useMemo(
    () => ({
      appointments: appointmentsData?.data || [],
      availableSlots: availabilityData?.data || [],
      onSlotSelect: handleCreateAvailabilitySlots,
      onSlotsRemove: handleRemoveAvailableSlots,
      initialView: 'Week' as const,
      startFromMonday: true,
      onAppointmentClick: () => {},
      onAvailableSlotSet: () => {},
      timeFormat: '12hr' as const,
      workHours: { start: 0, end: 24 },
      slotTimeInterval: 15,
      slotTimeSlotSize: 30,
      displayHourOnly: true,
      slotRange: [15, 30, 60],
      timeZone: monthPagination.timeZone,
      handleMonthPagination,
      slotConfiguration: {
        slotDuration: 60,
        enforceSlotAlignment: true,
      },
    }),
    [
      availabilityData?.data,
      handleCreateAvailabilitySlots,
      handleRemoveAvailableSlots,
      appointmentsData?.data,
      handleMonthPagination,
      dataUpdatedAtAppointments,
      dataUpdatedAtAvailability,
      monthPagination.timeZone,
    ]
  );

  return (
    <>
      <CustomCalendar
        AdditionalActionButton={
          <Button
            variant='filled'
            title='Schedule Appointment'
            className='rounded-lg'
            onClick={() => setScheduleAppointment(true)}
            parentClassName='order-3 xl:order-none'
          />
        }
        {...calendarProps}
      />

      <ScheduleAppointment
        setScheduleAppointment={setScheduleAppointment}
        scheduleAppointment={scheduleAppointment}
        timeZone={monthPagination.timeZone || 'UTC'}
      />
    </>
  );
};
