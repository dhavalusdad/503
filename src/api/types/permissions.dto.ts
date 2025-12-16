import type { UserRole } from '@/api/types/user.dto';

export type UpdateUserPermissionRequestBodyType = {
  permission?: string;
  user_id: string;
  hasPermission: boolean;
  role?: UserRole;
  role_id?: string;
  permission_id?: string;
};

export type PermissionDataType = {
  id: string;
  name: string;
  label: string;
}[];
