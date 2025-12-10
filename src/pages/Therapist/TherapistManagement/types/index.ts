import React from 'react';

import type { OptionType } from '@/api/types/field-option.dto';
import type {
  DateRangeFilterObjType,
  NumberRangeFilterObjType,
} from '@/components/layout/Filter/types';
import type { ActiveStatusEnum, GenderEnum } from '@/enums';

export type TherapistListDataType = {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  joined_date: string;
  user_id: string;
  active: boolean;
  client_count: number;
  specialties: string[];
  action: React.ReactNode;
  amd_provider_id: string;
  amd_provider_name: string;
  permissions: { id: string; name: string }[];
};

export type TherapistManagementFilterType = {
  status?: { label: ActiveStatusEnum; value: ActiveStatusEnum };
  joined_date?: DateRangeFilterObjType;
  gender?: { label: GenderEnum; value: GenderEnum };
  specialties?: OptionType[];
  client_count?: NumberRangeFilterObjType;
};
