import { useState } from 'react';

import { useGetAssessmentFormsQuery } from '@/api/assessment-forms';
import useGetAssessmentFormListColumns from '@/features/admin/components/AssessmentForm/hooks/useGetAssessmentFormColumns';
import type {
  AssessmentFormListFilterDataType,
  AssessmentFormData,
  AssessmentFormDataType,
} from '@/features/admin/components/AssessmentForm/type';
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

export const useAssessmentFormList = (
  therapistPanel = false,
  selectedIds = [],
  setSelectedIds = () => {}
) => {
  // ** States **
  const [selectedAppointment, setSelectedAppointment] = useState<AssessmentFormData | null>(null);

  // ** Custom Hooks **
  const { columns } = useGetAssessmentFormListColumns(therapistPanel, selectedIds, setSelectedIds);

  const { filterManager, tableManager, handleSearchChange } = useTableWithFilters<
    AssessmentFormDataType[],
    AssessmentFormListFilterDataType,
    BaseQueryParams<AssessmentFormListFilterDataType>
  >({
    apiCall: useGetAssessmentFormsQuery,
    initialQueryParams: {
      columns: JSON.stringify(['id', 'status']),
      page: 1,
      limit: 10,
    },
  });
  const {
    filters,
    // handleApplyFilter, isVisible, onClearFilter, setIsVisible
  } = filterManager;

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

  // ** API Data **
  const { data: assessmentFormData, isFetching: isAppointmentListLoading, isLoading } = apiData;

  // ** Memos **

  // const filterFields: CommonFilterField<AssessmentFormListFilterDataType>[] = useMemo(
  //   () => [
  //     {
  //       type: FIELD_TYPE.DATE_RANGE,
  //       name: 'appointment_date',
  //       label: 'Appointment Date',
  //     },
  //     //   {
  //     //     type: FIELD_TYPE.ASYNC_SELECT,
  //     //     name: 'therapists',
  //     //     label: 'Therapist Name',
  //     //     queryKey: THERAPIST_KEYS_NAME.OPTIONS,
  //     //     queryFn: getTherapistOptions,
  //     //     isMulti: true,
  //     //     showImage: true,
  //     //   },
  //     //   {
  //     //     type: FIELD_TYPE.SELECT,
  //     //     name: 'status',
  //     //     label: 'Appointment Status',
  //     //     options: APPOINTMENT_STATUS_OPTIONS,
  //     //     isMulti: true,
  //     //   },
  //   ],
  //   []
  // );

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
    assessmentFormData: assessmentFormData?.data?.data || [],
    total: assessmentFormData?.data?.total || 0,
    isAppointmentListLoading,
    // isVisible,
    // setIsVisible,
    selectedAppointment,
    setSelectedAppointment,
    handleSearchChange,
    // filterFields,
    // handleApplyFilter,
    // onClearFilter,
    filters,
    isLoading,
  };
};
