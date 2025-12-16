import { useEffect, useState } from 'react';

import { useDeleteRole, useRolesQuery } from '@/api/roles-permissions';
import type { RolesQueryResult } from '@/features/admin/components/RolePermission/type';
import { useTableManagement } from '@/stories/Common/Table/hook';

import { useRolePermissionTable } from './useRolePermissionTable';

type ModalType = {
  view: boolean;
  delete: boolean;
  update: boolean;
  add: boolean;
  id?: string;
};

export const useRolesPermissions = () => {
  const { mutateAsync: deleteRole, isPending: isDeleting } = useDeleteRole();

  const [searchRole, setSearchRole] = useState('');

  const [selectedPermission, setSelectedPermission] = useState<{
    selected: string[];
    notSelected: string[];
  }>({ selected: [], notSelected: [] });

  const [openModal, setOpenModal] = useState<ModalType>({
    view: false,
    delete: false,
    update: false,
    add: false,
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
  const total = apiData.data?.total || 0;

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setSearchRole(searchQuery);
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setPageIndex(1);
  };

  const openCloseModal = (modalName: keyof ModalType, actionBool: boolean, id?: string) => {
    setOpenModal(prev => ({
      ...prev,
      [modalName]: actionBool,
      id: id ?? undefined,
    }));
  };

  const onDeleteRole = async () => {
    try {
      if (openModal.id) {
        await deleteRole(openModal.id);
        onCloseModal('delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const onCloseModal = (modalName: keyof ModalType) => {
    openCloseModal(modalName, false);
  };

  const { columns } = useRolePermissionTable({
    onDelete: (id: string) => openCloseModal('delete', true, id),
    onView: (id: string) => openCloseModal('view', true, id),
    onEdit: (id: string) => openCloseModal('update', true, id),
  });

  return {
    onCloseModal,
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
    isDeleting,
    data: apiData.data?.data,
    columns,
    openModal,
    onDeleteRole,
    openCloseModal,
  };
};
