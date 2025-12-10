import { useMemo } from 'react';

import moment from 'moment';
import { useSelector } from 'react-redux';

import { getTagsAsync } from '@/api/tag';
import { useGetTherapistClientsList } from '@/api/user';
import type { CommonFilterField } from '@/components/layout/Filter';
import { FIELD_TYPE } from '@/constants/CommonConstant';
import { FLAG_OPTIONS } from '@/features/admin/components/clientManagement/constant';
import useGetTherapistClientsColumns from '@/pages/Client/hooks/useGetTherapistClientsColumns';
import type { MyClientsFilterDataType, TherapistClientsListDataType } from '@/pages/Client/types';
import { currentUser } from '@/redux/ducks/user';
import useTableWithFilters, {
  type BaseQueryParams,
} from '@/stories/Common/Table/hook/useTableWithFilters';

const useClientList = () => {
  // ** Redux States **
  const { timezone } = useSelector(currentUser);

  // ** Custom Hooks **
  const { columns } = useGetTherapistClientsColumns();

  const { filterManager, tableManager, handleSearchChange } = useTableWithFilters<
    Omit<TherapistClientsListDataType, 'action'>,
    MyClientsFilterDataType,
    BaseQueryParams<MyClientsFilterDataType>
  >({
    apiCall: useGetTherapistClientsList,
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
  const { data: clientData, isFetching: isTherapistClientListFetching, isLoading } = apiData;

  // ** Memos **
  const filterFields: CommonFilterField<MyClientsFilterDataType>[] = useMemo(() => {
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
        queryKey: 'tags',
      },
      {
        type: FIELD_TYPE.SELECT,
        label: 'Long Term Clients',
        name: 'is_long_term_patient',
        options: FLAG_OPTIONS,
        placeholder: 'Select',
      },
      {
        type: FIELD_TYPE.NUMBER_RANGE,
        name: 'session_completed_count',
        label: 'Session Count',
      },
    ];
  }, [timezone]);

  return {
    columns,
    data: clientData?.data || [],
    total: clientData?.total || 0,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    searchQuery,
    handleSearchChange,
    onSortingChange,
    sorting,
    setSorting,
    isTherapistClientListFetching,
    handleApplyFilter,
    isVisible,
    setIsVisible,
    filters,
    onClearFilter,
    filterFields,
    isLoading,
  };
};

export default useClientList;
