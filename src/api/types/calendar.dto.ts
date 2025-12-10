import type { DateRangeFilterObjType } from '@/components/layout/Filter/types';
import { AppointmentStatus, type GenderEnum } from '@/enums';
import type { AdminAppointmentListFilterDataType } from '@/features/admin/components/appointmentList/types';

import type { CommonFilterParamsType } from './common.dto';
import type { OptionType } from './field-option.dto';

export interface GetAvailabilitySlotsRequest {
  therapist_id?: string;
  tenant_id?: string;
  page?: number;
  limit?: number;
  date?: string;
  session_type?: string;
  timeZone?: string;
  startDate?: string;
  endDate?: string;
  fromDashboard?: boolean;
}

export interface CreateAvailabilitySlotRequest {
  therapist_id?: string;
  start_time?: string; // ISO 8601 format: "2025-07-21T11:00:00Z"
  end_time?: string; // ISO 8601 format: "2025-07-21T12:00:00Z"
  status?: string; // e.g., "Available"
  startDate?: string;
  endDate?: string;
  timezone?: string;
}

// For creating multiple slots at once
export type CreateAvailabilitySlotsRequest = CreateAvailabilitySlotRequest[];

export interface RemoveAvailabilitySlotsRequest {
  ids: string[];
  therapistId?: string;
}

// Response s
export interface TherapistUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Therapist {
  id: string;
  user_id: string;
  tenant_id: string;
  bio: string | null;
  years_experience: number | null;
  hourly_rate: number | null;
  token: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: TherapistUser;
}

// For GET availability slots response (includes nested therapist data)
export interface AvailabilitySlotWithTherapist {
  id: string;
  tenant_id: string;
  therapist_id: string;
  start_time: string; // ISO format: "2025-08-01T11:00:00.000Z"
  end_time: string; // ISO format: "2025-08-01T12:00:00.000Z"
  status: string; // "Available"
  therapist: Therapist;
}

export interface AvailabilitySlot {
  id: string;
  therapist_id: string;
  start_time: string; // ISO format: "2025-08-07T04:00:00.000Z"
  end_time: string; // ISO format: "2025-08-07T05:00:00.000Z"
  status: string; // "Available"
  tenant_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface GetAvailabilitySlotsResponse {
  success: boolean;
  message: string;
  data: AvailabilitySlotWithTherapist[];
}

export interface CreateAvailabilitySlotsResponse {
  success: boolean;
  message: string; // e.g., "5 therapist availability records created successfully"
  data: AvailabilitySlot[];
}

export interface RemoveAvailabilitySlotsResponse {
  success: boolean;
  message?: string;
}

export interface AppointmentClient {
  id: string;
  user: {
    first_name: string;
    last_name: string;
  };
}

export interface AppointmentSlot {
  id: string;
  start_time: string;
  end_time: string;
}

type TherapyType = {
  name: string;
  id: string;
};
export interface Appointment {
  id: string;
  status: string;
  created_at: string;
  client: AppointmentClient;
  slot: AppointmentSlot;
  therapy_type: TherapyType;
  payment_method: string | null;
  actual_start_time: string;
  actual_end_time: string;
  logged_start_time: string;
  logged_end_time: string;
}

export interface GetAppointmentsRequest {
  page?: number;
  limit?: number;
  therapist_id?: string;
  status?: string[] | string;
  date_from?: string;
  date_to?: string;
  includeCancelled?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
  timeZone?: string;
  timezone?: string;
  sortColumn?: string;
  sortOrder?: string;
  filters?: {
    appointment_date: DateRangeFilterObjType;
    status: OptionType[];
    therapy_type: OptionType[];
    payment_method?: OptionType[];
  };
}

export interface GetAppointmentsResponse {
  success: boolean;
  message: string;
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
  currentPage?: number;
}

// Appointment Details Response Types
export interface AppointmentDetailsClient {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  amd_patient_id?: string;
}

export interface AppointmentDetailsSlot {
  id: string;
  start_time: string;
  end_time: string;
}

export interface AppointmentDetailsTherapist {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  amd_provider_id?: string;
}

export interface AppointmentDetailsTherapyType {
  id: string;
  name: string;
}

export interface AppointmentDetailsAreaOfFocus {
  area_of_focus_id: string;
  area_of_focus: {
    id: string;
    name: string;
  };
}

export interface AppointmentDetailsInsurance {
  id: string;
  verification_status: string;
  insurance: {
    id: string;
    carrier_name: string;
  };
}

export interface AppointmentDetailsResponse {
  id: string;
  session_type: string;
  appointment_reason: string | null;
  status: string;
  client: AppointmentDetailsClient;
  slot: AppointmentDetailsSlot;
  therapist: AppointmentDetailsTherapist;
  therapy_type: AppointmentDetailsTherapyType;
  payment_method: string | null;
  appointment_area_of_focus: AppointmentDetailsAreaOfFocus[];
  actual_start_time: string;
  amd_appointment_id: string;
  amd_patient_id?: string;
  amd_therapist_id?: string;
  amd_appointment_types?: { amd_id: string; name: string }[];
  dependent_users?: { full_name: string; id: string }[];
  clinic_address?: { name: string; id: string };
  insurances?: AppointmentDetailsInsurance[];
  third_party_api_log?: {
    id: string;
    success: boolean;
  }[];
}

export interface CreateBookingAppointmentRequest {
  therapist_id: string;
  session_type: string;
  area_of_focus_ids: string[];
  slot_id: string;
  recurring_appointment_type?: string;
  number_of_appointments: string | number;
  patient_id: string;
}

export interface CreateBookingAppointmentResponse {
  appointment_id: string;
}

export interface UpdateAppointmentRequest {
  slot_id?: string;
  status?: string;
  therapy_type_id?: string;
}

export interface UserDependentResponse {
  id: string;
  user_id: string;

  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  dob: string;
  gender: GenderEnum;

  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender: GenderEnum;
    dob: string;
  };
}

export type AdminAppointmentParamsType = CommonFilterParamsType & {
  filters: AdminAppointmentListFilterDataType;
  columns: string[];
};

export type TherapistAppointmentLoggedDataResponse = {
  start_time: Date | null;
  end_time: Date | null;
  status: AppointmentStatus;
  reason: string;
};

export type UpdateAppointmentLoggedTimePayloadType = {
  start_time: Date;
  end_time: Date;
  mark_as_completed: boolean;
  reason: string;
};

export type EndAppointmentDataType = {
  note:
    | {
        therapist_id: string;
        client_id: string;
        title: string;
        content: string;
      }
    | undefined;
  start_time: Date | null;
  end_time: Date | null;
  reason: string | null;
};
