import { useMemo, useState } from 'react';

import _ from 'lodash';
import moment from 'moment';
import { useSelector } from 'react-redux';

import { useGetClientManagementQuery } from '@/api/clientManagement';
import { tagQueryKey } from '@/api/common/tag.query';
import { getTagsAsync } from '@/api/tag';
import { UserRole } from '@/api/types/user.dto';
import { useUpdateUserStatus } from '@/api/user';
import type { CommonFilterField } from '@/components/layout/Filter';
import { ACTIVE_STATUS_OPTION, FIELD_TYPE } from '@/constants/CommonConstant';
import { FLAG_OPTIONS } from '@/features/admin/components/clientManagement/constant';
import useGetClientManagementColumns from '@/features/admin/components/clientManagement/hooks/useGetClientManagementColumns';
import { currentUser } from '@/redux/ducks/user';
import useTableWithFilters, {
  type BaseQueryParams,
} from '@/stories/Common/Table/hook/useTableWithFilters';

import type { ClientManagementFilterDataType, ClientManagementResponseType } from '../types';

type ModalType = {
  updateStatus: boolean;
};

export const useClientManagement = () => {
  // ** Redux States **
  const { timezone } = useSelector(currentUser);

  // ** States **
  const [openModal, setOpenModal] = useState<{
    updateStatus: boolean;
    id?: string;
    active?: boolean;
  }>({
    updateStatus: false,
  });

  // ** Services **
  const {
    mutateAsync: updateClientStatus,
    isPending: isUpdateStatusLoading,
    isError: isUpdateStatusApiError,
  } = useUpdateUserStatus({ current_role: 'client' });

  // ** Custom Hooks **
  const { columns } = useGetClientManagementColumns({ updateStatus });

  // ** Modal Helpers **
  const onUpdateStatus = async () => {
    const { id, active } = openModal;
    if (id) {
      await updateClientStatus({
        user_id: id,
        is_active: active || false,
        role_slug: UserRole.CLIENT,
      });
      if (!isUpdateStatusApiError) {
        openCloseModal('updateStatus', false);
      }
    }
  };

  const onCloseModal = (modalName: keyof ModalType) => {
    openCloseModal(modalName, false);
  };

  const openCloseModal = (
    modalName: keyof ModalType,
    actionBool: boolean,
    id?: string,
    active?: boolean
  ) => {
    setOpenModal(prev => ({
      ...prev,
      [modalName]: actionBool,
      id: id ?? undefined,
      active: _.isBoolean(active) ? active : undefined,
    }));
  };

  function updateStatus(user_id: string, status: boolean) {
    openCloseModal('updateStatus', true, user_id, status);
  }

  const { filterManager, tableManager, handleSearchChange } = useTableWithFilters<
    ClientManagementResponseType,
    ClientManagementFilterDataType,
    BaseQueryParams<ClientManagementFilterDataType>
  >({
    apiCall: useGetClientManagementQuery,
  });

  const { filters, handleApplyFilter, isVisible, onClearFilter, setIsVisible } = filterManager;

  const {
    apiData,
    currentPage: pageIndex,
    pageSize,
    setCurrentPage: setPageIndex,
    setPageSize,
    setSearchQuery,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
  } = tableManager;

  // ** Helpers **

  // ** API Data **
  const {
    data: { data: clientManagementData = [], total: total = 0 } = {},
    isFetching: isClientManagementDataLoading,
    isError,
    error,
    isLoading,
  } = apiData;

  // ** Memos **
  const filterFields: CommonFilterField<ClientManagementFilterDataType>[] = useMemo(() => {
    return [
      {
        type: FIELD_TYPE.DATE_RANGE,
        name: 'joined_date',
        label: 'Joined Date',
        maxDate: timezone ? moment.tz(timezone).toDate() : new Date(),
      },
      {
        type: FIELD_TYPE.ASYNC_SELECT,
        name: 'alertTags',
        label: 'Alert Tags',
        isMulti: true,
        queryFn: getTagsAsync,
        queryKey: tagQueryKey.getTagList(),
      },
      {
        type: FIELD_TYPE.SELECT,
        name: 'status',
        label: 'Status',
        options: ACTIVE_STATUS_OPTION,
      },
      {
        type: FIELD_TYPE.SELECT,
        label: 'Flagged Clients',
        name: 'isFlagged',
        options: FLAG_OPTIONS,
      },

      {
        type: FIELD_TYPE.NUMBER_RANGE,
        name: 'appointment_count',
        label: 'Appointment Count',
      },
      {
        type: FIELD_TYPE.NUMBER_RANGE,
        name: 'cancelled_appointment_count',
        label: 'Cancelled Appointment Count',
      },
    ];
  }, [timezone]);

  return {
    columns,
    handleApplyFilter,
    clientManagementData,
    total,
    isClientManagementDataLoading,
    isError,
    error,
    currentPage: pageIndex,
    pageSize,
    setCurrentPage: setPageIndex,
    setPageSize,
    setSearchQuery,
    searchQuery,
    onSortingChange,
    sorting,
    openModal,
    onCloseModal,
    isUpdateStatusLoading,
    setSorting,
    handleSearchChange,
    filters,
    onUpdateStatus,
    onClearFilter,
    filterFields,
    isVisible,
    setIsVisible,
    isLoading,
  };
};
