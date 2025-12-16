import { useMemo, useState } from 'react';

import _ from 'lodash';
import moment from 'moment';
import { useSelector } from 'react-redux';

import { useLookupProviders } from '@/api/advancedMd';
import { fieldOptionsQueryKey } from '@/api/common/fieldOptions.queryKey';
import { getAreaOfFocusAsync } from '@/api/field-option';
import { useGetTherapistList } from '@/api/therapist';
import { UserRole } from '@/api/types/user.dto';
import { useUpdateUserStatus } from '@/api/user';
import { ACTIVE_STATUS_OPTION, FIELD_TYPE, GENDER_OPTION } from '@/constants/CommonConstant';
import { FieldOptionType, PermissionType } from '@/enums';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import useGetTherapistManagementColumns from '@/pages/Therapist/TherapistManagement/hooks/useGetTherapistManagementColumns';
import type {
  TherapistListDataType,
  TherapistManagementFilterType,
} from '@/pages/Therapist/TherapistManagement/types';
import { currentUser } from '@/redux/ducks/user';
import useTableWithFilters, {
  type BaseQueryParams,
} from '@/stories/Common/Table/hook/useTableWithFilters';

type ModalType = {
  updateStatus: boolean;
  syncProvider: boolean;
};

const useTherapistManagement = () => {
  // ** Redux States **
  const { timezone } = useSelector(currentUser);

  // ** States **
  const [openModal, setOpenModal] = useState<{
    updateStatus: boolean;
    syncProvider: boolean;
    id?: string;
    active?: boolean;
  }>({
    updateStatus: false,
    syncProvider: false,
  });

  // ** Services **
  const {
    mutateAsync: updateTherapistStatus,
    isPending: isUpdateStatusLoading,
    isError: isUpdateStatusApiError,
  } = useUpdateUserStatus({ current_role: 'therapist' });

  const {
    mutateAsync: lookupProviders,
    isPending: isLookupProvidersLoading,
    data: providerLookupData,
  } = useLookupProviders();

  // ** Helper Functions **
  const onSyncProvider = (therapistId: string) => {
    // Open modal immediately with therapist ID
    setOpenModal(prev => ({
      ...prev,
      syncProvider: true,
      id: therapistId,
    }));
    // Then call the API
    lookupProviders().catch(error => {
      console.error('Error looking up providers:', error);
    });
  };

  // ** Custom Hooks **
  const { columns } = useGetTherapistManagementColumns({
    updateStatus,
    syncProvider: onSyncProvider,
  });

  const { filterManager, tableManager, handleSearchChange } = useTableWithFilters<
    TherapistListDataType[],
    TherapistManagementFilterType,
    BaseQueryParams<TherapistManagementFilterType>
  >({
    apiCall: useGetTherapistList,
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

  // ** API Data**
  const { data: therapistData, isLoading: isGetTherapistListApiPending } = apiData;

  const { hasPermission } = useRoleBasedRouting();
  // ***************** Helpers *****************

  // ** Modal Helpers **
  const onUpdateStatus = async () => {
    const { id, active } = openModal;
    if (id) {
      await updateTherapistStatus({
        user_id: id,
        is_active: active || false,
        role_slug: UserRole.THERAPIST,
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

  // ** Memos **s
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
        name: 'gender',
        label: 'Gender',
        options: GENDER_OPTION,
      },
      {
        type: FIELD_TYPE.SELECT,
        name: 'status',
        label: 'Status',
        options: ACTIVE_STATUS_OPTION,
      },
      ...(hasPermission(PermissionType.AREA_OF_FOCUS_VIEW)
        ? [
            {
              type: FIELD_TYPE.ASYNC_SELECT,
              name: 'area_of_focus',
              label: 'Focus Area',
              isMulti: true,
              queryKey: fieldOptionsQueryKey.getFieldOptionsKey(FieldOptionType.AREA_OF_FOCUS),
              queryFn: getAreaOfFocusAsync,
            },
          ]
        : []),
      {
        type: FIELD_TYPE.NUMBER_RANGE,
        name: 'client_count',
        label: 'Number of Clients',
      },
    ];
  }, [timezone]);

  return {
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    setSearchQuery,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
    onSearchChange: handleSearchChange,
    onUpdateStatus,
    onCloseModal,
    isUpdateStatusLoading,
    therapistData,
    isGetTherapistListApiPending,
    columns,
    openModal,
    isVisible,
    setIsVisible,
    onClearFilter,
    handleApplyFilter,
    filters,
    filterFields,
    onSyncProvider,
    isLookupProvidersLoading,
    providerLookupData,
    isLoading: isGetTherapistListApiPending,
  };
};

export default useTherapistManagement;
