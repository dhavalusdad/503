import type { DateRangeFilterObjType } from '@/components/layout/Filter/types';
import type { AppointmentStatus } from '@/enums';
import type { OptionType } from '@/features/calendar/types';

export type options = {
  option_text: string;
  option_value: string;
  order_index: number;
};

export type questions = {
  question_text: string;
  options?: options[];
  is_required: boolean;
  question_type: string;
  order_index: number;
};

export type groupQuestion = {
  type: string;
  questions: questions[];
};

export type AssessmentFormDataType = {
  id: string;
  name: string;
  description: string;
  form_type: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  status: string;
  form_category?: string;
};

export type UserAssessmentFormDataType = {
  id: string;
  form_title: string;
  description: string;
  form_type: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  status: string;
  appointment_id?: string | null;
  appointment_date?: Date | null;
  due_date: Date | null;
  assigned_by: string;
  form_id: string;
  submitted_at: null | string;
  appointment: {
    slot: {
      start_time: Date;
      end_time: Date;
    };
    status: AppointmentStatus;
  };
  assignedByUser: {
    first_name: string;
    last_name: string;
  };
};

export type AssessmentFormData = {
  name: string;
  description: string;
  form_type: string;
  questions: questions[];
};

export interface AssessmentFormListFilterDataType {
  status?: OptionType[];
  created_at?: DateRangeFilterObjType;
  sortColumn?: string;
  sortOrder?: string;
  search?: string;
  isTherapistPanel?: boolean;
  excludeAppointmentStatuses: string[];
}

export interface AssignedByUser {
  id: string;
  first_name: string;
  last_name: string;
}

export interface AssessmentFormType {
  id: string;
  form_title: string;
  status: string;
  form_id: string;
  assigned_to: string;
  assigned_by: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  assignedByUser: AssignedByUser;
}

export interface AssessmentFormTypeApiResponse {
  data: AssessmentFormType[];
  total: number;
  currentPage: number;
}
