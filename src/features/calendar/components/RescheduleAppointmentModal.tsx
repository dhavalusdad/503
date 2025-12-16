import React, { useState, useMemo, useEffect } from 'react';

import moment from 'moment-timezone';
import { useSelector } from 'react-redux';

import { useUpdateAppointment } from '@/api/appointment';
import { useGetAvailabilitySlots } from '@/api/availability';
import { calendarQueryKeys } from '@/api/common/calendar.queryKey';
import { clientAppointmentBookingQueryKey } from '@/api/common/clientAppointment.queryKey';
import { UserRole } from '@/api/types/user.dto';
import { showToast } from '@/helper';
import { useInvalidateQuery } from '@/hooks/data-fetching';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import Modal from '@/stories/Common/Modal';

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  parentModule: 'therapist-dashboard' | 'therapist-calendar' | 'client-dashboard';
  therapistId?: string;
}

export const RescheduleAppointmentModal: React.FC<RescheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  parentModule,
  therapistId,
}) => {
  const user = useSelector(currentUser);
  const { invalidate } = useInvalidateQuery();
  const [selectedDate, setSelectedDate] = useState<Date>(
    moment.tz(user?.timezone || 'UTC').toDate()
  );
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [allAvailableDates, setAllAvailableDates] = useState<{ date: Date; className: string }[]>(
    []
  );

  // API hooks
  const { data: availabilityData, isLoading: isLoadingSlots } = useGetAvailabilitySlots({
    timeZone: user?.timezone || 'UTC',
    startDate: moment(selectedDate).format('YYYY-MM-DD'),
    endDate: moment(selectedDate).format('YYYY-MM-DD'),
    therapist_id: therapistId || user?.therapist_id,
    session_type: 'Virtual',
  });

  const { mutateAsync: updateAppointment, isPending: isUpdating } = useUpdateAppointment({
    onSuccess: async () => {
      if (parentModule === 'therapist-dashboard') {
        await invalidate(calendarQueryKeys.clientTherapistAppointments());
      } else if (parentModule === 'therapist-calendar') {
        await invalidate(calendarQueryKeys.availabilitySlots());
        await invalidate(calendarQueryKeys.appointments());
      } else if (parentModule === 'client-dashboard') {
        await invalidate(clientAppointmentBookingQueryKey.getClientAppointBookingList());
      }
    },
  });

  const handleClose = () => {
    setSelectedDate(moment.tz(user?.timezone || 'UTC').toDate());
    setSelectedTime('');
    setSelectedSlotId('');
    onClose();
  };

  const onReschedule = async (slotId: string) => {
    try {
      await updateAppointment({
        data: { slot_id: slotId },
        id: appointmentId,
      });

      handleClose();
    } catch (error) {
      console.error('Failed to reschedule appointment:', error);
      showToast('Failed to reschedule appointment. Please try again.', 'ERROR');
    }
  };

  const availableTimes = useMemo(() => {
    if (!availabilityData?.data || !Array.isArray(availabilityData?.data)) {
      return [];
    }

    return availabilityData?.data
      .filter(
        (slot: { status: string; start_time: string }) =>
          slot.status === 'Available' &&
          moment
            .tz(slot.start_time, user?.timezone || 'UTC')
            .isAfter(
              moment
                .tz(user?.timezone || 'UTC')
                .add(user?.role == UserRole.THERAPIST ? 0 : 24, 'hours')
            )
      )
      .map((slot: { id: string; start_time: string; end_time: string }) => ({
        time: moment.tz(slot.start_time, user?.timezone || 'UTC').format('h:mm A'),
        slotId: slot.id,
        startTime: slot.start_time,
        endTime: slot.end_time,
      }))
      .sort((a: { startTime: string }, b: { startTime: string }) =>
        moment
          .tz(a.startTime, user?.timezone || 'UTC')
          .diff(moment.tz(b.startTime, user?.timezone || 'UTC'))
      );
  }, [availabilityData?.data, user?.timezone]);

  const handleReschedule = () => {
    if (selectedSlotId) {
      onReschedule(selectedSlotId);
    }
  };

  const handleTimeSelection = (time: string, slotId: string) => {
    setSelectedTime(time);
    setSelectedSlotId(slotId);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  useEffect(() => {
    if (!availabilityData) return;
    // Extract available dates (fall back to empty array)
    const dates = availabilityData.availableDates;

    // Filter + transform valid dates
    const transformed = dates
      .filter((date: Date | string) => moment(date).isValid())
      .map((date: Date | string) => ({
        date: moment.utc(date).tz(user?.timezone).toDate(),
        className: 'available-slot',
      }));

    setAllAvailableDates(transformed);
  }, [availabilityData?.availableDates, user?.timezone]);

  return (
    // updated modal
    <Modal
      title='Reschedule Your Appointment'
      isOpen={isOpen}
      onClose={handleClose}
      size='2xl'
      closeButton={false}
      contentClassName='pt-30px'
      footerClassName='flex items-center justify-end gap-5 pt-30px border-t border-solid border-surface'
      footer={
        <>
          <Button
            variant='outline'
            title='Cancel'
            onClick={handleClose}
            className='!px-6 rounded-10px'
            isDisabled={isUpdating}
          />
          <Button
            variant='filled'
            title={isUpdating ? 'Rescheduling...' : 'Reschedule Appointment'}
            onClick={handleReschedule}
            className='!px-6 rounded-10px'
            isDisabled={!selectedDate || !selectedTime || !selectedSlotId || isUpdating}
          />
        </>
      }
    >
      <div className='flex flex-col lg:flex-row gap-5 xl:gap-8'>
        <div className='flex-[1.5]'>
          <CustomDatePicker
            selected={selectedDate}
            onChange={date => {
              const selectedDate = date as Date;
              // Convert to user's timezone date
              setSelectedDate(selectedDate as Date);
              setSelectedTime('');
              setSelectedSlotId('');
            }}
            minDate={moment.tz(user?.timezone).startOf('day').toDate()} // Only allow dates from tomorrow onwards
            inline
            showIcon={false}
            showMonthDropdown={false}
            showYearDropdown={false}
            headerClassName='rounded-10px'
            parentClassName='bg-surfacelight p-3 sm:p-5 rounded-2xl disabled-past-dates w-full max-w-full'
            label='Select Date'
            customDateClasses={allAvailableDates}
            labelClass='mb-3 sm:mb-5 text-base sm:text-lg !font-semibold !leading-6'
          />
        </div>

        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-blackdark mb-4'>
            Available Times on {formatDate(selectedDate)}
          </h3>

          {isLoadingSlots ? (
            <div className='flex items-center justify-center py-8'>
              <div className='text-primarygray text-base font-semibold'>
                Loading available slots...
              </div>
            </div>
          ) : availableTimes.length === 0 ? (
            <div className='flex items-center justify-center py-8'>
              <div className='text-primarygray text-base font-semibold'>
                No available slots for this date
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-5 lg:grid-cols-3 gap-2'>
              {availableTimes.map(({ time, slotId }: { time: string; slotId: string }) => (
                <Button
                  key={slotId}
                  variant={selectedTime === time ? 'filled' : 'outline'}
                  title={time}
                  onClick={() => handleTimeSelection(time, slotId)}
                  className={'w-full rounded-10px'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RescheduleAppointmentModal;
