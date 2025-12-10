import type { Dispatch } from 'react';

import { type InfiniteData } from '@tanstack/react-query';

import type { AvailabilitySlot, CreateAvailabilitySlotsRequest } from '@/api/types/calendar.dto';
import type { User } from '@/api/types/user.dto';

export interface GetAvailabilityResponse {
  success: boolean;
  message: string;
  data: {
    data: AvailabilitySlot[];
    total: number;
    page: number;
    limit: number;
  };
}

export type OptionType = {
  label: string;
  value: string;
  image?: string;
  first_name?: string;
  last_name?: string;
};

export type SelectOptionAreaOfFocus = {
  value: string;
  label: string;
};

export type TimeSlot = {
  time?: string;
  value?: {
    id: string;
    status: string;
  };
};

export type BookingAppointmentState = {
  areaOfFocus: { label: string; value: string }[];
  selectedDate: Date;
  selectedTime: TimeSlot;
  selectRecurringAppointment: string;
  selectedPatient: string;
  numberOfRecurringSession: string | number;
  therapyType: { label: string; value: string } | null;
  sessionType: { label: string; value: string };
  appointmentType: SelectOption[];
  clinicAddress: { label: string; value: string } | null;
  dependents_ids: { label: string; value: string }[];
};

export interface SlotData {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  therapist: {
    id: string;
    user: Partial<User>;
  };
}
export interface fieldOptionType {
  id: string;
  name: string;
}

// Import the booking appointment types from the API
export interface CreateBookingAppointmentRequest {
  therapist_id: string;
  session_type: string;
  area_of_focus_ids: string[];
  slot_id: string;
  clinic_address_id?: string;
  recurring_appointment_type?: string;
  number_of_appointments: string | number;
  therapy_type_id?: string;
  patient_id: string;
  timezone?: string;
  appointment_type_ids: string[];
  dependents_ids: string[];
}
export interface CreateBookingAppointmentRequestClient {
  therapist_id: string;
  session_type: string;
  area_of_focus_ids: string[];
  slot_id: string;
  // recurring_appointment_type?: string;
  // number_of_appointments: string | number;
  therapy_type_id: string;
  client_id?: string;
  // visit_reason: string;
  // family_members: FamilyMember[];
  // couple_members: CoupleMember[];
  // minor_members: MinorMember[];
}

export type RecurringOption = {
  value: string;
  label: string;
};

export interface RemoveAvailableSlotParams {
  id: string;
}

// Calendar Component Types

export interface Appointment {
  id: string;
  title: string;
  client: string;
  type: 'individual' | 'group';
  startTime: string;
  endTime: string;
  color: string;
  description: string;
  location: string;
}

export interface WorkHours {
  start: number;
  end: number;
}

export interface CustomCalendarProps {
  userId: string;
  appointments: Appointment[];
  availableSlots?: AvailabilitySlot[];
  onAppointmentClick: (appointment: Appointment) => void;
  onSlotSelect: (slots: CreateAvailabilitySlotsRequest) => void;
  onSlotsRemove: (slots: AvailabilitySlot[]) => void;
  initialView: string;
  startFromMonday: boolean;
  timeFormat: '12hr' | '24hr';
  workHours: WorkHours;
  timeInterval: number;
  timeSlotSize: number;
  displayHourOnly: boolean;
  timeZone: string;
}

// Handler function types
export type HandleCreateAvailabilitySlots = (
  slotsData: CreateAvailabilitySlotsRequest[]
) => Promise<void>;
export type HandleRemoveAvailabilitySlots = (slots: AvailabilitySlot[]) => Promise<void>;

// Type definitions
export type ScheduleAppointmentProps = {
  setScheduleAppointment: Dispatch<boolean>;
  scheduleAppointment: boolean;
  timeZone: string;
};

export type TimeSlotValue = {
  id: string;
  status: string;
};

export type SelectOption = {
  value: string;
  label: string;
};

export type CreatePatientFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  dob?: string;
};

export type PatientListConfig = {
  page: number;
  limit: number;
};

export type AvailabilityConfig = {
  page: number;
  limit: number;
};

export type RecurringAppointmentOption = {
  value: string;
  label: string;
};

export interface AppointmentDetailsProps {
  timezone: string;
  bookingAppointment: BookingAppointmentState;
  onBookingAppointmentChange: (updates: Partial<BookingAppointmentState>) => void;
  shouldShowValidationErrors?: boolean;
}

export type AppointmentInfiniteData = InfiniteData<{
  data: {
    id: string;
    status: string;
  }[];
  total: number;
  hasMore: boolean;
}>;
