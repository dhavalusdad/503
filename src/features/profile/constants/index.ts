import type { TherapistProfileFormData } from '@/features/profile/types';

export enum PANEL_TYPE {
  THERAPIST = 'therapist',
  ADMIN = 'admin',
}

export const THERAPIST_PROFILE_REQUIRED_FIELDS: {
  [key in keyof TherapistProfileFormData]: PANEL_TYPE[];
} = {
  first_name: [PANEL_TYPE.ADMIN, PANEL_TYPE.THERAPIST],
  last_name: [PANEL_TYPE.ADMIN, PANEL_TYPE.THERAPIST],
  email: [PANEL_TYPE.ADMIN, PANEL_TYPE.THERAPIST],
  phone: [PANEL_TYPE.ADMIN, PANEL_TYPE.THERAPIST],
  dob: [],
  gender: [],
  marital_status: [],
  languages: [],
  area_of_focus: [PANEL_TYPE.THERAPIST],
  therapy_types: [PANEL_TYPE.ADMIN, PANEL_TYPE.THERAPIST],
  video_session: [],
  clinic_session: [],
  clinic_address: [],
  address1: [],
  address2: [],
  city: [],
  country: [],
  state: [],
  postal_code: [],
  bio: [PANEL_TYPE.THERAPIST],
  profile_image: [],
  npi_number: [PANEL_TYPE.ADMIN, PANEL_TYPE.THERAPIST],
  min_patient_age: [PANEL_TYPE.THERAPIST],
  max_patient_age: [PANEL_TYPE.THERAPIST],
};
