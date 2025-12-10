import type { FormField, FormStructure } from '@/features/IntakeForm/types';

// AMD Form Request/Response Types
export interface CreateAmdIntakeForm {
  id?: string;
  form_data?: FormStructure;
  user_id?: string;
  template_id?: string;
  form_name?: string;
  amd_appointment_id: string;
  patient_id: string;
  therapist_id: string;
  response_json: FormField[];
}
export interface UpdateAmdIntakeFormRequest extends CreateAmdIntakeForm {
  note_id: string;
}

export interface AssignAmdAppointmentId {
  form_id: string;
  appointment_id?: string | null;
  patient_id: string;
}
export interface UpdateAmdIntakeFormResponse {
  success: boolean;
  message: string;
  formId?: string;
  updatedAt?: string;
}

export interface GetAmdFormRequest {
  formName: string;
}

export interface GetAmdFormResponse {
  id: string;
  form_json: FormStructure;
  templateId: string;
  appointmentId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemListItem {
  id: string;
  code?: string;
  description?: string;
  name?: string;
}
