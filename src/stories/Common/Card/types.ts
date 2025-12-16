import type React from 'react';

import type { TherapistBasicDetails } from '@/api/types/therapist.dto';
import type { AppointmentDateTimeProps } from '@/features/appointment/component/ClientAppointmentsBooking/types';
import type { AppliedFiltersType } from '@/features/appointment/types';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  profile_image: string;
}

export interface Specialty {
  area_of_focus_id: string;
  area_of_focus: {
    name: string;
  };
}

export interface Availability {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
}

export interface Therapist {
  specialties: Specialty[];
  id: string;
  bio?: string;
  user?: User;
  specialist?: Specialty[];
  availability?: Availability[];
}

export interface CardProps {
  data: TherapistBasicDetails;
  isDatepicker?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onRequestSlot?: React.MouseEventHandler<HTMLButtonElement>;
  index: number;
  className?: string;
  fromDashboard?: boolean;
  handleSlot?: (data: AppointmentDateTimeProps) => void;
  appliedFilters?: AppliedFiltersType;
}
