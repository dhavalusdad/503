import type React from 'react';

import type { TherapistBasicDetails } from '@/api/types/therapist.dto';
import type { SelectOption } from '@/stories/Common/Select';

import type { MultiValue } from 'react-select';

export interface Appointment {
  id: string;
  select: React.ReactNode;
  therapistname: string;
  therapyname: string;
  time: string;
  status: 'Upcoming' | 'Cancelled' | 'Completed' | 'In Progress' | 'No Show' | 'Escalated';
  date: string;
  sessiontype: string;
  action: React.ReactNode;
}

export interface AppointmentTableColumn {
  id: keyof Appointment;
  header: string;
  accessorKey: keyof Appointment;
  cell?: (value: Appointment[keyof Appointment]) => React.ReactNode;
}

export interface AppointmentData {
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

// Type definitions
export interface SessionNote {
  id: string;
  title: string;
  content: string;
  is_draft?: boolean;
  updatedAt: string;
}
export interface AppointmentTable {
  id: string;
  clientName: string;
  appointmentId: string;
  date: string;
  time: string;
  duration: string;
  status: 'Self Pay' | 'Insurance Pay';
  sessionStatus: 'Upcoming' | 'Completed' | 'Cancelled' | 'No Show';
  isSelected?: boolean;
}

export interface StatusColorCode {
  Completed: string;
  Cancelled: string;
  'No Show': string;
  Upcoming: string;
  confirmed: string;
}
export interface TabsInterface {
  key: 'before' | 'during' | 'after';
  label: string;
}

export interface LocalSelectOption {
  value: string;
  label: string;
}

export interface FieldOption {
  id: string;
  name: string;
}

export interface Therapist {
  id: string;
  name: string;
  gender: string;
  state: string;
  languages: string[];
  session_types: string[];
  payment_methods: string[];
  therapy_types: string[];
  area_of_focus?: string[];

  // Add other therapist properties as needed
}

export interface ApiResponse<T> {
  success: boolean;
  data: {
    data: T[];
  };
}

// Local filter state type - matches your current state structure
export interface FilterState {
  search: string;
  sessionType: { value: string; label: string } | null;
  paymentMethod: { value: string; label: string } | null;
  language: { value: string; label: string } | null;
  therapistGender: { value: string; label: string } | null;
  // state: string;
  city: { value: string; label: string } | null;
  state: { value: string; label: string } | null;
  areaOfFocus: { value: string; label: string }[];
  therapyType: { value: string; label: string } | null;
  availability_start_date?: string;
  availability_end_date?: string;
  carrier: { value: string; label: string } | null;
}

export type AppointmentQueryResult = {
  data: {
    id: string;
    status: string;
    created_at: string;
    client: {
      user: {
        first_name: string;
        last_name: string;
      };
    };
    slot: {
      id: string;
      start_time: string;
      end_time: string;
    };
    payment_method: string | null;
    action: React.ReactNode;
  };
  total: number;
};

// Booking Appointment Component Types
export interface AppointmentFiltersProps {
  filter: FilterState;
  isLoading: boolean;
  onSelectChange: (
    field: keyof FilterState,
    selectedOption: SelectOption | MultiValue<SelectOption> | null
  ) => void;
  onSearch: () => void;
  onClearFilters: () => void;
  activeSearch: boolean;
}

export interface AppliedFiltersType {
  sessionType?: { value: string; label: string } | null;
  therapyType?: { value: string; label: string } | null;
  areaOfFocus?: { value: string; label: string }[];
  paymentMethod?: { value: string; label: string } | null;
  carrier?: { value: string; label: string } | null;
  state?: { value: string; label: string } | null;
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
  onRequestSlot?: (therapist: TherapistBasicDetails) => void;
  appliedFilters?: AppliedFiltersType;
}
