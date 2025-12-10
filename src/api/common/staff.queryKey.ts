import type { StaffListParamsType } from '@/api/types/staff.dto';

export const STAFF_KEYS_NAME = {
  LIST: 'staff-list',
  DETAIL: 'staff-detail',
};

export const staffQueryKey = {
  getStaffById: (id: string | undefined) => [STAFF_KEYS_NAME.DETAIL, id],
  getStaffList: (params?: StaffListParamsType) => [STAFF_KEYS_NAME.LIST, params],
  infiniteStaffList: (params?: StaffListParamsType) => [STAFF_KEYS_NAME.LIST, params],
};
