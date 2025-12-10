import type { UserDependentResponse } from '@/api/types/calendar.dto';
import type { OptionType } from '@/api/types/field-option.dto';
import type { DateRangeFilterObjType } from '@/components/layout/Filter/types';
import type { AppointmentStatus } from '@/enums';

export type AppointmentDataType = {
  id: string;
  status: AppointmentStatus;
  created_at: string; // ISO date string
  amd_remaining_charge?: string;
  session_type?: string;
  therapist: {
    id: string;
    user_id: string;
    tenant_id: string;
    bio: string | null;
    years_experience: number | null;
    hourly_rate: number | null;
    token: string | null;
    npi_number: string | null;
    min_patient_age: number | null;
    max_patient_age: number | null;
    user: {
      first_name: string;
      last_name: string;
    };
  };
  client: {
    id: string;
    user_id: string;
    tenant_id: string;
    address_line1: string | null;
    address_line2: string | null;
    emergency_contact: string | null;
    preferred_contact_method: 'Email' | 'Phone' | 'SMS' | string;
    insurance_info: Record<string, unknown>;
    allergies: string | null;
    user: {
      first_name: string;
      last_name: string;
    };
  };
  slot: {
    id: string;
    start_time: string;
    end_time: string;
  };
  therapy_type: {
    id: string;
    name: string;
  };
};

export type AppointmentFormData = {
  date: string;
  time: string;
  clientName: string;
  therapistName: string;
  therapyType: string;
  status: string;
};

export type ApiData = {
  data?: {
    data?: AppointmentDataType[];
    total?: number;
  };
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
};

export type ClientAppointmentBooking = {
  id: string;
  session_type: string;
  appointment_date: string;
  status: string;
  therapist_name?: string;
  therapy_name: string;
  chat_session_id: string | null;
};

export type ClientAppointmentBookingDataType = ClientAppointmentBooking[];

export interface FieldOption {
  id: string;
  name: string;
}

export interface AdminAppointmentListFilterDataType {
  status?: OptionType[];
  therapy_type?: OptionType[];
  appointment_date?: DateRangeFilterObjType;
  therapists?: OptionType[];
  session_type: OptionType[];
}

export interface UserAppointment {
  appointment_id: string;
  user: UserDependentResponse;
}
