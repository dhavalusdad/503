import type React from 'react';

import type { OptionType } from '@/api/types/field-option.dto';
import type {
  DateRangeFilterObjType,
  NumberRangeFilterObjType,
} from '@/components/layout/Filter/types';
import type { ActiveStatusEnum, FormStatusType } from '@/enums';
import type { DependentFormValues } from '@/features/client/types';

export interface ClientManagement {
  id: string;
  select: React.ReactNode;
  username: string;
  appointments: string;
  cancelled: number | string;
  date: string;
  tags: string[] | null[];
  amd_patient_id: string;
  action: React.ReactNode;
  created_at: string | number | Date;
}

export interface ClientManagementTableColumn {
  id: keyof ClientManagement;
  header: string;
  accessorKey: keyof ClientManagement;
  cell?: (value: ClientManagement[keyof ClientManagement]) => React.ReactNode;
}

export interface AppointmentHistory {
  id: string;
  select: React.ReactNode;
  appointmentid: string;
  therapistname: string;
  date: string;
  status: 'Completed' | 'Cancelled';
  action: React.ReactNode;
}

export interface AppointmentHistoryTableColumn {
  id: keyof AppointmentHistory;
  header: string;
  accessorKey: keyof AppointmentHistory;
  cell?: (value: AppointmentHistory[keyof AppointmentHistory]) => React.ReactNode;
}

export interface SessionNotes {
  id: string;
  select: React.ReactNode;
  notestitle: string;
  action: React.ReactNode;
}

export interface SessionNotesTableColumn {
  id: keyof SessionNotes;
  header: string;
  accessorKey: keyof SessionNotes;
  cell?: (value: SessionNotes[keyof SessionNotes]) => React.ReactNode;
}

export interface AssessmentForm {
  id: string;
  select: React.ReactNode;
  formname: string;
  created_at: string;
  action: React.ReactNode;
  status: string;
  submitted_at?: Date;
  assignedByUser?: {
    first_name: string;
    last_name: string;
  };
  appointment: {
    slot: {
      start_time: string;
      end_time: string;
    };
  };
}

export interface AssessmentFormsTableColumn {
  id: keyof AssessmentForm;
  header: string;
  accessorKey: keyof AssessmentForm;
  cell?: (value: AssessmentForm[keyof AssessmentForm]) => React.ReactNode;
}

export type ClientManagementDataType = {
  id: string;
  full_name: string;
  appointments_count: string;
  cancelled_count: string;
  created_at: string;
  profile_image?: string;
  tags: string[] | null[];
};

export type ClientManagementResponseType = {
  data: ClientManagementDataType[];
  total: number;
  limit?: number;
  hasMore?: boolean;
};

export type ApiData = {
  data?: {
    data: ClientManagementDataType[];
    total: number;
  };
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
};

export type ClientManagementDetailType = {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  phone: string;
  dob: string;
  profile_image: string;
  tags: string[] | null[];
};

export interface AssignRemoveTagPayload {
  user_id: string;
  tags: {
    selected: string[];
    notSelected: string[];
  };
  isAssign: boolean | string; // flag could be boolean but since API accepts "true"/"false", allow string too
}

export type SetFlagPayload = {
  id: string;
  isFlag: boolean;
};

export type AppointmentHistoryDataType = {
  id: string;
  appointment_date: string;
  status?: 'Scheduled' | 'Completed' | 'Cancelled' | string; // extend as needed
  area_of_focus?: { name: string }[];
  therapist_name?: string;
};

export type ApiDataAppointmentHistory = {
  data?: {
    data: AppointmentHistoryDataType[];
    total: number;
  };
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
};

export type AlertTags = {
  value: string;
  label: string;
  color: string;
};

export type FilterData = {
  startDate?: string | null;
  endDate?: string | null;
  status?: string[];
  area_of_focus?: string[];
  alertTags?: AlertTags[];
};

export type ClientData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  dob: Date | null;
};
export interface AppointmentDataDashboard {
  appointmentId: string;
  clientName: string;
  clientAvatar: string;
  status: string;
  bookedOn: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: string;
  areaOfFocus: string;
  therapyType: string;
  sessionType: string;
  reasonForVisit: string;
}
export type CreateClientData = {
  clientData: ClientData;
  dependentData?: DependentFormValues[];
  appointmentData?: AppointmentDataDashboard;
};

export type AppointmentHistoryFilterDataType = {
  status?: OptionType[];
  area_of_focus?: OptionType[];
  alertTags?: AlertTags[];
  appointment_date?: DateRangeFilterObjType;
};

export type ClientManagementFilterDataType = {
  joined_date?: DateRangeFilterObjType;
  alertTags?: OptionType[];
  isFlagged?: OptionType;
  status?: { label: ActiveStatusEnum; value: ActiveStatusEnum };
  appointment_count?: NumberRangeFilterObjType;
  cancelled_appointment_count?: NumberRangeFilterObjType;
};

export type AssessmentFormFilterDataType = {
  status?: OptionType[];
  user_id?: string;
  therapistId?: string;
  appointment_id?: string;
};

export type AssessmentFormDataType = {
  id: string;
  appointment_date: string;
  status?: FormStatusType; // extend as needed
  assignedDate: Date;
  completedDate: Date;
  assignedBy: string;
};

export type AssignAssessmentFormDataType = {
  formData: {
    id: string;
    name: string;
  }[];
  assigned_to: string;
};

export type UnsignedFormItem = {
  id: string;
  form_id: string;
  form: { name: string };
  appointment: { id: string; amd_appointment_id: string };
  client?: { id: string; amd_patient_id?: string };
  therapist?: { id: string; amd_provider_id?: string };
  ehr_note_id?: string;
  created_at?: string;
};

export type TableQueryParams = {
  page: number;
  limit: number;
  search?: string;
  sortColumn?: string;
  sortOrder?: 'asc' | 'desc';
};
