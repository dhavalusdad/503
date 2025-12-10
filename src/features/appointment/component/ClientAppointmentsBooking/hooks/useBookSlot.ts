import { useEffect, useRef, useState } from 'react';

import moment from 'moment';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useGetAvailabilitySlots, useGetAvailabilitySlotsForDashboard } from '@/api/availability';
import {
  useGetTherapistBasicDetailsInfo,
  useGetTherapistBasicDetailsInfoForDashboard,
} from '@/api/therapist';
import type { AvailabilitySlot } from '@/api/types/calendar.dto';
import type { TherapistBasicDetails } from '@/api/types/therapist.dto';
import { UserRole } from '@/api/types/user.dto';
import { mapTimeSlotToAvailableSlot } from '@/features/calendar/components/scheduleAppointmentComponents/AppointmentDetails';
import { currentUser } from '@/redux/ducks/user';

type TimeSlotValue = { id: string; status: string };
type AvailableTimeSlot = { time: string; value: TimeSlotValue };

export interface UseBookSlotReturn {
  timezone: string;
  // Therapist data
  therapist: TherapistBasicDetails | null;
  isTherapistLoading: boolean;
  therapistError: Error | null;

  // Availability data
  availableSlots: AvailabilitySlot[];
  isSlotsLoading: boolean;
  slotsError: Error | null;

  // UI state
  selectedDate: Date | null;
  dateWihTimeZone: string[];

  selectedTime: AvailableTimeSlot | null;

  // Actions
  setSelectedDate: (date: Date | string) => void;
  setSelectedTime: (time: AvailableTimeSlot | null) => void;

  // Computed values
  availableTimesForSelectedDate: AvailableTimeSlot[];
  therapistFullName: string;
}

export const useBookSlot = (therapist_id = ''): UseBookSlotReturn => {
  const isInitialDateSet = useRef(false);
  const { id: therapistId } = useParams<{ id: string }>();
  const { timezone, role, id: loggedInUserId } = useSelector(currentUser);
  const userCurrentTimeZone = loggedInUserId ? timezone : moment.tz.guess();

  // UI state
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    moment.tz(userCurrentTimeZone).add(1, 'day').toDate()
  );
  const [selectedTime, setSelectedTime] = useState<AvailableTimeSlot | null>(null);

  // Fetch therapist basic details
  let therapistData, therapistError, isTherapistLoading;
  if (therapist_id !== '') {
    const { data, isPending, error } = useGetTherapistBasicDetailsInfoForDashboard({
      therapist_id: therapist_id !== '' ? therapist_id : therapistId,
    });
    therapistData = data;
    therapistError = error;
    isTherapistLoading = isPending;
  } else {
    const { data, isPending, error } = useGetTherapistBasicDetailsInfo({
      therapist_id: therapist_id !== '' ? therapist_id : therapistId,
    });
    therapistData = data;
    therapistError = error;
    isTherapistLoading = isPending;
  }
  // Prepare availability slots params
  const availabilityParams = {
    therapist_id: therapistId,
    startDate: selectedDate
      ? moment(selectedDate).format('YYYY-MM-DD')
      : moment.tz(userCurrentTimeZone).format('YYYY-MM-DD'),
    endDate: selectedDate
      ? moment(selectedDate).format('YYYY-MM-DD')
      : moment.tz(userCurrentTimeZone).add(1, 'day').format('YYYY-MM-DD'),
    timeZone: userCurrentTimeZone,
    fromDashboard: therapist_id !== '' ? true : false,
  };

  // Fetch available slots
  let slotsData, isSlotsLoading, slotsError;
  if (therapist_id !== '' && role !== UserRole.THERAPIST) {
    const { data, isPending, error } = useGetAvailabilitySlotsForDashboard({
      ...availabilityParams,
      therapist_id: therapist_id,
    });
    slotsData = data;
    isSlotsLoading = isPending;
    slotsError = error;
  } else {
    const { data, isPending, error } = useGetAvailabilitySlots(availabilityParams);
    slotsData = data;
    isSlotsLoading = isPending;
    slotsError = error;
  }

  // Extract therapist data
  const therapist = therapistData?.data;

  // Extract available slots
  const availableSlots = slotsData?.data || [];
  const availableDates = slotsData?.availableDates || [];
  const dateWihTimeZone = availableDates.map((date: Date) =>
    moment.utc(date).tz(userCurrentTimeZone).format('YYYY-MM-DD')
  );

  // Compute available times for selected date
  const availableTimesForSelectedDate = mapTimeSlotToAvailableSlot(
    availableSlots,
    userCurrentTimeZone,
    24
  );

  // Computed values

  // Handle date change for CustomDatePicker
  const handleDateChange = (date: Date | string) => {
    if (date instanceof Date) {
      setSelectedDate(moment.tz(date, userCurrentTimeZone).toDate());
    } else if (typeof date === 'string') {
      setSelectedDate(moment.tz(date, userCurrentTimeZone).toDate());
    } else {
      setSelectedDate(null);
    }
  };

  useEffect(() => {
    if (isInitialDateSet.current) return;
    if (!dateWihTimeZone || dateWihTimeZone.length === 0) return;

    const firstDate = moment(dateWihTimeZone[0]).tz(userCurrentTimeZone).format('YYYY-MM-DD');

    const selected = moment(selectedDate).tz(userCurrentTimeZone).format('YYYY-MM-DD');

    if (firstDate !== selected) {
      setSelectedDate(dateWihTimeZone[0]);
    }

    isInitialDateSet.current = true;
  }, [dateWihTimeZone]);

  return {
    timezone: userCurrentTimeZone,

    // Therapist data
    therapist,
    isTherapistLoading,
    therapistError,

    // Availability data
    availableSlots,
    isSlotsLoading,
    slotsError,

    // UI state
    selectedDate,
    selectedTime,

    // Actions
    setSelectedDate: handleDateChange,
    setSelectedTime,
    dateWihTimeZone,

    // Computed values
    availableTimesForSelectedDate,
    therapistFullName: therapist ? `${therapist.first_name} ${therapist.last_name}` : '',
  };
};
