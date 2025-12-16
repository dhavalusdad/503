import { useMemo, useState } from 'react';

import { useGetAdminAppointments } from '@/api/appointment';
import { THERAPIST_KEYS_NAME } from '@/api/common/therapist.queryKey';
import { useGetFieldOptionsByType } from '@/api/field-option';
import { getTherapistOptions } from '@/api/therapist';
import type { CommonFilterField } from '@/components/layout/Filter';
import {
  APPOINTMENT_STATUS_OPTIONS,
  FIELD_TYPE,
  SESSION_TYPE_OPTIONS,
} from '@/constants/CommonConstant';
import { FieldOptionType, PermissionType } from '@/enums';
import useGetAdminAppointmentListColumns from '@/features/admin/components/appointmentList/hooks/useGetAdminAppointmentListColumns';
import type {
  AdminAppointmentListFilterDataType,
  AppointmentDataType,
  AppointmentFormData,
  FieldOption,
} from '@/features/admin/components/appointmentList/types';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import useTableWithFilters, {
  type BaseQueryParams,
} from '@/stories/Common/Table/hook/useTableWithFilters';

export type AppointmentFilters = {
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  therapy_type?: string | null;
  search?: string;
};

type ModalState = {
  editAppointment: boolean;
  appointment?: AppointmentDataType;
};

export const useAppointmentList = () => {
  // ** States **
  const [modalState, setModalState] = useState<ModalState>({
    editAppointment: false,
  });
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentFormData | null>(null);

  // ** Custom Hooks **
  const { columns } = useGetAdminAppointmentListColumns({ openCloseModal });
  const { hasPermission } = useRoleBasedRouting();

  const { filterManager, tableManager, handleSearchChange } = useTableWithFilters<
    AppointmentDataType[],
    AdminAppointmentListFilterDataType,
    BaseQueryParams<AdminAppointmentListFilterDataType>
  >({
    apiCall: useGetAdminAppointments,
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

  const { data: therapyTypeData } = useGetFieldOptionsByType({
    fieldOptionType: FieldOptionType.THERAPY_TYPE,
    options: {
      enabled: isVisible,
      staleTime: 1000 * 60 * 60,
    },
  });

  // ** API Data **
  const {
    data: { data: appointmentData = [], total = 0 } = {},
    isFetching: isAppointmentListLoading,
    isLoading,
  } = apiData;

  // ***************** Helpers *****************

  // ** Modal Helpers **
  function openCloseModal(
    modalName: 'editAppointment',
    action: boolean,
    appointment?: AppointmentDataType
  ) {
    setModalState(prev => ({
      ...prev,
      [modalName]: action,
      appointment: appointment || undefined,
    }));
  }

  // ** Memos **
  const therapyTypeOptions = useMemo(
    () =>
      therapyTypeData?.map((therapy: FieldOption) => ({
        value: therapy.id,
        label: therapy.name,
      })) ?? [],
    [therapyTypeData]
  );

  const filterFields: CommonFilterField<AdminAppointmentListFilterDataType>[] = useMemo(
    () => [
      {
        type: FIELD_TYPE.DATE_RANGE,
        name: 'appointment_date',
        label: 'Appointment Date',
      },
      ...(hasPermission(PermissionType.THERAPIST_VIEW)
        ? [
            {
              type: FIELD_TYPE.ASYNC_SELECT,
              name: 'therapists',
              label: 'Therapist Name',
              queryKey: THERAPIST_KEYS_NAME.OPTIONS,
              queryFn: getTherapistOptions,
              isMulti: true,
              showImage: false,
            },
          ]
        : []),
      {
        type: FIELD_TYPE.SELECT,
        name: 'status',
        label: 'Appointment Status',
        options: APPOINTMENT_STATUS_OPTIONS,
        isMulti: true,
      },
      {
        type: FIELD_TYPE.SELECT,
        name: 'session_type',
        label: 'Session Type',
        options: SESSION_TYPE_OPTIONS,
        isMulti: true,
      },
      {
        type: FIELD_TYPE.SELECT,
        name: 'therapy_type',
        label: 'Therapy Type',
        options: therapyTypeOptions,
        isMulti: true,
      },
    ],
    [therapyTypeOptions]
  );

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
    columns,
    appointmentData,
    total,
    isAppointmentListLoading,
    isVisible,
    setIsVisible,
    selectedAppointment,
    setSelectedAppointment,
    handleSearchChange,
    filterFields,
    openCloseModal,
    modalState,
    handleApplyFilter,
    onClearFilter,
    filters,
    isLoading,
  };
};
