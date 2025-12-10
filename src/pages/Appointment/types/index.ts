import type { OptionType } from '@/api/types/field-option.dto';
import type { DateRangeFilterObjType } from '@/components/layout/Filter/types';

export type TherapistAppointmentFiltersType = {
  status?: OptionType[];
  payment_method?: OptionType[];
  appointment_date?: DateRangeFilterObjType;
};
