import type { CommonFilterParamsType } from '@/api/types/common.dto';
import type { StaffManagementFilterType } from '@/pages/Admin/StaffManagement/types';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  roles: Role[];
  user_settings: { is_active: boolean }[];
}

export interface Role {
  name: string;
  slug: string;
  UserRole: {
    user_id: string;
    role_id: string;
    tenant_id: string;
  };
}

export type GetAllStaffType = User;

export interface CreateStaffMemberRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string | undefined;
  role_id: string;
}

export interface UpdateStaffMemberRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  role_id?: string;
}

export type CreateOrUpdateStaffMemberReturnType = User;

export type StaffListParamsType = CommonFilterParamsType & {
  filters: StaffManagementFilterType;
};

export type QueueStaffItem = {
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
  is_active: boolean;
};

export type QueueStaffResponse = {
  items: QueueStaffItem[];
  nextPage?: number;
  total: number;
};
