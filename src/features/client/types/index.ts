import type { OptionType } from '@/api/types/field-option.dto';
import type { GenderEnum, MaritalStatusEnum, RelationEnum } from '@/enums';

import type { Moment } from 'moment';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastVisit: string;
  totalSessions: number;
  therapist: string;
}

export interface ClientTableColumn {
  id: keyof Client;
  header: string;
  accessorKey: keyof Client;
  cell?: (value: Client[keyof Client]) => React.ReactNode;
}
export interface Session {
  id: string;
  sessionId: string;
  sessionDate: string;
  focusArea: string;
  wellness: string;
}

export interface ClientProfileFormData {
  first_name: string;
  last_name: string;
  profile_image: string | File | null;
  dob: Moment | null;
  gender: GenderEnum;
  email: string;
  marital_status: MaritalStatusEnum;
  phone: string;
  address: string;
  city: OptionType | null;
  state: (OptionType & { country_id: string }) | null;
  country: OptionType | null;
  postal_code: string;
  allergies: string;
  emergency_contact: string;
  timezone: string;
}

export interface AdminProfileFormData {
  first_name: string;
  last_name: string;
  profile_image: string | File | null;
  email?: string;
  phone: string;
}

export interface DependentFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob?: Moment;
  gender?: GenderEnum;
  relationship?: RelationEnum;
  id: string;
}

export interface MultipleDependentFormValue {
  dependents: DependentFormValues[];
}

export interface WellnessDetail {
  id: string;
  daily_mood: string;
  daily_gratitude: string;
  created_at: string;
}
