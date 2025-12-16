import { useMemo } from 'react';

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useGetAppointments } from '@/api/appointment';
import { fieldOptionsQueryKey } from '@/api/common/fieldOptions.queryKey';
import { getPaymentMethodsAsync, getTherapyTypesAsync } from '@/api/field-option';
import type { CommonFilterField } from '@/components/layout/Filter';
import { APPOINTMENT_STATUS_OPTIONS, FIELD_TYPE } from '@/constants/CommonConstant';
import { FieldOptionType } from '@/enums';
import { getAppointmentColumns } from '@/features/appointment/component/TherapistAppointment/AppointmentColumns';
import type { AppointmentQueryResult } from '@/features/appointment/types';
import type { TherapistAppointmentFiltersType } from '@/pages/Appointment/types';
import { currentUser } from '@/redux/ducks/user';
import useTableWithFilters, {
  type BaseQueryParams,
} from '@/stories/Common/Table/hook/useTableWithFilters';

const useTherapistAppointment = () => {
  // ** Params **
  const { therapist_id } = useParams();

  // ** Redux State **
  const user = useSelector(currentUser);

  // ** Custom Hooks **
  const { filterManager, tableManager, handleSearchChange } = useTableWithFilters<
    AppointmentQueryResult,
    TherapistAppointmentFiltersType,
    BaseQueryParams<TherapistAppointmentFiltersType>
  >({
    apiCall: useGetAppointments,
    initialQueryParams: {
      includeCancelled: true,
      therapist_id: therapist_id || user?.therapist_id,
    },
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
  const { data: appointmentsData, isPending: isAppointmentDataLoading, isLoading } = apiData;

  // ** Memos **
  const columns = useMemo(() => {
    return getAppointmentColumns({ isAdminPanel: !!therapist_id, timezone: user?.timezone });
  }, [therapist_id]);

  const filterFields: CommonFilterField<TherapistAppointmentFiltersType> = useMemo(() => {
    return [
      {
        type: FIELD_TYPE.DATE_RANGE,
        name: 'appointment_date',
        label: 'Appointment Date',
      },
      {
        type: FIELD_TYPE.SELECT,
        name: 'status',
        label: 'Appointment Status',
        options: APPOINTMENT_STATUS_OPTIONS,
        isMulti: true,
      },
      {
        type: FIELD_TYPE.ASYNC_SELECT,
        name: 'payment_method',
        label: 'Payment Method',
        isMulti: true,
        queryFn: getPaymentMethodsAsync,
        queryKey: fieldOptionsQueryKey.getFieldOptionsKey('PaymentMethod'),
      },
      {
        type: FIELD_TYPE.ASYNC_SELECT,
        name: 'therapy_type',
        label: 'Therapy Type',
        isMulti: true,
        queryKey: fieldOptionsQueryKey.getFieldOptionsKey(FieldOptionType.THERAPY_TYPE),
        queryFn: getTherapyTypesAsync,
      },
    ];
  }, []);

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
    isAppointmentDataLoading,
    columns: columns || [],
    isVisible,
    setIsVisible,
    onClearFilter,
    handleApplyFilter,
    filters,
    appointmentsData,
    filterFields,
    isLoading,
  };
};

export default useTherapistAppointment;
