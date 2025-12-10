import { useMemo, useState } from 'react';

import moment from 'moment';
import { useSelector } from 'react-redux';

import { ROLES_KEYS_NAME } from '@/api/common/roles.queryKey';
import { getRolesOptions } from '@/api/roles-permissions';
import { useDeleteStaffMember, useGetStaffList, useUpdateStaffMemberStatus } from '@/api/staff';
import { UserRole } from '@/api/types/user.dto';
import { ACTIVE_STATUS_OPTION, FIELD_TYPE } from '@/constants/CommonConstant';
import useGetStaffManagementColumns from '@/pages/Admin/StaffManagement/hooks/useGetStaffManagementColumns';
import type {
  ModalType,
  StaffListDataType,
  StaffManagementFilterType,
} from '@/pages/Admin/StaffManagement/types';
import { currentUser } from '@/redux/ducks/user';
import useTableWithFilters, {
  type BaseQueryParams,
} from '@/stories/Common/Table/hook/useTableWithFilters';

const useStaffManagement = () => {
  // ** States **
  const [openModal, setOpenModal] = useState<ModalType>({
    deleteStaff: false,
    discard: false,
  });
  const { timezone } = useSelector(currentUser);

  // ** Services **
  const {
    mutateAsync: deleteStaffMember,
    isPending: isDeleteStaffMemberApiPending,
    error: deleteStaffMemberError,
  } = useDeleteStaffMember({});

  const { mutateAsync: updateStaffMemberStatus } = useUpdateStaffMemberStatus();

  // ** Custom Hooks **
  const { columns } = useGetStaffManagementColumns({ openCloseModal });

  const { filterManager, tableManager, handleSearchChange } = useTableWithFilters<
    StaffListDataType,
    StaffManagementFilterType,
    BaseQueryParams<StaffManagementFilterType>
  >({
    apiCall: useGetStaffList,
    initialQueryParams: {
      roleSlug: UserRole.BACKOFFICE,
    },
  });

  const { filters, handleApplyFilter, isVisible, onClearFilter, setIsVisible } = filterManager;

  const {
    apiData,
    currentPage: pageIndex,
    pageSize,
    setCurrentPage: setPageIndex,
    setPageSize,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
  } = tableManager;

  // ** API Data **
  const { data: staffData, isPending: isGetStaffListApiPending, isLoading } = apiData;

  // ** Helpers **
  function openCloseModal(
    modalName: keyof ModalType,
    actionBool?: boolean,
    id?: string,
    role?: string,
    status?: boolean
  ) {
    setOpenModal(prev => ({
      ...prev,
      [modalName]: actionBool,
      staff_id: id ?? undefined,
      role: role ?? undefined,
      ...(modalName === 'statusConfirm' && !!actionBool && { newStatus: status }),
    }));
  }

  const onDeleteStaffMember = async () => {
    if (openModal.staff_id) {
      try {
        await deleteStaffMember(openModal.staff_id);
        if (!deleteStaffMemberError) {
          openCloseModal('deleteStaff', false);
        }
      } catch (error) {
        console.error('Failed to delete staff member:', error);
      }
    }
  };

  const onSubmitStatus = async () => {
    if (openModal.staff_id) {
      try {
        await updateStaffMemberStatus({
          staff_id: openModal.staff_id,
          is_active: openModal.newStatus!,
        });
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }
    openCloseModal('statusConfirm', false);
  };

  // ** Memos **
  const filterFields = useMemo(() => {
    return [
      {
        type: FIELD_TYPE.DATE_RANGE,
        name: 'joined_date',
        label: 'Joined Date',
        maxDate: timezone ? moment.tz(timezone).toDate() : new Date(),
      },
      {
        type: FIELD_TYPE.SELECT,
        name: 'status',
        label: 'Status',
        options: ACTIVE_STATUS_OPTION,
      },
      {
        type: FIELD_TYPE.ASYNC_SELECT,
        name: 'role',
        label: 'Role',
        queryKey: ROLES_KEYS_NAME.OPTIONS,
        queryFn: getRolesOptions,
        isMulti: true,
      },
    ];
  }, [timezone]);

  return {
    columns,
    data: staffData?.data || [],
    total: staffData?.total || 0,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    searchQuery,
    handleSearchChange,
    onSortingChange,
    sorting,
    setSorting,
    isVisible,
    isGetStaffListApiPending,
    openModal,
    openCloseModal,
    onDeleteStaffMember,
    isDeleteStaffMemberApiPending,
    onSubmitStatus,
    setIsVisible,
    filterFields,
    handleApplyFilter,
    onClearFilter,
    filters,
    isLoading,
  };
};

export default useStaffManagement;
