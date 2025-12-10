import type { GenderEnum, MaritalStatusEnum } from '@/enums';
import type { AssessmentFormListFilterDataType } from '@/features/admin/components/AssessmentForm/type';
import type { QueueFilterDataType } from '@/features/admin/components/backofficeQueue/types';
import type {
  AssessmentFormFilterDataType,
  ClientManagementFilterDataType,
} from '@/features/admin/components/clientManagement/types';
import type { ClientListingFilterDataType } from '@/features/appointment/component/ClientAppointmentsBooking/types';
import type { MyClientsFilterDataType } from '@/pages/Client/types';

import type { CommonFilterParamsType } from './common.dto';

export enum UserRole {
  CLIENT = 'CT',
  THERAPIST = 'TP',
  ADMIN = 'AD',
  BACKOFFICE = 'BO',
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.CLIENT]: 'Client',
  [UserRole.THERAPIST]: 'Therapist',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.BACKOFFICE]: 'Back Office',
};

export const TokenValidationType: Record<Partial<UserRole>, string> = {
  [UserRole.CLIENT]: 'client_register_dashboard',
  [UserRole.BACKOFFICE]: 'staff_register',
};

export interface User {
  client_id?: string;
  is_online: boolean;
  timezone: string;
  id: string;
  first_name: string;
  last_name: string;
  therapist_id?: string;
  email: string;
  role: UserRole;
  name: string;
  email_verified?: boolean;
  profile_image: string | null;
  created_at: string;
  client_id?: string;
  updated_at?: string;
  last_login?: string;
  tenant_id?: string;
  accessToken: string;
  roles: [
    {
      name: string;
      slug: string;
      UserRole: {
        user_id: string;
        role_id: string;
        tenant_id: string;
      };
    },
  ];
  agreements?: string[];
  permissions?: string[] | [];
}

export type PatientUser = {
  first_name: string;
  last_name: string;
  profile_image: string | null;
};

export type Patient = {
  id: string;
  user: PatientUser;
};

export type PatientData = {
  data: {
    data: Patient[];
    total: number;
    page: number;
    limit: number;
  };
};

export interface GetPatientListRequest {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetClientListForAdminRequest {
  page?: number;
  limit?: number;
  search?: string;
  sortColumn?: string;
  sortOrder?: string;
}

export interface CreatePatientRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  dob: string | Date | null;
}

export interface CreatePatientResponse {
  client: User;
  data: {
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
    client: {
      id: string;
    };
    message: string;
  };
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  dob: Date;
  gender: GenderEnum;
  email: string;
  marital_status: MaritalStatusEnum;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  user_client: {
    id: string;
    allergies: string;
    emergency_contact: string;
  };
  user_state: {
    id: string;
    country_id: string;
    name: string;
    slug: string;
  };
  user_country: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export interface CountryData {
  id: string;
  label: string;
  value: string;
}

export interface StateData {
  id: string;
  label: string;
  value: string;
  country_id: string;
}

export type ClientManagementParamsType = CommonFilterParamsType & {
  filters: ClientManagementFilterDataType;
};

export type ClientAppointmentBookingParamsType = CommonFilterParamsType & {
  columns: string;
  is_upcoming?: boolean;
  filters?: ClientListingFilterDataType;
};

export type TherapistClientListParamsType = CommonFilterParamsType & {
  filters: MyClientsFilterDataType;
};

export type QueueMangementParamsType = CommonFilterParamsType & {
  filters: QueueFilterDataType;
  userId?: string;
};

export type AssessmentFormParamsType = CommonFilterParamsType & {
  filters: AssessmentFormListFilterDataType;
  appointment_id?: string;
  user_id?: string;
  include_dependent?: boolean;
  tenant_id: string;
};

export type ClientFormsParamsType = CommonFilterParamsType &
  AssessmentFormFilterDataType & {
    filters: AssessmentFormFilterDataType;
  };
