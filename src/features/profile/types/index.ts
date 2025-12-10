import type { OptionType } from '@/api/types/field-option.dto';

export type TherapistProfileFormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  dob: Date | null;
  gender: OptionType | null;
  marital_status: OptionType | null;
  languages: OptionType[];
  area_of_focus: OptionType[];
  therapy_types: OptionType[];
  video_session: boolean;
  clinic_session: boolean;
  clinic_address: OptionType[] | null;
  address1: string | null;
  address2: string | null;
  state: { label: string; value: string; country_id: string } | null;
  city: OptionType | null;
  country: OptionType | null;
  postal_code: string | null;
  bio: string;
  profile_image: string | null | File;
  npi_number: string | null;
  min_patient_age: string | null;
  max_patient_age: string | null;
};

export type FormDataExperience = {
  designation: string;
  organization: string;
  location: string;
  specialty: string;
  currentlyWorking: boolean;
  start_month: OptionType | null;
  start_year: OptionType | null;
  end_month: OptionType | null;
  end_year: OptionType | null;
};
export type FormDataAwards = {
  awardName: string;
  associatedWith: string;
  issuer: string;
  date: string;
  description: string;
  issueDate: {
    month: string;
    year: string;
  };
};

export interface UserProfileResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
  user_settings?: {
    timezone?: string;
  };
}

export type FormDataEducation = {
  institution: string | null;
  degree: OptionType | null;
  specialization: string | null;
  gpa: string | null;
  start_date: string | null;
  end_date: string | null;
};

export type GetAllTherapistEducationType = {
  id: string;
  institution: string | null;
  degree: string | null;
  start_date: string | null;
  end_date: string | null;
  inRequest: boolean;
};

export type EducationOpenModalStateType = {
  addUpdate: boolean;
  delete: boolean;
  id?: string;
  addDegree: boolean;
};
