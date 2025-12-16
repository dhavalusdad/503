export interface RolesColumnsProps {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: Role) => void;
}

export interface Role {
  id: string;
  name: string;
  role_permission: { permission_id: string }[];
  permissions?: string[];
}

export interface RolePayload {
  roleName: string;
  permissions: string[];
  roleType?: string;
}

export interface SortData {
  id: string;
  desc: boolean;
}

export interface RootState {
  roles: {
    permissions: Array<{
      label: string;
      permission: string;
    }>;
  };
}

export type RoleFormData = {
  name: string;
  permissions: string[];
};

export type RoleSubmitData = RoleFormData & {
  id?: string | number;
  name: string;
  permissions: {
    selection?: string[];
  };
  isEditing?: boolean;
};

export type RoleType = {
  id: string;
  name: string;
  role: Role;
};

export type PermissionType = {
  name: string;
  label?: string;
  id: string;
};

export type RolesQueryResult = {
  data: Role[];
  total: number;
  currentPage: string | number;
  permissions: PermissionType[];
};

export type UseRolesQueryParams = {
  page: number;
  limit: number;
  roleName: string | null;
  sortColumn: string | null;
  sortOrder: string | null;
};

export type RolesQueryError = {
  message: string;
  statusCode?: number;
};

export type SelectedDataType = {
  name: string;
  id: string;
  readOnly?: boolean;
  isAssignFormToPatient?: boolean;
  isPasswordResetClient?: boolean;
  isPasswordResetTherapist?: boolean;
};
