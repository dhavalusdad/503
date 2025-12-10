import { useMemo, useState } from 'react';

import { useSelector } from 'react-redux';

import { useGetUserAssessmentForms } from '@/api/assessment-forms';
import type { CommonFilterField } from '@/components/layout/Filter';
import { ASSESSMENT_FORM_STATUS_OPTIONS, FIELD_TYPE } from '@/constants/CommonConstant';
import type {
  AssessmentFormListFilterDataType,
  AssessmentFormDataType,
  AssessmentFormData,
} from '@/features/admin/components/AssessmentForm/type';
import useGetAssessmentFormListColumns from '@/features/client/components/AssessmentForm/hooks/useGetAssessmentFormColumns';
import { currentUser } from '@/redux/ducks/user';
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
  const { id: user_id, tenant_id } = useSelector(currentUser);

  const { filterManager, tableManager, handleSearchChange } = useTableWithFilters<
    AssessmentFormDataType,
    AssessmentFormListFilterDataType,
    BaseQueryParams<AssessmentFormListFilterDataType>
  >({
    apiCall: useGetUserAssessmentForms,
    initialQueryParams: {
      tenant_id,
      columns: JSON.stringify(['id', 'status']),
      user_id,
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

  // ** API Data **
  const { data: assessmentFormData, isFetching: isAppointmentListLoading, isLoading } = apiData;

  // ** Memos **

  const filterFields: CommonFilterField<AssessmentFormListFilterDataType>[] = useMemo(
    () => [
      {
        type: FIELD_TYPE.SELECT,
        label: 'Status',
        name: 'status',
        options: ASSESSMENT_FORM_STATUS_OPTIONS,
        isMulti: true,
      },
    ],
    []
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
    assessmentFormData: assessmentFormData?.data || [],
    total: assessmentFormData?.total || 0,
    isAppointmentListLoading,
    isVisible,
    setIsVisible,
    selectedAppointment,
    setSelectedAppointment,
    handleSearchChange,
    filterFields,
    handleApplyFilter,
    onClearFilter,
    filters,
    isLoading,
  };
};
