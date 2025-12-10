import { useMemo, useState } from 'react';

import { useGetClientAppointmentBookingList } from '@/api/client-appointment-booking';
import { getTherapyTypesAsync } from '@/api/field-option';
import type { CommonFilterField } from '@/components/layout/Filter';
import {
  APPOINTMENT_STATUS_OPTIONS,
  FIELD_TYPE,
  SESSION_TYPE_OPTIONS,
} from '@/constants/CommonConstant';
import type { ClientAppointmentBookingDataType } from '@/features/admin/components/appointmentList/types';
import useGetAppointmentListColumns from '@/features/appointment/component/ClientAppointmentsBooking/hooks/useClientAppointmentListColumn';
import type { ClientListingFilterDataType } from '@/features/appointment/component/ClientAppointmentsBooking/types';
import useTableWithFilters, {
  type BaseQueryParams,
} from '@/stories/Common/Table/hook/useTableWithFilters';

const useClientAppointmentBooking = () => {
  // ** States **
  const [id, setId] = useState<string>('');

  // ** Custom Hooks **
  const { columns } = useGetAppointmentListColumns();
  const { filterManager, tableManager, handleSearchChange } = useTableWithFilters<
    ClientAppointmentBookingDataType,
    ClientListingFilterDataType,
    BaseQueryParams<ClientListingFilterDataType>
  >({
    apiCall: useGetClientAppointmentBookingList,
    initialQueryParams: {
      columns: JSON.stringify([
        'id',
        'therapist_name',
        'therapy_name',
        'date',
        'status',
        'session_type',
        'chat_session_id',
      ]),
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
  const {
    data: clientAppointmentData,
    isFetching: isClientAppointmentListFetching,
    isLoading,
  } = apiData;

  // ** Memos **
  const filterFields: CommonFilterField<ClientListingFilterDataType> = useMemo(() => {
    return [
      {
        type: FIELD_TYPE.DATE_RANGE,
        name: 'appointment_date',
        label: 'Appointment Date',
      },
      {
        type: FIELD_TYPE.SELECT,
        label: 'Appointment Status',
        name: 'status',
        options: APPOINTMENT_STATUS_OPTIONS,
        isMulti: true,
      },
      {
        type: FIELD_TYPE.ASYNC_SELECT,
        name: 'therapy_types',
        label: 'Therapy Name',
        isMulti: true,
        queryKey: 'therapy-types',
        queryFn: getTherapyTypesAsync,
      },
      {
        type: FIELD_TYPE.SELECT,
        label: 'Session Type',
        name: 'session_types',
        options: SESSION_TYPE_OPTIONS,
      },
    ];
  }, []);

  return {
    columns,
    data: clientAppointmentData?.data || [],
    total: clientAppointmentData?.total || 0,
    id,
    setId,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    searchQuery,
    handleSearchChange,
    onSortingChange,
    sorting,
    setSorting,
    filterFields,
    handleApplyFilter,
    onClearFilter,
    filters,
    setIsVisible,
    isVisible,
    isClientAppointmentListFetching,
    isLoading,
  };
};

export default useClientAppointmentBooking;
