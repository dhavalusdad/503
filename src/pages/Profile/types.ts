import type { GenderEnum, MaritalStatusEnum } from '@/enums';

export interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  dob: Date | null;
  gender: GenderEnum;
  marital_status: MaritalStatusEnum;
  languages: string[];
  area_of_focus: string[];
  video_session: boolean;
  clinic_session: boolean;
  clinic_address: string | null;
  address: string | null;
  bio: string;
  profile_image: string | null;
}

export interface FormDataExperience {
  designation: string;
  organization: string;
  location: string;

  currentlyWorking: boolean;
  startDate: {
    month: string;
    year: string;
  };
  endDate?: {
    month: string;
    year: string;
  };
}
export interface FormDataAwards {
  awardName: string;
  associatedWith: string;
  issuer: string;
  date: string;
  description: string;
  issueDate: {
    month: string;
    year: string;
  };
}
