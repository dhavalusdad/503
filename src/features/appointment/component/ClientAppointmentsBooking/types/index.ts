import type { OptionType } from '@/api/types/field-option.dto';
import type { TherapistBasicDetails } from '@/api/types/therapist.dto';
import type { DateRangeFilterObjType } from '@/components/layout/Filter/types';
import type { GenderEnum } from '@/enums';
import type { AppliedFiltersType } from '@/features/appointment/types';
import type { SelectOption } from '@/stories/Common/Select';

import type { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import type { MultiValue } from 'react-select';

export interface NavigationState {
  therapist: TherapistBasicDetails;
  therapistId: string;
  selectedDate: Date;
  selectedTime: string;
  slotId: string;
  timeSlot: string;
  patient: {
    label?: string;
    value?: string;
    image?: string;
    first_name?: string;
    last_name?: string;
  };
  patientId: string;
  appliedFilters?: AppliedFiltersType;
}

export interface FamilyMember {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  age: string;
  phone: string;
  email: string;
}

export interface CoupleMember {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  age: string;
  phone?: never;
  email?: never;
  emergencyContact?: never;
  relationship?: never;
  relationshipType?: never;
}

export interface MinorMember {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  age: string;
  emergencyContact: string;
  relationship: string;
  phone?: never;
  email?: never;
  relationshipType?: never;
}

export interface FormData {
  sessionType: SelectOption | string;
  selectedDate: Date;
  selectedTime: string;
  therapyType: SelectOption | string;
  areaOfFocus: MultiValue<SelectOption> | string[];
  visitReason: string;
  dependents_ids?: string[];
  clinic: { id?: string; name?: string };
  appointmentType: MultiValue<SelectOption>;
}
export interface ClientQuickDetailsProps {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: Date | null;
  acceptTerms?: boolean;
  clinic: { id?: string; name?: string };
  reason_for_visit: string;
  appointment_type: { label: string; value: string }[] | null;
}

export interface RequestSlotProps {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: Date | null;
  gender: GenderEnum | null;
  insurance_provider?: string;
  insurance_id?: string;
  preferred_time?: Date;
}

export interface AppointmentDateTimeProps {
  selectedDate: Date;
  selectedTime: {
    time: string;
    value: {
      id: string;
      status: string;
    };
  } | null;
}
export interface BookSlotProps {
  therapist_id?: string;
  onContinue?: (data: AppointmentDateTimeProps) => void;
  onBack?: () => void;
}
type MemberType = 'family' | 'couple' | 'minor';
export interface AddMemberFormProps {
  memberType: MemberType;
  onSave: (member: FamilyMember | CoupleMember | MinorMember) => void;
  onCancel: () => void;
  genderOptions: SelectOption[];
  memberCount: number;
  currentCount: number;
  setValue: UseFormSetValue<FormData>;
  getFormValue: UseFormGetValues<FormData>;
}

export interface TherapistSearchResultsProps {
  therapistList: TherapistBasicDetails[] | undefined;
  isLoading: boolean;
  searchTerm: string;
  totalCount: number;
  onSearchTermChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTherapistClick: (therapist: TherapistBasicDetails) => void;
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  activeSearch: boolean;
}

export type ActiveTabType = {
  label: string;
  value: string | null;
};
export interface FilterAppointmentData {
  appointment_status: string[] | undefined;
  session_type: string[];
  startDate?: string | null;
  endDate?: string | null;
}

export type ClientListingFilterDataType = {
  therapy_types?: OptionType[];
  session_types?: OptionType;
  status?: OptionType[];
  appointment_date?: DateRangeFilterObjType;
  clinic_address?: OptionType;
};

export type AppointmentBookedResponse = {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_existing_user: string;
    is_password_set: string;
  };
  client: {
    id: string;
  };
  loginUrl: {
    loginUrl: string;
  };
};

export interface SpecialtiesDataType {
  area_of_focus_id: string;
  area_of_focus: {
    name: string;
  };
}
