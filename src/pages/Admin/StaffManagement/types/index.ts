import React from 'react';

import type { DateRangeFilterObjType } from '@/components/layout/Filter/types';
import type { ActiveStatusEnum } from '@/enums';
import type { OptionType } from '@/features/calendar/types';

export interface StaffListDataType {
  select: React.ReactNode;
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  role: {
    id: string;
    name: string;
  };
  is_active?: boolean;
  action: React.ReactNode;
}

export interface AddStaffMemberFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
}

export type UpdateStaffStatusFunctionParamsType = {
  staff_id: string;
  currentStatus: boolean;
  role: string;
};

export interface ModalType {
  deleteStaff?: boolean;
  discard: boolean;
  staff_id?: string;
  statusConfirm?: boolean;
  newStatus?: boolean;
  role?: string;
}

export type StaffManagementFilterType = {
  joined_date?: DateRangeFilterObjType;
  role?: OptionType[];
  status?: { label: ActiveStatusEnum; value: ActiveStatusEnum };
};
