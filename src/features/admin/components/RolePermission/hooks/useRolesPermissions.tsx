import { useCallback, useEffect, useState } from 'react';

import {
  useCreateRole,
  useDeleteRole,
  useRolesQuery,
  useUpdateRole,
} from '@/api/roles-permissions';
import { useRolePermissionTable } from '@/features/admin/components/RolePermission/hooks/useRolePermissionTable';
import { showToast } from '@/helper';
import { useTableManagement } from '@/stories/Common/Table/hook';

import type {
  PermissionType,
  Role,
  RolePayload,
  RolesQueryResult,
  SelectedDataType,
} from '../type';

export const useRolesPermissions = () => {
  const { mutateAsync: createRole } = useCreateRole();
  const { mutateAsync: updateRole } = useUpdateRole();
  const { mutateAsync: deleteRole, isPending: isDeleting } = useDeleteRole();

  const [searchRole, setSearchRole] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [selectedPermission, setSelectedPermission] = useState<{
    selected: string[];
    notSelected: string[];
  }>({ selected: [], notSelected: [] });
  const [selectedRoleData, setSelectedRoleData] = useState<SelectedDataType | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; deleteRoleId: string | null }>({
    isOpen: false,
    deleteRoleId: null,
  });

  const {
    apiData,
    currentPage: pageIndex,
    pageSize,
    setCurrentPage: setPageIndex,
    setPageSize,
    setSearchQuery,
    searchQuery,
    setSorting,
    sorting,
    onSortingChange,
  } = useTableManagement<RolesQueryResult, object>({
    apiCall: useRolesQuery,
    initialQueryParams: {
      page: 1,
      limit: 10,
      ...(searchRole ? { search: searchRole } : {}),
      sortColumn: null,
      sortOrder: null,
    },
  });

  const isError = apiData.isError;
  const isLoading = apiData.isLoading;
  const error = apiData.error;
  const roles: Role[] = (apiData.data?.roles as unknown as Role[]) || [];
  const permissions: PermissionType[] =
    (apiData.data?.permissions as unknown as PermissionType[]) || [];
  const total = apiData.data?.total || 0;

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setSearchRole(searchQuery);
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const buildPermissionIdMap = useCallback(() => {
    return permissions.reduce(
      (map, p) => {
        const keyname = p.name.split('_').slice(0, -1).join('_');
        if (
          keyname === 'ASSIGN_FORM_TO_PATIENT_PERMISSION' ||
          keyname === 'PASSWORD_CLIENT_PERMISSION' ||
          keyname === 'PASSWORD_THERAPIST_PERMISSION'
        ) {
          map[keyname] = p.id;
        }
        return map;
      },
      {} as Record<string, string>
    );
  }, [permissions]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setPageIndex(1);
  };

  const handleView = (role: Role) => {
    const permissionIdMap = buildPermissionIdMap();
    const specialPermissionStatus = {
      isAssignFormToPatient:
        role.role_permission?.some(
          rp => rp.permission_id === permissionIdMap['ASSIGN_FORM_TO_PATIENT_PERMISSION']
        ) || false,
      isPasswordResetClient:
        role.role_permission?.some(
          rp => rp.permission_id === permissionIdMap['PASSWORD_CLIENT_PERMISSION']
        ) || false,
      isPasswordResetTherapist:
        role.role_permission?.some(
          rp => rp.permission_id === permissionIdMap['PASSWORD_THERAPIST_PERMISSION']
        ) || false,
    };

    setShowModal(true);
    setSelectedRoleData({
      name: role.name,
      id: role.id,
      ...specialPermissionStatus,
      readOnly: true,
    });
    setSelectedPermission({
      selected: role.role_permission?.map(p => p.permission_id) || [],
      notSelected: [],
    });
  };

  const handleDeleteRole = (id: string) => {
    setDeleteModal({ isOpen: true, deleteRoleId: id });
  };

  const confirmAndDeleteRole = async () => {
    try {
      if (deleteModal.deleteRoleId) {
        const res = await deleteRole(deleteModal.deleteRoleId);
        showToast(res.data?.message);
        onCloseDeleteModal();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleAddRole = () => {
    setSelectedRoleData(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleSubmit = async (data: { name: string; permissions: { selected: string[] } }) => {
    const payload: RolePayload = {
      roleName: data.name,
      permissions: selectedRoleData
        ? { ...data.permissions }
        : { selected: data.permissions.selected },
    };

    try {
      if (selectedRoleData) {
        const res = await updateRole({ id: selectedRoleData.id, data: payload });
        showToast(res.data?.message);
      } else {
        const res = await createRole(payload);
        setSelectedPermission({ selected: [], notSelected: [] });
        showToast(res.data?.message);
      }
      setShowModal(false);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        showToast(error.message, 'ERROR');
      } else {
        showToast('An unexpected error occurred', 'ERROR');
      }
    }
  };

  const handleEditRole = (role: Role) => {
    const permissionIdMap = buildPermissionIdMap();
    const specialPermissionStatus = {
      isAssignFormToPatient:
        role.role_permission?.some(
          rp => rp.permission_id === permissionIdMap['ASSIGN_FORM_TO_PATIENT_PERMISSION']
        ) || false,
      isPasswordResetClient:
        role.role_permission?.some(
          rp => rp.permission_id === permissionIdMap['PASSWORD_CLIENT_PERMISSION']
        ) || false,
      isPasswordResetTherapist:
        role.role_permission?.some(
          rp => rp.permission_id === permissionIdMap['PASSWORD_THERAPIST_PERMISSION']
        ) || false,
    };
    setShowModal(true);
    setSelectedRoleData({ name: role.name, id: role.id, ...specialPermissionStatus });
    setSelectedPermission({
      selected: role.role_permission?.map(p => p.permission_id) || [],
      notSelected: [],
    });
  };

  const onCloseDeleteModal = () => {
    setDeleteModal({ ...deleteModal, isOpen: false });
  };

  return {
    useRolePermissionTable,
    onCloseDeleteModal,
    handleEditRole,
    handleSubmit,
    handleModalClose,
    handleAddRole,
    confirmAndDeleteRole,
    handleDeleteRole,
    handleView,
    handleSearch,
    total,
    isLoading,
    isError,
    error,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    setSearchQuery,
    searchQuery,
    setSorting,
    sorting,
    onSortingChange,
    selectedPermission,
    setSelectedPermission,
    showModal,
    setShowModal,
    isDeleting,
    deleteModal,
    selectedRoleData,
    backOfficeRoles: roles,
    permissionList: permissions,
  };
};
