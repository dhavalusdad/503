import type {
  AreaOfFocus,
  CommonFilterParamsType,
  Language,
  TherapyType,
} from '@/api/types/common.dto';
import type { OptionType } from '@/api/types/field-option.dto';
import type { GenderEnum } from '@/enums';
import type { SpecialtiesDataType } from '@/features/appointment/component/ClientAppointmentsBooking/types';
import type { TherapistManagementFilterType } from '@/pages/Therapist/TherapistManagement/types';

export interface UpdateTherapistBasicDetailsRequest {
  user_id: string;
  gender: string;
  marital_status: string;
  languages: { new: string[]; deleted: string[] };
  area_of_focus: { new: string[]; deleted: string[] };
  session_type: { new: string[]; deleted: string[] };
  // Add other fields from FormData that are relevant
}

export interface Experience {
  start_year: number;
  start_month: number;
  designation: string;
  end_month?: number | null;
  end_year?: number | null;
  id: number;
}

export interface CreateTherapistExperienceRequest {
  designation: string;
  organization: string;
  location: string;
  start_year: number;
  start_month: number;
  end_year?: number;
  end_month?: number;
}

export type UpdateTherapistExperienceRequest = CreateTherapistExperienceRequest;

export interface GetTherapistSearchRequest {
  page?: number;
  limit?: number;
  session_type?: 'Virtual' | 'In-Person';
  payment_method?: 'Insurance' | 'Self-Pay' | 'Both';
  language?: string;
  therapist_gender?: 'Male' | 'Female' | 'Non-Binary';
  state?: string;
  area_of_focus?: string[];
  therapy_type?: string;
}
interface Availability {
  id: string;
  start_time: string; // ISO date string
  end_time: string; // ISO date string
  status: 'Available' | 'Booked' | 'Unavailable';
}

export interface TherapistBasicDetails {
  id: string;
  bio: string;
  languages: Language[];
  specialties?: SpecialtiesDataType[];
  session_types: string[]; // ["Virtual", "Clinic"]
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  dob: string; // ISO date string: "1989-07-05"
  phone: string;
  marital_status: string;
  profile_image: string;
  address1: string;
  address2: string;
  experiences: number;
  email_verified: boolean;
  area_of_focus: AreaOfFocus[];
  clinic_address: { name: string; id: string; address: string }[];
  clinics?: { clinic_address_id?: string }[];
  availability?: Availability[];
  therapy_types: TherapyType[];
  npi_number: string;
  min_patient_age: number;
  max_patient_age: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    gender: GenderEnum;
    id: string;
    profile_image: string;
  };
  state?: string;
  country?: string;
  postal_code?: string;
  city?: { label: string; value: string; state_id: string };
  inRequestFields?: string[];
}

export interface GetTherapistBasicDetailsResponse {
  success: boolean;
  message: string;
  data: TherapistBasicDetails;
}

export interface TherapistExperienceResponse extends Experience {
  organization: string;
  location: string;
}

export interface AllTherapistExperienceResponse {
  organization: string;
  location: string;
  experiences: Experience[];
}

export interface CreateOrUpdateExperienceResponse {
  id: string;
  designation: string;
  organization: string;
  location: string;
  start_year: string;
  start_month: string;
  end_year?: string;
  end_month?: string;
}

export interface TherapistSearchItem {
  id?: string;
  name?: string;
  search?: string;
  therapist_gender?: string;
  session_type?: string;
  languages?: string;
  state?: string;
  payment_method?: string;
  areas_of_focus?: string[];
  therapy_types?: string;
  session_types?: string[];
  payment_methods?: string[];
  therapist_id?: string;
  availability_start_date?: string;
  availability_end_date?: string;
  tenant_id?: string;
}

export interface TherapistSearchResponse {
  data: TherapistBasicDetails[];
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetTherapistListResponseType {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  joined_date: string;
}

export interface InfiniteTherapistPageResponse {
  data: TherapistBasicDetails[];
  total: number;
  hasMore: boolean;
}

export interface InfiniteAppointmentPageResponse {
  data: TherapistBasicDetails[];
  total: number;
  hasMore: boolean;
}

export interface InfiniteTherapistQueryResponse {
  pages: InfiniteTherapistPageResponse[];
  pageParams: number[];
}

export type TherapistOptionsParamsType = Pick<CommonFilterParamsType, 'page' | 'limit' | 'search'>;

export type TherapistOptionsResponseDataType = {
  id: string;
  name: string;
  profile_image: string | null;
};

export type TherapistListParamsType = CommonFilterParamsType & {
  filters: TherapistManagementFilterType;
};

export type TherapistEngagementReturnType = {
  client_appointments: {
    less: number;
    medium: number;
    more: number;
    tooMuch: number;
    longTerm: number;
  };
  total_clients: number;
};

// AMD Provider ID Types
export interface UpdateTherapistAmdProviderRequest {
  amd_provider_id: string;
  amd_provider_name: string;
}

export interface GetTherapistAmdProviderIdResponse {
  success: boolean;
  message: string;
  data: {
    amd_provider_id: string | null;
    amd_provider_name: string | null;
  };
}

export type EducationDataType = {
  id: string;
  institution: string | null;
  degree: OptionType | null;
  specialization: string | null;
  gpa: string | null;
  start_date: string | null;
  end_date: string | null;
  inRequest: boolean;
};

export type CreateTherapistEducation = {
  institution: string | null;
  degree: OptionType | null;
  specialization: string | null;
  gpa: string | null;
  startDate: string | null;
  endDate: string | null;
};
